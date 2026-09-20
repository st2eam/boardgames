# Riichi Mahjong - Complete Rules
<!-- rule-section: overview -->
## Overview

Riichi Mahjong (リーチ麻雀) is the Japanese variant of Mahjong, known for its strict rules, rich yaku (hand pattern) system, and the unique Riichi declaration mechanic. It uses 136 tiles (no flower tiles), 4 players, playing either East-only (Hanchan short) or East-South (full Hanchan) rounds.
<!-- rule-section: game-objective -->
## Game Objective

In Riichi Mahjong, you are balancing speed, defense, and yaku. Your goal is to win legal hands with yaku and finish the match with more points than the other players.
<!-- rule-section: tiles -->
## Tiles

| Type | Content | Count |
|------|---------|-------|
| Characters | [1m][2m][3m][4m][5m][6m][7m][8m][9m] | 4 each = 36 |
| Circles | [1p][2p][3p][4p][5p][6p][7p][8p][9p] | 4 each = 36 |
| Bamboo | [1s][2s][3s][4s][5s][6s][7s][8s][9s] | 4 each = 36 |
| Winds | [E][S][W][N] | 4 each = 16 |
| Dragons | [C][F][B] | 4 each = 12 |
| **Total** | | **136 tiles** |
<!-- rule-section: red-dora -->
### Red Dora (赤ドラ)

In some rules, one five of each suit is replaced with a red version, counting as an extra dora.
<!-- rule-ui: tabs -->
<!-- rule-section: game-structure -->
## Game Structure

![East-only is four east hands; hanchan adds south](/images/rules/riichi-mahjong/game-structure.svg)
<!-- rule-section: match-types -->
### Match Types

- **East-only (Tonpuusen)**: East 1 → East 4 (minimum 4 hands)
- **East-South (Hanchan)**: East 1 → South 4 (minimum 8 hands)
<!-- rule-section: hand-flow -->
### Hand Flow

1. Shuffle and build walls (34 tiles each, 17 stacks)
2. Roll dice to determine break point
3. Deal (dealer 14, others 13)
4. Flip dora indicator tile
5. Draw-discard cycle
6. Someone wins or exhaustive draw → scoring
<!-- rule-section: dealer-rotation -->
### Dealer Rotation

- Dealer wins or is tenpai at draw → dealer repeats (honba +1)
- Non-dealer wins and dealer is not tenpai → dealer rotates
<!-- rule-ui: tabs -->
<!-- rule-section: core-rules -->
## Core Rules

![Indicator 3-man makes 4-man dora](/images/rules/riichi-mahjong/riichi-dora.svg)
<!-- rule-section: winning-conditions -->
### Winning Conditions

Standard form: 4 sets + 1 pair = 14 tiles

**To win, you must satisfy one of:**
1. Hand contains at least 1 yaku (scoring pattern)
2. Won while in Riichi state
<!-- rule-section: furiten-rule -->
### Furiten Rule

**You cannot win by ron (discard) if:**
- Any of your waiting tiles is in your own discard pile
- Someone discarded your winning tile this turn and you didn't claim
- You passed on a winning tile after declaring Riichi

In furiten, you can only win by tsumo (self-draw).
<!-- rule-section: riichi-declaration -->
### Riichi Declaration

When concealed and tenpai, you may declare Riichi:
- Place the declaration discard sideways
- Pay 1000 points (Riichi stick)
- Cannot change your hand afterward (auto-draw-discard)
- On winning, flip ura-dora indicators
<!-- rule-ui: tabs -->
<!-- rule-section: complete-yaku-list -->
## Complete Yaku List
<!-- rule-section: 1-han-yaku -->
### 1-Han Yaku

| Yaku | Japanese | Condition |
|------|----------|-----------|
| Riichi | リーチ | Concealed tenpai declaration |
| Ippatsu | 一発 | Win within 1 turn after Riichi |
| Menzen Tsumo | 門前清自摸和 | Self-draw win while concealed |
| Pinfu | 平和 | Concealed + all sequences + non-yakuhai pair + two-sided wait |
| Tanyao | 断么九 | No terminals (1, 9) or honors |
| Iipeiko | 一盃口 | Concealed + two identical sequences |
| Yakuhai | 役牌 | Triplet of: round wind / seat wind / dragon |
| Chankan | 槍槓 | Win on opponent's added kong |
| Rinshan Kaihou | 嶺上開花 | Win on kong replacement draw |
| Haitei | 海底摸月 | Win on last wall draw |
| Houtei | 河底撈魚 | Win on last discard |
<!-- rule-section: 2-han-yaku -->
### 2-Han Yaku

