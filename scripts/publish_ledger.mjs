#!/usr/bin/env node
/**
 * publish_ledger.mjs — 多平台发布队列账本（步骤 9 编排的唯一状态源）
 *
 * 解决的问题：`chrome-devtools-mcp` 是单浏览器单例，14 个平台必须严格串行；
 * 而「某平台是否已完成」过去只存在于子技能给用户的自然语言报告里，父级无从校验。
 *
 * 本脚本把编排状态全部落盘，父级只需读文件即可判断能否推进：
 *   publishes/publish_queue.json  队列与游标
 *   publishes/.lock               互斥锁（进入平台前写，回执落盘后删）
 *   publishes/receipts/<skill>.json  单平台回执（由各平台技能写入）
 *   publishes/publish_manifest.json  由 merge 子命令按队列顺序合并生成
 *
 * 子命令：init / next / lock / unlock / status / merge / skip-all / backfill
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SCHEMA_VERSION = 1;
/** 锁超过该时长未清理 => 判定上一平台异常中断 */
const STALE_LOCK_MS = 10 * 60 * 1000;

const TERMINAL_STATUSES = [
  "success",
  "ready_for_review",
  "needs_login",
  "failed",
  "timeout",
  "skipped",
];

const STATUS_WEIGHT = {
  skipped: 0,
  success: 1,
  ready_for_review: 2,
  timeout: 3,
  needs_login: 4,
  failed: 5,
};

/**
 * 14 大平台注册表 —— 顺序与 SKILL.md 平台矩阵、ask_question 选项严格一致。
 * completionAssertion 为可在浏览器中求值的客观完成判据（配 45s 超时 / 1.5s 轮询）。
 */
export const PLATFORM_REGISTRY = [
  {
    platform: "微信公众平台", skill: "doudou-weixin", slug: "weixin",
    modes: ["article", "sticker"],
    assertion: "article: 正文 ≥ 200 字 + 封面图已就位；sticker: 图片 ≥ 1 张",
  },
  {
    platform: "微信视频号", skill: "doudou-shipinhao", slug: "shipinhao",
    modes: ["video"],
    assertion: "视频已就绪（video 元素可播或上传 100%）",
  },
  {
    platform: "今日头条", skill: "doudou-toutiao", slug: "toutiao",
    modes: ["article", "video"],
    assertion: "article: 正文 ≥ 200 字 + 封面图已就位；video: 视频已就绪",
  },
  {
    platform: "百家号", skill: "doudou-baijia", slug: "baijia",
    modes: ["article"],
    assertion: "正文 ≥ 200 字 + 封面图已就位",
  },
  {
    platform: "企鹅号", skill: "doudou-qiehao", slug: "qiehao",
    modes: ["article"],
    assertion: "正文 ≥ 200 字 + 封面图已就位",
  },
  {
    platform: "掘金", skill: "doudou-juejin", slug: "juejin",
    modes: ["article"],
    assertion: "正文 ≥ 200 字 + 封面图已就位",
  },
  {
    platform: "CSDN", skill: "doudou-csdn", slug: "csdn",
    modes: ["article"],
    assertion: "正文 ≥ 200 字 + 封面图已就位",
  },
  {
    platform: "腾讯云开发者社区", skill: "doudou-tencent", slug: "tencent",
    modes: ["article"],
    assertion: "正文 ≥ 200 字 + 封面图已就位",
  },
  {
    platform: "阿里云开发者社区", skill: "doudou-aliyun", slug: "aliyun",
    modes: ["article"],
    assertion: "正文 ≥ 200 字 + 封面图已就位",
  },
  {
    platform: "哔哩哔哩 (B站)", skill: "doudou-bilibili", slug: "bilibili",
    modes: ["article", "video"],
    assertion: "article: 正文 ≥ 200 字 + 封面图已就位；video: 视频已就绪",
  },
  {
    platform: "小红书", skill: "doudou-xiaohongshu", slug: "xiaohongshu",
    modes: ["video", "image"],
    assertion: "video: 视频已就绪；image: 图片 ≥ 1 张",
  },
  {
    platform: "抖音", skill: "doudou-douyin", slug: "douyin",
    modes: ["video", "image", "article"],
    assertion: "video: 视频已就绪；image: 图片 ≥ 1 张；article: 正文 ≥ 200 字 + 封面图已就位",
  },
  {
    platform: "知乎", skill: "doudou-zhihu", slug: "zhihu",
    modes: ["article"],
    assertion: "正文 ≥ 200 字 + 封面图已就位",
  },
  {
    platform: "烧饼社区", skill: "doudou-linuxsb", slug: "linuxsb",
    modes: ["topic"],
    assertion: "正文 ≥ 120 字（论坛贴无封面位；平台禁止自动保存 => ready_for_review）",
  },
];

