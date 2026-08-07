# BBGE Plugin API

Plugin developer handbook. Plugins define **rules only**. They never touch
networking, DOM, Pixi, or themes directly.

Architecture context: [architecture.md](architecture.md). Platform vision:
[vision.md](vision.md).

---

## 1. What a plugin is

A **GamePlugin** is a versioned package that:

1. Declares metadata (id, players, options)
2. Creates the initial immutable `GameState`
3. Validates and applies `Action`s
4. Emits domain `Event`s (via return values / apply result — not by calling network)
5. Detects terminal victory / draw
6. Serializes state for save / sync snapshots

The Runtime loads the plugin, runs the host pipeline, and broadcasts results.

---

## 2. Golden rules for plugin authors

1. **Pure apply** — `validateAction` / `applyAction` must be deterministic and side-effect free (no I/O, no `Math.random()`, no timers).
2. **Immutable state** — return a new state (Immer `produce` is fine).
3. **No networking** — do not import `packages/network`.
4. **No rendering** — do not create React/Pixi nodes inside apply; expose UI via extension points (see §8).
5. **Seeded RNG only** — use `ctx.rng` from the Runtime.
6. **Actions are the only intent** — everything a player can do is an Action type.
7. **Events describe what happened** — for UI, audio, replay annotations.
8. **Engine helpers, not forks** — reuse `engine/cards`, `engine/turns`, etc.

---

## 3. Core types

Names are normative for the SDK; field sets may grow but should stay backward compatible via versioning.

### 3.1 GameState

Authoritative, immutable document for one match.

```ts
interface GameState {
  /** Plugin-defined schema version for migrations */
  schemaVersion: number;
  /** Opaque plugin id */
  pluginId: string;
  seed: string;
  phase: string; // plugin-defined phase machine
  turn: TurnState;
  players: PlayerState[];
  /** Board / map — shape is plugin + engine specific */
  board?: unknown;
  /** Card zones, tile bags, resource banks, etc. */
  zones?: Record<string, unknown>;
  objects?: Record<string, unknown>;
  resources?: Record<string, unknown>;
  cards?: unknown;
  /** Append-only logical history refs (optional; runtime also keeps Action log) */
  history?: unknown[];
  /** Plugin private bag */
  data: Record<string, unknown>;
}
```

Guidelines:

- Put **shared** structure in top-level fields when using engine helpers.
- Put **game-specific** blobs in `data` or typed module augmentation.
- Never store UI-only fields (selection, animation flags) in authoritative state.

### 3.2 PlayerState

```ts
interface PlayerState {
  id: PlayerId;
  seat: number;
  name: string;
  status: "active" | "eliminated" | "left";
  /** Public attrs (score, role if public, chips, …) */
  public: Record<string, unknown>;
  /** Private attrs — stripped from other clients' views */
  private?: Record<string, unknown>;
}
```

### 3.3 TurnState

```ts
interface TurnState {
  index: number;
  activePlayerIds: PlayerId[]; // one or many (simultaneous)
  deadline?: number; // host logical time or null
  meta?: Record<string, unknown>;
}
```

### 3.4 Action

Client → Host intent. Validated then applied.

```ts
interface Action<T extends string = string, P = unknown> {
  type: T;
  playerId: PlayerId;
  payload: P;
  /** Client-generated id for ack correlation */
  clientActionId?: string;
}
```

Examples (illustrative — defined by each plugin):

| Game | Actions |
|---|---|
| Texas Hold'em | `fold`, `check`, `call`, `raise` |
| Love Letter | `playCard`, `guessPlayer` |
| Carcassonne | `placeTile`, `placeMeeple` |
| Catan | `rollDice`, `buildRoad`, `buildSettlement`, `trade` |

**System Actions** (Runtime-generated, still in the log):

- `playerTimeout`
- `playerResign`
- `hostPause` / `hostResume` (if modeled as actions)

### 3.5 Event

Append-only fact after a successful apply (and sometimes lifecycle).

```ts
interface Event<T extends string = string, P = unknown> {
  type: T;
  payload: P;
  /** Host seq of the Action that caused this, if any */
  actionSeq?: number;
  ts?: number; // logical timeline mark
}
```

