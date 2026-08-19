---
name: rule-svg-diagrams
description: Add SVG diagrams at key board-game mechanics — table-state sketches by default, plus a flowchart when the sequence itself is the hard part. Use when writing or expanding en/zh rules.md, illustrating a confusing rule, or adding public/images/rules SVGs.
---

# Rule SVG diagrams

请在关键的节点上尽量加入svg图片.

Default: a **miniature of the table** (cards, tiles, dice, tokens, rows, cities) so a glance shows the move. Flowcharts are **allowed when the sequence is the thing being taught** — phases, branches, timing — not as a substitute for every heading.

**Table-state examples:**

- `brass-birmingham/network.svg` — cities and links; network ≠ connected is visible
- `seti/scan-computer.svg` — data slots and computer grid
- `seti/rotation.svg` — concentric discs
- UNO matching: red 7 on discard, blue 7 in hand glowing

**Flowchart is worth it when** the order or branch would be missed in a snapshot, for example:

- Brass turn: two actions → draw to 8 → cash on the pawn → reorder → income
- SETI turn: one main action + free extras → milestones → maybe discover
- A round with simultaneous play then a strict resolution order

**Skip the flowchart when** it only restates the heading in boxes (`Roll → Trade → Build` next to a section already named Turn Structure). Prefer a worked example of that step instead.

Pick **2–4 key nodes** per game. Mix types: often one overview flowchart plus situation sketches for the confusing moves.

| Situation sketch | Flowchart (when needed) |
|------------------|-------------------------|
| UNO: red 7 discard, blue 7 glowing | Brass: 2 actions, money on pawn, then income |
| 6 nimmt: four rows, 6th card taking a row | SETI: main action → milestone → discover |
| Catan: hex 6 + die 6 + houses taking resources | A branching auction or character-call order |
| Go: liberties as empty dots | — |

Labels name **what is in the picture**. One short bilingual caption is enough.

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

- Situation sketches: draw the objects; gold stroke = the legal move.
- Flowcharts: same palette, short bilingual labels, only as many boxes as the reader must keep in order.
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

- A flowchart whose boxes only repeat the section title.
- One diagram per heading “for completeness”.
- Raster PNG/WebP; inline SVG in markdown.
- Spoil hidden content (unused SETI species, hidden generals).
