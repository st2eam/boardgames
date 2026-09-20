# Texas Hold'em Rules
<!-- rule-section: overview -->
## Overview

Texas Hold'em is the most widely played poker variant in the world. Each player receives 2 private hole cards and combines them with 5 community cards to make the best 5-card hand. The game blends probability, psychology, and risk management — easy to learn, endlessly deep in strategy.
<!-- rule-section: game-objective -->
## Game Objective

In Texas Hold’em, you are a poker player trying to read opponents as well as the board. Your goal is to win chips: either make the best five-card hand at showdown, or make every other player fold first.
<!-- rule-section: components -->
## Components

- Standard 52-card deck, no jokers
- Chips
- 2–10 players; standard cash games use 6-max or 9-max tables
<!-- rule-section: dealer-blinds -->
## Dealer & Blinds

1. The **Dealer Button** marks the nominal dealer. After each hand, the button rotates one seat clockwise, and the blinds move with it — ensuring every player faces the same positions over time.
2. The player left of the button posts the **Small Blind (SB)**; the next player left posts the **Big Blind (BB)**.
3. Blinds are forced bets placed before any cards are dealt. BB is the base betting unit; SB is typically half of BB.
4. Each player receives 2 hole cards face down, visible only to themselves.

---
<!-- rule-section: basic-rules -->
## Basic Rules
<!-- rule-section: betting-rounds -->
## Betting Rounds

![Two hole cards plus the flop; turn and river still down](/images/rules/texas-hold-em/streets.svg)

A hand consists of four betting rounds:

| Round | Action |
|-------|--------|
| **Pre-flop** | Burn 0 cards → 0 community cards → action starts with UTG (left of BB) |
| **Flop** | Burn 1 card → deal 3 community cards face up → action starts with SB |
| **Turn** | Burn 1 card → deal 1 community card (4 total) → another betting round |
| **River** | Burn 1 card → deal 1 community card (5 total) → final betting round |

After the final betting round comes **showdown**:

- If the last round had a bet that was called, **the last player who bet or raised shows first**. Remaining players may show or muck in turn order.
- If no bet was made on the river, the first player left of the button still in the hand shows first.
- The best 5-card hand wins the pot.
<!-- rule-section: available-actions -->
## Available Actions

![Fold, call, or raise when facing a bet](/images/rules/texas-hold-em/actions.svg)

| Action | Condition | Description |
|--------|-----------|-------------|
| **Fold** | Any time | Discard your hand and forfeit the pot |
| **Check** | No bet this round | Pass without wagering |
| **Bet** | No bet this round | Open with a wager |
| **Call** | Facing a bet | Match the current highest bet |
| **Raise** | Facing a bet | Increase the bet. Minimum total after raise = current bet + the last full raise increment |
| **All-in** | Any time | Push all remaining chips in |

> ⚠️ **Note**: An all-in that is less than a full raise does **not** reopen the betting for players who have already acted. E.g., A bets 100, B goes all-in for 150 (under-raise), C calls — A may only call, not raise.
<!-- rule-section: community-card-rule -->
## Community Card Rule

> 💡 **Core rule**: Your final hand is exactly 5 cards. You may use **0, 1, or 2** of your hole cards combined with community cards. The system automatically selects the best 5-card combination from the 7 available cards.

For example, with A♥ A♦ in hand and K♠ K♣ K♥ Q♠ Q♥ on the board, your best five are **K♠ K♣ K♥ A♥ A♦** (a full house), not A♥ A♦ K♠ K♣ K♥ (two pair).
<!-- rule-section: hand-rankings-highest-to-lowest -->
## Hand Rankings (Highest to Lowest)

![From royal flush down to high card](/images/rules/texas-hold-em/hand-ranks.svg)
| Rank | Hand | Example | Notes |
|:---:|------|---------|-------|
| 1 | **Royal Flush** 🏆 | A♠ K♠ Q♠ J♠ 10♠ | Suited 10-J-Q-K-A |
| 2 | **Straight Flush** | 5♣ 6♣ 7♣ 8♣ 9♣ | Suited and sequential |
| 3 | **Four of a Kind** | K K K K 2 | Four cards of same rank |
| 4 | **Full House** | Q Q Q 7 7 | Three of a kind + a pair |
| 5 | **Flush** | A♥ J♥ 8♥ 5♥ 2♥ | Same suit, not sequential |
| 6 | **Straight** | 4 5 6 7 8 | Sequential, mixed suits |
| 7 | **Three of a Kind** | J J J 4 9 | Three cards of same rank |
| 8 | **Two Pair** | A A 8 8 3 | Two separate pairs |
| 9 | **One Pair** | K K 7 4 2 | One pair |
| 10 | **High Card** | A J 8 5 2 | No combination |

> Ace works at both ends: A-2-3-4-5 (the Wheel) is the lowest straight; 10-J-Q-K-A (Broadway) is the highest.
>
> ⚠️ **Suits have no rank.** Spades are not higher than hearts. Flushes are compared by card ranks, not suits. Two royal flushes always split the pot.
>
> 💡 **Hand ranks are absolute**: a higher-ranked hand always beats a lower-ranked one. There is no "a flush is only slightly better than a straight" — it simply wins. Two pair is five cards total (two pairs + a kicker), not four cards.
<!-- rule-section: comparing-hands -->
## Comparing Hands

When players share the same hand type:

| Hand | How to Compare |
|------|---------------|
| Royal Flush | Always a tie — split the pot |
| Straight Flush / Straight | Highest card. A-2-3-4-5 is lowest |
| Four of a Kind | Quad rank → kicker |
| Full House | Trips rank → pair rank |
| Flush | Highest to lowest, card by card |
| Three of a Kind | Trips rank → kickers |
| Two Pair | Higher pair → lower pair → kicker |
| One Pair | Pair rank → kickers |
| High Card | Highest to lowest, card by card |
<!-- rule-section: split-pot -->
## Split Pot

If two or more players have identical best five-card hands (same ranks, suits irrelevant for comparison), the pot is divided equally.

> **Common scenario:** Board is A♠ K♥ Q♦ J♣ 10♠. Every player still in the hand has a Broadway straight. Regardless of hole cards, the pot is split evenly among all remaining players.

---
<!-- rule-section: pots-odds -->
## Pots & Odds
<!-- rule-section: all-in-side-pots -->
## All-In & Side Pots

A player may go all-in by pushing all remaining chips at any time. When an all-in player has fewer chips than the full bet:

