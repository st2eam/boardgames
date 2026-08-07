# BBGE Love Letter v1 Implementation Plan

> **Historical plan.** Shipped on `main`. For current behavior (BGA DOM table,
> Full Game actions, AI pacing/fallback), use
> [`docs/games/love-letter.md`](../../games/love-letter.md) — do not treat
> unchecked boxes below as unfinished work.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Love Letter playable on The Game Shelf: Host + share-link WebRTC guests + Host DeepSeek AI seats, one round to victory, entry via first `GameHeader` button.

**Architecture:** `bbge/` packages hold pure core/runtime/engine/network/ai/ui; `plugins/love-letter` owns rules only; Shelf mounts `PlayShell` at `/games/love-letter/play/` gated by `play.json`. Host is authoritative; PeerJS (or equivalent) signals WebRTC data channels; `AiSeat` reuses `DeepSeekAdapter` + `loadApiKey` on Host only.

**Tech Stack:** TypeScript, React 19, Next.js 16 static export, Vitest, Zod, Immer, PeerJS, WebRTC data channels, existing DeepSeekAdapter / idb-keyval.

**Spec:** [`docs/games/love-letter.md`](../../games/love-letter.md)

## Global Constraints

- Engine never knows Love Letter rules; plugins never call network or DeepSeek.
- No `Math.random()` in apply/validate/createGame — seeded PRNG only.
- No replay viewer / replay tooling UI.
- Match ends after **one round** (no favor tokens).
- Play button is **first** in `GameHeader` when `hasPlay`.
- Static export: no API routes; signaling via PeerJS cloud (or documented equivalent).
- Commits: local git identity `st2eam` / `379403404@qq.com`; verify (`npm run build` or targeted vitest) then push per repo rules.
- UI: Shelf tokens (`primary` / `accent` / `surface`); companion UI skills for polish.

---

## File structure (target)

```
bbge/
  package.json                 # name @bbge/workspace helper scripts
  vitest.config.ts
  tsconfig.json
  core/
    src/types.ts               # Action, Event, PlayerId, envelopes
    src/rng.ts                 # mulberry32 / xorshift seeded RNG
    src/hash.ts                # stable JSON hash for tests
    src/index.ts
  engine/
    src/cards.ts               # deck helpers (shuffle via rng)
    src/turns.ts               # sequential active player helper
    src/index.ts
  runtime/
    src/host.ts                # HostSession: lobby + action pipeline
    src/phases.ts              # Create|Lobby|Playing|Finished
    src/index.ts
  network/
    src/peer-transport.ts      # PeerJS room host/join + DataConnection
    src/messages.ts            # zod wire schemas
    src/index.ts
  ai/
    src/ai-seat.ts             # AiSeat interface + DeepSeekLoveLetterSeat
    src/mock-seat.ts
    src/index.ts
  ui/
    src/PlayShell.tsx
    src/LobbyView.tsx
    src/TableChrome.tsx        # seats, chat log, thinking
    src/components/Card.tsx
    src/components/Hand.tsx
    src/components/PlayerSeat.tsx
    src/index.ts
  plugins/
    love-letter/
      src/plugin.ts
      src/state.ts
      src/actions.ts
      src/rules.ts
      src/projectView.ts
      src/cards.ts
      src/ui/LoveLetterTable.tsx
      src/ui/LobbyOptions.tsx
      src/index.ts
      tests/determinism.test.ts
      tests/validate.test.ts
      tests/projectView.test.ts

content/games/love-letter/play.json

src/types/game.ts              # hasPlay on GameSummary; PlayConfig type
src/lib/content/GameRepository.ts
src/lib/content/GameFactory.ts
src/components/game/GameHeader.tsx
src/app/[locale]/games/[slug]/page.tsx
src/app/[locale]/games/[slug]/play/page.tsx
src/components/game/play/PlayPageClient.tsx
messages/en.json
messages/zh.json
package.json                   # vitest, zod, immer, peerjs; scripts test:bbge
tsconfig.json                  # paths @bbge/*
```

---

### Task 1: Scaffold `bbge` + Vitest

