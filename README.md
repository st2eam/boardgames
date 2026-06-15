# The Game Shelf — 桌游规则参考站

A curated, bilingual reference for modern board game rules — 21 games (including expansions/variants), interactive decision trees, LLM-powered Q&A, static site deployed to GitHub Pages.

一个精心整理的现代桌游规则参考网站，覆盖 21 款游戏（含扩展/变体），支持中英双语、交互式决策树、LLM 对话查询，纯静态站点部署到 GitHub Pages。

## Features / 功能特性

- **21 game rules** — web-verified, complete bilingual rules (EN/ZH) / 经过网络验证的中英双语完整规则
- **15 interactive decision trees** — step-by-step flow with sidebar outline navigation / 交互式分步流程，含侧边栏目录导航
- **Game family grouping** — UNO, Dirty Pig, Sanguosha, Exploding Kittens series with stacked card UI / 游戏系列以堆叠卡片效果展示
- **DLC / variant support** — Pig Pageant, Disloyal Minister, Black Box, UNO Flip, UNO No Mercy / 扩展和变体内容完整支持
- **Export** — PDF (browser print) or Markdown download / 支持导出为 PDF 或下载 Markdown
- **LLM chat** — DeepSeek-powered Q&A assistant (global + per-game scope) / 基于 DeepSeek 的规则问答助手
- **Bilingual** — full i18n: UI text + game content / 完整的中英双语界面和内容

---

## Quick Start / 快速开始

```bash
# Install dependencies (Node.js >= 20.9.0) / 安装依赖
npm install

# Start dev server / 启动开发服务器
npm run dev

# Build static site / 构建静态站点
npm run build
```

---

## Tech Stack / 技术选型

| Choice | Decision | Reason |
|--------|----------|--------|
| Framework | Next.js App Router | Static export + server components + rich ecosystem / 静态导出 + 服务端组件 |
| Export | `output: 'export'` | Pure static hosting on GitHub Pages / GitHub Pages 纯静态托管 |
| Styling | Tailwind CSS v4 | Utility-first, responsive-friendly / 原子化 CSS |
| i18n | next-intl (no middleware) | Middleware incompatible with static export; `[locale]` directory routing / middleware 与静态导出不兼容 |
| Content | Markdown (free-form) | Flexible authoring, no schema constraints / 灵活撰写 |
| Rendering | react-markdown + remark-gfm | GFM tables, task lists, strikethrough / GFM 表格/删除线支持 |
| LLM SDK | OpenAI SDK → DeepSeek | DeepSeek is OpenAI-API compatible / DeepSeek 兼容 OpenAI API |
| Chat storage | idb-keyval (IndexedDB) | Persistent chat history, simple API / 持久化对话历史 |

---

## Game List / 游戏清单

### Standalone / 独立游戏

| Game | EN Rules | ZH Rules | Decision Tree |
|------|:--------:|:--------:|:-------------:|
| Texas Hold'em / 德州扑克 | ✅ | ✅ | ✅ |
| TACTA | ✅ | ✅ | ✅ |
| Catan / 卡坦岛 | ✅ | ✅ | ✅ |
| Carcassonne / 卡卡颂 | ✅ | ✅ | ✅ |
| Modern Art / 现代艺术 | ✅ | ✅ | ✅ |
| Sea Salt & Paper / 海盐折纸 | ✅ | ✅ | ✅ |
| GoTown / 摩天大楼 | ✅ | ✅ | ✅ |
| Just Wild / 荒野之王 | ✅ | ✅ | ✅ |
| Attack by Stratagem / 风声再临 | ✅ | ✅ | ✅ |
| Cabo | ✅ | ✅ | ✅ |
| Stars Twenty-One / 群星二十一 | ✅ | ✅ | — |
| Durian Coach Boxing / 榴莲教练的大拳馆 | ✅ | ✅ | — |

### Series / 游戏系列

| Series | Game | Type | EN Rules | ZH Rules | Decision Tree |
|--------|------|------|:--------:|:--------:|:-------------:|
| UNO | UNO | Base | ✅ | ✅ | ✅ |
| | UNO Flip | Variant | ✅ | ✅ | ✅ |
| | UNO Show 'Em No Mercy | Variant | ✅ | ✅ | ✅ |
| Dirty Pig | Dirty Pig / 脏小猪 | Base | ✅ | ✅ | ✅ |
| | Pig Pageant / 小猪选美 | DLC (req. base) | ✅ | ✅ | — |
| Sanguosha | Sanguosha / 三国杀 | Base | ✅ | ✅ | ✅ |
| | Disloyal Minister / 不臣之君 | DLC (req. base) | ✅ | ✅ | — |
| Exploding Kittens | Exploding Kittens / 爆炸猫 | Base | ✅ | ✅ | ✅ |
| | Black Box / 黑盒版 | Variant (standalone) | ✅ | ✅ | — |

