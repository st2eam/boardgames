---
name: rule-svg-diagrams
description: Add bilingual SVG diagrams to board game rules at key mechanics (turn flow, networks, resources, board transformations). Use when writing or expanding en/zh rules.md, illustrating a confusing rule, or adding public/images/rules SVGs.
---

# Rule SVG diagrams

请在关键的节点上尽量加入svg图片.

Players skim rules at the table. A 720-wide card-style SVG next to a hard mechanic beats another paragraph. Reference implementations: `brass-birmingham` (turn / network / resources) and `seti` (turn / scan / rotation).

## When to draw

Draw **2–4 diagrams** for any game whose turn, board, or resources are not obvious from a table. Prefer the moment a reader would otherwise re-read a paragraph.

| Draw | Skip |
|------|------|
| Turn / round sequence | Component lists, flavor |
| Spatial ideas (network ≠ path, adjacency, layers) | A markdown table that already lists the same facts |
| Resource / cost source priority | Setup checklists |
| Card / tile anatomy | One-line exceptions |
| Multi-step board change (rotate, era flip) | Art copies of the published board |

Same file may appear in **rules.md** (required) and the matching **flow.json** node (optional — DecisionTree uses `MarkdownRenderer`, so images work).

## Files and markdown

```
public/images/rules/{slug}/{name}.svg
```

Both locales use the **same path**. Alt text is the caption (`MarkdownRenderer` wraps `<img>` in a rounded card and uses `alt` as `<figcaption>`).

```markdown
![回合：两次行动、补手至 8、花钱放人物上](/images/rules/brass-birmingham/turn-flow.svg)
```

- Path starts with `/images/…`. **Never** write `/boardgames` — the renderer prefixes `basePath`.
- Place the image **immediately after** the heading or short intro for that mechanic, before the long procedure.
- Filename: kebab-case, English (`turn-flow.svg`, `network.svg`).

## Visual language

Match `src/app/globals.css` tokens. `viewBox="0 0 720 H"` with `H` around 240–300.

| Role | Color |
|------|--------|
| Background | `#FAFAF5` |
| Title / primary | `#5D4037` |
| Accent stroke / arrows | `#C4952A` |
| Secondary text | `#8D6E63` |
| Cards | `#fff`, `rx="12"` or `14`, stroke 1.5 |

- Title: Georgia, bilingual `English / 中文`.
- Body: `'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif` (SVGs are loaded as `<img>`, so Google Fonts on the page do **not** apply).
- EN on the first line of a box, ZH on the second in muted brown.
- No photos, no publisher art, no tiny 8px labels.

## Write UTF-8 via Python (required)

The editor **Write** tool corrupts CJK inside `.svg`. Always write with Python, then read the file back and confirm a known Chinese string is present.

```python
from pathlib import Path
path = Path("public/images/rules/{slug}/{name}.svg")
path.write_text(svg.strip() + "\n", encoding="utf-8")
assert "你的回合" in path.read_text(encoding="utf-8")  # use a string that is actually in the file
```

Skeleton:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 280" role="img">
  <rect width="720" height="280" fill="#FAFAF5"/>
  <text x="360" y="28" text-anchor="middle" font-family="Georgia, serif" font-size="16" fill="#5D4037" font-weight="700">Title / 标题</text>
  <!-- white rounded cards + bilingual labels -->
</svg>
```

## Do not

- Raster PNG/WebP for diagrams (SVG only).
- Inline SVG in markdown (use a file + `![]()`).
- One diagram per heading “for completeness”.
- Spoil hidden content (e.g. unused SETI species).
