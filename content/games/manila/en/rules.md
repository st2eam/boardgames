# Manila Rules
<!-- rule-section: overview -->
## Overview

**Manila** is a German-style board game by Franz-Benno Delonge (Zoch Verlag / Rio Grande Games, 2005). Set in early-19th-century colonial Manila, players are black-market investors who speculate on smuggling runs of **nutmeg**, **silk**, **ginseng**, and **jade**.

Each round (a **voyage**), three **punts** carry three of the four wares toward the harbor. Players bid for the powerful **Harbor Master** office, place **accomplices** to bet on outcomes or influence the run, then resolve dice movement, pirates, pilots, and payouts. Wares that reach Manila rise on the **black market**. When any ware hits **30**, the richest fortune wins.
<!-- rule-section: game-objective -->
## Game Objective

In Manila, you are a black-market merchant betting on cargo ships near colonial Manila. Your goal is to invest, manipulate voyages, and finish richer than every rival.
<!-- rule-section: components -->
## Components

- 1 game board
- 4 ware loads (nutmeg, silk, ginseng, jade)
- 4 dice (one color per ware)
- 4 black-market value indicators
- 20 shares (5 per ware)
- 20 accomplices (5 player colors)
- 3 punts
- Coin tokens (pesos)
- Rule booklet
<!-- rule-section: setup -->
## Setup

1. Place the board in the center. Put remaining coins beside it as the **harbor cash box**.
2. Each player takes **30 pesos**.
3. Each player takes **3 accomplices** in their color (**4** when playing with **3 players**). Return unused figures to the box.
4. Shuffle all **20 shares**. Deal **2 shares** to each player (secret). Sort remaining shares by ware face up next to the board.
5. Place the four value indicators on **0** of the black market table.
6. Place punts, ware loads, and dice beside the board.

The first voyage begins with the auction for Harbor Master.
<!-- rule-section: voyage-structure -->
## Voyage Structure

![The die moves that cargo ship](/images/rules/manila/voyage-flow.svg)
Each voyage follows this order:

1. Auction the office of **Harbor Master**
2. Harbor Master performs duties
3. Place accomplices and move punts (**place & roll**, three movement rounds)
4. Profit distribution
5. Ware values rise (then clean up for the next voyage)
<!-- rule-section: 1-auction-harbor-master -->
## 1. Auction: Harbor Master

- **First voyage:** the oldest player opens with a bid of at least **1 peso**, or passes.
- **Later voyages:** the previous Harbor Master opens the bidding. If they pass, the next player clockwise opens, and so on.
- Clockwise, each player either **raises** or **passes**. After passing, a player cannot re-enter this auction.
- Highest remaining bidder pays their bid to the cash box and becomes Harbor Master.
- If **nobody** bids, the previous Harbor Master keeps the office.
- You may not bid more than you can raise with cash plus available **loans**.
<!-- rule-ui: tabs -->
<!-- rule-section: 2-harbor-master-duties -->
## 2. Harbor Master Duties

The Harbor Master must do the following (buy share is optional):
<!-- rule-section: a-buy-a-share-optional -->
### A. Buy a share (optional)

Take **one** face-up share from the supply. Pay its cost to the cash box (face down with your unencumbered shares).

**Cost** = current black-market value of that ware, but **at least 5 pesos**.
<!-- rule-section: b-load-goods -->
### B. Load goods

Load **one ware** on each of the **three** punts. Exactly one ware is left out this voyage (it cannot rise in value).
<!-- rule-section: c-place-punts -->
### C. Place punts

Each punt uses its own sea route (spaces **0–13**, then Manila). Place each punt on a **different** route, on a start space **0–5**.

**Important:** the three starting space numbers must sum to **exactly 9**.
<!-- rule-ui: tabs -->
<!-- rule-section: 3-place-accomplices-move-punts -->
## 3. Place Accomplices & Move Punts

![Accomplice spots: ware, port, pirates, insurance](/images/rules/manila/accomplice-spots.svg)
This phase has **three accomplice-placement rounds**, each followed by a **punt movement round**.

**3-player exception:** there are **4** placement rounds and **3** movement rounds. After the first placement round, do a second placement round, then begin alternating placement → movement as usual.
<!-- rule-section: placing-accomplices -->
### Placing accomplices

Starting with the Harbor Master and going clockwise, each player on their turn:

1. Places **one** accomplice on a **vacant** accomplice space, and
2. Pays the cost printed on that space to the cash box (**exception: insurance**).

You may **pass** instead of placing. Once you pass, you place no more accomplices this voyage.

If you have no cash and cannot take a loan, see **Blind Passenger**.
<!-- rule-section: placement-spaces -->
### Placement spaces

| Space | Notes |
|-------|--------|
| **Ware / punt** | Ginseng, silk, nutmeg: **3** spaces each; jade: **4**. Always take the cheapest empty space on that ware. Goal: share the ware’s profit if the punt reaches Manila. |
| **Port / shipyard** | One space per port/shipyard slot (A/B/C). Goal: earn the printed payout if a punt lands there. |
| **Pirate boat** | Two spaces. Front space = **captain**. Goal: board (after round 2 on space 13) or plunder (after round 3 on space 13). |
| **Pilots** | **Small** (cheaper) and **large** (stronger). Act just before the third movement round. |
| **Insurance** | Costs **nothing**; immediately take **10 pesos** from the cash box. Risky if ships wreck. |

