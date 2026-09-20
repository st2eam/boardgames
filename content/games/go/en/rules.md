# Go Rules
<!-- rule-section: overview -->
## Overview

Go (Weiqi / Baduk) is an abstract strategy board game for two players, originating in China over 2,500 years ago. Players alternate placing black and white stones on the intersections of a grid, battling for territory through surrounding, attacking, and making trade-offs.

The rules are remarkably simple, but the possibilities are nearly infinite — which is why Go is considered one of the deepest strategy games in existence.
<!-- rule-section: game-objective -->
## Game Objective

In Go, you command either black or white stones on a shared board. Your goal is to surround more territory than your opponent while capturing stones when the chance appears.
<!-- rule-section: components -->
## Components

- Go board (goban): standard **19×19** grid (beginners may use **13×13** or **9×9**)
- Black and white stones, roughly **180 of each**
- Stone bowls
<!-- rule-section: setup -->
## Setup

1. Place the board between the two players.
2. One player takes black, the other takes white.
3. The board starts empty.
4. **Black plays first.**

---
<!-- rule-section: basic-rules -->
## Basic Rules
<!-- rule-section: placing-stones -->
## Placing Stones

Players alternate placing one stone of their color on any vacant **intersection** (where the lines cross).

- Stones are placed on intersections, not inside the squares.
- Once placed, stones do not move unless captured.
- A player may **pass** at any time, skipping their turn.
- You cannot play on an intersection with no liberties (**illegal point**), unless the move captures opponent stones and gains liberties as a result.
- When both players agree there is nothing left to play and pass consecutively, the game ends.
<!-- rule-section: groups-and-liberties -->
## Groups and Liberties

![Two stones share gold-dot liberties](/images/rules/go/liberties.svg)
Every stone depends on adjacent empty intersections to "breathe." These empty intersections are called **liberties**.

Stones of the same color connected orthogonally (not diagonally) form a **group** (or chain), and the entire group shares all its liberties.

For example:

```
● ●
  ●
```

These three black stones belong to the same group and share their surrounding empty intersections as liberties.
<!-- rule-section: capture -->
## Capture

![White is surrounded and taken off](/images/rules/go/capture.svg)
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
<!-- rule-section: the-ko-rule -->
## The Ko Rule

![Cannot recapture the ko point this turn](/images/rules/go/ko.svg)
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
<!-- rule-section: endgame-scoring -->
## Endgame & Scoring
<!-- rule-section: game-end -->
## Game End

The game ends when both players agree there is nothing left to play and pass consecutively.

The following steps are then performed:

1. Players agree which groups are dead.
2. Dead stones are removed from the board.
3. Each player's score is calculated.
4. The player with the higher score wins.
<!-- rule-section: life-and-death -->
## Life and Death

Not all stones remain on the board at the end of the game.
<!-- rule-ui: sidebar -->
- <!-- rule-item: life-and-death-item-1 -->
  **Alive**: a group that can survive on the board indefinitely.
- <!-- rule-item: life-and-death-item-2 -->
  **Dead**: a group that cannot escape and will inevitably be captured.

An **eye** is one or more empty intersections completely enclosed by stones of the same color. A group with only one eye will eventually be filled and captured; a group with **two separate, unconnected eyes** can never be captured — the opponent cannot fill both at once. This is called **two-eye life**.
<!-- rule-section: territory -->
## Territory

**Territory** is the set of empty intersections completely enclosed by a player's living groups.

Neutral points shared by both players (such as dame in seki) **do not count as territory** for either side.
<!-- rule-ui: tabs -->
<!-- rule-section: scoring-methods -->
## Scoring Methods

Different rulesets use different scoring methods.
<!-- rule-section: chinese-rules-area-scoring -->
### Chinese Rules (Area Scoring)

Your score is:

> **Living stones on the board + your surrounded territory**

Prisoners are **not counted separately**.
<!-- rule-section: japanese-rules-territory-scoring -->
### Japanese Rules (Territory Scoring)

Your score is:

> **Your surrounded territory + prisoners captured**
<!-- rule-section: komi -->
## Komi

