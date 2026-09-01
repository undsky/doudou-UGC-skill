---
name: doudou-markdown
description: 针对给定的 Markdown 文章文件，一站式全流程依次执行内容合规检测、文章配图生成、封面图生成、图片 CDN 上传、微信公众号排版生成（支持博客同步）、小红书图文卡片生成、多平台自动发布至各大自媒体与技术社区草稿箱（涵盖微信公众号/小绿书、今日头条、百家号、企鹅号、掘金、CSDN、腾讯云、阿里云、B站、小红书、抖音、知乎），并在产物根目录生成全景交互式 HTML 结果汇总看板（依次串联 text-check-skill、baoyu-article-illustrator、baoyu-cover-image、doudou-r2、gzh-design、baoyu-xhs-images、doudou-publish-skills 系列）。所有产物均规整保存到 Markdown 文件的同名目录下。
---

# 一站式 Markdown 自媒体发布资产加工 Skill

针对用户提供的 Markdown 文件，依次调用已安装的自媒体与多平台发布系列 Skill（`text-check-skill`、`baoyu-article-illustrator`、`baoyu-cover-image`、`doudou-r2`、`gzh-design`、`baoyu-xhs-images`、`doudou-publish-skills`），实现从**内容审查、配图、封面、CDN 加速、公众号排版、图文卡片、全网多平台草稿箱自动发布**到**生成交互式全景 HTML 结果汇总看板**的全流程生产。

**核心规约**：所有生成的提示词 (Prompts)、配图、封面、HTML、CDN 版 Markdown、多平台发布存证截图与清单、结果汇总看板 (`index.html`) 等内容，**一律保存在与该 Markdown 文件同名的目录下**。

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
├── index.html                            # 步骤 8：一站式产物结果汇总看板 (HTML Dashboard，含多平台发布状态与存证)
├── 01_compliance_report.md              # 步骤 1：合规性与敏感词审查报告 (text-check-skill)
├── illustrations/                        # 步骤 2：文章插图资产 (baoyu-article-illustrator)
│   ├── prompts/                          # 插图 Prompt 文件 (如 01-infographic-arch.md)
│   └── images/                           # 生成的高清插图 (如 01-arch.png 及步骤 4 下载的 01-arch_thumb.png)
├── cover/                                # 步骤 3：封面图资产 (baoyu-cover-image)
│   ├── prompts/                          # 封面 Prompt 文件
│   └── images/                           # 生成的封面图 (2.35:1 / 16:9 / 1:1 及步骤 4 下载的 _thumb 缩略图)
├── cdn_manifest.json                     # 步骤 4：R2 CDN 上传清单与 URL 映射表 (doudou-r2)
├── article_name_cdn.md                   # 步骤 4：已将本地图片无缝替换为 CDN URL 的 Markdown
├── article_name_排版_摸鱼绿(fish-green).html # 步骤 5：公众号纯排版正文片段 (gzh-design)
├── article_name_预览.html                # 步骤 5：带一键复制功能的公众号预览页
├── xhs_images/                           # 步骤 6：小红书/微信图文卡片 (baoyu-xhs-images)
│   ├── prompts/                          # 小红书卡片 Prompt 文件
│   └── images/                           # 生成的 3:4 图文卡片
└── publishes/                            # 步骤 7：多平台发布存证与状态清单 (doudou-publish-skills)
    ├── publish_manifest.json             # 多平台发布结果清单 (平台名称、发布模式、草稿状态、时间、截图路径等)
    └── screenshots/                      # 各平台草稿保存成功的存证截图 (如 weixin_article.png, bilibili.png 等)