1. A **main pot** is formed from the all-in player's contribution, matched by others
2. Excess chips form **side pots** — only players who cover the bet compete
3. All-in players can only win pots they contributed to

> **Example:** Player A (500) all-in, B (1500) calls, C (1500) calls. Main pot = 500 × 3 = 1500 (A/B/C compete). Side pot = 1000 × 2 = 2000 (B/C only).
>
> 💡 Going all-in only risks the chips you put in — you can never lose more than your stack.
<!-- rule-section: pot-odds -->
## Pot Odds

**Pot odds** are the mathematical basis for calling decisions.

> **Formula:** Equity needed = Call amount ÷ (Current pot + Call amount)

**Example:** Pot is 1000, opponent bets 500. You call 500. Total pot after your call = 2000. Equity needed = 500 ÷ 2000 = **25%**. Your hand must win at least 25% of the time for calling to be profitable.

**Equity reference table:**

| Outs | Flop → Turn | Flop → River (2 streets) |
|:---:|:---:|:---:|
| 4 | 8% | 16% |
| 6 | 13% | 24% |
| 8 | 17% | 31% |
| 9 | 19% | 35% |
| 12 | 26% | 45% |
| 15 | 33% | 54% |

> **Quick math:** Flop to river (two streets) ≈ Outs × 4; Turn to river (one street) ≈ Outs × 2

---
<!-- rule-section: position -->
## Position

Position is the single most important concept in Texas Hold'em. **The later you act, the more information you have — and the greater your edge.**
<!-- rule-section: 6-max-seat-order -->
## 6-Max Seat Order

From earliest to latest post-flop:

| Position | Description |
|----------|-------------|
| **SB (Small Blind)** | First to act post-flop; worst position |
| **BB (Big Blind)** | Last to act pre-flop with Option |
| **UTG (Under the Gun)** | First to act pre-flop; least information |
| **HJ (Hijack)** | Middle-late position; flexible strategy |
| **CO (Cutoff)** | Left of BTN; wide opening ranges |
| **BTN (Button)** | **Best position** — always last post-flop |

> **Action order:** Pre-flop, action starts from UTG and proceeds clockwise. Post-flop, action starts from SB. BTN always acts last post-flop.
<!-- rule-section: preflop-starting-hand-strategy -->
## Preflop Starting Hand Strategy

The most important preflop decision: **RFI (Raise First In)** — everyone folds to you. Do you play this hand?

Core principle: **The later your position, the more hands you can play.** A hand worth folding from UTG might be an easy raise from the Button.

This page's companion **Preflop Trainer** helps you memorize correct RFI decisions for every hand in every position. Practice until the ranges become instinct.

---
<!-- rule-section: strategy-guide -->
## Strategy Guide

The following are not rules — they are strategic frameworks to improve your game.
<!-- rule-section: position-matters-more-than-your-cards -->
## Position Matters More Than Your Cards

KJo (king-jack offsuit) is a **fold** from UTG and an **easy raise** from the Button. The cards haven't changed — your information advantage has. Before looking at your cards, know your seat.
<!-- rule-section: bet-good-hands-fold-bad-ones -->
## Bet Good Hands, Fold Bad Ones

Texas Hold'em is about **winning more when ahead and losing less when behind**. Don't call "just to see a flop." Most starting hands are not worth playing. Fold them.
<!-- rule-section: respect-the-information-in-bets -->
## Respect the Information in Bets

Every bet tells you something. A preflop 3-bet signals extreme strength (QQ+, AK range). Large bets usually mean confidence. Most of the time, they have it.
<!-- rule-section: only-call-when-the-math-works -->
## Only Call When the Math Works

Before any call, ask: How much am I putting in? How much can I win? How likely am I to hit? If those three don't line up, folding is the rational choice.
<!-- rule-section: master-preflop-before-the-rest -->
## Master Preflop Before the Rest

Preflop decisions are the foundation. If you're unsure which hands to play and which to fold, post-flop complexity will only compound the confusion. Drill RFI ranges with the Preflop Trainer first — post-flop can wait.

---
<!-- rule-section: common-terms -->
## Common Terms
<!-- rule-section: betting-terms -->
## Betting Terms

| Term | Description |
|------|-------------|
| **3-bet** | Third bet (blind → raise → re-raise); signals strength or a polarized bluff |
| **4-bet** | Re-raise over a 3-bet |
| **C-bet (Continuation bet)** | Pre-flop raiser bets again on the flop to maintain initiative |
| **Check-Raise** | Check to induce a bet, then raise |
| **Limp** | Call only the big blind preflop without raising (generally discouraged) |
| **Steal** | Raise from late position with a weak hand to win the blinds |
| **Squeeze** | Large 3-bet after a raise and one or more callers |
<!-- rule-section: strategy-terms -->
## Strategy Terms

| Term | Description |
|------|-------------|
| **Outs** | Cards remaining that complete your hand |
| **Equity** | The theoretical probability of your hand winning at showdown |
| **Range** | The set of all possible hands a player could hold in a given situation |
| **Draw** | An incomplete hand needing specific cards |
| **Semi-Bluff** | Betting with a draw — still has equity if called |
| **Implied Odds** | Expected future winnings if you complete your draw |
| **SPR (Stack-to-Pot Ratio)** | Remaining stack divided by pot size; key to post-flop planning |
| **Nuts** | The best possible hand on the current board |
| **Kicker** | Tie-breaking card when sharing the same hand type |
| **VPIP** | Voluntarily Put $ In Pot — a metric tracking how often a player enters pots |
<!-- rule-section: board-texture-terms -->
## Board Texture Terms

| Term | Description |
|------|-------------|
| **Broadway** | 10-J-Q-K-A straight (the highest straight) |
| **Wheel** | A-2-3-4-5 straight (the lowest straight) |
| **Rainbow** | Flop with three different suits — no flush draw possible |
| **Wet Board** | Board with many draw possibilities (connected/suited) |
| **Dry Board** | Board with few draws (scattered, disconnected) |
| **Set** | Three of a kind using a pocket pair + one community card |
| **Trips** | Three of a kind using one hole card + a paired board |
<!-- rule-section: topic-guide -->
## Quick reference
Jump directly to the rule topic you need.