**Files:**
- Create: `bbge/package.json`, `bbge/vitest.config.ts`, `bbge/tsconfig.json`, `bbge/core/src/index.ts` (placeholder export)
- Modify: `package.json` (root scripts + deps)
- Modify: `tsconfig.json` (paths)

**Interfaces:**
- Produces: `npm run test:bbge` runs Vitest against `bbge/**/*.test.ts`

- [ ] **Step 1: Add root deps and script**

In root `package.json` add:

```json
"scripts": {
  "test:bbge": "vitest run --config bbge/vitest.config.ts",
  "test:bbge:watch": "vitest --config bbge/vitest.config.ts"
}
```

Add devDependencies: `vitest`, `@vitest/coverage-v8` (optional skip coverage).  
Add dependencies: `zod`, `immer`, `peerjs`.

- [ ] **Step 2: Create `bbge/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["bbge/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@bbge/core": path.resolve(__dirname, "core/src"),
      "@bbge/engine": path.resolve(__dirname, "engine/src"),
      "@bbge/runtime": path.resolve(__dirname, "runtime/src"),
      "@bbge/network": path.resolve(__dirname, "network/src"),
      "@bbge/ai": path.resolve(__dirname, "ai/src"),
      "@bbge/love-letter": path.resolve(__dirname, "plugins/love-letter/src"),
    },
  },
});
```

- [ ] **Step 3: Create `bbge/tsconfig.json` + path aliases in root `tsconfig.json`**

```json
"paths": {
  "@/*": ["./src/*"],
  "@bbge/core": ["./bbge/core/src"],
  "@bbge/engine": ["./bbge/engine/src"],
  "@bbge/runtime": ["./bbge/runtime/src"],
  "@bbge/network": ["./bbge/network/src"],
  "@bbge/ai": ["./bbge/ai/src"],
  "@bbge/ui": ["./bbge/ui/src"],
  "@bbge/love-letter": ["./bbge/plugins/love-letter/src"]
}
```

- [ ] **Step 4: Smoke test**

Create `bbge/core/src/smoke.test.ts`:

```ts
import { describe, it, expect } from "vitest";
describe("bbge scaffold", () => {
  it("runs", () => expect(1 + 1).toBe(2));
});
```

Run: `npm run test:bbge`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json tsconfig.json bbge/
git commit -m "$(cat <<'EOF'
chore: scaffold bbge workspace with vitest

EOF
)"
```

---

### Task 2: Core RNG + Action/Event types

**Files:**
- Create: `bbge/core/src/rng.ts`, `bbge/core/src/types.ts`, `bbge/core/src/hash.ts`, `bbge/core/src/index.ts`
- Test: `bbge/core/src/rng.test.ts`

**Interfaces:**
- Produces:
  - `createRng(seed: string): Rng` with `next()`, `int(min,max)`, `shuffle<T>(xs)`, `pick<T>(xs)`
  - `type PlayerId = string`
  - `interface Action<T extends string = string, P = unknown> { type: T; playerId: PlayerId; payload: P; clientActionId?: string }`
  - `interface Event<T extends string = string, P = unknown> { type: T; payload: P; actionSeq?: number }`
  - `stableHash(value: unknown): string`

- [ ] **Step 1: Failing test for deterministic shuffle**

```ts
import { describe, it, expect } from "vitest";
import { createRng } from "./rng";

describe("createRng", () => {
  it("same seed same shuffle", () => {
    const a = createRng("seed-1").shuffle([1, 2, 3, 4, 5]);
    const b = createRng("seed-1").shuffle([1, 2, 3, 4, 5]);
    expect(a).toEqual(b);
  });
  it("different seeds diverge", () => {
    const a = createRng("a").shuffle([1, 2, 3, 4, 5]);
    const b = createRng("b").shuffle([1, 2, 3, 4, 5]);
    expect(a).not.toEqual(b);
  });
});
```

- [ ] **Step 2: Run — expect FAIL (module missing)**

Run: `npm run test:bbge -- bbge/core/src/rng.test.ts`  
Expected: FAIL cannot find module

- [ ] **Step 3: Implement `rng.ts` (mulberry32 from string seed)**

```ts
export interface Rng {
  next(): number;
  int(min: number, max: number): number;
  shuffle<T>(items: T[]): T[];
  pick<T>(items: T[]): T;
}

