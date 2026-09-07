# doudou-UGC 全景交付结果汇总看板种子模版使用规约 (dashboard-template)

本参考文档详细说明了 `references/dashboard-template.html` 的结构、模版变量插槽、防崩塌硬性红线与组件标准 HTML 规范。

---

## 一、防怪异模式与防崩塌三大硬性红线

在执行**步骤 10：生成看板（`index.html`）**时，必须严格遵守以下三条红线：

1. **红线 1（绝对以 `<!DOCTYPE html>` 开篇）**：
   - 模版文件 `dashboard-template.html` 必须且已经保证第一行从 `<!DOCTYPE html>` 开始；
   - 装配脚本或 Agent 在读取模版及输出最终产物时，**严禁在 `<!DOCTYPE html>` 前面插入任何注释、空行或字符串**；
   - 无论何时读取模版，代码中务必包含防御性代码：
     ```javascript
     if (html.includes('<!DOCTYPE html>')) {
       html = html.slice(html.indexOf('<!DOCTYPE html>'));
     }
     ```
   - **违规后果**：若在 `<!DOCTYPE html>` 之前出现任何字符或注释泄露，现代浏览器会立即退回**怪异模式（Quirks Mode）**。由于页面整体采用 Flex 容器（`body { display: flex; height: 100vh; overflow: hidden; }`），顶层泄露文本会被当成 Flex 第一子项占据左侧全部宽度，导致 `<aside class="sidebar">` 侧边栏被向右挤飞、`<main>` 内容区完全被移出视口裁剪！

2. **红线 2（插槽替换精准锚定容器，严禁非特异性全局正则）**：
   - 动态卡片与表格数据必须通过具体的父级容器 DOM ID 严格匹配替换，例如：
     - 插图卡片流：`#tab-illustrations .card-grid` 或 `<!-- SLOT_ILLUSTRATION_CARDS -->`
     - 封面卡片流：`#tab-cover .card-grid` 或 `<!-- SLOT_COVER_CARDS -->`
     - CDN 资源清单：`#tab-cdn tbody` 或 `<!-- SLOT_CDN_TABLE_ROWS -->`
     - 小红书卡片流：`#tab-xhs .card-grid` 或 `<!-- SLOT_XHS_CARDS -->`
     - 多平台表格：`#tab-publishes tbody` 或 `<!-- SLOT_PUBLISHES_TABLE_ROWS -->`
     - 存证截图画廊：`#tab-publishes` 截图容器或 `<!-- SLOT_PUBLISHES_SCREENSHOTS -->`
   - **违规后果**：松散的正则（如简单的单次 `.replace(/<!-- ILLUSTRATION_CARDS_PLACEHOLDER[\s\S]*?-->/, ...)`）极易受外部输入污染或首项误伤，导致核心卡片未渲染而残留未解析的占位符。

3. **红线 3（Markdown 源码严禁放入 HTML 注释内）**：
   - Markdown 原文中通常包含大量的水平分割线（`---`）、代码块或 HTML 实体；
   - 若将 Markdown 内容直接塞进 HTML 注释（`<!-- ... -->`）中，会导致注释被其中的 `---` 或 `-->` 提前截断闭合，后半截内容直接漏出破坏页面结构；
   - Markdown 源码必须仅注入至隐藏容器（如 `<div id="cdn-markdown-raw" style="display:none;">...</div>`）内部。

---

## 二、全局模版变量字典

| 占位符变量 | 类型 | 说明与示例 |
|:---|:---|:---|
| `{{ARTICLE_TITLE}}` | 文本 | 文章主标题（如 `连买域名的钱都省了！将 ClawEmail 打造成临时邮箱`） |
| `{{GENERATION_TIME}}` | 文本 | 看板生成时间（格式 `YYYY-MM-DD HH:mm`，如 `2026-09-07 09:25`） |
| `{{ARTICLE_FOLDER_PATH}}` | 路径 | 文章同名产物相对路径（如 `mds/AICoding/claw163/`） |
| `{{ARTICLE_NAME}}` | 标识 | 文章标识 / slug（如 `claw163`） |
| `{{CDN_MARKDOWN_FILENAME}}` | 文件名 | CDN 加速版文件名（如 `claw163_cdn.md`） |
| `{{CDN_MARKDOWN_CONTENT}}` | 代码全文 | `[article]_cdn.md` 的 Markdown 原文内容 |
| `{{COMPLIANCE_REPORT_CONTENT}}`| 内容全文 | `01_compliance_report.md` 的 Markdown 原文内容 |
| `{{ILLUSTRATION_COUNT}}` | 纯数字 | 文章高清配图总数（如 `3`） |
| `{{COVER_COUNT}}` | 纯数字 | 封面图总数（如 `1`） |
| `{{CARD_COUNT}}` | 纯数字 | 小红书/社媒卡片总数（如 `5`） |
| `{{WECHAT_PREVIEW_FILENAME}}` | 文件名 | 公众号排版预览文件名（默认为 `[article]_预览.html`，兼容主题名如 `[article]_排版_摸鱼绿(moyu-green)_预览.html`） |

---

## 三、短视频插槽变量

