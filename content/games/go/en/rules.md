# Go Rules

## Overview

Go (Weiqi / Baduk) is an abstract strategy board game for two players, originating in China over 2,500 years ago. Players alternate placing black and white stones on a grid, aiming to surround more territory than their opponent. Despite simple rules, Go is considered one of the deepest strategy games in existence.

## Components

- Go board (goban): 19×19 grid of lines (beginner: 13×13 or 9×9)
- 181 black stones
- 180 white stones
- Stone bowls

## Setup

1. Place the board between the two players.
2. Black takes the black stones, White takes the white stones.
3. The board starts empty.
4. Black plays first.

## How to Play

### Placing Stones

Players alternate placing one stone of their color on any vacant intersection (where the lines cross). Stones are placed on **intersections**, not inside the squares.

- Once placed, stones do not move (unless captured).
- You may **pass** your turn at any time. Two consecutive passes end the game.

### Liberties and Capture

A stone or group of connected stones has **liberties** — the empty intersections directly adjacent (orthogonally, not diagonally) to the group.

- When a group has **zero liberties**, it is captured and removed from the board.
- Captured stones are kept as prisoners and count as points at the end.

**Example:**
```
. . . . .
. B W . .
. B W . .
. . . . .
```
If Black plays at the remaining liberty of the white stone, the white stone is captured.

### The Ko Rule

A **ko** occurs when a single stone could be captured immediately back and forth, creating an infinite loop. The **ko rule** forbids recapturing a ko immediately — you must play elsewhere first, and your opponent may fill the ko before you can retake it.

### Life and Death

- **Two eyes**: A group is **alive** if it has (or can make) two separate empty spaces (eyes) that cannot both be filled — the opponent cannot capture it.
- **Dead groups**: Groups that cannot form two eyes are **dead** and will be removed as prisoners at the end (under Chinese rules) or left to prove capture (under Japanese rules).

### Territory

**Territory** is the empty intersections surrounded by your stones. At the end:
- **Chinese rules**: Territory + stones on the board count as points.
- **Japanese rules**: Territory + captured prisoners count as points.

## Game End

The game ends when both players pass consecutively. Then:

1. Players agree which groups are dead and remove them as prisoners.
2. Count each player's score:
   - **Area scoring (Chinese)**: Your living stones + your territory.
   - **Territory scoring (Japanese)**: Your territory + prisoners captured.
3. **Komi**: White receives **6.5** points compensation (Chinese rules) or **6.5** points (Japanese rules) for going second. The 0.5 prevents ties.

**The player with the higher score wins.**

## Handicap System

To balance skill differences:
- Weaker player (Black) places handicap stones on designated star points before the game begins.
- White plays first in handicap games.
- Handicap: 2–9 stones, no komi for Black.

## Special Rules

- **Suicide**: Under Chinese rules, playing a stone that results in your own group having zero liberties (self-capture) is **forbidden** unless it also captures opponent stones.
- **Seki (Mutual Life)**: A position where neither player can play without putting their own group in danger. Both groups live without two eyes. Points in seki are neutral — no one scores them.
- **Dame**: Neutral points between territories that don't affect scoring. Fill dame before counting.
