# Go Rules

## Overview

Go (Weiqi / Baduk) is an abstract strategy board game for two players, originating in China over 2,500 years ago. Players alternate placing black and white stones on the intersections of a grid, battling for territory through surrounding, attacking, and making trade-offs.

The rules are remarkably simple, but the possibilities are nearly infinite — which is why Go is considered one of the deepest strategy games in existence.

---

## Components

- Go board (goban): standard **19×19** grid (beginners may use **13×13** or **9×9**)
- 181 black stones
- 180 white stones
- Stone bowls

---

## Setup

1. Place the board between the two players.
2. One player takes black, the other takes white.
3. The board starts empty.
4. **Black plays first.**

---

# How to Play

## Placing Stones

Players alternate placing one stone of their color on any vacant **intersection** (where the lines cross).

- Stones are placed on intersections, not inside the squares.
- Once placed, stones do not move unless captured.
- A player may **pass** at any time, skipping their turn.
- Two consecutive passes end the game.

---

## Groups and Liberties

Every stone depends on adjacent empty intersections to "breathe." These empty intersections are called **liberties**.

Stones of the same color connected orthogonally (not diagonally) form a **group**, and the entire group shares all its liberties.

For example:

```
● ●
  ●
```

These three black stones belong to the same group and share their surrounding empty intersections as liberties.

---

## Capture

When a group's **last liberty** is filled by an opponent stone, the entire group is immediately captured and removed from the board.

Captured stones are called **prisoners**.

For example:

```
○ ○ ○
○ ● +
○ ○ ○
```

Where **+** marks Black's next move.

After playing:

```
○ ○ ○
○ ● ●
○ ○ ○
```

The white group's last liberty is filled, so it is immediately captured.

---

## The Ko Rule

Sometimes a position allows infinite back-and-forth capture of a single stone — this is called a **ko**.

To prevent endless loops, the **ko rule** states:

> **Immediate recapture is forbidden.**

After a ko capture, the other player must play elsewhere on the board first. Only after the opponent has played away can the ko be retaken.

---

## Life and Death

Not all stones remain on the board at the end of the game.

- **Alive**: a group that can survive on the board indefinitely.
- **Dead**: a group that cannot escape and will inevitably be captured.

A group that has (or can make) **two separate eyes** can guarantee survival — this is called **two-eye life**.

---

## Territory

**Territory** is the set of empty intersections completely enclosed by a player's living groups.

Neutral points shared by both players (such as dame in seki) **do not count as territory** for either side.

---

# Game End

The game ends when both players pass consecutively.

The following steps are then performed:

1. Players agree which groups are dead.
2. Dead stones are removed from the board.
3. Each player's score is calculated.
4. The player with the higher score wins.

---

## Scoring Methods

Different rulesets use different scoring methods.

### Chinese Rules (Area Scoring)

Your score is:

> **Living stones on the board + your surrounded territory**

Prisoners are **not counted separately**.

---

### Japanese Rules (Territory Scoring)

Your score is:

> **Your surrounded territory + prisoners captured**

---

## Komi

Because Black has the advantage of moving first, White receives **komi** as compensation.

Standard values:

- Chinese rules: **7.5 points**
- Japanese rules: **6.5 points**

The **0.5** prevents draws.

---

# Handicap System

When there is a large skill gap between players, the handicap system can balance the game.

Rules:

- The weaker player takes black.
- Handicap stones are placed on designated star points before the game starts.
- White plays first.
- Common handicap: **2–9 stones**.
- Handicap games typically have no komi.

---

# Strategy Concepts

Go has simple rules but extraordinary strategic depth. Beginners can start by mastering these core principles.

---

## Make Every Move Count

Every stone should do real work.

Strong moves often serve multiple purposes at once:

- Expanding your own territory;
- Limiting your opponent's development;
- Reinforcing your own weak groups;
- Attacking thin or vulnerable opponent shapes.

Avoid passively following your opponent's moves.

---

## Assess Strong and Weak Groups

Go is not about capturing the most stones — it is about who ends up with more territory.

Before each move, ask yourself:

- Which groups are already safe?
- Which groups are still in danger?
- Which groups need attention first?

A group that is already alive usually does not need further reinforcement.

---

## Corners, Sides, Center

Territory efficiency follows this order:

> **Corners ＞ Sides ＞ Center**

Corners naturally have two edges helping to enclose territory. Sides have one. The center is open on all four sides.

Beginners should generally follow:

> **Occupy corners → Approach or enclose corners → Extend along sides → Develop the center last**

---

## Using Thickness

Thickness is a solid, secure group of stones.

Its greatest value is not directly enclosing territory, but providing support for distant expansion and making the opponent wary of approaching.

Once you have built thickness, you can usually expand further away rather than playing tightly around it.

---

## Sente and Gote

After you play a move:

- If your opponent must respond, you retain **sente** (initiative).
- If your opponent can ignore it, you have lost the initiative.

Before every move, it is worth asking:

> **If I were my opponent, would I need to answer this immediately?**

---

# Special Rules

## Suicide

In general, playing a stone that leaves your own group without liberties is forbidden.

The only exception is:

> If the move simultaneously captures opponent stones and gives your group liberties again, the move is allowed.

---

## Seki (Mutual Life)

When opposing groups are mutually dependent — where whoever plays first puts themselves in danger — the position is called **seki**.

Both groups in seki are treated as alive, and the neutral points shared between them **do not count as territory** for either side.

---

## Dame

**Dame** are neutral points between territories that either player can fill but do not affect the final score.

These are typically filled before formally counting.
