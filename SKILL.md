---
name: doudou-markdown
description: 针对给定的 Markdown 文章文件，一站式全流程依次执行内容合规检测、文章配图生成、封面图生成、图片 CDN 上传、微信公众号排版生成（支持博客同步）、小红书图文与瑞士/杂志风社媒卡片生成（依次串联 text-check-skill、baoyu-article-illustrator、baoyu-cover-image、doudou-r2、gzh-design、baoyu-xhs-images、guizang-social-card-skill）。所有产物均规整保存到 Markdown 文件的同名目录下。
---

# 一站式 Markdown 自媒体发布资产加工 Skill

针对用户提供的 Markdown 文件，依次调用已安装的自媒体系列 Skill（`text-check-skill`、`baoyu-article-illustrator`、`baoyu-cover-image`、`doudou-r2`、`gzh-design`、`baoyu-xhs-images`、`guizang-social-card-skill`），实现从**内容审查、配图、封面、CDN 加速、公众号排版**到**多平台图文卡片**的全流程生产。

**核心规约**：所有生成的提示词 (Prompts)、配图、封面、HTML、CDN 版 Markdown 等内容，**一律保存在与该 Markdown 文件同名的目录下**。

---

## 生图工具调用优先级规约

在整个执行过程中，所有涉及图像生成的阶段（配图、封面图、社媒图文卡片等），必须严格遵循以下生图工具调用顺序：

1. **第一优先级（默认）**：优先调用内置原生生图工具 **`generate_image`** 进行图像生成与渲染。
2. **第二优先级（降级）**：如果环境未提供 `generate_image` 或调用失败，再降级调用 MCP 工具 **`generate_image_to_r2`**。

---

## 产物同名目录规约

当目标 Markdown 路径为 `[path/to/][article_name].md` 时，在同级目录创建并使用同名文件夹 `[path/to/][article_name]/` 作为产物根目录：

```text
path/to/article_name/
├── 01_compliance_report.md              # 步骤 1：合规性与敏感词审查报告 (text-check-skill)
├── illustrations/                        # 步骤 2：文章插图资产 (baoyu-article-illustrator)
│   ├── prompts/                          # 插图 Prompt 文件
│   └── images/                           # 生成的高清插图
├── cover/                                # 步骤 3：封面图资产 (baoyu-cover-image)
│   ├── prompts/                          # 封面 Prompt 文件
│   └── images/                           # 生成的封面图 (2.35:1 / 16:9 / 1:1)
├── cdn_manifest.json                     # 步骤 4：R2 CDN 上传清单与 URL 映射表 (doudou-r2)
├── article_name_cdn.md                   # 步骤 4：已将本地图片无缝替换为 CDN URL 的 Markdown
├── article_name_排版_摸鱼绿(fish-green).html # 步骤 5：公众号纯排版正文片段 (gzh-design)
├── article_name_预览.html                # 步骤 5：带一键复制功能的公众号预览页
├── xhs_images/                           # 步骤 6.1：小红书/微信图文卡片 (baoyu-xhs-images)
│   ├── prompts/
│   └── images/
└── guizang_cards/                        # 步骤 6.2：归藏高质感社媒卡片 (guizang-social-card-skill)
    ├── editorial/                        # [风格选项 A] 电子杂志风产物 (html & images)
    └── swiss/                            # [风格选项 B] 瑞士国际主义风产物 (html & images)
```

---

## 全流程依次执行指南

当接收到目标 Markdown 文件时，依次执行以下 6 个环节：

### 0. 准备同名工作目录

- 获取目标文件所在目录与主文件名（如 `mds/AICoding/article.md` -> `mds/AICoding/article/`）。
- 创建同名产物目录及相关子目录（`illustrations/prompts`、`illustrations/images`、`cover/prompts`、`cover/images`、`xhs_images`、`guizang_cards`）。

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

#### 6.2 归藏社媒卡片 (`/guizang-social-card-skill`) —— 两种独立风格自主选择

`guizang-social-card-skill` 内置两套相互独立的视觉系统，共用一套图文提炼流程。**必须向用户清晰呈现并提供风格选择**：

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
  - 生成的 HTML 模板与渲染图片保存至 `path/to/article_name/guizang_cards/`（若两套都选则分别放入 `guizang_cards/editorial/` 和 `guizang_cards/swiss/`）。

---

## 交互与执行模式

- **一键全流程模式**：当用户输入 `/doudou-markdown path/to/article.md`（或带有 `--yes`、`--quick`、`自动`、`一键`）时，自动按最优推荐参数连续跑通 1~6 全套流程。
- **分步交互模式**：在关键决策点（合规问题反馈、排版主题确认、**社媒卡片风格选择：电子杂志风 vs 瑞士国际主义风**）主动向用户汇报并确认后继续。
- **断点/单步执行**：支持用户指定执行特定步骤（如仅执行 `/doudou-r2` 或 `/guizang-social-card-skill`），直接复用同名目录下的已有资产。

---

## 交付物总结清单

全流程执行完成后，向用户呈递同名目录资产汇总：

- 🛡️ **合规报告**：`01_compliance_report.md`
- 🎨 **文章插图**：`illustrations/images/`
- 🖼️ **封面图片**：`cover/images/`
- 🌐 **CDN 文章**：`article_name_cdn.md`
- 📱 **公众号排版**：`article_name_预览.html` 及纯正文 HTML
- 📑 **小红书图文**：`xhs_images/images/`
- 📰 **归藏社媒卡片**：`guizang_cards/`（含选定的 **电子杂志风 (Editorial)** 或 **瑞士国际主义 (Swiss)** 卡片组）
