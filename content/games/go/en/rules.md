# Go Rules

## Overview

Go (Weiqi / Baduk) is an abstract strategy board game for two players, originating in China over 2,500 years ago. Players alternate placing black and white stones on the intersections of a grid, battling for territory through surrounding, attacking, and making trade-offs.

The rules are remarkably simple, but the possibilities are nearly infinite — which is why Go is considered one of the deepest strategy games in existence.

## Components

- Go board (goban): standard **19×19** grid (beginners may use **13×13** or **9×9**)
- Black and white stones, roughly **180 of each**
- Stone bowls

## Setup

1. Place the board between the two players.
2. One player takes black, the other takes white.
3. The board starts empty.
4. **Black plays first.**

---

# Basic Rules

## Placing Stones

Players alternate placing one stone of their color on any vacant **intersection** (where the lines cross).

- Stones are placed on intersections, not inside the squares.
- Once placed, stones do not move unless captured.
- A player may **pass** at any time, skipping their turn.
- You cannot play on an intersection with no liberties (**illegal point**), unless the move captures opponent stones and gains liberties as a result.
- When both players agree there is nothing left to play and pass consecutively, the game ends.

## Groups and Liberties

Every stone depends on adjacent empty intersections to "breathe." These empty intersections are called **liberties**.

Stones of the same color connected orthogonally (not diagonally) form a **group** (or chain), and the entire group shares all its liberties.

For example:

```
● ●
  ●
```

These three black stones belong to the same group and share their surrounding empty intersections as liberties.

## Capture

When a group's **last liberty** is filled by an opponent stone, the entire group is immediately **captured** and removed from the board.

For example:

```
● ● ●
● ○ +
● ● ●
```

Where **+** marks White's next move.

After playing:

```
● ● ●
● ○ ○
● ● ●
```

The black group's last liberty is filled, so it is immediately captured.

## The Ko Rule

Sometimes a position allows infinite back-and-forth capture of a single stone — this is called a **ko**.

The simplest ko shape:

```
  ●
● ○ ●
  +
```

White can play at **+** to capture the marked black stone. But Black cannot immediately recapture at the same spot — otherwise the position would loop forever.

To prevent endless loops, the **ko rule** states:

> **Immediate recapture is forbidden.**

After a ko capture, the other player must play elsewhere on the board first (a **ko threat**). Only after the opponent has played away can the ko be retaken.

---

# Endgame & Scoring

## Game End

The game ends when both players agree there is nothing left to play and pass consecutively.

The following steps are then performed:

1. Players agree which groups are dead.
2. Dead stones are removed from the board.
3. Each player's score is calculated.
4. The player with the higher score wins.

## Life and Death

Not all stones remain on the board at the end of the game.

- **Alive**: a group that can survive on the board indefinitely.
- **Dead**: a group that cannot escape and will inevitably be captured.

An **eye** is one or more empty intersections completely enclosed by stones of the same color. A group with only one eye will eventually be filled and captured; a group with **two separate, unconnected eyes** can never be captured — the opponent cannot fill both at once. This is called **two-eye life**.

## Territory

**Territory** is the set of empty intersections completely enclosed by a player's living groups.

Neutral points shared by both players (such as dame in seki) **do not count as territory** for either side.

## Scoring Methods

Different rulesets use different scoring methods.

### Chinese Rules (Area Scoring)

Your score is:

> **Living stones on the board + your surrounded territory**

Prisoners are **not counted separately**.

### Japanese Rules (Territory Scoring)

Your score is:

> **Your surrounded territory + prisoners captured**

## Komi

Because Black has the advantage of moving first, White receives **komi** as compensation.

Standard values:

- Chinese rules: **3¾ points** (equivalent to ~7.5 points)
- Japanese rules: **6.5 points**

The fractional value prevents draws.

---

# Special Rules

## Illegal Points & Suicide

An **illegal point** is an intersection where playing would leave your own group without liberties — unless the move also captures opponent stones and gains liberties as a result. Such moves are generally forbidden.

The exception: if the move simultaneously captures opponent stones and gives your group liberties again, the move is allowed.

## Seki (Mutual Life)

When opposing groups are mutually dependent — where whoever plays first puts themselves in danger — the position is called **seki**.

Both groups in seki are treated as alive, and the neutral points shared between them **do not count as territory** for either side.

## Dame

**Dame** are neutral points between territories that either player can fill. Each side typically takes half, so they do not change the score difference. They are usually filled before formally counting.

---

# Handicap System

When there is a large skill gap between players, the handicap system can balance the game.

Rules:

- The weaker player takes black.
- Handicap stones are placed on designated star points before the game starts.
- White plays first.
- Common handicap: **2–9 stones**.
- Handicap games typically have no komi, but Black must **return stones** at the end (n handicap stones → return n/2 stones).

---

# Strategy Concepts

The following are not rules — they are thinking frameworks to help beginners navigate the board.

## Make Every Move Count

Every stone should do real work.

Strong moves often serve multiple purposes at once:

- Expanding your own territory;
- Limiting your opponent's development;
- Reinforcing your own weak groups;
- Attacking thin or vulnerable opponent shapes.

Avoid passively following your opponent's moves.

## Assess Strong and Weak Groups

Go is not about capturing the most stones — it is about who ends up with more territory.

Before each move, ask yourself:

- Which groups are already safe?
- Which groups are still in danger?
- Which groups need attention first?

A group that is already alive usually does not need further reinforcement.

## Corners, Sides, Center

Territory efficiency follows this order:

> **Corners ＞ Sides ＞ Center**

Corners naturally have two edges helping to enclose territory. Sides have one. The center is open on all four sides.

Beginners should generally follow:

> **Occupy corners → Approach or enclose corners → Extend along sides → Develop the center last**

## Using Thickness

Thickness is a solid, secure group of stones.

Its greatest value is not directly enclosing territory, but providing support for distant expansion and making the opponent wary of approaching.

Once you have built thickness, you can usually expand further away rather than playing tightly around it.

## Sente and Gote

After you play a move:

- If your opponent must respond, you retain **sente** (initiative).
- If your opponent can ignore it, you have lost the initiative.

Before every move, it is worth asking:

> **If I were my opponent, would I need to answer this immediately?**

**Go in one sentence**: Place stones in turns → groups with no liberties are captured → no immediate ko recapture → both pass, count territory → higher score wins.
