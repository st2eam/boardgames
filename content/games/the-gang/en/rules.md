# The Gang Rules
<!-- rule-section: overview -->
## Overview

**The Gang** (John W. Cooper & Kory Heath, Kosmos, 2024) is a **cooperative** Texas Hold ’em game for **3–6** players. You are a crew of thieves. Each **heist** you silently rank your poker hands with star chips. If the **red** chips match true hand order, you crack a vault; if not, you trip an alarm. Open **three vaults** before **three alarms**.

Unlike regular poker: **do not bluff**. More players = harder.
<!-- rule-section: game-objective -->
## Game Objective

In The Gang, you are part of a bank-robbing crew that communicates without speaking. Your goal is to rank the team’s hands correctly, open three vaults, and do it before the third alarm goes off.
<!-- rule-section: components -->
## Components

- 52 playing cards
- 6 Gameplay + 6 Hand Ranking overview cards
- 10 specialist cards + 10 challenge cards
- 3 vault cards + 3 alarm cards
- 24 chips: white / yellow / orange / red, each 1–6 stars (Rounds 1–4)
<!-- rule-section: setup-basic-game -->
## Setup (basic game)

Leave specialists and challenges in the box.

1. Place the 3 alarms and 3 vaults **gray side up**.
2. Each player takes one Gameplay card and one Hand Ranking card.
3. Keep only chips whose stars are **≤ player count** (e.g. 4 players → stars 1–4 in each color). Light side up; dark side unused in the basic game.
<!-- rule-section: communication -->
## Communication

![No hints; chips are the language; red order must be true](/images/rules/the-gang/chips-language.svg)
You may **not** show, name, or hint your pocket cards. You also may not leak deductions that exist **only** because you know your own hand. Public board information is fair. **Chips are the language.** Watch who takes which chip and how ranks change across rounds.
<!-- rule-ui: tabs -->
<!-- rule-section: how-a-heist-works -->
## How a heist works

![Four silent streets, chips only](/images/rules/the-gang/heist-rounds.svg)

Shuffle the 52-card deck. Deal **2 pocket cards** facedown to each player (look at your own anytime). Leave space for **5** community cards.

Four rounds, Hold ’em style. **No turn order** when taking chips.

| Round | Community cards | Chips |
|------:|-----------------|-------|
| 1 Pre-flop | — | **White** |
| 2 Flop | Flip **3** | **Yellow** |
| 3 Turn | Flip **1** | **Orange** |
| 4 River | Flip **1** | **Red** |

Stars = how strong you think your **best 5-card hand** (2 pocket + current community) is **relative to the table**. Most stars = strongest; **1 star** = weakest.
<!-- rule-section: taking-chips -->
### Taking chips

- Take any chip of the **current color** from the center **or** from in front of another player.
- Never have **two chips of the same color**.
- You may return your current-color chip to the center. You may **not** place a chip in front of someone else.
- Previous-round chips stay in a visible row so others see how your estimate changed.
- When everyone has one chip of the current color, the round ends.
<!-- rule-section: showdown -->
### Showdown

Only **red** chips count. Reveal in **ascending** star order (1, then 2, …). Each player announces their **best exact five-card** hand from seven cards (2 + 5).

- If each reveal is **equal or stronger** than all previous reveals → **success**: flip a vault to **gold**.
- If anyone reveals a **weaker** hand than a previous player → **fail**: flip an alarm to **red**.

Then start the next heist (reshuffle). A game has **3–5** heists.

**True tie:** identical five-card hands (often the board plays). Among tied players, chip order **does not matter**. Their rank vs everyone else must still be correct.
<!-- rule-section: game-end -->
## Game end
<!-- rule-ui: sidebar -->
- <!-- rule-item: game-end-item-1 -->
  **Win:** three vaults gold.
- <!-- rule-item: game-end-item-2 -->
  **Lose:** three alarms red (whichever happens first).
<!-- rule-section: hand-rankings-weak-strong -->
## Hand rankings (weak → strong)

