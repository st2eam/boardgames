## Context

当前站点是一个纯静态导出的 Next.js 应用（`output: "export"`），所有游戏数据来自 `content/games/<slug>/meta.json`，通过 `GameRepository` 在构建时读取，由 `scripts/generate-game-mdata.mjs` 打包到 `public/data/games-index.json`。

站点没有后端、没有数据库、没有用户系统。价格数据需要以与现有内容系统一致的方式存储（文件级）。

## Goals / Non-Goals

**Goals:**
- 在 meta.json 中记录每款游戏的购买价格
- 提供一个隐藏页面，汇总展示花费统计
- 页面支持中英双语
- 保持纯静态架构，不引入后端

**Non-Goals:**
- 不做用户认证/登录系统
- 不做多币种支持（统一人民币）
- 不做购买日期/购买渠道等额外信息追踪
- 不在导航栏、侧边栏或任何可见位置添加入口
- 价格数据不需要从 games-index.json 中排除（静态站点无法真正隐藏数据，隐藏入口即可）

## Decisions

### 1. 价格字段存储方式

**选择**: 在 `meta.json` 中新增 `price?: number` 字段，单位为人民币元。

**替代方案**: 单独维护一个 `prices.json` 文件集中管理。

**理由**: 跟随现有的去中心化内容结构（每个游戏一个目录），保持一致性。price 是游戏的元数据，放在 meta.json 最自然。

### 2. 页面路由

**选择**: `/[locale]/costs/` — 一个独立的顶级路由，不挂在任何游戏下。

**替代方案**: `/[locale]/admin/costs/` 加 admin 前缀。

**理由**: 不需要 admin 命名空间（没有其他管理功能），简短的路由即可。无任何导航链接指向此页面，仅通过手动输入 URL 访问。

### 3. 数据流

**选择**: 复用现有的 `GameRepository` → `GameFactory` → `games-index.json` 数据流，price 字段随其他 meta 数据一起打包。页面在构建时静态生成。

**理由**: 不引入新的数据管道，改动最小。虽然 price 数据会出现在公开的 JSON 文件中，但没有 UI 入口，普通用户不会发现。

### 4. 图表库

**选择**: Recharts — React 原生图表库，基于 D3，自带流畅 SVG 动画。

**替代方案**: ECharts（功能最强但体积大 ~800KB）、Nivo（设计感强但 API 较复杂）、Chart.js（Canvas 渲染，React 集成一般）。

**理由**: Recharts 是声明式 React 组件，API 与 JSX 风格一致，SVG 渲染支持 CSS 过渡动画，体积适中（~150KB gzipped），且作为客户端组件在静态导出中正常工作。

### 5. 页面布局与图表设计

**选择**: 独立页面，三段式布局：

1. **顶部汇总卡片** — 总花费、游戏数量、均价，使用数字动画（计数器效果）
2. **图表区域** — 两列布局：
   - 饼图（PieChart）：按分类(category)的花费占比，带自定义 tooltip 和 label
   - 柱状图（BarChart）：按分类的花费金额对比，带渐变色填充和圆角
3. **底部明细表格** — 所有有价格的游戏，按价格降序，带斑马纹

图表使用站点现有的 warm wood/amber 色系，Recharts 的 `animationDuration` 和 `animationEasing` 实现丝滑入场动画。

**理由**: 图表让数据一目了然，饼图展示占比，柱状图展示绝对值，两者互补。Recharts 组件在页面加载时自带入场动画，不需要额外的动画库。

## Risks / Trade-offs

- **[数据可发现性]** price 数据存在于公开的 `games-index.json` 中，技术上可被发现 → 接受此风险，因为纯静态站点无法真正隐藏构建时数据，隐藏入口已满足需求
- **[维护成本]** 每次新增游戏需手动添加 price 字段 → price 是可选字段，不填不影响其他功能
- **[包体积]** Recharts 新增约 150KB gzipped → 仅在 costs 页面加载，通过 Next.js 代码分割不影响其他页面
