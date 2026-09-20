# Blackjack Rules
<!-- rule-section: overview -->
## Overview

Blackjack (also known as 21) is a casino card game where players compete against the dealer. The goal is to get a hand value as close to 21 as possible without exceeding it.
<!-- rule-section: objective -->
## Game Objective

In Blackjack, you are a casino player facing the dealer. Your goal is to beat the dealer with a total as close to 21 as possible without going over.
<!-- rule-section: components -->
## Components

- 1-8 standard 52-card decks (casino typically uses 6-8 decks)
- Chips for betting
<!-- rule-section: card-values -->
## Card Values

![2–10 face value, faces are 10, Ace is 1 or 11](/images/rules/blackjack/card-values.svg)
| Card | Value |
|------|-------|
| 2-10 | Face value |
| J, Q, K | 10 |
| A | 1 or 11 (whichever benefits the hand) |
<!-- rule-ui: tabs -->
<!-- rule-section: flow-intro -->
## Game Flow

![Soft 17 hits a 3 to make 20](/images/rules/blackjack/player-actions.svg)
<!-- rule-section: bet -->
### 1. Place Bets

Players place their bets before any cards are dealt.
<!-- rule-section: deal -->
### 2. Initial Deal

- Each player receives 2 cards face up
- The dealer receives 1 card face up (upcard) and 1 card face down (hole card)
<!-- rule-section: natural -->
### 3. Natural Blackjack

If a player's first two cards total 21 (an Ace + a 10-value card), this is a "Blackjack" or "Natural." It pays 3:2 (or 6:5 in some casinos) unless the dealer also has Blackjack, resulting in a push.
<!-- rule-section: player-actions -->
### 4. Player Actions

Players act in turn, from left to right:

- **Hit**: Take another card. Can hit multiple times until satisfied or busted.
- **Stand**: Keep the current hand, take no more cards.
- **Double Down**: Double the bet, receive exactly one more card, then stand.
- **Split**: If the first two cards have equal value, split them into two separate hands with equal bets. Each hand is played independently.
- **Surrender** (if available): Forfeit half the bet and end the hand immediately.
<!-- rule-section: bust -->
### 5. Bust

If a hand's total exceeds 21, it is a "bust" — the player loses immediately regardless of the dealer's hand.
<!-- rule-section: dealer-turn -->
### 6. Dealer's Turn

After all players have acted:

1. Dealer reveals the hole card
2. Dealer must hit on 16 or below
3. Dealer must stand on 17 or above (some tables: dealer hits on soft 17)
<!-- rule-section: determine-winner -->
### 7. Determining the Winner

