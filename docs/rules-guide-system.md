# Unified rules guide

The canonical game page can be composed from `content/games/<slug>/guide.json`.
The guide is a presentation map only: all rule prose remains in the localized
`rules.md` files and is reused by export and chat.

## Rule section markers

Use the same stable identifier in both locales immediately before a heading:

```md
<!-- rule-section: setup-board -->
### Place the board

The concise rule summary stays here.

<!-- rule-details -->
Long explanations, examples, and exceptions go here.
```

The text before `rule-details` is always visible. The text after it is an
optional disclosure. Markers are removed from generated chat data and exports.

## Guide modules

`guide.json` has `version: 1` and an ordered `modules` array. Supported module
types are `facts`, `steps`, `phases`, `categories`, `ranking`, `decision`,
`reference`, `faq`, and `prose`. Collection modules use an optional
`introSectionId`, an `itemSectionIds` array, and an optional `defaultItemId`.
Decision modules use the existing `flow.json` graph and are reserved for true
branching choices such as blackjack strategy.

The build validator requires every parsed section to exist in both locales and
to be referenced exactly once. A game may use `guide.json`, `flow.json`, or
both. Fixed turn sequences belong in `guide.json`; `flow.json` is for branching
decision assistance.

## Interaction rules

- Facts and references are visible immediately.
- Steps and categories allow one expanded item at a time.
- Phases use a tablist/tabpanel on desktop and a horizontal stage rail on mobile.
- Rankings keep order and definitions visible and disclose tie-break details.
- Decision helpers provide options, back, and start-over without fake progress.
- Hashes target modules and items; changes use `history.replaceState`.
- Existing Game Shelf colors, type, borders, and shadows remain the visual system.
- Print and no-JavaScript output expose the complete rule text.
