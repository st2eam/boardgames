## 1. 依赖安装

- [x] 1.1 安装 Recharts：`npm install recharts`

## 2. 数据层：类型与构建脚本

- [x] 2.1 在 `src/types/game.ts` 的 `GameMeta` 接口中新增 `price?: number` 字段
- [x] 2.2 在 `src/types/game.ts` 的 `GameSummary` 接口中新增 `price?: number` 字段
- [x] 2.3 确认 `scripts/generate-game-data.mjs` 已透传 meta.json 中的所有字段（当前逻辑是 spread 整个 meta 对象，price 会自动包含，无需改动）

## 3. 内容数据：为游戏添加价格

- [x] 3.1 为所有 31 款游戏的 `content/games/<slug>/meta.json` 添加 `price` 字段（数字，人民币元）。如暂不确定价格的游戏可先不添加

## 4. i18n：新增 costs 页面文案

- [x] 4.1 在 `messages/en.json` 中新增 `costs` 命名空间，包含：页面标题（"Cost Tracker"）、总花费（"Total Spent"）、游戏数量（"Games with Price"）、均价（"Average Price"）、按分类（"By Category"）、游戏名（"Game"）、分类（"Category"）、价格（"Price"）、无数据提示（"No price data available"）、饼图标题（"Spending by Category"）、柱状图标题（"Category Comparison"）
- [x] 4.2 在 `messages/zh.json` 中新增对应的 `costs` 命名空间中文翻译

## 5. 页面组件：隐藏的花费统计页

- [x] 5.1 创建 `src/app/[locale]/costs/page.tsx`，服务端组件负责数据读取和布局
- [x] 5.2 创建 `src/components/costs/CostDashboard.tsx`，客户端组件（`"use client"`）含图表和动画
- [x] 5.3 确认页面在 header、footer、sidebar 等导航组件中无任何链接入口

## 6. 验证

- [x] 6.1 运行 `npm run build` 确认静态导出成功，costs 页面正常生成
- [ ] 6.2 手动访问 `/en/costs/` 和 `/zh/costs/` 确认页面功能和图表动画正常
