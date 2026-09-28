# Super Mega Lucky Box

## Product scope

- Plugin id and content slug: **super-mega-lucky-box**
- One four-round match, 1–6 seats; solo uses the official solo Moon score and rating.
- Simultaneous choices are resolved independently for each player's board.
- Host authority, P2P invitations, recovery, hotseat, and AI seats use the shared BBGE shell.
- No online score tracker or trainer. The game's own final table shows round totals and Moon tiebreaks.
- The lobby states that the 60 numbered Lucky Box faces are fixed transcriptions of the physical cards.

## Fixed card data

The committed **src/cards.json** file records physical cards 1–60 from the [public seven-page card sheet](https://www.scribd.com/document/775265215/Super-Mega-Lucky-box-Cartones). Five faces were cross-checked against the supplied physical-card image. Each card has a 3×3 grid and six possible reward positions; eight positions across the deck are blank. The grid contains each number exactly 60 times across the deck, and each numbered reward appears 17 times. The source sheet is a third-party upload rather than a publisher-hosted master, so its individual faces remain the transcription reference.

The runtime never regenerates faces. It shuffles the fixed data with the host seed. The state's random cursor skips the PRNG samples already consumed by the initial Lucky Box and Number deck shuffles, so later discard and Number deck shuffles remain reproducible across host actions.

## State and action flow

| State phase | Player actions | Next step |
|---|---|---|
| Starting draft | Each player privately keeps 3 of 5 offers | Reveal Number 1 |
| Number selection | Each player crosses one reachable square or skips if none is reachable, then resolves all newly completed bonuses | Reveal the next Number or score the round |
| Round draft | Each player privately keeps 1 of 3 offers | Shuffle the 18 Number cards and begin the next round |
| Host advance | Host submits one deterministic system action | Reveal, score, or begin a round |
| Finished | Show final scores, Moon scoring, winners, and solo rating | Rematch |

Players may resolve their pending row and column bonuses in any order. A completed line is claimed once before its effect is resolved; bonus crosses can therefore append new lines to the same player's queue without re-claiming a line. Completing a blank reward position claims the line without queuing an effect. Bonus effects never use Lightning to modify a printed number.

The player projection contains that player's private draft offers, but exposes only public boards, marks, tokens, score totals, and revealed Number cards for the other seats. The unrevealed Number deck and unchosen draft offers never leave the host's authoritative state.

## Scoring

- Completed Lucky Box cards are worth 15, 12, 10, and 8 points in rounds 1–4.
- A round's total Star score is 1, 4, or 9 points for 1, 2, or 3 Stars.
- At the end of round 4, every two crossed squares on incomplete cards score one point, rounded down.
- Moon scores follow the official 1-player, 2-player, and 3–6-player cases. Overall ties are broken by Moon count; remaining ties are shared.

## Shared shell behavior

- PlayShell discovers the module from play.json; no dedicated route or game-specific shell branch.
- Simultaneous pacing lets the existing host submit multiple AI decisions in one selection window.
- For local human seats, the shell keeps the active choice in view and prompts before revealing the next hotseat player's private view.
- The module's automatic advance handles only deterministic reveal, scoring, and round setup actions; all player decisions remain validated plugin actions.
- The table uses the shared table shell, mobile rails, scroll region, action dock, status banner, and side sheet for battle log and chat.

## Tests

The plugin tests cover physical face samples, deck counts and balance, empty reward positions, seeded setup, private projections, starting selection, invalid actions, Lightning wrap, paired line completion and chains, deck recycling, Stars, all Moon award cases, final card scoring, winner ties, solo ratings, and a deterministic full four-round solo match. Shared hotseat tests cover simultaneous local-seat control selection.