| Outcome | Result |
|---------|--------|
| Player busts | Player loses (dealer doesn't need to play) |
| Dealer busts | All remaining players win |
| Player > Dealer | Player wins (pays 1:1) |
| Player = Dealer | Push (bet returned) |
| Player < Dealer | Player loses |
| Player Blackjack | Pays 3:2 |
<!-- rule-section: hard-soft -->
## Hard Hand vs Soft Hand

![Soft 17 still counts the ace as 11](/images/rules/blackjack/hard-vs-soft.svg)
<!-- rule-ui: sidebar -->
- <!-- rule-item: hard-soft-item-1 -->
  **Hard hand**: A hand without an Ace, or where the Ace counts as 1 (e.g., A+6+10 = 17 hard)
- <!-- rule-item: hard-soft-item-2 -->
  **Soft hand**: A hand with an Ace counted as 11 (e.g., A+6 = soft 17)
<!-- rule-section: insurance -->
## Insurance

When the dealer's upcard is an Ace, players may take "Insurance" — a side bet of up to half the original bet. If the dealer has Blackjack, insurance pays 2:1. Otherwise, the insurance bet is lost.
<!-- rule-section: basic-strategy -->
## Basic Strategy Summary

Basic strategy minimizes the house edge by making mathematically optimal decisions based on:
- Your hand total (hard/soft/pair)
- The dealer's upcard

Key principles:
- Always split Aces and 8s
- Never split 10s or 5s
- Double down on 11 against dealer 2-10
- Stand on hard 17+
- Hit on hard 8 or below
<!-- rule-ui: decision start=flow-hand-type -->
<!-- rule-section: decision-guide-4 -->
## Decision helper

Jump directly to the rule topic you need.

<!-- rule-section: flow-hand-type -->
### What type of hand do you have?

Determine your hand type first to find the optimal play.

<!-- rule-choices -->
- [Hard Hand (no Ace as 11)](#flow-hard-total)
- [Soft Hand (Ace counts as 11)](#flow-soft-total)
- [Pair (two same-value cards)](#flow-pair-type)

<!-- rule-section: flow-hard-total -->
### Hard Hand — Your Total?

Select your hard hand total range.

<!-- rule-choices -->
- [Hard 8 or less](#flow-hard-8-less)
- [Hard 9](#flow-hard-9)
- [Hard 10](#flow-hard-10)
- [Hard 11](#flow-hard-11)
- [Hard 12](#flow-hard-12)
- [Hard 13-16](#flow-hard-13-16)
- [Hard 17+](#flow-hard-17-plus)

<!-- rule-section: flow-hard-8-less -->
### Hard 8 or Less

**Always Hit.**

With hard 8 or less, you cannot bust by taking one card, and any card improves your hand.

<!-- rule-section: flow-hard-9 -->
### Hard 9 — Dealer's Upcard?

Your action depends on the dealer's upcard.

<!-- rule-choices -->
- [Dealer 3-6](#flow-hard-9-double)
- [Dealer 2, 7-A](#flow-hard-9-hit)

<!-- rule-section: flow-hard-9-double -->
### Hard 9 vs Dealer 3-6

**Double Down** (or Hit if doubling is not allowed).

The dealer is likely to bust with a weak upcard, making this a profitable doubling opportunity.

<!-- rule-section: flow-hard-9-hit -->
### Hard 9 vs Dealer 2, 7-A

**Hit.**

The dealer's strong upcard makes doubling too risky.

<!-- rule-section: flow-hard-10 -->
### Hard 10 — Dealer's Upcard?

Hard 10 is a strong doubling hand.

![2–10 face value, faces are 10, Ace is 1 or 11](/images/rules/blackjack/card-values.svg)

<!-- rule-choices -->
- [Dealer 2-9](#flow-hard-10-double)
- [Dealer 10 or A](#flow-hard-10-hit)

<!-- rule-section: flow-hard-10-double -->
### Hard 10 vs Dealer 2-9

**Double Down.**

You have a great chance of hitting 20 or 21, and the dealer is in a weak position.

<!-- rule-section: flow-hard-10-hit -->
### Hard 10 vs Dealer 10/A

**Hit.**

The dealer likely has a strong hand too — don't risk doubling.

<!-- rule-section: flow-hard-11 -->
### Hard 11

**Always Double Down** (Hit if not allowed).

Hard 11 is the best doubling hand — any 10-value card gives you 21.

<!-- rule-section: flow-hard-12 -->
### Hard 12 — Dealer's Upcard?

Hard 12 is the first hand where busting is possible.

<!-- rule-choices -->
- [Dealer 4-6](#flow-hard-12-stand)
- [Dealer 2-3, 7-A](#flow-hard-12-hit)

<!-- rule-section: flow-hard-12-stand -->
### Hard 12 vs Dealer 4-6

**Stand.**

Dealer 4-6 are the weakest upcards with high bust rates. Don't risk busting yourself.

<!-- rule-section: flow-hard-12-hit -->
### Hard 12 vs Dealer 2-3, 7-A

**Hit.**

Dealer 2-3 have moderate bust rates, and dealer 7-A likely makes 17+. You need to improve.

<!-- rule-section: flow-hard-13-16 -->
### Hard 13-16 — Dealer's Upcard?

The "stiff hands" — high bust risk either way.

<!-- rule-choices -->
- [Dealer 2-6](#flow-hard-13-16-stand)
- [Dealer 7-A](#flow-hard-13-16-hit)

<!-- rule-section: flow-hard-13-16-stand -->
### Hard 13-16 vs Dealer 2-6

**Stand.**

Let the dealer bust. With a weak upcard (2-6), the dealer must hit and risks busting.

<!-- rule-section: flow-hard-13-16-hit -->
### Hard 13-16 vs Dealer 7-A

**Hit** (or Surrender hard 16 vs 9/10/A if available).

Dealer likely has 17-21. Standing loses more often than hitting.

<!-- rule-section: flow-hard-17-plus -->
### Hard 17+

**Always Stand.**

With hard 17 or above, the risk of busting is too high. Even hard 17 against a dealer Ace should stand.

<!-- rule-section: flow-soft-total -->
### Soft Hand — Your Total?

A soft hand contains an Ace counted as 11. Select your total.

![Soft 17 still counts the ace as 11](/images/rules/blackjack/hard-vs-soft.svg)

<!-- rule-choices -->
- [Soft 13-14 (A+2, A+3)](#flow-soft-13-14)
- [Soft 15-16 (A+4, A+5)](#flow-soft-15-16)
- [Soft 17 (A+6)](#flow-soft-17)
- [Soft 18 (A+7)](#flow-soft-18)
- [Soft 19-20 (A+8, A+9)](#flow-soft-19-20)

<!-- rule-section: flow-soft-13-14 -->
### Soft 13-14 — Dealer's Upcard?

Soft 13-14 can improve significantly without bust risk.

<!-- rule-choices -->
- [Dealer 5-6](#flow-soft-13-14-double)
- [Dealer 2-4, 7-A](#flow-soft-13-14-hit)

<!-- rule-section: flow-soft-13-14-double -->
### Soft 13-14 vs Dealer 5-6

**Double Down** (Hit if not allowed).

Dealer is very likely to bust; maximize your profit.

<!-- rule-section: flow-soft-13-14-hit -->
### Soft 13-14 vs Others

**Hit.**

You can't bust and need to improve this weak hand.

<!-- rule-section: flow-soft-15-16 -->
### Soft 15-16 — Dealer's Upcard?

Similar to soft 13-14 but slightly stronger.

<!-- rule-choices -->
- [Dealer 4-6](#flow-soft-15-16-double)
- [Dealer 2-3, 7-A](#flow-soft-15-16-hit)

<!-- rule-section: flow-soft-15-16-double -->
### Soft 15-16 vs Dealer 4-6

**Double Down** (Hit if not allowed).

Weak dealer upcard gives you an edge to double.

<!-- rule-section: flow-soft-15-16-hit -->
### Soft 15-16 vs Others

**Hit.**

Need improvement against stronger dealer positions.

<!-- rule-section: flow-soft-17 -->
### Soft 17 — Dealer's Upcard?

Soft 17 should never stand — it's too weak despite being 17.

<!-- rule-choices -->
- [Dealer 3-6](#flow-soft-17-double)
- [Dealer 2, 7-A](#flow-soft-17-hit)

<!-- rule-section: flow-soft-17-double -->
### Soft 17 vs Dealer 3-6

**Double Down** (Hit if not allowed).

Dealer weakness + your flexible Ace makes doubling correct.

<!-- rule-section: flow-soft-17-hit -->
### Soft 17 vs Dealer 2, 7-A

**Hit.**

Soft 17 loses to most dealer outcomes. Hit to improve — you can't bust.

<!-- rule-section: flow-soft-18 -->
### Soft 18 — Dealer's Upcard?

Soft 18 is a complex hand with different plays depending on dealer.

<!-- rule-choices -->
- [Dealer 2-6](#flow-soft-18-ds)
- [Dealer 7-8](#flow-soft-18-stand)
- [Dealer 9-A](#flow-soft-18-hit)

<!-- rule-section: flow-soft-18-ds -->
### Soft 18 vs Dealer 2-6

**Double Down** vs 3-6, **Stand** vs 2 (if double not allowed, stand).

Dealer is weak — press the advantage.

<!-- rule-section: flow-soft-18-stand -->
### Soft 18 vs Dealer 7-8

**Stand.**

18 is likely to tie or win against dealer 7-8.

<!-- rule-section: flow-soft-18-hit -->
### Soft 18 vs Dealer 9-A

**Hit.**

18 is an underdog against dealer 9-A. Try to improve without bust risk.

<!-- rule-section: flow-soft-19-20 -->
### Soft 19-20

**Always Stand.**

Soft 19 and 20 are very strong hands. Never risk them.

![Soft 17 hits a 3 to make 20](/images/rules/blackjack/player-actions.svg)

<!-- rule-section: flow-pair-type -->
### Pair — Which Pair?

Splitting decisions depend on which pair you have.

<!-- rule-choices -->
- [Pair of A's](#flow-pair-aa)
- [Pair of 10/J/Q/K](#flow-pair-10)
- [Pair of 9's](#flow-pair-9)
- [Pair of 8's](#flow-pair-8)
- [Pair of 7's](#flow-pair-7)
- [Pair of 6's](#flow-pair-6)
- [Pair of 5's](#flow-pair-5)
- [Pair of 4's](#flow-pair-4)
- [Pair of 2's or 3's](#flow-pair-23)

<!-- rule-section: flow-pair-aa -->
### Pair of Aces

**Always Split.**

Two Aces as one hand = soft 12 (weak). Split gives two chances at 21.

<!-- rule-section: flow-pair-10 -->
### Pair of 10s

**Never Split. Always Stand.**

20 is one of the strongest hands. Don't break it up.

<!-- rule-section: flow-pair-9 -->
### Pair of 9's — Dealer's Upcard?

Pair of 9's (18 total) — split or stand based on dealer.

<!-- rule-choices -->
- [Dealer 2-6, 8-9](#flow-pair-9-split)
- [Dealer 7, 10, A](#flow-pair-9-stand)

<!-- rule-section: flow-pair-9-split -->
### Split 9's

**Split.**

Against weak dealers or matching 8-9, two 9-start hands outperform standing on 18.

<!-- rule-section: flow-pair-9-stand -->
### Stand on 9's

**Stand.**

18 is strong enough against dealer 7 (likely 17). Against 10/A, splitting is too risky.

<!-- rule-section: flow-pair-8 -->
### Pair of 8's

**Always Split.**

16 is the worst hand in blackjack. Split to get two fresh starts from 8.

<!-- rule-section: flow-pair-7 -->
### Pair of 7's — Dealer's Upcard?

14 is weak; splitting can help against weak dealers.

<!-- rule-choices -->
- [Dealer 2-7](#flow-pair-7-split)
- [Dealer 8-A](#flow-pair-7-hit)

<!-- rule-section: flow-pair-7-split -->
### Split 7's

**Split.**

Two chances at 17+ beats standing on 14 against weak dealers.

<!-- rule-section: flow-pair-7-hit -->
### Hit on 7's

**Hit.**

Dealer is too strong to split into 7-start hands. Treat as hard 14.

<!-- rule-section: flow-pair-6 -->
### Pair of 6's — Dealer's Upcard?

12 total — splitting is only worthwhile against very weak dealers.

<!-- rule-choices -->
- [Dealer 2-6](#flow-pair-6-split)
- [Dealer 7-A](#flow-pair-6-hit)

<!-- rule-section: flow-pair-6-split -->
### Split 6's

**Split.**

Dealer is likely to bust; give yourself two hands starting from 6.

<!-- rule-section: flow-pair-6-hit -->
### Hit on 6's

**Hit.**

Treat as hard 12. Dealer too strong to split.

<!-- rule-section: flow-pair-5 -->
### Pair of 5's

**Never Split.** Treat as hard 10.

- Dealer 2-9: **Double Down**
- Dealer 10/A: **Hit**

Two 5's = hard 10, one of the best doubling hands. Splitting gives two terrible 5-start hands.

<!-- rule-section: flow-pair-4 -->
### Pair of 4's — Dealer's Upcard?

8 total — splitting is rarely correct.

<!-- rule-choices -->
- [Dealer 5-6](#flow-pair-4-split)
- [Dealer 2-4, 7-A](#flow-pair-4-hit)

<!-- rule-section: flow-pair-4-split -->
### Split 4's vs Dealer 5-6

**Split** (or Hit if preferred).

Only against the weakest dealer cards is splitting 4's marginally better.

<!-- rule-section: flow-pair-4-hit -->
### Hit on 4's

**Hit.**

Treat as hard 8. Hit to improve.

<!-- rule-section: flow-pair-23 -->
### Pair of 2's/3's — Dealer's Upcard?

Low pairs — split against weak dealers.

<!-- rule-choices -->
- [Dealer 2-7](#flow-pair-23-split)
- [Dealer 8-A](#flow-pair-23-hit)

<!-- rule-section: flow-pair-23-split -->
### Split 2's/3's

**Split.**

Weak dealer cards make splitting profitable — two fresh hands from low cards.

<!-- rule-section: flow-pair-23-hit -->
### Hit on 2's/3's

**Hit.**

Treat as hard 4/6. Dealer too strong to split.