| Yaku | Japanese | Condition |
|------|----------|-----------|
| Double Riichi | ダブル立直 | Riichi on first turn (no calls made) |
| Sanshoku Doujun | 三色同順 | Same sequence in all 3 suits (open: -1 han) |
| Ikkitsuu | 一気通貫 | 1-2-3 + 4-5-6 + 7-8-9 same suit (open: -1 han) |
| Chanta | 混全帯么九 | Every set contains terminal/honor (open: -1 han) |
| Chiitoitsu | 七対子 | 7 pairs |
| Toitoi | 対々和 | All triplets + pair |
| San Ankou | 三暗刻 | 3 concealed triplets |
| San Kantsu | 三槓子 | 3 kongs |
| Honroutou | 混老頭 | Only terminals + honors |
| Shousangen | 小三元 | 2 dragon triplets + 1 dragon pair |
| Sanshoku Doukou | 三色同刻 | Same triplet in all 3 suits |
<!-- rule-section: 3-han-yaku -->
### 3-Han Yaku

| Yaku | Japanese | Condition |
|------|----------|-----------|
| Honitsu | 混一色 | One suit + honors (open: -1 han) |
| Junchan | 純全帯么九 | Every set contains 1 or 9 (no honors) (open: -1 han) |
| Ryanpeikou | 二盃口 | Concealed + two sets of identical sequences |
<!-- rule-section: 6-han-yaku -->
### 6-Han Yaku

| Yaku | Japanese | Condition |
|------|----------|-----------|
| Chinitsu | 清一色 | Only one suit (open: -1 han) |
<!-- rule-section: yakuman-limit-hands -->
### Yakuman (Limit Hands)

| Yaku | Japanese | Condition |
|------|----------|-----------|
| Kokushi Musou | 国士無双 | One of each terminal/honor + one duplicate |
| Suu Ankou | 四暗刻 | 4 concealed triplets + pair |
| Daisangen | 大三元 | Triplet of all 3 dragons |
| Tsuuiisou | 字一色 | All honor tiles |
| Ryuuiisou | 緑一色 | All green tiles (2,3,4,6,8 bamboo + Green Dragon) |
| Chinroutou | 清老頭 | All terminals (1s and 9s only) |
| Shousuushii | 小四喜 | 3 wind triplets + 1 wind pair |
| Daisuushii | 大四喜 | All 4 wind triplets (double yakuman) |
| Chuuren Poutou | 九蓮宝燈 | Concealed 1112345678999 + any same-suit tile |
| Tenhou | 天和 | Dealer wins on initial deal |
| Chiihou | 地和 | Non-dealer wins on first draw |
| Suu Kantsu | 四槓子 | 4 kongs |
<!-- rule-section: dora-system -->
## Dora System

| Type | Description |
|------|-------------|
| Omote Dora | Next tile after indicator (cyclic) |
| Ura Dora | Under indicator, revealed after Riichi win |
| Kan Dora | New indicator flipped for each kong |
| Aka Dora | Red fives (one per suit) |

Dora don't count as yaku but add +1 han each.
<!-- rule-section: dora-cycling -->
### Dora Cycling

- Number tiles: 1→2→3→…→9→1
- Winds: East→South→West→North→East
- Dragons: White→Green→Red→White
<!-- rule-ui: tabs -->
<!-- rule-section: scoring-system -->
## Scoring System

![Han from yaku plus dora, times fu; mangan and up are capped](/images/rules/riichi-mahjong/scoring.svg)
<!-- rule-section: basic-formula -->
### Basic Formula

Points = Fu × 2^(han+2)
<!-- rule-section: fu-calculation -->
### Fu Calculation

| Element | Fu |
|---------|-----|
| Base | 20 (concealed ron) / 30 (otherwise) |
| Tsumo | +2 |
| Single wait / edge / closed | +2 |
| Concealed triplet (simples) | +4 |
| Concealed triplet (terminals) | +8 |
| Open triplet (simples) | +2 |
| Open triplet (terminals) | +4 |
| Concealed kong (simples) | +16 |
| Concealed kong (terminals) | +32 |
| Open kong (simples) | +8 |
| Open kong (terminals) | +16 |
| Pair (yakuhai) | +2 |
<!-- rule-section: quick-score-reference -->
### Quick Score Reference

| Han | 30 Fu | 40 Fu | 50 Fu |
|-----|-------|-------|-------|
| 1 | 1000 | 1300 | 1600 |
| 2 | 2000 | 2600 | 3200 |
| 3 | 3900 | 5200 | 6400 |
| 4 | 7700 | - | - |
| Mangan | 8000 | 8000 | 8000 |
| Haneman | 12000 | - | - |
| Baiman | 16000 | - | - |
| Sanbaiman | 24000 | - | - |
| Yakuman | 32000 | - | - |

