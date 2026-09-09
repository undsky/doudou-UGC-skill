---
name: doudou-UGC
description: 针对给定的 Markdown 文章文件，一站式全流程依次执行内容合规检测、外链引用提取追加、文章配图生成、封面图生成、图片 CDN 上传、微信公众号排版生成、小红书图文卡片生成、Remotion 短视频生成（黄金钩子分镜脚本 + video-shotcraft / video-talkcraft 镜头与动效配方卡 + doudou-tts edge-tts 配音字幕 + remotion-best-practices 最佳实践）、多平台自动填入与发布就绪（涵盖微信公众号/小绿书、微信视频号、今日头条、百家号、企鹅号、掘金、CSDN、腾讯云、阿里云、B站、小红书、抖音、知乎、烧饼社区），并在产物根目录生成全景交互式 HTML 结果汇总看板（依次串联 text-check-skill、baoyu-article-illustrator、baoyu-cover-image、doudou-image、doudou-cdn、doudou-r2、gzh-design、baoyu-xhs-images、video-shotcraft、video-talkcraft、doudou-tts、remotion-best-practices 以及各大发布技能 /doudou-weixin、/doudou-shipinhao、/doudou-toutiao、/doudou-baijia、/doudou-qiehao、/doudou-juejin、/doudou-csdn、/doudou-tencent、/doudou-aliyun、/doudou-bilibili、/doudou-xiaohongshu、/doudou-douyin、/doudou-zhihu、/doudou-linuxsb）。所有产物均规整保存到 Markdown 文件的同名目录下。
---

# 一站式 Markdown 自媒体发布资产加工 Skill

针对用户提供的 Markdown 文件，依次调用已安装的自媒体与多平台发布系列 Skill（`text-check-skill`、`baoyu-article-illustrator`、`baoyu-cover-image`、`doudou-image`、`doudou-cdn` / `doudou-r2`、`gzh-design`、`baoyu-xhs-images`、`video-shotcraft`、`video-talkcraft`、`doudou-tts`、`remotion-best-practices`、`/doudou-weixin`、`/doudou-shipinhao`、`/doudou-toutiao`、`/doudou-baijia`、`/doudou-qiehao`、`/doudou-juejin`、`/doudou-csdn`、`/doudou-tencent`、`/doudou-aliyun`、`/doudou-bilibili`、`/doudou-xiaohongshu`、`/doudou-douyin`、`/doudou-zhihu`、`/doudou-linuxsb`），实现从**内容审查、外链引用规范化、配图、封面、CDN 加速、公众号排版、图文卡片、Remotion 短视频生成、全网多平台自动化填入与发布就绪**到**生成交互式全景 HTML 结果汇总看板**的全流程生产。

**核心规约**：所有生成的提示词 (Prompts)、配图、封面、HTML、CDN 版 Markdown、多平台发布状态清单、结果汇总看板 (`index.html`) 等内容，**一律保存在与该 Markdown 文件同名的目录下**。

---

## 生图工具调用优先级规约

在整个执行过程中，所有涉及图像生成的阶段（配图、封面图、社媒图文卡片等），必须严格遵循以下生图工具调用顺序：

1. **第一优先级（默认）**：优先调用内置原生生图工具 **`generate_image`** 进行图像生成与渲染。
2. **第二优先级（降级）**：如果环境未提供 `generate_image` 或调用失败，再调用 **`/doudou-image`** 技能出图。

### `/doudou-image` 调用方式

先读取 `/doudou-image` 技能说明，再按其文生图流程执行 `scripts/generate.mjs`。Prompt 已写入产物目录 `prompts/` 文件时，必须用 `--prompt-file` 读取（避免长提示词被 shell 转义），并用 `-o` 指定最终落盘路径：

```bash
node <doudou-image技能目录>/scripts/generate.mjs \
  --prompt-file path/to/article_name/.../prompts/NN-xxx.md \
  -o path/to/article_name/.../images/NN-xxx.png
```

- 图片始终落本地文件；**不要**在生图阶段上传 CDN。公开链接仍由步骤 5 统一处理（默认调用 `/doudou-cdn`，用户明确要求时走 `/doudou-r2`）。
- 默认不传 `--model`；禁止手拼 curl 调生图接口。
- 比例 / 画幅写进 Prompt 正文（该脚本无独立宽高参数）。

---

## 图像文字语言规约

在生成所有配图、封面图、图文卡片时：

- **中文优先原则**：图片中若包含文字标签、标题、模块说明或总结，**除标准英文专业名词/技术术语（如 Docker、Node.js、Python、API、JSON、OpenCode、Alpine 等）外，一律优先使用中文（简体中文）进行清晰呈现**，严禁生成无意义的大段纯英文文本。

---

## 产物同名目录规约

当目标 Markdown 路径为 `[path/to/][article_name].md` 时，在同级目录创建并使用同名文件夹 `[path/to/][article_name]/` 作为产物根目录：

```text
path/to/article_name/
├── index.html                            # 步骤 10：一站式产物结果汇总看板 (HTML Dashboard，含视频播放器、多平台发布状态)
├── 01_compliance_report.md              # 步骤 1：合规性与敏感词审查报告 (text-check-skill)
├── illustrations/                        # 步骤 3：文章插图资产 (baoyu-article-illustrator)
│   ├── prompts/                          # 插图 Prompt 文件 (如 01-infographic-arch.md)
│   └── images/                           # 生成的高清插图 (如 01-arch.png 及步骤 5 下载的 01-arch_thumb.png)
├── cover/                                # 步骤 4：封面图资产 (baoyu-cover-image)
│   ├── prompts/                          # 封面 Prompt 文件
│   └── images/                           # 生成的封面图 (2.35:1 / 16:9 / 1:1 及步骤 5 下载的 _thumb 缩略图)
├── cdn_manifest.json                     # 步骤 5：CDN 上传清单与 URL 映射表 (doudou-cdn / doudou-r2)
├── article_name_cdn.md                   # 步骤 5：已将本地图片无缝替换为 CDN URL 的 Markdown
├── article_name_排版_摸鱼绿(fish-green).html # 步骤 6：公众号纯排版正文片段 (gzh-design)
├── article_name_预览.html                # 步骤 6：带一键复制功能的公众号预览页
├── xhs_images/                           # 步骤 7：小红书/微信图文卡片 (baoyu-xhs-images)
│   ├── prompts/                          # 小红书卡片 Prompt 文件
│   └── images/                           # 生成的 3:4 图文卡片
├── video/                                # 步骤 8：Remotion 短视频资产 (video-shotcraft + video-talkcraft + doudou-tts)
│   ├── storyboard.md                     # 分镜脚本 (黄金钩子开场 + 镜头卡映射表 + 帧级时间轴)
│   ├── narration/                        # edge-tts 配音与字幕
│   │   ├── shot_NN.mp3                   # 各分镜配音音频 (edge-tts，云扬/晓晓等音色)
│   │   └── shot_NN.srt                   # 与音频对齐的 SRT 字幕 (--srt 产出)
│   ├── qa/                               # 逐镜头静帧验收档案 (npx remotion still)
│   ├── article_name.mp4                  # ⭐ 终渲成片 (按字数规划：每 500 字约 1 分钟，≥ 60s，含配音与 SFX)
│   └── video_manifest.json               # 视频元数据 (时长、分辨率、分镜清单、镜头卡、音色、渲染耗时)
└── publishes/                            # 步骤 9：多平台发布状态清单 (/doudou-weixin、/doudou-shipinhao、/doudou-toutiao、/doudou-baijia、/doudou-qiehao、/doudou-juejin、/doudou-csdn、/doudou-tencent、/doudou-aliyun、/doudou-bilibili、/doudou-xiaohongshu、/doudou-douyin、/doudou-zhihu、/doudou-linuxsb)
    └── publish_manifest.json             # 多平台发布结果清单 (平台名称、发布模式、就绪状态、时间等)
```

