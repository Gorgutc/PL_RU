# Blueprint Design System

Blueprint is a React-based UI toolkit for the web, developed and open-sourced by **Palantir Technologies** under the Apache 2.0 license. This design system project distills Blueprint into a portable, agent-friendly form: foundation tokens, type, icons, and high-fidelity UI kits ready to be remixed into mockups, decks, and prototypes.

> "Blueprint is a React-based UI toolkit for the web. It is optimized for building complex, data-dense web interfaces for desktop applications which run in modern browsers. This is not a mobile-first UI toolkit." — `palantir/blueprint` README

## What it is for

Blueprint is the visual language behind the kind of tools Palantir builds: Foundry, Gotham, Apollo, AIP, Skywise. The system is **engineered for analyst workstations** — desktop-class apps showing tables of thousands of rows, geospatial maps, time-series, knowledge graphs, ontologies, pipelines. Density, keyboard ergonomics, and reading-at-speed beat decorative gloss.

That heritage shows up in every token. The grayscale is tuned for hours-long sessions in dark mode. The intent palette is colour-blind tested. Buttons are 30px tall, not 44px. The icon set is 500+ glyphs for things like *array-numeric*, *path-search*, *git-merge*, *aimpoints-target* — vocabulary you only need if your product talks about ontologies and chains-of-custody.

## Source materials

This design system was built from the following repository (a fork of the canonical Blueprint source on the `develop` branch):

- **GitHub:** https://github.com/Gorgutc/blueprint_PL (Blueprint fork, mirrors `palantir/blueprint`)
- **Canonical Blueprint:** https://github.com/palantir/blueprint
- **Docs site:** https://blueprintjs.com/docs
- **LLM-friendly index:** https://github.com/palantir/blueprint/blob/develop/llms.txt

Readers with access to either repo can explore deeper — every component referenced here has a corresponding folder under `packages/core/src/components/`, complete with SCSS, KSS docs, and TypeScript source. Anything below that feels under-specified can be cross-referenced against those folders.

## Index

```
README.md                  ← you are here
colors_and_type.css        ← all CSS custom properties (colors, type, spacing, elevation)
SKILL.md                   ← portable Agent Skill manifest

assets/
  palantir.svg             ← Palantir wordmark glyph (white-on-dark)
  favicon.png              ← Blueprint cube favicon
  blueprint-hero.png(@2x)  ← Blueprint isometric-cube hero image
  icons/16px/              ← 70 16px SVG icons (data, charts, geo, intents, chrome)
  icons/20px/              ← 14 20px SVG icons (navbar-scale set)

preview/                   ← Design-system-tab cards (700px wide specimens)

ui_kits/
  foundry-console/         ← Data-platform console UI kit (recreation)
    README.md
    index.html             ← Interactive click-through
    *.jsx                  ← Modular components (Navbar, Sidebar, DataTable, …)
```

---

## CONTENT FUNDAMENTALS

Blueprint's own copy and the surrounding Palantir surface conventions both lean **technical, precise, and quietly confident**. The docs read like a reference manual written by people who think a lot about correctness.

**Voice & tone**
- **Third person, declarative, present tense.** Component docs sound like specs: *"Card is a bounded container for content with optional elevation."* — not "Use the Card component to…"
- **No marketing fluff.** No exclamation points, no "Amazing!" or "Powerful!". When Blueprint does want to emphasise something it uses italics or a `<Callout intent="primary">`, not adjectives.
- **No emoji.** None in the codebase, none in the docs, none in component labels. The brand has zero relationship to emoji.
- **No second-person.** "The user" or implicit subject, not "you". Tooltips and helper text address the **action**, not the **person**: *"Required"*, *"Choose at least one option"*, *"Enter a value between 1 and 100"*.
- **Honest disabled & error states.** "This field is required" — not "Oops!". Blueprint's `Callout` intents (`primary`, `success`, `warning`, `danger`) carry the affect; copy stays factual.

**Casing**
- **Sentence case for everything.** Buttons say `Save changes`, not `Save Changes`. Dialog headers say `Confirm delete`, not `Confirm Delete`. Section titles, menu items, tab labels — all sentence case.
- **Title Case is reserved for proper nouns**: product names (Foundry, Apollo), people, organisations.
- **Code identifiers use camelCase or kebab-case** consistently — `intent="primary"`, `data-testid="user-menu"`. CSS classes are kebab-case under the `bp6-` namespace.

**Microcopy examples**

| Surface | Blueprint style | Avoid |
|---|---|---|
| Primary button | `Apply filters` | `Apply Filters →` |
| Empty state | `No results match your query.` | `Oops! Nothing here yet 😬` |
| Confirm dialog | `Delete pipeline?` / `Cancel` / `Delete` | `Are you absolutely sure?` |
| Toast | `Pipeline deployed.` | `Success! 🎉 Pipeline deployed!` |
| Tooltip | `Sort by ascending` | `Click to sort A→Z` |
| Helper text | `Maximum 280 characters.` | `Keep it short and sweet!` |
| Error | `Connection refused.` | `Uh-oh, something went wrong.` |