| 占位符变量 | 说明与示例 |
|:---|:---|
| `{{VIDEO_POSTER_PATH}}` | 视频封面海报相对路径（优先使用 `_thumb` 缩略图，如 `./cover/images/cover.png`） |
| `{{VIDEO_FILE_PATH}}` | 视频成片文件相对路径（如 `./video/claw163.mp4`） |
| `{{VIDEO_RESOLUTION}}` | 分辨率（如 `1920×1080`） |
| `{{VIDEO_ASPECT_RATIO}}` | 画幅比例（如 `16:9 横版` 或 `9:16 竖版`） |
| `{{VIDEO_DURATION}}` | 视频时长（如 `71.9`） |
| `{{VIDEO_FPS}}` | 帧率（如 `30`） |
| `{{VIDEO_TOTAL_FRAMES}}` | 总帧数（如 `2157`） |
| `{{VIDEO_RENDER_TIME}}` | 渲染耗时（如 `86.4`） |
| `{{VIDEO_FILE_SIZE}}` | 成品文件大小（MB，如 `47.7`） |
| `{{VIDEO_VOICE}}` | 旁白音色与语速说明（如 `zh-CN-XiaoxiaoNeural (晓晓 1.05x)`） |
| `{{VIDEO_RECIPE_TAGS}}` | 运镜配方卡标签集合 HTML（如 `<span class="flat-badge">S1: spotlight-hero-card</span>`） |
| `{{STORYBOARD_CONTENT}}` | `video/storyboard.md` 的 Markdown 全文 |

---

## 四、组件标准 HTML 片段结构

### 1. 配图 / 封面 / 小红书图文卡片流
```html
<div class="flat-card" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 0;">
  <div style="background: var(--bg-subtle); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; overflow: hidden; height: 210px; position: relative; cursor: pointer;" onclick="openLightbox('${fullPath}')" title="点击全屏放大">
    <img src="${thumbPath}" alt="${title}" style="max-width: 100%; max-height: 100%; object-fit: contain; transition: transform 0.2s ease;" />
    <span style="position: absolute; bottom: 8px; right: 8px; background: rgba(15, 23, 42, 0.65); color: #fff; font-size: 11px; padding: 2px 6px; border-radius: 4px; backdrop-filter: blur(4px);">🔍 点击放大</span>
  </div>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
      <h4 style="font-size: 13.5px; font-weight: 600; color: var(--text-main); margin: 0; word-break: break-all;">${filename}</h4>
      <span class="flat-badge">${badge}</span>
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--text-muted);">
      <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 75%;">CDN: <a href="${cdnUrl}" target="_blank" style="color: var(--primary);">${cdnUrl}</a></span>
      <button class="btn" style="padding: 2px 8px; font-size: 11.5px;" onclick="copyText('${cdnUrl}')">📋 复制</button>
    </div>
  </div>
  <div style="background: var(--bg-subtle); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px 12px; display: flex; flex-direction: column; gap: 6px;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 12px; font-weight: 600; color: var(--text-secondary);">📝 绘图提示词 (Prompt)</span>
      <button class="btn" style="padding: 2px 8px; font-size: 11px;" onclick="copyContent('${promptId}')">📋 复制提示词</button>
    </div>
    <pre id="${promptId}" style="font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 11.5px; line-height: 1.55; color: var(--text-secondary); max-height: 120px; height: 120px; overflow-y: auto; white-space: pre-wrap; margin: 0; padding-right: 4px; word-break: break-word;">${promptContent}</pre>
  </div>
</div>
```

### 2. CDN 映射表格行（4 列）
```html
<tr>
  <td><img src="${cdnUrl}" class="table-thumb" onclick="openLightbox(this.src)" title="点击放大查看" alt="预览缩略图" /></td>
  <td><code>${localPath}</code></td>
  <td><a href="${cdnUrl}" target="_blank" style="color:var(--primary);">${cdnUrl}</a></td>
  <td><button class="btn" style="padding:4px 8px; font-size:12px;" onclick="navigator.clipboard.writeText('${cdnUrl}'); showToast('已复制 CDN 链接');">📋 复制</button></td>
</tr>
```

### 3. 多平台发布表格行（5 列）
```html
<tr>
  <td><strong>${platformName}</strong></td>
  <td>${modeDesc}</td>
  <td>${actualPublishTitle}</td>
  <td><span class="flat-badge ${badgeClass}">${statusText}</span></td>
  <td>
    ${hasScreenshot ? `<button class="btn" style="padding:4px 8px; font-size:12px;" onclick="openLightbox('${screenshotPath}')">📸 查看存证</button>` : `<span style="color:var(--text-muted); font-size:12px;">无存证</span>`}
  </td>
</tr>
```

### 4. 存证截图画廊卡片
```html
<div class="flat-card" style="margin-bottom:16px;">
  <h4 style="margin-bottom:8px; font-size:14px; font-weight:600;">${platformName} (${modeDesc}) 存证</h4>
  <img src="${screenshotPath}" style="width:100%; max-width:720px; border-radius:6px; border:1px solid var(--border-subtle); cursor:pointer;" onclick="openLightbox('${screenshotPath}')" title="点击全屏查看" />
  <p style="font-size:12px; color:var(--text-muted); margin-top:6px;">状态: ${statusText} | 存证路径: ${screenshotPath}</p>
</div>
```
