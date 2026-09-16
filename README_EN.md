<h1 align="center">Doudou All-in-One UGC Content Generation & Publishing Skill</h1>

<p align="center">
  <a href="README.md">简体中文</a> | <b>English</b>
</p>

End-to-end all-in-one automated execution of **Content Compliance Screening → External Link Standardization → High-Definition Article Illustrations → 5D Cover Image Design → Image CDN Acceleration & Backfilling → WeChat Official Account Formatting → Xiaohongshu 4-Tier Infographic Cards → Remotion Cinematic Short Video Creation → Automated Publishing Readiness Across 14 Mainstream Media Platforms**, while generating an interactive **Panoramic Results Dashboard**.

<p align="center">
  <img src="./assets/cover_thumb.png" alt="Doudou All-in-One UGC Content Generation & Publishing Skill Banner" width="100%" />
</p>

---

## 📑 Table of Contents

- [🔄 End-to-End Pipeline Workflow](#-end-to-end-pipeline-workflow)
- [📖 User Guide](#-user-guide)
  - [1. Installation](#1-installation)
  - [2. Usage](#2-usage)
- [🖼️ Generated Asset Showcase](#️-generated-asset-showcase)
- [🛠️ Coordinated Skills Matrix](#️-coordinated-skills-matrix)
- [💬 Community & Support](#-community--support)
- [📄 License](#-license)

---

## 🔄 End-to-End Pipeline Workflow

<p align="center">
  <img src="./assets/workflow.gif" alt="Doudou All-in-One UGC Content Generation & Publishing Pipeline" width="100%" />
</p>

---

## 📖 User Guide

This skill library serves as an **automated UGC media production expert for AI Agents** (supporting Antigravity, Claude Code, OpenCode, etc.).

---

### 1. Installation

Install into any target project root via command line:

```bash
npx skills add undsky/doudou-UGC-skill --yes
```

---

### 2. Usage

Simply trigger with the command and your Markdown post to start the pipeline:

```text
/doudou-UGC articles/my-post.md
```

---

## 🖼️ Generated Asset Showcase

| Asset Showcase | Asset Showcase |
| :---: | :---: |
| **Panoramic Interactive Results Dashboard**<br><br>![Panoramic Interactive Results Dashboard](./assets/1.png) | **01. Content Compliance Audit Report**<br><br>![Content Compliance Audit Report](./assets/2.png) |
| **02. Article Illustrations & Prompts**<br><br>![Article Illustrations & Prompts](./assets/3.png) | **03. Tailored Cover Design & Prompts**<br><br>![Tailored Cover Design & Prompts](./assets/4.png) |
| **04. CDN Asset Manifest & URL Mapping**<br><br>![CDN Asset Manifest & URL Mapping](./assets/5.png) | **05. WeChat Formatting Effect**<br><br>![WeChat Formatting Effect](./assets/6.png) |
| **06. Xiaohongshu / WeChat Infographic Cards**<br><br>![Xiaohongshu Infographic Cards](./assets/7.png) | **07. Remotion Short Video & Storyboard**<br><br>![Remotion Short Video & Storyboard](./assets/8.png) |
| **08. Multi-Platform Publishing Matrix**<br><br>![Multi-Platform Publishing Matrix](./assets/9.png) | |

---

## 🛠️ Coordinated Skills Matrix

Serving as the central pipeline orchestrator, this skill coordinates the following specialized agents:

| Stage | Coordinated Skill / Tool | Role & Asset Output |
| :--- | :--- | :--- |
| **01. Compliance Audit** | [`text-check-skill`](https://github.com/undsky/text-check-skill) | Sensitive word scanning & WeChat Official Accounts Operations Specification checks |
| **02. Reference Standard** | Standardization Rule | Deduplicates naked external URLs, appends standard references |
| **03. Article Illustrations** | [`baoyu-article-illustrator`](https://github.com/JimLiu/baoyu-skills/tree/main/skills/baoyu-article-illustrator) | Analyzes article info density, generates high-res infographics, flowcharts, and architecture diagrams at key nodes |
| **04. Cover Design** | [`baoyu-cover-image`](https://github.com/JimLiu/baoyu-skills/tree/main/skills/baoyu-cover-image) | Tailored prompts, generates multi-aspect ratio covers |
| **05. CDN Acceleration** | [`doudou-cdn`](https://github.com/undsky/doudou-cdn-skill) | Batch uploads images to image hosting (API / GitHub / R2) |
| **06. WeChat Formatting** | [`gzh-design`](https://github.com/undsky/gzh-design-skill) | Themed component assembly, outputs clean snippet and preview page |
| **07. Infographic Cards** | [`baoyu-xhs-images`](https://github.com/JimLiu/baoyu-skills/tree/main/skills/baoyu-xhs-images) | "Pain Point — Root Cause — Breakdown — Solution" 4-tier model, deconstructs vertical cards |
| **08. Video Production** | [`Remotion`](https://github.com/remotion-dev/remotion) + [`shotcraft`](https://github.com/Vincentwei1021/video-shotcraft) + [`talkcraft`](https://github.com/Vincentwei1021/video-talkcraft) + [`doudou-tts`](https://github.com/undsky/doudou-tts-skill) | Golden hook intro + dynamic shot recipes + edge-tts voiceover & SRT + Remotion final render |
| **09. Multi-Platform Publish** | [`doudou-publish-skills`](https://github.com/undsky/doudou-publish-skills) | Realistic human simulation and anti-bot protocols, populates drafts across 14 platforms |
| **10. Results Dashboard** | `render_dashboard.mjs` | One-click generation of dashboard with full-pipeline asset preview, players, and multi-platform status |

---

## 💬 Community & Support

| WeChat Official Account | QQ Group |
| :---------------------- | :------- |
| ![WeChat](https://cdn.undsky.com/img/gh.jpg) | ![QQ Group](https://cdn.undsky.com/img/qqqun.jpg) |

---

## 📄 License

This project is licensed under the [CC BY-NC 4.0](LICENSE) License.

- Free for personal, educational, research, and non-commercial usage.
- Derivative works must include appropriate attribution.
- Commercial usage requires dedicated authorization; please contact the author.