Common engine-level events (optional shared vocabulary):

`PlayerJoined` · `PlayerLeft` · `TurnStarted` · `TurnEnded` ·
`CardDrawn` · `CardPlayed` · `TilePlaced` · `DiceRolled` ·
`MeeplePlaced` · `RoadBuilt` · `ResourceCollected` · `WinnerDeclared` ·
`GameStarted` · `GameFinished`

Plugins may define namespaced types: `loveLetter/cardPlayed`.

### 3.6 GameView (client projection)

```ts
interface GameView {
  /** Public slice of GameState */
  state: unknown;
  /** Perspective player; null for spectator */
  you: PlayerId | null;
  /** Your private info already merged into view */
}
```

Plugins should export `projectView(state, viewerId) => GameView` so Runtime/sync
can filter hidden information consistently.

---

## 4. Plugin interface

```ts
interface GamePlugin<TState = GameState, TAction = Action, TConfig = unknown> {
  id: string;
  name: string;
  version: string;
  author?: string;
  metadata: PluginMetadata;

  setup?(ctx: PluginSetupContext): void | Promise<void>;

  createGame(config: TConfig, ctx: ApplyContext): TState;

  validateAction(
    state: TState,
    action: TAction,
    ctx: ApplyContext,
  ): true | ValidationError;

  applyAction(
    state: TState,
    action: TAction,
    ctx: ApplyContext,
  ): ApplyResult<TState>;

  onTurnStart?(state: TState, ctx: ApplyContext): ApplyResult<TState> | TState;
  onTurnEnd?(state: TState, ctx: ApplyContext): ApplyResult<TState> | TState;

  checkVictory(state: TState): VictoryResult | null;

  projectView?(state: TState, viewerId: PlayerId | null): unknown;

  serialize(state: TState): string;
  deserialize(payload: string): TState;

  /** Optional UI contribution — see §8 */
  ui?: PluginUIModule;
}

interface ValidationError {
  error: string;
  code?: string;
}

interface ApplyResult<TState> {
  state: TState;
  events: Event[];
}

interface VictoryResult {
  kind: "winner" | "draw" | "ranking";
  winners?: PlayerId[];
  ranking?: PlayerId[];
  reason?: string;
}
```

### 4.1 Metadata

```ts
interface PluginMetadata {
  minPlayers: number;
  maxPlayers: number;
  /** turn | simultaneous | realtime */
  pacing: "turn" | "simultaneous" | "realtime";
  tags?: string[];
  /** Zod / JSON schema for lobby options */
  configSchema?: unknown;
  assets?: string[]; // bundle ids
  i18n?: Record<string, Record<string, string>>; // locale → keys
}
```

### 4.2 ApplyContext

Injected by Runtime — the only legal source of randomness and host services
allowed during apply:

```ts
interface ApplyContext {
  rng: Rng; // seeded PRNG
  /** Host logical time for deadlines — do not use Date.now() for outcomes */
  now?: number;
  /** Engine facades */
  engine: {
    cards: CardEngineApi;
    turns: TurnEngineApi;
    dice: DiceEngineApi;
    // …
  };
}
```

---

## 5. Lifecycle hooks (plugin perspective)

| Hook | When | Must be pure? |
|---|---|---|
| `setup` | Once per session load | May load assets meta (async OK); no state mutate |
| `createGame` | Initialize phase | Yes — uses `ctx.rng` for deals/shuffles |
| `validateAction` | Each inbound Action | Yes |
| `applyAction` | After validate ok | Yes |
| `onTurnStart` / `onTurnEnd` | Turn engine transitions | Yes |
| `checkVictory` | After each apply / turn end | Yes |
| `serialize` / `deserialize` | Save, snapshot, migrate | Yes |

Lobby ready-up is **Runtime**, not plugin — unless the plugin exposes config
validation via `metadata.configSchema`.

---

## 6. Action pipeline contract

Host Runtime algorithm (plugins must be compatible):

