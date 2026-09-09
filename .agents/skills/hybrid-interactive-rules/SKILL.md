---
name: hybrid-interactive-rules
description: Design or refactor the canonical Game Shelf rule page so complete readable rules and fast in-play teaching coexist directly on that page. Use when merging rules.md with flow.json, embedding a turn walkthrough, or adding setup/reference disclosures. Never create a separate flow route or flow button. Do not use for BBGE play tables, score trackers, or trainers.
---

# Hybrid interactive rules

Build a single rule experience that works in two modes at once:

- **Learn the game:** a player can read the rules continuously in a sensible order.
- **Use at the table:** a player can jump to the current phase, open a setup detail, or compare a reference item without leaving the page.

Interaction is progressive enhancement for the rules, not a replacement for them.

## Read before changing code

1. Read [`docs/architecture.md`](../../../docs/architecture.md).
2. Read [`../page-development/SKILL.md`](../page-development/SKILL.md) and [`../component-development/SKILL.md`](../component-development/SKILL.md).
3. Read [`../testing/SKILL.md`](../testing/SKILL.md) before verification.
4. Because this repository uses a breaking Next.js version, read the relevant App Router and rendering guides under `node_modules/next/dist/docs/` before editing routes or component boundaries.
5. Inspect the target game's `rules.md`, `flow.json`, nearby game pages, `GameHeader`, `MarkdownRenderer`, `RulesToc`, and `DecisionTree` before designing the page.

## Product model

Treat `/{locale}/games/{slug}/` as the **only rule-teaching route**. A catalog card opens this page, and the interactive teaching is immediately visible as its primary content. The ideal page is not “a Markdown article followed by an unrelated widget”; its interactive sections appear where a player naturally needs them.

Never create `/{locale}/games/{slug}/flow/`, a flow-only page, an “Interactive Flow / 交互式流程” header button, or a catalog flow chip. `flow.json` is content for the canonical rule page, not a separately marketed feature.

A useful default order is:

1. `GameHeader` with title, metadata, actions, tags, and export.
2. A short objective and the decisive win / tie-break facts.
3. Setup as compact expandable steps when setup has meaningful detail.
4. The main turn or round loop as the strongest interactive section.
5. Rule references such as card types, action families, scoring tables, or ranked combinations.
6. Remaining complete rules, edge cases, variants, related games, and chat.

Adapt this order to the game. Do not manufacture sections merely to fill a template.

## Content ownership

- `content/games/{slug}/{locale}/rules.md` remains the complete human-readable rule source.
- Root `flow.json` remains the bilingual directed graph for sequential or branching guidance; it uses `startNode`, never `start`.
- Render content through `GameRepository` / `GameFactory`. Never hand-edit `public/data/` or add a parallel loader.
- Reuse `MarkdownRenderer` inside interactive panels so tables, emphasis, images, and Mahjong shortcodes behave consistently.
- Avoid copying the same rule fact into several React files. If an interaction needs structured data not represented by `rules.md` or `flow.json`, first decide whether it is a reusable content capability. Add a typed content shape and repository support only when the requirement is genuinely reusable; otherwise keep the rule readable in Markdown and use the lightest enhancement.
- Keep Chinese and English coverage equivalent. Labels, content, captions, accessible names, and empty/error states must follow `locale`, with the neighboring fallback convention.

## Choose interaction by rule shape

Use only the patterns that improve lookup speed:

| Rule shape | Preferred interaction |
|---|---|
| Ordered setup with detail | Numbered accordion; concise label visible when collapsed |
| Fixed turn / round phases | Desktop rail + active panel; compact horizontal or disclosure navigation on mobile |
| Real decision branches | Existing `DecisionTree` behavior with explicit next choices and history |
| Card, action, or component families | Grouped disclosure cards; key effect remains visible before expansion |
| Ranked hands or priority lists | Always-visible ordered rows grouped into tiers; expand one row for examples / tie-breaks |
| Dense numeric comparison | Semantic table with horizontal containment on narrow screens |
| Short fact or exception | Plain prose or callout; do not make every sentence clickable |

For a linear flow, provide direct stage selection, previous / next controls, current position, and a visible summary of every stage. For a branching flow, do not falsely present object-key order as mandatory chronology.

## Implementation boundaries

