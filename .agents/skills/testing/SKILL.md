---
name: testing
description: What to run before claiming a Game Shelf change is done. Use when finishing features, refactors, or BBGE work. lint + build always; test:bbge when play/engine changes.
---

# Testing / verify

This repo is a static export. There is no app-wide unit-test suite. Verification is **lint + production build**, plus BBGE tests when the engine changed.

## Always

```bash
npm run lint
npm run build
```

`build` runs `prebuild` (game data, covers) and `postbuild` (SW precache, sitemap).

## When play / `bbge/` / play plugins / `src/lib/bbge` change

```bash
npm run test:bbge
```

## Done means

- [ ] Lint clean
- [ ] Build succeeds
- [ ] New SSG routes appear in the build output if you added pages
- [ ] Commit + push per `.cursor/rules/verify-then-push.mdc` (local git identity `st2eam`)

Do not skip `build` after content or route changes. Do not add a token/axios test harness.