**Numbers, units, identifiers**
- Always show units: `30px`, `4 GB`, `12 rows`, `99.9%`. Never bare numbers in UI.
- Show identifiers as code: `pipeline_id = 0x9c2…` in `Code` tag style.
- Locale-aware formatting: `1,234,567` not `1234567`.

**Density signal**
- Prefer one-word labels: `Filter`, `Sort`, `Group`, `Export`. Multi-word labels stay short: `Add rule`, not `Add a new rule`.
- Sentences in body copy end with periods; UI labels generally do not.

---

## VISUAL FOUNDATIONS

### Colors
- **One grayscale**, very precisely tuned, on a perceptual lightness curve from `#111418` (`$black`) through five `$dark-gray*` steps, the `$gray*` mid-band, and five `$light-gray*` to `#ffffff`. This is the spine of every screen — most of the surface area of a Blueprint app is grayscale.
- **Four intents** (`primary` blue, `success` green, `warning` orange, `danger` red) each on a 5-step scale `*1` (darkest) → `*5` (lightest). Light theme uses `*3`; dark theme uses `*4` or `*5` for filled UI.
- **Extended palette** of 10 additional hues (`vermilion`, `rose`, `violet`, `indigo`, `cerulean`, `turquoise`, `forest`, `lime`, `gold`, `sepia`) on the same 5-step ramp — explicitly intended for **data viz**, not UI chrome.
- **Color vibe is cool, slightly desaturated, slate-leaning.** The grays carry a very subtle blue tint. The blues are saturated but not pure — `$blue3 = #2d72d2`. Nothing neon, nothing pastel.

### Typography
- **No webfont.** Blueprint uses the OS system stack — `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue"`. The aesthetic is "native everywhere" — a Blueprint app on macOS reads in San Francisco, on Windows in Segoe UI, on Linux in Cantarell. Honour this. **Never substitute a Google font** for body text.
- **Body 14px / line-height 1.286** — tight, dense, designed for scanning rows.
- **Heading scale:** h1 36/40, h2 28/32, h3 22/25, h4 18/21, h5 16/19, h6 14/16. All `font-weight: 600`. There is no display weight.
- **Monospace** (`ui-monospace`, then `SF Mono`, `Menlo`, `Consolas`) is used widely for identifiers, paths, code, hex colours, query expressions.

### Spacing
- **4px grid.** Every margin, padding, and dimension is a multiple of `$pt-spacing = 4px`. Buttons are 30px (4 × 7.5), inputs 30px, navbar 50px, large button 40px (4 × 10).
- A legacy 10px grid (`$pt-grid-size`) still exists in the codebase but is being phased out.

### Radii & borders
- **4px corner radius everywhere** (`$pt-border-radius: 4px`). Cards, buttons, inputs, popovers, dialogs all share this single value. There is no "pill" or "rounded-2xl" trend; corners are crisp and small.
- **Borders use shadows, not `border:`.** The signature look is `box-shadow: 0 0 0 1px rgba(17,20,24,.15)` for a 1px hairline that cooperates with elevation shadows.

### Elevation system (5 levels)
- **Light theme** shadows are layered: a 1px hairline ring + a soft drop shadow. Level 0 is the flattest (used for inputs and resting controls); level 4 is reserved for full-screen modals.
- **Dark theme** shadows are inverted — an *inset* highlight (`inset 0 0 0 1px rgba(255,255,255,.2)`) for the rim light, plus a darker drop shadow. This gives dark UI a tactile, embossed quality you don't see in flatter design systems.
- Inputs use `inset 0 0 0 1px` + `inset 0 1px 1px` to feel pressed-into the surface.

### Backgrounds
- **Solid surfaces only.** No gradients on UI chrome. The `landing-app` hero uses an animated canvas (the famous spinning cube logo) over solid `$black`, but inside the product surfaces are always flat fills.
- **Light theme app bg** is `$light-gray5 #f6f7f9` — never pure white. Cards on top are `$white`.
- **Dark theme app bg** is `$dark-gray1 #1c2127`. Cards step *up* to `$dark-gray3`.
- **No textures, no patterns, no hand-drawn anything.** The brand is engineering-flavoured.
- The Palantir landing pages do use one signature visual: a **WebGL/Canvas isometric cube** (see `assets/blueprint-hero.png`). It is decorative, not a system-wide motif.

### Animation
- One canonical easing: **`cubic-bezier(0.4, 1, 0.75, 0.9)`** — a quick start, smooth landing curve. A second `cubic-bezier(0.54, 1.12, 0.38, 1.11)` adds a tiny overshoot for bouncy entrances.
- One canonical duration: **100ms**. Blueprint is fast. There are no 400ms eases.
- Fades and short slides; no parallax, no scroll-jacking, no scale-on-hover above 1.02.

