# Rummikub Rules

## Overview

Rummikub is a tile-based game for 2-4 players that combines elements of Rummy and Mahjong. Players arrange numbered tiles into groups and runs, aiming to be the first to play all tiles from their rack.

## Components

- **106 numbered tiles**: 1-13 in four colors (black, red, blue, orange), 2 sets per color
- **2 Joker tiles**
- **4 tile racks**

## Setup

1. Place all 106 tiles face-down on the table and mix them thoroughly
2. Each player draws **14 tiles** and places them on their rack
3. Remaining tiles form the **pool**
4. Determine first player: each player draws one tile — highest number goes first (return tiles to pool)

## Valid Combinations

All tiles played must form one of these combinations, each with **at least 3 tiles**:

### Group

3 or 4 tiles of the **same number in different colors**.

| Example | Description |
|---------|-------------|
| 🔴7 🔵7 ⚫7 | Three-color 7s |
| 🔴10 🔵10 ⚫10 🟠10 | Four-color 10s |

### Run

3 or more tiles of the **same color in consecutive numbers**.

| Example | Description |
|---------|-------------|
| 🔴3 🔴4 🔴5 | Red 3-4-5 |
| 🔵8 🔵9 🔵10 🔵11 🔵12 | Blue 8-12 |

> Note: 1 cannot follow 13 to wrap around (12-13-1 is invalid).

## Gameplay

### Initial Meld

- Your first play must total **at least 30 points** (sum of tile face values)
- You may play multiple sets to reach 30 points
- You **cannot** manipulate existing table tiles for your initial meld
- Jokers count as the value of the tile they represent
- If you can't reach 30, draw 1 tile from the pool and end your turn

### Regular Turns

After completing your initial meld, each turn you may:

1. **Play new sets**: Place new groups or runs from your rack
2. **Extend existing sets**: Add tiles from your rack to sets on the table
3. **Manipulate table tiles**: Rearrange tiles on the table (see Manipulation Rules below)
4. **Combine all of the above** — no limit on actions per turn

If you can't or choose not to play, draw 1 tile from the pool and end your turn.

### Manipulation Rules (Core Strategy)

Manipulation is the heart of Rummikub strategy. You may freely rearrange tiles on the table, as long as **all tiles form valid combinations** at the end of your turn:

| Action | Example |
|--------|---------|
| **Split a run** | 🔴3-4-5-6-7 → 🔴3-4-5 + 🔴5-6-7 (adding 🔴5 from rack) |
| **Remove 4th tile** | ⚫8 🔵8 🔴8 🟠8 → Take 🟠8 for use elsewhere |
| **Combine sets** | Break apart multiple sets and reassemble into new valid ones |
| **Extend a run** | 🔵4-5-6 → 🔵3-4-5-6 (adding 🔵3 from rack) |

> ⚠️ At the end of your turn, no tiles on the table may be left "orphaned." Every tile must belong to a valid group or run.

## Jokers

- A joker can **substitute for any tile**
- In the initial meld, a joker counts as the value of the tile it represents
- Any player holding the **exact tile** a joker represents may replace it
- The freed joker **must be used immediately** in a new combination on the table — it cannot be taken to the rack
- Jokers left on rack at game end incur a **30-point penalty**

## Time Limit & Penalties

| Situation | Penalty |
|-----------|---------|
| Turn exceeds time limit (1 minute) | Draw 1 tile, turn ends |
| Failed manipulation (can't restore valid state) | Restore original state, take back played tiles, draw **3 penalty tiles** |

## Game End & Scoring

### Normal End

When a player plays their last tile, they call **"Rummikub!"** and the round ends.

- Other players sum the face values of tiles remaining on their racks as **negative points**
- Jokers count as **30 points**
- The winner receives a **positive score** equal to the total of all other players' negative points

### Pool Depleted

If the pool runs out and no one has emptied their rack:

- Player with the **lowest tile total** wins the round
- Each player subtracts the winner's total from their own — the difference is their negative score
- The winner receives the sum of all negative scores as positive points

### Multi-Round Play

- Recommended: play as many rounds as there are players (e.g., 4 players = 4 rounds)
- After all rounds, the player with the **highest cumulative score** wins
- Tiebreaker: player who **won the most rounds**

## Strategy Tips

- Complete your initial meld of 30 points as soon as possible to unlock manipulation
- Watch how often opponents draw tiles to gauge their hand strength
- Mind the clock during manipulation to avoid penalties
- Use jokers wisely — don't hold them too long (30-point penalty is steep)
- Keep versatile tiles that can fit multiple combinations for greater flexibility