> **步骤 8 的 Remotion 源码不落在产物目录**：短视频**直接复用仓库根目录既有的 Remotion 工程**（不另建自包含工程、不新装依赖）——镜头与时间线源码写进根 `src/videos/<article_name>/`，静态素材放根 `public/<article_name>/`，Composition 注册在根 `src/Root.tsx`。产物目录只收**产物**：分镜脚本、配音字幕、静帧验收、成片与元数据。

---

## 全流程依次执行指南

当接收到目标 Markdown 文件时，依次执行以下 10 个环节：

### 0. 准备同名工作目录

- 获取目标文件所在目录与主文件名（如 `mds/AICoding/article.md` -> `mds/AICoding/article/`）。
- 创建同名产物目录及相关子目录（`illustrations/prompts`、`illustrations/images`、`cover/prompts`、`cover/images`、`xhs_images/prompts`、`xhs_images/images`、`publishes`）。

---

### 1. 敏感词与公众号规范检测 (`/text-check-skill`)

- **执行目标**：排查违禁词与微信平台内容违规风险。
- **调用逻辑**：
  1. 调用 `text-check-skill` 对目标 Markdown 执行敏感词词库扫描。
  2. 依据《微信公众平台运营规范》（重点针对过度营销、绝对化极限词、诱导关注/分享、未标明广告等）进行语义合规核查。
  3. 将审查结果输出保存至同名目录：`path/to/article_name/01_compliance_report.md`。
  4. **阻断与人工介入机制**：若发现违规内容或敏感词，**必须立即终止后续流程**。向用户详细汇报审查结果并指导修改（提供具体的违规点、修改建议及参考文本）。只有在**用户完成修改或明确要求继续**时，才可恢复推进后续流程。

---

### 2. 外链提取与文末引用追加 (引用链接标准化)

- **执行目标**：在合规审查通过后，扫描目标 Markdown 文档中的所有外部超链接，按标准引用格式规整并追加到目标 Markdown 文件尾部。
- **核心规约与执行逻辑**：
  1. **外链扫描与解析**：
     - 解析目标 Markdown 全文，提取所有外部超链接的目标 URL（匹配 `[链接文字](URL)` 格式及正文裸 URL，忽略图片引用 `![]()`、相对文件路径与文内锚点 `#`）。
     - **纯裸链接提取**：忽略所有链接文字描述或标题，只提取纯 URL 地址。
     - 对相同 URL 自动去重，保留正文中首次出现的顺序。
  2. **默认首项链接规约（强制）**：
     - **第 1 项始终固定为**：`[1] https://www.undsky.com`
     - **无论正文中有无外部链接，该默认首项必须始终存在且位列第 1**。
  3. **引用链接格式排版**：
     - 正文中提取到的其余外部链接，紧随 `[1]` 之后依次按 `[2]`、`[3]`、`[4]`... 顺序编号追加纯 URL。
     - **每条链接独立成段**：链接之间必须**使用空行分隔**（防止 Markdown 标准解析或各大自媒体富文本编辑器将单换行作为软折行合并为同一行）。
     - 标准格式示例如下：

       ```markdown
       ### 引用链接

       [1] https://www.undsky.com

       [2] https://github.com/undsky/doudou-smartedu-down
       ```

     - 保持每条链接独立成段呈现：`[序号] 完整URL`。

  4. **回写目标文件与幂等保障**：
     - 将生成的引用链接区域直接追加写入目标 Markdown 文件（`[article_name].md`）末尾。
     - **幂等更新**：若目标 Markdown 文件末尾已存在旧的引用链接区域（如以 `### 引用链接` 开头的区块），先清理替换旧区块后再行写入，避免重复堆叠。
     - 目标 Markdown 回写完成后，后续的配图分析、CDN 图床替换（生成 `article_name_cdn.md`）、公众号排版（`gzh-design` 自动转为引用链接卡片）及多平台发布全部无缝继承此标准化引用。

---

### 3. 文章配图 (`/baoyu-article-illustrator`)

- **执行目标**：分析文章脉络并在关键信息节点生成高清配图。
- **调用逻辑**：
  1. 分析文章信息密度与逻辑结构，识别适合配图的位置（信息图 `infographic`、流程图 `flowchart`、架构图 `framework`、对比图 `comparison`、场景图 `scene` 等）。
  2. 生成符合 Type × Style × Palette 三维标准的绘图提示词，保存至 `path/to/article_name/illustrations/prompts/NN-[type]-[slug].md`。
  3. **生图调用**：优先调用内置 **`generate_image`**，若无则调用 **`/doudou-image`**（`--prompt-file` 读取上一步 Prompt，`-o` 指定落盘路径）。生成的图片保存至 `path/to/article_name/illustrations/images/NN-[slug].png`。

---

### 4. 封面图 (`/baoyu-cover-image`)

- **执行目标**：为文章设计匹配的高质感封面。
- **调用逻辑**：
  1. 提炼核心主题与标题，按 5 维框架（Type, Palette, Rendering, Text, Mood）定制封面提示词。
  2. 针对公众号与全网分发，生成标准主封面（`2.35:1` 或 `16:9`）与次级封面（`1:1`）。
  3. Prompt 保存至 `path/to/article_name/cover/prompts/`。
  4. **生图调用**：优先使用 **`generate_image`** 出图，缺失时再调用 **`/doudou-image`**（`--prompt-file` + `-o`）。生成的封面图片保存至 `path/to/article_name/cover/images/`。

---

### 5. 图片上传到 CDN 与缩略图同步 (`/doudou-cdn` 或 `/doudou-r2`)

- **执行目标**：将生成的本地配图与封面图批量同步至 CDN 图床，实现 CDN 加速并回填 Markdown，同时下载 CDN 处理后的图片到本地作为缩略图。
- **技能选择与调用优先级（默认图床 vs 指定 R2）**：
  - **默认调用 `/doudou-cdn`**：默认一律优先调用 `/doudou-cdn`（通过公共图床 API 或 GitHub 仓库通道上传，Fastly jsDelivr CDN 加速）。
  - **指定使用 `/doudou-r2`**：**仅当用户在对话中明确且主动要求使用 R2 / Cloudflare R2 时**，才切换调用 `/doudou-r2`。
- **调用逻辑**：
  1. **执行上传**：
     - **默认模式 (`/doudou-cdn`)**：调用 `doudou-cdn` 上传脚本将 `illustrations/images/` 和 `cover/images/` 下的所有图片上传至 CDN 图床：
       ```bash
       node <doudou-cdn技能目录>/scripts/upload.mjs <图片文件...> --format json
       ```
       或通过批量传递图片路径执行上传并解析公开 CDN URL。
     - **R2 模式 (`/doudou-r2`)**：当用户明确要求使用 R2 时，调用 `doudou-r2` 上传脚本。**严禁携带 `--original`、`--no-compress` 或 `--resize 0` 参数**，必须走默认上传逻辑（由 n8n 服务端自动压缩并将宽 ≥ 1000 的图片等比缩小至 600px），以确保 CDN 处理产物为真正的轻量缩略图：
       ```bash
       node <doudou-r2技能目录>/scripts/upload.mjs <图片文件...> --json
       ```
  2. 获取公开访问 CDN URL，生成映射清单保存至 `path/to/article_name/cdn_manifest.json`。
  3. **下载缩略图到本地**：上传成功后，将 CDN 返回的处理后图片下载保存至原图所在同级目录，命名为：`原图名_thumb`（保留原扩展名，生成规则为 `原文件名_thumb`）。若图床服务未做等比缩小处理，则在本地保持原图拷贝或生成轻量缩略图。
  4. 将原 Markdown 中的本地图片引用替换为对应的公开 CDN URL，生成图床化文章文件 `path/to/article_name/article_name_cdn.md`（后续排版、卡片制作及多平台发布均以该 CDN 版为基准输入）。