function hashSeed(seed: string): number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

export function createRng(seed: string): Rng {
  let a = hashSeed(seed) || 1;
  const next = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int(min, max) {
      return min + Math.floor(next() * (max - min + 1));
    },
    shuffle(items) {
      const arr = items.slice();
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    },
    pick(items) {
      return items[Math.floor(next() * items.length)]!;
    },
  };
}
```

Also add `types.ts` + `hash.ts` (JSON.stringify with sorted keys → simple djb2 hex) and export from `index.ts`.

- [ ] **Step 4: Run tests — PASS**

- [ ] **Step 5: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(bbge): add seeded RNG and core action/event types

EOF
)"
```

---

### Task 3: Love Letter pure plugin (rules + tests)

**Files:**
- Create: all under `bbge/plugins/love-letter/src/*` except UI
- Test: `bbge/plugins/love-letter/tests/*.test.ts`

**Interfaces:**
- Consumes: `createRng`, `Action`, `Event`, `Rng` from `@bbge/core`
- Produces: `loveLetterPlugin: GamePlugin<LoveLetterState, LoveLetterAction, LoveLetterConfig>`
  - `createGame(config, ctx) → state`
  - `validateAction` / `applyAction` → `{ state, events }`
  - `checkVictory` → `{ kind: "winner", winners: PlayerId[] } | null`
  - `projectView(state, viewerId)`
  - `serialize` / `deserialize`

**Card ranks (classic):** 1 Guard … 8 Princess. Standard deck counts. Burn cards by player count per official rules (encode explicitly in `createGame`).

**Actions:**

```ts
type LoveLetterAction =
  | { type: "playCard"; playerId: PlayerId; payload: {
      card: CardRank;
      targetId?: PlayerId;
      guessRank?: CardRank; // Guard
      priestReveal?: boolean; // no payload needed after apply events
    }}
  | { type: "resolvePending"; playerId: PlayerId; payload: Record<string, unknown> };
```

Prefer **one** `playCard` with full payload for v1; if Prince needs discard choice from hand after draw, use `pendingChoice` on state + `resolvePending`.

- [ ] **Step 1: Write determinism test (fail first)**

```ts
import { describe, it, expect } from "vitest";
import { createRng, stableHash } from "@bbge/core";
import { loveLetterPlugin } from "@bbge/love-letter";

const ctx = { rng: createRng("ll-fixed-1"), engine: {} as never };

describe("love-letter determinism", () => {
  it("same seed+actions → same hash", () => {
    let s = loveLetterPlugin.createGame(
      { playerIds: ["a", "b", "c"], playerNames: { a: "A", b: "B", c: "C" } },
      { ...ctx, rng: createRng("ll-fixed-1") },
    );
    // Script: play until finished using only legal scripted actions
    // (fill concrete actions after rules exist; keep list in test file)
    const actions = /* exported FIXTURE_ACTIONS from test fixture */ [];
    for (const action of actions) {
      expect(loveLetterPlugin.validateAction(s, action, ctx)).toBe(true);
      const r = loveLetterPlugin.applyAction(s, action, ctx);
      s = r.state;
    }
    const h1 = stableHash(s);
    // rebuild identically
    let s2 = loveLetterPlugin.createGame(
      { playerIds: ["a", "b", "c"], playerNames: { a: "A", b: "B", c: "C" } },
      { ...ctx, rng: createRng("ll-fixed-1") },
    );
    for (const action of actions) {
      s2 = loveLetterPlugin.applyAction(s2, action, ctx).state;
    }
    expect(stableHash(s2)).toBe(h1);
  });
});
```

Implement fixture by first running a **recorded** legal path in a temporary script, or hand-author a short 2–3 player path that reaches `checkVictory !== null`.

- [ ] **Step 2: Implement state + deck + createGame + apply for Guard/Priest/Baron/Handmaid/Prince/King/Countess/Princess**

Rules must match site content in `content/games/love-letter/zh/rules.md` / `en/rules.md` for the base game. Countess forced play when holding Prince/King. Princess discard = out. Handmaid protected. One round: last standing or deck empty → highest hand (ties: discard sum) per rules text.

- [ ] **Step 3: `projectView` test — other hands absent**