---

## Project Structure / 项目结构

```
content/games/
├── index.json                    # Game registry (slug array) / 游戏注册表
├── catan/
│   ├── meta.json                 # Game metadata / 游戏元数据
│   ├── zh/{rules.md, flow.json}  # Chinese rules + optional decision tree
│   └── en/{rules.md, flow.json}  # English rules + optional decision tree
└── ...（21 games total / 共 21 款）

src/
├── app/[locale]/                 # Page routes / 页面路由
├── components/
│   ├── home/                     # GameCard, GameFamilyCard, GameCardGrid, Sidebar, HeroBanner
│   ├── game/                     # GameHeader, MarkdownRenderer, DecisionTree, ExportButton, RelatedGames
│   ├── chat/                     # LLM chat components / 对话组件
│   └── layout/                   # Header, Footer, BackToTop
├── lib/content/                  # Content layer (Repository + Factory) / 内容层
└── types/                        # TypeScript type definitions / 类型定义
```

---

## Content Data Model / 内容数据模型

### meta.json

```json
{
  "name": { "en": "Catan", "zh": "卡坦岛" },
  "players": "3-4",
  "duration": "60-120 min",
  "difficulty": "medium",
  "tags": ["strategy", "family", "board"],
  "category": "board",
  "family": "catan",
  "familyOrder": 0,
  "variantType": "base",
  "requiresBase": false
}
```

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `name` | `{en, zh}` | ✅ | Game name / 游戏名称 |
| `players` | `string` | ✅ | Player count range / 玩家人数范围 |
| `duration` | `string` | ✅ | Play duration / 游戏时长 |
| `difficulty` | `"easy" \| "medium" \| "hard"` | ✅ | Difficulty level / 难度等级 |
| `tags` | `string[]` | ✅ | Tags / 标签 |
| `category` | `string` | ✅ | Category (board / card / party etc.) / 分类 |
| `family` | `string` | ❌ | Series identifier / 所属系列 ID |
| `familyOrder` | `number` | ❌ | Sort order within series (0 = base) / 系列内排序 |
| `variantType` | `"base" \| "expansion" \| "variant"` | ❌ | Base / expansion / variant / 本体/扩展/变体 |
| `requiresBase` | `boolean` | ❌ | Whether base game is required / 是否需要本体 |

### flow.json (Decision Tree / 决策树)

```json
{
  "startNode": "setup",
  "nodes": {
    "setup": {
      "title": { "en": "Game Setup", "zh": "游戏准备" },
      "content": "Place the board in the center... (Markdown)",
      "options": [
        { "label": { "en": "Your Turn", "zh": "轮到你了" }, "next": "turn" },
        { "label": { "en": "Scoring", "zh": "计分方式" }, "next": "scoring" }
      ]
    }
  }
}
```

A **directed graph**: each node is a rule snippet + jump options. `flow.json` is optional — if absent, no interactive entry appears on the page.

本质是**有向图**：每个节点包含规则片段和若干跳转选项，可选提供。

---

## Routes / 路由

| URL | Description / 描述 |
|-----|-------------------|
| `/` | → Redirects to `/en` / 重定向至 `/en` |
| `/en` `/zh` | Homepage: game card grid + global AI chat / 首页 |
| `/en/games/catan` | Rule page: header + rules + export + related games + chat / 规则页 |
| `/en/games/catan/flow` | Interactive decision tree (generated only if `flow.json` exists) / 交互式决策树 |

---

## Page Features / 页面功能

### Homepage / 首页

- Hero banner with site title, subtitle, and game count badge / 标题横幅 + 游戏计数
- Card grid with category/tag filtering / 卡片网格 + 分类标签筛选
- Desktop: left Sidebar + right grid; Mobile: horizontal scroll strips / 桌面端侧边栏，移动端水平滚动
- Cards adapt layout by category (board → wide, card → tall) / 卡片根据分类适配布局
- Family-grouped games rendered as stacked cards with `+N` badge / 同系列堆叠展示