![Standard poker ranks from high card to straight flush](/images/rules/the-gang/hand-ranks.svg)

Use **exactly five** cards. Ace is high, or low in A-2-3-4-5 only. Suits are equal. Kickers fill out a five-card hand.

1. High card → 2. Pair → 3. Two pair → 4. Three of a kind → 5. Straight → 6. Flush → 7. Full house → 8. Four of a kind → 9. Straight flush → 10. Royal flush (10-J-Q-K-A same suit)

Straight: 10-J-Q-K-A or A-2-3-4-5; K-A-2-3-4 is illegal. Full house: compare trips first, then the pair.
<!-- rule-ui: tabs -->
<!-- rule-section: advanced-professional-master-thief -->
## Advanced / Professional / Master Thief

First heist of Advanced is still the basic heist. Stack specialists 1–10 and challenges 1–10. After each heist:
<!-- rule-ui: sidebar -->
- <!-- rule-item: advanced-professional-master-thief-item-1 -->
  **Success** → next heist gets the top **challenge** (harder), then it goes to the bottom.
- <!-- rule-item: advanced-professional-master-thief-item-2 -->
  **Fail** → next heist gets the top **specialist** (easier; group may agree who uses it **before showdown**). Unused specialists still leave at heist end.

Do not re-sort 1–10 between sessions until you have seen every card once; then shuffle.

**Professional:** like Advanced, but remove challenge **1 Quick Access**. Reveal one random challenge at setup; it stays **all game**. From heist 2 you also add the usual challenge or specialist.

**Master Thief:** like Advanced, remove Quick Access and **all specialists**. Remove one alarm (lose on **two** alarms). Two random challenges on heist 1; each later heist discard the **lowest number** and draw a new one (always two challenges).
<!-- rule-section: challenges -->
### Challenges

| # | Name | Effect |
|---|------|--------|
| 1 | **Quick Access** | No white chips; after pockets, go to the flop. |
| 2 | **Noise Sensors** | Dark-side the 1-star chips of rounds 1–3; they cannot change owner. |
| 3 | **Motion Detector** | If the flop has a J/Q/K, the white **1-star** player discards pockets and draws new ones. |
| 4 | **Retina Scan** | Extra win condition: others (not the highest red chip) must agree on a **rank 2–A** in that player’s **pockets**. Wrong → fail even if order was right. |
| 5 | **Hasty Getaway** | No orange chips; after the turn card, go to the river. |
| 6 | **Ventilation Shaft** | Dark-side the **highest** chips of rounds 1–3; they cannot change owner. |
| 7 | **Laser Tripwires** | If the flop has **no** J/Q/K, the **highest** white-chip player redraws pockets. |
| 8 | **Blackout** | Discard the previous round’s chips at the start of rounds 2, 3, and 4. |
| 9 | **Fingerprint Scan** | Extra win condition: others must agree the highest red chip’s **hand ranking**. Wrong → fail. |
| 10 | **Security Cameras** | **3** pocket cards; best 5 from 8 cards. |
<!-- rule-section: specialists -->
### Specialists

| # | Name | Effect |
|---|------|--------|
| 1 | **Informant** | One player secretly shows **one** pocket card to one other player. |
| 2 | **Getaway Driver** | One player states only their current **ranking** (e.g. “pair”), not which cards. |
| 3 | **Investor** | After pockets, each says how many **face cards** (J/Q/K) they hold. |
| 4 | **Mastermind** | Pick a rank 2–A; one player says how many of that rank they hold. |
| 5 | **Hacker** | One player draws a third card, then discards one pocket facedown. |
| 6 | **Coordinator** | After pockets, each simultaneously passes one pocket **left**. |
| 7 | **Jack** | One player adds the suitless Jack (counts as J, **not** for flushes; four jacks + this = quads of jacks with a jack kicker), then discards one pocket. |
| 8 | **Math Whiz** | Each announces pocket **sum**: 2–10 face value, J/Q/K = 10, A = 11. |
| 9 | **Con Artist** | After looking, shuffle **only** the dealt pockets and redeal. |
| 10 | **Muscle** | One player beats **any same rank** (pair vs pair, etc.); higher ranks still win. |
<!-- rule-section: topic-guide -->
## Quick reference
Jump directly to the rule topic you need.

