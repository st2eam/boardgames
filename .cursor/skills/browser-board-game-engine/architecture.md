# BBGE Architecture

Technical architecture for the Browser Board Game Engine: modules, data flow,
synchronization, and lifecycle. Platform vision and package catalog live in
[vision.md](vision.md). Plugin contracts live in [plugin-api.md](plugin-api.md).

---

## 1. Design constraints

| Constraint | Implication |
|---|---|
| Browser is the runtime | No Node game server required for core play |
| Host Browser is authoritative | One peer owns validation + state transitions |
| Plugins define rules | Runtime/network/UI never encode game logic |
| Immutable state | Every accepted Action yields a new `GameState` |
| Deterministic RNG | Seeded PRNG only; identical seed + actions ⇒ identical game |
| Event-driven | Side effects for UI/audio/replay come from Events |
| Sync lean | Prefer Actions / Events / Diffs over full-state spam |

---

## 2. Layered system map

```
┌─────────────────────────────────────────────────────────────┐
│  UI Framework · Theme · Audio · Animation (presentational) │
├─────────────────────────────────────────────────────────────┤
│  Runtime (lifecycle, host loop, plugin host, RNG, replay)  │
├─────────────────────────────────────────────────────────────┤
│  Plugin (rules only)  │  Engine domains (cards/board/…)     │
├─────────────────────────────────────────────────────────────┤
│  Core: State · Actions · Events · Types · Zod schemas       │
├─────────────────────────────────────────────────────────────┤
│  Sync · Network · Persistence · Assets · AI adapter         │
└─────────────────────────────────────────────────────────────┘
```

**Dependency rules**

- `ui` → may read state/events; must not call `applyAction` except via Runtime API
- `plugins` → `core` + `engine` helpers only; never `network` / `ui` / DOM
- `runtime` → loads plugin, owns host loop; never embeds game-specific rules
- `network` / `sync` → transport Actions/Events/Diffs/Snapshots; never interpret rules

---

## 3. Module responsibilities

### 3.1 Core (`packages/core`)

- Shared TypeScript types: `GameState`, `Action`, `Event`, `PlayerId`, `Phase`
- Seeded PRNG (`createRng(seed)`)
- Immutable update helpers (Immer-friendly patterns)
- Action/Event envelope schemas (Zod)
- Pure utilities (id generation from counters/seed — not `Math.random()`)

### 3.2 Runtime (`packages/runtime`)

Owns:

- Session lifecycle (Create → … → Replay)
- Player join/leave in lobby and in-game policies (generic seats, not game roles)
- Plugin load / hot-reload boundary
- Host action pipeline: validate → apply → emit → record → broadcast
- Clock for timed turns (optional); still deterministic when timeouts become Actions
- Wiring to sync, replay, persistence

Does **not** own: victory conditions, legal moves, scoring formulas.

### 3.3 Engine domains (`packages/engine/*`)

Reusable **rule-agnostic** primitives plugins compose:

| Domain | Provides |
|---|---|
| `turns` | Sequential / simultaneous / priority / reaction windows |
| `cards` | Deck, hand, zones, shuffle (seeded), draw, discard |
| `board` | Rect / hex / graph / free placement coordinates |
| `tiles` | Rotation, adjacency helpers, snapping metadata |
| `dice` | Dn faces, weighted rolls via RNG |
| `resources` | Generic counters / banks |
| `actions` | Common action factories / reducer helpers |

Engine code must stay game-agnostic (e.g. “draw from deck”, not “Love Letter discard”).

### 3.4 Events (`packages/events`)

- Append-only event log
- Typed event bus for local subscribers (UI, audio, debug)
- Serialization for network/replay

### 3.5 Sync (`packages/sync`)

- Action ordering (host sequence numbers)
- Diff generation / application
- Snapshot create/restore for join/reconnect
- Conflict policy: host wins; clients reconcile by applying host stream

### 3.6 Network (`packages/network`)

Transports only:

- WebRTC / WebSocket / Offline / LAN adapters
- Heartbeat, reconnect, host migration hooks
- Envelope: `{ type, seq, payload }` — no rule knowledge

### 3.7 Replay (`packages/replay`)

Records: `seed`, ordered `Action[]`, optional `Event[]`, timeline markers.
Reconstruct: `createGame(seed)` + fold `applyAction` in order.

### 3.8 Persistence (`packages/…` or runtime module)

- IndexedDB autosave / manual save
- Import/export of replay or serialized state
- Cloud sync is an adapter, not a core dependency

### 3.9 UI / Animation / Theme / Assets / Audio

Presentational. Subscribe to projected view models derived from public state +
local private knowledge. Animations are declarative reactions to Events.
Themes use CSS variables; plugins do not hardcode colors.

### 3.10 AI

`Think(view: GameView) → Action`. Same Action path as humans; host validates.

### 3.11 SDK

Inspectors, replay viewer, generators, tests — developer-facing, not required at runtime for players.

---

## 4. Lifecycle

### 4.1 Session phases

```
Create → Lobby → Initialize → Start → Playing ⇄ Paused → Finished → Replay
```

| Phase | Who acts | State |
|---|---|---|
| **Create** | Host / SDK | Allocate session id, choose plugin + config, seed |
| **Lobby** | Host + clients | Seats, ready flags, options; no rules yet |
| **Initialize** | Runtime + plugin | `plugin.setup()` + `plugin.createGame(config)` → initial `GameState` |
| **Start** | Runtime | Transition to Playing; emit `GameStarted` |
| **Playing** | Players via Actions | Host pipeline; turns/phases owned by state + plugin |
| **Paused** | Host / system | Freeze acceptance of game Actions (or queue) |
| **Finished** | Plugin `checkVictory` | Terminal; no further game Actions |
| **Replay** | Local / spectator | Deterministic rebuild; UI scrub timeline |

