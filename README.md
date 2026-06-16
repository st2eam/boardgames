# The Game Shelf — 桌游规则参考站

> [English version / 英文版](README-en.md)

一个精心整理的现代桌游规则参考网站，覆盖 26 款游戏（含扩展/变体），支持中英双语、交互式决策树、LLM 对话查询，纯静态站点部署到 GitHub Pages。

## 功能特性

- **26 款游戏规则**：经过网络验证的中英双语完整规则
- **15 款交互式决策树**：分步交互流程，含侧边栏目录导航
- **13 款游戏计分器**：支持 VP 制、回合制、累计制三种计分模式，数据持久化
- **游戏系列分组**：UNO、脏小猪、三国杀、爆炸猫、璀璨宝石、海盐折纸、卡坦岛等系列以堆叠卡片效果展示
- **DLC / 变体支持**：小猪选美、不臣之君、黑盒版、UNO Flip、UNO No Mercy、璀璨宝石宝可梦版、盐趣倍增、中国版图
- **规则导出**：支持导出为 PDF 或下载 Markdown 原文
- **LLM 对话**：基于 DeepSeek API 的规则问答助手，支持游戏限定 / 全局模式切换
- **首页排序**：游戏卡片按英文名字母顺序排列
- **中英双语**：完整的 i18n 支持，含 UI 文案和游戏内容

## 快速开始

```bash
# 安装依赖（需要 Node.js >= 20.9.0）
npm install

# 启动开发服务器
npm run dev

# 构建静态站点
npm run build
```

---

## 技术选型

| 项 | 决定 | 原因 |
|---|---|---|
| 框架 | Next.js App Router | 静态导出 + 服务端组件 + 丰富生态 |
| 导出模式 | `output: 'export'` | GitHub Pages 纯静态托管 |
| 样式 | Tailwind CSS v4 | 原子化 CSS，响应式友好 |
| i18n | next-intl（无 middleware） | middleware 与静态导出不兼容，使用 `[locale]` 目录路由 |
| 内容格式 | Markdown（自由格式） | 灵活撰写，无结构约束 |
| 内容渲染 | react-markdown + remark-gfm | GFM 表格/任务列表/删除线支持 |
| LLM SDK | OpenAI SDK → DeepSeek | DeepSeek 兼容 OpenAI API 格式 |
| 对话存储 | idb-keyval（IndexedDB） | 持久化对话历史，API 简单 |

---

## 游戏清单

### 独立游戏

| 游戏 | 规则 | 决策树 | 计分器 |
|------|:----:|:------:|:------:|
| 德州扑克 | ✅ | ✅ | — |
| TACTA | ✅ | ✅ | ✅ |
| 卡坦岛 | ✅ | ✅ | ✅ |
| 卡卡颂 | ✅ | ✅ | ✅ |
| 现代艺术 | ✅ | ✅ | ✅ |
| 海盐折纸 | ✅ | ✅ | ✅ |
| 摩天大楼 (GoTown) | ✅ | ✅ | — |
| 荒野之王 (Just Wild) | ✅ | ✅ | ✅ |
| 风声再临 | ✅ | ✅ | — |
| Cabo | ✅ | ✅ | ✅ |
| 群星二十一 | ✅ | — | — |
| 榴莲教练的大拳馆 | ✅ | — | — |

### 游戏系列

| 系列 | 游戏 | 类型 | 规则 | 决策树 | 计分器 |
|------|------|------|:----:|:------:|:------:|
| UNO | UNO | 本体 | ✅ | ✅ | ✅ |
| | UNO Flip | 变体 | ✅ | ✅ | ✅ |
| | UNO No Mercy | 变体 | ✅ | ✅ | ✅ |
| 脏小猪 | 脏小猪 | 本体 | ✅ | ✅ | — |
| | 小猪选美 | DLC（需本体） | ✅ | — | — |
| 三国杀 | 三国杀 | 本体 | ✅ | ✅ | — |
| | 不臣之君 | DLC（需本体） | ✅ | — | — |
| 爆炸猫 | 爆炸猫（红盒版） | 本体 | ✅ | ✅ | — |
| | 爆炸猫：黑盒版 | 变体（可独立） | ✅ | — | — |
| 璀璨宝石 | 璀璨宝石 | 本体 | ✅ | — | ✅ |
| | 璀璨宝石：宝可梦版 | 变体（可独立） | ✅ | — | ✅ |
| 海盐折纸 | 海盐折纸 | 本体 | ✅ | ✅ | ✅ |
| | 盐趣倍增 | DLC（需本体） | ✅ | — | — |
| 卡坦岛 | 卡坦岛 | 本体 | ✅ | ✅ | ✅ |
| | 中国版图 | 变体（可独立） | ✅ | — | ✅ |

---

## 项目结构