```
1. Receive Action
2. Attach/verify playerId (reject spoof if seat binding exists)
3. plugin.validateAction(state, action, ctx)
4. If error → ack reject; stop
5. result = plugin.applyAction(state, action, ctx)
6. state = result.state
7. append Events; assign action seq
8. victory = plugin.checkVictory(state)
9. if victory → phase Finished + WinnerDeclared
10. record replay; sync broadcast
```

**Idempotency:** same Action must not be applied twice; Runtime dedupes by
`clientActionId` / seq. Plugins should still tolerate defensive checks.

**Partial failure:** plugins must not throw for illegal moves — return validation
errors. Throw only for programmer bugs (then Runtime marks desync).

---

## 7. RNG API

```ts
interface Rng {
  next(): number; // [0, 1)
  int(min: number, max: number): number; // inclusive
  shuffle<T>(items: T[]): T[]; // new array
  pick<T>(items: T[]): T;
}
```

Deal/shuffle in `createGame` and in `applyAction` only through `ctx.rng`.

---

## 8. UI extension points

Plugins compose **engine UI**, they do not fork chrome.

### 8.1 PluginUIModule

```ts
interface PluginUIModule {
  /** React table root — receives GameView + dispatch(action) */
  Table?: React.ComponentType<TableProps>;
  /** Lobby options form bound to configSchema */
  LobbyOptions?: React.ComponentType<LobbyOptionsProps>;
  /** Optional overlays: rules help, score detail */
  overlays?: Record<string, React.ComponentType<OverlayProps>>;
  /** Map event types → suggested animation presets */
  animations?: Record<string, AnimationPresetId>;
}
```

```ts
interface TableProps {
  view: unknown;
  dispatch: (action: Action) => void;
  locale: string;
  theme: ThemeTokens; // CSS variable handles, not raw hex required
}
```

### 8.2 Reusable components (engine `packages/ui`)

Prefer these before inventing new primitives:

Card · Deck · Hand · Board · Grid · HexGrid · Dice · Token · Meeple · Chip ·
Avatar · Dialog · Popup · Timer · Counter · Button · PlayerSeat · ScoreBoard ·
Notification

### 8.3 Theming & i18n

- Colors/spacing via theme CSS variables (`--bbge-primary`, …)
- Strings via `metadata.i18n` or Runtime `t(key)` — **no hardcoded player-facing copy** in components when avoidable
- When building UI, follow companion skills (`ui-ux-pro-max`, etc.) per [SKILL.md](SKILL.md)

### 8.4 Dispatch rules

```
UI intent → dispatch(Action) → Runtime → (network) → Host → plugin
UI ← view/events
```

Never write to authoritative state from a component.

---

## 9. Serialization

- `serialize` must be deterministic and complete for authoritative fields.
- Prefer JSON with stable key order for diffs; binary optional later.
- Include `schemaVersion`; provide migrations when bumping.
- Snapshots used by sync should round-trip:  
  `deserialize(serialize(state))` deep-equal authoritative fields.

---

## 10. Testing requirements (plugin DoD)

Every plugin should ship:

1. **Determinism test** — fixed seed + action list ⇒ golden state hash
2. **Illegal action tests** — validate rejects bad moves
3. **Victory tests** — terminal detection
4. **View filter test** — private fields not leaked in `projectView`
5. **Round-trip serialize** test

---

## 11. Minimal plugin skeleton

```ts
export const loveLetterPlugin: GamePlugin = {
  id: "love-letter",
  name: "Love Letter",
  version: "0.1.0",
  metadata: {
    minPlayers: 2,
    maxPlayers: 6,
    pacing: "turn",
  },

  createGame(config, ctx) {
    // deal with ctx.rng.shuffle
    return initialState;
  },

  validateAction(state, action) {
    // return true or { error, code }
    return true;
  },

  applyAction(state, action, ctx) {
    const next = /* pure update */;
    return { state: next, events: [{ type: "loveLetter/cardPlayed", payload: {} }] };
  },

  checkVictory(state) {
    return null; // or { kind: "winner", winners: [...] }
  },

  serialize: (s) => JSON.stringify(s),
  deserialize: (p) => JSON.parse(p),
};
```

---