```ts
it("hides other hands", () => {
  const s = loveLetterPlugin.createGame(/*…*/, { rng: createRng("x"), engine: {} as never });
  const v = loveLetterPlugin.projectView!(s, "a") as { you: { hand: number[] }; others: { id: string; hand?: number[] }[] };
  expect(v.you.hand.length).toBeGreaterThan(0);
  for (const o of v.others) expect(o.hand).toBeUndefined();
});
```

- [ ] **Step 4: Illegal action test — play card not in hand → error object**

- [ ] **Step 5: Run `npm run test:bbge` — all love-letter tests PASS**

- [ ] **Step 6: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(bbge): implement Love Letter plugin with determinism tests

EOF
)"
```

---

### Task 4: Offline Host runtime pipeline

**Files:**
- Create: `bbge/runtime/src/phases.ts`, `host.ts`, `index.ts`
- Test: `bbge/runtime/src/host.test.ts`

**Interfaces:**
- Produces:

```ts
type SessionPhase = "lobby" | "playing" | "finished";

class HostSession {
  constructor(plugin: GamePlugin, opts: { seed: string; hostPlayerId: PlayerId });
  getPhase(): SessionPhase;
  getLobby(): LobbyState;
  addHumanSeat(id: PlayerId, name: string): void;
  addAiSeat(id: PlayerId, name: string): void;
  removeSeat(id: PlayerId): void;
  setReady(id: PlayerId, ready: boolean): void;
  start(): void; // → createGame when all non-empty seats ready; min 2 players
  submitAction(action: Action): { ok: true; events: Event[]; views: Map<PlayerId, unknown> } | { ok: false; error: string };
  getView(viewerId: PlayerId): unknown;
  getPublicChat(): AiChatMessage[]; // table chat buffer
  pushChat(msg: AiChatMessage): void;
}
```

- [ ] **Step 1: Test offline two humans scripted game finishes**

```ts
it("host pipeline finishes a fixture", () => {
  const host = new HostSession(loveLetterPlugin, { seed: "ll-fixed-1", hostPlayerId: "a" });
  host.addHumanSeat("a", "A");
  host.addHumanSeat("b", "B");
  host.setReady("a", true);
  host.setReady("b", true);
  host.start();
  expect(host.getPhase()).toBe("playing");
  for (const action of FIXTURE_ACTIONS) {
    const r = host.submitAction(action);
    expect(r.ok).toBe(true);
  }
  expect(host.getPhase()).toBe("finished");
});
```

- [ ] **Step 2: Implement `HostSession` — validate→apply→checkVictory→phase Finished; assign monotonic `actionSeq` on events**

- [ ] **Step 3: Block `start()` if AI seats present and `canStartAi` callback false** (wire real key check in Task 7; for now inject `canStartAi: () => true`)

- [ ] **Step 4: Tests PASS + commit**

```bash
git commit -m "$(cat <<'EOF'
feat(bbge): add HostSession lobby and action pipeline

