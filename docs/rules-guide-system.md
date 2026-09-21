# 单 Markdown 交互式规则系统

本文是 The Game Shelf 规则页交互的项目级协议。它规定内容作者如何在
`rules.md` 中声明交互，也规定开发者如何扩展解析器和共享渲染器。新增或
修改规则前，先读本文与 [`docs/rule-writing-style.md`](rule-writing-style.md)。

## 1. 目标与边界

规则页同时服务两种场景：

- **学习**：玩家按合理顺序读完概览、准备、回合和结算。
- **查阅**：玩家在牌桌边快速切到某个阶段、分类、表格或真实决策。

两种场景共用同一份文字来源。每个游戏、每种语言只有一份规则文件：

```text
content/games/<slug>/
├── meta.json
├── en/rules.md
└── zh/rules.md
```

不要新增或恢复以下旧架构：

- 根目录 `flow.json` 或 `guide.json`；
- `/[locale]/games/<slug>/flow/` 路由；
- 单独的“交互式流程”按钮、目录 chip 或营销页面；
- 在 React、JSON 或 `public/data/` 中复制规则正文。

交互是完整规则的渐进增强，不是第二份规则书。完整 Markdown 必须在完整
规则模式、打印、导出和无 JavaScript 回退中继续可读。

## 2. 数据流与代码边界

```text
content/games/<slug>/<locale>/rules.md
        │
        ├── GameRepository.getGameRules()
        │
        ├── parseRuleDocument() ──► RuleDocument AST
        │                              │
        └──────────────────────────────┴──► games/[slug]/page.tsx
                                             │
                                             └── RuleDocumentExperience
```

- `GameRepository` 负责从 `content/games/` 读取文件。
- `GameFactory` 组装 `Game.rules` 与 `Game.ruleDocument`。
- `parseRuleDocument` 使用 Markdown AST + GFM，校验标题树和交互图，并产出
  可序列化的 `RuleDocument`。
- `src/features/rules/RuleDocumentExperience.tsx` 只保存客户端交互状态：
  当前模式、Tab/侧边栏项目、决策历史和详情开关。
- `MarkdownRenderer` 负责普通 Markdown、表格、图片和项目已有短码。
- `public/data/` 是构建生成的数据平面，不能手改。

共享类型位于 `src/types/game.ts`：`RuleDocument`、`RuleSection`、
`RuleSidebar`、`RuleListItem`、`RuleChoice` 和 `RuleSectionUi`。新增规则形态
前先判断是否可以组合现有结构；只有真正可复用的变化才扩展类型、解析器和
渲染器。

## 3. Markdown 基础语法

### 3.1 标题与稳定 ID

每个 H2–H4 前都必须紧邻一个 `rule-section` 标记：

```md
<!-- rule-section: turn -->
## 回合流程
```

约束：

- ID 只能使用 `[a-z0-9-]`，且在单份文档内全局唯一；
- 中英文使用完全相同的 ID、标题层级和顺序；
- 标题不能从 H2 跳到 H4；H5/H6 不属于规则协议；
- ID 发布后不要因翻译或标题改写而更换；
- 标题之间的标记必须连续，不能被空白正文或其他 HTML 注释打断。

正文中未标记的普通 Markdown 仍然会显示，但不会自动变成交互组件。

### 3.2 交互指令总表

| 规则形态 | 指令 | 默认交互 | 适合内容 |
|---|---|---|---|
| 并列主题 | `rule-ui: tabs [default=<id>]` | Tab + 当前面板 | 多种并列行动、牌型或阶段 |
| 有序步骤 | `rule-ui: sidebar [default=<id>]` + 有序列表 | 步骤轨、计数、前后导航 | 摆放版图、轮次准备 |
| 自由分类 | `rule-ui: sidebar` + 无序列表 | 分类侧边栏，不伪造进度 | 组件、行动、FAQ、策略 |
| 状态分支 | `rule-ui: decision start=<id>` + `rule-choices` | 选项、返回、重新开始 | 牌型判断、结算分支 |
| 低频补充 | `rule-details` | 摘要常显，细节展开 | 例外、示例、原因 |

只在降低查阅成本时使用指令。单条内容、短背景、普通组件清单和简单 FAQ
保持普通 Markdown；不要为了“看起来互动”而包一层 Tab。

## 4. Tabs

`tabs` 作用于紧随其后的父标题。父标题的直属子标题就是 Tab；第一个子
标题前的内容是所有 Tab 共用的介绍。

```md
<!-- rule-ui: tabs default=roll -->
<!-- rule-section: turn -->
## 回合流程

所有玩家按以下顺序完成自己的回合。

<!-- rule-section: roll -->
### 掷骰子

<!-- rule-section: trade -->
### 交易
```

约束：

- 至少两个直属子标题；`default` 必须引用直属子标题；
- 不允许 Tab 套 Tab；交互嵌套总深度最多两层；
- 标签用短标题，不把完整段落塞进标签；
- 窄屏 Tab 轨在自身容器内横向滚动，页面不能横向溢出；
- 键盘焦点位于 Tab 时支持左右/上下、Home、End；不要监听整页方向键。

## 5. 侧边栏与步骤

`sidebar` 只转换指令后紧邻的一个列表。每项必须有 `rule-item` 标记，且
内容的第一个段落必须以加粗短标签开始：

```md
<!-- rule-ui: sidebar default=setup-board -->
1. <!-- rule-item: setup-board -->
   **摆放版图**

   把版图、资源和公共组件放到桌面上。

2. <!-- rule-item: setup-player -->
   **准备玩家组件**

   每位玩家领取对应颜色的组件。
```

