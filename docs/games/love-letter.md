# Love Letter — BBGE Play Design (v1)

Per-game design for the Browser Board Game Engine playable slice.  
Platform contracts: [`.cursor/skills/browser-board-game-engine/`](../../.cursor/skills/browser-board-game-engine/).  
Shelf architecture: [`docs/architecture.md`](../architecture.md).

| | |
|---|---|
| **Status** | Shipped on `main` — playable Host / hotseat / AI |
| **Convention** | Playable designs live at `docs/games/<slug>.md` |
| **Rules** | Site **Full Game** (Princess = 9, 21 cards, Chancellor / Spy) |
| **Play UI** | BGA-style DOM table (`LoveLetterTable` + `ui/bga/*`), not Pixi |
| **Card art** | `public/images/bbge/love-letter/*` from `public/downloads/love-letter-cards.zip` |

---

## 1. Goal

From The Game Shelf Love Letter rules page → **开始游戏** (first action in
`GameHeader`) → Host creates a room → friends join via shareable link **or**
hotseat / local AI → finish **one round** and declare a winner.

---

## 2. Decisions

| Topic | Choice |
|-------|--------|
| Approach | **A** — Shelf shell + `bbge/*` + PeerJS signaling + WebRTC data channel |
| First plugin | `love-letter` |
| Match length | **One round ends the match** (no favor-token multi-round for v1) |
| Multiplayer | Host + share-link join; also Host-only hotseat |
| AI | Host **`AiSeat`**: prefer DeepSeek when API key present; local mock heuristic otherwise |
| Table talk | **LLM seats only** on successful LLM turns; mock stays silent |
| Replay tools | **Out of scope** |
| UI entry | `content/games/love-letter/play.json` → `hasPlay` → `/[locale]/games/love-letter/play/` |
| Homepage | Cards with `hasPlay` show **即刻开玩** / Play Now |

---

## 3. Scope

### 3.1 In (shipped)

- `play.json` + Play button **first** in `GameHeader` + homepage Play Now chip
- `bbge`: core, runtime, network (PeerJS), ai, ui (`PlayShell` / lobby)
- Plugin: Full Game deal / play / targets / guesses / eliminate / single-round victory
- Pending flows: **Chancellor** resolve; **Priest** peek confirm (`acknowledgePriest`)
- After each completed play, next seat **draws immediately** (UI always shows a full hand)
- Lobby: seats, invite link, add hotseat / AI, ready, start
- `projectView`: private hands; public discards; priest rank only for peeker
- Host UI only shows **local** human seats (never AI / remote hands); pass-and-play switches among local seats only
- Determinism + illegal-action + priest-reveal tests (`npm run test:bbge`)
- AI pacing (min think UI + gap between seats); LLM think budget ~90s
- Ephemeral local fallback on LLM timeout / illegal action — **does not** permanently replace LLM seat

### 3.2 Out

- Replay viewer / replay tooling UI
- Favor tokens / multi-round match
- Spectators, matchmaking, ranked, cloud save
- Host migration; rich disconnect recovery (v1: best-effort same-room rejoin)
- Second game plugin, marketplace, hot-load arbitrary plugins
- Pixi play table (legacy code may remain under `ui/pixi/*`; not the active path)

---

## 4. Architecture

```
Game Shelf                              bbge/
├─ GameHeader [开始游戏] …              ├─ core / runtime / sync
├─ /games/love-letter/play/  ─────────►├─ network (PeerJS + WebRTC)
│    PlayPageClient → PlayShell         ├─ ui (PlayShell, LobbyView)
│                                       ├─ ai (mock + DeepSeek seat via Shelf)
└─ content/.../play.json                └─ plugins/love-letter
     { "pluginId": "love-letter", … }        rules + LoveLetterTable (BGA UI)
```

| Boundary | Rule |
|----------|------|
| Shelf `play/page` | Mount shell; resolve `pluginId` from `play.json` |
| Runtime | Lifecycle, Host pipeline, seat scheduling |
| Plugin | Pure rules; no network / DeepSeek |
| Plugin UI | `plugins/love-letter/src/ui/*` — DOM table (BGA layout) |
| AiSeat | Host only; Shelf wires `createDeepSeekLoveLetterSeat` + `loadApiKey` |
| Network | Transports action / events / view / lobby / chat / aiPresence |

