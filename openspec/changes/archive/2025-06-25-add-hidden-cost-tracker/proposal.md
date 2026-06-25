## Why

桌游是一项有成本的爱好——每款游戏都有购买价格，但目前网站没有任何地方记录和统计这些花费。作为站长，我想知道自己在桌游上总共花了多少钱、各类游戏的花费分布，但这些数据是私人的，不应暴露给普通访客。

## What Changes

- 在每款游戏的 `meta.json` 中新增可选的 `price` 字段（数字，单位元），记录购买价格
- 新增一个隐藏路由页面（如 `/en/costs/` 或 `/zh/costs/`），无任何导航入口，仅通过直接输入 URL 访问
- 该页面展示：总花费、游戏数量、平均单价、按分类(category)统计、按家族(family)统计、详细的游戏价格列表
- 页面跟随站点双语支持（en/zh）

## Capabilities

### New Capabilities
- `cost-tracker`: 隐藏的桌游花费统计页面，从 meta.json 读取价格数据，展示汇总和明细

### Modified Capabilities

（无现有 spec 需要修改）

## Impact

- **内容文件**: `content/games/<slug>/meta.json` — 新增可选 `price` 字段
- **类型定义**: `src/types/game.ts` — `GameMeta` 接口新增 `price?: number`
- **路由**: 新增 `src/app/[locale]/costs/page.tsx`
- **数据层**: `GameRepository` / `GameFactory` 需透传 price 字段
- **构建脚本**: `scripts/generate-game-mdata.mjs` 需包含 price 到输出数据
- **i18n**: `messages/en.json` 和 `messages/zh.json` 新增 costs 页面文案
