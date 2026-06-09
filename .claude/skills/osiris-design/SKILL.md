---
name: osiris-design
description: Use this skill to generate well-branded interfaces and assets for OSIRIS — the open-source Palantir-class global-intelligence platform (real-time flight tracking, CCTV, satellites, OSINT recon tools). Use for production code, throwaway prototypes, slides, marketing mocks, or any artifact that should match the OSIRIS "Egyptian Mythology × Dark Ops × Glassmorphism" look. Contains the full color & type system, glass / gotham component CSS, brand imagery, and a working dashboard UI kit.
user-invocable: true
---

# OSIRIS Design Skill

> Claude mirror of the Codex skill `plugins/pl-ru-codex/skills/osiris-design/SKILL.md` — keep both canons in sync (parity guard A16). The asset bundle (README.md, colors_and_type.css, components.css, assets/, ui_kits/, preview/, \_source/) lives only at the canonical path `plugins/pl-ru-codex/skills/osiris-design/`; resolve every relative file reference below against that folder. This folder is a read-only design reference — never edit it.

You are designing for **OSIRIS** — the Open Source Intelligence & Reconnaissance Integrated System. A Palantir-class command surface for real-time situational awareness over aviation, maritime, satellites, CCTV, conflict zones, cyber threats, and live broadcast intel.

## Setup

1. **Read `README.md` first.** It contains the brand voice, visual foundations, iconography rules, and a file index. It is the source of truth — every rule below has a longer explanation there.
2. **Skim `colors_and_type.css` and `components.css`** to see the available tokens and component classes.
3. **Open `ui_kits/osiris/index.html`** to see the full dashboard in action and confirm the visual vocabulary.
4. **Browse `preview/`** to see isolated specimens of every primitive — palettes, type, tags, buttons, threat badges, stat counters, the ticker, the iconography grid, etc.

## How to use this skill

### If the user asks for a visual artifact (slide, mock, throwaway prototype, marketing image)

- Create a static HTML file under the project root.
- Link `colors_and_type.css` + `components.css` (or inline them — see _Caveats_ below).
- Copy brand assets from `assets/` (e.g. the Eye-of-Horus mark).
- Compose UI with the existing component vocabulary: `.glass-panel`, `.gotham-card`, `.gotham-tag`, `.threat-badge`, `.btn-tactical`, `.pulse-dot`, `.intel-progress`, `.gotham-stat`, etc.
- Use `Lucide` icons inlined as SVG (see `ui_kits/osiris/Icon.jsx` for a curated set) — never emoji except country flags.
- Keep type uppercase + tracked-out for any HUD micro-copy (`letter-spacing: 0.15–0.22em`).

### If the user asks for production code

- Read the CSS files as a source for tokens you would re-implement in your own framework (Tailwind config, design-system package, CSS-in-JS theme, etc.).
- Components in `ui_kits/osiris/*.jsx` are simplified visual replicas — refer to `_source/` for the actual production patterns.

### Rules of thumb

- **Two brand accents only:** gold `#D4AF37` (primary) and cyan `#00E5FF` (intel/secondary). Never mix three.
- **Background is _void_ black** `#04040A` / `#06060C` — never pure `#000`.
- **Alert color carries severity, never decoration.** Red = CRITICAL, Orange = HIGH, Gold = ELEVATED, Green = NOMINAL, Blue = INFO.
- **Tabular numbers** for all data readouts. Use `font-variant-numeric: tabular-nums` and `font-family: 'JetBrains Mono'`.
- **No emoji** except country flags computed from ISO codes (status ticker only).
- **No hand-rolled SVG icons.** Use Lucide.

### When the user invokes this skill without specifics

Ask what they want to build. Useful questions:

- _What kind of artifact?_ (slide deck, dashboard mock, marketing landing, splash screen, prototype, production component)
- _Which OSIRIS surface?_ (the main map dashboard, the RECON toolkit, a focused panel, a new feature)
- _How much fidelity?_ (sketch with placeholders / hi-fi pixel-perfect / production-ready)
- _Animated or static?_
- _Any specific copy or data they want represented?_

Then build the artifact in HTML or production code, depending on the answer.

## Caveats

- **CSS pathing.** When generating an HTML artifact that depends on `colors_and_type.css` and `components.css`, **inline the CSS into the HTML** if the artifact might be downloaded or hosted outside this project — relative paths can break when served from a different origin. Cross-folder `<link>` tags will work inside the project but fail in some sandboxes.
- **The Eye-of-Horus mark is shipped only as PNG.** No SVG mark is available. Use `assets/osiris-icon.png`.
- **Map rendering is mocked** in the ui-kit. For real geospatial work, use MapLibre GL with a dark style — the production app does so.
- **Fonts come from Google.** `colors_and_type.css` imports JetBrains Mono and Inter from `fonts.googleapis.com`; no local font files are bundled.
