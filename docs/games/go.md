# Go (围棋) — BBGE Play Design

| | |
|---|---|
| **Status** | Shipped MVP on `main` — Host / AI / hotseat + in-table Go Teacher chat |
| **Plugin** | `bbge/plugins/go` (`pluginId: go`) |
| **Editions** | **`9x9`** (default) · **`13x13`** · **`19x19`** |
| **Players** | Exactly **2** |
| **Play UI** | Board-first (`GoTable` + fluid SVG `GoBoard`); thin toolbar |
| **Teacher** | Toggle drawer `GoTutorPanel` (collapsed by default); live `boardAscii` |

Platform: [`.cursor/skills/browser-board-game-engine/`](../../.cursor/skills/browser-board-game-engine/).

---

## Goal

Rules / trainer → **开始游戏** → lobby pick board size → human vs AI (or hotseat) → click intersections to play → ask **围棋老师** in the side panel while the game runs.

---

## Rules (teaching simplification)

- Alternating play; Black first; White receives **komi** (9×9 → 6.5, 13×13 / 19×19 → 7.5)
- Capture by liberties; **suicide illegal** unless the move captures
- **Simple ko** (no immediate recapture of a 1-stone ko)
- **Pass** / **Resign**; two consecutive passes → **Chinese-area–style** score (stones + exclusive empty) + komi
- Not a full tournament ruleset (no multi-stone superko, no dead-stone marking UI)

---

## Actions

| type | payload |
|------|---------|
| `play` | `{ row, col }` 0-based from top-left |
| `pass` | `{}` |
| `resign` | `{}` |

`projectView` exposes `legal[]`, `boardAscii`, `stones`, scores, etc. for AI + teacher.

---

## AI / chat

- Mock heuristic seat (no API key)
- Optional `DeepSeekGoSeat` (`deepseek-v4-flash`) for legal Actions + short `speak`
- **Go Teacher** lives in the play sidebar input (no floating chat button); tutoring persona with live board context (does not auto-pick moves unless asked)
