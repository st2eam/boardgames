---
name: hybrid-interactive-rules
description: Design, author, or refactor the canonical Game Shelf rule page where one bilingual Markdown document powers complete reading and embedded interactive guidance. Use when adding rule-ui directives, changing RuleDocumentExperience, or auditing setup, tabs, sidebars, decisions, exports, and deep links. Do not use for BBGE play tables, score trackers, or trainers.
---

# Hybrid interactive rules

The canonical game page serves two jobs without maintaining two rule sources:

- **Learn the game:** read the rules in a sensible order, with the first useful
  conclusion visible and optional detail available on demand.
- **Use at the table:** jump to a topic, switch among phases or categories,
  follow a real decision branch, and share a stable deep link without leaving
  the game page.

Interaction is progressive enhancement. The complete Markdown remains the
source of truth and must remain readable in full mode, print output, and a
no-JavaScript fallback.

## Read before changing code

1. Read [`docs/architecture.md`](../../../docs/architecture.md),
   [`docs/rules-guide-system.md`](../../../docs/rules-guide-system.md), and
   [`docs/rule-writing-style.md`](../../../docs/rule-writing-style.md).
2. Read [`../page-development/SKILL.md`](../page-development/SKILL.md),
   [`../component-development/SKILL.md`](../component-development/SKILL.md),
   and [`../testing/SKILL.md`](../testing/SKILL.md) when code or UI changes are
   involved.
3. Because this repository uses a breaking Next.js version, read the relevant
   App Router and rendering guides under `node_modules/next/dist/docs/` before
   editing routes or component boundaries.
4. Inspect the target game's `en/rules.md` and `zh/rules.md`,
   `RuleDocumentExperience`, `MarkdownRenderer`, `RulesToc`, `GameHeader`, the
   game page, and the repository/parser before proposing a new interaction.
5. Never assume a legacy `flow.json`, `guide.json`, `/flow/` route, or
   `features/flow` component exists. They were removed by the Markdown AST
   migration.

## Product model

Treat `/{locale}/games/{slug}/` as the only rules and teaching route. A catalog
card opens this page, which contains the header, complete rules, embedded
interactions, export, related games, and chat. Never add:

- `/{locale}/games/{slug}/flow/` or another flow-only route;
- an “Interactive Flow” CTA, catalog chip, or separate metadata page;
- a second JSON rule source that duplicates Markdown prose.

The usual page order is:

1. `GameHeader` with title, metadata, actions, tags, and export;
2. the Markdown intro and objective/win facts;
3. setup as an ordered sidebar when setup has meaningful steps;
4. the main turn or round loop as tabs or an ordered sidebar;
5. component, action, scoring, ranking, and quick-reference topics;
6. exceptions, variants, related games, and chat.

Adapt the order to the game. Do not manufacture a module merely to fill a
template.

## Content ownership and data flow

Each locale has exactly one source file:

```text
content/games/<slug>/
├── meta.json
├── en/rules.md
└── zh/rules.md
```

`GameRepository` reads the file at build time. `GameFactory` parses it with
`parseRuleDocument()` into the serializable `RuleDocument` tree. The server page
passes `rulesMd` and `ruleDocument` to `RuleDocumentExperience`, a narrowly
scoped client component that owns only interaction state. `public/data/` is a
generated client-data plane and must never be edited by hand.

The rule prose, headings, tables, images, and interaction directives all live
in Markdown. React components render the reusable interaction primitives; do
not copy a rule fact into a slug-specific component. Add a new parser/type only
when the same rule shape is genuinely reusable.

## Markdown interaction protocol

Every H2–H4 heading has a stable ID immediately before it:

```md
<!-- rule-section: turn -->
## Turn
```

IDs use lowercase ASCII letters, numbers, and hyphens. English and Chinese use
the same IDs, heading levels, order, and interaction shape. Visible headings
may be translated. See `docs/rules-guide-system.md` for the full grammar.

Supported directives:

| Rule shape | Markdown directive | Rendered behavior |
|---|---|---|
| Parallel topics | `rule-ui: tabs default=<id>` before a parent heading | Accessible tabs for the parent’s direct child headings |
| Ordered setup or free categories | `rule-ui: sidebar default=<id>` before a list | Rail/sidebar; ordered lists add position and previous/next |
| Real state-based branch | `rule-ui: decision start=<id>` before a parent heading plus `rule-choices` | Choice buttons with back and restart history |
| Optional detail | `rule-details` inside a section body | Summary remains visible; detail opens on demand |

Only use a directive when it lowers lookup cost. A single item, a short
paragraph, an ordinary component list, or a simple FAQ should remain normal
Markdown. The parser rejects one-item tabs, invalid defaults, missing IDs,
unreachable decision nodes, unsupported nesting, and malformed sidebar items.

### Tabs

The parent heading’s direct children become tabs. Text before the first child is
shared introduction. There must be at least two children and no nested tabs.
Tab strips scroll inside their own container on narrow screens; the page must
not gain horizontal overflow. Arrow keys, Home, and End work when a tab has
focus, and the selected panel remains linked with `aria-selected` and
`aria-controls`.