```
content/games/
├── index.json                    # 游戏注册表（slug 数组）
├── catan/
│   ├── meta.json                 # 游戏元数据
│   ├── score.json                # 可选：计分器配置
│   ├── zh/{rules.md, flow.json}  # 中文规则 + 可选决策树
│   └── en/{rules.md, flow.json}  # 英文规则 + 可选决策树
└── ...（共 26 款游戏）

src/
├── app/[locale]/                 # 页面路由
├── components/
│   ├── home/                     # GameCard, GameFamilyCard, GameCardGrid, Sidebar, HeroBanner
│   ├── game/                     # GameHeader, MarkdownRenderer, DecisionTree, ExportButton, RelatedGames
│   ├── game/score/               # ScoreTracker, VPTracker, RoundTracker, CumulativeTracker, PlayerSetup
│   ├── chat/                     # LLM 对话组件
│   └── layout/                   # Header, Footer, BackToTop
├── lib/content/                  # 内容层（Repository + Factory 模式）
├── lib/score/                    # 计分器（score-storage + useScoreState hook）
└── types/                        # TypeScript 类型定义
```

---

## 内容数据模型

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

| 字段 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `name` | `{en, zh}` | ✅ | 游戏名称 |
| `players` | `string` | ✅ | 玩家人数范围 |
| `duration` | `string` | ✅ | 游戏时长 |
| `difficulty` | `"easy" \| "medium" \| "hard"` | ✅ | 难度等级 |
| `tags` | `string[]` | ✅ | 标签 |
| `category` | `string` | ✅ | 分类（board / card / party 等） |
| `family` | `string` | ❌ | 所属系列 ID |
| `familyOrder` | `number` | ❌ | 系列内排序（0 = 本体） |
| `variantType` | `"base" \| "expansion" \| "variant"` | ❌ | 本体 / 扩展 / 变体 |
| `requiresBase` | `boolean` | ❌ | 是否需要本体才能游玩 |

### flow.json（决策树）

```json
{
  "startNode": "setup",
  "nodes": {
    "setup": {
      "title": { "en": "Game Setup", "zh": "游戏准备" },
      "content": "将棋盘放在桌子中央...（Markdown）",
      "options": [
        { "label": { "en": "Your Turn", "zh": "轮到你了" }, "next": "turn" },
        { "label": { "en": "Scoring", "zh": "计分方式" }, "next": "scoring" }
      ]
    }
  }
}
```

本质是**有向图**：每个节点是一个规则片段 + 若干跳转选项。flow.json 为可选，不提供则页面不显示交互入口。

---

## 路由设计

| URL | 描述 |
|-----|------|
| `/` | → 重定向至 `/en` |
| `/en` `/zh` | 首页：游戏卡片网格 + 全局 AI 对话 |
| `/en/games/catan` | 规则页：GameHeader + 规则正文 + 导出 + 相关游戏 + 对话 |
| `/en/games/catan/flow` | 交互式决策树（仅 flow.json 存在时生成） |
| `/en/games/catan/score` | 计分器（仅 score.json 存在时生成） |

---

## 页面功能

### 首页

- 标题横幅：站点名称 + 副标题 + 游戏数量徽章
- 卡片网格布局，按英文名字母排序，支持按分类和标签筛选
- 桌面端左侧 Sidebar + 右侧网格，移动端水平滚动筛选条
- 卡片根据分类自动适配布局（board → 横向宽卡，card → 纵向高卡）
- 同系列游戏以堆叠卡片效果展示，右上角 `+N` 徽章，点击展开变体/DLC 列表

### 游戏规则页

- GameHeader：标题、人数、时长、难度、标签
- 操作按钮：交互式决策树（如有）+ 计分器（如有）+ 导出（PDF / Markdown）
- MarkdownRenderer：渲染规则正文
- RelatedGames：同系列游戏导航（如有 family 分组）
- ChatToggle：右下角 LLM 对话，支持游戏限定 / 全局模式切换

### 计分器

独立页面 `/[locale]/games/[slug]/score/`，仅有 `score.json` 的游戏会生成此页面。

| 类型 | 适用游戏 | 说明 |
|------|---------|------|
| `victory-points` | 卡坦岛、璀璨宝石、荒野之王 | 按分类 +/- 计分，显示总和与进度条 |
| `rounds` | 现代艺术、TACTA | 每轮输入分数，显示历史轮次和累计 |
| `cumulative` | UNO 系列、海盐折纸、Cabo | 多轮累计，排行榜 + 历史记录 |

功能：
- 玩家管理：动态添加/删除，自定义名称和颜色
- 数据持久化：IndexedDB 自动保存，刷新不丢失
- 到达目标分时高亮胜利者

### 交互式决策树

- 双栏布局：左侧侧边栏目录 + 右侧内容区
- 导航：面包屑、步骤指示器（N / Total）、返回 / 重新开始
- 已访问节点和选项有视觉标记
- 移动端侧边栏自动折叠