Punts already in port take no new accomplices.
<!-- rule-section: movement-rounds -->
### Movement rounds

The Harbor Master rolls the **three dice** matching the loaded wares, then moves each punt that many spaces toward Manila (any order).

- Extra movement after reaching port is discarded; you may not discard movement otherwise.
- Punts stay on their own route; no ware swaps.

**Successful voyage:** a punt that moves **past space 13** reaches Manila. First arrival → port **A**, second → **B**, third → **C**.

**Shipwrecks:** punts that fail after three movement rounds go to the shipyard (A, then B, then C), unless pirates intervene on space 13.
<!-- rule-section: pirates -->
### Pirates

If a punt **ends** a movement round on space **13** and pirates are present:

1. **After round 2 — board:** pirates may move onto vacant spaces on that punt (captain first). Boarding is optional.
2. **After round 3 — plunder:** remove all accomplices from the punt (they earn nothing). Pirates share the ware-load profit from the cash box. The **pirate captain** then chooses for each plundered punt: **port** or **shipyard**. Port still raises that ware’s value.

If a punt ends round 3 on 13 with **no** pirates, it goes to the next vacant **port** space.

Pilot moves onto 13 do **not** trigger pirates.
<!-- rule-section: pilots-before-the-third-die-roll -->
### Pilots (before the third die roll)

After the last placement round, before the third movement:

1. **Small pilot** may move **one** punt **±1** space.
2. **Large pilot** may move **one** punt up to **±2**, or **two** punts **±1** each (directions chosen separately; may re-touch the small pilot’s punt).

Moving past 13 docks the punt in the next vacant port. Pilots cannot affect punts already in Manila. Each pilot may decline.
<!-- rule-ui: tabs -->
<!-- rule-section: 4-profit-distribution -->
## 4. Profit Distribution

![Payout order: pirates, ware, port, shipyard](/images/rules/manila/profit-order.svg)
Pay successful accomplices:
<!-- rule-ui: sidebar -->
1. <!-- rule-item: 4-profit-distribution-item-1 -->
   **Pirates** — only for punts plundered after round 3 on space 13; split the ware-load profit equally (solo pirate takes all).
2. <!-- rule-item: 4-profit-distribution-item-2 -->
   **Ware accomplices** — only if their punt reached Manila; split the profit printed on the ware load equally.
3. <!-- rule-item: 4-profit-distribution-item-3 -->
   **Port accomplices** — paid by the cash box if a punt landed on their space.
4. <!-- rule-item: 4-profit-distribution-item-4 -->
   **Shipyard accomplices** — paid by the **insurance agent** (or cash box if none) if a punt landed on their space.
<!-- rule-section: insurance-pays -->
### Insurance pays

For each punt in the shipyard, the insurance agent pays the printed repair amount to the accomplice on that shipyard space (or to the cash box if empty). The agent may collect other voyage profits first, then must take loans if short. Any shortfall the agent still cannot cover comes from the cash box (not repaid).
<!-- rule-section: loans -->
### Loans

At any time, encumber an unencumbered share to borrow **12 pesos** from the cash box (set the share face down aside).

Repay **15 pesos** (12 + interest) to free the share.

At game end, still-encumbered shares cost **15 pesos** each against your fortune.
<!-- rule-section: blind-passenger -->
### Blind passenger

With **no cash** and **no** unencumbered shares left to borrow against, you may place an accomplice for free on any vacant **punt** space only.
<!-- rule-section: 5-ware-values-rise -->
## 5. Ware Values Rise

Every ware that reached Manila (including pirate-sent-to-port) advances **one step** on the black market (e.g. 0 → 5 → 10 → … → 30). Wares that did not arrive stay put.

Then clear punts/loads to the board edge, return all accomplices, and start the next voyage with a new Harbor Master auction.
<!-- rule-section: game-end-winner -->
## Game End & Winner

As soon as **any** ware marker reaches **30**, the game ends.

Each player’s **fortune** =

- cash (pesos)
- \+ black-market value of each share they hold
- − **15** per still-encumbered share

Highest fortune wins.
<!-- rule-section: variant-aggressive-boarding -->
## Variant: Aggressive Boarding

Pirates may board even when a punt has **no** vacant space: remove one accomplice from the punt and replace it with the pirate. Vacant spaces on space-13 punts must still be filled first. A second pirate boarding the same punt may not displace the pirate captain who just boarded.
<!-- rule-section: quick-reference -->
## Quick Reference

| Item | Value |
|------|-------|
| Starting cash | 30 pesos |
| Accomplices | 3 (4 with 3 players) |
| Starting shares | 2 (secret) |
| Share price | max(black-market value, 5) |
| Punt start sum | exactly 9 (each 0–5) |
| Loan / repay | 12 / 15 pesos per share |
| Insurance payout | +10 pesos when placed |
| Game end | any ware at 30 |
<!-- rule-section: topic-guide -->
## Quick reference
Jump directly to the rule topic you need.