EOF
)"
```

---

### Task 5: Shelf entry — `play.json`, `hasPlay`, Play button first

**Files:**
- Create: `content/games/love-letter/play.json`
- Create: `src/app/[locale]/games/[slug]/play/page.tsx`
- Create: `src/components/game/play/PlayPageClient.tsx` (temporary stub OK)
- Modify: `src/types/game.ts`, `GameRepository.ts`, `GameFactory.ts`, `GameHeader.tsx`, `games/[slug]/page.tsx`, `messages/en.json`, `messages/zh.json`

**Interfaces:**
- Produces: `GameRepository.hasPlayConfig(slug)`, `getPlayConfig(slug) → { pluginId, pluginVersion } | null`, `GameSummary.hasPlay`, header link first

- [ ] **Step 1: Add `play.json`**

```json
{
  "pluginId": "love-letter",
  "pluginVersion": "0.1.0"
}
```

- [ ] **Step 2: Mirror score helpers in `GameRepository`**

```ts
static hasPlayConfig(slug: string): boolean {
  return fileExists(slug, "play.json");
}
static async getPlayConfig(slug: string): Promise<PlayConfig | null> {
  if (!this.hasPlayConfig(slug)) return null;
  return loadJson<PlayConfig>(slug, "play.json");
}
```

Add `PlayConfig` + `hasPlay` on `GameSummary` in `src/types/game.ts`; set in `GameFactory.createGameSummary`.

- [ ] **Step 3: `GameHeader` — Play link **before** Flow**

```tsx
{hasPlay && (
  <Link
    href={`/${locale}/games/${meta.slug}/play/`}
    className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-accent/90 transition-all"
  >
    {t("startGame")}
  </Link>
)}
{hasFlow && ( /* existing — consider demoting Flow to bordered style if Play took solid accent */ )}
```

If Play uses solid accent, change Flow to bordered accent style (like Score) so Play remains the strongest CTA.

i18n: `"startGame": "开始游戏"` / `"Start Game"`.

- [ ] **Step 4: `play/page.tsx`**

```tsx
// generateStaticParams: slugs where hasPlayConfig
// load meta + playConfig; notFound if missing
// render <PlayPageClient slug pluginId locale gameName />
```

Stub client: heading + “BBGE PlayShell coming next”.

- [ ] **Step 5: `npm run build` — PASS; open Love Letter header shows 开始游戏 first**

- [ ] **Step 6: Commit + push**

```bash
git commit -m "$(cat <<'EOF'
feat: add Love Letter play entry in GameHeader

EOF
)"
```

---

### Task 6: Network transport (PeerJS + wire messages)

**Files:**
- Create: `bbge/network/src/messages.ts`, `peer-transport.ts`, `index.ts`
- Test: `bbge/network/src/messages.test.ts` (schema only; PeerJS manual)

**Interfaces:**
- Produces:

```ts
type WireMessage =
  | { type: "lobby"; payload: LobbyState }
  | { type: "action"; payload: Action }
  | { type: "actionReject"; payload: { clientActionId?: string; error: string } }
  | { type: "events"; payload: Event[] }
  | { type: "view"; payload: unknown }
  | { type: "aiPresence"; payload: AiPresenceEvent }
  | { type: "chat"; payload: AiChatMessage }
  | { type: "snapshot"; payload: { phase: string; stateSerialized: string; lobby: LobbyState; seq: number } }
  | { type: "hello"; payload: { playerId: PlayerId; name: string } };

class PeerRoomHost {
  constructor(roomId: string);
  onMessage(cb: (fromPeer: string, msg: WireMessage) => void): void;
  send(peerId: string, msg: WireMessage): void;
  broadcast(msg: WireMessage, except?: string): void;
  destroy(): void;
}
class PeerRoomGuest {
  constructor(roomId: string);
  onMessage(cb: (msg: WireMessage) => void): void;
  send(msg: WireMessage): void;
  destroy(): void;
}
```

Host peer id strategy: use `roomId` as Host PeerJS id (`new Peer(roomId)`); guests `new Peer()` then `connect(roomId)`. Document collision retry (append short suffix).

- [ ] **Step 1: Zod schemas + unit tests for parse failures**

- [ ] **Step 2: Implement PeerRoomHost/Guest wrapping `peerjs`**

- [ ] **Step 3: Integrate into `HostSession` facade `NetworkedHost` in `bbge/runtime/src/networked-host.ts`:**
  - guest hello → addHumanSeat
  - guest action → submitAction → send view+events to each peer
  - lobby broadcasts on change

- [ ] **Step 4: Manual check checklist in PR description:** two browsers, create/join via `?room=`

- [ ] **Step 5: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(bbge): add PeerJS room transport and wire messages

EOF
)"
```

---

### Task 7: AiSeat (DeepSeek on Host)

**Files:**
- Create: `bbge/ai/src/ai-seat.ts`, `mock-seat.ts`, `deepseek-seat.ts`, `index.ts`
- Test: `bbge/ai/src/mock-seat.test.ts`
- Modify: `HostSession` / `NetworkedHost` to call AiSeat on AI turns
- Reuse: `src/lib/ai/DeepSeekAdapter.ts`, `src/lib/chat/api-key-storage.ts`

**Interfaces:**
- Produces:

```ts
interface AiSeat {
  id: PlayerId;
  think(view: unknown): Promise<Action>;
  speak?(ctx: { view: unknown; lastEvents: Event[]; locale: string }): Promise<AiChatMessage | null>;
}
```