- Keep `src/app/[locale]/**/page.tsx` as a Server Component that loads data and composes the experience.
- Put stateful interaction under `src/features/rules/` or `src/features/flow/` with narrowly scoped `"use client"` boundaries.
- Mount the interactive teaching directly from `games/[slug]/page.tsx`. Do not add a flow route, flow CTA, flow badge, or flow-specific metadata page.
- Prefer a reusable composition component over slug checks in a shared renderer. A truly game-specific reference may live in a game-named feature subfolder and be registered explicitly.
- Preserve static export, `basePath: "/boardgames"`, locale routes, trailing slashes, metadata, JSON-LD, export, related games, and chat.
- Reuse existing components and types before creating new ones. Do not introduce a second state library, content loader, design system, or runtime service.
- Do not turn rule guidance into BBGE gameplay. No simulated hidden state, legal-action engine, multiplayer state, dice/card randomizer, or win-state enforcement belongs here.

## Site visual language

Translate references into The Game Shelf rather than copying their palette or typography.

- Use existing tokens: `primary`, `primary-dark`, `accent`, `accent-light`, `surface`, `border`, `success`, `font-heading`, `font-body`, `shadow-card`, and `shadow-card-hover`.
- The visual mood is warm tabletop paper, wood, and amber. Use white/surface cards, fine borders, restrained shadows, and amber emphasis.
- Typical chrome is `rounded-xl` or `rounded-2xl border border-border bg-white`; active states use subtle `bg-amber-50` / accent treatment.
- Preserve the existing page width and spacing rhythm. Let one primary flow module carry the page; keep supporting sections quieter.
- Do not import Google fonts, copy one-off hex colors from a reference, add dark mode, or introduce Ant Design, Less, shadcn/ui, axios, or Zustand.
- Motion should explain state changes: roughly 150–250 ms for panel/chevron/progress transitions. Respect `prefers-reduced-motion`; never hide rule content until JavaScript or an intersection observer runs.

## Interaction and accessibility

- Use native `button`, list, nav, heading, and table semantics.
- Disclosures expose `aria-expanded` and `aria-controls`; the current stage uses `aria-current="step"` where appropriate.
- Preserve a logical heading order and meaningful labels even when panels are collapsed.
- Keep touch targets about 44 px high and retain the global focus-visible treatment.
- Keyboard arrows may navigate a focused stage control, but do not attach page-wide arrow handlers that steal keys from scrolling, inputs, carousels, or assistive technology.
- Use `aria-live="polite"` only for the changing panel summary, not the entire rules page.
- When changing stages, keep focus predictable and bring the active item into view without unexpected page jumps.
- Automatic tours are optional, off by default, explicitly pausable, and stopped at the final stage. Do not add one unless it materially helps learning.
- On mobile, avoid a permanently narrow two-column layout. Collapse or horizontally scroll the stage rail, keep panels full width, contain wide tables, and prevent page-level horizontal overflow.

## Workflow

1. **Audit the content:** identify the objective, setup, core loop, branches, references, exceptions, and repeated facts. Note discrepancies between `rules.md` and `flow.json` before touching UI.
2. **Sketch the page hierarchy:** select the smallest set of interaction patterns from the table above. Identify what remains plain Markdown.
3. **Resolve the data path:** reuse the repository and existing bilingual data. Fix factual or coverage drift at the content source before rendering it.
4. **Compose the canonical page:** keep the server page thin; place client state in focused feature components and reuse the existing header/export/TOC/chat surfaces.
5. **Make it resilient:** confirm the important rule information is present in server-rendered markup, the first useful state is visible, and reduced motion does not remove content.
6. **Verify both use modes:** read from top to bottom, then simulate mid-game lookup with mouse, keyboard, and a phone-sized viewport.

## Completion checks

- [ ] The canonical game page contains both complete rules and embedded interaction.
- [ ] Entering from a catalog card immediately reveals the interactive teaching; no separate flow route, button, or chip exists.
- [ ] A player can understand the core turn without opening every disclosure.
- [ ] Setup, stage navigation, reference lookup, back/start-over behavior, and deep links work where applicable.
- [ ] No contradictory rule text was introduced between Markdown and structured content.
- [ ] Both locales render with equivalent coverage and no raw missing keys.
- [ ] Mobile layout, keyboard focus, screen-reader state, and reduced motion were checked.
- [ ] Existing export, TOC, metadata, JSON-LD, family links, and chat still work.
- [ ] `npm run lint` and `npm run build` pass; visually verify the affected routes after the build.

Do not claim the result is complete when it is merely a styled mockup. The page must be backed by the repository's real game content and remain valid under static export.