### Game Rule Page / 规则页

- GameHeader: title, players, duration, difficulty, tags / 标题、人数、时长、难度、标签
- Action buttons: decision tree (if available) + export (PDF / Markdown) / 操作按钮
- MarkdownRenderer: renders rule content / 渲染规则正文
- RelatedGames: same-series navigation (if family grouping exists) / 同系列游戏导航
- ChatToggle: LLM chat in bottom-right corner / 右下角 LLM 对话

### Decision Tree / 交互式决策树

- Two-column layout: sidebar outline + content area / 双栏布局
- Breadcrumb navigation, step indicator, back/start-over buttons / 面包屑导航
- Visited nodes and options visually marked / 已访问节点有视觉标记
- Mobile: sidebar auto-collapses / 移动端侧边栏自动折叠

### Export / 导出

| Format | Implementation / 实现 |
|--------|----------------------|
| PDF | New window with print-optimized HTML, triggers `window.print()` / 新窗口排版后浏览器打印 |
| Markdown | Client-side Blob download of raw `.md` file / 前端 Blob 下载 |

---

## LLM Chat / 大模型对话

| Aspect | Detail / 详情 |
|--------|---------------|
| API | DeepSeek API (OpenAI-compatible) |
| Base URL | `https://api.deepseek.com` |
| Model | `deepseek-v4-pro` |
| API Key | User-provided, stored in `localStorage` / 用户填写，本地存储 |
| Homepage chat | **Global**: LLM fetches any game's rules via tool calls / 全局：可拉取任意游戏规则 |
| Game page chat | **Scoped**: system prompt preloaded with full rules / 限定当前游戏：prompt 预载规则 |
| History | IndexedDB, separate history per scope / 全局和每个游戏独立存储 |

---

## Design Patterns / 设计模式

| Pattern | Used In | Purpose / 目的 |
|---------|---------|----------------|
| **Repository** | `GameRepository.ts` | Encapsulate filesystem content access / 封装文件系统内容访问 |
| **Factory** | `GameFactory.ts` | Assemble Game domain objects / 组装 Game 领域对象 |
| **Strategy** | `GlobalChatStrategy` / `GameChatStrategy` | Different prompts & tools per chat scope / 不同对话范围的 prompt |
| **Adapter** | `DeepSeekAdapter.ts` | Isolate LLM provider, easy to swap / 隔离 LLM 提供商 |
| **Context+Provider** | `ChatProvider.tsx` | Manage messages, streaming state, API key / 统一管理状态 |

---

## Localization / 多语言

- Current: Chinese + English / 中文 + 英文
- UI text: `messages/{locale}.json`
- Game content: `content/games/{slug}/{locale}/`
- To add a language: create the corresponding locale directories / 扩展语言只需新建对应目录

---

## Deployment / 部署

- Platform: GitHub Pages
- CI: GitHub Actions (`actions/deploy-pages`)
- Config: `trailingSlash: true`

---

## Key Decisions / 关键技术决策

1. **Build-time file reads** — `fs.readFileSync` runs only during `next build`; 21 games is trivially fast / 构建时同步读取，21 款游戏无性能问题
2. **`dangerouslyAllowBrowser: true`** — API key is user-provided, no server; explicitly enable browser-side calls / 用户自行提供 Key，无服务端
3. **Tool call limit** — Max 5 iterations to prevent infinite loops / 最多 5 轮防止无限循环
4. **No middleware** — next-intl middleware incompatible with `output: 'export'` / middleware 与静态导出不兼容
5. **`trailingSlash: true`** — Required for GitHub Pages subdirectory routing / GitHub Pages 子目录路由兼容
6. **Family grouping** — `family` field for logical association, `familyOrder` for sorting, `variantType` for display / 系列分组通过 family 字段实现
7. **Export** — PDF via browser print, Markdown via Blob download, zero external dependencies / 零外部依赖

---

## Adding a New Game / 添加新游戏

1. Create directory under `content/games/` with `meta.json`, `en/rules.md`, `zh/rules.md` / 创建目录和文件
2. Optionally add `en/flow.json` and `zh/flow.json` for decision trees / 可选添加决策树
3. Register the slug in `content/games/index.json` / 在 index.json 中注册
4. If part of a series, add `family`, `familyOrder`, `variantType` to `meta.json` / 如属系列游戏，添加 family 字段
