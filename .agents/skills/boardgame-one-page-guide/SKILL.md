---
name: boardgame-one-page-guide
description: Convert board-game rules into an accurate, mobile-readable one-page visual guide. Use for rule infographics, quick-reference long images, and fast teaching handouts; not for reproducing a full rulebook.
---

# Board-game one-page guide

Create one vertically oriented visual guide that lets a first-time player understand the game premise, the play loop, and what to do on their turn at a glance. The deliverable is a shareable image, not a condensed rulebook. Default to the detailed-guide depth: include all core procedures and their decisive restrictions, not merely a high-level overview; use a shorter overview only when the user explicitly asks for one.

## Generate the finished image in one pass

Use the built-in Imagegen tool once to produce the finished guide. Put the final visual language, layout, and exact display copy in that single prompt; do not generate a background or card framework for later compositing, and do not create an HTML, SVG, or other second-stage text overlay. Keep the displayed copy deliberately compact enough for reliable in-image rendering.

Ask for a vertically oriented infographic, uniform card-based hierarchy, and real, crisp Chinese typography. For a detailed guide, ask for a longer vertical canvas and include setup, every action's procedure and key limits, refresh/break sequence, progression, game end, scoring, and common pitfalls. Explicitly say that all supplied copy must be rendered verbatim, with no extra text, pseudo-text, logos, or watermark. Include a legibility review after generation; if a crucial label is unreadable or incorrect, report that limitation rather than silently substituting a layered render.

## Establish the ruleset first

- Identify the game name and exact edition, language, and included expansions. Never combine editions or expansions. If the input does not settle a material version difference, label the assumption or ask before finalizing.
- Treat user-supplied rules as the primary source. Check an official rules source only when an ambiguity, apparent contradiction, missing fact, or version concern materially affects play; preserve the cited ruleset rather than silently "correcting" it.
- Extract the player count, duration, premise, objective, win and end conditions, setup, turn/round structure, player actions, resources, scoring, interaction, tie-breaks, and common errors. Reorganize these by how players learn, not by rulebook chapter order.
- Do not change a rule merely to simplify layout. If a detail cannot fit, remove lower-priority material instead of weakening a key condition or exception.

## Select the information architecture

Build only the modules that clarify this game. Use this default order when applicable:

1. Official title, edition, player count, and duration.
2. Three to five core points: game type, primary loop, managed resources, interaction, and victory.
3. A prominent numbered round, turn, era, or day flow. Use arrows or a timeline; do not put procedural fine print here.
4. Objective and game-end summary: what players pursue, when the game ends, whether the current round finishes, final scoring, and tie-break.
5. Setup in four to eight essential steps.
6. Three to six phase cards. Each says when it occurs, what happens in order, decisive restrictions, and where play proceeds next.
7. A separate player-turn flow whenever a player has a repeatable turn procedure.
8. Five to nine high-frequency resources or terms, each with an icon, name, and one-line purpose. Add scoring or interaction/combat only when these are consequential.
9. Five to eight **易忽略规则**: frequent mistakes, timing restrictions, limits, hidden information, and special priority rules.
10. A two-to-four-line closing summary of the main loop.

For combat, auctions, area control, or other competitive resolution, show the actual comparison → ranking → reward → tie sequence. For scoring-heavy games, distinguish immediate from end-game points. State the real victory mode for co-op, elimination, race, and team games rather than forcing a points framing.

## Compress decisively

Keep, in order: player actions; the full play loop; victory/end conditions; principal resources and mechanisms; common mistakes; scoring detail; rare exceptions. Omit lore, exhaustive component inventories, edge-case examples, solo/AI modes, expansions, and designer notes unless requested.

Prefer short numbered instructions, condition branches, icons, and cards over prose. A card normally holds three to seven short lines; split or trim a card once it becomes difficult to scan on a phone. Use precise, professional headings—avoid labels such as “新人攻略” or “一看就会”.

## Design for genuine readability

- Default to a vertical long image near 2:3, 3:5, 4:7, or 9:16. Put title, core loop, and main flow high enough to remain legible in a chat thumbnail.
- Match the visual language to the game’s theme, while keeping information design in charge. Use a consistent icon family, card treatment, border weight, saturation, and shadows.
- Give every card one job. Create clear hierarchy for title, module title, subheading, body, and key numbers/keywords. Maintain strong text/background contrast and sufficient whitespace.
- Use Imagegen to render the finished image directly. Supply short, exact display copy and require crisp, high-contrast type; do not create a separate background or post-generation text layer.
- Do not use pseudo-text, tiny body copy, warped lettering, low-resolution exports, or decoration that competes with instructions.

## Final verification

Before delivering, inspect the rendered output at mobile scale and confirm:

- Title and edition are correct; no expansion or version rules have leaked in.
- The objective, turn/round order, actions, payment rules, scoring, end timing, and tie-break are accurate and unambiguous.
- Essential flow is visible without reading every card; every displayed rule is complete enough to follow.
- Copy is correct, high-contrast, and readable; no generated glyphs or clipping remain.
- The guide favors correctness, then legibility, then flow clarity, hierarchy, and visual polish—in that order.
