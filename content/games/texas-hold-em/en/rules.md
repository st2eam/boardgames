# Texas Hold'em Rules

## Overview

Texas Hold'em is the most widely played poker variant in the world. Each player receives 2 private hole cards and combines them with 5 community cards to make the best 5-card hand. The game blends probability, psychology, and risk management — easy to learn, endlessly deep in strategy.

---

## Components

- Standard 52-card deck, no jokers
- Chips
- 2–10 players; standard cash games use 6-max or 9-max tables

---

## Dealer & Blinds

1. The **Dealer Button** marks the nominal dealer. After each hand, the button rotates one seat clockwise, and the blinds move with it — ensuring every player faces the same positions over time.
2. The player left of the button posts the **Small Blind (SB)**; the next player left posts the **Big Blind (BB)**.
3. Blinds are forced bets placed before any cards are dealt. BB is the base betting unit; SB is typically half of BB.
4. Each player receives 2 hole cards face down, visible only to themselves.

---

# Basic Rules

## Betting Rounds

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

---

## Available Actions

| Action | Condition | Description |
|--------|-----------|-------------|
| **Fold** | Any time | Discard your hand and forfeit the pot |
| **Check** | No bet this round | Pass without wagering |
| **Bet** | No bet this round | Open with a wager |
| **Call** | Facing a bet | Match the current highest bet |
| **Raise** | Facing a bet | Increase the bet. Minimum total after raise = current bet + the last full raise increment |
| **All-in** | Any time | Push all remaining chips in |

> ⚠️ **Note**: An all-in that is less than a full raise does **not** reopen the betting for players who have already acted. E.g., A bets 100, B goes all-in for 150 (under-raise), C calls — A may only call, not raise.

---

## Community Card Rule

> 💡 **Core rule**: Your final hand is exactly 5 cards. You may use **0, 1, or 2** of your hole cards combined with community cards. The system automatically selects the best 5-card combination from the 7 available cards.

For example, with A♥ A♦ in hand and K♠ K♣ K♥ Q♠ Q♥ on the board, your best five are **K♠ K♣ K♥ A♥ A♦** (a full house), not A♥ A♦ K♠ K♣ K♥ (two pair).

---

## Hand Rankings (Highest to Lowest)

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

---

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

---

## Split Pot

If two or more players have identical best five-card hands (same ranks, suits irrelevant for comparison), the pot is divided equally.

> **Common scenario:** Board is A♠ K♥ Q♦ J♣ 10♠. Every player still in the hand has a Broadway straight. Regardless of hole cards, the pot is split evenly among all remaining players.

---

# Pots & Odds

## All-In & Side Pots

A player may go all-in by pushing all remaining chips at any time. When an all-in player has fewer chips than the full bet:

1. A **main pot** is formed from the all-in player's contribution, matched by others
2. Excess chips form **side pots** — only players who cover the bet compete
3. All-in players can only win pots they contributed to

> **Example:** Player A (500) all-in, B (1500) calls, C (1500) calls. Main pot = 500 × 3 = 1500 (A/B/C compete). Side pot = 1000 × 2 = 2000 (B/C only).

---

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

# Position

Position is the single most important concept in Texas Hold'em. **The later you act, the more information you have — and the greater your edge.**

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

## Full Ring (9-Max) Reference

| Full Ring | 6-Max |
|-----------|--------|
| UTG | — |
| UTG+1 | — |
| MP (Middle Position) | — |
| LJ (Lojack) | UTG |
| HJ | HJ |
| CO | CO |
| BTN | BTN |
| SB | SB |
| BB | BB |

> **Action order:** Pre-flop, action starts from UTG and proceeds clockwise. Post-flop, action starts from SB. BTN always acts last post-flop.

---

## Preflop Starting Hand Strategy

The most important preflop decision: **RFI (Raise First In)** — everyone folds to you. Do you play this hand?

Core principle: **The later your position, the more hands you can play.** A hand worth folding from UTG might be an easy raise from the Button.

This page's companion **Preflop Trainer** helps you memorize correct RFI decisions for every hand in every position. Practice until the ranges become instinct.

---

# Strategy Guide

The following are not rules — they are strategic frameworks to improve your game.

---

## Position Matters More Than Your Cards

KJo (king-jack offsuit) is a **fold** from UTG and an **easy raise** from the Button. The cards haven't changed — your information advantage has. Before looking at your cards, know your seat.

---

## Bet Good Hands, Fold Bad Ones

Texas Hold'em is about **winning more when ahead and losing less when behind**. Don't call "just to see a flop." Most starting hands are not worth playing. Fold them.

---

## Respect the Information in Bets

Every bet tells you something. A preflop 3-bet signals extreme strength (QQ+, AK range). Large bets usually mean confidence. Most of the time, they have it.

---

## Only Call When the Math Works

Before any call, ask: How much am I putting in? How much can I win? How likely am I to hit? If those three don't line up, folding is the rational choice.

---

## Master Preflop Before the Rest

Preflop decisions are the foundation. If you're unsure which hands to play and which to fold, post-flop complexity will only compound the confusion. Drill RFI ranges with the Preflop Trainer first — post-flop can wait.

---

# Common Misconceptions

| Myth | Reality |
|------|---------|
| You must use both hole cards | ❌ You may use 0, 1, or 2 hole cards to make your best five |
| Spades are the highest suit | ❌ Suits have no rank. Flushes compare by card ranks |
| Ace is always the highest card | ❌ Ace can also act as 1 in A-2-3-4-5, the lowest straight |
| A flush is "much bigger" than a straight | ❌ Flush is simply one rank higher on the hand hierarchy — there is no point value |
| If the board shows a royal flush, one player wins | ❌ All remaining players split the pot |
| Two pair means four cards total | ❌ Two pair is two pairs + a kicker — five cards total |
| Three of a kind always beats two pair | ✅ Correct — hand rank is absolute |
| Going all-in means you can lose everything | ❌ You can only lose what you put in; you never owe more than your stack |

---

# Common Terms

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