```

---

## 全流程依次执行指南

当接收到目标 Markdown 文件时，依次执行以下 8 个环节：

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

### 4. 图片上传到 CDN 与缩略图同步 (`/doudou-r2`)

- **执行目标**：将生成的本地配图与封面图批量同步至 Cloudflare R2，实现 CDN 加速并回填 Markdown，同时下载 CDN 处理后的图片到本地作为缩略图。
- **调用逻辑**：
  1. 调用 `doudou-r2` 上传脚本将 `illustrations/images/` 和 `cover/images/` 下的所有图片上传至 R2。**严禁携带 `--original`、`--no-compress` 或 `--resize 0` 参数**，必须走默认上传逻辑（由 n8n 服务端自动压缩并将宽 ≥ 1000 的图片等比缩小至 600px），以确保 CDN 处理产物为真正的轻量缩略图。
  2. 获取公开访问 CDN URL，生成映射清单保存至 `path/to/article_name/cdn_manifest.json`。
  3. **下载缩略图到本地**：上传成功后，将 CDN 返回的处理后图片下载保存至原图所在同级目录，命名为：`原图名_thumb`（保留原扩展名，例如 `illustrations/images/01-arch.png` 对应下载为 `illustrations/images/01-arch_thumb.png`，封面 `cover-2.35x1.png` 对应下载为 `cover-2.35x1_thumb.png`）。
  4. 将原 Markdown 中的本地图片引用替换为对应的公开 CDN URL，生成图床化文章文件 `path/to/article_name/article_name_cdn.md`（后续排版、卡片制作及多平台发布均以该 CDN 版为基准输入）。

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

### 6. 生成图文卡片 (`/baoyu-xhs-images`)

- 将文章知识点拆解为 1-10 张生动信息图卡片（封面卡 + 核心要点卡 + 总结卡）。
- 提示词保存至 `path/to/article_name/xhs_images/prompts/`。
- **生图调用**：优先使用 **`generate_image`**，无可用时使用 **`generate_image_to_r2`**。图片保存至 `path/to/article_name/xhs_images/images/`。

---

### 7. 多平台文章与图文发布到草稿箱 (`doudou-publish-skills`)

- **执行目标**：在图文卡片生成完毕后，调用 `doudou-publish-skills` 套件，基于 `chrome-devtools-mcp` 自动将文章及衍生资产发布至各大自媒体平台与技术社区的草稿箱，并完成状态记录与截屏存证。

#### 7.1 支持的 12 大平台矩阵

| 平台名称             | 技能名称              |
| :------------------- | :-------------------- |
| **微信公众平台**     | `/doudou-weixin`      |
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

#### 7.2 发布核心规约与执行机制

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

4. **截屏存证与清单记录**：
   - 每个平台保存草稿后，自动调用 `take_screenshot` 保存存证截图至 `path/to/article_name/publishes/screenshots/[platform]_[mode].png`。
   - 在 `path/to/article_name/publishes/publish_manifest.json` 中结构化记录各平台发布状态、草稿 ID/链接、存证截图路径与耗时。

---

### 8. 生成产物结果汇总看板 (`index.html`)

- **执行目标**：在全流程执行完毕后，自动在产物根目录生成自包含、高颜值、支持离线交互的全景 HTML 汇总看板（`path/to/article_name/index.html`）。用户只需双击打开该 HTML，即可一站式查看、对比、复制全流程产出（Markdown 原文、Prompt 提示词、高清配图、封面、CDN 清单、公众号排版页面、小红书图文卡片、**以及全网 12 大平台的草稿发布结果与存证截图**）。
- **内容组织规划（按生成的文件夹目录结构划分模块）**：

| 模块标签                           | 对应目录/文件                                                 | 核心展示与交互内容                                                                                                                                                                                                                                                      |
| :--------------------------------- | :------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 📊 **全局概览 (Overview)**         | 产物根目录                                                    | 文章元数据（标题、字数、生成时间、产物统计看板）、各阶段状态徽章（1~7 已就绪）、快捷操作按钮（复制 CDN Markdown、打开公众号预览、查看多平台草稿存证等）。                                                                                                               |
| 📝 **文章与 Markdown**             | `[article].md`<br>`article_cdn.md`                            | 原文与 CDN 加速版 Markdown 的 Tab 切换预览、行号代码高亮、字符统计、一键复制 Markdown 全文。                                                                                                                                                                            |
| 🛡️ **01 内容审查**                 | `01_compliance_report.md`                                     | 格式化渲染合规审查报告，展示敏感词检测结果、微信运营规范排查、风险项与优化建议标签。                                                                                                                                                                                    |
| 🎨 **02 文章插图**                 | `illustrations/`<br>├ `prompts/`<br>└ `images/`               | 插图网格卡片流：每张卡片含高清缩略图、放大弹窗 (Lightbox)、类型标签（架构图/流程图等）、Prompt 提示词折叠面板（带一键复制）、本地路径与 CDN URL 快速复制。                                                                                                              |
| 🖼️ **03 封面图集**                 | `cover/`<br>├ `prompts/`<br>└ `images/`                       | 2.35:1 微信主封面、16:9 横版封面与 1:1 方版次封面多比例并列陈列；展示 5 维设计提示词，支持大图放大。                                                                                                                                                                    |
| 🌐 **04 CDN 映射表**               | `cdn_manifest.json`                                           | 交互式数据表格：展示原始相对路径、Cloudflare R2 CDN 加速链接、图片尺寸与上传状态；支持单项或批量一键复制 URL。                                                                                                                                                          |
| 📱 **05 公众号排版**               | `[article]_排版_[theme].html`<br>`[article]_预览.html`        | 嵌入式实时渲染 iframe 预览公众号样式；提供纯排版正文片段查看；一键复制可直接粘贴至微信公众平台编辑器的富文本内容。                                                                                                                                                      |
| 📑 **06 小红书图文**               | `xhs_images/`<br>├ `prompts/`<br>└ `images/`                  | 3:4 比例卡片流/轮播排版，展示封面卡、要点卡、总结卡；附带对应生图 Prompt 与发布配文查看。                                                                                                                                                                               |
| 🚀 **07 多平台发布 (Publish Hub)** | `publishes/`<br>├ `publish_manifest.json`<br>└ `screenshots/` | **多平台草稿发布状态看板**：展示 12 大平台发布状态徽章（✅ 已保存草稿 / ⚠️ 待登录 / ❌ 失败 / ⏸️ 未选择）、发布模态（图文长文/卡片贴图）、草稿 ID、发布时间；网格化展示各平台草稿保存成功的存证截图（支持点击全屏放大 Lightbox 审查），支持一键复制多平台发布状态汇总。 |

#### 看板 HTML 实现规范 (Design & UX Standard)

1. **模板唯一定义与严禁自拟样式**：
   - 步骤 8 生成 `index.html` 时，**必须强制读取 `references/dashboard-template.html` 作为唯一种子模版**进行占位符插槽填充替换，**严禁脱离模板从零手写 HTML/CSS，严禁自行设计深色/极客主题**！
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
   - **多平台发布状态面板与存证画廊**：多平台卡片式状态流，展示 12 平台状态与存证截图 Lightbox 全屏预览。
   - **图片放大镜 / Lightbox 模态框**：点击任意插图/封面/卡片/发布存证截图即可全屏放大预览，支持键盘 ESC 关闭。
   - **全局一键复制与 Toast 提示**：复制 Prompt、Markdown 全文、CDN URL、公众号排版 HTML、多平台发布状态报告时均提供即时反馈。
   - **Prompt 提示词抽屉/折叠器**：默认紧凑陈列，点击展开完整 Midjourney/Flux/原生提示词。

---

## 交互与执行模式（核心规约）

- **默认模式：严格分步依次交互确认（Default）**：
  - 当用户输入 `/doudou-markdown path/to/article.md`（未带 `--yes` / `--quick`）时，**必须严格按步骤 1 到步骤 8 的顺序依次推进**。
  - **关键门禁（Gate）**：在每一个涉及选项配置的环节，**必须使用 `ask_question` 交互工具向用户呈现分析结果与推荐选项，等待用户确认/选择后方可执行该步骤的生成**，严禁一次性静默直跑！
    1. **步骤 1（合规阻断门禁）**：汇报合规性与敏感词审查报告。若发现违规或敏感词，必须立即中断流程并指导用户修改；用户修改完成或明确要求继续后方可进入步骤 2。
    2. **步骤 2（插图门禁）**：触发 `baoyu-article-illustrator` 的插图选项确认（类型/预设、密度、渲染风格、配色）。
    3. **步骤 3（封面门禁）**：触发 `baoyu-cover-image` 的 5 维封面参数确认（视觉类型、配色方案、渲染风格、文字密度、比例）。
    4. **步骤 4**：执行 R2 CDN 上传并回填 Markdown。
    5. **步骤 5（排版门禁）**：触发 `gzh-design` 的排版主题确认（摸鱼绿、红白色系、石墨极简等），装配 HTML 并同步博客。
    6. **步骤 6（小红书门禁）**：触发 `baoyu-xhs-images` 的图文方案确认（策略 A/B/C、风格、布局）。
    7. **步骤 7（多平台发布门禁）**：触发 `doudou-publish-skills` 多平台发布选项确认。向用户提供平台勾选与发布模态选择（如推荐全选、自媒体组、技术社区组、视觉图文组或自定义选择），用户确认后启动浏览器自动化将文章与图文资产发布到各平台草稿箱并保存存证截图。
    8. **步骤 8**：组装并生成一站式结果汇总看板 `index.html`（含 1~7 阶段完整资产与多平台发布状态 Tab）。
- **全自动模式（Explicit Only）**：
  - 仅当用户在命令中**显式声明** `--yes`、`--quick`、`--auto`、`一键`、`直接生成` 时，才允许自动按最优推荐参数连续跑通 1~8 全套流程。
- **断点/单步执行**：
  - 支持用户指定执行特定步骤（如仅执行 `/doudou-r2`、单独发布到指定平台如 `/doudou-bilibili`、或重新生成 `index.html` 汇总看板），直接复用同名目录下的已有资产。

---

## 交付物总结清单

全流程执行完成后，向用户呈递同名目录资产汇总，并重点提示打开 `index.html` 查看：

- 📊 **全景结果汇总看板**：`index.html` ⭐ _(双击即可在浏览器中一览全部原文、提示词、图片、页面、多平台发布状态与 CDN 资产)_
- 🛡️ **合规报告**：`01_compliance_report.md`
- 🎨 **文章插图**：`illustrations/` (含 `prompts/` 与 `images/`)
- 🖼️ **封面图片**：`cover/` (含 `prompts/` 与 `images/`)
- 🌐 **CDN 文章与映射**：`article_name_cdn.md`、`cdn_manifest.json` 及本地缩略图备份 (`_thumb`)
- 📱 **公众号排版**：`article_name_预览.html` 及纯排版 HTML
- 📑 **小红书图文**：`xhs_images/` (含 `prompts/` 与 `images/`)
- 🚀 **多平台发布存证**：`publishes/`（含 `publish_manifest.json` 清单与 `screenshots/` 各平台草稿存证截图）