`DeepSeekLoveLetterSeat.think`: build system prompt with compact rules + JSON schema for Action; parse JSON; if `validateAction` fails, retry up to 2 times then surface error (no random illegal play).

Broadcast `aiPresence` thinking true/false around think; after apply, optional `speak`.

- [ ] **Step 1: Mock seat test — returns playCard in hand from view**

- [ ] **Step 2: Implement mock + DeepSeek seat (browser-only import of adapter)**

Note: Vitest node tests use mock only. DeepSeek seat lives in file imported from client PlayShell.

- [ ] **Step 3: `canStartAi`: `await loadApiKey()` non-null when any AI seat; else block Start with i18n error**

- [ ] **Step 4: On AI active turn, Host runs seat automatically**

- [ ] **Step 5: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(bbge): add Host AiSeat with DeepSeek and mock adapter

EOF
)"
```

---

### Task 8: PlayShell UI (Lobby + Table + chat/thinking)

**Files:**
- Create: `bbge/ui/src/*`, `bbge/plugins/love-letter/src/ui/*`
- Modify: `PlayPageClient.tsx` to mount `PlayShell`

**Interfaces:**
- `PlayShell` props: `{ pluginId: "love-letter"; locale; slug; roomIdFromUrl?: string }`
- Host path: no `room` → create room id (`ll-` + random from `crypto.getRandomValues` — **not** for game RNG) → `PeerRoomHost`
- Guest path: `room` query → `PeerRoomGuest`

- [ ] **Step 1: LobbyView** — seats, ready toggles, add/remove AI (host), copy link (`location.href`), Start

- [ ] **Step 2: LoveLetterTable** — hand buttons, target picker, discard pile, winner banner

- [ ] **Step 3: TableChrome** — AI thinking row (reuse visual language from chat activities), chat log + input

- [ ] **Step 4: Wire illegal reject → toast/banner

- [ ] **Step 5: `npm run build` PASS; manual two-browser + AI seat smoke

- [ ] **Step 6: Commit + push**

```bash
git commit -m "$(cat <<'EOF'
feat: mount Love Letter PlayShell with lobby and table UI

EOF
)"
```

---

### Task 9: Polish, docs pointer, final verification

**Files:**
- Modify: `docs/games/love-letter.md` (add “Implementation plan” link + status Implemented/In progress)
- Modify: `docs/games/README.md` if needed
- Modify: messages for all new strings
- Optional: homepage `GameCard` chip for play — **skip unless time** (spec says optional later)

- [ ] **Step 1: Run `npm run test:bbge` && `npm run lint` && `npm run build`**

Expected: all PASS

- [ ] **Step 2: Manual acceptance (spec §9)**

- [ ] two browsers, one AI seat, finish one round  
- [ ] AI thinking visible  
- [ ] AI table message appears  
- [ ] Play button first on Love Letter page  

- [ ] **Step 3: Update design status line in `docs/games/love-letter.md`**

- [ ] **Step 4: Final commit + push**

```bash
git commit -m "$(cat <<'EOF'
docs: mark Love Letter BBGE v1 play slice complete

EOF
)"
```

---

## Spec coverage checklist

| Spec item | Task |
|-----------|------|
| play.json + Play first in header | 5 |
| `/play/` shell | 5, 8 |
| bbge core RNG / actions | 2 |
| runtime lifecycle | 4 |
| love-letter rules one round | 3 |
| projectView + tests | 3 |
| WebRTC + share link | 6 |
| AiSeat DeepSeek think+speak | 7 |
| Lobby / table / chat UI | 8 |
| No replay tools | — never scheduled |
| Determinism tests | 3, 4 |
| Success criteria manual | 9 |

## Placeholder / consistency self-review

- Fixed: plan uses `HostSession` / `PeerRoomHost` / `AiSeat` names consistently.
- Fixed: game RNG vs room-id entropy separated (`crypto.getRandomValues` only for Peer id).
- No replay UI tasks included.
- PeerJS chosen as concrete signaling; if PeerJS cloud is unsuitable at implement time, swap adapter behind `PeerRoomHost` interface without changing wire message types.