*Non-dealer ron values; dealer ×1.5*
<!-- rule-section: payment-rules -->
### Payment Rules

- **Ron**: Discarder pays full amount
- **Tsumo (dealer)**: Each non-dealer pays 1/3
- **Tsumo (non-dealer)**: Dealer pays 1/2, others pay 1/4 each
<!-- rule-section: terminology -->
## Terminology

| Term | Japanese | Meaning |
|------|----------|---------|
| Mentsu | メンツ | Set (sequence or triplet) |
| Jantou | ジャントウ | Pair (head/eyes) |
| Menzen | メンゼン | Concealed (no open melds) |
| Naki | ナキ | Open call (chii/pon/kan) |
| Furiten | フリテン | Cannot ron state |
| Dora | ドラ | Bonus indicator tiles |
| Ryuukyoku | リュウキョク | Exhaustive draw |
| Honba | ホンバ | Repeat counter |
| Kyoutaku | キョウタク | Riichi sticks on table |
| Oya | オヤ | Dealer |
| Ko | コ | Non-dealer |
| Houjuu | ホウジュウ | Dealing into someone's win |
| Ryanmen | リャンメン | Two-sided wait (e.g. 3-4 waits for 2 and 5) |
| Kanchan | カンチャン | Closed wait (e.g. 3-5 waits for 4) |
| Penchan | ペンチャン | Edge wait (e.g. 1-2 waits for 3) |
<!-- rule-ui: tabs -->
<!-- rule-section: strategy-styles -->
## Strategy Styles
<!-- rule-section: aggressive -->
### Aggressive

- Pursue high-value hands
- Declare Riichi early for initiative
- Accept moderate risk for winning
<!-- rule-section: defensive -->
### Defensive

- Prioritize safe discards to avoid dealing in
- Read discard pools to identify dangerous tiles
- Choose to fold when necessary
<!-- rule-section: balanced -->
### Balanced

- Judge offense/defense based on hand potential
- Focus on tile efficiency (effective draw count)
- Flexibly switch between strategies
<!-- rule-section: identifying-safe-tiles -->
### Identifying Safe Tiles

1. **Genbutsu**: Tiles already in that player's discards (100% safe)
2. **Suji**: Tiles deduced safe from two-sided wait logic
3. **Kabe**: Tiles near those with 3-4 visible copies
4. **Guest winds**: Wind tiles no one has claimed
<!-- rule-section: topic-guide -->
## Quick reference
<!-- rule-ui: sidebar -->

Jump directly to the rule topic you need.

