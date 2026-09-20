# Rummikub Rules
<!-- rule-section: overview -->
## Overview

Rummikub is a tile-based game for 2-4 players that combines elements of Rummy and Mahjong. Players arrange numbered tiles into groups and runs, aiming to be the first to play all tiles from their rack.
<!-- rule-section: game-objective -->
## Game Objective

In Rummikub, you are arranging numbered tiles into clean groups and runs. Your goal is to make your opening meld, keep every table set legal, and empty your rack first.
<!-- rule-section: components -->
## Components
<!-- rule-ui: sidebar -->
- <!-- rule-item: components-item-1 -->
  **106 numbered tiles**: 1-13 in four colors (black, red, blue, orange), 2 sets per color
- <!-- rule-item: components-item-2 -->
  **2 Joker tiles**
- <!-- rule-item: components-item-3 -->
  **4 tile racks**
<!-- rule-section: setup -->
## Setup

1. Place all 106 tiles face-down on the table and mix them thoroughly
2. Each player draws **14 tiles** and places them on their rack
3. Remaining tiles form the **pool**
4. Determine first player: each player draws one tile — highest number goes first (return tiles to pool)
<!-- rule-ui: tabs -->
<!-- rule-section: valid-combinations -->
## Valid Combinations

![A red run 5-6-7, or three 8s as a group](/images/rules/rummikub/sets-runs.svg)

All tiles played must form one of these combinations, each with **at least 3 tiles**:
<!-- rule-section: group -->
### Group

3 or 4 tiles of the **same number in different colors**.

| Example | Description |
|---------|-------------|
| 🔴7 🔵7 ⚫7 | Three-color 7s |
| 🔴10 🔵10 ⚫10 🟠10 | Four-color 10s |
<!-- rule-section: run -->
### Run

3 or more tiles of the **same color in consecutive numbers**.

| Example | Description |
|---------|-------------|
| 🔴3 🔴4 🔴5 | Red 3-4-5 |
| 🔵8 🔵9 🔵10 🔵11 🔵12 | Blue 8-12 |

> Note: 1 cannot follow 13 to wrap around (12-13-1 is invalid).
<!-- rule-ui: tabs -->
<!-- rule-section: gameplay -->
## Gameplay

![First play must total at least 30 from your own tiles](/images/rules/rummikub/initial-30.svg)
<!-- rule-section: initial-meld -->
### Initial Meld

- Your first play must total **at least 30 points** (sum of tile face values)
- You may play multiple sets to reach 30 points
- You **cannot** manipulate existing table tiles for your initial meld
- Jokers count as the value of the tile they represent
- If you can't reach 30, draw 1 tile from the pool and end your turn
<!-- rule-section: regular-turns -->
### Regular Turns

After completing your initial meld, each turn you may:

1. **Play new sets**: Place new groups or runs from your rack
2. **Extend existing sets**: Add tiles from your rack to sets on the table
3. **Manipulate table tiles**: Rearrange tiles on the table (see Manipulation Rules below)
4. **Combine all of the above** — no limit on actions per turn

If you can't or choose not to play, draw 1 tile from the pool and end your turn.
<!-- rule-section: manipulation-rules-core-strategy -->
### Manipulation Rules (Core Strategy)

Manipulation is the heart of Rummikub strategy. You may freely rearrange tiles on the table, as long as **all tiles form valid combinations** at the end of your turn:

| Action | Example |
|--------|---------|
| **Split a run** | 🔴3-4-5-6-7 → 🔴3-4-5 + 🔴5-6-7 (adding 🔴5 from rack) |
| **Remove 4th tile** | ⚫8 🔵8 🔴8 🟠8 → Take 🟠8 for use elsewhere |
| **Combine sets** | Break apart multiple sets and reassemble into new valid ones |
| **Extend a run** | 🔵4-5-6 → 🔵3-4-5-6 (adding 🔵3 from rack) |

> ⚠️ At the end of your turn, no tiles on the table may be left "orphaned." Every tile must belong to a valid group or run.
<!-- rule-section: jokers -->
## Jokers

![A joker stands in for any tile and counts as that tile’s value](/images/rules/rummikub/joker.svg)
- A joker can **substitute for any tile**
- In the initial meld, a joker counts as the value of the tile it represents
- Any player holding the **exact tile** a joker represents may replace it
- The freed joker **must be used immediately** in a new combination on the table — it cannot be taken to the rack
- Jokers left on rack at game end incur a **30-point penalty**
<!-- rule-section: time-limit-penalties -->
## Time Limit & Penalties

