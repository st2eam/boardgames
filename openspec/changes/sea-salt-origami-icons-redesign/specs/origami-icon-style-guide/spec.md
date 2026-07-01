## ADDED Requirements

### Requirement: Origami art style

Each SVG icon SHALL depict a single folded-paper object in minimal origami illustration style. The icon MUST use flat vector graphics with clean geometric polygons representing paper facets. Sharp paper creases SHALL be visible as fold lines separating facets. The overall appearance MUST be friendly and cartoon-like.

#### Scenario: Visual inspection of any icon

- **WHEN** any icon is rendered at display size (32×32 viewBox or scaled)
- **THEN** it appears as a single folded-paper object with clearly identifiable geometric facets and fold lines, no realistic textures, no gradients, and no background

### Requirement: Color constraints

Each icon SHALL use a white or near-white paper base with subtle pastel color shadows on folded facets. Solid fills only — no gradients, no patterns, no realistic textures. Each icon SHALL have a thin dark outline (`#333` or similar) at a uniform stroke width.

#### Scenario: Color validation

- **WHEN** inspecting any icon's SVG source
- **THEN** all fill values are solid hex colors (no `url()` references, no `linearGradient`, no `radialGradient`), and at least one facet uses white or near-white (`#fff`, `#fafafa`, `#f5f5f5`, or similar)

#### Scenario: Outline consistency

- **WHEN** comparing outlines across all 19 icons
- **THEN** all use the same dark stroke color and stroke width for their outer contour

### Requirement: Composition and proportions

Each icon SHALL be centered in its viewBox. The subject SHALL occupy approximately 75% of the canvas area. All icons across the series MUST maintain consistent proportions — similar visual weight and sizing when displayed side by side.

#### Scenario: Side-by-side comparison

- **WHEN** all 19 icons are displayed in a grid at the same size
- **THEN** no icon appears significantly larger or smaller than others, and all subjects are visually centered

### Requirement: SVG technical constraints

Each icon MUST be pure vector SVG with editable paths. Path count per icon SHALL be between 20 and 60. All strokes SHALL use a uniform width within each icon. The SVG MUST NOT contain text elements, border rectangles, decorative elements outside the subject, or elements unsuitable for all ages.

#### Scenario: Path count validation

- **WHEN** counting all `<path>`, `<line>`, `<rect>`, `<circle>`, and `<polygon>` elements in any single icon
- **THEN** the total count is between 20 and 60

#### Scenario: No prohibited elements

- **WHEN** inspecting any icon's SVG source
- **THEN** there are no `<text>`, `<image>`, `<foreignObject>`, `<linearGradient>`, or `<radialGradient>` elements

### Requirement: Component interface preservation

Each icon component MUST maintain its existing export name and props interface (`{ className?: string }`). The viewBox MUST remain `"0 0 32 32"`. No new props or exports SHALL be added. No existing exports SHALL be removed or renamed.

#### Scenario: Drop-in replacement

- **WHEN** the redesigned `OrigamiIcons.tsx` replaces the existing file
- **THEN** all consumers (`SeaSaltCardReference.tsx`) compile and render without any code changes

### Requirement: Complete icon set

All 19 icons MUST be redesigned: CrabIcon, BoatIcon, FishIcon, SwimmerIcon, SharkIcon, ShellIcon, OctopusIcon, PenguinIcon, SailorIcon, LighthouseIcon, ShoalIcon, ColonyIcon, CaptainIcon, MermaidIcon, JellyfishIcon, LobsterIcon, StarfishIcon, SeahorseIcon, CrabArmyIcon.

#### Scenario: Full set verification

- **WHEN** `OrigamiIcons.tsx` is loaded
- **THEN** all 19 named exports exist and each renders a unique, identifiable origami-style SVG

### Requirement: Fold lines

Each icon MUST include visible fold/crease lines that divide the subject into geometric facets. Fold lines SHALL be rendered as low-opacity strokes (`opacity 0.2–0.4`) or as color boundaries between adjacent facets of different lightness.

#### Scenario: Fold line presence

- **WHEN** any icon is rendered
- **THEN** at least 2 distinct fold lines or facet boundaries are visible, creating a paper-fold appearance