### Sidebars

The directive converts only the immediately following list. Every item has an
immediate `rule-item` marker and begins with a bold short label:

```md
<!-- rule-ui: sidebar default=setup-board -->
1. <!-- rule-item: setup-board -->
   **Place the board**

   Put the board and shared components on the table.
```

Ordered lists mean a sequence and show position plus previous/next controls.
Unordered lists mean freely selectable topics and do not pretend to be a
chronological flow. A section may contain at most one sidebar.

### Decisions

Use a decision only when the player answers a current-state question and the
answer changes the next rule path:

```md
<!-- rule-ui: decision start=hand-type -->
<!-- rule-section: strategy -->
## Strategy helper

<!-- rule-section: hand-type -->
### What hand do you have?

<!-- rule-choices -->
- [Hard](#hard-total)
- [Soft](#soft-total)
```

Choices must be an unordered list of internal links to direct child nodes. All
nodes must be reachable from `start`; cycles are allowed. Do not turn a topic
index or FAQ into a decision tree.

### Details, images, and tables

`rule-details` splits a body into always-visible summary and expandable detail.
Never hide a condition required to complete the current action. Images must
explain an action, component, or state change and have accurate alt text.
Tables are for comparison, costs, values, and scoring; contain wide tables in
their own scroll region rather than allowing page-level overflow.

## Rendering and interaction contract

`RuleDocumentExperience` opens in guide mode and offers complete-rules mode.
The guide renders the AST; full mode renders the cleaned Markdown. Print and
no-JavaScript output expose the complete body. Interaction state is ephemeral
and is not written to local storage.

Deep links use `#rule-<stable-id>`. Legacy `#guide-module--item` hashes are
accepted by resolving their final stable ID. Hash changes use `replaceState` so
ordinary tab switching does not pollute browser history. Unknown rule hashes
show a recoverable alert with a return-to-guide action.

Accessibility and responsive requirements:

- use native headings, buttons, lists, navs, tables, and `details` semantics;
- keep touch targets around 44px and preserve visible focus rings;
- expose `aria-expanded`/`aria-controls` for disclosures and
  `aria-selected`/`aria-current` for the active tab or ordered step;
- bind arrow keys only to the focused tab or sidebar control, never to the page;
- announce only the changing panel summary politely, not the entire document;
- on mobile, use a horizontal rail or full-width panel, never a fixed narrow
  two-column layout;
- restrict motion to 150–250ms and respect `prefers-reduced-motion`;
- keep all important text in server-rendered or no-JS-readable Markdown.

Use the existing Game Shelf tokens (`primary`, `primary-dark`, `accent`,
`surface`, `border`, `font-heading`, `font-body`, `shadow-card`). Preserve the
warm paper/wood identity; do not introduce a new palette, dark mode, or UI
library.

## Workflow for an existing or new game

1. **Audit the rules:** identify overview/objective, setup, turn loop, real
   decisions, references, scoring, end conditions, and exceptions in both
   locales. Record repeated or contradictory facts before editing.
2. **Choose the smallest interaction set:** ordered setup → ordered sidebar;
   fixed phases → tabs or ordered sidebar; real branching → decision; lookup
   categories → unordered sidebar; short prose → plain Markdown.
3. **Author Markdown first:** add stable `rule-section` IDs, then directives
   only where justified. Keep the summary/action sentence visible and put
   examples or rare exceptions after `rule-details`.
4. **Synchronize locales:** keep IDs, heading levels, order, item counts,
   defaults, decision graph, facts, numbers, and image order equivalent.
5. **Reuse the shared renderer:** do not add slug checks or bespoke React for a
   pattern already supported by `RuleDocumentExperience`.
6. **Validate and inspect:** run `node scripts/validate-game-content.mjs`,
   inspect the canonical page in both locales, test default state, switching,
   deep links, keyboard, mobile rails, full mode, print, and no-JS fallback.
7. **Verify the project:** run `npm run lint` and `npm run build`; run
   `npm run test:bbge` only when the playable engine changed. Then follow the
   repository’s verify-then-push rule.

## Completion checklist

- [ ] One `rules.md` per locale is the only rule source; no `flow.json` or
      `guide.json` was added.
- [ ] Every H2–H4 has a valid, bilingual `rule-section` ID.
- [ ] Interaction directives are justified, valid, and not nested beyond the
      supported depth.
- [ ] Objective, setup, turn loop, references, scoring, end conditions, and
      exceptions are readable without opening every control.
- [ ] Default items, previous/next, keyboard focus, deep links, back/restart,
      unknown-hash recovery, and reduced motion work where applicable.
- [ ] Both locales have equivalent facts, images, structure, and coverage.
- [ ] Full rules, print, export, no-JS, TOC, metadata, family links, and chat
      remain intact.
- [ ] `node scripts/validate-game-content.mjs`, `npm run lint`, and
      `npm run build` pass.

Do not call a result complete when it is only a styled mockup. It must be
backed by the real bilingual Markdown, survive static export, and remain useful
when a player is checking one rule at the table.
