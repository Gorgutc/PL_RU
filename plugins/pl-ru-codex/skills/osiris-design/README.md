# OSIRIS Design System

> **OSIRIS** — Open Source Intelligence &amp; Reconnaissance Integrated System.
> A real-time, Palantir-class global-intelligence command surface that aggregates
> live flight tracking, CCTV networks, earthquake monitoring, conflict-zone mapping,
> satellite tracking, and 24/7 SIGINT feeds into a single GPU-accelerated
> dashboard.

This is the **design system** for OSIRIS: tokens, type, components, and a
ui-kit you can use to mock new features, build slides, or extend the live
product without re-inventing the visual language.

```
            ⬡  OSIRIS · Global Intelligence Platform
            ────────────────────────────────────────
            Egyptian Mythology  ×  Dark Ops  ×  Glassmorphism
```

The product is a Next.js app whose entire visual identity sits in
`globals.css` — a 2,200-line "Gotham Command System" that this folder
distills into reusable tokens and components.

---

## Sources

The system was reverse-engineered from two GitHub repositories provided by
the user:

| Repo                                                                                                          | Role                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| [**Gorgutc/osiris_PL**](https://github.com/Gorgutc/osiris_PL)         (`master`) | The product itself — Next.js 16 + MapLibre GL OSINT dashboard. Source of all tokens, components, and the dashboard UI kit.          |
| [**Gorgutc/blueprint_PL**](https://github.com/Gorgutc/blueprint_PL) (`develop`)  | Palantir's open-source **Blueprint** React toolkit, referenced as a kinship spec — OSIRIS shares Blueprint's data-dense aesthetic. |

Imported source files from `osiris_PL` (kept for reference) live in
[`_source/`](./_source/). Brand imagery lives in [`assets/`](./assets/).

If you have repo access, exploring `_source/globals.css` will tell you a
great deal — almost every visual rule below ships from there verbatim.

---

## What's in this folder

| File                                              | What it is                                                                  |
| ------------------------------------------------- | --------------------------------------------------------------------------- |
| [`README.md`](./README.md)                        | This document.                                                              |
| [`SKILL.md`](./SKILL.md)                          | Cross-compatible Agent Skill front-matter; how an agent should use this DS. |
| [`colors_and_type.css`](./colors_and_type.css)    | All CSS variables — palette, type scale, spacing, radii, shadows, motion.   |
| [`components.css`](./components.css)              | Component styles: `.glass-panel`, `.gotham-card`, `.gotham-tag`, etc.       |
| [`assets/`](./assets/)                            | Brand images (Eye-of-Horus icon, OG image, app icon).                       |
| [`preview/`](./preview/)                          | Standalone HTML cards that populate the Design System review tab.           |
| [`ui_kits/osiris/`](./ui_kits/osiris/)            | Interactive recreation of the OSIRIS dashboard.                             |
| [`_source/`](./_source/)                          | Imported reference files from `osiris_PL` (read-only).                      |

---

## Content fundamentals

OSIRIS copy is **operations briefing voice** — terse, callsign-style,
machine-formal. It reads like a console log from a tactical operations
center, not a marketing site.

### Tone

- **Sovereign-grade, calm, terse.** Never breathless.
- **Machine-formal, not friendly.** Avoids contractions, exclamation
  points, second person. Doesn't say *"you"*; doesn't say *"we"*.
- **Loves classifiers and codes.** `ZULU`, `MKT`, `CVE`, `SIGINT`,
  `GEOINT`, `OSINT`, `RECON`, `SWEEP`, `CLASSIFIED`.
- **Numbers are facts.** When count exists it is shown. `8,247 ENT`,
  `99.97% UPTIME`, `3.4 MB/s`, `2/24 EXCHANGES OPEN`.

### Casing

- **HUD micro-copy is `UPPERCASE` with `0.15–0.22em` letter-spacing.**
  Labels, badges, tags, button text, ticker entries, status read-outs,
  navigation items.
- **Body / prose is Sentence case.** Reserved for IntelFeed item titles,
  README-style descriptive text, and tooltip explanatory copy.
- **Section headings inside panels are `UPPERCASE`** (`DATA LAYERS`,
  `SIGINT FEED`, `MARKETS`, `RECON TOOLKIT`).

### Voice samples

| Where           | Pattern                                                                                       |
| --------------- | --------------------------------------------------------------------------------------------- |
| Button          | `RUN SCAN` · `LOCATE` · `OVERRIDE` · `LIVE FEED` · `CMD: LOCATE`                              |
| Tooltip         | `Active conflict, sanctions, or major instability detected`                                   |
| Status line     | `AWAITING INTELLIGENCE…` · `SYSTEM ONLINE` · `BACKEND CONNECTED` · `ZULU 18:32:07Z`           |
| Panel header    | `DATA LAYERS` · `SIGINT FEED` · `THREATS & INFRA` · `MARITIME & SPACE`                        |
| Tag             | `CRITICAL` · `HIGH` · `ELEVATED` · `NOMINAL` · `CLASSIFIED` · `OSINT`                         |
| Marketing lead  | "A real-time global intelligence dashboard that aggregates live flight tracking, CCTV…"       |
| Feature row     | "Track 10,000+ aircraft, 2,000 satellites and worldwide CCTV cameras in real-time on a 3D globe." |

### Punctuation & symbols

- Hex glyph **⬡** prefixes the brand (`⬡ OSIRIS`). Treat as logotype-adjacent.
- Bullets: `·` (middle dot) for inline, `▶ ▲ ◆ ●` for status indicators.
- Range punctuation: `8,247 / 12,500` (slash, no spaces) for ratios.
- Always pad SI units with a space: `3.4 MB/s`, `47 ENT`, `87/100`.
- Avoid emoji **except** for country flag glyphs in the status ticker (regional
  indicator pairs computed from ISO codes).

---

## Visual foundations

The aesthetic is **"Egyptian Mythology × Dark Ops × Glassmorphism"** — gold
sigils set against pitch-black void, with translucent map-overlay panels and
a thin film of CRT atmosphere.

### Color

- **Background is *void* black** (`#04040A` / `#06060C`) — never pure
  `#000000`. Always carries a faint blueish undertone.
- **Two brand accents, never more.** Gold (`#D4AF37`) is the primary signal;
  cyan (`#00E5FF`) is the secondary intel-stream accent. Use both, but never
  for the same thing in the same panel.
- **Alert system uses four signals** — red `#FF3D3D`, orange `#FF9500`,
  green `#00E676`, blue `#448AFF` — and only ever as messaging color (never
  as decoration). Pulsing animations reinforce severity.
- **Categorical layer colors** (`--layer-commercial`, `--layer-military`,
  `--layer-cctv`, etc.) are reserved for map overlays — don't use
  hot-pink-CCTV-green outside its mapping context.

### Type

- **Two families.** JetBrains Mono for HUD, labels, tabular data, all-caps
  headings. Inter for prose. Nothing else.
- **HUD letter-spacing is generous** (`0.15–0.22em`) and uppercase. This is
  what creates the operations-console feel.
- **Tabular numbers everywhere** for any data readout
  (`font-variant-numeric: tabular-nums`). Counts must not shimmy.
- **Stat values glow** with a faint gold or cyan `text-shadow`.

### Backgrounds

- Solid void black with subtle radial gradient ellipses at corners to add
  warmth where the user looks first.
- **Particle grid** dot pattern (`.particle-grid`) overlays empty space
  in some panels — `radial-gradient` 1px dots on a 24px lattice, slowly
  drifting.
- **Imagery** when used is full-bleed, **dark**, often a globe view or
  satellite map; gold and cyan tints overlay it.
- **CRT scanline texture** (`.crt-scanlines`) is occasionally available as a
  per-pixel `repeating-linear-gradient` for atmospheric framing.
- **Vignette** (`.vignette`) radial darkening at the edge of large viewports.

### Animation

- **Easing.** Default `cubic-bezier(0.4, 0, 0.2, 1)` (snap), spring
  `cubic-bezier(0.34, 1.56, 0.64, 1)` (buttons + cards lift on hover/active),
  out `cubic-bezier(0.16, 1, 0.3, 1)` (entrances).
- **Durations.** 0.15s for interactive press, 0.25–0.4s for hover state
  shifts, 0.5–0.6s for panel entrances.
- **Signature motions.** (1) `pulse-ring-expand` — radar ping with concentric
  expanding circles, used for live-data dots. (2) `scan-line-sweep` — a thin
  glowing horizontal beam crosses the panel from top to bottom every 4s.
  (3) `ticker-scroll` — horizontal marquee, 30s linear loop. (4)
  `splash-ring` — concentric counter-rotating rings on the splash screen.
- **Honors `prefers-reduced-motion`.** All looping animations stop, all
  transitions drop to 0.01ms.

### Hover & press

- **Hover on a panel** brightens its border (`--border-primary` →
  `--border-active`), adds a faint gold halo (`box-shadow: 0 0 12px
  rgba(212,175,55,0.08)`), and lifts the card 2px (`translateY(-2px)`).
- **Hover on an icon button** warms the icon to gold and tints the
  background a translucent gold-glow.
- **Press state shrinks** to `scale(0.97)` with a `0.08s` transition (springy
  return).
- **`btn-tactical:active`** ALSO emits a `0.3s` gold flash overlay
  (`btn-flash` keyframe) for tactile feedback.

### Borders

- **All borders derive from gold transparency.** `rgba(212, 175, 55, α)`
  at α=0.08 (secondary), 0.15 (primary), 0.40 (active/focus).
- **Cyan equivalents** mirror that scale for the cyan-accented variants.
- **Left-accent cards** (`.gotham-card`) use a 3px solid border on the left
  edge in gold-dim, lit up to gold-primary on hover.

### Shadows

- **Glass-panel signature** combines drop shadow + inset highlights:
  `0 4px 30px rgba(0,0,0,0.5), 0 1px 0 rgba(212,175,55,0.06) inset, 0 -1px 0 rgba(0,0,0,0.3) inset`.
  The inset gold rim is what gives panels the "lit from above" feel.
- **Glow shadows** for brand emphasis are dual-layer: a tight 20px halo +
  a softer 60px atmospheric glow.
- **Threat badges** use animated `box-shadow` pulses that breathe between
  6px and 16px spread.

### Layout rules

- **Map is always the full-bleed background.** Panels float on top with
  glass blur. Fixed at the corners — top-left, top-right, bottom-left,
  bottom-right.
- **Edge padding** is `20px` on desktop, `12px` tablet, `8px` mobile.
- **Panel gap** is `12px` between stacked panels.
- **Command bar** is a 48px top rail with a gradient bottom border.
- **Status ticker** is a 22–26px bottom rail.

### Transparency & blur

- Glassmorphic panels use `backdrop-filter: blur(24px) saturate(1.3)` and a
  background of `rgba(8, 10, 20, 0.88)`.
- Smaller floating elements use `blur(16px)`.
- Tooltips use `blur(20px) saturate(1.2)` against `rgba(12, 14, 26, 0.92)`.

### Corner radii

- **14px** — top-level glass panels.
- **10–12px** — secondary panels, large cards.
- **8px** — buttons, inputs, small panels.
- **6px** — badges, threat indicators.
- **4px** — pill tags (or full `100px` pill).

### Cards

Two flavours coexist:

1. **Glass panel** (`.glass-panel`) — frosted rectangle, no left accent.
   Used for top-level UI surfaces (LayerPanel, IntelFeed, MarketsPanel).
2. **Gotham card** (`.gotham-card`) — left-accent border (gold by default,
   cyan or red for variants), hover-lift, drop shadow. Used for *items*
   inside lists (news entries, country dossiers, alert items).

### Imagery treatment

- Imagery is dark and cool-leaning. Gold and cyan are reserved for UI
  chrome; the underlying globe/map is desaturated near-monochrome.
- The Eye-of-Horus brand mark is reproduced *in gold on black* every
  time. Never inverted, never tinted.

---

## Iconography

See [`preview/iconography.html`](./preview/iconography.html).

- **Library: `lucide-react`** at 1.6 stroke. The OSIRIS codebase imports
  ~40 distinct Lucide icons (`Plane`, `Satellite`, `Activity`, `Globe`,
  `Radio`, `Eye`, `Shield`, `Camera`, `Flame`, `Target`, `CloudLightning`,
  `Radiation`, `Tv`, `Anchor`, `Ship`, `Newspaper`, etc.).
- **Sizes.** 14px in dense HUD panels, 16px in panel headers, 18px in
  toolbar buttons.
- **Coloring.** Icons follow text color (`currentColor`) by default; warm
  to `--gold-primary` on hover. Layer-toggle icons take a categorical
  fill matching their map-layer color.
- **No icon font.** No PNG icons. No emoji **except** country-flag glyphs
  (computed from ISO codes via Unicode regional-indicator pairs in the
  status ticker). The only sanctioned brand glyph is the hex character
  `⬡` (`U+2B21`) used adjacent to the OSIRIS wordmark.
- **Substitution note.** This design system loads Lucide icons inline as
  SVGs inside the preview cards and ui-kit. If the OSIRIS production
  app updates Lucide, mirror the version here.
- **Brand logomark** is a raster PNG of the Eye of Horus
  (`assets/osiris-icon.png`, 512px and 192px). Used as favicon, OG image,
  app icon, and as the splash mark.

### Font note

OSIRIS uses **JetBrains Mono** and **Inter**, both loaded from Google Fonts.
No local font files are shipped in this design system — `colors_and_type.css`
@imports them from `fonts.googleapis.com`. If you need to bundle for offline
use, download from <https://fonts.google.com/specimen/JetBrains+Mono> and
<https://fonts.google.com/specimen/Inter>.

---

## UI kit

[**`ui_kits/osiris/`**](./ui_kits/osiris/) — interactive recreation of the
OSIRIS dashboard. Open `index.html` to see a working mock-up with toggleable
layers, expandable intel feed, threat ticker, and the central map surface.
Components are split into single-purpose JSX files:

- `CommandBar.jsx` — top rail with brand mark, search, status pills.
- `LayerPanel.jsx` — left rail with grouped layer toggles + entity counts.
- `IntelFeed.jsx` — right rail with risk-graded SIGINT items.
- `MarketsPanel.jsx` — bottom-right exchange + commodity readouts.
- `StatusTicker.jsx` — bottom rail with rolling country-risk markers.
- `Splash.jsx` — boot sequence with rotating rings.
- `MapSurface.jsx` — the globe placeholder & overlay primitives.

These are visual recreations only — no real map rendering, no real API
calls. The point is to capture every interaction state of the chrome so
future mocks can lean on it.

---

## Quick start

```html
<!-- 1. Tokens & semantic element styles -->
<link rel="stylesheet" href="colors_and_type.css">
<!-- 2. Component styles -->
<link rel="stylesheet" href="components.css">

<!-- 3. Use the vocabulary directly -->
<div class="glass-panel" style="padding:14px;">
  <div style="display:flex; align-items:center; gap:8px;">
    <span class="pulse-dot pulse-dot--gold"></span>
    <h3>Threats &amp; Infra</h3>
    <span class="gotham-tag gotham-tag--info">SIGINT</span>
  </div>
</div>
```

---

## Caveats &amp; flagged substitutions

- **Eye-of-Horus PNGs only.** The product's favicon SVGs returned 403 on
  read; the design system ships only the raster app-icon. If you need
  a vector mark, request the SVG sources from the project owner.
- **Map rendering is mocked.** The dashboard ui-kit uses a styled SVG
  placeholder for the MapLibre canvas. The chrome around it is faithful,
  but the actual GPU-rendered points/lines/heatmaps from the production
  app are not reproduced.
- **Lucide icons.** Inlined as raw SVG paths copied from
  `lucide-static`. If the production app upgrades Lucide and an icon
  changes shape, those inline copies will drift — flag if it matters.
