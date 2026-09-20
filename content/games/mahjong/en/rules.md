# Mahjong - General Introduction Rules
<!-- rule-section: overview -->
## Overview

Mahjong is a traditional Chinese table game played with a set of 144 tiles, typically by 4 players. The goal is to be the first to form a valid winning hand by drawing and discarding tiles.
<!-- rule-section: game-objective -->
## Game Objective

In Mahjong, you are shaping a hand through draws and discards. Your goal is to be the first player to complete a legal winning hand.
<!-- rule-ui: tabs -->
<!-- rule-section: tile-set -->
## Tile Set
<!-- rule-section: suited-tiles-108-tiles -->
### Suited Tiles (108 tiles)

| Suit | Faces | Quantity | Examples |
|------|-------|----------|----------|
| Characters (万) | 1-9 | 4 each | [1m][2m][3m][4m][5m][6m][7m][8m][9m] |
| Circles (筒) | 1-9 | 4 each | [1p][2p][3p][4p][5p][6p][7p][8p][9p] |
| Bamboo (条) | 1-9 | 4 each | [1s][2s][3s][4s][5s][6s][7s][8s][9s] |
<!-- rule-section: honor-tiles-28-tiles -->
### Honor Tiles (28 tiles)

| Type | Faces | Quantity |
|------|-------|----------|
| Winds | [E][S][W][N] | 4 each |
| Dragons | [C][F][B] | 4 each |
<!-- rule-section: flower-tiles-8-tiles-optional-in-some-variants -->
### Flower Tiles (8 tiles, optional in some variants)

Spring, Summer, Autumn, Winter, Plum, Orchid, Bamboo, Chrysanthemum — 1 each.
<!-- rule-ui: tabs -->
<!-- rule-section: game-flow -->
## Game Flow

![Turn: draw one, evaluate, discard one](/images/rules/mahjong/turn-flow.svg)
<!-- rule-section: 1-setup -->
### 1. Setup

1. **Shuffle**: Mix all tiles face-down
2. **Build walls**: Each player takes 34 tiles (without flowers) and stacks them in 17 pairs
3. **Determine dealer**: Roll dice to decide who is the East (dealer)
4. **Deal**: Dealer draws 14 tiles; others draw 13 each
<!-- rule-section: 2-basic-turn -->
### 2. Basic Turn

Players take turns counter-clockwise:

1. **Draw**: Take 1 tile from the wall
2. **Evaluate**: Consider your hand and strategy
3. **Discard**: Choose 1 unwanted tile to discard face-up
<!-- rule-section: 3-special-actions -->
### 3. Special Actions

When another player discards a tile, you may claim it:

| Action | Condition | Priority |
|--------|-----------|----------|
| **Win (Hu)** | Completes your winning hand | Highest |
| **Kong (Gang)** | You already hold 3 of that tile | High |
| **Pung (Peng)** | You already hold 2 of that tile | Medium |
| **Chow (Chi)** | You hold 2 adjacent suited tiles (from left player only) | Low |
<!-- rule-ui: tabs -->
<!-- rule-section: winning-conditions -->
## Winning Conditions

![Four sets plus a pair to win](/images/rules/mahjong/winning-hand.svg)
<!-- rule-section: standard-winning-hand -->
### Standard Winning Hand

A complete hand must form:

$$4 \times \text{Sets} + 1 \times \text{Pair} = 14 \text{ tiles}$$

**Sets** (3 tiles each):
- **Sequence (Chow)**: Three consecutive same-suit tiles, e.g. [1m][2m][3m]
- **Triplet (Pung)**: Three identical tiles, e.g. [C][C][C]

**Pair (Eyes)**: Two identical tiles, e.g. [E][E]
<!-- rule-section: special-hands -->
### Special Hands

| Hand | Description |
|------|-------------|
| **Seven Pairs** | 7 pairs of tiles |
| **Thirteen Orphans** | One of each terminal and honor tile + one duplicate |
<!-- rule-section: self-draw-vs-discard-win -->
### Self-Draw vs. Discard Win

