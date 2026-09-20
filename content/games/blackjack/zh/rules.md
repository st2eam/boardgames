# 21点规则
<!-- rule-section: overview -->
## 概述

21点（Blackjack）是一种赌场纸牌游戏，玩家与庄家对抗。目标是使手牌点数尽量接近21点而不超过。
<!-- rule-section: objective -->
## 游戏目标

在《21点》中，你是一名正和庄家对抗的赌场玩家。你的目标是在不爆牌的前提下尽量接近 21 点，并赢过庄家。
<!-- rule-section: components -->
## 组件

- 1-8 副标准52张扑克牌（赌场通常使用6-8副）
- 筹码用于下注
<!-- rule-section: card-values -->
## 牌面点数

![2–10 为面值，人头 10 点，A 为 1 或 11](/images/rules/blackjack/card-values.svg)
| 牌面 | 点数 |
|------|------|
| 2-10 | 面值 |
| J、Q、K | 10 |
| A | 1 或 11（取对手牌有利的值） |
<!-- rule-ui: tabs -->
<!-- rule-section: flow-intro -->
## 游戏流程

![A+6 再要 3 变成 20](/images/rules/blackjack/player-actions.svg)
<!-- rule-section: bet -->
### 1. 下注

发牌前，玩家在各自位置下注。
<!-- rule-section: deal -->
### 2. 初始发牌

- 每位玩家获得2张明牌
- 庄家获得1张明牌（门牌）和1张暗牌（底牌）
<!-- rule-section: natural -->
### 3. 天然21点（Blackjack）

如果玩家的前两张牌恰好为21点（A + 10点牌），称为"Blackjack"或"天然21点"，赔率为3:2（部分赌场为6:5）。若庄家也为Blackjack则为平局（Push）。
<!-- rule-section: player-actions -->
### 4. 玩家操作

玩家从左到右依次行动：

- **要牌（Hit）**：再取一张牌。可多次要牌，直到满意或爆牌。
- **停牌（Stand）**：保持当前手牌，不再取牌。
- **加倍（Double Down）**：加倍赌注，且只能再取一张牌后停牌。
- **分牌（Split）**：如前两张牌点数相同，可将其拆分为两手独立牌局，各下等额赌注。
- **投降（Surrender）**（若可用）：放弃当前手牌，取回一半赌注。
<!-- rule-section: bust -->
### 5. 爆牌

如果手牌总点数超过21，称为"爆牌（Bust）"——该玩家立即输掉赌注，无论庄家结果如何。
<!-- rule-section: dealer-turn -->
### 6. 庄家回合

所有玩家行动完毕后：

1. 庄家翻开底牌
2. 庄家点数 ≤ 16时必须要牌
3. 庄家点数 ≥ 17时必须停牌（部分规则：庄家在软17时要牌）
<!-- rule-section: determine-winner -->
### 7. 判定胜负

| 情况 | 结果 |
|------|------|
| 玩家爆牌 | 玩家输（庄家无需继续） |
| 庄家爆牌 | 所有未爆牌玩家赢 |
| 玩家 > 庄家 | 玩家赢（赔率1:1） |
| 玩家 = 庄家 | 平局（退还赌注） |
| 玩家 < 庄家 | 玩家输 |
| 玩家Blackjack | 赔率3:2 |
<!-- rule-section: hard-soft -->
## 硬牌与软牌

![软 17 的 A 仍可当 11](/images/rules/blackjack/hard-vs-soft.svg)
<!-- rule-ui: sidebar -->
- <!-- rule-item: hard-soft-item-1 -->
  **硬牌（Hard Hand）**：不含A的手牌，或A只能计为1的手牌（如 A+6+10 = 硬17）
- <!-- rule-item: hard-soft-item-2 -->
  **软牌（Soft Hand）**：含A且A计为11的手牌（如 A+6 = 软17）
<!-- rule-section: insurance -->
## 保险

当庄家明牌为A时，玩家可选择"保险"——额外下注最多为原始赌注的一半。若庄家为Blackjack，保险赔2:1；否则保险注输掉。
<!-- rule-section: basic-strategy -->
## 基本策略概要