- <!-- rule-item: flow-setup -->
  **Setup**

  1. Place the board; remaining coins form the **harbor cash box**.
  2. Each player starts with **30 pesos**.
  3. Accomplices: **3** each (**4** in a 3-player game).
  4. Deal **2 secret shares** each; sort leftover shares by ware face up.
  5. Put all four black-market markers on **0**.
  6. Keep punts, ware loads, and dice beside the board.
  
  Then auction the first **Harbor Master**.

  Related topics: 
  - [Voyage Overview](#flow-voyage)
  - [Harbor Master Auction](#flow-auction)
  - [Game End](#flow-game-end)

- <!-- rule-item: flow-voyage -->
  **Voyage Overview**

  Each **voyage** runs in this order:
  
  1. Auction **Harbor Master**
  2. Harbor Master duties (optional share → load 3 wares → place punts)
  3. **Place & roll** (placement rounds + 3 dice movements)
  4. Profit distribution
  5. Successful wares rise on the black market
  
  Then clear the board and start the next voyage.

  ![The die moves that cargo ship](/images/rules/manila/voyage-flow.svg)

  Related topics: 
  - [Harbor Master Auction](#flow-auction)
  - [Harbor Master Duties](#flow-harbor-duties)
  - [Place & Roll](#flow-place-roll)

- <!-- rule-item: flow-auction -->
  **Harbor Master Auction**

  - First voyage: oldest player opens (min **1 peso**) or passes.
  - Later: previous Harbor Master opens; if they pass, next clockwise opens.
  - Raise or pass clockwise; once you pass, you are out for this auction.
  - Winner pays the cash box and becomes Harbor Master.
  - No bids → previous Harbor Master keeps the office.
  - You may **loan** against shares to fund a bid.

  Related topics: 
  - [Harbor Master Duties](#flow-harbor-duties)
  - [Loans](#flow-loans)

- <!-- rule-item: flow-harbor-duties -->
  **Harbor Master Duties**

  1. **Buy a share (optional):** pay max(current black-market value, **5**) pesos.
  2. **Load goods:** put one ware on each of **3** punts; leave exactly one ware out.
  3. **Place punts:** each on a different route, start spaces **0–5**, and the three numbers must sum to **exactly 9**.
  
  Higher starts = better odds to reach Manila (need to pass space 13).

  Related topics: 
  - [Place & Roll](#flow-place-roll)
  - [Placement Spaces](#flow-placement)

- <!-- rule-item: flow-place-roll -->
  **Place & Roll**

  Usually: **3** placement rounds, each followed by a movement round.
  
  **3 players:** **4** placements and **3** movements — do two placements first, then alternate.
  
  Each turn (Harbor Master first): place one accomplice on a vacant space and pay its cost, or **pass** (no more placements this voyage).
  
  Then Harbor Master rolls the three ware dice and advances those punts.

  ![Accomplice spots: ware, port, pirates, insurance](/images/rules/manila/accomplice-spots.svg)

  Related topics: 
  - [Placement Spaces](#flow-placement)
  - [Pirates](#flow-pirates)
  - [Pilots](#flow-pilots)
  - [Arrival & Wrecks](#flow-arrival)

- <!-- rule-item: flow-placement -->
  **Placement Spaces**

  | Space | Goal / risk |
  |-------|-------------|
  | **Ware punt** | Share the printed ware profit if it reaches Manila; nothing if it wrecks. Always take the cheapest empty space on that ware (jade has 4 spaces; others 3). |
  | **Port / shipyard** | Earn the printed payout if a punt lands on that A/B/C slot. |
  | **Pirate boat** | Board after round 2 on 13; plunder after round 3 on 13. |
  | **Pilots** | Nudge punts before the third die roll. |
  | **Insurance** | Free; take **+10** immediately — but you pay shipyard repairs. |

  Related topics: 
  - [Pirates](#flow-pirates)
  - [Pilots](#flow-pilots)
  - [Insurance](#flow-insurance)
  - [Profits](#flow-profits)

- <!-- rule-item: flow-pirates -->
  **Pirates**

  Triggers only if a punt **ends** a movement round on space **13** and pirates are present.
  
  - **After movement 2 — board:** captain first, then the second pirate; each may take a vacant punt space or stay.
  - **After movement 3 — plunder:** punt accomplices earn nothing; pirates split the ware-load profit. Pirate captain sends each plundered punt to **port** or **shipyard** (port still raises value).
  
  No pirates on 13 after round 3 → punt goes to the next vacant **port**.
  Pilot moves onto 13 do **not** trigger pirates.

  Related topics: 
  - [Pilots](#flow-pilots)
  - [Arrival & Wrecks](#flow-arrival)
  - [Profits](#flow-profits)

- <!-- rule-item: flow-pilots -->
  **Pilots**

  Act after the last placement round, **before** the third die roll. Cannot affect punts already in Manila.
  
  1. **Small pilot:** move one punt **±1**.
  2. **Large pilot:** move one punt up to **±2**, or two punts **±1** each (may re-touch the small pilot’s punt).
  
  Moving past 13 docks in the next vacant port. Each pilot may decline.

  Related topics: 
  - [Arrival & Wrecks](#flow-arrival)
  - [Profits](#flow-profits)

- <!-- rule-item: flow-arrival -->
  **Arrival & Wrecks**

  - Past space **13** → Manila. Order: port **A**, then **B**, then **C**.
  - Fail after three movements (and not resolved by pirates) → shipyard **A / B / C**.
  - Extra movement points after docking are discarded.
  - Punts in port accept no new accomplices.

  Related topics: 
  - [Profits](#flow-profits)
  - [Insurance](#flow-insurance)

- <!-- rule-item: flow-profits -->
  **Profit Distribution**

  1. **Pirates** — plundered punts (round 3 on 13): split ware-load profit.
  2. **Ware accomplices** — only if their punt reached Manila: split printed profit.
  3. **Port** — cash box pays printed amount if a punt landed there.
  4. **Shipyard** — insurance agent pays (else cash box).
  
  Then successful wares rise one step on the black market.

  ![Payout order: pirates, ware, port, shipyard](/images/rules/manila/profit-order.svg)

  Related topics: 
  - [Insurance](#flow-insurance)
  - [Loans](#flow-loans)
  - [Ware Values](#flow-ware-values)
  - [Game End](#flow-game-end)

- <!-- rule-item: flow-insurance -->
  **Insurance**

  Placing on insurance costs **0** and gives **+10 pesos** immediately.
  
  For **each** punt in the shipyard, the agent pays the printed repair cost to that shipyard accomplice (or to the cash box if empty).
  
  Collect other profits first; take loans if short. Any remaining shortfall is covered by the cash box (not repaid).

  Related topics: 
  - [Loans](#flow-loans)
  - [Profits](#flow-profits)

- <!-- rule-item: flow-loans -->
  **Loans & Blind Passenger**

  **Loan:** encumber one share → receive **12** pesos. Repay **15** to free it.
  
  At game end, each still-encumbered share subtracts **15** from your fortune.
  
  **Blind passenger:** with no cash and no shares left to encumber, place for free only on a vacant **punt** space.

  Related topics: 
  - [Ware Values](#flow-ware-values)
  - [Game End](#flow-game-end)

- <!-- rule-item: flow-ware-values -->
  **Ware Values Rise**

  Every ware that reached Manila (including pirate-sent-to-port) moves **one step** up the black market (0 → 5 → 10 → … → 30).
  
  Wares that did not arrive stay the same.
  
  Clear punts/loads, return accomplices, then auction the next Harbor Master.

  Related topics: 
  - [Game End](#flow-game-end)
  - [Voyage Overview](#flow-voyage)

- <!-- rule-item: flow-game-end -->
  **Game End & Winner**

  When **any** ware marker reaches **30**, the game ends immediately.
  
  **Fortune** = cash + value of all shares − **15** per encumbered share.
  
  Highest fortune wins.

  Related topics: 
  - [Back to Setup](#flow-setup)
  - [Voyage Overview](#flow-voyage)
<!-- rule-section: topic-guide-2 -->
## Quick reference
Jump directly to the rule topic you need.

- <!-- rule-item: flow-setup -->
  **Setup**

  1. Place the board; remaining coins form the **harbor cash box**.
  2. Each player starts with **30 pesos**.
  3. Accomplices: **3** each (**4** in a 3-player game).
  4. Deal **2 secret shares** each; sort leftover shares by ware face up.
  5. Put all four black-market markers on **0**.
  6. Keep punts, ware loads, and dice beside the board.
  
  Then auction the first **Harbor Master**.

  Related topics: 
  - [Voyage Overview](#flow-voyage)
  - [Harbor Master Auction](#flow-auction)
  - [Game End](#flow-game-end)

- <!-- rule-item: flow-voyage -->
  **Voyage Overview**

  Each **voyage** runs in this order:
  
  1. Auction **Harbor Master**
  2. Harbor Master duties (optional share → load 3 wares → place punts)
  3. **Place & roll** (placement rounds + 3 dice movements)
  4. Profit distribution
  5. Successful wares rise on the black market
  
  Then clear the board and start the next voyage.

  ![The die moves that cargo ship](/images/rules/manila/voyage-flow.svg)

  Related topics: 
  - [Harbor Master Auction](#flow-auction)
  - [Harbor Master Duties](#flow-harbor-duties)
  - [Place & Roll](#flow-place-roll)

- <!-- rule-item: flow-auction -->
  **Harbor Master Auction**

  - First voyage: oldest player opens (min **1 peso**) or passes.
  - Later: previous Harbor Master opens; if they pass, next clockwise opens.
  - Raise or pass clockwise; once you pass, you are out for this auction.
  - Winner pays the cash box and becomes Harbor Master.
  - No bids → previous Harbor Master keeps the office.
  - You may **loan** against shares to fund a bid.

  Related topics: 
  - [Harbor Master Duties](#flow-harbor-duties)
  - [Loans](#flow-loans)

- <!-- rule-item: flow-harbor-duties -->
  **Harbor Master Duties**

  1. **Buy a share (optional):** pay max(current black-market value, **5**) pesos.
  2. **Load goods:** put one ware on each of **3** punts; leave exactly one ware out.
  3. **Place punts:** each on a different route, start spaces **0–5**, and the three numbers must sum to **exactly 9**.
  
  Higher starts = better odds to reach Manila (need to pass space 13).

  Related topics: 
  - [Place & Roll](#flow-place-roll)
  - [Placement Spaces](#flow-placement)

- <!-- rule-item: flow-place-roll -->
  **Place & Roll**

  Usually: **3** placement rounds, each followed by a movement round.
  
  **3 players:** **4** placements and **3** movements — do two placements first, then alternate.
  
  Each turn (Harbor Master first): place one accomplice on a vacant space and pay its cost, or **pass** (no more placements this voyage).
  
  Then Harbor Master rolls the three ware dice and advances those punts.

  ![Accomplice spots: ware, port, pirates, insurance](/images/rules/manila/accomplice-spots.svg)

  Related topics: 
  - [Placement Spaces](#flow-placement)
  - [Pirates](#flow-pirates)
  - [Pilots](#flow-pilots)
  - [Arrival & Wrecks](#flow-arrival)

- <!-- rule-item: flow-placement -->
  **Placement Spaces**

  | Space | Goal / risk |
  |-------|-------------|
  | **Ware punt** | Share the printed ware profit if it reaches Manila; nothing if it wrecks. Always take the cheapest empty space on that ware (jade has 4 spaces; others 3). |
  | **Port / shipyard** | Earn the printed payout if a punt lands on that A/B/C slot. |
  | **Pirate boat** | Board after round 2 on 13; plunder after round 3 on 13. |
  | **Pilots** | Nudge punts before the third die roll. |
  | **Insurance** | Free; take **+10** immediately — but you pay shipyard repairs. |

  Related topics: 
  - [Pirates](#flow-pirates)
  - [Pilots](#flow-pilots)
  - [Insurance](#flow-insurance)
  - [Profits](#flow-profits)

- <!-- rule-item: flow-pirates -->
  **Pirates**

  Triggers only if a punt **ends** a movement round on space **13** and pirates are present.
  
  - **After movement 2 — board:** captain first, then the second pirate; each may take a vacant punt space or stay.
  - **After movement 3 — plunder:** punt accomplices earn nothing; pirates split the ware-load profit. Pirate captain sends each plundered punt to **port** or **shipyard** (port still raises value).
  
  No pirates on 13 after round 3 → punt goes to the next vacant **port**.
  Pilot moves onto 13 do **not** trigger pirates.

  Related topics: 
  - [Pilots](#flow-pilots)
  - [Arrival & Wrecks](#flow-arrival)
  - [Profits](#flow-profits)

- <!-- rule-item: flow-pilots -->
  **Pilots**

  Act after the last placement round, **before** the third die roll. Cannot affect punts already in Manila.
  
  1. **Small pilot:** move one punt **±1**.
  2. **Large pilot:** move one punt up to **±2**, or two punts **±1** each (may re-touch the small pilot’s punt).
  
  Moving past 13 docks in the next vacant port. Each pilot may decline.

  Related topics: 
  - [Arrival & Wrecks](#flow-arrival)
  - [Profits](#flow-profits)

- <!-- rule-item: flow-arrival -->
  **Arrival & Wrecks**

  - Past space **13** → Manila. Order: port **A**, then **B**, then **C**.
  - Fail after three movements (and not resolved by pirates) → shipyard **A / B / C**.
  - Extra movement points after docking are discarded.
  - Punts in port accept no new accomplices.

  Related topics: 
  - [Profits](#flow-profits)
  - [Insurance](#flow-insurance)

- <!-- rule-item: flow-profits -->
  **Profit Distribution**

  1. **Pirates** — plundered punts (round 3 on 13): split ware-load profit.
  2. **Ware accomplices** — only if their punt reached Manila: split printed profit.
  3. **Port** — cash box pays printed amount if a punt landed there.
  4. **Shipyard** — insurance agent pays (else cash box).
  
  Then successful wares rise one step on the black market.

  ![Payout order: pirates, ware, port, shipyard](/images/rules/manila/profit-order.svg)

  Related topics: 
  - [Insurance](#flow-insurance)
  - [Loans](#flow-loans)
  - [Ware Values](#flow-ware-values)
  - [Game End](#flow-game-end)

- <!-- rule-item: flow-insurance -->
  **Insurance**

  Placing on insurance costs **0** and gives **+10 pesos** immediately.
  
  For **each** punt in the shipyard, the agent pays the printed repair cost to that shipyard accomplice (or to the cash box if empty).
  
  Collect other profits first; take loans if short. Any remaining shortfall is covered by the cash box (not repaid).

  Related topics: 
  - [Loans](#flow-loans)
  - [Profits](#flow-profits)

- <!-- rule-item: flow-loans -->
  **Loans & Blind Passenger**

  **Loan:** encumber one share → receive **12** pesos. Repay **15** to free it.
  
  At game end, each still-encumbered share subtracts **15** from your fortune.
  
  **Blind passenger:** with no cash and no shares left to encumber, place for free only on a vacant **punt** space.

  Related topics: 
  - [Ware Values](#flow-ware-values)
  - [Game End](#flow-game-end)

- <!-- rule-item: flow-ware-values -->
  **Ware Values Rise**

  Every ware that reached Manila (including pirate-sent-to-port) moves **one step** up the black market (0 → 5 → 10 → … → 30).
  
  Wares that did not arrive stay the same.
  
  Clear punts/loads, return accomplices, then auction the next Harbor Master.

  Related topics: 
  - [Game End](#flow-game-end)
  - [Voyage Overview](#flow-voyage)

- <!-- rule-item: flow-game-end -->
  **Game End & Winner**

  When **any** ware marker reaches **30**, the game ends immediately.
  
  **Fortune** = cash + value of all shares − **15** per encumbered share.
  
  Highest fortune wins.

  Related topics: 
  - [Back to Setup](#flow-setup)
  - [Voyage Overview](#flow-voyage)
<!-- rule-section: topic-guide-3 -->
## Quick reference
Jump directly to the rule topic you need.

- <!-- rule-item: flow-setup -->
  **Setup**

  1. Place the board; remaining coins form the **harbor cash box**.
  2. Each player starts with **30 pesos**.
  3. Accomplices: **3** each (**4** in a 3-player game).
  4. Deal **2 secret shares** each; sort leftover shares by ware face up.
  5. Put all four black-market markers on **0**.
  6. Keep punts, ware loads, and dice beside the board.
  
  Then auction the first **Harbor Master**.

  Related topics: 
  - [Voyage Overview](#flow-voyage)
  - [Harbor Master Auction](#flow-auction)
  - [Game End](#flow-game-end)

- <!-- rule-item: flow-voyage -->
  **Voyage Overview**

  Each **voyage** runs in this order:
  
  1. Auction **Harbor Master**
  2. Harbor Master duties (optional share → load 3 wares → place punts)
  3. **Place & roll** (placement rounds + 3 dice movements)
  4. Profit distribution
  5. Successful wares rise on the black market
  
  Then clear the board and start the next voyage.

  ![The die moves that cargo ship](/images/rules/manila/voyage-flow.svg)

  Related topics: 
  - [Harbor Master Auction](#flow-auction)
  - [Harbor Master Duties](#flow-harbor-duties)
  - [Place & Roll](#flow-place-roll)

- <!-- rule-item: flow-auction -->
  **Harbor Master Auction**

  - First voyage: oldest player opens (min **1 peso**) or passes.
  - Later: previous Harbor Master opens; if they pass, next clockwise opens.
  - Raise or pass clockwise; once you pass, you are out for this auction.
  - Winner pays the cash box and becomes Harbor Master.
  - No bids → previous Harbor Master keeps the office.
  - You may **loan** against shares to fund a bid.

  Related topics: 
  - [Harbor Master Duties](#flow-harbor-duties)
  - [Loans](#flow-loans)

- <!-- rule-item: flow-harbor-duties -->
  **Harbor Master Duties**

  1. **Buy a share (optional):** pay max(current black-market value, **5**) pesos.
  2. **Load goods:** put one ware on each of **3** punts; leave exactly one ware out.
  3. **Place punts:** each on a different route, start spaces **0–5**, and the three numbers must sum to **exactly 9**.
  
  Higher starts = better odds to reach Manila (need to pass space 13).

  Related topics: 
  - [Place & Roll](#flow-place-roll)
  - [Placement Spaces](#flow-placement)

- <!-- rule-item: flow-place-roll -->
  **Place & Roll**

  Usually: **3** placement rounds, each followed by a movement round.
  
  **3 players:** **4** placements and **3** movements — do two placements first, then alternate.
  
  Each turn (Harbor Master first): place one accomplice on a vacant space and pay its cost, or **pass** (no more placements this voyage).
  
  Then Harbor Master rolls the three ware dice and advances those punts.

  ![Accomplice spots: ware, port, pirates, insurance](/images/rules/manila/accomplice-spots.svg)

  Related topics: 
  - [Placement Spaces](#flow-placement)
  - [Pirates](#flow-pirates)
  - [Pilots](#flow-pilots)
  - [Arrival & Wrecks](#flow-arrival)

- <!-- rule-item: flow-placement -->
  **Placement Spaces**

  | Space | Goal / risk |
  |-------|-------------|
  | **Ware punt** | Share the printed ware profit if it reaches Manila; nothing if it wrecks. Always take the cheapest empty space on that ware (jade has 4 spaces; others 3). |
  | **Port / shipyard** | Earn the printed payout if a punt lands on that A/B/C slot. |
  | **Pirate boat** | Board after round 2 on 13; plunder after round 3 on 13. |
  | **Pilots** | Nudge punts before the third die roll. |
  | **Insurance** | Free; take **+10** immediately — but you pay shipyard repairs. |

  Related topics: 
  - [Pirates](#flow-pirates)
  - [Pilots](#flow-pilots)
  - [Insurance](#flow-insurance)
  - [Profits](#flow-profits)

- <!-- rule-item: flow-pirates -->
  **Pirates**

  Triggers only if a punt **ends** a movement round on space **13** and pirates are present.
  
  - **After movement 2 — board:** captain first, then the second pirate; each may take a vacant punt space or stay.
  - **After movement 3 — plunder:** punt accomplices earn nothing; pirates split the ware-load profit. Pirate captain sends each plundered punt to **port** or **shipyard** (port still raises value).
  
  No pirates on 13 after round 3 → punt goes to the next vacant **port**.
  Pilot moves onto 13 do **not** trigger pirates.

  Related topics: 
  - [Pilots](#flow-pilots)
  - [Arrival & Wrecks](#flow-arrival)
  - [Profits](#flow-profits)

- <!-- rule-item: flow-pilots -->
  **Pilots**

  Act after the last placement round, **before** the third die roll. Cannot affect punts already in Manila.
  
  1. **Small pilot:** move one punt **±1**.
  2. **Large pilot:** move one punt up to **±2**, or two punts **±1** each (may re-touch the small pilot’s punt).
  
  Moving past 13 docks in the next vacant port. Each pilot may decline.

  Related topics: 
  - [Arrival & Wrecks](#flow-arrival)
  - [Profits](#flow-profits)

- <!-- rule-item: flow-arrival -->
  **Arrival & Wrecks**

  - Past space **13** → Manila. Order: port **A**, then **B**, then **C**.
  - Fail after three movements (and not resolved by pirates) → shipyard **A / B / C**.
  - Extra movement points after docking are discarded.
  - Punts in port accept no new accomplices.

  Related topics: 
  - [Profits](#flow-profits)
  - [Insurance](#flow-insurance)

- <!-- rule-item: flow-profits -->
  **Profit Distribution**

  1. **Pirates** — plundered punts (round 3 on 13): split ware-load profit.
  2. **Ware accomplices** — only if their punt reached Manila: split printed profit.
  3. **Port** — cash box pays printed amount if a punt landed there.
  4. **Shipyard** — insurance agent pays (else cash box).
  
  Then successful wares rise one step on the black market.

  ![Payout order: pirates, ware, port, shipyard](/images/rules/manila/profit-order.svg)

  Related topics: 
  - [Insurance](#flow-insurance)
  - [Loans](#flow-loans)
  - [Ware Values](#flow-ware-values)
  - [Game End](#flow-game-end)

- <!-- rule-item: flow-insurance -->
  **Insurance**

  Placing on insurance costs **0** and gives **+10 pesos** immediately.
  
  For **each** punt in the shipyard, the agent pays the printed repair cost to that shipyard accomplice (or to the cash box if empty).
  
  Collect other profits first; take loans if short. Any remaining shortfall is covered by the cash box (not repaid).

  Related topics: 
  - [Loans](#flow-loans)
  - [Profits](#flow-profits)

- <!-- rule-item: flow-loans -->
  **Loans & Blind Passenger**

  **Loan:** encumber one share → receive **12** pesos. Repay **15** to free it.
  
  At game end, each still-encumbered share subtracts **15** from your fortune.
  
  **Blind passenger:** with no cash and no shares left to encumber, place for free only on a vacant **punt** space.

  Related topics: 
  - [Ware Values](#flow-ware-values)
  - [Game End](#flow-game-end)

- <!-- rule-item: flow-ware-values -->
  **Ware Values Rise**

  Every ware that reached Manila (including pirate-sent-to-port) moves **one step** up the black market (0 → 5 → 10 → … → 30).
  
  Wares that did not arrive stay the same.
  
  Clear punts/loads, return accomplices, then auction the next Harbor Master.

  Related topics: 
  - [Game End](#flow-game-end)
  - [Voyage Overview](#flow-voyage)

- <!-- rule-item: flow-game-end -->
  **Game End & Winner**

  When **any** ware marker reaches **30**, the game ends immediately.
  
  **Fortune** = cash + value of all shares − **15** per encumbered share.
  
  Highest fortune wins.

  Related topics: 
  - [Back to Setup](#flow-setup)
  - [Voyage Overview](#flow-voyage)

<!-- rule-section: topic-guide-4 -->
## Quick reference
<!-- rule-ui: sidebar -->

Jump directly to the rule topic you need.

- <!-- rule-item: flow-setup -->
  **Setup**

  1. Place the board; remaining coins form the **harbor cash box**.
  2. Each player starts with **30 pesos**.
  3. Accomplices: **3** each (**4** in a 3-player game).
  4. Deal **2 secret shares** each; sort leftover shares by ware face up.
  5. Put all four black-market markers on **0**.
  6. Keep punts, ware loads, and dice beside the board.
  
  Then auction the first **Harbor Master**.

  Related topics: 
  - [Voyage Overview](#flow-voyage)
  - [Harbor Master Auction](#flow-auction)
  - [Game End](#flow-game-end)

- <!-- rule-item: flow-voyage -->
  **Voyage Overview**

  Each **voyage** runs in this order:
  
  1. Auction **Harbor Master**
  2. Harbor Master duties (optional share → load 3 wares → place punts)
  3. **Place & roll** (placement rounds + 3 dice movements)
  4. Profit distribution
  5. Successful wares rise on the black market
  
  Then clear the board and start the next voyage.

  ![The die moves that cargo ship](/images/rules/manila/voyage-flow.svg)

  Related topics: 
  - [Harbor Master Auction](#flow-auction)
  - [Harbor Master Duties](#flow-harbor-duties)
  - [Place & Roll](#flow-place-roll)

- <!-- rule-item: flow-auction -->
  **Harbor Master Auction**

  - First voyage: oldest player opens (min **1 peso**) or passes.
  - Later: previous Harbor Master opens; if they pass, next clockwise opens.
  - Raise or pass clockwise; once you pass, you are out for this auction.
  - Winner pays the cash box and becomes Harbor Master.
  - No bids → previous Harbor Master keeps the office.
  - You may **loan** against shares to fund a bid.

  Related topics: 
  - [Harbor Master Duties](#flow-harbor-duties)
  - [Loans](#flow-loans)

- <!-- rule-item: flow-harbor-duties -->
  **Harbor Master Duties**

  1. **Buy a share (optional):** pay max(current black-market value, **5**) pesos.
  2. **Load goods:** put one ware on each of **3** punts; leave exactly one ware out.
  3. **Place punts:** each on a different route, start spaces **0–5**, and the three numbers must sum to **exactly 9**.
  
  Higher starts = better odds to reach Manila (need to pass space 13).

  Related topics: 
  - [Place & Roll](#flow-place-roll)
  - [Placement Spaces](#flow-placement)

- <!-- rule-item: flow-place-roll -->
  **Place & Roll**

  Usually: **3** placement rounds, each followed by a movement round.
  
  **3 players:** **4** placements and **3** movements — do two placements first, then alternate.
  
  Each turn (Harbor Master first): place one accomplice on a vacant space and pay its cost, or **pass** (no more placements this voyage).
  
  Then Harbor Master rolls the three ware dice and advances those punts.

  ![Accomplice spots: ware, port, pirates, insurance](/images/rules/manila/accomplice-spots.svg)

  Related topics: 
  - [Placement Spaces](#flow-placement)
  - [Pirates](#flow-pirates)
  - [Pilots](#flow-pilots)
  - [Arrival & Wrecks](#flow-arrival)

- <!-- rule-item: flow-placement -->
  **Placement Spaces**

  | Space | Goal / risk |
  |-------|-------------|
  | **Ware punt** | Share the printed ware profit if it reaches Manila; nothing if it wrecks. Always take the cheapest empty space on that ware (jade has 4 spaces; others 3). |
  | **Port / shipyard** | Earn the printed payout if a punt lands on that A/B/C slot. |
  | **Pirate boat** | Board after round 2 on 13; plunder after round 3 on 13. |
  | **Pilots** | Nudge punts before the third die roll. |
  | **Insurance** | Free; take **+10** immediately — but you pay shipyard repairs. |

  Related topics: 
  - [Pirates](#flow-pirates)
  - [Pilots](#flow-pilots)
  - [Insurance](#flow-insurance)
  - [Profits](#flow-profits)

- <!-- rule-item: flow-pirates -->
  **Pirates**

  Triggers only if a punt **ends** a movement round on space **13** and pirates are present.
  
  - **After movement 2 — board:** captain first, then the second pirate; each may take a vacant punt space or stay.
  - **After movement 3 — plunder:** punt accomplices earn nothing; pirates split the ware-load profit. Pirate captain sends each plundered punt to **port** or **shipyard** (port still raises value).
  
  No pirates on 13 after round 3 → punt goes to the next vacant **port**.
  Pilot moves onto 13 do **not** trigger pirates.

  Related topics: 
  - [Pilots](#flow-pilots)
  - [Arrival & Wrecks](#flow-arrival)
  - [Profits](#flow-profits)

- <!-- rule-item: flow-pilots -->
  **Pilots**

  Act after the last placement round, **before** the third die roll. Cannot affect punts already in Manila.
  
  1. **Small pilot:** move one punt **±1**.
  2. **Large pilot:** move one punt up to **±2**, or two punts **±1** each (may re-touch the small pilot’s punt).
  
  Moving past 13 docks in the next vacant port. Each pilot may decline.

  Related topics: 
  - [Arrival & Wrecks](#flow-arrival)
  - [Profits](#flow-profits)

- <!-- rule-item: flow-arrival -->
  **Arrival & Wrecks**

  - Past space **13** → Manila. Order: port **A**, then **B**, then **C**.
  - Fail after three movements (and not resolved by pirates) → shipyard **A / B / C**.
  - Extra movement points after docking are discarded.
  - Punts in port accept no new accomplices.

  Related topics: 
  - [Profits](#flow-profits)
  - [Insurance](#flow-insurance)

- <!-- rule-item: flow-profits -->
  **Profit Distribution**

  1. **Pirates** — plundered punts (round 3 on 13): split ware-load profit.
  2. **Ware accomplices** — only if their punt reached Manila: split printed profit.
  3. **Port** — cash box pays printed amount if a punt landed there.
  4. **Shipyard** — insurance agent pays (else cash box).
  
  Then successful wares rise one step on the black market.

  ![Payout order: pirates, ware, port, shipyard](/images/rules/manila/profit-order.svg)

  Related topics: 
  - [Insurance](#flow-insurance)
  - [Loans](#flow-loans)
  - [Ware Values](#flow-ware-values)
  - [Game End](#flow-game-end)

- <!-- rule-item: flow-insurance -->
  **Insurance**

  Placing on insurance costs **0** and gives **+10 pesos** immediately.
  
  For **each** punt in the shipyard, the agent pays the printed repair cost to that shipyard accomplice (or to the cash box if empty).
  
  Collect other profits first; take loans if short. Any remaining shortfall is covered by the cash box (not repaid).

  Related topics: 
  - [Loans](#flow-loans)
  - [Profits](#flow-profits)

- <!-- rule-item: flow-loans -->
  **Loans & Blind Passenger**

  **Loan:** encumber one share → receive **12** pesos. Repay **15** to free it.
  
  At game end, each still-encumbered share subtracts **15** from your fortune.
  
  **Blind passenger:** with no cash and no shares left to encumber, place for free only on a vacant **punt** space.

  Related topics: 
  - [Ware Values](#flow-ware-values)
  - [Game End](#flow-game-end)

- <!-- rule-item: flow-ware-values -->
  **Ware Values Rise**

  Every ware that reached Manila (including pirate-sent-to-port) moves **one step** up the black market (0 → 5 → 10 → … → 30).
  
  Wares that did not arrive stay the same.
  
  Clear punts/loads, return accomplices, then auction the next Harbor Master.

  Related topics: 
  - [Game End](#flow-game-end)
  - [Voyage Overview](#flow-voyage)

- <!-- rule-item: flow-game-end -->
  **Game End & Winner**

  When **any** ware marker reaches **30**, the game ends immediately.
  
  **Fortune** = cash + value of all shares − **15** per encumbered share.
  
  Highest fortune wins.

  Related topics: 
  - [Back to Setup](#flow-setup)
  - [Voyage Overview](#flow-voyage)