- **Self-draw (Zimo)**: You draw the winning tile yourself
- **Discard win (Ronghu)**: Another player discards your winning tile
<!-- rule-section: set-types-in-detail -->
## Set Types in Detail

| Name | Composition | Source |
|------|-------------|--------|
| Sequence | 3 consecutive same-suit | Chow or self-draw |
| Triplet | 3 identical | Pung or concealed (self-drawn) |
| Quad | 4 identical | Kong (open/closed/extended) |
<!-- rule-section: types-of-kong -->
### Types of Kong

- **Concealed Kong**: Collect all 4 by self-draw, place face-down
- **Open Kong**: Hold 3 + claim 1 from discard
- **Extended Kong**: Add 4th tile to existing Pung

After a Kong, draw 1 replacement tile from the back of the wall.
<!-- rule-section: common-terms -->
## Common Terms

| Term | Meaning |
|------|---------|
| Tenpai | One tile away from winning |
| Menzen (Concealed) | No open melds — all tiles self-drawn |
| Tanyao | No terminals (1s/9s) or honors |
| Pinfu | All sequences + non-scoring pair |
| Chinitsu (Full Flush) | All tiles of one suit |
| Honitsu (Half Flush) | One suit + honors |
| Toitoi | All triplets/quads + pair |
| Wall | The undealt stack of tiles |
| Haitei | The last tile in the wall |
<!-- rule-section: basic-scoring -->
## Basic Scoring

Scoring varies greatly by region. Universal concepts:

| Concept | Explanation |
|---------|-------------|
| Base Points | Fixed value per round |
| Fan (Doubles) | Multiplier for special hands |
| Self-draw Bonus | Self-drawn wins typically score double |
| Dealer Bonus | Dealer pays/receives more |
<!-- rule-section: common-fan-reference -->
### Common Fan Reference

| Hand | Approximate Fan |
|------|----------------|
| Pinfu | 1 fan |
| Tanyao | 1 fan |
| Half Flush | 3 fan |
| Full Flush | 6 fan |
| Seven Pairs | 4 fan |
| Toitoi | 3 fan |
| Thirteen Orphans | Maximum |
<!-- rule-section: basic-strategy -->
## Basic Strategy
<!-- rule-ui: sidebar -->
1. <!-- rule-item: basic-strategy-item-1 -->
   **Watch safe tiles**: Track discards to identify tiles that won't deal into others
2. <!-- rule-item: basic-strategy-item-2 -->
   **Stay flexible**: Adjust your target hand based on draws
3. <!-- rule-item: basic-strategy-item-3 -->
   **Maximize waits**: Aim for a tenpai with multiple winning tiles
4. <!-- rule-item: basic-strategy-item-4 -->
   **Manage risk**: Be cautious with discards in late game
5. <!-- rule-item: basic-strategy-item-5 -->
   **Read opponents**: Note their claims to deduce their hands
<!-- rule-section: etiquette -->
## Etiquette

- Never peek at other players' tiles
- Don't take too long for draws and discards
- Announce claims (Pung, Kong, Win) clearly and promptly
- Arrange discards in order for easy verification
<!-- rule-section: topic-guide -->
## Quick reference
Jump directly to the rule topic you need.