---

### 6. 生成公众号文章 (`/gzh-design`)

- **执行目标**：将 CDN 版 Markdown 转为符合微信公众平台规范的精美 HTML。
- **调用逻辑**：
  1. 依据文章题材推荐或选用契合的主题样式（如摸鱼绿、石墨极简、红白色系、留白禅意等）。
  2. 套用主题组件库装配公众号专用的 `<section>` 正文片段。
  3. 运行 HTML 规范校验脚本（确保禁用标签及半角标点清零）。
  4. 生成产物保存至同名目录：
     - 干净正文：`path/to/article_name/article_name_排版_主题(ID).html`
     - 预览页面：`path/to/article_name/article_name_预览.html`（含「复制到公众号」按钮）。
     - **命名兼容性规约**：若生成的预览或排版文件带有主题后缀（如 `article_name_预览_摸鱼绿(theme-001).html`），建议同步生成或拷贝一份无后缀别名 `article_name_预览.html` 与 `article_name_排版.html`；步骤 10 看板在渲染时也会自动探测包含 `_预览.html` 的文件并赋给 `{{WECHAT_PREVIEW_FILENAME}}`，确保 iframe 预览精准加载。
  5. _博客同步_：若在 `undsky` 仓库环境中，按规范同步至 `blog/<分类>/<文件名>.html` 并更新 `blog/index.html` 的文章列表与分类计数。

---

### 7. 生成图文卡片 (`/baoyu-xhs-images`)

- **执行目标**：将文章核心知识点与脉络结构拆解为生动的信息图与社媒图文卡片。
- **拆解模型（痛点—成因—拆解—解决方案）**：严格遵循**“痛点—成因—拆解—解决方案”**四层进阶模型，将整篇内容解构为 1-10 张 3:4 竖版信息图卡片：
  1. **痛点（Pain Point / 冲突直击）**：封面卡 / 首图导入，直击目标受众最扎心、最高频的业务痛点、反常识冲突、代价成本或翻车困境，制造强共鸣与停留好奇（Hook）。
  2. **成因（Root Cause / 根因溯源）**：深度剖析问题背后的底层机理、系统瓶颈或认知误区，解释“为什么以前的方法行不通”、“表象之下的真实漏洞”，打破盲区看本质。
  3. **拆解（Breakdown / 架构拆解）**：承接核心论点，对技术方案、核心概念、架构脉络或执行链路进行模块化、层级化多维拆解，选用契合的布局（如 dense / list / flow / mindmap / comparison）清晰展现知识全貌。
  4. **解决方案（Solution / 实施落地）**：给出具体、可直接复制的实操指南、最佳实践路径、行动清单或避坑要点，并在尾页卡片完成升华总结与 CTA（互动/关注/收藏）引导。
- **调用逻辑**：
  1. 依据“痛点—成因—拆解—解决方案”模型深度分析文章脉络与知识架构，规划卡片系列大纲（痛点封面卡 + 根因剖析卡 + 核心要点拆解卡 + 落地解决方案与总结卡）。
  2. 生成各卡片的绘图提示词，保存至 `path/to/article_name/xhs_images/prompts/`。
  3. **生图调用**：优先使用 **`generate_image`**，无可用时调用 **`/doudou-image`**（`--prompt-file` + `-o`）。生成的 3:4 图文卡片保存至 `path/to/article_name/xhs_images/images/`。

---

### 8. 生成 Remotion 短视频 (`/video-shotcraft` + `/video-talkcraft` + `/doudou-tts` + `/remotion-best-practices`)

- **执行目标**：综合分析**目标 Markdown 原文**与**同名产物目录下已生成的全部资料**（`illustrations/`、`cover/`、`xhs_images/` 及各自的 Prompt——**深度分析 Prompt 的核心目的是理解图像语义与构图特征，精准判断每张图片能否以及如何有机融入到对应分镜的画面中**），**根据目标 Markdown 原文字数规划视频时长（每 500 字生成 1 分钟左右的视频，且总时长不小于 60 秒）**，制作解说短视频。
- **遵循 Remotion 最佳实践**：全程严格遵循 Remotion 最佳实践（`/remotion-best-practices`），确保组件架构、动效计算、确定性渲染与工程化规范达标。
- **画幅与分辨率自主选择规约（横屏 vs 竖屏）**：
  - 生成的视频画幅规格**必须由用户在步骤 8 门禁中自主选择**：
    - 🖥️ **横屏（16:9，1920×1080）**
    - 📱 **竖屏（9:16，1080×1920）**
- **技能协同分工**：
  - **最佳实践规范**：`/remotion-best-practices`：遵循 Remotion 官方架构规范、组件生命周期、动画计算准则、确定性渲染与工程化最佳实践。
  - **分镜与镜头动效（双引擎协同）**：
    - `/video-shotcraft`：提供 157 张电影感与产品镜头配方卡（附 demo 源码与动态样片画廊）、Ink Press 模板、可复用组件（PageCam / ClipCard / Caption 等）与声明式钉帧音效库。
    - `/video-talkcraft`：提供 78 张口播/解说动效配方卡（23 调研 + 8 实战★ + 9 真实视频挖掘◆ + 18 remocn 适配◇ + 20 参考图复刻◈）、七层反 PPT 运镜系统（CameraRig/视差/让位/环境）、SHOTBOOK 三面分层工作单、Apple 视觉范式与字级时间戳节拍锚定。
  - **配音与字幕**：`/doudou-tts` 的 **edge-tts** 引擎（`scripts/edgetts.py`），**必须使用 edge-tts，不使用 cosyvoice**（后者慢到分钟级、且本流程无音色克隆需求）。
  - **渲染引擎**：Remotion（30fps；按用户选定的横屏 1920×1080 或竖屏 1080×1920 注册 Composition 并渲染输出）。

#### 8.1 分镜脚本生成（黄金钩子原则）

将分镜脚本写入 `path/to/article_name/video/storyboard.md`，必须遵循以下结构与原则：

1. **黄金钩子（Golden Hook，硬约束）**：
   - **前 3 秒必须抛出最强张力**：用文章中最扎心的痛点、反常识结论或代价数字开场，禁止用"大家好"、"今天给大家分享"一类无信息量的寒暄，也禁止先自我介绍或先讲背景。
   - 钩子的三种可选句式（择一，取自文章原文的真实冲突）：**痛点直击**（"在我电脑上明明是好的"）、**反常识断言**（"工具换了一轮又一轮，其实都是在换马甲"）、**代价前置**（"少了这一步，客户后端直接 JSON 解析报错"）。
   - 钩子镜头结束时必须给出**本片承诺**（观众看完能得到什么），承诺随后必须在正文段被兑现。
2. **叙事骨架（钩子之后）**：按「**冲突 → 拆解 → 兑现 → 收束**」推进——痛点冲突段（问题有多贵）→ 方法拆解段（核心架构 / 原则，对应文章主干小节）→ 价值兑现段（能换来什么结果）→ 品牌收束段（字标落定 + 引导关注）。
3. **分镜表（四列，与 video-shotcraft 阶段 3 对齐）**：`| # | 时间(帧) | 镜头卡 | 关键动效与画面内容 |`，另附**帧级时间轴** `| shot | from | duration | 内容 |`，并逐镜标注：解说文案（口播原文）、字幕、素材来源（引用产物目录中的具体图片路径，基于 Prompt 图像语义与构图分析判断其能否以及如何融入当前分镜）、转场与 SFX。
4. **单分镜时长红线（硬约束，≤ 10 秒）**：
   - **单镜严格控制在 10 秒以下**：**全片每一个分镜的时长必须严格控制在 10 秒以下（≤ 300 帧，推荐黄金区间为 3~7 秒）**，杜绝任何单镜超时拖沓。
   - **长文案拆解切镜**：若某个核心论点、架构拆解或操作演示的口播文案较长（超过 10 秒），**严禁单镜头超时死扛，必须拆解为多个连贯递进的子镜头或独立分镜（如 S2a/S2b 或 S2/S3）**，通过切换视角、局部特写、动效变体或卡片递进，实现高频切镜与信息高动态刷新。
