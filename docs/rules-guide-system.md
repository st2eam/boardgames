# Single-Markdown interactive rules protocol

Each game and locale has exactly one `rules.md`. It is the source of truth for
the complete rules and the interactive guide. The build parses Markdown with a
Markdown AST into a serializable `RuleDocument`; `guide.json` and `flow.json`
are not supported.

## Required structure

- Exactly one H1 per document.
- Rule headings are H2–H4, with no level jumps.
- Every H2–H4 has a globally unique, cross-locale ID immediately before it:

```md
<!-- rule-section: turn -->
## Turn
```

IDs use lowercase ASCII letters, numbers, and hyphens. H5/H6 are outside the
protocol and fail the build.

Unmarked headings and lists remain ordinary Markdown. Structural comments are
removed from generated exports, chat data, and full-rule rendering.

## Tabs

```md
<!-- rule-ui: tabs default=roll -->
<!-- rule-section: turn -->
## Turn

Shared introduction.

<!-- rule-section: roll -->
### Roll

<!-- rule-section: trade -->
### Trade
```

`tabs` applies to the following parent heading. Its direct child headings are
the tabs; there must be at least two. The parent’s text before the first child
is shared introduction. Tabs are horizontally scrollable on small screens.

## Sidebars

```md
<!-- rule-ui: sidebar default=setup-board -->
1. <!-- rule-item: setup-board -->
   **Place the board**

   Put the board and shared components on the table.
```

The directive converts only the immediately following list. Every item needs a
stable `rule-item` ID and its first bold phrase is the menu label. Ordered lists
show position and previous/next controls; unordered lists are freely selectable
categories. Item content may contain Markdown, images, tables, and nested lists.
Unmarked lists are never converted.

## Decisions

```md
<!-- rule-ui: decision start=hand-type -->
<!-- rule-section: strategy -->
## Strategy helper

<!-- rule-section: hand-type -->
### What hand do you have?

<!-- rule-choices -->
- [Hard](#hard-total)
- [Soft](#soft-total)

<!-- rule-section: hard-total -->
### Hard total
```

The decision parent’s direct child headings are nodes. `start` must name one of
them. A `rule-choices` block must be an unordered list of internal links; every
target must be a direct node, and every node must be reachable from `start`.
Cycles are allowed. The guide keeps back/restart history only for the current
page session. Full mode leaves the links as ordinary internal Markdown links.

## Details and rendering modes

`<!-- rule-details -->` splits always-visible summary from expandable detail.
One level of interaction nesting is allowed, such as a sidebar or decision
inside a tab. TAB-inside-TAB and decision-inside-decision are invalid.

The page opens in interactive guide mode and offers complete-rules mode. Print
output and no-JavaScript output always contain the complete Markdown body.
Interactive state is not persisted. Deep links use `#rule-<id>`; old
`#guide-module--item` links resolve by their final stable ID.

The validator scans all 148 localized documents, checks the bilingual heading
sequence and interaction graph, and rejects malformed directives during the
build.