- <!-- rule-item: flow-welcome -->
  **Welcome to Mahjong**

  This guide will walk you through the basics of Mahjong. What would you like to learn?

  Related topics: 
  - [Tile Types](#flow-tiles)
  - [Game Setup](#flow-setup)
  - [Basic Turn Actions](#flow-turns)
  - [Winning Conditions](#flow-winning)
  - [Special Actions](#flow-special)
  - [Strategy Tips](#flow-strategy)

- <!-- rule-item: flow-tiles -->
  **Tile Types**

  Mahjong uses 144 tiles in total:
  
  **Suited tiles (108):**
  - Characters (万) [1m]-[9m]: 1-9, four of each
  - Circles (筒) [1p]-[9p]: 1-9, four of each
  - Bamboo (条) [1s]-[9s]: 1-9, four of each
  
  **Honor tiles (28):**
  - Winds: [E][S][W][N] (4 each)
  - Dragons: [C][F][B] (4 each)
  
  **Flowers (8, optional):** seasonal and plant tiles

  Related topics: 
  - [Game Setup](#flow-setup)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-setup -->
  **Game Setup**

  1. **Shuffle** all tiles face-down
  2. **Build walls**: Each player stacks 34 tiles into 17 pairs (2 high)
  3. **Determine dealer**: Roll dice → highest is East (dealer)
  4. **Deal**: Dealer takes 14 tiles, others take 13
  
  Dealer goes first and already has 14 tiles, so they start by discarding.

  ![Turn: draw one, evaluate, discard one](/images/rules/mahjong/turn-flow.svg)

  Related topics: 
  - [Basic Turn Actions](#flow-turns)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-turns -->
  **Basic Turn Actions**

  Each turn follows this pattern:
  
  1. **Draw** 1 tile from the wall
  2. **Evaluate** your hand — can you win? Should you adjust strategy?
  3. **Discard** 1 tile face-up
  
  Play proceeds counter-clockwise. After you discard, other players may claim it.

  Related topics: 
  - [Special Actions (Chi/Peng/Gang)](#flow-special)
  - [Winning Conditions](#flow-winning)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-special -->
  **Special Actions**

  When someone discards a tile, you may claim it:
  
  | Action | Need | Who Can |
  |--------|------|--------|
  | **Win (Hu)** | Completes your hand | Anyone |
  | **Kong** | You have 3 of it | Anyone |
  | **Pung** | You have 2 of it | Anyone |
  | **Chow** | You have 2 adjacent | Left player only |
  
  **Priority**: Win > Kong > Pung > Chow
  
  After claiming, reveal the meld and discard a tile (except for Win).

  Related topics: 
  - [Kong in Detail](#flow-kong)
  - [Winning Conditions](#flow-winning)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-kong -->
  **Types of Kong**

  Three ways to form a Kong (4 identical tiles):
  
  1. **Concealed Kong**: Draw 4th tile yourself → declare, place face-down
  2. **Open Kong**: Hold 3, claim discarded 4th tile
  3. **Extended Kong**: Already have a Pung meld, draw 4th → add to it
  
  After any Kong, draw a replacement tile from the wall's end.

  Related topics: 
  - [Winning Conditions](#flow-winning)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-winning -->
  **Winning Conditions**

  Standard winning hand = **4 sets + 1 pair** (14 tiles)
  
  **Sets (3 tiles):**
  - Sequence: e.g. [1m][2m][3m] (consecutive same-suit)
  - Triplet: e.g. [C][C][C] (3 identical)
  
  **Pair**: e.g. [E][E] (2 identical)
  
  **Special hands:**
  - Seven Pairs: 7 pairs = 14 tiles
  - Thirteen Orphans: all terminals + honors + one duplicate

  ![Four sets plus a pair to win](/images/rules/mahjong/winning-hand.svg)

  Related topics: 
  - [Scoring Basics](#flow-scoring)
  - [Strategy Tips](#flow-strategy)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-scoring -->
  **Scoring Basics**

  Scoring varies by region. General concepts:
  
  - **Base points**: Fixed value per round
  - **Fan (doubles)**: Multiplier based on hand quality
  - **Self-draw bonus**: Self-drawn wins score more
  - **Dealer bonus**: Dealer pays/receives extra
  
  Common fan values:
  - Pinfu (all sequences): 1 fan
  - Tanyao (no terminals): 1 fan
  - Half Flush: 3 fan
  - Full Flush: 6 fan
  - Seven Pairs: 4 fan
  - Thirteen Orphans: Maximum

  Related topics: 
  - [Strategy Tips](#flow-strategy)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-strategy -->
  **Strategy Tips**

  1. **Track discards**: Memorize what's been played to identify safe tiles
  2. **Stay flexible**: Don't commit to one hand too early
  3. **Wide waits**: Aim for tenpai with multiple possible winning tiles
  4. **Defense**: In late game, prioritize safe discards over pushing for a win
  5. **Read opponents**: Their claims (chi/peng) reveal their hand direction
  6. **Tile efficiency**: Keep tiles that work with more combinations

  Related topics: 
  - [Back to Menu](#flow-welcome)
<!-- rule-section: topic-guide-2 -->
## Quick reference
Jump directly to the rule topic you need.

- <!-- rule-item: flow-welcome -->
  **Welcome to Mahjong**

  This guide will walk you through the basics of Mahjong. What would you like to learn?

  Related topics: 
  - [Tile Types](#flow-tiles)
  - [Game Setup](#flow-setup)
  - [Basic Turn Actions](#flow-turns)
  - [Winning Conditions](#flow-winning)
  - [Special Actions](#flow-special)
  - [Strategy Tips](#flow-strategy)

- <!-- rule-item: flow-tiles -->
  **Tile Types**

  Mahjong uses 144 tiles in total:
  
  **Suited tiles (108):**
  - Characters (万) [1m]-[9m]: 1-9, four of each
  - Circles (筒) [1p]-[9p]: 1-9, four of each
  - Bamboo (条) [1s]-[9s]: 1-9, four of each
  
  **Honor tiles (28):**
  - Winds: [E][S][W][N] (4 each)
  - Dragons: [C][F][B] (4 each)
  
  **Flowers (8, optional):** seasonal and plant tiles

  Related topics: 
  - [Game Setup](#flow-setup)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-setup -->
  **Game Setup**

  1. **Shuffle** all tiles face-down
  2. **Build walls**: Each player stacks 34 tiles into 17 pairs (2 high)
  3. **Determine dealer**: Roll dice → highest is East (dealer)
  4. **Deal**: Dealer takes 14 tiles, others take 13
  
  Dealer goes first and already has 14 tiles, so they start by discarding.

  ![Turn: draw one, evaluate, discard one](/images/rules/mahjong/turn-flow.svg)

  Related topics: 
  - [Basic Turn Actions](#flow-turns)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-turns -->
  **Basic Turn Actions**

  Each turn follows this pattern:
  
  1. **Draw** 1 tile from the wall
  2. **Evaluate** your hand — can you win? Should you adjust strategy?
  3. **Discard** 1 tile face-up
  
  Play proceeds counter-clockwise. After you discard, other players may claim it.

  Related topics: 
  - [Special Actions (Chi/Peng/Gang)](#flow-special)
  - [Winning Conditions](#flow-winning)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-special -->
  **Special Actions**

  When someone discards a tile, you may claim it:
  
  | Action | Need | Who Can |
  |--------|------|--------|
  | **Win (Hu)** | Completes your hand | Anyone |
  | **Kong** | You have 3 of it | Anyone |
  | **Pung** | You have 2 of it | Anyone |
  | **Chow** | You have 2 adjacent | Left player only |
  
  **Priority**: Win > Kong > Pung > Chow
  
  After claiming, reveal the meld and discard a tile (except for Win).

  Related topics: 
  - [Kong in Detail](#flow-kong)
  - [Winning Conditions](#flow-winning)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-kong -->
  **Types of Kong**

  Three ways to form a Kong (4 identical tiles):
  
  1. **Concealed Kong**: Draw 4th tile yourself → declare, place face-down
  2. **Open Kong**: Hold 3, claim discarded 4th tile
  3. **Extended Kong**: Already have a Pung meld, draw 4th → add to it
  
  After any Kong, draw a replacement tile from the wall's end.

  Related topics: 
  - [Winning Conditions](#flow-winning)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-winning -->
  **Winning Conditions**

  Standard winning hand = **4 sets + 1 pair** (14 tiles)
  
  **Sets (3 tiles):**
  - Sequence: e.g. [1m][2m][3m] (consecutive same-suit)
  - Triplet: e.g. [C][C][C] (3 identical)
  
  **Pair**: e.g. [E][E] (2 identical)
  
  **Special hands:**
  - Seven Pairs: 7 pairs = 14 tiles
  - Thirteen Orphans: all terminals + honors + one duplicate

  ![Four sets plus a pair to win](/images/rules/mahjong/winning-hand.svg)

  Related topics: 
  - [Scoring Basics](#flow-scoring)
  - [Strategy Tips](#flow-strategy)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-scoring -->
  **Scoring Basics**

  Scoring varies by region. General concepts:
  
  - **Base points**: Fixed value per round
  - **Fan (doubles)**: Multiplier based on hand quality
  - **Self-draw bonus**: Self-drawn wins score more
  - **Dealer bonus**: Dealer pays/receives extra
  
  Common fan values:
  - Pinfu (all sequences): 1 fan
  - Tanyao (no terminals): 1 fan
  - Half Flush: 3 fan
  - Full Flush: 6 fan
  - Seven Pairs: 4 fan
  - Thirteen Orphans: Maximum

  Related topics: 
  - [Strategy Tips](#flow-strategy)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-strategy -->
  **Strategy Tips**

  1. **Track discards**: Memorize what's been played to identify safe tiles
  2. **Stay flexible**: Don't commit to one hand too early
  3. **Wide waits**: Aim for tenpai with multiple possible winning tiles
  4. **Defense**: In late game, prioritize safe discards over pushing for a win
  5. **Read opponents**: Their claims (chi/peng) reveal their hand direction
  6. **Tile efficiency**: Keep tiles that work with more combinations

  Related topics: 
  - [Back to Menu](#flow-welcome)
<!-- rule-section: topic-guide-3 -->
## Quick reference
Jump directly to the rule topic you need.

- <!-- rule-item: flow-welcome -->
  **Welcome to Mahjong**

  This guide will walk you through the basics of Mahjong. What would you like to learn?

  Related topics: 
  - [Tile Types](#flow-tiles)
  - [Game Setup](#flow-setup)
  - [Basic Turn Actions](#flow-turns)
  - [Winning Conditions](#flow-winning)
  - [Special Actions](#flow-special)
  - [Strategy Tips](#flow-strategy)

- <!-- rule-item: flow-tiles -->
  **Tile Types**

  Mahjong uses 144 tiles in total:
  
  **Suited tiles (108):**
  - Characters (万) [1m]-[9m]: 1-9, four of each
  - Circles (筒) [1p]-[9p]: 1-9, four of each
  - Bamboo (条) [1s]-[9s]: 1-9, four of each
  
  **Honor tiles (28):**
  - Winds: [E][S][W][N] (4 each)
  - Dragons: [C][F][B] (4 each)
  
  **Flowers (8, optional):** seasonal and plant tiles

  Related topics: 
  - [Game Setup](#flow-setup)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-setup -->
  **Game Setup**

  1. **Shuffle** all tiles face-down
  2. **Build walls**: Each player stacks 34 tiles into 17 pairs (2 high)
  3. **Determine dealer**: Roll dice → highest is East (dealer)
  4. **Deal**: Dealer takes 14 tiles, others take 13
  
  Dealer goes first and already has 14 tiles, so they start by discarding.

  ![Turn: draw one, evaluate, discard one](/images/rules/mahjong/turn-flow.svg)

  Related topics: 
  - [Basic Turn Actions](#flow-turns)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-turns -->
  **Basic Turn Actions**

  Each turn follows this pattern:
  
  1. **Draw** 1 tile from the wall
  2. **Evaluate** your hand — can you win? Should you adjust strategy?
  3. **Discard** 1 tile face-up
  
  Play proceeds counter-clockwise. After you discard, other players may claim it.

  Related topics: 
  - [Special Actions (Chi/Peng/Gang)](#flow-special)
  - [Winning Conditions](#flow-winning)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-special -->
  **Special Actions**

  When someone discards a tile, you may claim it:
  
  | Action | Need | Who Can |
  |--------|------|--------|
  | **Win (Hu)** | Completes your hand | Anyone |
  | **Kong** | You have 3 of it | Anyone |
  | **Pung** | You have 2 of it | Anyone |
  | **Chow** | You have 2 adjacent | Left player only |
  
  **Priority**: Win > Kong > Pung > Chow
  
  After claiming, reveal the meld and discard a tile (except for Win).

  Related topics: 
  - [Kong in Detail](#flow-kong)
  - [Winning Conditions](#flow-winning)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-kong -->
  **Types of Kong**

  Three ways to form a Kong (4 identical tiles):
  
  1. **Concealed Kong**: Draw 4th tile yourself → declare, place face-down
  2. **Open Kong**: Hold 3, claim discarded 4th tile
  3. **Extended Kong**: Already have a Pung meld, draw 4th → add to it
  
  After any Kong, draw a replacement tile from the wall's end.

  Related topics: 
  - [Winning Conditions](#flow-winning)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-winning -->
  **Winning Conditions**

  Standard winning hand = **4 sets + 1 pair** (14 tiles)
  
  **Sets (3 tiles):**
  - Sequence: e.g. [1m][2m][3m] (consecutive same-suit)
  - Triplet: e.g. [C][C][C] (3 identical)
  
  **Pair**: e.g. [E][E] (2 identical)
  
  **Special hands:**
  - Seven Pairs: 7 pairs = 14 tiles
  - Thirteen Orphans: all terminals + honors + one duplicate

  ![Four sets plus a pair to win](/images/rules/mahjong/winning-hand.svg)

  Related topics: 
  - [Scoring Basics](#flow-scoring)
  - [Strategy Tips](#flow-strategy)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-scoring -->
  **Scoring Basics**

  Scoring varies by region. General concepts:
  
  - **Base points**: Fixed value per round
  - **Fan (doubles)**: Multiplier based on hand quality
  - **Self-draw bonus**: Self-drawn wins score more
  - **Dealer bonus**: Dealer pays/receives extra
  
  Common fan values:
  - Pinfu (all sequences): 1 fan
  - Tanyao (no terminals): 1 fan
  - Half Flush: 3 fan
  - Full Flush: 6 fan
  - Seven Pairs: 4 fan
  - Thirteen Orphans: Maximum

  Related topics: 
  - [Strategy Tips](#flow-strategy)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-strategy -->
  **Strategy Tips**

  1. **Track discards**: Memorize what's been played to identify safe tiles
  2. **Stay flexible**: Don't commit to one hand too early
  3. **Wide waits**: Aim for tenpai with multiple possible winning tiles
  4. **Defense**: In late game, prioritize safe discards over pushing for a win
  5. **Read opponents**: Their claims (chi/peng) reveal their hand direction
  6. **Tile efficiency**: Keep tiles that work with more combinations

  Related topics: 
  - [Back to Menu](#flow-welcome)

<!-- rule-section: topic-guide-4 -->
## Quick reference
<!-- rule-ui: sidebar -->

Jump directly to the rule topic you need.

- <!-- rule-item: flow-welcome -->
  **Welcome to Mahjong**

  This guide will walk you through the basics of Mahjong. What would you like to learn?

  Related topics: 
  - [Tile Types](#flow-tiles)
  - [Game Setup](#flow-setup)
  - [Basic Turn Actions](#flow-turns)
  - [Winning Conditions](#flow-winning)
  - [Special Actions](#flow-special)
  - [Strategy Tips](#flow-strategy)

- <!-- rule-item: flow-tiles -->
  **Tile Types**

  Mahjong uses 144 tiles in total:
  
  **Suited tiles (108):**
  - Characters (万) [1m]-[9m]: 1-9, four of each
  - Circles (筒) [1p]-[9p]: 1-9, four of each
  - Bamboo (条) [1s]-[9s]: 1-9, four of each
  
  **Honor tiles (28):**
  - Winds: [E][S][W][N] (4 each)
  - Dragons: [C][F][B] (4 each)
  
  **Flowers (8, optional):** seasonal and plant tiles

  Related topics: 
  - [Game Setup](#flow-setup)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-setup -->
  **Game Setup**

  1. **Shuffle** all tiles face-down
  2. **Build walls**: Each player stacks 34 tiles into 17 pairs (2 high)
  3. **Determine dealer**: Roll dice → highest is East (dealer)
  4. **Deal**: Dealer takes 14 tiles, others take 13
  
  Dealer goes first and already has 14 tiles, so they start by discarding.

  ![Turn: draw one, evaluate, discard one](/images/rules/mahjong/turn-flow.svg)

  Related topics: 
  - [Basic Turn Actions](#flow-turns)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-turns -->
  **Basic Turn Actions**

  Each turn follows this pattern:
  
  1. **Draw** 1 tile from the wall
  2. **Evaluate** your hand — can you win? Should you adjust strategy?
  3. **Discard** 1 tile face-up
  
  Play proceeds counter-clockwise. After you discard, other players may claim it.

  Related topics: 
  - [Special Actions (Chi/Peng/Gang)](#flow-special)
  - [Winning Conditions](#flow-winning)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-special -->
  **Special Actions**

  When someone discards a tile, you may claim it:
  
  | Action | Need | Who Can |
  |--------|------|--------|
  | **Win (Hu)** | Completes your hand | Anyone |
  | **Kong** | You have 3 of it | Anyone |
  | **Pung** | You have 2 of it | Anyone |
  | **Chow** | You have 2 adjacent | Left player only |
  
  **Priority**: Win > Kong > Pung > Chow
  
  After claiming, reveal the meld and discard a tile (except for Win).

  Related topics: 
  - [Kong in Detail](#flow-kong)
  - [Winning Conditions](#flow-winning)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-kong -->
  **Types of Kong**

  Three ways to form a Kong (4 identical tiles):
  
  1. **Concealed Kong**: Draw 4th tile yourself → declare, place face-down
  2. **Open Kong**: Hold 3, claim discarded 4th tile
  3. **Extended Kong**: Already have a Pung meld, draw 4th → add to it
  
  After any Kong, draw a replacement tile from the wall's end.

  Related topics: 
  - [Winning Conditions](#flow-winning)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-winning -->
  **Winning Conditions**

  Standard winning hand = **4 sets + 1 pair** (14 tiles)
  
  **Sets (3 tiles):**
  - Sequence: e.g. [1m][2m][3m] (consecutive same-suit)
  - Triplet: e.g. [C][C][C] (3 identical)
  
  **Pair**: e.g. [E][E] (2 identical)
  
  **Special hands:**
  - Seven Pairs: 7 pairs = 14 tiles
  - Thirteen Orphans: all terminals + honors + one duplicate

  ![Four sets plus a pair to win](/images/rules/mahjong/winning-hand.svg)

  Related topics: 
  - [Scoring Basics](#flow-scoring)
  - [Strategy Tips](#flow-strategy)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-scoring -->
  **Scoring Basics**

  Scoring varies by region. General concepts:
  
  - **Base points**: Fixed value per round
  - **Fan (doubles)**: Multiplier based on hand quality
  - **Self-draw bonus**: Self-drawn wins score more
  - **Dealer bonus**: Dealer pays/receives extra
  
  Common fan values:
  - Pinfu (all sequences): 1 fan
  - Tanyao (no terminals): 1 fan
  - Half Flush: 3 fan
  - Full Flush: 6 fan
  - Seven Pairs: 4 fan
  - Thirteen Orphans: Maximum

  Related topics: 
  - [Strategy Tips](#flow-strategy)
  - [Back to Menu](#flow-welcome)

- <!-- rule-item: flow-strategy -->
  **Strategy Tips**

  1. **Track discards**: Memorize what's been played to identify safe tiles
  2. **Stay flexible**: Don't commit to one hand too early
  3. **Wide waits**: Aim for tenpai with multiple possible winning tiles
  4. **Defense**: In late game, prioritize safe discards over pushing for a win
  5. **Read opponents**: Their claims (chi/peng) reveal their hand direction
  6. **Tile efficiency**: Keep tiles that work with more combinations

  Related topics: 
  - [Back to Menu](#flow-welcome)

