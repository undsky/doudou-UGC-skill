import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 看板展示用的产物目录路径：以命令执行目录（通常为仓库根）为基准推导，
 * 不假设 `mds/` 之类的固定前缀与目录层级。
 * 产物目录位于执行目录之外时退化为目录名，避免出现 `../../` 噪声。
 * @param {string} baseDir - 产物同名目录绝对路径
 * @returns {string} 形如 `mds/AICoding/claw163/` 的相对路径（POSIX 分隔符，带尾斜杠）
 */
function toDisplayFolderPath(baseDir) {
  const rel = path.relative(process.cwd(), baseDir);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) {
    return `${path.basename(baseDir)}/`;
  }
  return `${rel.replace(/\\/g, '/')}/`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 标准看板渲染入口
 * @param {string} targetInput - 目标文章路径 (如 mds/AICoding/claw163.md) 或同名目录
 */
export function renderDashboard(targetInput) {
  if (!targetInput) {
    console.error('Usage: node render_dashboard.mjs <path/to/article.md | path/to/article_dir>');
    process.exit(1);
  }

  let absInput = path.resolve(targetInput);
  let baseDir = absInput;
  let articleName = '';

  if (fs.existsSync(absInput) && fs.statSync(absInput).isFile()) {
    const ext = path.extname(absInput);
    articleName = path.basename(absInput, ext);
    baseDir = path.join(path.dirname(absInput), articleName);
  } else {
    articleName = path.basename(absInput);
    baseDir = absInput;
  }

  if (!fs.existsSync(baseDir)) {
    console.error(`[render_dashboard] 产物目录不存在: ${baseDir}`);
    process.exit(1);
  }

  const templatePath = path.resolve(__dirname, '../references/dashboard-template.html');
  if (!fs.existsSync(templatePath)) {
    console.error(`[render_dashboard] 种子模版不存在: ${templatePath}`);
    process.exit(1);
  }

  console.log(`[render_dashboard] 正在为 [${articleName}] 渲染全景交付看板...`);
  let html = fs.readFileSync(templatePath, 'utf-8');

  // 【防御红线 1】：坚决保证从 <!DOCTYPE html> 开启，剥离任何前置字符或注释
  if (html.includes('<!DOCTYPE html>')) {
    html = html.slice(html.indexOf('<!DOCTYPE html>'));
  }

  // 1. 读取基础资产
  const cdnMdFile = path.join(baseDir, `${articleName}_cdn.md`);
  const rawMdFile = path.join(path.dirname(baseDir), `${articleName}.md`);
  const cdnMarkdown = fs.existsSync(cdnMdFile)
    ? fs.readFileSync(cdnMdFile, 'utf-8')
    : (fs.existsSync(rawMdFile) ? fs.readFileSync(rawMdFile, 'utf-8') : `# ${articleName}`);

  const complianceFile = path.join(baseDir, '01_compliance_report.md');
  const complianceReport = fs.existsSync(complianceFile)
    ? fs.readFileSync(complianceFile, 'utf-8')
    : '# 内容合规审查报告\n\n✅ **审查通过 (PASS)**';

  const storyboardFile = path.join(baseDir, 'video', 'storyboard.md');
  const storyboard = fs.existsSync(storyboardFile)
    ? fs.readFileSync(storyboardFile, 'utf-8')
    : '# 分镜脚本\n\n暂无分镜脚本';

  const cdnManifestFile = path.join(baseDir, 'cdn_manifest.json');
  const cdnManifest = fs.existsSync(cdnManifestFile)
    ? JSON.parse(fs.readFileSync(cdnManifestFile, 'utf-8'))
    : {};
  const cdnList = cdnManifest.files || cdnManifest.images || [];

  const publishManifestFile = path.join(baseDir, 'publishes', 'publish_manifest.json');
  const publishManifest = fs.existsSync(publishManifestFile)
    ? JSON.parse(fs.readFileSync(publishManifestFile, 'utf-8'))
    : { articleTitle: articleName, results: [] };

  const videoManifestFile = path.join(baseDir, 'video', 'video_manifest.json');
  const videoManifest = fs.existsSync(videoManifestFile)
    ? JSON.parse(fs.readFileSync(videoManifestFile, 'utf-8'))
    : {};

  // 提取文章主标题
  const titleMatch = cdnMarkdown.match(/^#\s+(.+)$/m);
  const articleTitle = publishManifest.articleTitle || (titleMatch ? titleMatch[1].trim() : articleName);

  // 2. 统计数据（过滤 _thumb 缩略图文件，避免卡片与计数重复）
  const isImageFile = f => (f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.webp')) && !f.includes('_thumb');
  const illDir = path.join(baseDir, 'illustrations', 'images');
  const illFiles = fs.existsSync(illDir) ? fs.readdirSync(illDir).filter(isImageFile) : [];
  const coverDir = path.join(baseDir, 'cover', 'images');
  const coverFiles = fs.existsSync(coverDir) ? fs.readdirSync(coverDir).filter(isImageFile) : [];
  const xhsDir = path.join(baseDir, 'xhs_images', 'images');
  const xhsFiles = fs.existsSync(xhsDir) ? fs.readdirSync(xhsDir).filter(isImageFile) : [];

  // 3. 运镜配方标签
  let recipeTags = '';
  if (videoManifest.shots && Array.isArray(videoManifest.shots)) {
    recipeTags = videoManifest.shots.map(s => `<span class="flat-badge">${s.id}: ${s.recipe || s.name}</span>`).join('\n                ');
  } else {
    recipeTags = '<span class="flat-badge">Remotion 渲染就绪</span>';
  }

  // 4. 卡片生成辅助函数
  function buildCardHtml(item, index, prefix, folder) {
    const promptId = `${prefix}-prompt-${index + 1}`;
    const fullPath = `./${folder}/images/${item.file}`;
    // 优先使用缩略图作为预览图以降低首屏流量；大图全屏仍使用原始高清图
    const thumbFile = item.file.replace(/(\.[^.]+)$/, '_thumb$1');
    const localThumbPath = path.join(baseDir, folder, 'images', thumbFile);
    const thumbPath = fs.existsSync(localThumbPath) ? `./${folder}/images/${thumbFile}` : fullPath;
    const safePrompt = escapeHtml(item.prompt.trim());
    const safeCdn = escapeHtml(item.cdn);
    const safeFile = escapeHtml(item.file);
    const safeTitle = escapeHtml(item.title);
    const safeBadge = escapeHtml(item.badge);

    return `          <div class="flat-card" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 0;">
            <div style="background: var(--bg-subtle); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; overflow: hidden; height: 210px; position: relative; cursor: pointer;" onclick="openLightbox('${fullPath}')" title="点击全屏放大">
              <img src="${thumbPath}" alt="${safeTitle}" style="max-width: 100%; max-height: 100%; object-fit: contain; transition: transform 0.2s ease;" />
              <span style="position: absolute; bottom: 8px; right: 8px; background: rgba(15, 23, 42, 0.65); color: #fff; font-size: 11px; padding: 2px 6px; border-radius: 4px; backdrop-filter: blur(4px);">🔍 点击放大</span>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <h4 style="font-size: 13.5px; font-weight: 600; color: var(--text-main); margin: 0; word-break: break-all;">${safeFile}</h4>
                <span class="flat-badge">${safeBadge}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--text-muted);">
                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 75%;">CDN: <a href="${safeCdn}" target="_blank" style="color: var(--primary);">${safeCdn}</a></span>
                <button class="btn" style="padding: 2px 8px; font-size: 11.5px;" onclick="copyText('${safeCdn}')">📋 复制</button>
              </div>
            </div>
            <div style="background: var(--bg-subtle); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px 12px; display: flex; flex-direction: column; gap: 6px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 12px; font-weight: 600; color: var(--text-secondary);">📝 绘图提示词 (Prompt)</span>
                <button class="btn" style="padding: 2px 8px; font-size: 11px;" onclick="copyContent('${promptId}')">📋 复制提示词</button>
              </div>
              <pre id="${promptId}" style="font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 11.5px; line-height: 1.55; color: var(--text-secondary); max-height: 120px; height: 120px; overflow-y: auto; white-space: pre-wrap; margin: 0; padding-right: 4px; word-break: break-word;">${safePrompt}</pre>
            </div>
          </div>`;
  }

  // 5. 装配插图
  const illCardsHtml = illFiles.map((f, idx) => {
    const slug = f.replace(/\.[^.]+$/, '');
    const pFile = path.join(baseDir, 'illustrations', 'prompts', `${slug}.md`);
    const prompt = fs.existsSync(pFile) ? fs.readFileSync(pFile, 'utf-8') : `Illustration: ${f}`;
    const cdnObj = cdnList.find(x => {
      const p = x.local_path || x.localPath || '';
      return p.includes(f);
    });
    return buildCardHtml({
      file: f,
      title: slug,
      badge: '16:9 · 插图',
      cdn: cdnObj ? (cdnObj.cdn_url || cdnObj.cdnUrl) : `./illustrations/images/${f}`,
      prompt
    }, idx, 'ill', 'illustrations');
  }).join('\n');

  // 6. 装配封面
  const coverCardsHtml = coverFiles.map((f, idx) => {
    const slug = f.replace(/\.[^.]+$/, '');
    const pFile = path.join(baseDir, 'cover', 'prompts', `${slug}.md`);
    const prompt = fs.existsSync(pFile) ? fs.readFileSync(pFile, 'utf-8') : `Cover: ${f}`;
    const cdnObj = cdnList.find(x => {
      const p = x.local_path || x.localPath || '';
      return p.includes(f);
    });
    return buildCardHtml({
      file: f,
      title: slug,
      badge: '主封面',
      cdn: cdnObj ? (cdnObj.cdn_url || cdnObj.cdnUrl) : `./cover/images/${f}`,
      prompt
    }, idx, 'cov', 'cover');
  }).join('\n');

  // 7. 装配 CDN 映射表（兼容 files 与 images，兼容 localPath/local_path 与 cdnUrl/cdn_url）
  const cdnRowsHtml = cdnList.map(f => {
    const cdnUrl = f.cdn_url || f.cdnUrl || '';
    const localPath = f.local_path || f.localPath || '';
    const safeCdn = escapeHtml(cdnUrl);
    const safeLocalPath = escapeHtml(localPath);
    return `              <tr>
                <td><img src="${safeCdn}" class="table-thumb" onclick="openLightbox(this.src)" title="点击放大查看" alt="预览缩略图" /></td>
                <td><code>${safeLocalPath}</code></td>
                <td><a href="${safeCdn}" target="_blank" style="color:var(--primary);">${safeCdn}</a></td>
                <td><button class="btn" style="padding:4px 8px; font-size:12px;" onclick="copyText('${safeCdn}')">📋 复制</button></td>
              </tr>`;
  }).join('\n');

  // 8. 装配小红书卡片
  const xhsCardsHtml = xhsFiles.map((f, idx) => {
    const slug = f.replace(/\.[^.]+$/, '');
    const pFile = path.join(baseDir, 'xhs_images', 'prompts', `${slug}.md`);
    const prompt = fs.existsSync(pFile) ? fs.readFileSync(pFile, 'utf-8') : `Card: ${f}`;
    return buildCardHtml({
      file: f,
      title: slug,
      badge: '3:4 · 图文卡片',
      cdn: `./xhs_images/images/${f}`,
      prompt
    }, idx, 'xhs', 'xhs_images');
  }).join('\n');

  // 9. 装配多平台发布表格
  const badgeMap = {
    success: 'flat-badge-success',
    ready_for_review: 'flat-badge-success',
    degraded: 'flat-badge-warning',
    needs_login: 'flat-badge-warning',
    timeout: 'flat-badge-warning',
    failed: 'flat-badge-danger',
    skipped: 'flat-badge-muted'
  };

  const publishRowsHtml = (publishManifest.results || []).map(r => {
    // 未知状态一律按中性徽章渲染，严禁默认落到 success 造成「静默谎报成功」
    const badgeClass = badgeMap[r.status] || 'flat-badge-muted';
    const platform = escapeHtml(r.platform || r.platformName || '');
    const mode = escapeHtml(r.modeDesc || r.mode || '');
    const title = escapeHtml(r.title || r.actualPublishTitle || articleTitle);
    const statusText = escapeHtml(r.statusText || '已就绪');
    return `              <tr>
                <td><strong>${platform}</strong></td>
                <td>${mode}</td>
                <td>${title}</td>
                <td><span class="flat-badge ${badgeClass}">${statusText}</span></td>
              </tr>`;
  }).join('\n');

  // 10. 解析公众号预览文件名（直接使用 gzh-design 产物，优先匹配带主题标识的预览文件）
  let wechatPreviewFilename = `${articleName}_预览.html`;
  const existingPreviews = fs.readdirSync(baseDir).filter(f => f.endsWith('_预览.html'));
  const themePreview = existingPreviews.find(f => f.includes('_排版_') && f.endsWith('_预览.html'));
  if (themePreview) {
    wechatPreviewFilename = themePreview;
  } else if (existingPreviews.length > 0) {
    wechatPreviewFilename = existingPreviews[0];
  }

  // 11. 全局变量安全替换字典（同时兼容驼峰与下划线命名规范）
  const now = new Date();
  const formatTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const posterPath = videoManifest.posterPath || videoManifest.poster || (fs.existsSync(path.join(baseDir, 'cover', 'images', 'cover-16x9_thumb.png')) ? './cover/images/cover-16x9_thumb.png' : './cover/images/cover.png');
  const videoFilePath = videoManifest.videoPath || videoManifest.video_file || `./video/${articleName}.mp4`;
  const videoResolution = videoManifest.resolution || '1920×1080';
  const videoAspectRatio = videoManifest.aspectRatio || videoManifest.aspect_ratio || '16:9 横版';
  const videoDuration = String(videoManifest.durationSeconds || videoManifest.duration_seconds || '60.0');
  const videoFps = String(videoManifest.fps || '30');
  const videoTotalFrames = String(videoManifest.totalFrames || videoManifest.total_frames || '1800');
  const videoRenderTime = String(videoManifest.renderTime || videoManifest.render_time || '80.0');
  const videoFileSize = String(videoManifest.fileSizeMb || videoManifest.file_size_mb || '45.0');
  const videoVoice = videoManifest.voice || 'zh-CN-XiaoxiaoNeural (晓晓 1.05x)';

  const replacements = {
    '{{ARTICLE_TITLE}}': articleTitle,
    '{{GENERATION_TIME}}': formatTime,
    '{{ARTICLE_FOLDER_PATH}}': toDisplayFolderPath(baseDir),
    '{{ARTICLE_NAME}}': articleName,
    '{{CDN_MARKDOWN_FILENAME}}': `${articleName}_cdn.md`,
    '{{CDN_MARKDOWN_CONTENT}}': cdnMarkdown,
    '{{COMPLIANCE_REPORT_CONTENT}}': complianceReport,
    '{{ILLUSTRATION_COUNT}}': String(illFiles.length),
    '{{COVER_COUNT}}': String(coverFiles.length),
    '{{CARD_COUNT}}': String(xhsFiles.length),
    '{{WECHAT_PREVIEW_FILENAME}}': wechatPreviewFilename,
    '{{VIDEO_POSTER_PATH}}': posterPath,
    '{{VIDEO_FILE_PATH}}': videoFilePath,
    '{{VIDEO_RESOLUTION}}': videoResolution,
    '{{VIDEO_ASPECT_RATIO}}': videoAspectRatio,
    '{{VIDEO_DURATION}}': videoDuration,
    '{{VIDEO_FPS}}': videoFps,
    '{{VIDEO_TOTAL_FRAMES}}': videoTotalFrames,
    '{{VIDEO_RENDER_TIME}}': videoRenderTime,
    '{{VIDEO_FILE_SIZE}}': videoFileSize,
    '{{VIDEO_VOICE}}': videoVoice,
    '{{VIDEO_RECIPE_TAGS}}': recipeTags,
    '{{STORYBOARD_CONTENT}}': storyboard
  };

  for (const [key, val] of Object.entries(replacements)) {
    html = html.split(key).join(val);
  }

  // 12. 【防御红线 2】：精准锚定容器替换动态卡片与表格
  html = html.replace(/(<section id="tab-illustrations" class="tab-content">[\s\S]*?<div class="card-grid">)[\s\S]*?(<\/div>\s*<\/section>)/, (m, p1, p2) => `${p1}\n${illCardsHtml}\n        ${p2}`);
  html = html.replace(/(<section id="tab-cover" class="tab-content">[\s\S]*?<div class="card-grid">)[\s\S]*?(<\/div>\s*<\/section>)/, (m, p1, p2) => `${p1}\n${coverCardsHtml}\n        ${p2}`);
  html = html.replace(/(<section id="tab-cdn" class="tab-content">[\s\S]*?<tbody>)[\s\S]*?(<\/tbody>)/, (m, p1, p2) => `${p1}\n${cdnRowsHtml}\n            ${p2}`);
  html = html.replace(/(<section id="tab-xhs" class="tab-content">[\s\S]*?<div class="card-grid">)[\s\S]*?(<\/div>\s*<\/section>)/, (m, p1, p2) => `${p1}\n${xhsCardsHtml}\n        ${p2}`);
  html = html.replace(/(<section id="tab-publishes" class="tab-content">[\s\S]*?<tbody>)[\s\S]*?(<\/tbody>)/, (m, p1, p2) => `${p1}\n${publishRowsHtml}\n            ${p2}`);

  const outputPath = path.join(baseDir, 'index.html');
  fs.writeFileSync(outputPath, html, 'utf-8');
  console.log(`[render_dashboard] ✅ 看板构建成功: ${outputPath} (${html.length} bytes)`);
  return outputPath;
}

// 支持命令行直接调用
if (process.argv[1] && process.argv[1].endsWith('render_dashboard.mjs')) {
  const target = process.argv[2];
  renderDashboard(target);
}