- 有序列表表示必须依次完成的步骤：显示序号、当前位置以及上一步/下一步；
- 无序列表表示可以自由切换的分类：不显示假的时间进度；
- 每个侧边栏至少两项，ID 唯一，`default` 必须属于当前侧边栏；
- 一份规则书的“快速查阅”主题最多一个，固定 ID 为 `topic-guide`；
- 图片、表格、嵌套列表和 `rule-details` 都可以放在项目正文中；
- 完成当前动作所必需的条件不能藏在折叠详情里。

## 6. 决策助手

决策只用于“玩家当前状态不同，下一条规则也不同”的真实分支。普通主题
目录、FAQ 和线性步骤不能伪装成决策树。

```md
<!-- rule-ui: decision start=hand-type -->
<!-- rule-section: strategy -->
## 牌型助手

<!-- rule-section: hand-type -->
### 你拿到什么牌型？

<!-- rule-choices -->
- [硬牌](#hard-total)
- [软牌](#soft-total)

<!-- rule-section: hard-total -->
### 硬牌点数

<!-- rule-section: soft-total -->
### 软牌点数
```

约束：

- `start` 必须是父标题的直属子标题；
- `rule-choices` 后必须紧跟非空无序内部链接列表；
- 目标必须是同一决策中的直属节点；每个节点都必须从起点可达；
- 允许循环；没有 `rule-choices` 的节点是终点；
- 决策不能再套决策；可以嵌套一组侧边栏，但不能增加第三层交互。

## 7. 详情、媒体和完整阅读

```md
先给出玩家必须知道的结论。

<!-- rule-details -->

这里写罕见例外、完整示例或规则原因。
```

`rule-details` 前的摘要默认可见，之后的内容通过原生 disclosure 展开。导出
和完整规则模式会移除所有作者标记；不要在导出正文中依赖这些注释。

图片必须服务于动作、组件或状态变化，替代文字要准确。中英文图片路径和
出现顺序必须一致，并且所有图片都位于 `/images/rules/<slug>/`。表格只用于
比较、费用、数值和计分；宽表格应在自身容器内滚动。

## 8. 页面行为与无障碍

`RuleDocumentExperience` 默认打开交互指南，并提供完整规则模式：

- 指南模式渲染 AST 的 Tab、侧边栏和决策；
- 完整模式渲染清理后的原始 Markdown；
- 打印和无 JavaScript 回退始终展开完整规则；
- 交互状态只存在当前页面会话，不写入 localStorage；
- 深链规范为 `#rule-<id>`，旧的 `#guide-module--item` 兼容解析为末尾稳定 ID；
- 交互切换用 `replaceState`，避免每次点 Tab 都污染历史记录；
- 失效深链显示可恢复的提示和“返回交互指南”入口。

控件要求：

- 使用原生 `button`、`nav`、标题、列表、表格和 `details` 语义；
- 触控目标约 44px，焦点环清晰；
- disclosure 提供 `aria-expanded` 与 `aria-controls`；
- Tab 提供 `role=tablist/tab/tabpanel`、`aria-selected` 和正确关联；
- 有序当前步骤可用 `aria-current="step"`；
- 只在焦点位于对应控件时绑定方向键；
- 活动面板摘要使用 `aria-live="polite"`，不要播报整页；
- 动画控制在约 150–250ms，并遵守 `prefers-reduced-motion`；
- 移动端使用横向轨或全宽面板，禁止页面级横向溢出。

视觉上继续使用 `primary`、`primary-dark`、`accent`、`surface`、`border`、
`font-heading`、`font-body`、`shadow-card`。不要引入新调色板、暗色模式或第三方
组件库。

## 9. 校验与开发流程

内容改动：

1. 先在中英文规则中审查概览、目标、准备、回合、决策、参考、计分、终局和
   例外；
2. 先写可连续阅读的 Markdown，再添加最少量交互标记；
3. 同步 ID、层级、顺序、默认项、决策图、数字和图片顺序；
4. 运行：

   ```bash
   node scripts/validate-game-content.mjs
   ```

   校验器会检查 74 款游戏的 148 份文档、标题树、双语结构、图片、交互图，
   并拒绝遗留的 `flow.json` / `guide.json`。

代码改动：

```bash
npm run lint
npm run build
```

只有 BBGE 对局或插件发生变化时才运行 `npm run test:bbge`。规则页改动还应
检查默认状态、Tab/侧边栏切换、键盘焦点、深链、完整规则、打印、移动端和
无 JavaScript 回退。完成验证后按 `.cursor/rules/verify-then-push.mdc` 提交并推送。

## 10. 新增或迁移游戏的最小模板

```md
# Game Rules

<!-- rule-section: overview -->
## Overview

一句话说明玩家是谁、目标是什么。

<!-- rule-section: objective -->
### Objective

先说怎么赢，再补平手和终局条件。

<!-- rule-section: setup -->
## Setup

<!-- rule-ui: sidebar default=setup-board -->
1. <!-- rule-item: setup-board -->
   **Place the board**

   …

<!-- rule-ui: tabs default=roll -->
<!-- rule-section: turn -->
## Turn

<!-- rule-section: roll -->
### Roll

<!-- rule-section: action -->
### Take an action
```

实际使用时以规则形态为准：不需要交互的内容不要套模板。迁移旧内容时，先
把 flow 节点和 guide 编排吸收到两种语言的 Markdown，再删除旧 JSON；不要把
旧节点文本原样复制成第三份来源。