Because Black has the advantage of moving first, White receives **komi** as compensation.

Standard values:

- Chinese rules: **3¾ points** (equivalent to ~7.5 points)
- Japanese rules: **6.5 points**

The fractional value prevents draws.

---
<!-- rule-section: special-rules -->
## Special Rules
<!-- rule-section: illegal-points-suicide -->
## Illegal Points & Suicide

An **illegal point** is an intersection where playing would leave your own group without liberties — unless the move also captures opponent stones and gains liberties as a result. Such moves are generally forbidden.

The exception: if the move simultaneously captures opponent stones and gives your group liberties again, the move is allowed.
<!-- rule-section: seki-mutual-life -->
## Seki (Mutual Life)

When opposing groups are mutually dependent — where whoever plays first puts themselves in danger — the position is called **seki**.

Both groups in seki are treated as alive, and the neutral points shared between them **do not count as territory** for either side.
<!-- rule-section: dame -->
## Dame

**Dame** are neutral points between territories that either player can fill. Each side typically takes half, so they do not change the score difference. They are usually filled before formally counting.

---
<!-- rule-section: handicap-system -->
## Handicap System

When there is a large skill gap between players, the handicap system can balance the game.

Rules:

- The weaker player takes black.
- Handicap stones are placed on designated star points before the game starts.
- White plays first.
- Common handicap: **2–9 stones**.
- Handicap games typically have no komi, but Black must **return stones** at the end (n handicap stones → return n/2 stones).

---
<!-- rule-section: strategy-concepts -->
## Strategy Concepts

The following are not rules — they are thinking frameworks to help beginners navigate the board.
<!-- rule-section: make-every-move-count -->
## Make Every Move Count

Every stone should do real work.

Strong moves often serve multiple purposes at once:

- Expanding your own territory;
- Limiting your opponent's development;
- Reinforcing your own weak groups;
- Attacking thin or vulnerable opponent shapes.

Avoid passively following your opponent's moves.
<!-- rule-section: assess-strong-and-weak-groups -->
## Assess Strong and Weak Groups

Go is not about capturing the most stones — it is about who ends up with more territory.

Before each move, ask yourself:

- Which groups are already safe?
- Which groups are still in danger?
- Which groups need attention first?

A group that is already alive usually does not need further reinforcement.
<!-- rule-section: corners-sides-center -->
## Corners, Sides, Center

Territory efficiency follows this order:

> **Corners ＞ Sides ＞ Center**

Corners naturally have two edges helping to enclose territory. Sides have one. The center is open on all four sides.

Beginners should generally follow:

> **Occupy corners → Approach or enclose corners → Extend along sides → Develop the center last**
<!-- rule-section: using-thickness -->
## Using Thickness

Thickness is a solid, secure group of stones.

Its greatest value is not directly enclosing territory, but providing support for distant expansion and making the opponent wary of approaching.

Once you have built thickness, you can usually expand further away rather than playing tightly around it.
<!-- rule-section: sente-and-gote -->
## Sente and Gote

After you play a move:

- If your opponent must respond, you retain **sente** (initiative).
- If your opponent can ignore it, you have lost the initiative.

Before every move, it is worth asking:

> **If I were my opponent, would I need to answer this immediately?**

**Go in one sentence**: Place stones in turns → groups with no liberties are captured → no immediate ko recapture → both pass, count territory → higher score wins.
<!-- rule-section: topic-guide -->
## Quick reference
<!-- rule-ui: sidebar -->

Jump directly to the rule topic you need.

