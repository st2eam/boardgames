---
name: browser-board-game-engine
description: >-
  Architect and implement the Browser Board Game Engine (BBGE): a modular,
  plugin-based, deterministic, multiplayer-first, browser-native tabletop
  platform. Use when building BBGE, game plugins, engine runtime, host-browser
  networking, replay/RNG, BGA-style DOM or Pixi board UI, or when the user mentions BBGE,
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

TypeScript · React · Motion · WebRTC · IndexedDB · Immer · Zod  
(Optional PixiJS/GSAP for canvas-heavy boards; Love Letter v1 uses BGA-style DOM + Motion.)

Prefer functional updates (Immer). Validate Actions with Zod at boundaries.  
Canvas play UIs: `next/dynamic(..., { ssr: false })` when using Pixi.

---

## V1 slice (approved 2026-08-07)

Full detail: [architecture.md §11](architecture.md).

| Decision | Value |
|----------|--------|
| Approach | A — Shelf + `bbge/*` + PeerJS-like signaling + WebRTC |
| First game | Love Letter (**one round** ends match) |
| Design doc | [`docs/games/love-letter.md`](../../../docs/games/love-letter.md) |
| Multiplayer | Host + share link join from day one |
| AI | Reusable `AiSeat` on Host; `deepseek-v4-flash` for play Actions; mock without key |
| Play UI | BGA-style DOM table (`LoveLetterTable`); Motion draw/play |
| Replay tools | **Out** — no replay viewer/SDK UI |
| Entry | `GameHeader` **first** button → `/games/love-letter/play/` |

Per-game BBGE designs: [`docs/games/<slug>.md`](../../../docs/games/).  
Love Letter design (source of truth): [`docs/games/love-letter.md`](../../../docs/games/love-letter.md).

## Implementation order (v1) — shipped on main

```
Task Progress:
- [x] 1. bbge/core: GameState, seeded RNG, Action/Event envelopes
- [x] 2. bbge/runtime: Create→Lobby→Initialize→Playing→Finished (no Replay UI)
- [x] 3. bbge/engine helpers as needed for Love Letter
- [x] 4. plugin love-letter: Full Game rules + projectView + pending flows
- [x] 5. Shelf: play.json, hasPlay, GameHeader Play first, /play/ shell
- [x] 6. bbge/network: PeerJS + WebRTC data channel
- [x] 7. Host authority + action/event broadcast + best-effort rejoin
- [x] 8. AiSeat: DeepSeek flash for Actions + mock; 90s think budget
- [x] 9. bbge/ui PlayShell + BGA LoveLetterTable (panels, log, chat, Motion)
- [x] 10. Theme tokens + i18n; npm run test:bbge
```

Extract shared primitives into `engine/` / `ui/` / `AiSeat` — never bury rules
or DeepSeek calls inside the Love Letter plugin.

Plugin shape: **[plugin-api.md](plugin-api.md)**. AiSeat: **[plugin-api.md §16](plugin-api.md)**.

---

## Adding a new playable game (Shelf + plugin)

Use together with [add-game](../add-game/SKILL.md) **Step 6d**. Content binding alone is insufficient.

```
1. Design     → docs/games/<slug>.md (+ docs/games/README.md)
2. Plugin     → bbge/plugins/<pluginId>/ (rules, state, projectView, tests)
3. Table UI   → plugins/.../ui/ BGA DOM (players left · board center · log/chat right)
4. Shelf      → content/games/<slug>/play.json { pluginId, pluginVersion }
                wire PlayPageClient / PlayShell for that pluginId
5. AI (opt.)  → Host AiSeat; DeepSeekLoveLetterSeat pattern with deepseek-v4-flash
                for Actions only; mock without key; no auto speak
6. Verify     → npm run test:bbge && npm run build → commit/push
```

**Non-negotiables learned from Love Letter v1:**

- Plugin never imports network / DeepSeek / DOM side effects into `apply`
- `projectView` hides other hands; Host client never shows AI/remote private views
- Public Events must not carry private ranks (priest peek, baron survivor, etc.)
- After a completed play, advance turn + draw so the actor always has a full hand (unless pending)
- Pending flows (chancellor / priest confirm) pause turn advance until resolved
- Prefer DOM + Motion over Pixi unless the board truly needs a canvas

Reference design: [`docs/games/love-letter.md`](../../../docs/games/love-letter.md).

---

## Action / Event loop

```
Player → Action → Host validate → applyAction → Events → Broadcast → UI render
```

UI (DOM or Pixi) subscribe to Events / state snapshots. They never mutate GameState.

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

- [x] No game rules in runtime/network; no DeepSeek calls inside plugins
- [x] Deterministic with fixed seed (`npm run test:bbge`)
- [x] Actions validated then applied immutably; views hide private cards
- [x] Host hotseat / AI can finish a Full Game round; PeerJS join path wired
- [x] AI thinking status; LLM plays cards (no auto chat)
- [x] Play button first + homepage Play Now when `play.json` present
- [x] BGA-style table: discards, priest confirm, zoom, Motion play/draw
- [x] **No** replay viewer / replay tooling shipped
- [x] Plugin tests cover illegal play, projectView, priest reveal, autopilot

---

## Additional resources

- Love Letter v1 design: [`docs/games/love-letter.md`](../../../docs/games/love-letter.md)
- [architecture.md](architecture.md) — modules, data flow, sync, lifecycle
- [plugin-api.md](plugin-api.md) — plugin developer handbook
- [vision.md](vision.md) — platform vision (original full spec)
- Game Shelf content (rules site, not BBGE): [../add-game/SKILL.md](../add-game/SKILL.md)
