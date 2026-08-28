---
name: doudou-markdown
description: 针对给定的 Markdown 文章文件，一站式全流程依次执行内容合规检测、文章配图生成、封面图生成、图片 CDN 上传、微信公众号排版生成（支持博客同步）、小红书图文与瑞士/杂志风社媒卡片生成，并在产物根目录生成全景交互式 HTML 结果汇总看板（依次串联 text-check-skill、baoyu-article-illustrator、baoyu-cover-image、doudou-r2、gzh-design、baoyu-xhs-images、guizang-social-card-skill）。所有产物均规整保存到 Markdown 文件的同名目录下。
---

# 一站式 Markdown 自媒体发布资产加工 Skill

针对用户提供的 Markdown 文件，依次调用已安装的自媒体系列 Skill（`text-check-skill`、`baoyu-article-illustrator`、`baoyu-cover-image`、`doudou-r2`、`gzh-design`、`baoyu-xhs-images`、`guizang-social-card-skill`），实现从**内容审查、配图、封面、CDN 加速、公众号排版、多平台图文卡片**到**生成交互式全景 HTML 结果汇总看板**的全流程生产。

**核心规约**：所有生成的提示词 (Prompts)、配图、封面、HTML、CDN 版 Markdown、结果汇总看板 (`index.html`) 等内容，**一律保存在与该 Markdown 文件同名的目录下**。

---

## 生图工具调用优先级规约

在整个执行过程中，所有涉及图像生成的阶段（配图、封面图、社媒图文卡片等），必须严格遵循以下生图工具调用顺序：

1. **第一优先级（默认）**：优先调用内置原生生图工具 **`generate_image`** 进行图像生成与渲染。
2. **第二优先级（降级）**：如果环境未提供 `generate_image` 或调用失败，再降级调用 MCP 工具 **`generate_image_to_r2`**。

---

## 图像文字语言规约

在生成所有配图、封面图、图文卡片时：
- **中文优先原则**：图片中若包含文字标签、标题、模块说明或总结，**除标准英文专业名词/技术术语（如 Docker、Node.js、Python、API、JSON、OpenCode、Alpine 等）外，一律优先使用中文（简体中文）进行清晰呈现**，严禁生成无意义的大段纯英文文本。

---

## 产物同名目录规约

当目标 Markdown 路径为 `[path/to/][article_name].md` 时，在同级目录创建并使用同名文件夹 `[path/to/][article_name]/` 作为产物根目录：

```text
path/to/article_name/
├── index.html                            # 步骤 7：一站式产物结果汇总看板 (HTML Dashboard，支持双击直接在浏览器查看)
├── 01_compliance_report.md              # 步骤 1：合规性与敏感词审查报告 (text-check-skill)
├── illustrations/                        # 步骤 2：文章插图资产 (baoyu-article-illustrator)
│   ├── prompts/                          # 插图 Prompt 文件 (如 01-infographic-arch.md)
│   └── images/                           # 生成的高清插图 (如 01-arch.png)
├── cover/                                # 步骤 3：封面图资产 (baoyu-cover-image)
│   ├── prompts/                          # 封面 Prompt 文件
│   └── images/                           # 生成的封面图 (2.35:1 / 16:9 / 1:1)
├── cdn_manifest.json                     # 步骤 4：R2 CDN 上传清单与 URL 映射表 (doudou-r2)
├── article_name_cdn.md                   # 步骤 4：已将本地图片无缝替换为 CDN URL 的 Markdown
├── article_name_排版_摸鱼绿(fish-green).html # 步骤 5：公众号纯排版正文片段 (gzh-design)
├── article_name_预览.html                # 步骤 5：带一键复制功能的公众号预览页
├── xhs_images/                           # 步骤 6.1：小红书/微信图文卡片 (baoyu-xhs-images)
│   ├── prompts/                          # 小红书卡片 Prompt 文件
│   └── images/                           # 生成的 3:4 图文卡片
└── guizang_cards/                        # 步骤 6.2：归藏高质感社媒卡片 (guizang-social-card-skill)
    ├── editorial/                        # [风格选项 A] 电子杂志风产物 (html & images)
    └── swiss/                            # [风格选项 B] 瑞士国际主义风产物 (html & images)
```

---

## 全流程依次执行指南

当接收到目标 Markdown 文件时，依次执行以下 7 个环节：

### 0. 准备同名工作目录

- 获取目标文件所在目录与主文件名（如 `mds/AICoding/article.md` -> `mds/AICoding/article/`）。
- 创建同名产物目录及相关子目录（`illustrations/prompts`、`illustrations/images`、`cover/prompts`、`cover/images`、`xhs_images/prompts`、`xhs_images/images`、`guizang_cards`）。

