---
name: rule-svg-diagrams
description: Add situation-sketch SVG diagrams at key board-game mechanics so a glance shows how to play that step. Use when writing or expanding en/zh rules.md, illustrating a confusing rule, or adding public/images/rules SVGs.
---

# Rule SVG diagrams

请在关键的节点上尽量加入svg图片.

A diagram must be a **miniature of the table** — cards, tiles, dice, tokens, rows, cities — so someone who has not read the paragraph still sees the move. Do **not** draw a conventional flowchart (bilingual boxes + arrows that only repeat "Roll → Trade → Build").

**Canonical examples (copy this kind of thinking):**

- `brass-birmingham/network.svg` — cities and links; network ≠ connected is visible
- `seti/scan-computer.svg` — data slots and computer grid, not a process list
- `seti/rotation.svg` — concentric discs, not "step 1 / step 2" boxes

**Anti-pattern:** `flow_svg` rows of white cards labeled Match → Play → Draw.

## What to draw

Pick **2–4 key nodes** where a first-time player would freeze. Each image is **one worked example**.

| Good (situation) | Bad (flowchart) |
|------------------|-----------------|
| UNO: a red 7 on the discard, a blue 7 in hand glowing | "Match color → play 1 → else draw" |
| 6 nimmt: four numbered rows, a 6th card taking a row | "All play 1 → low to high → join rows" |
| Catan: a hex with 6, die showing 6, houses on vertices, resources flying in | "Roll → produce → trade → build" |
| Carcassonne: two tiles with matching city edges + a meeple | "Draw tile → place → meeple → score" |
| Texas hold'em: 2 hole cards + 3 community + empty turn/river | "Preflop → flop → turn → river" |
| Go: a small grid, liberties as empty dots, a captured stone | "Place → surround → remove" |

Labels only name **what is already in the picture** (this 7 matches that 7). One short bilingual caption under the scene is enough.

## Files and markdown

```
public/images/rules/{slug}/{name}.svg
```

Both locales use the **same path**. Alt text is the caption.

```markdown
![弃牌是红 7，手牌蓝 7 因数字相同可以出](/images/rules/uno/turn-flow.svg)
```

- Path starts with `/images/…`. **Never** write `/boardgames`.
- Place the image immediately after the heading (or one-line intro) of that mechanic.
- Filename: kebab-case, English.

## Visual language

`viewBox="0 0 720 H"` with `H` 240–320. Tokens from `src/app/globals.css`:

| Role | Color |
|------|--------|
| Background | `#FAFAF5` |
| Ink / primary | `#5D4037` |
| Accent / "this is the move" | `#C4952A` |
| Muted | `#8D6E63` |
| Paper | `#fff` |

- Draw the objects (rounded cards, cubes, meeples, hexes, dice pips). Highlight the legal move with gold stroke.
- Title optional; if present: `English / 中文` in Georgia.
- CJK font stack: `'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif` (SVG is an `<img>`, page fonts do not apply).
- No publisher art, no photos, no 8px text.

## Write UTF-8 via Python (required)

The editor Write tool corrupts CJK in `.svg`. Always:

```python
from pathlib import Path
path = Path("public/images/rules/{slug}/{name}.svg")
path.write_text(svg.strip() + "\n", encoding="utf-8")
assert "数字" in path.read_text(encoding="utf-8")  # a string actually in the file
```

## Do not

- Rows of process boxes connected by arrows as the whole diagram.
- One diagram per heading “for completeness”.
- Raster PNG/WebP; inline SVG in markdown.
- Spoil hidden content (unused SETI species, hidden generals).
