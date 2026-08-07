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

Scaffold engine packages under `bbge/` or top-level `packages/`. **Playable UI
entry is embedded in The Game Shelf** — see §9.

---

## 9. Game Shelf UI entry (normative)

BBGE does **not** ship a separate app shell homepage for v1. Players start a
match from the existing rules site game page, in the same interactive button
group as Flow / Score / Trainer / Calculator.

### 9.1 Surface: `GameHeader` action row

Implementation target today: `src/components/game/GameHeader.tsx`.

Button order in `GameHeader` (left → right). **Play is always first** among
feature actions when `hasPlay` is true:

| Order | Flag | Route | i18n (zh examples) |
|------:|------|-------|-------------------|
| 1 | **`hasPlay`** | **`/[locale]/games/[slug]/play/`** | **开始游戏 / Play** |
| 2 | `hasFlow` | `/[locale]/games/[slug]/flow/` | 交互式流程 |
| 3 | `hasScore` | `/[locale]/games/[slug]/score/` | 计分器 |
| 4 | `hasTrainer` | `/[locale]/games/[slug]/trainer/` | 训练器… |
| 5 | `hasCalculator` | `/[locale]/games/[slug]/calculator/` | 番符计算器 |
| last | — | — | Export (unchanged) |

```
Game page header actions:

[ 开始游戏 ] [ 交互式流程 ] [ 计分器 ] [ 训练器? ] [ 计算器? ] [ Export ]
    play ★        flow          score      trainer    calculator
```

- Only render the Play button when the game has a BBGE plugin binding (`hasPlay`).
- When implementing `GameHeader`, render the Play `Link` **before** Flow/Score/…
  — do not append it after Calculator.
- Style: primary/accent CTA for Play (strongest in the row); peers keep existing
  bordered styles. Apply UI companion skills when polishing.
- Optional later: homepage `GameCard` functional chip (same pattern as
  `viewFlow` / `scoreTracker`).

### 9.2 Content gate (same pattern as score / trainer)

Per-game opt-in under `content/games/<slug>/`:

```
content/games/<slug>/play.json   # presence ⇒ hasPlay (preferred name)
```

Minimal `play.json` shape (extensible):

```json
{
  "pluginId": "love-letter",
  "pluginVersion": "0.1.0"
}
```

Wiring (mirror existing features):

| Layer | Change |
|-------|--------|
| `GameRepository.hasPlayConfig(slug)` | `exists(play.json)` |
| `GameFactory` / `GameSummary` | `hasPlay: boolean` (+ optional `pluginId`) |
| `games/[slug]/page.tsx` | pass `hasPlay` into `GameHeader` |
| `games/[slug]/play/page.tsx` | Server page → client BBGE shell; `generateStaticParams` only for slugs with `play.json` |
| `messages/en.json` + `zh.json` | `game.play` / `game.startGame` labels |

Rules Markdown / `meta.json` stay the Game Shelf source of truth for content;
`play.json` only binds slug → BBGE plugin. Engine packages still hold runtime;
game rules stay in `plugins/<pluginId>/`.

### 9.3 Play page composition

```
/[locale]/games/[slug]/play/
  └── PlayShell (client)
        ├── session Create / Lobby (Runtime UI — seats, host/join, ready)
        ├── plugin.ui.LobbyOptions   (from play.json → pluginId)
        └── after Start → plugin.ui.Table + engine components
```

Lifecycle on this route = architecture §4 (`Create → Lobby → …`).  
v1 deep link: shareable room URL (signaling id) for WebRTC join — see §11.

### 9.4 Separation of concerns

| Concern | Location |
|---------|----------|
| Button visibility + static route | Game Shelf `src/` + `content/.../play.json` |
| Host loop, sync, RNG, replay | BBGE `packages/runtime` etc. |
| Rules / actions / victory | BBGE `plugins/<pluginId>` |
| Table / lobby options UI | Plugin `ui` module composing `packages/ui` |

Do not put Hold'em/Avalon rules into `GameHeader` or the play `page.tsx` —
only mount the shell and resolve `pluginId` from `play.json`.

---

## 10. Trust & security notes