- <!-- rule-item: flow-setup -->
  **Setup**

  1. Place the board between two players (19×19 standard, or 13×13 / 9×9 for beginners).
  2. Black takes 181 black stones, White takes 180 white stones.
  3. The board starts empty.
  4. **Black plays first.**
  
  **Handicap games**: Weaker player takes Black and places 2–9 stones on star points. White plays first in handicap games.

  Related topics: 
  - [Placing Stones & Capture](#flow-capture)
  - [Ko Rule](#flow-ko)
  - [Life & Death](#flow-life-death)
  - [Scoring](#flow-scoring)

- <!-- rule-item: flow-capture -->
  **Placing Stones & Capture**

  ### Placing
  - Place one stone on any vacant **intersection** (where lines cross).
  - Stones do not move once placed.
  - You may **pass** at any time. Two consecutive passes end the game.
  
  ### Liberties
  A stone or connected group has **liberties** — orthogonally adjacent empty intersections.
  
  | Position | Liberties |
  |----------|-----------|
  | Center | 4 (up, down, left, right) |
  | Edge | 3 |
  | Corner | 2 |
  
  ### Capture
  When a group has **zero liberties**, it is **captured** and removed from the board. Captured stones are kept as **prisoners** — each worth 1 point at the end.
  
  For example, a lone white stone surrounded on all 4 sides by black stones has 0 liberties and is removed immediately.

  ![White is surrounded and taken off](/images/rules/go/capture.svg)

  Related topics: 
  - [Ko Rule](#flow-ko)
  - [Life & Death](#flow-life-death)
  - [Back to Setup](#flow-setup)

- <!-- rule-item: flow-ko -->
  **The Ko Rule**

  A **ko** (劫) is a position where capturing a single stone could be immediately recaptured, creating an infinite loop.
  
  ### How Ko Happens
  - Black captures a white stone that had only 1 liberty.
  - After capture, the black stone now has only 1 liberty.
  - Without the ko rule, White could immediately recapture, restoring the original position.
  
  ### The Ko Rule
  **You cannot recapture a ko immediately.** You must:
  1. Play **elsewhere** on the board (a *ko threat*).
  2. Your opponent may **fill the ko** (ending it) or respond to your threat.
  3. If they respond elsewhere, you may now retake the ko.
  
  Ko fights are one of the most tactically rich aspects of Go — players build *ko threats* throughout the game.

  ![Cannot recapture the ko point this turn](/images/rules/go/ko.svg)

  Related topics: 
  - [Life & Death](#flow-life-death)
  - [Capture Basics](#flow-capture)
  - [Scoring](#flow-scoring)

- <!-- rule-item: flow-life-death -->
  **Life & Death**

  ### Eyes
  An **eye** is a single empty intersection fully surrounded by stones of one color.
  
  ### Two Eyes = Alive
  A group with **two separate eyes** is unconditionally alive — the opponent can never capture it because they cannot fill both eyes at once (each play would be suicide).
  
  ### Dead Groups
  A group that cannot form two eyes is **dead** — it will eventually be captured. At the end of the game, dead groups are removed as prisoners.
  
  ### Seki (Mutual Life)
  A **seki** is a position where neither player can play without putting their own group at risk. Both groups live in seki without two eyes. The shared liberties (dame) are neutral — neither player scores them.

  ![Two stones share gold-dot liberties](/images/rules/go/liberties.svg)

  Related topics: 
  - [Scoring](#flow-scoring)
  - [Capture Basics](#flow-capture)
  - [Back to Setup](#flow-setup)

- <!-- rule-item: flow-scoring -->
  **Scoring**

  The game ends when both players **pass consecutively**.
  
  ### 1. Remove Dead Stones
  Both players agree which groups are dead → remove as prisoners.
  
  ### 2. Count Score
  
  **Chinese Rules (Area Scoring - 数子法):**
  - Each living stone on the board = 1 point
  - Each surrounded vacant intersection = 1 point
  - **Komi**: White gets **7.5 points** compensation
  
  **Japanese Rules (Territory Scoring - 数目法):**
  - Each surrounded vacant intersection = 1 point
  - Each prisoner captured = 1 point
  - **Komi**: White gets **6.5 points**
  
  ### Komi
  The 0.5 half-point prevents ties (jigo).
  
  ### Winner
  **Higher score wins.** The 0.5 komi means White wins ties (e.g., Black 45 vs White 45 → White wins by 0.5).

  Related topics: 
  - [Life & Death](#flow-life-death)
  - [Ko Rule](#flow-ko)
  - [Back to Setup](#flow-setup)

