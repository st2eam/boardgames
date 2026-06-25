## ADDED Requirements

### Requirement: Price field in game metadata
系统 SHALL 支持在每款游戏的 `meta.json` 中定义可选的 `price` 字段（数字类型，单位人民币元）。

#### Scenario: Game with price defined
- **WHEN** `meta.json` 包含 `"price": 129`
- **THEN** 该游戏的 `GameMeta` 对象包含 `price: 129`，且在 `games-index.json` 中输出

#### Scenario: Game without price
- **WHEN** `meta.json` 不包含 `price` 字段
- **THEN** 该游戏的 `GameMeta` 对象中 `price` 为 `undefined`，不影响任何现有功能

### Requirement: Hidden costs page route
系统 SHALL 在 `/[locale]/costs/` 路由下提供一个静态页面，无任何导航入口指向该页面。

#### Scenario: Direct URL access
- **WHEN** 用户在浏览器地址栏输入 `/en/costs/` 或 `/zh/costs/`
- **THEN** 页面正常加载并显示花费统计内容

#### Scenario: No navigation entry
- **WHEN** 用户浏览网站的首页、游戏详情页、侧边栏、header、footer
- **THEN** 不存在任何链接或按钮指向 costs 页面

### Requirement: Cost summary statistics
Costs 页面 SHALL 展示以下汇总统计（仅计算有 price 的游戏）：

#### Scenario: Summary cards display
- **WHEN** 页面加载完成
- **THEN** 页面顶部展示：总花费（所有 price 之和）、有价格的游戏数量、平均单价（总花费 / 游戏数量）

#### Scenario: No games have price
- **WHEN** 所有游戏的 meta.json 都没有 price 字段
- **THEN** 汇总统计显示 ¥0 / 0 款 / ¥0 均价，列表为空

### Requirement: Category breakdown
Costs 页面 SHALL 按游戏分类（category）展示花费分布。

#### Scenario: Multiple categories with prices
- **WHEN** board 类游戏总价 ¥500，card 类游戏总价 ¥300
- **THEN** 页面展示每个分类的小计金额和游戏数量

### Requirement: Detailed game price list
Costs 页面 SHALL 展示每款有价格的游戏的明细列表。

#### Scenario: Game list display
- **WHEN** 页面加载完成且有游戏包含 price
- **THEN** 列表展示每款游戏的名称（当前语言）、分类、价格，按价格降序排列

### Requirement: Bilingual support
Costs 页面 SHALL 支持中英双语，与站点整体语言切换保持一致。

#### Scenario: Chinese locale
- **WHEN** 用户访问 `/zh/costs/`
- **THEN** 页面标题、标签、统计文案均为中文

#### Scenario: English locale
- **WHEN** 用户访问 `/en/costs/`
- **THEN** 页面标题、标签、统计文案均为英文