5. **节奏紧凑与转场防停顿（字数规划时长与防静止铁律）**：
   - **紧凑节奏**：全片节奏保持利落紧凑，信息密度饱满。**特别是镜头与段落转场时，绝对不要出现长时间停顿**（音频结束与下一镜头切入之间的间隙严格控制在 0.1~0.25 秒 / 3~8 帧以内，紧密咬合，严禁黑屏死等或静止空镜拖沓）。
   - **全片时长规划**：视频总时长根据目标 Markdown 原文字数规划，每 500 字生成 1 分钟左右的视频（总时长原则上不小于 60 秒，30fps 即每分钟约 1800 帧），全片由多个 ≤ 10 秒的高频短分镜组合构成。
   - **呼吸位克制**：品牌字标落定 hold 0.5s~0.8s 即可，批量动效收尾留 0.3s 缓冲；**全片绝对不要出现超过 3 秒画面一直不变的情况**（长镜头中必须持续注入微运镜推拉、慢速平移、视差浮动、文字逐行/逐词浮现或光效流动，杜绝死板定格）。
6. **一镜一动效**：同一种动画手法（飞入 / 堆叠 / 翻页）全片只当一次主角，重复镜头与重复 tagline 一律删。

#### 8.2 镜头与动效配方卡挑选（以 `videocraft.md` 为权威字典）

1. **基于 `videocraft.md` 逐镜独立推荐与自主选择规约（硬约束）**：
   - **动态检索全景字典（`videocraft.md`）**：在为分镜挑选动效时，**必须统一以当前技能目录下的 `videocraft.md` 为唯一权威字典与选型矩阵**。
   - **每一个分镜分别独立筛选推荐**：严禁将全片镜头打包为一个整体组合选项，**必须针对分镜脚本中的每一个分镜（如 S1、S2、S3、S4、S5、S6...）分别独立从 `videocraft.md` 中检索并推荐**。针对每一个分镜，综合其叙事能量、信息形态（痛点直击/概念对比/架构扫描/终端演示/指标大板/品牌收束）与画面素材特征，**为该分镜单独筛选出至少 3 个最契合的候选动效配方卡**，清晰列出各候选卡的动作语法、视觉风格、呈现重点与适用场景。
   - **交互门禁逐镜独立设问**：在步骤 8 门禁（`ask_question`）中，**必须针对每一个分镜分别设立独立的选择题项**（如【S1 痛点直击 配方卡选择】、【S2 天坑拆解 配方卡选择】...），确保用户能够对每一个镜头的动效形式进行精细化自主裁决。
   - 用户逐镜分别确认或选择后，形成最终的**分镜到镜头卡映射表**写入 `storyboard.md`。
2. **三读硬规则（不可跳）**：选定后 → 校验卡名与 `style-key` → **读该配方卡全文** → 按卡片「参考实现」定位并**读准确的 demo TSX 源码全文** → 把对应组件 **copy 进** `src/videos/<article_name>/lib/`（不 import 原库）。
   - **配方卡「已知坑 / 命门」标注的参数不得降档**，允许按本文章素材做适配性改动，质量标准只升不降。
   - 凭卡名与理解自行新写 = 放弃全部调校积累，实测质感差一档，**禁止**。
3. **视觉语言从素材生长**：全片配色、字体、圆角与质感必须复用文章产物的视觉 tokens（从 `cover/` 与 `xhs_images/` 图片及其 Prompt 中提取主色与调性），镜头卡只继承运动语法与已调参数，**皮肤按本文章重新蒙皮**。

#### 8.3 配音与字幕（`doudou-tts` edge-tts）

1. **口播文案精炼与短句化（禁书面大长句）**：
   - 短视频口播文案必须高度口语化、句式利落（多用短句、对比断句），严禁把书面文章的大段复合长句直接作为口播文案。
2. **字幕短句流式切分与防臃肿红线（强制 Chunking，禁大文本块）**：
   - **严格单行流式推进**：严禁把超过 15 字或复合长句直接作为单条字幕上屏！
   - **强制切碎（Chunking）**：字幕必须按逗号、停顿与语义切分为 **6~14 字的精悍短句**，随语流实时切换，每次只呈现当前正在说的那一小句。
   - **严禁大块霸屏**：字幕严禁出现 3 行及以上的笨重大文本块；字幕容器采用自适应单行药丸形态（`white-space: nowrap`，微透磨砂玻璃），绝不遮挡中间核心内容卡片。
3. **逐镜头合成**：按 `storyboard.md` 中每个分镜的解说文案，逐镜调用 edge-tts，产物落到 `path/to/article_name/video/narration/`：

   ```bash
   python3 <doudou-tts技能目录>/scripts/edgetts.py '该分镜的解说文案' \
     -v 云扬 --speed 1.05 --srt \
     -o path/to/article_name/video/narration/shot_NN.mp3
   ```

4. **音色与语速两步独立自主选择规约（严禁捆绑，强制正交）**：
   - **两步独立设问硬规约**：在步骤 8 门禁（`ask_question`）中，**必须将「配音音色」与「朗读语速」严格拆分为两个独立的单选题**分别向用户设问，**严禁将音色与语速拼凑捆绑为单一复合选项**，确保用户能够按需自由进行正交组合（如“云扬 + 1.0x”或“晓晓 + 1.05x”）：
     - **题项 1：【配音音色自主选择】**：
       - `(Recommended) 云扬（男声，专业可靠、科技干货/新闻播报首选，推荐）`
       - `晓晓（女声，亲和生动、清晰流畅、科普种草风）`
       - `云希（男声，阳光年轻、节奏紧密、短视频冲浪风）`
       - 以及支持用户自定义输入其他 edge-tts 官方音色。
     - **题项 2：【朗读语速自主选择】**：
       - `(Recommended) 1.05x（紧凑利落、信息密度饱满、短视频首选推荐）`
       - `1.0x（标准自然、从容清晰、沉浸讲解）`
       - `1.1x（极速快节奏、高能冲浪）`
       - 以及支持用户自定义输入其他倍率数值。
   - **强制带 `--srt`**：无论用户选择何种音色与语速，合成命令中**必须携带 `--srt`** 以获得与音频精准对齐的 SRT 字幕。
5. **以音频实测时长反推帧数与无缝衔接（关键）**：合成后读取各 `shot_NN.mp3` 的**实测时长**（`--json` 返回元数据，或用 ffprobe），据此**回填 `storyboard.md` 的帧级时间轴**——镜头时长与配音紧密咬合，确保画面切换晚于该镜配音结束仅 3~8 帧，转场紧凑连贯，严禁出现画面与声音断层的长停顿空白。
6. **字幕上屏与素排**：字幕经精细化短句时间轴上屏，采用自适应流式单行设计，字体与配色沿用第 8.2 条的视觉 tokens；**纯动画段落也要有解说字幕**，不留哑巴段落。

#### 8.4 Remotion 工程实现与渲染

1. **直接复用仓库根目录的 Remotion 工程（禁建自包含工程）**：不要在产物目录里另起 Remotion 工程、不要新装依赖、不要新写 `package.json` / `remotion.config.ts`。一律用仓库根目录既有工程：
   - 镜头与时间线源码写进 `src/videos/<article_name>/`（`scenes/`、`lib/`、`theme.ts`、`captions.ts`、`sfx.tsx`、`<Name>Video.tsx`）。
   - Composition 在根 `src/Root.tsx` 中挂载注册（30fps，根据用户选择的画幅注册为横屏 1920×1080 或竖屏 1080×1920），入口仍是根 `src/index.ts`。
   - 渲染与静帧一律在**仓库根目录**执行，沿用根 `remotion.config.ts`（rspack / jpeg / overwriteOutput / tailwind）。