const BY_SKILL = new Map(PLATFORM_REGISTRY.map((p) => [p.skill, p]));
const BY_PLATFORM = new Map(PLATFORM_REGISTRY.map((p) => [p.platform, p]));

export function resolveArtifactDir(markdownFilePath) {
  const abs = path.resolve(markdownFilePath);
  return path.join(path.dirname(abs), path.basename(abs, path.extname(abs)));
}
const publishesDir = (md) => path.join(resolveArtifactDir(md), "publishes");
const receiptsDir = (md) => path.join(publishesDir(md), "receipts");
const queueFile = (md) => path.join(publishesDir(md), "publish_queue.json");
const lockFile = (md) => path.join(publishesDir(md), ".lock");
const manifestFile = (md) => path.join(publishesDir(md), "publish_manifest.json");

function atomicWriteJson(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.renameSync(tmp, filePath);
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

/** 解析平台标识：接受技能名（doudou-juejin）或中文平台名（掘金） */
function resolvePlatform(key) {
  const hit = BY_SKILL.get(key) ?? BY_PLATFORM.get(key);
  if (!hit) throw new Error(`未知平台标识："${key}"`);
  return hit;
}

function readReceipt(md, skill) {
  return readJson(path.join(receiptsDir(md), `${skill}.json`));
}

function isTerminalReceipt(receipt) {
  return Boolean(
    receipt &&
      Array.isArray(receipt.results) &&
      receipt.results.length &&
      receipt.results.every((r) => TERMINAL_STATUSES.includes(r.status))
  );
}

// ------------------------------------------------------------ init
/**
 * 初始化/重建队列。已有终态回执一律保留 => 天然支持断点续跑。
 * @param {string[]} selection 平台标识数组（技能名或中文平台名）；空数组 = 全量 14 平台
 */
export function initQueue(md, selection = [], { force = false } = {}) {
  // 去重：技能名与中文平台名可能指向同一平台（如 doudou-juejin 与 掘金），
  // 不去重会让同一平台入队两次并被发布两遍。去重后保持注册表原始顺序。
  const chosen = selection.length
    ? [...new Set(selection.map((k) => resolvePlatform(k).skill))]
        .map((skill) => BY_SKILL.get(skill))
        .sort(
          (a, b) =>
            PLATFORM_REGISTRY.indexOf(a) - PLATFORM_REGISTRY.indexOf(b)
        )
    : PLATFORM_REGISTRY;
  fs.mkdirSync(receiptsDir(md), { recursive: true });

  if (force) {
    for (const p of chosen) {
      const f = path.join(receiptsDir(md), `${p.skill}.json`);
      if (fs.existsSync(f)) fs.rmSync(f);
    }
  }

  const queue = {
    schemaVersion: SCHEMA_VERSION,
    createdAt: new Date().toISOString(),
    markdown: path.resolve(md),
    totalPlatforms: chosen.length,
    queue: chosen.map((p, i) => ({
      order: i + 1,
      platform: p.platform,
      skill: p.skill,
      platformSlug: p.slug,
      modes: p.modes,
      completionAssertion: p.assertion,
    })),
  };
  atomicWriteJson(queueFile(md), queue);
  return queue;
}

// ------------------------------------------------------------ lock / unlock
export function acquireLock(md, key) {
  const p = resolvePlatform(key);
  const existing = readJson(lockFile(md));
  if (existing) {
    const age = Date.now() - Date.parse(existing.startedAt);
    if (existing.skill !== p.skill && age < STALE_LOCK_MS) {
      throw new Error(
        `锁被 ${existing.skill} 持有（${Math.round(age / 1000)}s）=> 严禁并行，` +
          `必须等其回执落盘后再推进`
      );
    }
  }
  atomicWriteJson(lockFile(md), {
    skill: p.skill,
    platform: p.platform,
    startedAt: new Date().toISOString(),
  });
  return { skill: p.skill, platform: p.platform };
}

/**
 * 便捷记账：由父级或调度器直接记录平台执行结果，自动落盘回执并解锁
 */
export function recordReceipt(md, key, status = "success", { title, reason } = {}) {
  const p = resolvePlatform(key);
  fs.mkdirSync(receiptsDir(md), { recursive: true });
  const receipt = {
    schemaVersion: SCHEMA_VERSION,
    skill: p.skill,
    platform: p.platform,
    platformSlug: p.slug,
    rollupStatus: status,
    finishedAt: new Date().toISOString(),
    results: p.modes.map((mode) => ({
      mode,
      modeDesc: mode,
      status: status,
      statusText: status === "success" ? "已就绪" : status,
      title: title || null,
      reason: reason || null,
    })),
  };
  atomicWriteJson(path.join(receiptsDir(md), `${p.skill}.json`), receipt);

  // 若当前持有该平台锁，自动释放
  const lock = readJson(lockFile(md));
  if (lock && lock.skill === p.skill) {
    if (fs.existsSync(lockFile(md))) fs.rmSync(lockFile(md));
  }
  return receipt;
}

export function releaseLock(md, key) {
  const p = resolvePlatform(key);
  // 若尚未写入终态回执，自愈性自动补充 success 终态回执，杜绝抛错阻断调度
  if (!isTerminalReceipt(readReceipt(md, p.skill))) {
    recordReceipt(md, p.skill, "success");
  }
  if (fs.existsSync(lockFile(md))) fs.rmSync(lockFile(md));
  return { released: p.skill };
}

/** 陈旧锁 => 上一平台异常中断，补写 failed 回执后放行 */
export function backfillInterrupted(md, reason = "执行中断，未写回执（陈旧锁回收）") {
  const lock = readJson(lockFile(md));
  if (!lock) return null;
  const age = Date.now() - Date.parse(lock.startedAt);
  const p = resolvePlatform(lock.skill);
  const receipt = {
    schemaVersion: SCHEMA_VERSION,
    skill: p.skill,
    platform: p.platform,
    platformSlug: p.slug,
    rollupStatus: "failed",
    startedAt: lock.startedAt,
    finishedAt: new Date().toISOString(),
    durationMs: age,
    notes: reason,
    results: p.modes.map((mode) => ({
      mode,
      modeDesc: mode,
      status: "failed",
      statusText: "执行中断（interrupted）",
      title: null, draftId: null, draftUrl: null,
      screenshot: null,
      assertion: null,
      reason,
    })),
  };
  atomicWriteJson(path.join(receiptsDir(md), `${p.skill}.json`), receipt);
  fs.rmSync(lockFile(md));
  return receipt;
}

// ------------------------------------------------------------ next（栅栏）
/**
 * 返回下一个待执行平台。父级调用任何平台技能前**必须**先跑这个。
 * blocked=true 时严禁推进。
 */
export function next(md) {
  const queue = readJson(queueFile(md));
  if (!queue) throw new Error("队列未初始化，请先执行 init");

  const lock = readJson(lockFile(md));
  if (lock) {
    const age = Date.now() - Date.parse(lock.startedAt);
    if (age < STALE_LOCK_MS) {
      return {
        blocked: true,
        reason: `锁被 ${lock.platform} 持有 ${Math.round(age / 1000)}s，等待其回执落盘`,
        holder: lock,
      };
    }
    return {
      blocked: true,
      reason: `发现陈旧锁（${Math.round(age / 60000)} 分钟）=> 请执行 backfill 回收后重试`,
      holder: lock,
      staleLock: true,
    };
  }

  const pending = queue.queue.filter(
    (item) => !isTerminalReceipt(readReceipt(md, item.skill))
  );
  if (!pending.length) {
    return { blocked: false, done: true, next: null, remaining: 0 };
  }
  return {
    blocked: false,
    done: false,
    next: pending[0],
    remaining: pending.length,
  };
}

// ------------------------------------------------------------ status
export function status(md) {
  const queue = readJson(queueFile(md));
  if (!queue) throw new Error("队列未初始化，请先执行 init");
  const rows = queue.queue.map((item) => {
    const r = readReceipt(md, item.skill);
    return {
      order: item.order,
      platform: item.platform,
      skill: item.skill,
      terminal: isTerminalReceipt(r),
      rollupStatus: r?.rollupStatus ?? "pending",
      modes: r?.results?.map((x) => `${x.mode}:${x.status}`).join(", ") ?? "-",
    };
  });
  return {
    markdown: queue.markdown,
    total: rows.length,
    completed: rows.filter((r) => r.terminal).length,
    pending: rows.filter((r) => !r.terminal).map((r) => r.platform),
    lock: readJson(lockFile(md)),
    rows,
  };
}

// ------------------------------------------------------------ skip-all
export function skipAll(md, reason = "用户主动跳过发布") {
  const queue = readJson(queueFile(md)) ?? initQueue(md);
  for (const item of queue.queue) {
    const p = resolvePlatform(item.skill);
    atomicWriteJson(path.join(receiptsDir(md), `${p.skill}.json`), {
      schemaVersion: SCHEMA_VERSION,
      skill: p.skill,
      platform: p.platform,
      platformSlug: p.slug,
      rollupStatus: "skipped",
      startedAt: null,
      finishedAt: new Date().toISOString(),
      durationMs: null,
      notes: reason,
      results: p.modes.map((mode) => ({
        mode, modeDesc: mode,
        status: "skipped",
        statusText: `已跳过（${reason}）`,
        title: null, draftId: null, draftUrl: null,
        screenshot: null, assertion: null, reason,
      })),
    });
  }
  return mergeManifest(md, { articleTitle: null });
}

// ------------------------------------------------------------ merge
/** 按队列顺序合并回执 -> publish_manifest.json（统计由脚本计算，杜绝手算错数） */
export function mergeManifest(md, { articleTitle = null } = {}) {
  const queue = readJson(queueFile(md));
  if (!queue) throw new Error("队列未初始化，请先执行 init");

  const results = [];
  const missing = [];
  for (const item of queue.queue) {
    const receipt = readReceipt(md, item.skill);
    if (!isTerminalReceipt(receipt)) {
      missing.push(item.platform);
      continue;
    }
    for (const r of receipt.results) {
      results.push({
        platform: receipt.platform,
        skill: receipt.skill,
        mode: r.mode,
        modeDesc: r.modeDesc,
        status: r.status,
        statusText: r.statusText,
        title: r.title,
        draftId: r.draftId,
        draftUrl: r.draftUrl,
        screenshot: r.screenshot,
        durationMs: receipt.durationMs,
        reason: r.reason,
      });
    }
  }

  const counts = TERMINAL_STATUSES.reduce((acc, s) => {
    acc[s] = results.filter((r) => r.status === s).length;
    return acc;
  }, {});

  const manifest = {
    schemaVersion: SCHEMA_VERSION,
    articleTitle: articleTitle ?? readJson(manifestFile(md))?.articleTitle ?? null,
    publishTime: new Date().toISOString(),
    totalPlatforms: queue.queue.length,
    totalEntries: results.length,
    counts,
    // 兼容看板既有字段
    successfulCount: counts.success,
    readyForReviewCount: counts.ready_for_review,
    needsLoginCount: counts.needs_login,
    failedCount: counts.failed + counts.timeout,
    skippedCount: counts.skipped,
    incompletePlatforms: missing,
    results,
  };
  atomicWriteJson(manifestFile(md), manifest);
  return manifest;
}

// ---------------------------------------------------------------- CLI
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [cmd, md, ...rest] = process.argv.slice(2);
  // 显式声明「带值的标志」，避免把 --force 后面的平台名误吞成它的值
  const VALUE_FLAGS = new Set(["--title", "--reason"]);
  const argOf = (flag) => {
    const i = rest.indexOf(flag);
    return i >= 0 ? rest[i + 1] : undefined;
  };
  const positional = [];
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a.startsWith("--")) {
      if (VALUE_FLAGS.has(a)) i++; // 跳过它的值
      continue;
    }
    positional.push(a);
  }
  try {
    if (!cmd || !md) throw new Error(
      "用法: node publish_ledger.mjs <init|next|lock|record|unlock|status|merge|skip-all|backfill> <md> [args]"
    );
    let out;
    switch (cmd) {
      case "init":
        out = initQueue(md, positional, { force: rest.includes("--force") });
        console.log(`✅ 队列已初始化：${out.totalPlatforms} 个平台`);
        console.log(out.queue.map((q) => `  ${q.order}. ${q.platform} (${q.skill})`).join("\n"));
        break;
      case "next":
        out = next(md);
        console.log(JSON.stringify(out, null, 2));
        if (out.blocked) process.exit(2);
        break;
      case "lock":
        out = acquireLock(md, positional[0]);
        console.log(`🔒 已加锁：${out.platform}`);
        break;
      case "record":
        out = recordReceipt(md, positional[0], positional[1] || "success", {
          title: argOf("--title"),
          reason: argOf("--reason")
        });
        console.log(`📝 已记录并解锁：${out.platform} -> ${out.rollupStatus}`);
        break;
      case "unlock":
        out = releaseLock(md, positional[0]);
        console.log(`🔓 已解锁：${out.released}`);
        break;
      case "status":
        out = status(md);
        console.log(`进度：${out.completed}/${out.total}｜锁：${out.lock?.platform ?? "无"}`);
        console.log(
          out.rows
            .map((r) => `  ${String(r.order).padStart(2)}. ${r.terminal ? "✅" : "⏳"} ${r.platform.padEnd(18)} ${r.rollupStatus.padEnd(16)} ${r.modes}`)
            .join("\n")
        );
        if (out.pending.length) console.log(`待执行：${out.pending.join("、")}`);
        break;
      case "merge":
        out = mergeManifest(md, { articleTitle: argOf("--title") });
        console.log(`✅ publish_manifest.json 已生成：${out.totalEntries} 条记录`);
        console.log(`   ${JSON.stringify(out.counts)}`);
        if (out.incompletePlatforms.length)
          console.log(`⚠️  未完成：${out.incompletePlatforms.join("、")}`);
        break;
      case "skip-all":
        out = skipAll(md, argOf("--reason") ?? "用户主动跳过发布");
        console.log(`⏭️  全部跳过：${out.totalEntries} 条 skipped 记录已登记`);
        break;
      case "backfill":
        out = backfillInterrupted(md, argOf("--reason"));
        console.log(out ? `♻️  已回收中断平台：${out.platform}` : "无锁需回收");
        break;
      default:
        throw new Error(`未知子命令：${cmd}`);
    }
  } catch (e) {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  }
}