---

### 1. 敏感词与公众号规范检测 (`/text-check-skill`)

- **执行目标**：排查违禁词与微信平台内容违规风险。
- **调用逻辑**：
  1. 调用 `text-check-skill` 对目标 Markdown 执行敏感词词库扫描。
  2. 依据《微信公众平台运营规范》（重点针对过度营销、绝对化极限词、诱导关注/分享、未标明广告等）进行语义合规核查。
  3. 将审查结果输出保存至同名目录：`path/to/article_name/01_compliance_report.md`。
  4. 如发现违规内容或敏感词，向用户提示修改建议。

---

### 2. 文章配图 (`/baoyu-article-illustrator`)

- **执行目标**：分析文章脉络并在关键信息节点生成高清配图。
- **调用逻辑**：
  1. 分析文章信息密度与逻辑结构，识别适合配图的位置（信息图 `infographic`、流程图 `flowchart`、架构图 `framework`、对比图 `comparison`、场景图 `scene` 等）。
  2. 生成符合 Type × Style × Palette 三维标准的绘图提示词，保存至 `path/to/article_name/illustrations/prompts/NN-[type]-[slug].md`。
  3. **生图调用**：优先调用内置 **`generate_image`**，若无则调用 MCP **`generate_image_to_r2`**。生成的图片保存至 `path/to/article_name/illustrations/images/NN-[slug].png`。

---

### 3. 封面图 (`/baoyu-cover-image`)

- **执行目标**：为文章设计匹配的高质感封面。
- **调用逻辑**：
  1. 提炼核心主题与标题，按 5 维框架（Type, Palette, Rendering, Text, Mood）定制封面提示词。
  2. 针对公众号与全网分发，生成标准主封面（`2.35:1` 或 `16:9`）与次级封面（`1:1`）。
  3. Prompt 保存至 `path/to/article_name/cover/prompts/`。
  4. **生图调用**：优先使用 **`generate_image`** 出图，缺失时再调用 **`generate_image_to_r2`**。生成的封面图片保存至 `path/to/article_name/cover/images/`。

---

### 4. 图片上传到 CDN (`/doudou-r2`)

- **执行目标**：将生成的本地配图与封面图批量同步至 Cloudflare R2，实现 CDN 加速并回填 Markdown。
- **调用逻辑**：
  1. 调用 `doudou-r2` 上传脚本将 `illustrations/images/` 和 `cover/images/` 下的所有图片上传至 R2。
  2. 获取公开访问 CDN URL，生成映射清单保存至 `path/to/article_name/cdn_manifest.json`。
  3. 将原 Markdown 中的本地图片引用替换为对应的公开 CDN URL，生成图床化文章文件 `path/to/article_name/article_name_cdn.md`（后续排版与卡片制作均以该 CDN 版为基准输入）。

---

### 5. 生成公众号文章 (`/gzh-design`)

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

### 6. 生成图文卡片

针对多平台自媒体分发需求，依次调用两套图文卡片技能：

#### 6.1 小红书/微信图文卡片 (`/baoyu-xhs-images`)

- 将文章知识点拆解为 1-10 张生动信息图卡片（封面卡 + 核心要点卡 + 总结卡）。
- 提示词保存至 `path/to/article_name/xhs_images/prompts/`。
- **生图调用**：优先使用 **`generate_image`**，无可用时使用 **`generate_image_to_r2`**。图片保存至 `path/to/article_name/xhs_images/images/`。

#### 6.2 归藏社媒卡片 (`/guizang-social-card-skill`) —— 单文件 HTML 渲 PNG

- **素材直接复用（无需再次调用 AI 生图模型）**：
  - 归藏社媒卡片**不调用**任何生图工具（`generate_image` / `generate_image_to_r2`）。
  - 直接复用步骤 6.1 (`baoyu-xhs-images`) 已拆解的核心观点、金句、痛点、架构、变现路径及配图素材。
- **渲染管线**：
  - 采用 `guizang-social-card-skill` 标准的**单文件 HTML + CSS 模板**（`.poster.xhs` 3:4 比例）。
  - 通过单文件 HTML 渲染为 PNG（如使用 Playwright / Puppeteer 浏览器自动化截图），直接导出 3:4 高清社交卡片，零生图成本且版式精确。
- **视觉风格自主选择**：
  - 内置两套相互独立的视觉系统，共用一套图文提炼内容：