- <!-- rule-item: flow-setup -->
  **Setup**

  Basic game: no specialists or challenges.
  
  1. 3 alarms + 3 vaults **gray up**.
  2. Each player: Gameplay + Hand Ranking card.
  3. Keep chips with stars **≤ player count** (light side).
  
  **Win:** 3 gold vaults. **Lose:** 3 red alarms. 3–6 players; more people is harder. **Do not bluff.**

  Related topics: 
  - [Heist Rounds](#flow-heist)
  - [Chips](#flow-chips)
  - [Talking](#flow-talk)

- <!-- rule-item: flow-talk -->
  **Talking**

  No showing, naming, or hinting **pocket cards**. Do not share deductions that exist only because you know your own hand.
  
  Board cards are public. **Chips** are how you communicate. Watch who takes which star and how ranks change round to round.

  Related topics: 
  - [Chips](#flow-chips)
  - [Heist Rounds](#flow-heist)

- <!-- rule-item: flow-heist -->
  **Heist Rounds**

  Deal **2** pockets. Four Hold ’em-style rounds:
  
  1. Pre-flop → **white** chips
  2. Flop (3 cards) → **yellow**
  3. Turn (1) → **orange**
  4. River (1) → **red**
  
  Then **showdown** on red chips only. Next heist: reshuffle.

  ![Four silent streets, chips only](/images/rules/the-gang/heist-rounds.svg)

  Related topics: 
  - [Chips](#flow-chips)
  - [Showdown](#flow-showdown)

- <!-- rule-item: flow-chips -->
  **Chips**

  Stars = relative hand strength (**1** = weakest).
  
  No turn order. Take a current-color chip from the center **or** from someone else. Never two of the same color. You may return yours to the center; you may not give one to another player.
  
  Keep older chips in a row so others see your history.

  ![No hints; chips are the language; red order must be true](/images/rules/the-gang/chips-language.svg)

  Related topics: 
  - [Showdown](#flow-showdown)
  - [Talking](#flow-talk)

- <!-- rule-item: flow-showdown -->
  **Showdown**

  Reveal **red** chips from **1 star up**. Best **exact 5** from 7 cards.
  
  Each hand must be **≥** all previous → flip a **vault** gold.
  Anyone weaker than a previous player → flip an **alarm** red.
  
  **True tie** (identical 5 cards): order among those players is ignored.

  Related topics: 
  - [Hand Ranks](#flow-ranks)
  - [Game End](#flow-end)

- <!-- rule-item: flow-ranks -->
  **Hand Ranks**

  Weak → strong: high card, pair, two pair, trips, straight, flush, full house, quads, straight flush, royal flush.
  
  Ace high, or A-2-3-4-5 only. No K-A-2-3-4. Suits equal. Kickers fill five cards. Full house: trips first, then pair.

  ![Standard poker ranks from high card to straight flush](/images/rules/the-gang/hand-ranks.svg)

  Related topics: 
  - [Showdown](#flow-showdown)
  - [Harder Modes](#flow-modes)

- <!-- rule-item: flow-end -->
  **Game End**

  **Win** when three vaults are gold. **Lose** when three alarms are red.
  
  A game lasts 3–5 heists. Play a full basic game before adding challenges.

  Related topics: 
  - [Harder Modes](#flow-modes)
  - [Setup](#flow-setup)

- <!-- rule-item: flow-modes -->
  **Harder Modes**

  **Advanced:** heist 1 is basic. After that, success → a **challenge** next heist; fail → a **specialist**. Each lasts one heist.
  
  **Professional:** Advanced minus Quick Access. One random challenge lasts **all game**, plus the usual extra card from heist 2.
  
  **Master Thief:** no specialists; lose on **2** alarms; always **two** challenges (swap the lowest number each heist).

  Related topics: 
  - [Challenges](#flow-challenges)
  - [Specialists](#flow-specialists)

- <!-- rule-item: flow-challenges -->
  **Challenges**

  1 Quick Access: skip white / go to flop.
  2–3 / 6–7: lock 1-star or highest chips; or redraw pockets if flop has / lacks JQK.
  4 Retina: guess a pocket **rank** of the top red chip.
  5 skip orange. 8 Blackout: discard last round’s chips.
  9 Fingerprint: guess top red chip’s **hand type**.
  10 three pocket cards.

  Related topics: 
  - [Specialists](#flow-specialists)
  - [Harder Modes](#flow-modes)

- <!-- rule-item: flow-specialists -->
  **Specialists**

  Help after a failed heist (group picks who, before showdown):
  
  show 1 card · say only your **rank** · count face cards · count a chosen rank · swap a drawn card · pass one pocket left · suitless Jack · announce point sum · redeal pockets · **Muscle** beats same rank.

  Related topics: 
  - [Challenges](#flow-challenges)
  - [Setup](#flow-setup)
<!-- rule-section: topic-guide-2 -->
## Quick reference
Jump directly to the rule topic you need.

- <!-- rule-item: flow-setup -->
  **Setup**

  Basic game: no specialists or challenges.
  
  1. 3 alarms + 3 vaults **gray up**.
  2. Each player: Gameplay + Hand Ranking card.
  3. Keep chips with stars **≤ player count** (light side).
  
  **Win:** 3 gold vaults. **Lose:** 3 red alarms. 3–6 players; more people is harder. **Do not bluff.**

  Related topics: 
  - [Heist Rounds](#flow-heist)
  - [Chips](#flow-chips)
  - [Talking](#flow-talk)

- <!-- rule-item: flow-talk -->
  **Talking**

  No showing, naming, or hinting **pocket cards**. Do not share deductions that exist only because you know your own hand.
  
  Board cards are public. **Chips** are how you communicate. Watch who takes which star and how ranks change round to round.

  Related topics: 
  - [Chips](#flow-chips)
  - [Heist Rounds](#flow-heist)

- <!-- rule-item: flow-heist -->
  **Heist Rounds**

  Deal **2** pockets. Four Hold ’em-style rounds:
  
  1. Pre-flop → **white** chips
  2. Flop (3 cards) → **yellow**
  3. Turn (1) → **orange**
  4. River (1) → **red**
  
  Then **showdown** on red chips only. Next heist: reshuffle.

  ![Four silent streets, chips only](/images/rules/the-gang/heist-rounds.svg)

  Related topics: 
  - [Chips](#flow-chips)
  - [Showdown](#flow-showdown)

- <!-- rule-item: flow-chips -->
  **Chips**

  Stars = relative hand strength (**1** = weakest).
  
  No turn order. Take a current-color chip from the center **or** from someone else. Never two of the same color. You may return yours to the center; you may not give one to another player.
  
  Keep older chips in a row so others see your history.

  ![No hints; chips are the language; red order must be true](/images/rules/the-gang/chips-language.svg)

  Related topics: 
  - [Showdown](#flow-showdown)
  - [Talking](#flow-talk)

- <!-- rule-item: flow-showdown -->
  **Showdown**

  Reveal **red** chips from **1 star up**. Best **exact 5** from 7 cards.
  
  Each hand must be **≥** all previous → flip a **vault** gold.
  Anyone weaker than a previous player → flip an **alarm** red.
  
  **True tie** (identical 5 cards): order among those players is ignored.

  Related topics: 
  - [Hand Ranks](#flow-ranks)
  - [Game End](#flow-end)

- <!-- rule-item: flow-ranks -->
  **Hand Ranks**

  Weak → strong: high card, pair, two pair, trips, straight, flush, full house, quads, straight flush, royal flush.
  
  Ace high, or A-2-3-4-5 only. No K-A-2-3-4. Suits equal. Kickers fill five cards. Full house: trips first, then pair.

  ![Standard poker ranks from high card to straight flush](/images/rules/the-gang/hand-ranks.svg)

  Related topics: 
  - [Showdown](#flow-showdown)
  - [Harder Modes](#flow-modes)

- <!-- rule-item: flow-end -->
  **Game End**

  **Win** when three vaults are gold. **Lose** when three alarms are red.
  
  A game lasts 3–5 heists. Play a full basic game before adding challenges.

  Related topics: 
  - [Harder Modes](#flow-modes)
  - [Setup](#flow-setup)

- <!-- rule-item: flow-modes -->
  **Harder Modes**

  **Advanced:** heist 1 is basic. After that, success → a **challenge** next heist; fail → a **specialist**. Each lasts one heist.
  
  **Professional:** Advanced minus Quick Access. One random challenge lasts **all game**, plus the usual extra card from heist 2.
  
  **Master Thief:** no specialists; lose on **2** alarms; always **two** challenges (swap the lowest number each heist).

  Related topics: 
  - [Challenges](#flow-challenges)
  - [Specialists](#flow-specialists)

- <!-- rule-item: flow-challenges -->
  **Challenges**

  1 Quick Access: skip white / go to flop.
  2–3 / 6–7: lock 1-star or highest chips; or redraw pockets if flop has / lacks JQK.
  4 Retina: guess a pocket **rank** of the top red chip.
  5 skip orange. 8 Blackout: discard last round’s chips.
  9 Fingerprint: guess top red chip’s **hand type**.
  10 three pocket cards.

  Related topics: 
  - [Specialists](#flow-specialists)
  - [Harder Modes](#flow-modes)

- <!-- rule-item: flow-specialists -->
  **Specialists**

  Help after a failed heist (group picks who, before showdown):
  
  show 1 card · say only your **rank** · count face cards · count a chosen rank · swap a drawn card · pass one pocket left · suitless Jack · announce point sum · redeal pockets · **Muscle** beats same rank.

  Related topics: 
  - [Challenges](#flow-challenges)
  - [Setup](#flow-setup)
<!-- rule-section: topic-guide-3 -->
## Quick reference
Jump directly to the rule topic you need.

- <!-- rule-item: flow-setup -->
  **Setup**

  Basic game: no specialists or challenges.
  
  1. 3 alarms + 3 vaults **gray up**.
  2. Each player: Gameplay + Hand Ranking card.
  3. Keep chips with stars **≤ player count** (light side).
  
  **Win:** 3 gold vaults. **Lose:** 3 red alarms. 3–6 players; more people is harder. **Do not bluff.**

  Related topics: 
  - [Heist Rounds](#flow-heist)
  - [Chips](#flow-chips)
  - [Talking](#flow-talk)

- <!-- rule-item: flow-talk -->
  **Talking**

  No showing, naming, or hinting **pocket cards**. Do not share deductions that exist only because you know your own hand.
  
  Board cards are public. **Chips** are how you communicate. Watch who takes which star and how ranks change round to round.

  Related topics: 
  - [Chips](#flow-chips)
  - [Heist Rounds](#flow-heist)

- <!-- rule-item: flow-heist -->
  **Heist Rounds**

  Deal **2** pockets. Four Hold ’em-style rounds:
  
  1. Pre-flop → **white** chips
  2. Flop (3 cards) → **yellow**
  3. Turn (1) → **orange**
  4. River (1) → **red**
  
  Then **showdown** on red chips only. Next heist: reshuffle.

  ![Four silent streets, chips only](/images/rules/the-gang/heist-rounds.svg)

  Related topics: 
  - [Chips](#flow-chips)
  - [Showdown](#flow-showdown)

- <!-- rule-item: flow-chips -->
  **Chips**

  Stars = relative hand strength (**1** = weakest).
  
  No turn order. Take a current-color chip from the center **or** from someone else. Never two of the same color. You may return yours to the center; you may not give one to another player.
  
  Keep older chips in a row so others see your history.

  ![No hints; chips are the language; red order must be true](/images/rules/the-gang/chips-language.svg)

  Related topics: 
  - [Showdown](#flow-showdown)
  - [Talking](#flow-talk)

- <!-- rule-item: flow-showdown -->
  **Showdown**

  Reveal **red** chips from **1 star up**. Best **exact 5** from 7 cards.
  
  Each hand must be **≥** all previous → flip a **vault** gold.
  Anyone weaker than a previous player → flip an **alarm** red.
  
  **True tie** (identical 5 cards): order among those players is ignored.

  Related topics: 
  - [Hand Ranks](#flow-ranks)
  - [Game End](#flow-end)

- <!-- rule-item: flow-ranks -->
  **Hand Ranks**

  Weak → strong: high card, pair, two pair, trips, straight, flush, full house, quads, straight flush, royal flush.
  
  Ace high, or A-2-3-4-5 only. No K-A-2-3-4. Suits equal. Kickers fill five cards. Full house: trips first, then pair.

  ![Standard poker ranks from high card to straight flush](/images/rules/the-gang/hand-ranks.svg)

  Related topics: 
  - [Showdown](#flow-showdown)
  - [Harder Modes](#flow-modes)

- <!-- rule-item: flow-end -->
  **Game End**

  **Win** when three vaults are gold. **Lose** when three alarms are red.
  
  A game lasts 3–5 heists. Play a full basic game before adding challenges.

  Related topics: 
  - [Harder Modes](#flow-modes)
  - [Setup](#flow-setup)

- <!-- rule-item: flow-modes -->
  **Harder Modes**

  **Advanced:** heist 1 is basic. After that, success → a **challenge** next heist; fail → a **specialist**. Each lasts one heist.
  
  **Professional:** Advanced minus Quick Access. One random challenge lasts **all game**, plus the usual extra card from heist 2.
  
  **Master Thief:** no specialists; lose on **2** alarms; always **two** challenges (swap the lowest number each heist).

  Related topics: 
  - [Challenges](#flow-challenges)
  - [Specialists](#flow-specialists)

- <!-- rule-item: flow-challenges -->
  **Challenges**

  1 Quick Access: skip white / go to flop.
  2–3 / 6–7: lock 1-star or highest chips; or redraw pockets if flop has / lacks JQK.
  4 Retina: guess a pocket **rank** of the top red chip.
  5 skip orange. 8 Blackout: discard last round’s chips.
  9 Fingerprint: guess top red chip’s **hand type**.
  10 three pocket cards.

  Related topics: 
  - [Specialists](#flow-specialists)
  - [Harder Modes](#flow-modes)

- <!-- rule-item: flow-specialists -->
  **Specialists**

  Help after a failed heist (group picks who, before showdown):
  
  show 1 card · say only your **rank** · count face cards · count a chosen rank · swap a drawn card · pass one pocket left · suitless Jack · announce point sum · redeal pockets · **Muscle** beats same rank.

  Related topics: 
  - [Challenges](#flow-challenges)
  - [Setup](#flow-setup)

<!-- rule-section: topic-guide-4 -->
## Quick reference
<!-- rule-ui: sidebar -->

Jump directly to the rule topic you need.

- <!-- rule-item: flow-setup -->
  **Setup**

  Basic game: no specialists or challenges.
  
  1. 3 alarms + 3 vaults **gray up**.
  2. Each player: Gameplay + Hand Ranking card.
  3. Keep chips with stars **≤ player count** (light side).
  
  **Win:** 3 gold vaults. **Lose:** 3 red alarms. 3–6 players; more people is harder. **Do not bluff.**

  Related topics: 
  - [Heist Rounds](#flow-heist)
  - [Chips](#flow-chips)
  - [Talking](#flow-talk)

- <!-- rule-item: flow-talk -->
  **Talking**

  No showing, naming, or hinting **pocket cards**. Do not share deductions that exist only because you know your own hand.
  
  Board cards are public. **Chips** are how you communicate. Watch who takes which star and how ranks change round to round.

  Related topics: 
  - [Chips](#flow-chips)
  - [Heist Rounds](#flow-heist)

- <!-- rule-item: flow-heist -->
  **Heist Rounds**

  Deal **2** pockets. Four Hold ’em-style rounds:
  
  1. Pre-flop → **white** chips
  2. Flop (3 cards) → **yellow**
  3. Turn (1) → **orange**
  4. River (1) → **red**
  
  Then **showdown** on red chips only. Next heist: reshuffle.

  ![Four silent streets, chips only](/images/rules/the-gang/heist-rounds.svg)

  Related topics: 
  - [Chips](#flow-chips)
  - [Showdown](#flow-showdown)

- <!-- rule-item: flow-chips -->
  **Chips**

  Stars = relative hand strength (**1** = weakest).
  
  No turn order. Take a current-color chip from the center **or** from someone else. Never two of the same color. You may return yours to the center; you may not give one to another player.
  
  Keep older chips in a row so others see your history.

  ![No hints; chips are the language; red order must be true](/images/rules/the-gang/chips-language.svg)

  Related topics: 
  - [Showdown](#flow-showdown)
  - [Talking](#flow-talk)

- <!-- rule-item: flow-showdown -->
  **Showdown**

  Reveal **red** chips from **1 star up**. Best **exact 5** from 7 cards.
  
  Each hand must be **≥** all previous → flip a **vault** gold.
  Anyone weaker than a previous player → flip an **alarm** red.
  
  **True tie** (identical 5 cards): order among those players is ignored.

  Related topics: 
  - [Hand Ranks](#flow-ranks)
  - [Game End](#flow-end)

- <!-- rule-item: flow-ranks -->
  **Hand Ranks**

  Weak → strong: high card, pair, two pair, trips, straight, flush, full house, quads, straight flush, royal flush.
  
  Ace high, or A-2-3-4-5 only. No K-A-2-3-4. Suits equal. Kickers fill five cards. Full house: trips first, then pair.

  ![Standard poker ranks from high card to straight flush](/images/rules/the-gang/hand-ranks.svg)

  Related topics: 
  - [Showdown](#flow-showdown)
  - [Harder Modes](#flow-modes)

- <!-- rule-item: flow-end -->
  **Game End**

  **Win** when three vaults are gold. **Lose** when three alarms are red.
  
  A game lasts 3–5 heists. Play a full basic game before adding challenges.

  Related topics: 
  - [Harder Modes](#flow-modes)
  - [Setup](#flow-setup)

- <!-- rule-item: flow-modes -->
  **Harder Modes**

  **Advanced:** heist 1 is basic. After that, success → a **challenge** next heist; fail → a **specialist**. Each lasts one heist.
  
  **Professional:** Advanced minus Quick Access. One random challenge lasts **all game**, plus the usual extra card from heist 2.
  
  **Master Thief:** no specialists; lose on **2** alarms; always **two** challenges (swap the lowest number each heist).

  Related topics: 
  - [Challenges](#flow-challenges)
  - [Specialists](#flow-specialists)

- <!-- rule-item: flow-challenges -->
  **Challenges**

  1 Quick Access: skip white / go to flop.
  2–3 / 6–7: lock 1-star or highest chips; or redraw pockets if flop has / lacks JQK.
  4 Retina: guess a pocket **rank** of the top red chip.
  5 skip orange. 8 Blackout: discard last round’s chips.
  9 Fingerprint: guess top red chip’s **hand type**.
  10 three pocket cards.

  Related topics: 
  - [Specialists](#flow-specialists)
  - [Harder Modes](#flow-modes)

- <!-- rule-item: flow-specialists -->
  **Specialists**

  Help after a failed heist (group picks who, before showdown):
  
  show 1 card · say only your **rank** · count face cards · count a chosen rank · swap a drawn card · pass one pocket left · suitless Jack · announce point sum · redeal pockets · **Muscle** beats same rank.

  Related topics: 
  - [Challenges](#flow-challenges)
  - [Setup](#flow-setup)