See: skill [architecture.md §9](../../.cursor/skills/browser-board-game-engine/architecture.md), [§11](../../.cursor/skills/browser-board-game-engine/architecture.md), [plugin-api.md §16](../../.cursor/skills/browser-board-game-engine/plugin-api.md).

---

## 5. Room & data flow

### 5.1 Lobby

1. Host opens `/play/` → room id + PeerJS host
2. Guest opens `?room=` → join + hello
3. Host may add hotseat humans / AI; start → `createGame` + seed → Playing

### 5.2 Playing

```
Guest / hotseat UI → Action → HostSession
  → prepareTurn → validate → apply → Events + views → tick UI
  → (pending chancellor / priestReveal may pause turn advance)

AI turn (Host):
  thinking on → LLM think (or mock) → Action
  → optional LLM speak → chat (mock never speaks)
```

### 5.3 Actions (plugin)

| Action | When |
|--------|------|
| `playCard` | Normal turn — `cardId`, optional `targetId` / `guessRank` |
| `resolveChancellor` | Pending chancellor — `keepCardId` + `bottomOrderIds` (length = remaining held) |
| `acknowledgePriest` | Pending priest reveal — peeker confirms before turn advances |

### 5.4 Failure modes

| Case | Behavior |
|------|----------|
| Illegal Action | Reject + error banner; state unchanged |
| LLM timeout / bad JSON | Log warn; **this turn** mock decision; LLM seat kept for next turn |
| No API key + AI seats | Allowed — mock AI plays (silent) |
| Host closes tab | Room ends (no migration) |

**Trust (v1):** Host trusted; private cards only in peeker / owner views.

---

## 6. UI (BGA-style)

### 6.1 Layout

| Region | Content |
|--------|---------|
| Top chrome | Title, deck count |
| Status bar | Whose turn / what to do next |
| Left | Player panels (discard fan, no scrollbar) |
| Center | Felt + hand dock + actions |
| Right | Recent game log + table talk (clipped recent lines, no scroll) |

Code: `bbge/plugins/love-letter/src/ui/LoveLetterTable.tsx` + `ui/bga/*`  
Lobby: `bbge/ui/src/LobbyView.tsx` (BGA-ish waiting room)

### 6.2 Interaction

1. Click hand card (悬停抬起 / 选中高亮)
2. If needed: click **player panel** to target (Prince may target self)
3. Guard: pick guess rank chips → **打出此牌**
4. Chancellor: pick center card → confirm keep
5. Priest: modal shows peeked card → **我看完了，确认** (turn does not advance until then)
6. **大图** on cards / discard strip / peek modal
7. Motion: draw fly-in; play fly-to-felt (human + AI land)

### 6.3 Content bind

```json
{
  "pluginId": "love-letter",
  "pluginVersion": "0.1.0"
}
```

Path: `content/games/love-letter/play.json`.

---

## 7. AiSeat

- Game-agnostic Host runner; plugins never call DeepSeek
- Shelf: `src/lib/bbge/DeepSeekLoveLetterSeat.ts` + chat `loadApiKey`
- Mock: `bbge/ai` heuristic — legal Actions only, **no speak**
- LLM think budget ~90s; speak only after a successful LLM turn
- Priest pending for AI: short “look” delay then `acknowledgePriest` (no LLM)

---

## 8. Testing

```bash
npm run test:bbge
```

Coverage includes determinism autopilot (chancellor + priest ack), illegal card, projectView privacy, priest reveal confirm, HostSession finish fixture.

---

## 9. Success criteria

- Host hotseat and/or AI can finish a single Full Game round
- Priest peek requires human confirm; discards visible per seat
- LLM seats can think without false permanent fallback to mock
- Play CTA first in header; homepage Play Now when `hasPlay`

---

## 10. Deferred (post-v1)

- Replay tools, spectators, host migration, robust reconnect
- Favor-token multi-round matches
- Public TURN / self-hosted signaling
- Second plugin; AI difficulty tiers
- Matchmaking / workshop

---

## 11. Implementation refs

- Plan (historical): [`docs/superpowers/plans/2026-08-07-bbge-love-letter-v1.md`](../superpowers/plans/2026-08-07-bbge-love-letter-v1.md)
- Skill: [BBGE SKILL.md](../../.cursor/skills/browser-board-game-engine/SKILL.md)
- Packages: `bbge/core`, `bbge/runtime`, `bbge/network`, `bbge/ai`, `bbge/ui`, `bbge/plugins/love-letter`
