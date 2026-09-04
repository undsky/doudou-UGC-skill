---
name: doudou-UGC
description: 针对给定的 Markdown 文章文件，一站式全流程依次执行内容合规检测、外链引用提取追加、文章配图生成、封面图生成、图片 CDN 上传、微信公众号排版生成、小红书图文卡片生成、Remotion 短视频生成（黄金钩子分镜脚本 + video-shotcraft / video-talkcraft 镜头与动效配方卡 + doudou-tts edge-tts 配音字幕 + remotion-best-practices 最佳实践）、多平台自动发布至各大自媒体与技术社区草稿箱（涵盖微信公众号/小绿书、微信视频号、今日头条、百家号、企鹅号、掘金、CSDN、腾讯云、阿里云、B站、小红书、抖音、知乎、烧饼社区），并在产物根目录生成全景交互式 HTML 结果汇总看板（依次串联 text-check-skill、baoyu-article-illustrator、baoyu-cover-image、doudou-image、doudou-r2、gzh-design、baoyu-xhs-images、video-shotcraft、video-talkcraft、doudou-tts、remotion-best-practices、doudou-publish-skills 系列）。所有产物均规整保存到 Markdown 文件的同名目录下。
---

# 一站式 Markdown 自媒体发布资产加工 Skill

针对用户提供的 Markdown 文件，依次调用已安装的自媒体与多平台发布系列 Skill（`text-check-skill`、`baoyu-article-illustrator`、`baoyu-cover-image`、`doudou-image`、`doudou-r2`、`gzh-design`、`baoyu-xhs-images`、`video-shotcraft`、`video-talkcraft`、`doudou-tts`、`remotion-best-practices`、`doudou-publish-skills`），实现从**内容审查、外链引用规范化、配图、封面、CDN 加速、公众号排版、图文卡片、Remotion 短视频生成、全网多平台草稿箱自动发布**到**生成交互式全景 HTML 结果汇总看板**的全流程生产。

**核心规约**：所有生成的提示词 (Prompts)、配图、封面、HTML、CDN 版 Markdown、多平台发布存证截图与清单、结果汇总看板 (`index.html`) 等内容，**一律保存在与该 Markdown 文件同名的目录下**。

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

- 图片始终落本地文件；**不要**在生图阶段上传 CDN。公开链接仍由步骤 5 `/doudou-r2` 统一处理。
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
├── index.html                            # 步骤 10：一站式产物结果汇总看板 (HTML Dashboard，含视频播放器、多平台发布状态与存证)
├── 01_compliance_report.md              # 步骤 1：合规性与敏感词审查报告 (text-check-skill)
├── illustrations/                        # 步骤 3：文章插图资产 (baoyu-article-illustrator)
│   ├── prompts/                          # 插图 Prompt 文件 (如 01-infographic-arch.md)
│   └── images/                           # 生成的高清插图 (如 01-arch.png 及步骤 5 下载的 01-arch_thumb.png)
├── cover/                                # 步骤 4：封面图资产 (baoyu-cover-image)
│   ├── prompts/                          # 封面 Prompt 文件
│   └── images/                           # 生成的封面图 (2.35:1 / 16:9 / 1:1 及步骤 5 下载的 _thumb 缩略图)
├── cdn_manifest.json                     # 步骤 5：R2 CDN 上传清单与 URL 映射表 (doudou-r2)
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
└── publishes/                            # 步骤 9：多平台发布存证与状态清单 (doudou-publish-skills)
    ├── publish_manifest.json             # 多平台发布结果清单 (平台名称、发布模式、草稿状态、时间、截图路径等)
    └── screenshots/                      # 各平台草稿保存成功的存证截图 (如 weixin_article.png, bilibili.png 等)
