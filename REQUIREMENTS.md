# 桌游规则说明网站 — 需求文档

## 项目概述

一个可扩展的桌游规则参考网站，覆盖 21 款现代桌游（含扩展/变体），支持中英双语，响应式多端适配，集成 LLM 对话查询，纯静态站点部署到 GitHub Pages。

---

## 游戏清单

### 独立游戏
- 德州扑克
- TACTA
- 群星二十一
- 摩天大楼 (GoTown)
- 荒野之王 (Just Wild)
- 榴莲教练的大拳馆
- 卡坦岛
- 海盐折纸
- 现代艺术
- 卡卡颂
- 风声再临
- Cabo

### 游戏系列（含 DLC / 变体）
- UNO 系列：UNO（本体）、UNO Flip（变体）、UNO No Mercy（变体）
- 脏小猪系列：脏小猪（本体）、小猪选美（DLC，需本体）
- 三国杀系列：三国杀（本体）、不臣之君（DLC，需本体）
- 爆炸猫系列：爆炸猫（本体/红盒版）、爆炸猫黑盒版（变体，可独立游玩）

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
| 深色模式 | 不需要 | — |
| 视频 | 不需要 | — |
| 跨游戏搜索 | 不需要（通过 LLM 对话替代） | — |

---

## 内容组织

```
content/games/
├── index.json                    # 游戏注册表（slug 数组）
├── catan/
│   ├── meta.json                 # 游戏元数据
│   ├── zh/{rules.md, flow.json}  # 中文规则 + 可选决策树
│   └── en/{rules.md, flow.json}  # 英文规则 + 可选决策树
├── uno/
└── ...（共 21 款游戏）
```

### meta.json 字段

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
| `category` | `string` | ✅ | 分类（board/card/party 等） |
| `family` | `string` | ❌ | 所属系列 ID |
| `familyOrder` | `number` | ❌ | 系列内排序（0 = 本体） |
| `variantType` | `"base" \| "expansion" \| "variant"` | ❌ | 本体/扩展/变体 |
| `requiresBase` | `boolean` | ❌ | 是否需要本体才能游玩 |

### 决策树数据模型（flow.json）

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
|---|---|
| `/` | → 重定向至 `/en` |
| `/en` `/zh` | 首页：游戏卡片网格 + 全局 AI 对话 |
| `/en/games/catan` | 卡坦岛规则页（GameHeader + Markdown 内容 + 导出 + 游戏限定对话） |
| `/en/games/catan/flow` | 卡坦岛交互式决策树（仅 flow.json 存在时生成） |

---

## 首页展示方式

**卡片网格布局**：
- 支持按分类（category）和标签（tags）筛选
- 桌面端左侧 Sidebar + 右侧网格，移动端水平滚动筛选条
- 卡片根据分类自动适配布局（board → 横向宽卡，card → 纵向高卡）
- **游戏系列分组**：同系列游戏以堆叠卡片效果展示，右上角显示 `+N` 徽章，点击展开显示所有变体/DLC 列表

---

## 游戏规则页

- GameHeader：标题、人数、时长、难度、标签
- 操作按钮：交互式决策树（如有）+ 导出（PDF / Markdown）
- MarkdownRenderer：渲染规则正文
- RelatedGames：同系列游戏导航（如有 family 分组）
- ChatToggle：右下角 LLM 对话

### 规则导出

| 格式 | 实现方式 |
|------|---------|
| PDF | 新窗口渲染排版优化的 HTML，调用浏览器 `window.print()` |
| Markdown | 前端 Blob 下载原始 `.md` 文件 |

---

## 交互式流程（决策树）

- 15 款游戏已配备完整的交互式决策树
- **双栏布局**：左侧侧边栏目录 + 右侧内容区
- **导航功能**：面包屑、步骤指示器（N / Total）、返回/重新开始
- **访问追踪**：已访问节点和选项有视觉标记
- **响应式**：移动端侧边栏自动折叠

---

## LLM 对话设计

| 维度 | 方案 |
|---|---|
| API | DeepSeek API（OpenAI 兼容格式） |
| base_url | `https://api.deepseek.com` |
| 模型 | `deepseek-v4-pro` |
| API Key | 用户手动填写，存入 `localStorage` |
| 首页对话 | **全局**：LLM 通过 tool call（`get_game_rules`）拉取任意游戏规则 |
| 游戏页对话 | **限定当前游戏**：system prompt 预载该游戏完整规则，无需 tool |
| 对话历史 | IndexedDB 存储，全局和每个游戏各独立一份 |
| 入口 | 右下角悬浮按钮 → 展开对话框 |

### 对话存储 Key 设计

| Key 模式 | 示例 |
|---|---|
| `chat:global:{locale}` | `chat:global:en` |
| `chat:game:{slug}:{locale}` | `chat:game:catan:zh` |
| (localStorage) `deepseek-api-key` | 用户填写的 key |

---

## 设计模式

| 模式 | 应用位置 | 目的 |
|---|---|---|
| **Repository** | `GameRepository.ts` | 统一封装文件系统内容访问，方便后续迁移到 CMS |
| **Factory** | `GameFactory.ts` | 组装 Game 领域对象，分离构造逻辑与数据访问 |
| **Strategy** | `GlobalChatStrategy.ts` / `GameChatStrategy.ts` | 不同对话范围的 system prompt 和 tool 定义 |
| **Adapter** | `DeepSeekAdapter.ts` | 隔离 LLM 提供商，方便替换为 Anthropic 或本地模型 |
| **Context+Provider** | `ChatProvider.tsx` | 统一管理消息、流式状态、API Key、对话范围 |

---

## 多语言

- 当前：中文 + 英文
- 扩展：按 locale 分目录存放内容，添加语言只需新建 `{locale}/` 目录
- UI 文案通过 `messages/{locale}.json` 管理
- 游戏内容通过 `content/games/{slug}/{locale}/` 管理

---

## 部署

- 平台：GitHub Pages
- CI：GitHub Actions（`actions/deploy-pages`）
- next.config：`trailingSlash: true`（GitHub Pages 子目录路由兼容）

---

## 关键技术决策

1. **构建时同步读取文件** — `fs.readFileSync` 仅在 `next build` 时执行，21 款游戏无性能问题
2. **`dangerouslyAllowBrowser: true`** — OpenAI SDK 默认阻止浏览器端调用，因 API Key 由用户提供且无服务端，显式启用
3. **Tool call 循环上限** — 最多 5 轮迭代，防止无限循环
4. **无 middleware** — next-intl middleware 与 `output: 'export'` 不兼容，使用 `[locale]` 目录路由 + `setRequestLocale`
5. **`trailingSlash: true`** — GitHub Pages 正确服务子目录路由的必要配置
6. **游戏系列分组** — 通过 `family` 字段实现同系列游戏的逻辑关联，`familyOrder` 控制展示排序，`variantType` 区分本体/扩展/变体
7. **规则导出** — PDF 使用浏览器原生打印，Markdown 使用 Blob 下载，零外部依赖