2. **素材接入**：把产物目录中的卡片、插图与封面、各镜配音与所需 SFX / BGM copy 到**根 `public/` 下按文章分目录**（`public/<article_name>/textures|audio|sfx|bgm/`，`staticFile()` 按此前缀取），图片以真实素材入场（**禁止手搓 UI 复刻已有卡片**）；`<Audio>` 挂各镜配音与 BGM。
3. **声音设计**：SFX 从 `video-shotcraft/assets/audio/sfx/<类别>/` 取（运镜→`transition`、落地→`impact`、铺垫→`riser`、光效→`light`、打字→`text`），用**声明式钉帧表**集中管理（`{ from, src, volume }[]`，`from` 一律写 `SHOTS.x.from + offset` 相对表达式，禁裸帧号）；长样本（>5s）必须显式给 `durationInFrames`。结尾固定句式：riser → impact（字标落地，音量峰值）→ sparkle（取自 `light/`）。
4. **确定性渲染铁律**：禁 `Date.now()` / `Math.random()` / 无参 `new Date()`，一切伪随机用固定种子（mulberry32 / 哈希，seed 从 index 派生）。
5. **逐镜静帧验收**：每镜实现完成即在仓库根目录跑 `npx remotion still src/index.ts <Comp> mds/<分类>/<article_name>/video/qa/<name>.png --frame=<N>`，肉眼检查构图 / 穿帮 / 文字锐度后才算完成；静帧归档 `video/qa/`。
6. **终渲与产物**：在仓库根目录跑 `npx remotion render src/index.ts <Comp> mds/<分类>/<article_name>/video/<article_name>.mp4`。
7. **元数据落盘**：将时长、分辨率、fps、分镜清单、所用镜头卡与变体、配音音色、渲染耗时结构化写入 `path/to/article_name/video/video_manifest.json`。

8. **视口饱满度与防大黑边规范（硬红线，严禁小卡片悬空盆景效应）**：
   - **16:9 横屏（1920×1080）**：
     - **水平饱满度**：主内容舞台（Stage Canvas）宽度必须达到 **1680px ~ 1780px**（占全屏宽度 **88% ~ 93%**，左右边距仅留 70~120px 安全边距）。
     - **垂直饱满度**：主内容容器高度必须达到 **700px ~ 820px**（占全屏高度 **75% ~ 85%**，顶部留 120~140px 给分类胶囊与大标题，底部留 100~120px 给自适应药丸字幕）。
     - **严禁矮小缩水卡片**：严禁出现高度 ≤ 550px、宽度 ≤ 1400px 的矮小卡片孤零零悬浮在中心造成四周超过 500px 的大面积黑死区！卡片内部配图插画必须大幅度呈现（高度通常 ≥ 620px~720px），代码块字体 ≥ 20px，使全片画面在大屏幕上极具视觉冲击力与沉浸感。
   - **9:16 竖屏（1080×1920）**：
     - **水平饱满度**：主舞台宽度必须达到 **940px ~ 1000px**（占全屏宽度 **88% ~ 93%**，左右边距留 40~70px）。
     - **垂直饱满度**：垂直堆叠或核心卡片群高度必须达到 **1300px ~ 1550px**，充盈手机视口，严禁中间缩水一块。

#### 8.5 视频质量门禁（交付前自检）

渲染完成后逐条核验，任一不通过则回到对应环节修复：

- ✅ **遵循 Remotion 最佳实践**：严格遵循 Remotion 最佳实践（`/remotion-best-practices`），包括确定性渲染（严禁 `Math.random()`/时间戳污染）、规范使用 `interpolate`/`spring` 动效驱动、合理的组件分层与时序管理、静态资源使用 `staticFile()` 等。
- ✅ **视口饱满度达标（严禁大面积空旷留黑）**：横屏主舞台高度必须 ≥ 700px 且宽度 ≥ 1680px（垂直利用率 ≥ 75%，水平利用率 ≥ 88%）；竖屏主舞台宽度必须 ≥ 940px 且高度 ≥ 1300px。杜绝矮小卡片悬空与四周大面积黑死区。
- ✅ **时长达标**：成片总时长符合字数规划（每 500 字约 1 分钟，且 ≥ 60 秒）。
- ✅ **单分镜 ≤ 10 秒**：全片每一个分镜时长均严格控制在 10 秒以下（≤ 300 帧，黄金区间 3~7 秒），长文案已合理拆解切镜。
- ✅ **黄金钩子**：前 3 秒即抛出痛点 / 反常识 / 代价，无寒暄铺垫。
- ✅ **节奏紧凑与转场连贯**：全片节奏紧凑利落，**镜头与段落转场处无长时间停顿或空镜冷场**（转场咬合间隙 ≤ 0.25s / 8 帧）。
- ✅ **绝对防静止（严禁定格 >3s）**：**全片绝对不要出现超过 3 秒画面一直不变的情况**（镜头内必须保持持续微动效、慢速推拉、视差漂移、扫光或文字渐显，严禁静态死板画面）。
- ✅ **音画同步**：每镜画面切换晚于该镜配音结束，字幕与人声逐句对齐。
- ✅ **镜头卡还原度**：保留所选卡（`video-shotcraft` / `video-talkcraft`）的动作语法、关键时值与「已知坑 / 命门」参数。
- ✅ **视觉一致**：配色字体与文章封面 / 卡片同源，非另造一套宣传片皮肤。
- ✅ **文字锐度**：推进特写下文字不糊（先查 2x 纹理与栅格化路径，别先动景深）。
- ✅ **无哑巴段落**：每个镜头都有解说或字幕承载新信息。

---

### 9. 多平台发布 (`/doudou-weixin`、`/doudou-shipinhao`、`/doudou-toutiao`、`/doudou-baijia`、`/doudou-qiehao`、`/doudou-juejin`、`/doudou-csdn`、`/doudou-tencent`、`/doudou-aliyun`、`/doudou-bilibili`、`/doudou-xiaohongshu`、`/doudou-douyin`、`/doudou-zhihu`、`/doudou-linuxsb`)

- **执行目标**：在图文卡片与短视频生成完毕后，依次调用所选平台对应的独立发布技能（`/doudou-weixin`、`/doudou-shipinhao`、`/doudou-toutiao`、`/doudou-baijia`、`/doudou-qiehao`、`/doudou-juejin`、`/doudou-csdn`、`/doudou-tencent`、`/doudou-aliyun`、`/doudou-bilibili`、`/doudou-xiaohongshu`、`/doudou-douyin`、`/doudou-zhihu`、`/doudou-linuxsb`），基于 `chrome-devtools-mcp` 自动将文章及衍生资产填入各大自媒体平台与技术社区发文页面，完成就绪状态记录并保持页面打开供人工复核与发布。

#### 9.1 支持的 14 大平台矩阵

| 平台名称 | 技能名称 | 平台名称 | 技能名称 |
| :--- | :--- | :--- | :--- |
| **微信公众平台** | `/doudou-weixin` | **腾讯云开发者社区** | `/doudou-tencent` |
| **微信视频号** | `/doudou-shipinhao` | **阿里云开发者社区** | `/doudou-aliyun` |
| **今日头条** | `/doudou-toutiao` | **哔哩哔哩 (B站)** | `/doudou-bilibili` |
| **百家号** | `/doudou-baijia` | **小红书** | `/doudou-xiaohongshu` |
| **企鹅号** | `/doudou-qiehao` | **抖音** | `/doudou-douyin` |
| **掘金** | `/doudou-juejin` | **知乎** | `/doudou-zhihu` |
| **CSDN** | `/doudou-csdn` | **烧饼社区** | `/doudou-linuxsb` |