- <!-- rule-item: flow-setup -->
  **Game Setup**

  ## Components
  
  - 1 standard **52-card deck** (no jokers)
  - **Poker chips** for betting
  - **Dealer button** to track dealing position
  
  ## Setup Steps
  
  1. **Choose a dealer** — the button marks the dealer seat.
  2. **Post blinds** — the two players left of the dealer post forced bets (see **Blinds**).
  3. **Deal hole cards** — each player receives **2 cards face down**.
  4. After each hand, the **button rotates clockwise** to the next player.
  
  ## Player Count
  
  Texas Hold'em works with **2–10 players**. With fewer than 5 players, some seats may be empty but blind positions still rotate.

  Related topics: 
  - [Blinds & Positions](#flow-blinds)
  - [Pre-Flop](#flow-preflop)
  - [Hand Rankings](#flow-hand-rankings)

- <!-- rule-item: flow-blinds -->
  **Blinds & Positions**

  ## Positions
  
  | Position | Description |
  |----------|-------------|
  | **Dealer (Button)** | Last to act post-flop; best position |
  | **Small Blind (SB)** | Left of dealer; posts half the big blind |
  | **Big Blind (BB)** | Left of SB; posts full forced bet |
  
  ## Blind Structure
  
  - **Small Blind** = typically ½ of the big blind
  - **Big Blind** = the minimum bet for the hand
  - Blinds are **forced bets** posted before cards are dealt
  - In tournaments, blinds increase on a schedule
  
  ## Heads-Up (2 Players)
  
  The dealer posts the **small blind** and acts first pre-flop. The other player posts the **big blind** and acts last pre-flop.
  
  ## After the Hand
  
  The button moves one seat clockwise. New SB and BB are always the two players immediately left of the button.

  Related topics: 
  - [Pre-Flop](#flow-preflop)
  - [Betting Actions](#flow-betting)
  - [Back to Setup](#flow-setup)

- <!-- rule-item: flow-preflop -->
  **Pre-Flop**

  ## What Happens
  
  1. Each player receives **2 hole cards** (face down).
  2. SB and BB are already posted.
  3. First betting round begins.
  
  ## Action Order
  
  - **First to act**: player **left of the Big Blind** (Under the Gun)
  - Action proceeds **clockwise**
  - **Last to act pre-flop**: the Big Blind (may check if no raise)
  
  ## Available Actions
  
  - **Fold** — discard your hand
  - **Call** — match the big blind
  - **Raise** — bet more than the big blind
  
  > No **check** is possible pre-flop unless you are the BB facing no raise.
  
  ## Next Step
  
  If 2+ players remain after betting, proceed to the **Flop**.

  ![Fold, call, or raise when facing a bet](/images/rules/texas-hold-em/actions.svg)

  Related topics: 
  - [The Flop](#flow-flop)
  - [Betting Actions](#flow-betting)
  - [Blinds & Positions](#flow-blinds)

- <!-- rule-item: flow-flop -->
  **The Flop**

  ## What Happens
  
  1. **Burn** one card face down.
  2. Deal **3 community cards** face up on the table.
  3. Second betting round begins.
  
  ## Action Order
  
  - First active player **left of the dealer (button)** acts first
  - Proceeds clockwise
  - Dealer acts last (best position)
  
  ## Building Your Hand
  
  You now have **5 cards to evaluate**: your 2 hole cards + 3 community cards. Your best hand uses exactly **5 cards total** from the 7 available.
  
  ## Next Step
  
  If 2+ players remain, proceed to the **Turn**.

  Related topics: 
  - [The Turn](#flow-turn)
  - [Pre-Flop](#flow-preflop)
  - [Betting Actions](#flow-betting)
  - [Hand Rankings](#flow-hand-rankings)

- <!-- rule-item: flow-turn -->
  **The Turn**

  ## What Happens
  
  1. **Burn** one card face down.
  2. Deal the **4th community card** (the Turn) face up.
  3. Third betting round begins.
  
  ## Action Order
  
  Same as the Flop — first active player left of the button acts first, clockwise.
  
  ## Strategy Note
  
  The Turn often shifts pot odds significantly. You now have **6 cards** to choose from (2 hole + 4 community) to make your best 5-card hand.
  
  ## Next Step
  
  If 2+ players remain, proceed to the **River**.

  Related topics: 
  - [The River](#flow-river)
  - [The Flop](#flow-flop)
  - [Betting Actions](#flow-betting)
  - [Showdown](#flow-showdown)

- <!-- rule-item: flow-river -->
  **The River**

  ## What Happens
  
  1. **Burn** one card face down.
  2. Deal the **5th and final community card** (the River) face up.
  3. **Final betting round** begins.
  
  ## Action Order
  
  Same as Flop and Turn — first active player left of the button acts first.
  
  ## All Cards Revealed
  
  All 5 community cards are now on the table. Each remaining player has **7 total cards** (2 hole + 5 community) to form the best 5-card hand.
  
  ## Next Step
  
  - If **one player remains** after betting → they win the pot (no showdown needed).
  - If **2+ players remain** → proceed to **Showdown**.

  Related topics: 
  - [Showdown](#flow-showdown)
  - [The Turn](#flow-turn)
  - [Betting Actions](#flow-betting)
  - [Hand Rankings](#flow-hand-rankings)

- <!-- rule-item: flow-showdown -->
  **Showdown**

  ## When Showdown Happens
  
  Showdown occurs when **2 or more players remain** after the final (River) betting round.
  
  ## Procedure
  
  1. Last aggressor (last player to bet/raise) **shows first**, or if checked through, first player left of button shows first.
  2. Remaining players may **show or muck** (fold face-down) if beaten.
  3. Each player makes the **best 5-card hand** from their 2 hole cards + 5 community cards.
  
  ## Determining the Winner
  
  - Compare hands using **Hand Rankings** (highest wins).
  - If hands tie, the pot is **split equally**.
  - **Kicker** cards break ties within the same hand rank.
  
  ## No Showdown
  
  If all other players **fold** at any point, the last remaining player wins the pot **without revealing** their cards.

  Related topics: 
  - [Hand Rankings](#flow-hand-rankings)
  - [The River](#flow-river)
  - [Betting Actions](#flow-betting)
  - [New Hand (Setup)](#flow-setup)

- <!-- rule-item: flow-betting -->
  **Betting Actions**

  ## Available Actions
  
  | Action | When Available |
  |--------|----------------|
  | **Check** | No bet has been made in this round; pass action |
  | **Bet** | No bet yet; wager chips to open betting |
  | **Call** | Match the current highest bet |
  | **Raise** | Increase the current bet (must be at least min raise) |
  | **Fold** | Give up your hand; forfeit any chips already in the pot |
  | **All-In** | Bet all remaining chips at any time |
  
  ## All-In & Side Pots
  
  When a player goes **all-in** for less than a full call or raise:
  - A **main pot** is created for chips they can win
  - **Side pots** are created for additional bets between remaining players
  - All-in players can only win pots they contributed to
  
  ## Minimum Raise
  
  A raise must be at least the size of the **previous bet or raise** in that round.
  
  ## Betting Round Ends When
  
  All active players have **matched the highest bet** (or folded).

  ![Two hole cards plus the flop; turn and river still down](/images/rules/texas-hold-em/streets.svg)

  Related topics: 
  - [Pre-Flop](#flow-preflop)
  - [The Flop](#flow-flop)
  - [The Turn](#flow-turn)
  - [The River](#flow-river)

- <!-- rule-item: flow-hand-rankings -->
  **Hand Rankings**

  ## From Highest to Lowest
  
  | Rank | Hand | Example |
  |------|------|---------|
  | 1 | **Royal Flush** | A♠ K♠ Q♠ J♠ 10♠ |
  | 2 | **Straight Flush** | 9♥ 8♥ 7♥ 6♥ 5♥ |
  | 3 | **Four of a Kind** | K♣ K♦ K♥ K♠ 7♣ |
  | 4 | **Full House** | Q♦ Q♣ Q♠ 4♥ 4♦ |
  | 5 | **Flush** | A♦ J♦ 8♦ 4♦ 2♦ |
  | 6 | **Straight** | 10♣ 9♦ 8♠ 7♥ 6♣ |
  | 7 | **Three of a Kind** | 7♠ 7♥ 7♦ K♣ 2♠ |
  | 8 | **Two Pair** | J♣ J♦ 4♠ 4♥ A♣ |
  | 9 | **One Pair** | 9♠ 9♣ K♦ 7♥ 3♠ |
  | 10 | **High Card** | A♦ J♣ 8♠ 5♥ 2♣ |
  
  ## Kicker Rules (Tiebreakers)
  
  When hands are the **same type**, compare using kickers:
  
  - **Four of a Kind** → compare quad rank, then 1 kicker
  - **Full House** → compare trips rank, then pair rank
  - **Flush / High Card** → compare all 5 cards high to low
  - **Straight / Straight Flush** → compare top card only (same = split)
  - **Three of a Kind** → compare trips, then 2 kickers
  - **Two Pair** → compare high pair, low pair, then 1 kicker
  - **One Pair** → compare pair, then 3 kickers
  
  **Example:** 9-9-A-K-7 beats 9-9-A-Q-J (2nd kicker K > Q).
  
  If all 5 cards match in rank → **split the pot**. Suits never break ties. Ace can be high (A-K-Q-J-10) or low (A-2-3-4-5).

  ![From royal flush down to high card](/images/rules/texas-hold-em/hand-ranks.svg)

  Related topics: 
  - [Showdown](#flow-showdown)
  - [Betting Actions](#flow-betting)
  - [Back to Setup](#flow-setup)
<!-- rule-section: topic-guide-2 -->
## Quick reference
Jump directly to the rule topic you need.

- <!-- rule-item: flow-setup -->
  **Game Setup**

  ## Components
  
  - 1 standard **52-card deck** (no jokers)
  - **Poker chips** for betting
  - **Dealer button** to track dealing position
  
  ## Setup Steps
  
  1. **Choose a dealer** — the button marks the dealer seat.
  2. **Post blinds** — the two players left of the dealer post forced bets (see **Blinds**).
  3. **Deal hole cards** — each player receives **2 cards face down**.
  4. After each hand, the **button rotates clockwise** to the next player.
  
  ## Player Count
  
  Texas Hold'em works with **2–10 players**. With fewer than 5 players, some seats may be empty but blind positions still rotate.

  Related topics: 
  - [Blinds & Positions](#flow-blinds)
  - [Pre-Flop](#flow-preflop)
  - [Hand Rankings](#flow-hand-rankings)

- <!-- rule-item: flow-blinds -->
  **Blinds & Positions**

  ## Positions
  
  | Position | Description |
  |----------|-------------|
  | **Dealer (Button)** | Last to act post-flop; best position |
  | **Small Blind (SB)** | Left of dealer; posts half the big blind |
  | **Big Blind (BB)** | Left of SB; posts full forced bet |
  
  ## Blind Structure
  
  - **Small Blind** = typically ½ of the big blind
  - **Big Blind** = the minimum bet for the hand
  - Blinds are **forced bets** posted before cards are dealt
  - In tournaments, blinds increase on a schedule
  
  ## Heads-Up (2 Players)
  
  The dealer posts the **small blind** and acts first pre-flop. The other player posts the **big blind** and acts last pre-flop.
  
  ## After the Hand
  
  The button moves one seat clockwise. New SB and BB are always the two players immediately left of the button.

  Related topics: 
  - [Pre-Flop](#flow-preflop)
  - [Betting Actions](#flow-betting)
  - [Back to Setup](#flow-setup)

- <!-- rule-item: flow-preflop -->
  **Pre-Flop**

  ## What Happens
  
  1. Each player receives **2 hole cards** (face down).
  2. SB and BB are already posted.
  3. First betting round begins.
  
  ## Action Order
  
  - **First to act**: player **left of the Big Blind** (Under the Gun)
  - Action proceeds **clockwise**
  - **Last to act pre-flop**: the Big Blind (may check if no raise)
  
  ## Available Actions
  
  - **Fold** — discard your hand
  - **Call** — match the big blind
  - **Raise** — bet more than the big blind
  
  > No **check** is possible pre-flop unless you are the BB facing no raise.
  
  ## Next Step
  
  If 2+ players remain after betting, proceed to the **Flop**.

  ![Fold, call, or raise when facing a bet](/images/rules/texas-hold-em/actions.svg)

  Related topics: 
  - [The Flop](#flow-flop)
  - [Betting Actions](#flow-betting)
  - [Blinds & Positions](#flow-blinds)

- <!-- rule-item: flow-flop -->
  **The Flop**

  ## What Happens
  
  1. **Burn** one card face down.
  2. Deal **3 community cards** face up on the table.
  3. Second betting round begins.
  
  ## Action Order
  
  - First active player **left of the dealer (button)** acts first
  - Proceeds clockwise
  - Dealer acts last (best position)
  
  ## Building Your Hand
  
  You now have **5 cards to evaluate**: your 2 hole cards + 3 community cards. Your best hand uses exactly **5 cards total** from the 7 available.
  
  ## Next Step
  
  If 2+ players remain, proceed to the **Turn**.

  Related topics: 
  - [The Turn](#flow-turn)
  - [Pre-Flop](#flow-preflop)
  - [Betting Actions](#flow-betting)
  - [Hand Rankings](#flow-hand-rankings)

- <!-- rule-item: flow-turn -->
  **The Turn**

  ## What Happens
  
  1. **Burn** one card face down.
  2. Deal the **4th community card** (the Turn) face up.
  3. Third betting round begins.
  
  ## Action Order
  
  Same as the Flop — first active player left of the button acts first, clockwise.
  
  ## Strategy Note
  
  The Turn often shifts pot odds significantly. You now have **6 cards** to choose from (2 hole + 4 community) to make your best 5-card hand.
  
  ## Next Step
  
  If 2+ players remain, proceed to the **River**.

  Related topics: 
  - [The River](#flow-river)
  - [The Flop](#flow-flop)
  - [Betting Actions](#flow-betting)
  - [Showdown](#flow-showdown)

- <!-- rule-item: flow-river -->
  **The River**

  ## What Happens
  
  1. **Burn** one card face down.
  2. Deal the **5th and final community card** (the River) face up.
  3. **Final betting round** begins.
  
  ## Action Order
  
  Same as Flop and Turn — first active player left of the button acts first.
  
  ## All Cards Revealed
  
  All 5 community cards are now on the table. Each remaining player has **7 total cards** (2 hole + 5 community) to form the best 5-card hand.
  
  ## Next Step
  
  - If **one player remains** after betting → they win the pot (no showdown needed).
  - If **2+ players remain** → proceed to **Showdown**.

  Related topics: 
  - [Showdown](#flow-showdown)
  - [The Turn](#flow-turn)
  - [Betting Actions](#flow-betting)
  - [Hand Rankings](#flow-hand-rankings)

- <!-- rule-item: flow-showdown -->
  **Showdown**

  ## When Showdown Happens
  
  Showdown occurs when **2 or more players remain** after the final (River) betting round.
  
  ## Procedure
  
  1. Last aggressor (last player to bet/raise) **shows first**, or if checked through, first player left of button shows first.
  2. Remaining players may **show or muck** (fold face-down) if beaten.
  3. Each player makes the **best 5-card hand** from their 2 hole cards + 5 community cards.
  
  ## Determining the Winner
  
  - Compare hands using **Hand Rankings** (highest wins).
  - If hands tie, the pot is **split equally**.
  - **Kicker** cards break ties within the same hand rank.
  
  ## No Showdown
  
  If all other players **fold** at any point, the last remaining player wins the pot **without revealing** their cards.

  Related topics: 
  - [Hand Rankings](#flow-hand-rankings)
  - [The River](#flow-river)
  - [Betting Actions](#flow-betting)
  - [New Hand (Setup)](#flow-setup)

- <!-- rule-item: flow-betting -->
  **Betting Actions**

  ## Available Actions
  
  | Action | When Available |
  |--------|----------------|
  | **Check** | No bet has been made in this round; pass action |
  | **Bet** | No bet yet; wager chips to open betting |
  | **Call** | Match the current highest bet |
  | **Raise** | Increase the current bet (must be at least min raise) |
  | **Fold** | Give up your hand; forfeit any chips already in the pot |
  | **All-In** | Bet all remaining chips at any time |
  
  ## All-In & Side Pots
  
  When a player goes **all-in** for less than a full call or raise:
  - A **main pot** is created for chips they can win
  - **Side pots** are created for additional bets between remaining players
  - All-in players can only win pots they contributed to
  
  ## Minimum Raise
  
  A raise must be at least the size of the **previous bet or raise** in that round.
  
  ## Betting Round Ends When
  
  All active players have **matched the highest bet** (or folded).

  ![Two hole cards plus the flop; turn and river still down](/images/rules/texas-hold-em/streets.svg)

  Related topics: 
  - [Pre-Flop](#flow-preflop)
  - [The Flop](#flow-flop)
  - [The Turn](#flow-turn)
  - [The River](#flow-river)

- <!-- rule-item: flow-hand-rankings -->
  **Hand Rankings**

  ## From Highest to Lowest
  
  | Rank | Hand | Example |
  |------|------|---------|
  | 1 | **Royal Flush** | A♠ K♠ Q♠ J♠ 10♠ |
  | 2 | **Straight Flush** | 9♥ 8♥ 7♥ 6♥ 5♥ |
  | 3 | **Four of a Kind** | K♣ K♦ K♥ K♠ 7♣ |
  | 4 | **Full House** | Q♦ Q♣ Q♠ 4♥ 4♦ |
  | 5 | **Flush** | A♦ J♦ 8♦ 4♦ 2♦ |
  | 6 | **Straight** | 10♣ 9♦ 8♠ 7♥ 6♣ |
  | 7 | **Three of a Kind** | 7♠ 7♥ 7♦ K♣ 2♠ |
  | 8 | **Two Pair** | J♣ J♦ 4♠ 4♥ A♣ |
  | 9 | **One Pair** | 9♠ 9♣ K♦ 7♥ 3♠ |
  | 10 | **High Card** | A♦ J♣ 8♠ 5♥ 2♣ |
  
  ## Kicker Rules (Tiebreakers)
  
  When hands are the **same type**, compare using kickers:
  
  - **Four of a Kind** → compare quad rank, then 1 kicker
  - **Full House** → compare trips rank, then pair rank
  - **Flush / High Card** → compare all 5 cards high to low
  - **Straight / Straight Flush** → compare top card only (same = split)
  - **Three of a Kind** → compare trips, then 2 kickers
  - **Two Pair** → compare high pair, low pair, then 1 kicker
  - **One Pair** → compare pair, then 3 kickers
  
  **Example:** 9-9-A-K-7 beats 9-9-A-Q-J (2nd kicker K > Q).
  
  If all 5 cards match in rank → **split the pot**. Suits never break ties. Ace can be high (A-K-Q-J-10) or low (A-2-3-4-5).

  ![From royal flush down to high card](/images/rules/texas-hold-em/hand-ranks.svg)

  Related topics: 
  - [Showdown](#flow-showdown)
  - [Betting Actions](#flow-betting)
  - [Back to Setup](#flow-setup)
<!-- rule-section: topic-guide-3 -->
## Quick reference
Jump directly to the rule topic you need.

- <!-- rule-item: flow-setup -->
  **Game Setup**

  ## Components
  
  - 1 standard **52-card deck** (no jokers)
  - **Poker chips** for betting
  - **Dealer button** to track dealing position
  
  ## Setup Steps
  
  1. **Choose a dealer** — the button marks the dealer seat.
  2. **Post blinds** — the two players left of the dealer post forced bets (see **Blinds**).
  3. **Deal hole cards** — each player receives **2 cards face down**.
  4. After each hand, the **button rotates clockwise** to the next player.
  
  ## Player Count
  
  Texas Hold'em works with **2–10 players**. With fewer than 5 players, some seats may be empty but blind positions still rotate.

  Related topics: 
  - [Blinds & Positions](#flow-blinds)
  - [Pre-Flop](#flow-preflop)
  - [Hand Rankings](#flow-hand-rankings)

- <!-- rule-item: flow-blinds -->
  **Blinds & Positions**

  ## Positions
  
  | Position | Description |
  |----------|-------------|
  | **Dealer (Button)** | Last to act post-flop; best position |
  | **Small Blind (SB)** | Left of dealer; posts half the big blind |
  | **Big Blind (BB)** | Left of SB; posts full forced bet |
  
  ## Blind Structure
  
  - **Small Blind** = typically ½ of the big blind
  - **Big Blind** = the minimum bet for the hand
  - Blinds are **forced bets** posted before cards are dealt
  - In tournaments, blinds increase on a schedule
  
  ## Heads-Up (2 Players)
  
  The dealer posts the **small blind** and acts first pre-flop. The other player posts the **big blind** and acts last pre-flop.
  
  ## After the Hand
  
  The button moves one seat clockwise. New SB and BB are always the two players immediately left of the button.

  Related topics: 
  - [Pre-Flop](#flow-preflop)
  - [Betting Actions](#flow-betting)
  - [Back to Setup](#flow-setup)

- <!-- rule-item: flow-preflop -->
  **Pre-Flop**

  ## What Happens
  
  1. Each player receives **2 hole cards** (face down).
  2. SB and BB are already posted.
  3. First betting round begins.
  
  ## Action Order
  
  - **First to act**: player **left of the Big Blind** (Under the Gun)
  - Action proceeds **clockwise**
  - **Last to act pre-flop**: the Big Blind (may check if no raise)
  
  ## Available Actions
  
  - **Fold** — discard your hand
  - **Call** — match the big blind
  - **Raise** — bet more than the big blind
  
  > No **check** is possible pre-flop unless you are the BB facing no raise.
  
  ## Next Step
  
  If 2+ players remain after betting, proceed to the **Flop**.

  ![Fold, call, or raise when facing a bet](/images/rules/texas-hold-em/actions.svg)

  Related topics: 
  - [The Flop](#flow-flop)
  - [Betting Actions](#flow-betting)
  - [Blinds & Positions](#flow-blinds)

- <!-- rule-item: flow-flop -->
  **The Flop**

  ## What Happens
  
  1. **Burn** one card face down.
  2. Deal **3 community cards** face up on the table.
  3. Second betting round begins.
  
  ## Action Order
  
  - First active player **left of the dealer (button)** acts first
  - Proceeds clockwise
  - Dealer acts last (best position)
  
  ## Building Your Hand
  
  You now have **5 cards to evaluate**: your 2 hole cards + 3 community cards. Your best hand uses exactly **5 cards total** from the 7 available.
  
  ## Next Step
  
  If 2+ players remain, proceed to the **Turn**.

  Related topics: 
  - [The Turn](#flow-turn)
  - [Pre-Flop](#flow-preflop)
  - [Betting Actions](#flow-betting)
  - [Hand Rankings](#flow-hand-rankings)

- <!-- rule-item: flow-turn -->
  **The Turn**

  ## What Happens
  
  1. **Burn** one card face down.
  2. Deal the **4th community card** (the Turn) face up.
  3. Third betting round begins.
  
  ## Action Order
  
  Same as the Flop — first active player left of the button acts first, clockwise.
  
  ## Strategy Note
  
  The Turn often shifts pot odds significantly. You now have **6 cards** to choose from (2 hole + 4 community) to make your best 5-card hand.
  
  ## Next Step
  
  If 2+ players remain, proceed to the **River**.

  Related topics: 
  - [The River](#flow-river)
  - [The Flop](#flow-flop)
  - [Betting Actions](#flow-betting)
  - [Showdown](#flow-showdown)

- <!-- rule-item: flow-river -->
  **The River**

  ## What Happens
  
  1. **Burn** one card face down.
  2. Deal the **5th and final community card** (the River) face up.
  3. **Final betting round** begins.
  
  ## Action Order
  
  Same as Flop and Turn — first active player left of the button acts first.
  
  ## All Cards Revealed
  
  All 5 community cards are now on the table. Each remaining player has **7 total cards** (2 hole + 5 community) to form the best 5-card hand.
  
  ## Next Step
  
  - If **one player remains** after betting → they win the pot (no showdown needed).
  - If **2+ players remain** → proceed to **Showdown**.

  Related topics: 
  - [Showdown](#flow-showdown)
  - [The Turn](#flow-turn)
  - [Betting Actions](#flow-betting)
  - [Hand Rankings](#flow-hand-rankings)

- <!-- rule-item: flow-showdown -->
  **Showdown**

  ## When Showdown Happens
  
  Showdown occurs when **2 or more players remain** after the final (River) betting round.
  
  ## Procedure
  
  1. Last aggressor (last player to bet/raise) **shows first**, or if checked through, first player left of button shows first.
  2. Remaining players may **show or muck** (fold face-down) if beaten.
  3. Each player makes the **best 5-card hand** from their 2 hole cards + 5 community cards.
  
  ## Determining the Winner
  
  - Compare hands using **Hand Rankings** (highest wins).
  - If hands tie, the pot is **split equally**.
  - **Kicker** cards break ties within the same hand rank.
  
  ## No Showdown
  
  If all other players **fold** at any point, the last remaining player wins the pot **without revealing** their cards.

  Related topics: 
  - [Hand Rankings](#flow-hand-rankings)
  - [The River](#flow-river)
  - [Betting Actions](#flow-betting)
  - [New Hand (Setup)](#flow-setup)

- <!-- rule-item: flow-betting -->
  **Betting Actions**

  ## Available Actions
  
  | Action | When Available |
  |--------|----------------|
  | **Check** | No bet has been made in this round; pass action |
  | **Bet** | No bet yet; wager chips to open betting |
  | **Call** | Match the current highest bet |
  | **Raise** | Increase the current bet (must be at least min raise) |
  | **Fold** | Give up your hand; forfeit any chips already in the pot |
  | **All-In** | Bet all remaining chips at any time |
  
  ## All-In & Side Pots
  
  When a player goes **all-in** for less than a full call or raise:
  - A **main pot** is created for chips they can win
  - **Side pots** are created for additional bets between remaining players
  - All-in players can only win pots they contributed to
  
  ## Minimum Raise
  
  A raise must be at least the size of the **previous bet or raise** in that round.
  
  ## Betting Round Ends When
  
  All active players have **matched the highest bet** (or folded).

  ![Two hole cards plus the flop; turn and river still down](/images/rules/texas-hold-em/streets.svg)

  Related topics: 
  - [Pre-Flop](#flow-preflop)
  - [The Flop](#flow-flop)
  - [The Turn](#flow-turn)
  - [The River](#flow-river)

- <!-- rule-item: flow-hand-rankings -->
  **Hand Rankings**

  ## From Highest to Lowest
  
  | Rank | Hand | Example |
  |------|------|---------|
  | 1 | **Royal Flush** | A♠ K♠ Q♠ J♠ 10♠ |
  | 2 | **Straight Flush** | 9♥ 8♥ 7♥ 6♥ 5♥ |
  | 3 | **Four of a Kind** | K♣ K♦ K♥ K♠ 7♣ |
  | 4 | **Full House** | Q♦ Q♣ Q♠ 4♥ 4♦ |
  | 5 | **Flush** | A♦ J♦ 8♦ 4♦ 2♦ |
  | 6 | **Straight** | 10♣ 9♦ 8♠ 7♥ 6♣ |
  | 7 | **Three of a Kind** | 7♠ 7♥ 7♦ K♣ 2♠ |
  | 8 | **Two Pair** | J♣ J♦ 4♠ 4♥ A♣ |
  | 9 | **One Pair** | 9♠ 9♣ K♦ 7♥ 3♠ |
  | 10 | **High Card** | A♦ J♣ 8♠ 5♥ 2♣ |
  
  ## Kicker Rules (Tiebreakers)
  
  When hands are the **same type**, compare using kickers:
  
  - **Four of a Kind** → compare quad rank, then 1 kicker
  - **Full House** → compare trips rank, then pair rank
  - **Flush / High Card** → compare all 5 cards high to low
  - **Straight / Straight Flush** → compare top card only (same = split)
  - **Three of a Kind** → compare trips, then 2 kickers
  - **Two Pair** → compare high pair, low pair, then 1 kicker
  - **One Pair** → compare pair, then 3 kickers
  
  **Example:** 9-9-A-K-7 beats 9-9-A-Q-J (2nd kicker K > Q).
  
  If all 5 cards match in rank → **split the pot**. Suits never break ties. Ace can be high (A-K-Q-J-10) or low (A-2-3-4-5).

  ![From royal flush down to high card](/images/rules/texas-hold-em/hand-ranks.svg)

  Related topics: 
  - [Showdown](#flow-showdown)
  - [Betting Actions](#flow-betting)
  - [Back to Setup](#flow-setup)

<!-- rule-section: topic-guide-4 -->
## Quick reference
<!-- rule-ui: sidebar -->

Jump directly to the rule topic you need.

- <!-- rule-item: flow-setup -->
  **Game Setup**

  ## Components
  
  - 1 standard **52-card deck** (no jokers)
  - **Poker chips** for betting
  - **Dealer button** to track dealing position
  
  ## Setup Steps
  
  1. **Choose a dealer** — the button marks the dealer seat.
  2. **Post blinds** — the two players left of the dealer post forced bets (see **Blinds**).
  3. **Deal hole cards** — each player receives **2 cards face down**.
  4. After each hand, the **button rotates clockwise** to the next player.
  
  ## Player Count
  
  Texas Hold'em works with **2–10 players**. With fewer than 5 players, some seats may be empty but blind positions still rotate.

  Related topics: 
  - [Blinds & Positions](#flow-blinds)
  - [Pre-Flop](#flow-preflop)
  - [Hand Rankings](#flow-hand-rankings)

- <!-- rule-item: flow-blinds -->
  **Blinds & Positions**

  ## Positions
  
  | Position | Description |
  |----------|-------------|
  | **Dealer (Button)** | Last to act post-flop; best position |
  | **Small Blind (SB)** | Left of dealer; posts half the big blind |
  | **Big Blind (BB)** | Left of SB; posts full forced bet |
  
  ## Blind Structure
  
  - **Small Blind** = typically ½ of the big blind
  - **Big Blind** = the minimum bet for the hand
  - Blinds are **forced bets** posted before cards are dealt
  - In tournaments, blinds increase on a schedule
  
  ## Heads-Up (2 Players)
  
  The dealer posts the **small blind** and acts first pre-flop. The other player posts the **big blind** and acts last pre-flop.
  
  ## After the Hand
  
  The button moves one seat clockwise. New SB and BB are always the two players immediately left of the button.

  Related topics: 
  - [Pre-Flop](#flow-preflop)
  - [Betting Actions](#flow-betting)
  - [Back to Setup](#flow-setup)

- <!-- rule-item: flow-preflop -->
  **Pre-Flop**

  ## What Happens
  
  1. Each player receives **2 hole cards** (face down).
  2. SB and BB are already posted.
  3. First betting round begins.
  
  ## Action Order
  
  - **First to act**: player **left of the Big Blind** (Under the Gun)
  - Action proceeds **clockwise**
  - **Last to act pre-flop**: the Big Blind (may check if no raise)
  
  ## Available Actions
  
  - **Fold** — discard your hand
  - **Call** — match the big blind
  - **Raise** — bet more than the big blind
  
  > No **check** is possible pre-flop unless you are the BB facing no raise.
  
  ## Next Step
  
  If 2+ players remain after betting, proceed to the **Flop**.

  ![Fold, call, or raise when facing a bet](/images/rules/texas-hold-em/actions.svg)

  Related topics: 
  - [The Flop](#flow-flop)
  - [Betting Actions](#flow-betting)
  - [Blinds & Positions](#flow-blinds)

- <!-- rule-item: flow-flop -->
  **The Flop**

  ## What Happens
  
  1. **Burn** one card face down.
  2. Deal **3 community cards** face up on the table.
  3. Second betting round begins.
  
  ## Action Order
  
  - First active player **left of the dealer (button)** acts first
  - Proceeds clockwise
  - Dealer acts last (best position)
  
  ## Building Your Hand
  
  You now have **5 cards to evaluate**: your 2 hole cards + 3 community cards. Your best hand uses exactly **5 cards total** from the 7 available.
  
  ## Next Step
  
  If 2+ players remain, proceed to the **Turn**.

  Related topics: 
  - [The Turn](#flow-turn)
  - [Pre-Flop](#flow-preflop)
  - [Betting Actions](#flow-betting)
  - [Hand Rankings](#flow-hand-rankings)

- <!-- rule-item: flow-turn -->
  **The Turn**

  ## What Happens
  
  1. **Burn** one card face down.
  2. Deal the **4th community card** (the Turn) face up.
  3. Third betting round begins.
  
  ## Action Order
  
  Same as the Flop — first active player left of the button acts first, clockwise.
  
  ## Strategy Note
  
  The Turn often shifts pot odds significantly. You now have **6 cards** to choose from (2 hole + 4 community) to make your best 5-card hand.
  
  ## Next Step
  
  If 2+ players remain, proceed to the **River**.

  Related topics: 
  - [The River](#flow-river)
  - [The Flop](#flow-flop)
  - [Betting Actions](#flow-betting)
  - [Showdown](#flow-showdown)

- <!-- rule-item: flow-river -->
  **The River**

  ## What Happens
  
  1. **Burn** one card face down.
  2. Deal the **5th and final community card** (the River) face up.
  3. **Final betting round** begins.
  
  ## Action Order
  
  Same as Flop and Turn — first active player left of the button acts first.
  
  ## All Cards Revealed
  
  All 5 community cards are now on the table. Each remaining player has **7 total cards** (2 hole + 5 community) to form the best 5-card hand.
  
  ## Next Step
  
  - If **one player remains** after betting → they win the pot (no showdown needed).
  - If **2+ players remain** → proceed to **Showdown**.

  Related topics: 
  - [Showdown](#flow-showdown)
  - [The Turn](#flow-turn)
  - [Betting Actions](#flow-betting)
  - [Hand Rankings](#flow-hand-rankings)

- <!-- rule-item: flow-showdown -->
  **Showdown**

  ## When Showdown Happens
  
  Showdown occurs when **2 or more players remain** after the final (River) betting round.
  
  ## Procedure
  
  1. Last aggressor (last player to bet/raise) **shows first**, or if checked through, first player left of button shows first.
  2. Remaining players may **show or muck** (fold face-down) if beaten.
  3. Each player makes the **best 5-card hand** from their 2 hole cards + 5 community cards.
  
  ## Determining the Winner
  
  - Compare hands using **Hand Rankings** (highest wins).
  - If hands tie, the pot is **split equally**.
  - **Kicker** cards break ties within the same hand rank.
  
  ## No Showdown
  
  If all other players **fold** at any point, the last remaining player wins the pot **without revealing** their cards.

  Related topics: 
  - [Hand Rankings](#flow-hand-rankings)
  - [The River](#flow-river)
  - [Betting Actions](#flow-betting)
  - [New Hand (Setup)](#flow-setup)

- <!-- rule-item: flow-betting -->
  **Betting Actions**

  ## Available Actions
  
  | Action | When Available |
  |--------|----------------|
  | **Check** | No bet has been made in this round; pass action |
  | **Bet** | No bet yet; wager chips to open betting |
  | **Call** | Match the current highest bet |
  | **Raise** | Increase the current bet (must be at least min raise) |
  | **Fold** | Give up your hand; forfeit any chips already in the pot |
  | **All-In** | Bet all remaining chips at any time |
  
  ## All-In & Side Pots
  
  When a player goes **all-in** for less than a full call or raise:
  - A **main pot** is created for chips they can win
  - **Side pots** are created for additional bets between remaining players
  - All-in players can only win pots they contributed to
  
  ## Minimum Raise
  
  A raise must be at least the size of the **previous bet or raise** in that round.
  
  ## Betting Round Ends When
  
  All active players have **matched the highest bet** (or folded).

  ![Two hole cards plus the flop; turn and river still down](/images/rules/texas-hold-em/streets.svg)

  Related topics: 
  - [Pre-Flop](#flow-preflop)
  - [The Flop](#flow-flop)
  - [The Turn](#flow-turn)
  - [The River](#flow-river)

- <!-- rule-item: flow-hand-rankings -->
  **Hand Rankings**

  ## From Highest to Lowest
  
  | Rank | Hand | Example |
  |------|------|---------|
  | 1 | **Royal Flush** | A♠ K♠ Q♠ J♠ 10♠ |
  | 2 | **Straight Flush** | 9♥ 8♥ 7♥ 6♥ 5♥ |
  | 3 | **Four of a Kind** | K♣ K♦ K♥ K♠ 7♣ |
  | 4 | **Full House** | Q♦ Q♣ Q♠ 4♥ 4♦ |
  | 5 | **Flush** | A♦ J♦ 8♦ 4♦ 2♦ |
  | 6 | **Straight** | 10♣ 9♦ 8♠ 7♥ 6♣ |
  | 7 | **Three of a Kind** | 7♠ 7♥ 7♦ K♣ 2♠ |
  | 8 | **Two Pair** | J♣ J♦ 4♠ 4♥ A♣ |
  | 9 | **One Pair** | 9♠ 9♣ K♦ 7♥ 3♠ |
  | 10 | **High Card** | A♦ J♣ 8♠ 5♥ 2♣ |
  
  ## Kicker Rules (Tiebreakers)
  
  When hands are the **same type**, compare using kickers:
  
  - **Four of a Kind** → compare quad rank, then 1 kicker
  - **Full House** → compare trips rank, then pair rank
  - **Flush / High Card** → compare all 5 cards high to low
  - **Straight / Straight Flush** → compare top card only (same = split)
  - **Three of a Kind** → compare trips, then 2 kickers
  - **Two Pair** → compare high pair, low pair, then 1 kicker
  - **One Pair** → compare pair, then 3 kickers
  
  **Example:** 9-9-A-K-7 beats 9-9-A-Q-J (2nd kicker K > Q).
  
  If all 5 cards match in rank → **split the pot**. Suits never break ties. Ace can be high (A-K-Q-J-10) or low (A-2-3-4-5).

  ![From royal flush down to high card](/images/rules/texas-hold-em/hand-ranks.svg)

  Related topics: 
  - [Showdown](#flow-showdown)
  - [Betting Actions](#flow-betting)
  - [Back to Setup](#flow-setup)

