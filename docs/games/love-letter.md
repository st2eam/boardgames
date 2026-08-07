# Love Letter — BBGE Play Design

Per-game design for the Browser Board Game Engine playable slice.  
Platform contracts: [`.cursor/skills/browser-board-game-engine/`](../../.cursor/skills/browser-board-game-engine/).  
Shelf architecture: [`docs/architecture.md`](../architecture.md).

| | |
|---|---|
| **Status** | Shipped on `main` — playable Host / hotseat / AI |
| **Convention** | Playable designs live at `docs/games/<slug>.md` |
| **Editions** | **`full`** (完整版 21 张) · **`premium`** (珍藏版经典 16 张，2–4 人) |
| **Play UI** | BGA-style DOM table (`LoveLetterTable` + `ui/bga/*`), not Pixi |
| **Card art** | `public/images/bbge/love-letter/*` (Full Game filenames; Premium maps via `role`) |

---

## 1. Goal

From The Game Shelf Love Letter **or** Premium rules page → **开始游戏**
(first action in `GameHeader`, with **edition picker**) → Host creates a room →
friends join via shareable link **or** hotseat / local AI → finish **one round**
and declare a winner (with 比点 standings).

---

## 2. Decisions

| Topic | Choice |
|-------|--------|
| Approach | **A** — Shelf shell + `bbge/*` + PeerJS signaling + WebRTC data channel |
| Plugin | Single `love-letter` plugin; `edition` in createGame config |
| Match length | **One round ends the match** (no favor-token multi-round for v1) |
| Multiplayer | Host + share-link join; also Host-only hotseat |
| AI | Host **`AiSeat`**: DeepSeek **`deepseek-v4-flash`** for Actions + optional **`speak`** |
| Table talk | Humans chat; AI may include `speak` in Action JSON — else event bubble fallback |
| Replay tools | **Out of scope** |
| UI entry | `play.json` + editions → `/[locale]/games/<slug>/play/?edition=` |
| Homepage | Cards with `hasPlay` show **即刻开玩** / Play Now |

---

## 3. Editions

| `edition` | Content slug(s) | Deck | Players | Notes |
|-----------|-----------------|------|---------|--------|
| `full` | `love-letter` (default) | 21 cards, Spy 0 … Princess 9 | 2–6 | Chancellor pending; spy favor at end; hand-tie → all win |
| `premium` | `love-letter-premium` (default) | Classic **16** cards, Guard 1 … Princess 8 | 2–4 | No Spy/Chancellor; hand-tie → **discard-sum** then all win |

**Out of this play slice:** Premium **5–8 / 32-card** expansion roles (Bishop, Assassin, etc.).

Effects use stable **`role`** on each card (`guard`, `king`, …) so Premium rank numbers do not break Full Game art / logic.

---

## 4. Scope

### 4.1 In (shipped)

- `play.json` with `editions[]` on both family slugs; **开始游戏** dropdown chooses version
- Plugin: deal / play / targets / guesses / eliminate / chancellor (full) / priest ack / single-round victory
- End UI: merged status + **比点** table; full play log + chat history (panel scroll only)
- Viewport-locked play page (no document scrollbar); lobby seats scroll inside panel
- Privacy: Host UI projects **local human** seats only
- Rematch: same seats + edition, new seed; clears chat
- AI: flash model, thinking disabled for Action JSON, optional `speak`, idle timeout ~90s

### 4.2 Out

- Replay tools, favor multi-round, Premium 32-card, second unrelated plugin, Pixi table

---

## 5. Architecture

```
GameHeader [开始游戏 ▾ editions]
  → /games/<slug>/play/?edition=full|premium
       PlayPageClient → PlayShell(edition)
         HostSession gameConfig: { edition }
         love-letter plugin createGame
```

| Boundary | Rule |
|----------|------|
| Shelf | `PlayStartButton` + `play.json.editions`; route passes `edition` |
| Runtime | `HostSession` merges `gameConfig` into `createGame` |
| Plugin | Pure rules; `state.edition`; roles on cards |
| AiSeat | Host only; prompt reads `view.edition` |

---

## 6. Content bind

`content/games/love-letter/play.json` and `love-letter-premium/play.json`:

```json
{
  "pluginId": "love-letter",
  "pluginVersion": "0.1.0",
  "defaultEdition": "full",
  "editions": [
    { "id": "full", "label": { "en": "…", "zh": "…" }, "default": true },
    { "id": "premium", "label": { "en": "…", "zh": "…" } }
  ]
}
```

---

## 7. Actions

| Action | When |
|--------|------|
| `playCard` | Normal turn — `cardId`, optional `targetId` / `guessRank` |
| `resolveChancellor` | Full edition only — pending chancellor |
| `acknowledgePriest` | Pending priest reveal |

---

## 8. Testing

```bash
npm run test:bbge
```

Includes determinism, priest reveal, privacy, **premium deck / player caps**, round-end standings.

---

## 9. Deferred

- Premium 32-card (5–8) roles and mid-round favor tokens
- Favor-token multi-round matches
- Replay / spectators / host migration