| 风格名称 | 视觉特征 | 推荐适用场景 |
| :--- | :--- | :--- |
| **1. 电子杂志风 (Editorial)** | 像 *Monocle* / *Kinfolk* / *Cereal* 般克制留白的版面，优雅衬线/无衬线混排、质感背景 | 叙事、生活方式、旅行、阅读、影视评论、深度观察、个人随笔 |
| **2. 瑞士国际主义 (Swiss)** | 严谨网格系统、单一高亮锚点色、直角发丝线、极致字号与层级对比 | 产品测评、技术指南、数据分析、架构方法论、开发教程、AI 工具 |

**风格选择与调度机制**：
- **分步交互模式（默认）**：
  - 提炼文章核心金句与观点后，主动向用户提问，让用户自主选择：
    1. **电子杂志风 (Editorial)**
    2. **瑞士国际主义 (Swiss)**
    3. **两套风格均生成**（分别保存在 `editorial/` 与 `swiss/` 子目录下进行对比）
- **全自动模式（`--yes` / `--quick`）**：
  - 依据文章题材自动选择最匹配的风格（如技术/教程默认 Swiss，人文/感悟默认 Editorial），并在交付汇总中告知用户选择理由，提示可随时指定另一套风格重绘。
- **产物归档**：
  - 生成的 HTML 模板 (`cards.html`) 与渲染导出的 PNG 图片保存至 `path/to/article_name/guizang_cards/`（若两套都选则分别放入 `guizang_cards/editorial/` 和 `guizang_cards/swiss/`）。

---

### 7. 生成产物结果汇总看板 (`index.html`)

- **执行目标**：在流程执行完毕后，自动在产物根目录生成自包含、高颜值、支持离线交互的全景 HTML 汇总看板（`path/to/article_name/index.html`）。让用户只需双击打开该 HTML，即可一站式查看、对比、复制全流程产出（Markdown 原文、Prompt 提示词、高清配图、封面、CDN 清单、公众号排版页面、小红书图文与归藏社媒卡片）。
- **内容组织规划（按生成的文件夹目录结构划分模块）**：

| 模块标签 | 对应目录/文件 | 核心展示与交互内容 |
| :--- | :--- | :--- |
| 📊 **全局概览 (Overview)** | 产物根目录 | 文章元数据（标题、字数、生成时间、产物统计看板）、各阶段状态徽章（1~6已就绪）、快捷操作按钮（复制 CDN Markdown、打开公众号预览等）。 |
| 📝 **文章与 Markdown** | `[article].md`<br>`article_cdn.md` | 原文与 CDN 加速版 Markdown 的 Tab 切换预览、行号代码高亮、字符统计、一键复制 Markdown 全文。 |
| 🛡️ **01 内容审查** | `01_compliance_report.md` | 格式化渲染合规审查报告，展示敏感词检测结果、微信运营规范排查、风险项与优化建议标签。 |
| 🎨 **02 文章插图** | `illustrations/`<br>├ `prompts/`<br>└ `images/` | 插图网格卡片流：每张卡片含高清缩略图、放大弹窗 (Lightbox)、类型标签（架构图/流程图等）、Prompt 提示词折叠面板（带一键复制）、本地路径与 CDN URL 快速复制。 |
| 🖼️ **03 封面图集** | `cover/`<br>├ `prompts/`<br>└ `images/` | 2.35:1 微信主封面、16:9 横版封面与 1:1 方版次封面多比例并列陈列；展示 5 维设计提示词，支持大图放大。 |
| 🌐 **04 CDN 映射表** | `cdn_manifest.json` | 交互式数据表格：展示原始相对路径、Cloudflare R2 CDN 加速链接、图片尺寸与上传状态；支持单项或批量一键复制 URL。 |
| 📱 **05 公众号排版** | `[article]_排版_[theme].html`<br>`[article]_预览.html` | 嵌入式实时渲染 iframe 预览公众号样式；提供纯排版正文片段查看；一键复制可直接粘贴至微信公众平台编辑器的富文本内容。 |
| 📑 **06 小红书图文** | `xhs_images/`<br>├ `prompts/`<br>└ `images/` | 3:4 比例卡片流/轮播排版，展示封面卡、要点卡、总结卡；附带对应生图 Prompt 与发布配文查看。 |
| 📰 **07 归藏社媒卡片** | `guizang_cards/`<br>├ `editorial/`<br>└ `swiss/` | 电子杂志风 (Editorial) / 瑞士国际主义 (Swiss) 双风格卡片画廊；支持 HTML 模板预览与渲染生成卡片大图切换查看。 |

#### 看板 HTML 实现规范 (Design & UX Standard)