#### 9.2 用户平台选择与跳过机制 (Interactive Selection & Skip)

在推进到步骤 9 时，**必须使用 `ask_question` 交互工具向用户呈现平台列表供用户确认**，严禁未经确认直接盲目全量发布。

1. **交互选项设计（支持：全选、逐个勾选、全部跳过）**：
   - **字面量严格对齐硬规约（严禁任意修改、加后缀或调换顺序）**：在调用 `ask_question` 工具时，`question`、`is_multi_select` 与 `options` **必须 100% 精确按下方字面量参数传参，严禁自定义添加括号英文别名、严禁随意调换次序、严禁遗漏「全选发布」**：
     ```json
     {
       "question": "短视频及多模态衍生资产已就绪，请选择需要自动填入发布的平台：",
       "is_multi_select": true,
       "options": [
         "(Recommended) 全选发布（全部 14 大平台）",
         "微信公众平台",
         "微信视频号",
         "今日头条",
         "百家号",
         "企鹅号",
         "掘金",
         "CSDN",
         "腾讯云开发者社区",
         "阿里云开发者社区",
         "哔哩哔哩 (B站)",
         "小红书",
         "抖音",
         "知乎",
         "烧饼社区",
         "全部跳过（暂不执行平台发布，直接生成全景汇总看板）"
       ]
     }
     ```
   - **选择逻辑裁决**：
     - 若用户勾选了 `(Recommended) 全选发布（全部 14 大平台）` 或回复“全部发布”，全量 14 大平台全部执行；
     - 若勾选了其中部分平台，仅对勾选的平台执行自动化发布；
     - 若勾选了「全部跳过」或未选择任何平台，执行跳过机制。
2. **全部跳过机制 (Skip All)**：
   - 若用户选择「全部跳过」或未勾选任何发布平台：
     - **完全不启动任何浏览器的自动化发布操作**；
     - 在 `publishes/publish_manifest.json` 中将各平台统一登记为 `skipped`；
     - 系统直接无缝推进至**步骤 10：生成产物结果汇总看板 (`index.html`)**。

#### 9.3 串行发布执行规范

> [!IMPORTANT]
> **【核心铁律】严禁并行发布。**
> `chrome-devtools-mcp` 是**单浏览器单例**，`pageId` 全局共享。若并发启动多个平台技能，会抢夺页面焦点并将内容注入错误标签页。
> 必须按顺序**一次只执行一个平台**，前序平台资产填入完成后，再启动下一个平台。

##### 资产填入后直接判定完成

所有平台在文章（标题、正文、封面）、图文（标题、简介、图片）、视频（标题、简介、视频）资产填入完成后，**直接判定完成**，无需任何等待或轮询。原样保留当前浏览器发文页面现场供人工复核与发布，**严禁调用 `close_page`**。

##### 平台技能调用映射

当用户确认需要发布的平台后，按序**逐个**调用对应平台的发布技能：

- 微信公众平台：`/doudou-weixin <给定的 Markdown 文章文件>`
- 微信视频号：`/doudou-shipinhao <给定的 Markdown 文章文件>`
- 今日头条：`/doudou-toutiao <给定的 Markdown 文章文件>`
- 百家号：`/doudou-baijia <给定的 Markdown 文章文件>`
- 企鹅号：`/doudou-qiehao <给定的 Markdown 文章文件>`
- 掘金：`/doudou-juejin <给定的 Markdown 文章文件>`
- CSDN：`/doudou-csdn <给定的 Markdown 文章文件>`
- 腾讯云开发者社区：`/doudou-tencent <给定的 Markdown 文章文件>`
- 阿里云开发者社区：`/doudou-aliyun <给定的 Markdown 文章文件>`
- 哔哩哔哩 (B站)：`/doudou-bilibili <给定的 Markdown 文章文件>`
- 小红书：`/doudou-xiaohongshu <给定的 Markdown 文章文件>`
- 抖音：`/doudou-douyin <给定的 Markdown 文章文件>`
- 知乎：`/doudou-zhihu <给定的 Markdown 文章文件>`
- 烧饼社区：`/doudou-linuxsb <给定的 Markdown 文章文件>`

#### 9.4 结果汇总清单 (`publish_manifest.json`)

全部所选平台执行完成后，将各平台就绪状态统一写入 `publishes/publish_manifest.json`：
- **状态定义**：`success`（填入完成并就绪）、`needs_login`（待补登）、`failed`（明确失败）、`skipped`（资产缺失或用户跳过）。
- **清单结构**：
  ```json
  {
    "articleTitle": "文章标题",
    "publishTime": "2026-09-09T16:00:00.000Z",
    "totalPlatforms": 14,
    "successfulCount": 14,
    "results": [
      {
        "platform": "微信公众平台",
        "skill": "doudou-weixin",
        "mode": "article",
        "modeDesc": "图文文章",
        "status": "success",
        "statusText": "已就绪"
      }
    ]
  }
  ```
- 供**步骤 10 看板渲染脚本**直接读取呈现。

---

### 10. 生成产物结果汇总看板 (`index.html`)

- **执行目标**：在全流程执行完毕后，自动在产物根目录生成自包含、高颜值、支持离线交互的全景 HTML 汇总看板（`path/to/article_name/index.html`），用户双击即可一站式审阅、对比与复制全流程 1~9 阶段交付成果。
- **推荐执行方式（确定性脚本执行）**：
  为彻底杜绝手动拼装、单次正则替换误匹配以及字符转义导致布局坍塌等问题，**必须优先执行内置确定性渲染脚本**：
  ```bash
  node scripts/render_dashboard.mjs path/to/article.md
  ```
  该脚本会自动读取产物目录下所有资产、合规报告、分镜脚本、多平台发布清单（`publish_manifest.json`），自动解析公众号预览文件名，并严格按三道防御红线生成 `index.html`。
- **核心执行原则与三道防御红线**：
  若自行编写脚本或进行模版渲染，必须强制读取 `references/dashboard-template.html` 作为唯一种子模版进行插槽填充，产物样式与布局严格与规范保持 100% 一致。模版中已完全模块化预置现代扁平白灰调色彩体系、marked.js 引擎、侧边栏 Tab 切换、ESC 退出与全局图片 Lightbox 放大委托、多平台 4 列表格与一键复制 Toast，**严禁脱离模版手写 HTML/CSS，严禁改动模版核心骨架！同时必须严格遵守以下三道防御红线**：
  1. **【防御红线 1：坚决保证以 `<!DOCTYPE html>` 开头】**：生成的 `index.html` 第一行必须严格为 `<!DOCTYPE html>`，前面严禁存在任何 HTML 注释、空格或换行。严禁将 Markdown 全文（含 `---` 分割线）注入到 HTML 头部注释中，以防注释被提前闭合并泄露为匿名文本节点，导致 Flexbox 布局坍塌和 Quirks 混杂模式。
  2. **【防御红线 2：容器锚定替换，严禁全局单次粗暴正则】**：模版中的动态卡片与表格已采用清晰注释锚点（如 `<!-- SLOT_ILLUSTRATION_CARDS -->` 等），替换时必须精准匹配对应卡片网格容器（如 `(<section id="tab-illustrations"...<div class="card-grid">)...(</div>)`），杜绝误伤模版其他区域。
  3. **【防御红线 3：动态解析公众号预览文件名】**：动态探测产物目录下以 `_预览.html` 结尾的文件赋给 `{{WECHAT_PREVIEW_FILENAME}}`（支持 `article_预览_摸鱼绿(theme-001).html` 等动态后缀），确保 iframe 预览正常。
