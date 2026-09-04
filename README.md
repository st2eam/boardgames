# The Game Shelf

> [English version](README-en.md)

静态导出的中英双语桌游规则站：[st2eam.github.io/boardgames](https://st2eam.github.io/boardgames/)。无 CMS、无 API routes、无运行时 Node；内容以文件为源，构建时生成静态页，部署在 GitHub Pages（`basePath: /boardgames`）。

规模（`content/games/`，可用 `node scripts/print-project-stats.mjs` 核对）：**71** 款游戏（含扩展/变体）、**71** 决策树、**4** 记分器、**5** 训练器、**1** 番符计算器、**8** 款 BBGE 对局。

## Features

- **File-based content.** 每款游戏一个目录：`meta.json`、`en|zh/rules.md`，以及可选的 `flow.json` / `score.json` / `trainer.json` / `calculator.json` / `play.json`。`generateStaticParams` 按配置文件是否存在挂路由。
- **双平面数据。** SSG 经 `GameRepository` / `GameFactory` 读 `content/`；客户端（对话、封面）只 fetch 构建产物 `public/data/`。后者不可手改。
- **决策树。** 双语 `flow.json`（`startNode` + nodes），`DecisionTree` 按节点跳转，带大纲与回溯。
- **记分器准入。** 仅多人跨回合累计（CABO、海盐折纸、6 nimmt!、Just Wild）。终局分类加总不做；默认不写 `score.json`。见 [`docs/score-system.md`](docs/score-system.md)。
- **训练 / 计算。** 麻将听牌、21 点基本策略、德州翻前、围棋死活；日麻番符计算器。领域逻辑在 `src/lib/<domain>/`，UI 经 registry 挂载。
- **BBGE 对局。** Host 权威状态机 + PeerJS；情书、德州、6 nimmt!、围棋、CABO、UNO、TRIO、拉密。邀请联机使用 revision 快照、动作确认与刷新恢复；设计稿在 [`docs/games/`](docs/games/)，联机规范在 [`docs/bbge-networking.md`](docs/bbge-networking.md)，运行时在 `bbge/`。
- **客户端 LLM。** 浏览器直连 DeepSeek Anthropic Messages API；工具上下文来自站内 Markdown（`games-meta.json` + `rules/<slug>.json`），并可用服务端 `web_search`。Key 与历史存 IndexedDB（`idb-keyval`）。
- **Catalog。** next-intl `[locale]` 路由（无 middleware）；系列用 `family` 堆叠；分类 / 标签 / 人数筛选。
- **静态托管约束。** PWA：HTML 与 `/data/` network-first。封面走 `cover-manifest.json`，缺图占位、不探测多后缀，避免 404。规则可导出 PDF / Markdown。

## Stack

| 层 | 选择 | 约束 |
|----|------|------|
| App | Next.js 16.2 App Router | `output: "export"`，`trailingSlash`，无 SSR / API |
| UI | Tailwind v4 | token 在 [`src/app/globals.css`](src/app/globals.css)；不上 Antd / Less |
| i18n | next-intl | 静态导出不能用 middleware；`[locale]` 目录路由 |
| 规则渲染 | react-markdown + remark-gfm | RSC，规则页无客户端 JS |
| 内容 | `content/games/` | 无 axios / Zustand；状态在 feature 内 |
| 对局 | `bbge/` + PeerJS | 与 `features/` 分离 |
| 部署 | GitHub Actions → Pages | [`deploy.yml`](.github/workflows/deploy.yml) |

分层与红线：[`docs/architecture.md`](docs/architecture.md)。ADR：[001](docs/decisions/ADR-001-next-static-export.md) 静态导出、[002](docs/decisions/ADR-002-keep-tailwind-not-antd.md) Tailwind、[003](docs/decisions/ADR-003-content-repository-no-axios.md) Repository。

## Build

```
content/games ──► GameRepository / GameFactory ──► app/[locale] ──► features
       │
       └──► prebuild (generate-game-data) ──► public/data ──► client fetch
```

| Hook | Script | 产物 |
|------|--------|------|
| `prebuild` | `generate-game-data.mjs` | `games-meta.json`、`rules/<slug>.json`、`cover-manifest.json` |
| `build` | `next build` | `out/` |
| `postbuild` | `generate-sw-precache.mjs`、`generate-seo.mjs` | SW precache、sitemap |

源码分层：页面 `src/app/[locale]/`（Server Components），UI `src/features/`，布局 `src/shared/layout/`。

## Local

Node.js >= 22。

```bash
npm install
npm run dev     # Turbopack
npm run build   # 静态导出到 out/
```

`main` 推送后由 Actions 发布到 `/boardgames/`。

## Docs

| 文档 | 用途 |
|------|------|
| [`docs/architecture.md`](docs/architecture.md) | 分层、双平面、红线 |
| [`docs/development-guide.md`](docs/development-guide.md) | 改动方式 |
| [`AGENTS.md`](AGENTS.md) | Agent 入口 / skill 路由 |
| [`.cursor/skills/add-game`](.cursor/skills/add-game/SKILL.md) | 新增游戏 |
| [`docs/score-system.md`](docs/score-system.md) | 记分器准入（默认跳过） |
| [`docs/games/`](docs/games/) | BBGE 对局设计 |
| [`docs/decisions/`](docs/decisions/) | ADR |
