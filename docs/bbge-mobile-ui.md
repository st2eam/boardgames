# BBGE mobile table contract

All playable BBGE tables live inside a viewport-locked shell. A plugin must
therefore make every variable-size area explicitly reachable instead of relying
on document scroll.

## Layout rules

- Keep one scroll owner per region: player seats and hands scroll horizontally;
  boards and public zones scroll vertically when their content can grow.
- Do not put a variable number of cards, tiles, or seats inside a non-scrollable
  `overflow-hidden` container.
- Use `PlayHorizontalRail` for mobile seat/card rails, `PlayScrollableRegion`
  for board/public zones, and `PlayActionDock` for controls that must remain
  reachable at the bottom of the table.
- A plugin may wrap rails on desktop only. On screens below `lg`, use a single
  horizontal row and keep every item reachable by touch scrolling.
- Bottom controls need a minimum 44px hit target and safe-area padding.
- Modal content must be capped by `calc(100dvh - 2rem)` and scroll internally.
- Battle logs use `PlaySideSheet`; the sheet remains capped at 70dvh.

## Required verification

Check every playable plugin at 360x640, 390x844, and 844x390. Verify that the
current player controls remain reachable, public cards or tiles are either
visible or scrollable, and opening a lobby action, modal, or battle log does not
introduce document-level scrolling or conceal the next action.
