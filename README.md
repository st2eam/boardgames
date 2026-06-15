# The Game Shelf — 桌游规则参考站

一个可扩展的桌游规则参考网站，覆盖 21 款现代桌游（含扩展/变体），支持中英双语，响应式多端适配，集成 LLM 对话查询，纯静态站点部署到 GitHub Pages。

## 功能特性

- **21 款游戏规则**：经过网络验证的中英双语完整规则
- **交互式决策树**：15 款游戏提供分步交互流程，含侧边栏目录导航
- **游戏系列分组**：UNO、脏小猪、三国杀、爆炸猫等系列以堆叠卡片效果展示
- **DLC / 变体支持**：小猪选美、不臣之君、爆炸猫黑盒版等扩展内容
- **规则导出**：支持导出为 PDF 或下载 Markdown 原文
- **LLM 对话**：基于 DeepSeek API 的规则问答助手（全局 + 游戏限定）
- **中英双语**：完整的 i18n 支持，含 UI 文案和游戏内容

## 技术栈

- **框架**：Next.js 16 (App Router) + 静态导出
- **样式**：Tailwind CSS v4
- **i18n**：next-intl
- **内容**：Markdown + JSON（文件系统）
- **LLM**：OpenAI SDK → DeepSeek API

## 快速开始

```bash
# 安装依赖（需要 Node.js >= 20.9.0）
npm install

# 启动开发服务器
npm run dev

# 构建静态站点
npm run build
```

## 项目结构

```
content/games/
├── index.json                    # 游戏注册表
├── catan/
│   ├── meta.json                 # 游戏元数据（含 family 分组信息）
│   ├── zh/{rules.md, flow.json}  # 中文规则 + 决策树
│   └── en/{rules.md, flow.json}  # 英文规则 + 决策树
└── ...

src/
├── app/[locale]/                 # 页面路由
├── components/
│   ├── home/                     # 首页（GameCard, GameFamilyCard, GameCardGrid, Sidebar）
│   ├── game/                     # 游戏页（GameHeader, MarkdownRenderer, DecisionTree, ExportButton, RelatedGames）
│   ├── chat/                     # LLM 对话
│   └── layout/                   # 布局组件
├── lib/content/                  # 内容层（Repository + Factory 模式）
└── types/                        # TypeScript 类型定义
```

## 游戏清单

| 游戏 | 规则 | 决策树 | 系列 |
|------|:----:|:------:|------|
| 德州扑克 | ✅ | ✅ | — |
| TACTA | ✅ | ✅ | — |
| 卡坦岛 | ✅ | ✅ | — |
| 卡卡颂 | ✅ | ✅ | — |
| 现代艺术 | ✅ | ✅ | — |
| UNO | ✅ | ✅ | UNO 系列 |
| UNO Flip | ✅ | ✅ | UNO 系列 |
| UNO No Mercy | ✅ | ✅ | UNO 系列 |
| 脏小猪 | ✅ | ✅ | 脏小猪系列 |
| 小猪选美 (DLC) | ✅ | — | 脏小猪系列 |
| 三国杀 | ✅ | ✅ | 三国杀系列 |
| 不臣之君 (DLC) | ✅ | — | 三国杀系列 |
| 爆炸猫 | ✅ | ✅ | 爆炸猫系列 |
| 爆炸猫：黑盒版 | ✅ | — | 爆炸猫系列 |
| 海盐折纸 | ✅ | ✅ | — |
| 摩天大楼 (GoTown) | ✅ | ✅ | — |
| 荒野之王 (Just Wild) | ✅ | ✅ | — |
| 风声再临 | ✅ | ✅ | — |
| Cabo | ✅ | ✅ | — |
| 群星二十一 | ⬜ | — | — |
| 榴莲教练的大拳馆 | ⬜ | — | — |

## 添加新游戏

1. 在 `content/games/` 下创建目录，包含 `meta.json`、`en/rules.md`、`zh/rules.md`
2. 可选：添加 `en/flow.json` 和 `zh/flow.json` 提供交互式决策树
3. 在 `content/games/index.json` 中注册 slug
4. 如属于某个系列，在 `meta.json` 中添加 `family`、`familyOrder`、`variantType` 字段

## 部署

GitHub Pages 通过 GitHub Actions 自动部署，配置 `output: 'export'` + `trailingSlash: true`。