| Mode | Trust |
|---|---|
| Offline / hotseat | Single device trusted |
| Friend host (WebRTC) | Host trusted; clients trust host state |
| Competitive ranked (future) | Needs independent authority or TEE — out of v1 scope |

Plugin code should be treated as untrusted for marketplace scenarios (sandbox later).
v1: load first-party plugins only.

---

## 11. V1 vertical slice (approved)

Decisions from product brainstorm (2026-08-07). Implementation must not expand
beyond this slice without a new approval.

### 11.1 Goal

From The Game Shelf **Love Letter** page → **开始游戏** (first in `GameHeader`)
→ Host creates a room → friends join via shareable link → optional **AI seats**
→ complete one full match.

Stack approach: **A** — Shelf shell + `bbge/*` packages + light signaling
(PeerJS cloud or equivalent) + Host-authoritative WebRTC data channel. No
first-party game server (static export constraint).

### 11.2 First game

| Item | Choice |
|------|--------|
| Plugin | `love-letter` |
| Content bind | `content/games/love-letter/play.json` |
| Route | `/[locale]/games/love-letter/play/` |
| Engine domains (min) | `cards` + `turns` |
| Match length | **One round ends the match** (no favor-token multi-round in v1) |
| Design doc | [`docs/games/love-letter.md`](../../../docs/games/love-letter.md) |

**Convention:** each playable game’s product/engine design lives at
`docs/games/<slug>.md` (not under `docs/superpowers/specs/`).

### 11.3 Multiplayer

- Host Browser authoritative; Actions over WebRTC data channel
- Room join via shareable link (signaling outsourced; e.g. PeerJS)
- v1 reconnect: best-effort rejoin same room; **no** host migration
- Trust model: host trusted (see §10)

### 11.4 AI seats (reusable)

- Pattern name: **`AiSeat`** — game-agnostic; plugins do not call DeepSeek
- Runs **only on Host**; DeepSeek **`deepseek-v4-flash`** when chat API key present, else mock
- Primary job: `Think(view) → { action, speak? }` (play cards + optional `发言`). Host falls back to event bubble text when speak omitted
- Thinking status broadcast; no auto table-talk from AI
- LLM **idle** timeout ~90s (resets while thinking/content streams); idle → ephemeral mock for **one turn** only
- No API key on guests required

Details: [plugin-api.md §16](plugin-api.md).

### 11.5 In scope (shipped)

- `play.json` + `hasPlay` + Play button first in `GameHeader` + homepage Play Now
- `bbge` core / runtime / network (PeerJS) / ui (`PlayShell`) / ai
- Love Letter plugin: Full Game deal/play/guess/eliminate/victory
- Pending: Chancellor resolve; Priest peek + `acknowledgePriest`
- Next seat draws immediately after a completed play
- **Play table:** BGA-style DOM (`LoveLetterTable` + `ui/bga/*`) — status bar,
  felt, hand dock, player panels with discard history, log, chat; Motion draw/play;
  card zoom lightbox
- Lobby: seats, join, hotseat / AI, ready, start
- `projectView` privacy; illegal Action UX; `npm run test:bbge`

### 11.6 Explicitly out of scope (v1)

- **Replay viewer / timeline SDK / replay tools** (deterministic action log may
  still exist internally for tests; no player-facing replay UI)
- Spectators, matchmaking, ranked, cloud save
- Host migration; rich disconnect recovery
- Second game plugin; marketplace; hot-load arbitrary plugins
- Pixi as the Love Letter play path (optional for future canvas-heavy games)

### 11.7 Success criteria

Host hotseat and/or AI can finish a Love Letter **Full Game single round**;
AI shows thinking; LLM may speak; priest peek requires confirm; discards visible.

---

## 12. Related docs

- Per-game design (Love Letter v1): [`docs/games/love-letter.md`](../../../docs/games/love-letter.md)
- Per-game designs (all): [`docs/games/`](../../../docs/games/)
- [vision.md](vision.md) — philosophy, subsystems catalog, long-term vision
- [plugin-api.md](plugin-api.md) — plugin developer handbook
- [SKILL.md](SKILL.md) — agent workflow & golden rules