- **模版详细规范与字段定义**：请参阅 [references/dashboard-template.md](references/dashboard-template.md)。
- **内容组织规划（按生成的文件夹目录结构划分模块）**：

| 模块标签                           | 对应目录/文件                                                              | 核心展示与交互内容                                                                                                                                                                                                                        |
| :--------------------------------- | :------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 📊 **全局概览 (Overview)**         | 产物根目录<br>`[article].md`<br>`article_cdn.md`                           | 流程产物交付指标总览（合规状态、配图数、封面数、图文数、短视频终渲状态）；下方直接集成 **Markdown 双栏源码与 marked 实时渲染预览**（左侧 `原文 Markdown ([article]_cdn.md)` 源码高亮+一键复制，右侧 marked 实时解析渲染+一键复制 HTML）。 |
| 🛡️ **01 内容审查**                 | `01_compliance_report.md`                                                  | 格式化渲染合规审查报告全文，展示敏感词检测结果、微信运营规范排查、风险项与优化建议标签，支持一键复制 Markdown。                                                                                                                           |
| 🎨 **02 文章插图**                 | `illustrations/`<br>├ `prompts/`<br>└ `images/`                            | 上下流式网格卡片流：每张卡片含 contain 缩略图、点击放大、比例与类型标签、CDN 快速复制；卡片底部为固定高度、带滚动条的绘图提示词 Prompt 代码块，配备一键复制。                                                                             |
| 🖼️ **03 封面图集**                 | `cover/`<br>├ `prompts/`<br>└ `images/`                                    | 上下流式网格卡片流：2.35:1 微信主封面、16:9 横版封面与 1:1 方版次封面多比例陈列；支持大图放大、CDN 复制与底部 5 维设计提示词一键复制。                                                                                                    |
| 🌐 **04 CDN 映射表**               | `cdn_manifest.json`                                                        | 4 列交互式数据表格：展示图片缩略图（`.table-thumb`，支持点击全屏放大）、原始相对路径、CDN 加速链接与一键复制按钮。                                                                                                          |
| 📱 **05 公众号排版**               | `[article]_排版_[theme].html`<br>`[article]_预览.html`                     | 嵌入式 iframe 实时渲染公众号排版预览；提供纯排版正文与新标签页打开。                                                                                                                                                                      |
| 📑 **06 小红书图文**               | `xhs_images/`<br>├ `prompts/`<br>└ `images/`                               | 3:4 竖版上下流式网格卡片流：展示遵循“痛点—成因—拆解—解决方案”模型的封面痛点卡、根因剖析卡、核心拆解卡与落地总结卡；含高清缩略图预览（点击放大）、3:4 比例标签、CDN URL 与底部提示词 Prompt 一键复制。 |
| 🎬 **07 短视频成片**               | `video/`<br>├ `storyboard.md`<br>├ `narration/`<br>└ `video_manifest.json` | 内嵌 `<video controls>` 播放器直接播放成片；视频渲染技术参数卡片（分辨率、时长、帧数、文件大小、配音音色）与运镜配方卡标签集；黄金分镜脚本区（支持「📝 查看源码 / 📖 查看渲染」无缝切换、复制分镜脚本与复制 HTML）。                      |
| 🚀 **08 多平台发布 (Publish Hub)** | `publishes/`<br>└ `publish_manifest.json`                                  | **多平台发布看板**：精简 4 列表格（平台名称、发布模态、**各平台具体发布标题**、就绪状态徽章），已隐去内部技术分类。                                                                                                                      |

#### 模版插槽填充规范 (Template Slot Guide)

步骤 10 执行时，读取 `references/dashboard-template.html` 并对如下插槽占位符进行精确字符串替换：

1. **全局与概览统计变量**：
   - `{{ARTICLE_TITLE}}`：文章主标题
   - `{{GENERATION_TIME}}`：生成时间（`YYYY-MM-DD HH:mm`）
   - `{{ARTICLE_FOLDER_PATH}}`：产物同名目录相对路径（格式 `mds/<分类>/<slug>/`）
   - `{{ARTICLE_NAME}}`：文章标识/slug（格式 `<slug>`）
   - `{{CDN_MARKDOWN_FILENAME}}`：CDN 加速版文件名（格式 `<slug>_cdn.md`）
   - `{{CDN_MARKDOWN_CONTENT}}`：`[article]_cdn.md` 的代码全文
   - `{{COMPLIANCE_REPORT_CONTENT}}`：`01_compliance_report.md` 的内容全文
   - `{{ILLUSTRATION_COUNT}}` / `{{COVER_COUNT}}` / `{{CARD_COUNT}}`：插图数 / 封面数 / 小红书卡片数（纯数字）
   - `{{WECHAT_PREVIEW_FILENAME}}`：公众号预览文件名（如 `claw163_预览.html` 或 `claw163_预览_摸鱼绿(theme-001).html`）

2. **短视频技术参数变量**：
   - `{{VIDEO_POSTER_PATH}}`：视频海报相对路径（优先使用 `_thumb` 封面，如 `./cover/images/cover-16x9_thumb.png`）
   - `{{VIDEO_FILE_PATH}}`：视频文件相对路径（如 `./video/[article].mp4`）
   - `{{VIDEO_RESOLUTION}}` 与 `{{VIDEO_ASPECT_RATIO}}`：分辨率与画幅（如 `1920×1080`、`16:9 横版`）
   - `{{VIDEO_DURATION}}`、`{{VIDEO_FPS}}`、`{{VIDEO_TOTAL_FRAMES}}`、`{{VIDEO_RENDER_TIME}}`、`{{VIDEO_FILE_SIZE}}`：时长(s)、帧率(fps)、总帧数、渲染耗时(s)、体积(MB)
   - `{{VIDEO_VOICE}}`：配音音色与语速说明（如 `zh-CN-YunyangNeural (云扬 1.05x)`）
   - `{{VIDEO_RECIPE_TAGS}}`：运镜配方卡标签集合（如 `<span class="flat-badge">S1: spotlight-hero-card</span>`）
   - `{{STORYBOARD_CONTENT}}`：`video/storyboard.md` 的 Markdown 全文