## 12. Folder convention

```
plugins/<plugin-id>/
  package.json
  src/
    index.ts          # exports GamePlugin
    state.ts          # types + initial state
    actions.ts        # action creators + zod schemas
    rules/            # pure reducers
    projectView.ts
    ui/
      Table.tsx
      LobbyOptions.tsx
  tests/
    determinism.test.ts
  assets/
  locales/
    en.json
    zh.json
```

### 12.1 Game Shelf binding

To show **开始游戏** on the rules site, add alongside other feature configs:

```
content/games/<slug>/play.json  →  { "pluginId": "<plugin-id>", "pluginVersion": "…" }
```

Button lives in `GameHeader` as the **first** feature action (before Flow /
Score); route is `/[locale]/games/[slug]/play/`. See
[architecture.md §9](architecture.md).

Product/engine design for each playable game: `docs/games/<slug>.md`
(e.g. [love-letter.md](../../../docs/games/love-letter.md)).

---

## 13. Versioning & compatibility

- `id` is stable forever; `version` follows semver.
- Runtime may refuse plugins with incompatible `enginePeerDependency`.
- Breaking changes to shared Action/Event envelopes bump BBGE major; plugins declare supported engine range.

---

## 14. Anti-patterns

| Avoid | Prefer |
|---|---|
| `Math.random()` in rules | `ctx.rng` |
| Fetching APIs inside `applyAction` | Preload in `setup` / assets |
| Calling DeepSeek / any LLM inside a plugin | Host **`AiSeat`** (§16) |
| Reading `localStorage` in validate | Pass config via `createGame` |
| Mutating state in React `useEffect` | `dispatch(Action)` |
| Encoding networking in plugin | Runtime transport |
| Copy-pasting Card UI per game | Compose `packages/ui` |

---

## 15. Related docs

- [architecture.md](architecture.md) — modules, data flow, sync, lifecycle (§11 = v1 slice)
- [vision.md](vision.md) — full platform vision
- [SKILL.md](SKILL.md) — implementation order & golden rules

---

## 16. AiSeat (reusable Host AI — v1)

Game-agnostic seat runner. **Not** part of `GamePlugin`. Runtime/Host owns it;
plugins only expose legal Actions via normal validate/apply.

### 16.1 Placement

- Executes only on **Host**
- API key: same IndexedDB DeepSeek key as The Game Shelf chat
- Transport: AI outputs become normal `Action`s (and optional chat messages)
  that go through the Host pipeline — guests never need a key

### 16.2 Interface (conceptual)

```ts
interface AiSeat {
  id: string; // seat / player id
  /** Produce a legal Action for the current private view */
  think(view: unknown, legalHints?: unknown): Promise<Action>;
  /** Optional short table talk (flavor / bluff); not an Action */
  speak?(context: AiSpeakContext): Promise<AiChatMessage | null>;
}

interface AiSpeakContext {
  view: unknown;
  lastEvents: Event[];
  locale: string;
}

interface AiChatMessage {
  playerId: PlayerId;
  text: string;
  /** Host wall-clock for UI only — must not affect GameState / RNG */
  at: number;
}

/** Broadcast to all peers for activity UI (reuse chat thinking patterns) */
type AiPresenceEvent =
  | { type: "ai/thinking"; playerId: PlayerId; started: true }
  | { type: "ai/thinking"; playerId: PlayerId; started: false }
  | { type: "ai/chat"; message: AiChatMessage };
```

### 16.3 Implementation notes (Game Shelf)

- Prefer wrapping existing `DeepSeekAdapter` (thinking blocks → `ai/thinking`)
- Prompting is **seat-policy** code under `bbge` (or `src/lib/ai` shared helper),
  parameterized by plugin id + compact rules summary — still **outside**
  `applyAction`
- Table UI shows thinking activity on that seat; chat line in a shared log
- Failures (no key / rate limit): surface Host-only error; do not advance turn
  with a random illegal move

### 16.4 Out of scope for AiSeat v1

- Guest-side LLM
- Training / fine-tunes
- Replay of AI thoughts in a replay tool (replay tools are out of v1 entirely)