基本策略通过数学最优决策最小化庄家优势，依据：
- 你的手牌点数（硬牌/软牌/对子）
- 庄家的明牌

核心原则：
- 永远分A和8
- 永远不分10和5
- 11点面对庄家2-10时加倍
- 硬17及以上停牌
- 硬8及以下要牌
<!-- rule-ui: decision start=flow-hand-type -->
<!-- rule-section: decision-guide-4 -->
## 决策助手

从这里快速跳到相关规则条目。

<!-- rule-section: flow-hand-type -->
### 你的手牌类型是？

先确定手牌类型，再查找最优操作。

<!-- rule-choices -->
- [硬牌（无A计为11）](#flow-hard-total)
- [软牌（A计为11）](#flow-soft-total)
- [对子（两张同点数牌）](#flow-pair-type)

<!-- rule-section: flow-hard-total -->
### 硬牌 — 你的点数？

选择你的硬牌点数范围。

<!-- rule-choices -->
- [硬8及以下](#flow-hard-8-less)
- [硬9](#flow-hard-9)
- [硬10](#flow-hard-10)
- [硬11](#flow-hard-11)
- [硬12](#flow-hard-12)
- [硬13-16](#flow-hard-13-16)
- [硬17及以上](#flow-hard-17-plus)

<!-- rule-section: flow-hard-8-less -->
### 硬8及以下

**永远要牌。**

硬8及以下时，再要一张牌不可能爆牌，任何牌都能改善手牌。

<!-- rule-section: flow-hard-9 -->
### 硬9 — 庄家明牌？

操作取决于庄家的明牌。

<!-- rule-choices -->
- [庄家3-6](#flow-hard-9-double)
- [庄家2、7-A](#flow-hard-9-hit)

<!-- rule-section: flow-hard-9-double -->
### 硬9 vs 庄家3-6

**加倍**（不允许加倍则要牌）。

庄家明牌较弱，大概率爆牌，此时加倍有利可图。

<!-- rule-section: flow-hard-9-hit -->
### 硬9 vs 庄家2、7-A

**要牌。**

庄家明牌较强，加倍风险过大。

<!-- rule-section: flow-hard-10 -->
### 硬10 — 庄家明牌？

硬10是很好的加倍手牌。

![2–10 为面值，人头 10 点，A 为 1 或 11](/images/rules/blackjack/card-values.svg)

<!-- rule-choices -->
- [庄家2-9](#flow-hard-10-double)
- [庄家10或A](#flow-hard-10-hit)

<!-- rule-section: flow-hard-10-double -->
### 硬10 vs 庄家2-9

**加倍。**

你很可能摸到20或21点，而庄家处于弱势。

<!-- rule-section: flow-hard-10-hit -->
### 硬10 vs 庄家10/A

**要牌。**

庄家可能也有强牌，不宜冒险加倍。

<!-- rule-section: flow-hard-11 -->
### 硬11

**永远加倍**（不允许则要牌）。

硬11是最佳加倍手牌——任何10点牌都能让你到21点。

<!-- rule-section: flow-hard-12 -->
### 硬12 — 庄家明牌？

硬12是首次可能爆牌的点数。

<!-- rule-choices -->
- [庄家4-6](#flow-hard-12-stand)
- [庄家2-3、7-A](#flow-hard-12-hit)

<!-- rule-section: flow-hard-12-stand -->
### 硬12 vs 庄家4-6

**停牌。**

庄家4-6是最弱的明牌，爆牌率极高。不要冒爆牌的风险。

<!-- rule-section: flow-hard-12-hit -->
### 硬12 vs 庄家2-3、7-A

**要牌。**

庄家2-3的爆牌率中等，庄家7-A大概率达到17+。你需要提升手牌。

<!-- rule-section: flow-hard-13-16 -->
### 硬13-16 — 庄家明牌？

「僵硬手牌」——无论如何都有较高爆牌风险。

<!-- rule-choices -->
- [庄家2-6](#flow-hard-13-16-stand)
- [庄家7-A](#flow-hard-13-16-hit)

<!-- rule-section: flow-hard-13-16-stand -->
### 硬13-16 vs 庄家2-6

**停牌。**

让庄家爆牌。弱明牌（2-6）下庄家必须要牌，爆牌风险很高。

<!-- rule-section: flow-hard-13-16-hit -->
### 硬13-16 vs 庄家7-A

**要牌**（若可投降，硬16面对9/10/A时投降）。

庄家大概率有17-21点。停牌的输面比要牌更大。

<!-- rule-section: flow-hard-17-plus -->
### 硬17及以上

**永远停牌。**

硬17及以上时，要牌爆牌风险过高。即使面对庄家A也应停牌。

<!-- rule-section: flow-soft-total -->
### 软牌 — 你的点数？

软牌含有一张计为11的A。选择你的点数。

![软 17 的 A 仍可当 11](/images/rules/blackjack/hard-vs-soft.svg)

<!-- rule-choices -->
- [软13-14（A+2、A+3）](#flow-soft-13-14)
- [软15-16（A+4、A+5）](#flow-soft-15-16)
- [软17（A+6）](#flow-soft-17)
- [软18（A+7）](#flow-soft-18)
- [软19-20（A+8、A+9）](#flow-soft-19-20)

<!-- rule-section: flow-soft-13-14 -->
### 软13-14 — 庄家明牌？

软13-14可以大幅改善且无爆牌风险。

<!-- rule-choices -->
- [庄家5-6](#flow-soft-13-14-double)
- [庄家2-4、7-A](#flow-soft-13-14-hit)

<!-- rule-section: flow-soft-13-14-double -->
### 软13-14 vs 庄家5-6

**加倍**（不允许则要牌）。

庄家非常可能爆牌，最大化收益。

<!-- rule-section: flow-soft-13-14-hit -->
### 软13-14 vs 其他

**要牌。**

不会爆牌，且需要改善这副弱牌。

<!-- rule-section: flow-soft-15-16 -->
### 软15-16 — 庄家明牌？

类似软13-14但稍强。

<!-- rule-choices -->
- [庄家4-6](#flow-soft-15-16-double)
- [庄家2-3、7-A](#flow-soft-15-16-hit)

<!-- rule-section: flow-soft-15-16-double -->
### 软15-16 vs 庄家4-6

**加倍**（不允许则要牌）。

庄家弱牌让你有加倍优势。

<!-- rule-section: flow-soft-15-16-hit -->
### 软15-16 vs 其他

**要牌。**

面对庄家强牌需要改善手牌。

<!-- rule-section: flow-soft-17 -->
### 软17 — 庄家明牌？

软17不应停牌——虽然是17但太弱。

<!-- rule-choices -->
- [庄家3-6](#flow-soft-17-double)
- [庄家2、7-A](#flow-soft-17-hit)

<!-- rule-section: flow-soft-17-double -->
### 软17 vs 庄家3-6

**加倍**（不允许则要牌）。

庄家弱势 + 你的灵活A使加倍正确。

<!-- rule-section: flow-soft-17-hit -->
### 软17 vs 庄家2、7-A

**要牌。**

软17输给大多数庄家结果。要牌改善——不会爆牌。

<!-- rule-section: flow-soft-18 -->
### 软18 — 庄家明牌？

软18是一手复杂的牌，操作取决于庄家明牌。

<!-- rule-choices -->
- [庄家2-6](#flow-soft-18-ds)
- [庄家7-8](#flow-soft-18-stand)
- [庄家9-A](#flow-soft-18-hit)

<!-- rule-section: flow-soft-18-ds -->
### 软18 vs 庄家2-6

面对3-6**加倍**，面对2**停牌**（不能加倍则停牌）。

庄家弱势——扩大优势。

<!-- rule-section: flow-soft-18-stand -->
### 软18 vs 庄家7-8

**停牌。**

18点面对庄家7-8大概率平局或赢。

<!-- rule-section: flow-soft-18-hit -->
### 软18 vs 庄家9-A

**要牌。**

18点面对庄家9-A处于劣势。尝试改善且不会爆牌。

<!-- rule-section: flow-soft-19-20 -->
### 软19-20

**永远停牌。**

软19和20是非常强的手牌，不要冒险。

![A+6 再要 3 变成 20](/images/rules/blackjack/player-actions.svg)

<!-- rule-section: flow-pair-type -->
### 对子 — 哪种对子？

分牌决策取决于你手中的对子。

<!-- rule-choices -->
- [一对A](#flow-pair-aa)
- [一对10/J/Q/K](#flow-pair-10)
- [一对9](#flow-pair-9)
- [一对8](#flow-pair-8)
- [一对7](#flow-pair-7)
- [一对6](#flow-pair-6)
- [一对5](#flow-pair-5)
- [一对4](#flow-pair-4)
- [一对2或3](#flow-pair-23)

<!-- rule-section: flow-pair-aa -->
### 一对A

**永远分牌。**

两张A作为一手 = 软12（弱牌）。分牌给你两次机会拿21点。

<!-- rule-section: flow-pair-10 -->
### 一对10

**永远不分。永远停牌。**

20点是最强手牌之一，不要拆开。

<!-- rule-section: flow-pair-9 -->
### 一对9 — 庄家明牌？

一对9（总计18）——根据庄家决定分牌或停牌。

<!-- rule-choices -->
- [庄家2-6、8-9](#flow-pair-9-split)
- [庄家7、10、A](#flow-pair-9-stand)

<!-- rule-section: flow-pair-9-split -->
### 分9

**分牌。**

面对弱庄家或8-9，两手以9开始的牌优于停在18。

<!-- rule-section: flow-pair-9-stand -->
### 不分9

**停牌。**

18点面对庄家7够强（庄家大概率17）。面对10/A分牌风险过大。

<!-- rule-section: flow-pair-8 -->
### 一对8

**永远分牌。**

16是21点中最差的手牌。分牌从8重新开始两手。

<!-- rule-section: flow-pair-7 -->
### 一对7 — 庄家明牌？

14很弱；面对弱庄家时分牌有利。

<!-- rule-choices -->
- [庄家2-7](#flow-pair-7-split)
- [庄家8-A](#flow-pair-7-hit)

<!-- rule-section: flow-pair-7-split -->
### 分7

**分牌。**

面对弱庄家，两次机会达到17+胜过停在14。

<!-- rule-section: flow-pair-7-hit -->
### 不分7要牌

**要牌。**

庄家太强，不宜分成以7开始的两手。当作硬14处理。

<!-- rule-section: flow-pair-6 -->
### 一对6 — 庄家明牌？

总共12——只有面对很弱的庄家时分牌才值得。

<!-- rule-choices -->
- [庄家2-6](#flow-pair-6-split)
- [庄家7-A](#flow-pair-6-hit)

<!-- rule-section: flow-pair-6-split -->
### 分6

**分牌。**

庄家大概率爆牌；给自己两手从6开始的牌。

<!-- rule-section: flow-pair-6-hit -->
### 不分6要牌

**要牌。**

当作硬12处理。庄家太强不宜分牌。

<!-- rule-section: flow-pair-5 -->
### 一对5

**永远不分。** 当作硬10处理。

- 庄家2-9：**加倍**
- 庄家10/A：**要牌**

两张5 = 硬10，最佳加倍手牌之一。分牌只会得到两手以5开始的烂牌。

<!-- rule-section: flow-pair-4 -->
### 一对4 — 庄家明牌？

总共8——分牌很少正确。

<!-- rule-choices -->
- [庄家5-6](#flow-pair-4-split)
- [庄家2-4、7-A](#flow-pair-4-hit)

<!-- rule-section: flow-pair-4-split -->
### 分4 vs 庄家5-6

**分牌**（或要牌均可）。

仅面对最弱庄家时分4略有优势。

<!-- rule-section: flow-pair-4-hit -->
### 不分4要牌

**要牌。**

当作硬8处理，要牌改善。

<!-- rule-section: flow-pair-23 -->
### 一对2或3 — 庄家明牌？

小对子——面对弱庄家时分牌。

<!-- rule-choices -->
- [庄家2-7](#flow-pair-23-split)
- [庄家8-A](#flow-pair-23-hit)

<!-- rule-section: flow-pair-23-split -->
### 分2/3

**分牌。**

弱庄家让分牌有利——从小牌开始两手新牌。

<!-- rule-section: flow-pair-23-hit -->
### 不分2/3要牌

**要牌。**

当作硬4/6处理。庄家太强不宜分牌。

