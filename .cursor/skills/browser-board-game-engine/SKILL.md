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

## Implementation order

Do not boil the ocean. Grow the platform in slices:

```
Task Progress:
- [ ] 1. packages/core: GameState types, seeded RNG, Action/Event log
- [ ] 2. packages/runtime: lifecycle Create→Lobby→Playing→Finished→Replay
- [ ] 3. packages/engine: turns + one domain (cards OR board) first
- [ ] 4. First plugin: simplest complete loop (e.g. Love Letter or Hold'em heads-up)
- [ ] 5. packages/ui: Card / Hand / PlayerSeat / Dialog composed by plugin
- [ ] 6. Offline single-device / hotseat before WebRTC
- [ ] 7. Host authority + action broadcast + reconnect stubs
- [ ] 8. Replay from seed + actions
- [ ] 9. Theme tokens + i18n strings
- [ ] 10. Second plugin to prove engine has no game knowledge
```

If the user names a first game, still extract shared primitives into `engine/` /
`ui/` — never bury rules in runtime.

Plugin shape and UI extension points: **[plugin-api.md](plugin-api.md)** (source of truth).

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

## Definition of done (any slice)

- [ ] No game rules in runtime/network
- [ ] Deterministic with fixed seed (testable)
- [ ] Actions validated then applied immutably
- [ ] UI uses engine components + theme variables
- [ ] UI skill checklist applied for new surfaces
- [ ] Replay or state dump reconstructible from seed + actions (when claimed)
- [ ] New/changed plugins satisfy [plugin-api.md](plugin-api.md) testing DoD

---

## Additional resources

- [architecture.md](architecture.md) — modules, data flow, sync, lifecycle
- [plugin-api.md](plugin-api.md) — plugin developer handbook
- [vision.md](vision.md) — platform vision (original full spec)
- Game Shelf content (rules site, not BBGE): [../add-game/SKILL.md](../add-game/SKILL.md)