1. **纯静态自包含设计**：
   - 页面内的所有图片和文件链接均采用**相对路径**（例如 `./illustrations/images/01-arch.png`、`./cover/images/cover-2.35x1.png`）。
   - 用户无需启动本地 HTTP 服务器，直接在文件管理器中**双击 `index.html`** 即可在任意现代浏览器中正常加载全部内容与图片。
2. **现代扁平化设计美学 (Modern Flat Design Standard)**：
   - 采用精致清爽的扁平化现代设计（白/灰高对比平面背景、1px 发丝边框、扁平实色徽章与按钮、纯色点缀）。
   - 去除沉重的大面积阴影与拟物渐变，强调清晰的版式网格、高易读性无衬线排版与克制轻盈的交互反馈。
3. **内置交互组件**：
   - **侧边栏/分类 Tab 导航**：基于文件夹目录结构进行直观归类，点击平滑切换，支持徽章计数。
   - **图片放大镜 / Lightbox 模态框**：点击任意插图/封面/卡片即可全屏放大预览，支持键盘 ESC 关闭。
   - **全局一键复制与 Toast 提示**：复制 Prompt、Markdown 全文、CDN URL、公众号排版 HTML 时均提供即时反馈。
   - **Prompt 提示词抽屉/折叠器**：默认紧凑陈列，点击展开完整 Midjourney/Flux/原生提示词。

---

## 交互与执行模式（核心规约）

- **默认模式：严格分步依次交互确认（Default）**：
  - 当用户输入 `/doudou-markdown path/to/article.md`（未带 `--yes` / `--quick`）时，**必须严格按步骤 1 到步骤 7 的顺序依次推进**。
  - **关键门禁（Gate）**：在每一个涉及选项配置的环节，**必须使用 `ask_question` 交互工具向用户呈现分析结果与推荐选项，等待用户确认/选择后方可执行该步骤的生成**，严禁一次性静默直跑！
    1. **步骤 1**：汇报合规性与敏感词审查报告。
    2. **步骤 2（插图门禁）**：触发 `baoyu-article-illustrator` 的插图选项确认（类型/预设、密度、渲染风格、配色）。
    3. **步骤 3（封面门禁）**：触发 `baoyu-cover-image` 的 5 维封面参数确认（视觉类型、配色方案、渲染风格、文字密度、比例）。
    4. **步骤 4**：执行 R2 CDN 上传并回填 Markdown。
    5. **步骤 5（排版门禁）**：触发 `gzh-design` 的排版主题确认（摸鱼绿、红白色系、石墨极简等），装配 HTML 并同步博客。
    6. **步骤 6.1（小红书门禁）**：触发 `baoyu-xhs-images` 的图文方案确认（策略 A/B/C、风格、布局）。
    7. **步骤 6.2（归藏卡片门禁）**：触发 `guizang-social-card-skill` 的风格选择（1. 电子杂志风 Editorial / 2. 瑞士国际主义 Swiss / 3. 双风格均生成）。
    8. **步骤 7**：组装并生成一站式结果汇总看板 `index.html`。
- **全自动模式（Explicit Only）**：
  - 仅当用户在命令中**显式声明** `--yes`、`--quick`、`--auto`、`一键`、`直接生成` 时，才允许自动按最优推荐参数连续跑通 1~7 全套流程。
- **断点/单步执行**：
  - 支持用户指定执行特定步骤（如仅执行 `/doudou-r2` 或重新生成 `index.html` 汇总看板），直接复用同名目录下的已有资产。

---

## 交付物总结清单

全流程执行完成后，向用户呈递同名目录资产汇总，并重点提示打开 `index.html` 查看：

- 📊 **全景结果汇总看板**：`index.html` ⭐ *(双击即可在浏览器中一览全部原文、提示词、图片、页面与 CDN 资产)*
- 🛡️ **合规报告**：`01_compliance_report.md`
- 🎨 **文章插图**：`illustrations/` (含 `prompts/` 与 `images/`)
- 🖼️ **封面图片**：`cover/` (含 `prompts/` 与 `images/`)
- 🌐 **CDN 文章与映射**：`article_name_cdn.md` 及 `cdn_manifest.json`
- 📱 **公众号排版**：`article_name_预览.html` 及纯排版正文 HTML
- 📑 **小红书图文**：`xhs_images/` (含 `prompts/` 与 `images/`)
- 📰 **归藏社媒卡片**：`guizang_cards/`（含 **电子杂志风 (Editorial)** 或 **瑞士国际主义 (Swiss)** 卡片组）
