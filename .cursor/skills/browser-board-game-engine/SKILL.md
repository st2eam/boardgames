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

Full architecture (philosophy, packages, subsystems, long-term vision):
[architecture.md](architecture.md) — **read it before designing or implementing**.

This skill is for the **playable engine**. Do not confuse with The Game Shelf
content skill [add-game](../add-game/SKILL.md) (rules site Markdown/meta only).

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

---

## Plugin contract (minimum)

```ts
interface GamePlugin {
  id: string;
  name: string;
  version: string;
  author?: string;
  metadata: Record<string, unknown>;
  setup(): void | Promise<void>;
  createGame(config: unknown): unknown; // initial GameState
  validateAction(state: unknown, action: unknown, ctx: unknown): true | { error: string };
  applyAction(state: unknown, action: unknown, ctx: unknown): unknown; // next state
  onTurnStart?(state: unknown, ctx: unknown): unknown;
  onTurnEnd?(state: unknown, ctx: unknown): unknown;
  checkVictory(state: unknown): unknown | null;
  serialize(state: unknown): string;
  deserialize(payload: string): unknown;
}
```

Plugins: state only. No networking, no DOM/Pixi writes inside `applyAction`.

---

## Action / Event loop

```
Player → Action → Host validate → applyAction → Events → Broadcast → UI render
```

UI and Pixi subscribe to Events / state snapshots. They never mutate GameState.

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

If scaffolding inside this repo, prefer a clear root (e.g. `bbge/` or `packages/`)
and keep Game Shelf `content/games/` / `src/app` untouched unless the user asks
to integrate playable routes.

---

## Definition of done (any slice)

- [ ] No game rules in runtime/network
- [ ] Deterministic with fixed seed (testable)
- [ ] Actions validated then applied immutably
- [ ] UI uses engine components + theme variables
- [ ] UI skill checklist applied for new surfaces
- [ ] Replay or state dump reconstructible from seed + actions (when claimed)

---

## Additional resources

- Full BBGE architecture (verbatim platform spec): [architecture.md](architecture.md)
- Game Shelf content (rules site, not BBGE): [../add-game/SKILL.md](../add-game/SKILL.md)
