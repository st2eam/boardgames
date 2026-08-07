---
name: browser-board-game-engine
description: >-
  Architect and implement the Browser Board Game Engine (BBGE): a modular,
  plugin-based, deterministic, multiplayer-first, browser-native tabletop
  platform. Use when building BBGE, game plugins, engine runtime, host-browser
  networking, replay/RNG, Pixi/Vite board UI, or when the user mentions BBGE,
  browser board game engine, game plugin, host authority, or playable online
  tabletop (Texas Hold'em, Avalon, Love Letter, Carcassonne, Catan, etc.).
---

# Browser Board Game Engine (BBGE)

Build a **platform**, not a single game. Game rules live only in plugins.

This skill is for the **playable engine**. Do not confuse with The Game Shelf
content skill [add-game](../add-game/SKILL.md) (rules site Markdown/meta only).

---

## Docs (read before implementing)

| Doc | Purpose |
|-----|---------|
| [architecture.md](architecture.md) | Modules, data flow, sync, lifecycle |
| [plugin-api.md](plugin-api.md) | Plugin handbook: Action / Event / GameState / UI / hooks |
| [vision.md](vision.md) | Philosophy, subsystem catalog, long-term vision |

**Order:** skim golden rules below → read `architecture.md` for the slice you touch → read `plugin-api.md` when writing or changing a plugin.

---

## Companion skills (UI / interaction)

When implementing lobby, seats, boards, cards, dialogs, or motion — also load
and follow UI skills (do not invent a parallel design system):

| Skill | When |
|-------|------|
| `.claude/skills/ui-ux-pro-max/SKILL.md` | Plan/build/review UI: palette, type, layout, components |
| `.claude/skills/design-taste-frontend/SKILL.md` | Anti-slop landing/lobby polish |
| `.claude/skills/frontend-design/SKILL.md` or user `frontend-design` | Distinctive production UI |
| Project tokens | Prefer existing Game Shelf tokens (`primary` / `accent` / `surface`) when embedding in this repo |

**Rule:** Engine UI stays reusable and theme-driven (CSS variables). Plugins
compose engine components; they do not hardcode colors or one-off chrome.

---

## Golden Rules (non-negotiable)

1. Engine never knows game rules.
2. Plugins never know networking.
3. Rendering never modifies state.
4. State is immutable; every action → new state.
5. Actions are deterministic; never `Math.random()` — seeded PRNG only.
6. Events are append-only and replayable.
7. Clients submit Actions only; Host Browser is authoritative.
8. Sync Actions / Events / Diffs — not full state every frame.
9. Offline-first whenever possible.
10. Features must be reusable across games.

---

## Default stack

TypeScript · React · Vite · PixiJS · Framer Motion · WebRTC · IndexedDB · Immer · Zod

Prefer functional updates (Immer). Validate Actions with Zod at boundaries.

---

## V1 slice (approved 2026-08-07)

Full detail: [architecture.md §11](architecture.md).

| Decision | Value |
|----------|--------|
| Approach | A — Shelf + `bbge/*` + PeerJS-like signaling + WebRTC |
| First game | Love Letter (**one round** ends match) |
| Design doc | [`docs/games/love-letter.md`](../../../docs/games/love-letter.md) |
| Multiplayer | Host + share link join from day one |
| AI | Reusable `AiSeat` on Host; DeepSeek key from chat; think + speak |
| Replay tools | **Out** — no replay viewer/SDK UI |
| Entry | `GameHeader` **first** button → `/games/love-letter/play/` |

Per-game BBGE designs: [`docs/games/<slug>.md`](../../../docs/games/).

## Implementation order (v1)

```
Task Progress:
- [ ] 1. bbge/core: GameState, seeded RNG, Action/Event envelopes
- [ ] 2. bbge/runtime: Create→Lobby→Initialize→Playing→Finished (no Replay UI)
- [ ] 3. bbge/engine: turns + cards (Love Letter needs)
- [ ] 4. plugin love-letter: full match rules + projectView
- [ ] 5. Shelf: play.json, hasPlay, GameHeader Play first, /play/ shell
- [ ] 6. bbge/network: WebRTC data channel + light signaling (room link)
- [ ] 7. Host authority + action/event broadcast + best-effort rejoin
- [ ] 8. AiSeat: DeepSeekAdapter reuse, thinking broadcast, table speak
- [ ] 9. bbge/ui: Card / Hand / PlayerSeat / Dialog / AI activity chrome
- [ ] 10. Theme tokens + i18n; determinism tests for love-letter
```

Extract shared primitives into `engine/` / `ui/` / `AiSeat` — never bury rules
or DeepSeek calls inside the Love Letter plugin.

Plugin shape: **[plugin-api.md](plugin-api.md)**. AiSeat: **[plugin-api.md §16](plugin-api.md)**.

---

## Action / Event loop

```
Player → Action → Host validate → applyAction → Events → Broadcast → UI render
```

UI and Pixi subscribe to Events / state snapshots. They never mutate GameState.

Details: [architecture.md §5–§6](architecture.md).

---

## Folder layout (target monorepo)

```
packages/
  core/ runtime/ network/ sync/ events/ state/ replay/
  animation/ audio/ assets/ plugins/
  engine/   # board cards tiles dice resources turns actions
  ui/       # board card token dice dialog player overlay
  sdk/
plugins/    # texas-holdem avalon love-letter carcassonne catan ...
themes/
examples/
docs/
```

**UI entry (normative):** embed in The Game Shelf game page action row
(`GameHeader`) as the **first** button, then Flow / Score / Trainer /
Calculator → route `/[locale]/games/[slug]/play/`, gated by
`content/games/<slug>/play.json`. Details: [architecture.md §9](architecture.md).

Scaffold engine code under `bbge/` or `packages/`; wire only `hasPlay` + play
page + i18n into `src/` / `content/` when adding a playable game.

---

## Definition of done (v1)

- [ ] No game rules in runtime/network; no DeepSeek calls inside plugins
- [ ] Deterministic with fixed seed (automated tests)
- [ ] Actions validated then applied immutably; views hide private cards
- [ ] Two browsers can finish Love Letter with ≥1 AI seat
- [ ] AI thinking status + table speech visible to all peers
- [ ] Play button first on Love Letter game page when `play.json` present
- [ ] UI uses engine components + theme variables + companion UI skills
- [ ] **No** replay viewer / replay tooling shipped
- [ ] Plugin satisfies [plugin-api.md](plugin-api.md) testing DoD

---

## Additional resources

- Love Letter v1 design: [`docs/games/love-letter.md`](../../../docs/games/love-letter.md)
- [architecture.md](architecture.md) — modules, data flow, sync, lifecycle
- [plugin-api.md](plugin-api.md) — plugin developer handbook
- [vision.md](vision.md) — platform vision (original full spec)
- Game Shelf content (rules site, not BBGE): [../add-game/SKILL.md](../add-game/SKILL.md)