### 规则导出

| 格式 | 实现方式 |
|------|---------|
| PDF | 新窗口渲染排版优化的 HTML，调用浏览器 `window.print()` |
| Markdown | 前端 Blob 下载原始 `.md` 文件 |

---

## LLM 对话

| 维度 | 方案 |
|------|------|
| API | DeepSeek API（OpenAI 兼容格式） |
| base_url | `https://api.deepseek.com` |
| 模型 | `deepseek-v4-pro` |
| API Key | 用户手动填写，存入 `localStorage` |
| 首页对话 | **全局模式**：LLM 通过 tool call 拉取任意游戏规则 |
| 游戏页对话 | **游戏限定模式**：system prompt 预载完整规则 |
| 模式切换 | 游戏页可切换为全局模式，首页固定全局（无切换按钮） |
| 对话历史 | IndexedDB，全局和每个游戏各独立一份，模式切换不丢失 |

---

## 设计模式

| 模式 | 应用位置 | 目的 |
|------|---------|------|
| **Repository** | `GameRepository.ts` | 统一封装文件系统内容访问 |
| **Factory** | `GameFactory.ts` | 组装 Game 领域对象，分离构造与数据访问 |
| **Strategy** | `GlobalChatStrategy` / `GameChatStrategy` | 不同对话范围的 prompt 和 tool 定义 |
| **Strategy** | `VPTracker` / `RoundTracker` / `CumulativeTracker` | 不同计分模式的 UI 实现 |
| **Adapter** | `DeepSeekAdapter.ts` | 隔离 LLM 提供商，方便替换 |
| **Context+Provider** | `ChatProvider.tsx` | 统一管理消息、流式状态、API Key |

---

## 多语言

- 当前：中文 + 英文
- UI 文案：`messages/{locale}.json`
- 游戏内容：`content/games/{slug}/{locale}/`
- 扩展语言只需新建对应 locale 目录

---

## 部署

- 平台：GitHub Pages
- CI：GitHub Actions（`actions/deploy-pages`）
- next.config：`trailingSlash: true`

---

## 关键技术决策

1. **构建时同步读取文件** — `fs.readFileSync` 仅在 `next build` 时执行，21 款游戏无性能问题
2. **`dangerouslyAllowBrowser: true`** — API Key 由用户提供且无服务端，显式启用浏览器端调用
3. **Tool call 循环上限** — 最多 5 轮迭代，防止无限循环
4. **无 middleware** — next-intl middleware 与 `output: 'export'` 不兼容，使用 `[locale]` 目录路由
5. **`trailingSlash: true`** — GitHub Pages 子目录路由兼容的必要配置
6. **游戏系列分组** — `family` 字段实现逻辑关联，`familyOrder` 控制排序，`variantType` 区分类型
7. **规则导出** — PDF 走浏览器原生打印，Markdown 走 Blob 下载，零外部依赖

---

## 添加新游戏

详细指南请参阅 [`.cursor/skills/add-game/SKILL.md`](.cursor/skills/add-game/SKILL.md)，涵盖独立游戏、DLC、扩展包、变体的完整添加流程。

快速步骤：

1. 在 `content/games/` 下创建目录，包含 `meta.json`、`en/rules.md`、`zh/rules.md`
2. 可选：添加 `en/flow.json` 和 `zh/flow.json` 提供交互式决策树
3. 可选：添加 `score.json` 提供计分器（见下方格式）
4. 在 `content/games/index.json` 中注册 slug
5. 如属于某个系列，在 `meta.json` 中添加 `family`、`familyOrder`、`variantType` 字段
6. 运行 `npm run build` 验证构建通过

### score.json（计分器配置）

```json
{
  "type": "victory-points | rounds | cumulative",
  "direction": "high-wins | low-wins",
  "target": 10,
  "targetByPlayers": { "2": 40, "3": 35, "4": 30 },
  "players": { "min": 3, "max": 4 },
  "categories": [
    { "id": "village", "name": { "en": "Village", "zh": "村庄" }, "value": 1, "max": 5 }
  ],
  "rounds": 4,
  "startingScore": 100,
  "unit": { "en": "pts", "zh": "分" }
}
```

| 字段 | 说明 |
|------|------|
| `type` | `victory-points`（按分类加减）/ `rounds`（按轮次记录）/ `cumulative`（多轮累计） |
| `direction` | `high-wins`（高分赢）/ `low-wins`（低分赢，如 Cabo） |
| `target` | 目标分数（到达时提示胜利） |
| `targetByPlayers` | 按人数设定不同目标 |
| `players` | 支持的人数范围 |
| `categories` | VP 类型的计分分类（每项含 id、名称、分值、可选上限） |
| `rounds` | 回合制总轮数 |
| `startingScore` | 回合制起始分数 |
| `unit` | 分数单位显示文字 |
