# Gotham — Intel workspace · Blueprint UI kit

A high-fidelity, dark-theme recreation of a Palantir Gotham-style intelligence platform built on Blueprint. **Not** real Gotham code; this is a pixel-faithful specimen built from the open Blueprint tokens and the design vocabulary visible in Palantir's public materials.

## Click-through (5 screens)

1. **Sign in** — classified banner, MFA token field, topo-style background.
2. **Cases** — list-detail of investigations with map preview, stats, activity feed.
3. **Workspace · Map** — geo canvas with pinned entities, time scrubber, relation arcs, legend.
4. **Workspace · Graph** — same entities laid out as nodes/edges with labelled relations.
5. **AI Assist drawer** — chat with the case, with cited entity chips and proposed edit diffs you can apply.

Plus two extra tabs inside the workspace: **Timeline** (lanes per entity with events) and **Files** (linked documents with classification tags).

## Files

```
index.html              boot
bp.css                  Blueprint styles (extends ../../colors_and_type.css)
Atoms.jsx               Button, Tag, Card, Callout, Input, Icon, Avatar (from foundry-console)
Gotham.jsx              ClassifiedBanner, TopBar, EntityChip
LoginView.jsx           dark sign-in
CasesView.jsx           list-detail + map preview + activity
WorkspaceView.jsx       3-column workspace + Map / Graph / Timeline / Files canvases
AssistDrawer.jsx        AI chat + cited entities + proposed diffs
App.jsx                 router + chrome
```

## Patterns demonstrated

- **Classified banners** top and bottom, always visible.
- **Three-column workspace**: entity panel · canvas · property panel — the canonical Gotham shape.
- **Same data, multiple views**: Map and Graph share the entity model; switching tabs reframes the same investigation.
- **AI Assist with provenance**: entity chips inline in agent responses, proposed edits as a before/after diff with apply/discard.
- **Intent-coloured time scrubber, density heat, multi-lane timeline** — patterns specific to intel.
- **Dark theme** as the default — light theme is reserved for documents and forms.

## What's faked

- The map is a stylised SVG, not Leaflet/Mapbox.
- The graph is a static SVG, not a force-simulated D3 graph.
- "AI" responses are static text.
- Search, filters, and most buttons are visual-only.

## What to look at first

If you only have 30 seconds, click **Sign in → Open workspace → toggle the Assist button in the top right**. That covers the most distinctive Gotham patterns: classified chrome, three-column workspace, and an agent-with-citations drawer.

For production work, the underlying components and tokens are all from canonical Blueprint:
https://github.com/palantir/blueprint