### Hover & press states
- **Hover (default button):** background steps one shade darker (e.g. `$light-gray4` → `$light-gray2`); no shadow change.
- **Hover (intent button):** background shifts from `*3` toward `*2`, foreground stays white.
- **Press:** background steps one further (often `*1`), and the shadow flattens — the button looks pushed-in. No transform/scale.
- **Minimal button hover:** background fades in at ~10% opacity of the intent color. No border appears.
- **Focus** is shown only on keyboard navigation via `FocusStyleManager.onlyShowFocusOnTabs()` — a 2px blue ring (`$pt-focus-indicator-color = rgba(blue2, 0.752)`).

### Transparency & blur
- Used sparingly. **Code backgrounds** are `rgba(white, 0.7)` over the card surface — a frosted look that lets the page tint show through.
- **Disabled** uses opacity (`rgba(gray1, 0.6)` for text); structural opacity (a whole panel at 50%) is avoided.
- No `backdrop-filter: blur()` in core — Blueprint's overlays use a solid scrim, `rgba($black, 0.5)`.

### Cards
- **Light:** `background: $white`, `box-shadow: elevation-1` (1px ring + soft drop). `padding: 20px`. `border-radius: 4px`.
- **Dark:** `background: $dark-gray3`, the inverted dark-elevation shadow with the inset highlight.
- An *interactive* card on hover gets `elevation-3` and `cursor: pointer`. Press drops back to `elevation-1`.

### Layout rules
- **Navbar fixed at top**, height 50px, full width, `box-shadow: elevation-0` (1px hairline). Always shows app/product name on the left, primary nav in the middle, user/utility on the right.
- **Sidebar** when present is 240–280px wide, lives on the left, scrolls independently of the main canvas.
- **Content max-width** for docs/marketing is ~760px. Product surfaces are full-bleed.
- **Tables** are dense by default (row height 30px, matching button height).

---

## ICONOGRAPHY

Blueprint ships **its own icon set of 500+ glyphs** — one of the most extensive in any open-source design system. They live in `@blueprintjs/icons` and are available at two sizes (**16×16 and 20×20**), with each size hand-drawn separately rather than scaled.

**Style:**
- Solid, filled shapes — not outline icons. No stroke variations.
- Currentcolor-driven: every SVG omits a `fill` attribute, so it inherits `color` from the surrounding text. Tinting an icon means setting `color:` on its parent.
- Pixel-snapped at the target size — 16px icons have rounded crisp shapes (no half-pixels at 1× display). The 20px variants have slightly different proportions, not just a scale-up.
- Vocabulary skews **data, geospatial, charts, security, pipelines, ontologies** — the things Palantir products talk about. There's also a full set of standard UI chrome icons (chevrons, cross, tick, search, cog, user).

**How they are used in product:**
- Inline in buttons, menu items, tabs, callouts, tags — typically 16px in light surfaces, 20px in navbars.
- Coloured by intent: an icon inside `<Callout intent="danger">` automatically inherits the danger foreground color.
- Two delivery paths in the source library: SVG components (preferred, tree-shakeable) and a legacy icon font. We use SVGs here.

**What's in this design system:**
- `assets/icons/16px/` — 70 SVGs covering: intents (`info-sign`, `warning-sign`, `error`, `tick-circle`), chrome (`chevron-*`, `cross`, `tick`, `more`), domain (`database`, `dashboard`, `graph`, `map`, `satellite`, `globe-network`, `git-branch`, `git-merge`, `git-commit`, `path`, `layers`, `timeline-events`, `timeline-line-chart`, `horizontal-bar-chart`, `heat-grid`, `scatter-plot`, `heatmap`, `data-lineage`, `properties`), entities (`user`, `people`, `cloud`, `lock`, `key`, `inbox`, `notifications`, `flag`, `bookmark`, `pin`).
- `assets/icons/20px/` — 14 SVGs for navbar-scale chrome.
- Use them by `<img src="assets/icons/16px/database.svg" />` *or* inline the SVG and set `color:` on a parent for tinting.

**Emoji & unicode glyphs:** never used in Blueprint product UI. The arrow glyph `▸` does appear once in the canonical README ("Read the introductory blog post ▸") but that is a marketing surface, not product chrome. Don't introduce emoji.

**Logos:**
- `assets/palantir.svg` — the Palantir wordmark glyph (the small "eye" sigil), designed to sit white on black.
- `assets/blueprint-hero.png` and `@2x` — the isometric Blueprint cube hero, the recognisable mark for the toolkit itself. Use it once per surface; it is not a repeating motif.

---

(See `SKILL.md` for an agent-facing summary, and `ui_kits/` for component-level recreations.)