| Situation | Penalty |
|-----------|---------|
| Turn exceeds time limit (1 minute) | Draw 1 tile, turn ends |
| Failed manipulation (can't restore valid state) | Restore original state, take back played tiles, draw **3 penalty tiles** |
<!-- rule-ui: tabs -->
<!-- rule-section: game-end-scoring -->
## Game End & Scoring
<!-- rule-section: normal-end -->
### Normal End

When a player plays their last tile, they call **"Rummikub!"** and the round ends.

- Other players sum the face values of tiles remaining on their racks as **negative points**
- Jokers count as **30 points**
- The winner receives a **positive score** equal to the total of all other players' negative points
<!-- rule-section: pool-depleted -->
### Pool Depleted

If the pool runs out and no one has emptied their rack:

- Player with the **lowest tile total** wins the round
- Each player subtracts the winner's total from their own — the difference is their negative score
- The winner receives the sum of all negative scores as positive points
<!-- rule-section: multi-round-play -->
### Multi-Round Play

- Recommended: play as many rounds as there are players (e.g., 4 players = 4 rounds)
- After all rounds, the player with the **highest cumulative score** wins
- Tiebreaker: player who **won the most rounds**
<!-- rule-section: strategy-tips -->
## Strategy Tips

- Complete your initial meld of 30 points as soon as possible to unlock manipulation
- Watch how often opponents draw tiles to gauge their hand strength
- Mind the clock during manipulation to avoid penalties
- Use jokers wisely — don't hold them too long (30-point penalty is steep)
- Keep versatile tiles that can fit multiple combinations for greater flexibility
<!-- rule-section: topic-guide -->
## Quick reference
<!-- rule-ui: sidebar -->

Jump directly to the rule topic you need.

- <!-- rule-item: flow-setup -->
  **Game Setup**

  ## Setup
  
  1. Place all 106 tiles **face-down** on the table and mix them
  2. Each player draws **14 tiles** onto their rack
  3. Remaining tiles form the **pool**
  4. Each player draws 1 tile — **highest number** goes first (return tiles)
  
  > Tiles: 1–13 in 4 colors (×2 each) + 2 Jokers = 106 total

  Related topics: 
  - [What are valid combinations?](#flow-valid-sets)
  - [Start playing →](#flow-initial-meld)

- <!-- rule-item: flow-valid-sets -->
  **Valid Combinations**

  ## Groups & Runs
  
  Every set on the table must have **at least 3 tiles**.
  
  ### Group
  3 or 4 tiles of the **same number, different colors**:
  - 🔴7 🔵7 ⚫7 ✅
  - 🔴7 🔵7 ✖️ (only 2 tiles)
  
  ### Run
  3+ tiles of the **same color, consecutive numbers**:
  - 🔴3 🔴4 🔴5 ✅
  - 🔵8 🔵9 🔵10 🔵11 🔵12 ✅
  
  > ⚠️ 1 cannot follow 13 — no wrapping (12-13-1 is invalid).

  ![A red run 5-6-7, or three 8s as a group](/images/rules/rummikub/sets-runs.svg)

  Related topics: 
  - [How to make the initial meld?](#flow-initial-meld)
  - [Joker rules](#flow-joker)

- <!-- rule-item: flow-initial-meld -->
  **Initial Meld**

  ## Initial Meld (≥ 30 points)
  
  Your very first play must meet these requirements:
  
  1. Place sets from your rack with a **total face value ≥ 30**
  2. You may play **multiple sets** to reach 30
  3. **Cannot** use or manipulate tiles already on the table
  4. Jokers count as the value of the tile they represent
  
  ### Can't reach 30?
  → Draw **1 tile** from the pool. Turn over.
  
  > 💡 Common opening: 10+10+10 = 30, or 9+10+11 = 30

  ![First play must total at least 30 from your own tiles](/images/rules/rummikub/initial-30.svg)

  Related topics: 
  - [Done! What next? →](#flow-regular-turn)
  - [What are valid combinations?](#flow-valid-sets)

- <!-- rule-item: flow-regular-turn -->
  **Regular Turn**

  ## Your Turn
  
  After completing your initial meld, each turn you may:
  
  - **Play new sets** from your rack
  - **Add tiles** to existing sets on the table
  - **Manipulate** tiles on the table (rearrange, split, combine)
  - **Any combination** of the above — no limit!
  
  ### Can't or don't want to play?
  → Draw **1 tile** from the pool. Turn ends.
  
  > ⏱️ Time limit: **1 minute** per turn. Exceeding it = draw 1 penalty tile.

  Related topics: 
  - [How to manipulate tiles?](#flow-manipulation)
  - [Joker rules](#flow-joker)
  - [Someone emptied their rack!](#flow-game-end)
  - [Time limit & penalties](#flow-penalties)

- <!-- rule-item: flow-manipulation -->
  **Manipulation Rules**

  ## Manipulation — The Core Strategy
  
  You can freely rearrange **any tiles on the table**, as long as all tiles end up in valid sets when your turn ends.
  
  | Action | Example |
  |--------|---------|
  | **Split a run** | 🔴3-4-5-6-7 → 🔴3-4-5 + 🔴5-6-7 (add 🔴5 from rack) |
  | **Take 4th tile** | ⚫8🔵8🔴8🟠8 → take 🟠8 for new set |
  | **Combine sets** | Break apart + reassemble into new valid sets |
  | **Extend a run** | 🔵4-5-6 → 🔵3-4-5-6 (add 🔵3 from rack) |
  
  > ⚠️ **Golden Rule**: At the end of your turn, every tile on the table must belong to a valid group or run. No orphans!
  
  > ❌ If you can't complete the manipulation: restore everything to its original state, take back your tiles, and draw **3 penalty tiles**.

  Related topics: 
  - [Back to my turn](#flow-regular-turn)
  - [Joker rules](#flow-joker)
  - [Strategy tips](#flow-strategy)

- <!-- rule-item: flow-joker -->
  **Joker Rules**

  ## Joker
  
  A joker can **substitute for any tile** in a group or run.
  
  ### Replacing a Joker
  - If you hold the **exact tile** a joker represents, you may swap it out
  - The freed joker **must be used immediately** in a new set on the table
  - You **cannot** take a joker back to your rack
  
  ### Scoring
  - In initial meld: counts as the value of the tile it represents
  - Left on rack at game end: **30-point penalty**
  
  > 💡 Use jokers early — holding them is risky!

  ![A joker stands in for any tile and counts as that tile’s value](/images/rules/rummikub/joker.svg)

  Related topics: 
  - [Back to my turn](#flow-regular-turn)
  - [How does scoring work?](#flow-game-end)

- <!-- rule-item: flow-penalties -->
  **Time Limit & Penalties**

  ## Time Limit & Penalties
  
  | Situation | Penalty |
  |-----------|----------|
  | Turn exceeds **1 minute** | Draw 1 tile, turn ends |
  | Failed manipulation | Restore all tiles, take back yours, draw **3 penalty tiles** |
  
  ### Failed Manipulation
  If you rearrange tiles on the table but **can't form all valid sets** before time runs out:
  1. Put all table tiles back to their original positions
  2. Take back any tiles you played from your rack
  3. Draw **3 tiles** from the pool as penalty
  4. Your turn ends immediately

  Related topics: 
  - [Back to my turn](#flow-regular-turn)
  - [Game end & scoring](#flow-game-end)

- <!-- rule-item: flow-game-end -->
  **Game End & Scoring**

  ## Game End
  
  ### Normal End
  A player plays their last tile and calls **"Rummikub!"**
  
  ### Pool Depleted
  If the pool runs out and no one can play, the player with the **lowest rack total** wins.
  
  ## Scoring
  
  | Player | Score |
  |--------|-------|
  | Winner | **+** sum of all losers' tile values |
  | Losers | **−** face value of tiles on rack |
  | Joker on rack | counts as **30 points** |
  
  ### Multi-Round
  - Play as many rounds as players (4 players = 4 rounds)
  - Highest **cumulative score** wins
  - Tiebreaker: most rounds won

  Related topics: 
  - [Play again!](#flow-setup)
  - [Strategy tips](#flow-strategy)
  - [Review turn rules](#flow-regular-turn)

- <!-- rule-item: flow-strategy -->
  **Strategy Tips**

  ## Strategy Tips
  
  1. **Complete your initial meld ASAP** — you can't manipulate until you do
  2. **Watch opponents** — frequent draws = weak hand, few draws = close to winning
  3. **Mind the clock** — practice manipulation to avoid the 3-tile penalty
  4. **Use jokers early** — 30-point penalty for holding them is devastating
  5. **Keep versatile tiles** — tiles like 6, 7, 8 in popular colors connect to more combinations
  6. **Don't hoard** — playing tiles gives you more manipulation options
  7. **Plan before you touch** — visualize the full manipulation chain before moving tiles

  Related topics: 
  - [Back to setup](#flow-setup)
  - [Review turn rules](#flow-regular-turn)