3. **模块化 HTML 片段模版（标准结构）**：
   - **`<!-- SLOT_ILLUSTRATION_CARDS -->` & `<!-- SLOT_COVER_CARDS -->`**（配图与封面卡片流）：
     ```html
     <div
       class="flat-card"
       style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 0;"
     >
       <div
         style="background: var(--bg-subtle); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; overflow: hidden; height: 210px; position: relative; cursor: pointer;"
         onclick="openLightbox('${imgPath}')"
         title="点击全屏放大"
       >
         <img
           src="${thumbPath}"
           alt="${filename}"
           style="max-width: 100%; max-height: 100%; object-fit: contain; transition: transform 0.2s ease;"
         />
         <span
           style="position: absolute; bottom: 8px; right: 8px; background: rgba(15, 23, 42, 0.65); color: #fff; font-size: 11px; padding: 2px 6px; border-radius: 4px; backdrop-filter: blur(4px);"
           >🔍 点击放大</span
         >
       </div>
       <div>
         <div
           style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;"
         >
           <h4
             style="font-size: 13.5px; font-weight: 600; color: var(--text-main); margin: 0; word-break: break-all;"
           >
             ${filename}
           </h4>
           <span class="flat-badge">${badge}</span>
         </div>
         <div
           style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--text-muted);"
         >
           <span
             style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 75%;"
             >CDN:
             <a href="${cdnUrl}" target="_blank" style="color: var(--primary);"
               >${cdnUrl}</a
             ></span
           >
           <button
             class="btn"
             style="padding: 2px 8px; font-size: 11.5px;"
             onclick="copyText('${cdnUrl}')"
           >
             📋 复制
           </button>
         </div>
       </div>
       <div
         style="background: var(--bg-subtle); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px 12px; display: flex; flex-direction: column; gap: 6px;"
       >
         <div
           style="display: flex; justify-content: space-between; align-items: center;"
         >
           <span
             style="font-size: 12px; font-weight: 600; color: var(--text-secondary);"
             >📝 绘图提示词 (Prompt)</span
           >
           <button
             class="btn"
             style="padding: 2px 8px; font-size: 11px;"
             onclick="copyContent('${promptId}')"
           >
             📋 复制提示词
           </button>
         </div>
         <pre
           id="${promptId}"
           style="font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 11.5px; line-height: 1.55; color: var(--text-secondary); max-height: 120px; height: 120px; overflow-y: auto; white-space: pre-wrap; margin: 0; padding-right: 4px; word-break: break-word;"
         >
     ${promptText}</pre
         >
       </div>
     </div>
     ```
   - **`<!-- SLOT_CDN_TABLE_ROWS -->`**（4 列表格行）：
     ```html
     <tr>
       <td>
         <img
           src="${cdnUrl}"
           class="table-thumb"
           onclick="openLightbox(this.src)"
           title="点击放大查看"
           alt="预览缩略图"
         />
       </td>
       <td><code>${localPath}</code></td>
       <td>
         <a href="${cdnUrl}" target="_blank" style="color:var(--primary);"
           >${cdnUrl}</a
         >
       </td>
       <td>
         <button
           class="btn"
           style="padding:4px 8px; font-size:12px;"
           onclick="navigator.clipboard.writeText('${cdnUrl}'); showToast('已复制 CDN 链接');"
         >
           📋 复制
         </button>
       </td>
     </tr>
     ```
   - **`<!-- SLOT_XHS_CARDS -->`**：3:4 竖版图文卡片流，卡片内部结构与配图完全一致。
   - **`<!-- SLOT_PUBLISHES_TABLE_ROWS -->`**（4 列表格行，**核心注入资产必须填入具体发布标题**）：
     ```html
     <tr>
       <td><strong>${platformName}</strong></td>
       <td>${mode}</td>
       <td>${actualPublishTitle}</td>
       <td><span class="flat-badge flat-badge-success">${statusText}</span></td>
     </tr>
     ```

---

## 交互与执行模式（核心规约）

- **默认模式：严格分步依次交互确认（Default）**：
  - 当用户输入 `/doudou-UGC path/to/article.md`（未带 `--yes` / `--quick`）时，**必须严格按步骤 1 到步骤 10 的顺序依次推进**。
  - **关键门禁（Gate）**：在每一个涉及选项配置的环节，**必须使用 `ask_question` 交互工具向用户呈现分析结果与推荐选项，等待用户确认/选择后方可执行该步骤的生成**，严禁一次性静默直跑！
    1. **步骤 1（合规阻断门禁）**：汇报合规性与敏感词审查报告。若发现违规或敏感词，必须立即中断流程并指导用户修改；用户修改完成或明确要求继续后方可进入步骤 2。
    2. **步骤 2（外链引用追加）**：合规审查通过后，自动扫描提取外链并在目标 Markdown 文件尾部追加标准引用链接（默认首项 `https://www.undsky.com`）。
    3. **步骤 3（插图门禁）**：触发 `baoyu-article-illustrator` 的插图选项确认（类型/预设、密度、渲染风格、配色）。
    4. **步骤 4（封面门禁）**：触发 `baoyu-cover-image` 的 5 维封面参数确认（视觉类型、配色方案、渲染风格、文字密度、比例）。
    5. **步骤 5**：执行图片 CDN 上传（默认调用 `/doudou-cdn`，用户明确要求时调用 `/doudou-r2`）并回填 Markdown。
    6. **步骤 6（排版门禁）**：触发 `gzh-design` 的排版主题确认（摸鱼绿、红白色系、石墨极简等），装配 HTML 并同步博客。
    7. **步骤 7（小红书门禁）**：触发 `baoyu-xhs-images` 的图文方案确认（基于“痛点—成因—拆解—解决方案”模型规划卡片大纲，确认风格、布局与策略）。
    8. **步骤 8（短视频门禁）**：呈现分镜脚本方案供确认——黄金钩子文案（3 个可选句式）、原文字数与规划时长（每 500 字约 1 分钟，≥ 60s）、**每个分镜严格控制在 10 秒以下（≤ 300 帧）及紧凑节奏规划**、**全片每一个分镜（如 S1~S6...）分别独立提供至少 3 个最契合候选镜头配方卡（`video-shotcraft` / `video-talkcraft`）供用户逐镜自主选择**、**视频画幅由用户自主选择（横屏 1920×1080 (16:9) / 竖屏 1080×1920 (9:16)）**、**配音音色与语速由用户自主选择（提供云扬/晓晓/云希等音色与 1.0x/1.05x 等语速选项）**；用户确认后再执行配音合成、Remotion 工程实现与渲染。
    9. **步骤 9（多平台发布门禁）**：触发多平台发布技能（`/doudou-weixin`、`/doudou-shipinhao`、`/doudou-toutiao`、`/doudou-baijia`、`/doudou-qiehao`、`/doudou-juejin`、`/doudou-csdn`、`/doudou-tencent`、`/doudou-aliyun`、`/doudou-bilibili`、`/doudou-xiaohongshu`、`/doudou-douyin`、`/doudou-zhihu`、`/doudou-linuxsb`）选项确认。使用 `ask_question`（`is_multi_select: true`）呈现平台列表供用户选择（支持勾选「全选发布」、逐个勾选具体平台、或选择「全部跳过」）。若用户选择「全部跳过」，直接跳过发布阶段推进至步骤 10 生成看板；若勾选了目标平台，则启动浏览器自动化依次将文章、图文与视频资产自动填入所选平台发文页面，直接判定完成，原样保留当前标签页现场供人工复核与发布，严禁调用 `close_page`。
    10. **步骤 10**：组装并生成一站式结果汇总看板 `index.html`（含 1~9 阶段完整资产、短视频播放器与多平台发布状态 Tab）。
- **全自动模式（Explicit Only）**：
  - 仅当用户在命令中**显式声明** `--yes`、`--quick`、`--auto`、`一键`、`直接生成` 时，才允许自动按最优推荐参数连续跑通 1~10 全套流程。
- **断点/单步执行**：
  - 支持用户指定执行特定步骤（如仅执行 `/doudou-cdn` 或 `/doudou-r2`、单独发布到指定平台如 `/doudou-bilibili`、或重新生成 `index.html` 汇总看板），直接复用同名目录下的已有资产。

---

## 交付物总结清单

全流程执行完成后，向用户呈递同名目录资产汇总，并重点提示打开 `index.html` 查看：

- 📊 **全景结果汇总看板**：`index.html` ⭐ _(双击即可在浏览器中一览全部原文、提示词、图片、页面、短视频成片、多平台发布状态与 CDN 资产)_
- 🛡️ **合规报告**：`01_compliance_report.md`
- 🎨 **文章插图**：`illustrations/` (含 `prompts/` 与 `images/`)
- 🖼️ **封面图片**：`cover/` (含 `prompts/` 与 `images/`)
- 🌐 **CDN 文章与映射**：`article_name_cdn.md`、`cdn_manifest.json` 及本地缩略图备份 (`_thumb`)
- 📱 **公众号排版**：`article_name_预览.html` 及纯排版 HTML
- 📑 **小红书图文**：`xhs_images/` (含 `prompts/` 与 `images/`)
- 🎬 **短视频成片**：`video/article_name.mp4`（每 500 字约 1 分钟，≥ 60s）及 `video/storyboard.md` 分镜脚本、`video/narration/` 配音与字幕、`video/video_manifest.json` 元数据
- 🚀 **多平台发布清单**：`publishes/`（含 `publish_manifest.json` 清单）