```

> **步骤 8 的 Remotion 源码不落在产物目录**：短视频**直接复用仓库根目录既有的 Remotion 工程**（不另建自包含工程、不新装依赖）——镜头与时间线源码写进根 `src/videos/<article_name>/`，静态素材放根 `public/<article_name>/`，Composition 注册在根 `src/Root.tsx`。产物目录只收**产物**：分镜脚本、配音字幕、静帧验收、成片与元数据。

---

## 全流程依次执行指南

当接收到目标 Markdown 文件时，依次执行以下 10 个环节：

### 0. 准备同名工作目录

- 获取目标文件所在目录与主文件名（如 `mds/AICoding/article.md` -> `mds/AICoding/article/`）。
- 创建同名产物目录及相关子目录（`illustrations/prompts`、`illustrations/images`、`cover/prompts`、`cover/images`、`xhs_images/prompts`、`xhs_images/images`、`publishes/screenshots`）。

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

### 5. 图片上传到 CDN 与缩略图同步 (`/doudou-r2`)

- **执行目标**：将生成的本地配图与封面图批量同步至 Cloudflare R2，实现 CDN 加速并回填 Markdown，同时下载 CDN 处理后的图片到本地作为缩略图。
- **调用逻辑**：
  1. 调用 `doudou-r2` 上传脚本将 `illustrations/images/` 和 `cover/images/` 下的所有图片上传至 R2。**严禁携带 `--original`、`--no-compress` 或 `--resize 0` 参数**，必须走默认上传逻辑（由 n8n 服务端自动压缩并将宽 ≥ 1000 的图片等比缩小至 600px），以确保 CDN 处理产物为真正的轻量缩略图。
  2. 获取公开访问 CDN URL，生成映射清单保存至 `path/to/article_name/cdn_manifest.json`。
  3. **下载缩略图到本地**：上传成功后，将 CDN 返回的处理后图片下载保存至原图所在同级目录，命名为：`原图名_thumb`（保留原扩展名，例如 `illustrations/images/01-arch.png` 对应下载为 `illustrations/images/01-arch_thumb.png`，封面 `cover-2.35x1.png` 对应下载为 `cover-2.35x1_thumb.png`）。
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
  5. _博客同步_：若在 `undsky` 仓库环境中，按规范同步至 `blog/<分类>/<文件名>.html` 并更新 `blog/index.html` 的文章列表与分类计数。

---

### 7. 生成图文卡片 (`/baoyu-xhs-images`)

- **执行目标**：将文章核心知识点与脉络结构拆解为生动的信息图与社媒图文卡片。
- **调用逻辑**：
  1. 分析文章脉络与知识架构，拆解为 1-10 张生动信息图卡片（封面卡 + 核心要点卡 + 总结卡）。
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

4. **音色与语速自主选择规约**：音色与语速必须由用户在步骤 8 门禁中自主选择确认。系统向用户提供清晰的候选选项与场景推荐：
   - **音色选项**：
     - `云扬`（男声，专业可靠、科技干货/新闻播报首选，推荐）
     - `晓晓`（女声，亲和生动、清晰流畅、科普种草风）
     - `云希`（男声，阳光年轻、节奏紧密、短视频冲浪风）
     - 以及支持用户指定其他 edge-tts 官方音色。
   - **语速选项**：
     - `1.05x`（紧凑利落、信息密度饱满、短视频首选推荐）
     - `1.0x`（标准自然、从容清晰）
     - `1.1x`（极速快节奏）或用户自定义倍率。
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

### 9. 多平台文章与图文发布到草稿箱 (`doudou-publish-skills`)

- **执行目标**：在图文卡片与短视频生成完毕后，调用 `doudou-publish-skills` 套件，基于 `chrome-devtools-mcp` 自动将文章及衍生资产发布至各大自媒体平台与技术社区的草稿箱，并完成状态记录与截屏存证。

#### 9.1 支持的 14 大平台矩阵

| 平台名称             | 技能名称              |
| :------------------- | :-------------------- |
| **微信公众平台**     | `/doudou-weixin`      |
| **微信视频号**       | `/doudou-shipinhao`   |
| **今日头条**         | `/doudou-toutiao`     |
| **百家号**           | `/doudou-baijia`      |
| **企鹅号**           | `/doudou-qiehao`      |
| **掘金**             | `/doudou-juejin`      |
| **CSDN**             | `/doudou-csdn`        |
| **腾讯云开发者社区** | `/doudou-tencent`     |
| **阿里云开发者社区** | `/doudou-aliyun`      |
| **哔哩哔哩 (B站)**   | `/doudou-bilibili`    |
| **小红书**           | `/doudou-xiaohongshu` |
| **抖音**             | `/doudou-douyin`      |
| **知乎**             | `/doudou-zhihu`       |
| **烧饼社区**         | `/doudou-linuxsb`     |

#### 9.2 用户平台选择与跳过机制 (Interactive Selection & Skip)

在推进到步骤 9 时，**必须使用 `ask_question` 交互工具向用户呈现平台列表供用户确认**，严禁未经确认直接盲目全量发布。

1. **交互选项设计（支持：全选、逐个勾选、全部跳过）**：
   - 交互弹窗使用多选（`is_multi_select: true`），选项列表如下：
     - `(Recommended) 全选发布（全部 14 大平台）`
     - `微信公众平台`
     - `微信视频号`
     - `今日头条`
     - `百家号`
     - `企鹅号`
     - `掘金`
     - `CSDN`
     - `腾讯云开发者社区`
     - `阿里云开发者社区`
     - `哔哩哔哩 (B站)`
     - `小红书`
     - `抖音`
     - `知乎`
     - `烧饼社区`
     - `全部跳过（暂不发布到草稿箱，直接生成全景汇总看板）`
   - 用户可直接勾选「全选发布」、单独勾选其中一个或多个具体平台、或勾选「全部跳过」。
2. **全部跳过机制 (Skip All)**：
   - 若用户选择「全部跳过」或未勾选任何发布平台：
     - **完全不启动任何浏览器的自动化发布操作**；
     - 在 `publishes/publish_manifest.json` 中将各平台状态统一记录为 `skipped`（原因：用户主动跳过发布）；
     - 系统直接无缝推进至**步骤 10：生成产物结果汇总看板 (`index.html`)**。

#### 9.3 发布核心规约与执行机制

1. **真实触发与全自动执行链路（确保发布技能真实调用）**：
   - 当用户确认目标平台列表后，**必须真实依次调用各平台对应的发布技能**，严禁仅生成静态 JSON 清单而跳过浏览器真实自动化！
   - **执行流程**：由技能自身决定，不受其他影响。

2. **单平台故障隔离与容错继续执行（Fail-Safe & Fault-Tolerant Loop）**：
   - **失败不阻塞**：每个平台的发布流程必须进行独立异常隔离（Try-Catch 保护）。若某一平台因**未登录、风控人机验证码、网络超时或页面 DOM 结构调整**等原因导致发布失败或未完成，**严禁中断整个发布流程**！
   - **自动跳过并记录**：系统必须将该平台的异常原因结构化记录至 `publishes/publish_manifest.json`（标记为 `needs_login`、`failed` 或 `skipped`），**并立即继续自动推进下一个选定平台的发布**，确保矩阵中的其余平台全部被正常执行并保存草稿。
   - **全流程汇总汇报**：所有选定平台遍历完毕后，在最终报告与全景看板中清晰列出各平台的实际执行结果（✅ 成功草稿ID / ⚠️ 待登录 / ❌ 失败详情），并展示所有已成功平台的存证截图。

3. **缩略图优先原则**：
   - **封面图优先缩略图**：上传封面时，**必须优先选用带有 `_thumb` 后缀的本地缩略图**（如 `cover-2.35x1_thumb.png`、`cover-16x9_thumb.png`，或 `cdn_manifest.json` 中记录的 `thumb_path`）；若无 `_thumb` 缩略图才降级使用原图，规避平台封面上传大小限制并大幅提升上传速度。
   - **正文配图优先缩略图**：需要向平台转存或上传本地图片的场景，**优先使用 `illustrations/images/*_thumb.png` 缩略图**进行转存注入，避免原图过大导致网络超时或风控阻断。

4. **视频形态平台优先投喂成片**：
   - 对**抖音、B站、小红书、视频号**等支持视频的平台，优先上传步骤 8 产出的成片 `video/article_name.mp4`（走视频稿投递），配文取分镜脚本的钩子文案与文章摘要，封面沿用 `cover/images/` 的封面图。
   - 若该平台视频投递失败或未登录，按第 2 条容错规约降级为图文/卡片模式发布，并在清单中记录降级原因。

5. **截屏存证与清单记录**：
   - 每个平台保存草稿后，自动调用 `take_screenshot` 保存存证截图至 `path/to/article_name/publishes/screenshots/[platform]_[mode].png`。
   - 在 `path/to/article_name/publishes/publish_manifest.json` 中结构化记录各平台发布状态、草稿 ID/链接、存证截图路径与耗时。

---

### 10. 生成产物结果汇总看板 (`index.html`)

- **执行目标**：在全流程执行完毕后，自动在产物根目录生成自包含、高颜值、支持离线交互的全景 HTML 汇总看板（`path/to/article_name/index.html`）。用户只需双击打开该 HTML，即可一站式查看、对比、复制全流程产出（Markdown 原文、Prompt 提示词、高清配图、封面、CDN 清单、公众号排版页面、小红书图文卡片、**Remotion 短视频成片**、**以及全网 13 大平台的草稿发布结果与存证截图**）。
- **内容组织规划（按生成的文件夹目录结构划分模块）**：

| 模块标签                           | 对应目录/文件                                                              | 核心展示与交互内容                                                                                                                                                                                                                                                                                |
| :--------------------------------- | :------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 📊 **全局概览 (Overview)**         | 产物根目录                                                                 | 文章元数据（标题、字数、生成时间、产物统计看板）、各阶段状态徽章（1~9 已就绪）、快捷操作按钮（复制 CDN Markdown、打开公众号预览、播放短视频成片、查看多平台草稿存证等）。                                                                                                                         |
| 📝 **文章与 Markdown**             | `[article].md`<br>`article_cdn.md`                                         | 原文（含文末标准引用链接）与 CDN 加速版 Markdown 的 Tab 切换预览、行号代码高亮、字符统计、一键复制 Markdown 全文。                                                                                                                                                                                |
| 🛡️ **01 内容审查**                 | `01_compliance_report.md`                                                  | 格式化渲染合规审查报告，展示敏感词检测结果、微信运营规范排查、风险项与优化建议标签。                                                                                                                                                                                                              |
| 🎨 **02 文章插图**                 | `illustrations/`<br>├ `prompts/`<br>└ `images/`                            | 插图网格卡片流：每张卡片含高清缩略图、放大弹窗 (Lightbox)、类型标签（架构图/流程图等）、Prompt 提示词折叠面板（带一键复制）、本地路径与 CDN URL 快速复制。                                                                                                                                        |
| 🖼️ **03 封面图集**                 | `cover/`<br>├ `prompts/`<br>└ `images/`                                    | 2.35:1 微信主封面、16:9 横版封面与 1:1 方版次封面多比例并列陈列；展示 5 维设计提示词，支持大图放大。                                                                                                                                                                                              |
| 🌐 **04 CDN 映射表**               | `cdn_manifest.json`                                                        | 交互式数据表格：展示原始相对路径、Cloudflare R2 CDN 加速链接、图片尺寸与上传状态；支持单项或批量一键复制 URL。                                                                                                                                                                                    |
| 📱 **05 公众号排版**               | `[article]_排版_[theme].html`<br>`[article]_预览.html`                     | 嵌入式实时渲染 iframe 预览公众号样式；提供纯排版正文片段查看；一键复制可直接粘贴至微信公众平台编辑器的富文本内容。                                                                                                                                                                                |
| 📑 **06 小红书图文**               | `xhs_images/`<br>├ `prompts/`<br>└ `images/`                               | 3:4 比例卡片流/轮播排版，展示封面卡、要点卡、总结卡；附带对应生图 Prompt 与发布配文查看。                                                                                                                                                                                                         |
| 🎬 **07 短视频成片**               | `video/`<br>├ `storyboard.md`<br>├ `narration/`<br>└ `video_manifest.json` | 内嵌 `<video controls>` 播放器直接播放成片（相对路径引用 `./video/[article].mp4`）；展示分镜脚本表（钩子文案、镜头卡、时长）、所用 `video-shotcraft` / `video-talkcraft` 镜头配方卡清单与配音音色/语速；逐镜配音音频 `<audio>` 试听与 SRT 字幕查看；视频元数据卡（时长、分辨率、fps、渲染耗时）。 |
| 🚀 **08 多平台发布 (Publish Hub)** | `publishes/`<br>├ `publish_manifest.json`<br>└ `screenshots/`              | **多平台草稿发布状态看板**：展示 13 大平台发布状态徽章（✅ 已保存草稿 / ⚠️ 待登录 / ❌ 失败 / ⏸️ 未选择）、发布模态（图文长文/卡片贴图/**视频稿**）、草稿 ID、发布时间；网格化展示各平台草稿保存成功的存证截图（支持点击全屏放大 Lightbox 审查），支持一键复制多平台发布状态汇总。                |

#### 看板 HTML 实现规范 (Design & UX Standard)

1. **模板唯一定义与严禁自拟样式**：
   - 步骤 10 生成 `index.html` 时，**必须强制读取 `references/dashboard-template.html` 作为唯一种子模版**进行占位符插槽填充替换，**严禁脱离模板从零手写 HTML/CSS，严禁自行设计深色/极客主题**！
   - 严格保持模版预设的现代扁平化浅色白灰调视觉体系（`--bg-app: #f8fafc`、`--bg-surface: #ffffff`、1px 发丝边框 `--border-subtle: #e2e8f0`、扁平实色徽章与按钮），确保所有文章产出看板在视觉风格与交互逻辑上 100% 规范统一。
2. **Markdown 双栏实时渲染与 marked.js 依赖**：
   - 页面 `<head>` 必须引入 `<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>`。
   - 「文章与 Markdown」模块必须采用 `.markdown-split-view` 双栏布局：
     - **左侧（源码区）**：展示高亮代码，支持一键在「CDN 加速版」与「原始 Markdown」之间自由切换，配备 `📋 一键复制 Markdown`；
     - **右侧（实时预览区）**：通过 `marked.parse()` 实时将左侧 Markdown 解析渲染为带完整版式（标题、引用、列表、代码块、图片等）的 HTML 视图，配备 `📋 一键复制 HTML`。
3. **纯静态自包含设计**：
   - 页面内的所有图片、存证截图和文件链接均采用**相对路径**（例如 `./illustrations/images/01-arch.png`、`./cover/images/cover-2.35x1.png`、`./publishes/screenshots/weixin_article.png`）。
   - 用户无需启动本地 HTTP 服务器，直接在文件管理器中**双击 `index.html`** 即可在任意现代浏览器中正常加载全部内容、图片与存证截图。
4. **内置交互组件与占位符填充**：
   - **侧边栏/分类 Tab 导航**：基于文件夹目录结构进行直观归类，点击平滑切换，支持徽章计数。
   - **多平台发布状态面板与存证画廊**：多平台卡片式状态流，展示 13 平台状态与存证截图 Lightbox 全屏预览。
   - **图片放大镜 / Lightbox 模态框**：点击任意插图/封面/卡片/发布存证截图即可全屏放大预览，支持键盘 ESC 关闭。
   - **全局一键复制与 Toast 提示**：复制 Prompt、Markdown 全文、CDN URL、公众号排版 HTML、多平台发布状态报告时均提供即时反馈。
   - **Prompt 提示词抽屉/折叠器**：默认紧凑陈列，点击展开完整 Midjourney/Flux/原生提示词。

---

## 交互与执行模式（核心规约）

- **默认模式：严格分步依次交互确认（Default）**：
  - 当用户输入 `/doudou-UGC path/to/article.md`（未带 `--yes` / `--quick`）时，**必须严格按步骤 1 到步骤 10 的顺序依次推进**。
  - **关键门禁（Gate）**：在每一个涉及选项配置的环节，**必须使用 `ask_question` 交互工具向用户呈现分析结果与推荐选项，等待用户确认/选择后方可执行该步骤的生成**，严禁一次性静默直跑！
    1. **步骤 1（合规阻断门禁）**：汇报合规性与敏感词审查报告。若发现违规或敏感词，必须立即中断流程并指导用户修改；用户修改完成或明确要求继续后方可进入步骤 2。
    2. **步骤 2（外链引用追加）**：合规审查通过后，自动扫描提取外链并在目标 Markdown 文件尾部追加标准引用链接（默认首项 `https://www.undsky.com`）。
    3. **步骤 3（插图门禁）**：触发 `baoyu-article-illustrator` 的插图选项确认（类型/预设、密度、渲染风格、配色）。
    4. **步骤 4（封面门禁）**：触发 `baoyu-cover-image` 的 5 维封面参数确认（视觉类型、配色方案、渲染风格、文字密度、比例）。
    5. **步骤 5**：执行 R2 CDN 上传并回填 Markdown。
    6. **步骤 6（排版门禁）**：触发 `gzh-design` 的排版主题确认（摸鱼绿、红白色系、石墨极简等），装配 HTML 并同步博客。
    7. **步骤 7（小红书门禁）**：触发 `baoyu-xhs-images` 的图文方案确认（策略 A/B/C、风格、布局）。
    8. **步骤 8（短视频门禁）**：呈现分镜脚本方案供确认——黄金钩子文案（3 个可选句式）、原文字数与规划时长（每 500 字约 1 分钟，≥ 60s）、**每个分镜严格控制在 10 秒以下（≤ 300 帧）及紧凑节奏规划**、**全片每一个分镜（如 S1~S6...）分别独立提供至少 3 个最契合候选镜头配方卡（`video-shotcraft` / `video-talkcraft`）供用户逐镜自主选择**、**视频画幅由用户自主选择（横屏 1920×1080 (16:9) / 竖屏 1080×1920 (9:16)）**、**配音音色与语速由用户自主选择（提供云扬/晓晓/云希等音色与 1.0x/1.05x 等语速选项）**；用户确认后再执行配音合成、Remotion 工程实现与渲染。
    9. **步骤 9（多平台发布门禁）**：触发 `doudou-publish-skills` 多平台发布选项确认。使用 `ask_question`（`is_multi_select: true`）呈现平台列表供用户选择（支持勾选「全选发布」、逐个勾选具体平台、或选择「全部跳过」）。若用户选择「全部跳过」，直接跳过发布阶段推进至步骤 10 生成看板；若勾选了目标平台，则启动浏览器自动化依次将文章、图文与视频资产发布到所选平台草稿箱并保存存证截图。
    10. **步骤 10**：组装并生成一站式结果汇总看板 `index.html`（含 1~9 阶段完整资产、短视频播放器与多平台发布状态 Tab）。
- **全自动模式（Explicit Only）**：
  - 仅当用户在命令中**显式声明** `--yes`、`--quick`、`--auto`、`一键`、`直接生成` 时，才允许自动按最优推荐参数连续跑通 1~10 全套流程。
- **断点/单步执行**：
  - 支持用户指定执行特定步骤（如仅执行 `/doudou-r2`、单独发布到指定平台如 `/doudou-bilibili`、或重新生成 `index.html` 汇总看板），直接复用同名目录下的已有资产。

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
- 🚀 **多平台发布存证**：`publishes/`（含 `publish_manifest.json` 清单与 `screenshots/` 各平台草稿存证截图）