- <!-- rule-item: flow-welcome -->
  **Riichi Mahjong Guide**

  Welcome to the Riichi Mahjong interactive guide. What would you like to learn?

  Related topics: 
  - [Riichi Declaration](#flow-riichi)
  - [Yaku Overview](#flow-yaku)
  - [Furiten Rule](#flow-furiten)
  - [Dora System](#flow-dora)
  - [Scoring](#flow-scoring)
  - [Strategy](#flow-strategy)

- <!-- rule-item: flow-riichi -->
  **Riichi Declaration**

  **Riichi** is the signature mechanic of Japanese Mahjong.
  
  **Requirements:**
  - Hand is fully concealed (no open melds)
  - Hand is tenpai (one tile from winning)
  - You have at least 1000 points
  
  **Process:**
  1. Declare "Riichi"
  2. Place discard sideways
  3. Pay 1000 points (Riichi stick)
  
  **After declaring:**
  - Cannot change hand (auto draw-discard)
  - Win = also flip ura-dora for bonus
  - Win within 1 turn = Ippatsu (+1 han)

  Related topics: 
  - [Furiten Rule](#flow-furiten)
  - [Yaku Overview](#flow-yaku)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-yaku -->
  **Yaku (Hand Patterns)**

  Yaku are scoring patterns required to win. Key categories:
  
  **Common 1-han:**
  - Riichi, Menzen Tsumo, Pinfu, Tanyao, Yakuhai
  
  **2-han (powerful):**
  - Chiitoitsu (7 pairs), Toitoi (all triplets)
  - Sanshoku (same sequence in 3 suits)
  
  **High value:**
  - Honitsu (3 han): one suit + honors
  - Chinitsu (6 han): pure one suit
  
  **Yakuman (limit):**
  - Kokushi, Suu Ankou, Daisangen, Tsuuiisou...
  
  You need at least 1 yaku to win (dora alone is not enough).

  Related topics: 
  - [Beginner Yaku](#flow-yaku-beginner)
  - [Yakuman Details](#flow-yakuman)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-yaku-beginner -->
  **Beginner-Friendly Yaku**

  Start with these easy-to-achieve yaku:
  
  1. **Riichi** (1 han): Just declare when concealed & tenpai
  2. **Tanyao** (1 han): No 1s, 9s, or honor tiles
  3. **Yakuhai** (1 han): Triplet of dragon/round wind/seat wind
  4. **Pinfu** (1 han): All sequences + good wait
  5. **Menzen Tsumo** (1 han): Self-draw win while concealed
  
  **Tip**: Riichi + Menzen Tsumo + Ippatsu + Dora can easily reach Mangan (8000 pts)!

  Related topics: 
  - [Scoring System](#flow-scoring)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-yakuman -->
  **Yakuman (Limit Hands)**

  Yakuman are the rarest, most valuable hands (32000+ pts):
  
  - **Kokushi Musou**: One of each terminal & honor + 1 duplicate
  - **Suu Ankou**: 4 concealed triplets (hardest common yakuman)
  - **Daisangen**: Triplet of all 3 dragons
  - **Tsuuiisou**: All honor tiles only
  - **Ryuuiisou**: All green tiles (2,3,4,6,8 bamboo + Green Dragon)
  - **Chinroutou**: Only 1s and 9s
  - **Chuuren Poutou**: 1112345678999 + any same suit
  - **Tenhou/Chiihou**: Win on first draw (dealer/non-dealer)
  
  Double yakuman: Daisuushii (4 wind triplets), Pure Chuuren

  ![East-only is four east hands; hanchan adds south](/images/rules/riichi-mahjong/game-structure.svg)

  Related topics: 
  - [Scoring System](#flow-scoring)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-furiten -->
  **Furiten Rule**

  Furiten prevents you from winning by ron (discard):
  
  **You are in furiten if:**
  1. Any tile you're waiting on is in your own discard pile
  2. Someone discarded your winning tile this turn (temporary)
  3. After Riichi, you passed on any winning tile
  
  **Key points:**
  - Furiten applies to ALL your waits, not just one
  - You can still win by tsumo (self-draw) while furiten
  - Temporary furiten clears on your next turn
  - Riichi furiten is permanent until the hand ends

  Related topics: 
  - [Riichi Declaration](#flow-riichi)
  - [Strategy](#flow-strategy)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-dora -->
  **Dora System**

  Dora add bonus han but are NOT yaku themselves.
  
  **Types:**
  - **Omote Dora**: Indicator tile on wall → next tile is dora
  - **Ura Dora**: Under indicator, revealed only after Riichi win
  - **Kan Dora**: New indicator per kong declared
  - **Aka Dora**: Red fives (automatic dora)
  
  **Cycling:**
  - Numbers: 1→2→...→9→1
  - Winds: E→S→W→N→E
  - Dragons: White→Green→Red→White
  
  **Example**: Indicator shows [6m] → Dora is [7m]

  ![Indicator 3-man makes 4-man dora](/images/rules/riichi-mahjong/riichi-dora.svg)

  Related topics: 
  - [Scoring System](#flow-scoring)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-scoring -->
  **Scoring System**

  **Formula**: Points = Fu × 2^(han+2)
  
  **Quick reference (non-dealer ron):**
  - 1 han 30 fu = 1000 pts
  - 2 han 30 fu = 2000 pts
  - 3 han 30 fu = 3900 pts
  - Mangan (5 han) = 8000 pts
  - Haneman (6-7 han) = 12000 pts
  - Baiman (8-10 han) = 16000 pts
  - Sanbaiman (11-12 han) = 24000 pts
  - Yakuman (13+ han) = 32000 pts
  
  **Payment:**
  - Ron: loser pays all
  - Tsumo (dealer): others each pay 1/3
  - Tsumo (non-dealer): dealer 1/2, others 1/4

  ![Han from yaku plus dora, times fu; mangan and up are capped](/images/rules/riichi-mahjong/scoring.svg)

  Related topics: 
  - [Strategy](#flow-strategy)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-strategy -->
  **Strategy Guide**

  **Offense vs Defense decision:**
  
  Push (attack) when:
  - Your hand has high value potential
  - You have a good wait (ryanmen/two-sided)
  - It's early in the hand
  
  Fold (defend) when:
  - Others declared Riichi
  - Your hand is cheap (1-2 han)
  - It's late in the hand
  
  **Safe tile priority:**
  1. Genbutsu (their discards) = 100% safe
  2. Suji tiles = mostly safe
  3. Kabe (walled tiles) = likely safe
  4. Guest winds = usually safe early
  
  **Tile efficiency**: Keep tiles that give you more useful draws.

  Related topics: 
  - [Riichi Declaration](#flow-riichi)
  - [Back to Menu](#flow-welcome)