### 4.2 Turn lifecycle (inside Playing)

Generic turn machinery (engine `turns`) coordinates:

```
TurnStarted → (optional reaction window) → Player Action(s) → TurnEnded → next
```

Plugin hooks: `onTurnStart` / `onTurnEnd` may return updated state or no-op.
Simultaneous / priority / interrupt modes are engine configurations, not
hardcoded game names.

### 4.3 Player lifecycle

```
Joined (lobby) → Seated → Active → (Disconnected → Reconnecting) → Left / Eliminated
```

Disconnection is a network concern; elimination is a plugin state concern.
Runtime exposes seat slots; plugin maps seats to roles/factions if needed.

---

## 5. Data flow

### 5.1 Happy path (host authority)

```
┌────────┐  Action   ┌────────┐  validate   ┌────────┐
│ Client │ ────────► │  Host  │ ──────────► │ Plugin │
└────────┘           │Runtime │             └───┬────┘
                     └────┬───┘                 │ apply
                          │                     ▼
                          │              new GameState
                          │                     │
                          │◄──── Events ────────┘
                          │
                          ├─► Replay log (seed + actions + events)
                          ├─► Sync (action ack / events / diff)
                          └─► Broadcast → Clients → UI / Audio
```

Rules:

1. Clients never mutate authoritative state.
2. Host runs `validateAction` then `applyAction` (pure wrt I/O).
3. Only Host’s accepted Actions advance the shared timeline.
4. UI renders from state projections + event stream.

### 5.2 Offline / hotseat

Same pipeline; “network” is an in-process loopback transport.
Multiple local seats submit Actions to the same Host Runtime.

### 5.3 Hidden information

Authoritative `GameState` may contain private fields.

- Host holds full state.
- Clients receive **filtered views** (`GameView`) + public Events.
- Replay tools may use full state locally when authorized (owner / debug).

Never rely on “security through obscurity” in the client for competitive integrity
when peers are untrusted; for casual browser-host play, document trust model:
**host is trusted**.

### 5.4 Persistence path

```
Runtime snapshot OR (seed + actions) → serialize → IndexedDB / file
load → deserialize / replay fold → restore phase
```

Prefer seed + actions for long-term fidelity; snapshots for fast resume.

---

## 6. Synchronization

### 6.1 What travels on the wire

| Payload | When |
|---|---|
| **Action** (+ host `seq`) | Every accepted (or rejected with reason) player intent |
| **Event** | After apply, for animation/UX; may be derived client-side in strict mode |
| **Diff** | Bandwidth optimization between snapshots |
| **Snapshot** | Join mid-game, reconnect, desync recovery |

Never sync “full state every frame.”

### 6.2 Ordering

- Host assigns monotonic `seq` to accepted Actions.
- Clients apply in `seq` order; buffer gaps; request snapshot on hole timeout.
- Rejected Actions return `{ seq?, error }` and do not advance state.

### 6.3 Delta vs snapshot

```
normal play:  Action stream (± Events)
catch-up:     Snapshot @ seq N + Actions N+1…
desync:       Client requests Snapshot; discard local speculative state
```

### 6.4 Host migration

1. Freeze Action acceptance.
2. Elect new host (pre-agreed policy).
3. New host takes last committed snapshot + log.
4. Peers reconnect; resume with snapshot + seq.

Migration must not re-roll RNG or re-apply Actions out of order.

### 6.5 Latency

- Optimistic local UI only for **non-authoritative** feedback (hover, drag ghost).
- Commit visuals on host ack / event.
- Timed turns: timeout fires as a Host-generated Action so it stays in the log.

---

## 7. Determinism & replay

### 7.1 Inputs that define a game

```
pluginId + pluginVersion + gameConfig + seed + Action[] (ordered)
```

Same inputs ⇒ same `GameState` sequence and Event log (modulo pure presentation Events).

### 7.2 RNG

```ts
// conceptual
const rng = createRng(seed);
// plugin/engine: rng.next(), rng.shuffle(array)
// forbidden: Math.random(), Date.now() in applyAction
```

Time-based effects must enter the system as Actions (e.g. `Timeout`) with host clock policy documented.

### 7.3 Replay reconstruction

```
state0 = plugin.createGame(config, seed)
for action in actions:
  assert plugin.validateAction(state, action)
  state = plugin.applyAction(state, action)
```

UI scrubbing seeks by rebuilding or by cached snapshots at keyframes.

---

## 8. Package layout (target)

```
packages/
  core/          # types, rng, schemas
  runtime/       # lifecycle + host loop
  network/       # transports
  sync/          # seq, diff, snapshot
  events/        # event log + bus
  state/         # optional shared state helpers
  replay/
  animation/
  audio/
  assets/
  plugins/       # plugin loader (not game rules)
  engine/        # board cards tiles dice resources turns actions
  ui/
  sdk/
plugins/         # texas-holdem, avalon, love-letter, …
themes/
examples/
docs/
```

Scaffold inside this monorepo as `bbge/` or top-level `packages/` without
touching Game Shelf `content/games/` unless integrating playable routes.

---

## 9. Trust & security notes

| Mode | Trust |
|---|---|
| Offline / hotseat | Single device trusted |
| Friend host (WebRTC) | Host trusted; clients trust host state |
| Competitive ranked (future) | Needs independent authority or TEE — out of v1 scope |

Plugin code should be treated as untrusted for marketplace scenarios (sandbox later).
v1: load first-party plugins only.

---

## 10. Related docs

- [vision.md](vision.md) — philosophy, subsystems catalog, long-term vision
- [plugin-api.md](plugin-api.md) — plugin developer handbook
- [SKILL.md](SKILL.md) — agent workflow & golden rules
