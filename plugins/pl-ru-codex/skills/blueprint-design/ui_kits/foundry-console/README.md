# Foundry Console — Blueprint UI kit

A high-fidelity recreation of the kind of data-platform console Palantir builds with Blueprint — Foundry-style. This is **not** real Foundry code; it is a pixel-faithful Blueprint specimen, built with the same tokens, type stack, spacing grid, and component anatomy you would use to mock any Blueprint-style desktop app.

## What's in here

- `index.html` — interactive click-through. Sign-in screen → Datasets table → Dataset detail with lineage graph → Pipeline run dialog.
- `App.jsx` — top-level shell + simple page router.
- `Navbar.jsx` — 50px navbar with brand, primary nav, search, utility.
- `Sidebar.jsx` — left nav with project tree.
- `Atoms.jsx` — Button / Tag / Card / Callout / Input / Icon primitives.
- `LoginView.jsx` — single dialog on dark background.
- `DatasetsView.jsx` — table-driven list of datasets with filter chips, sort, status tags.
- `DatasetDetailView.jsx` — header + lineage graph + properties side panel + tabs.
- `RunDialog.jsx` — modal for running a pipeline.

## Patterns demonstrated

- Blueprint class naming under `bp6-*` namespace
- Both light and dark theme on the same page (sidebar dark, content light)
- The 4px spacing grid
- Intent tags + intent callouts
- Icon-only buttons, icon+label buttons, icon-leading text
- Dense table (30px row), sortable header, multi-select
- Code/identifier styling
- Modal dialog with elevation-3

## What's faked

- Search is non-functional (visual only).
- The lineage graph is a static SVG.
- Numbers, dataset names, pipeline status are mocked.
- The login form does not validate; pressing Sign in advances the router.

For real implementations consult the canonical Blueprint source:
https://github.com/palantir/blueprint/tree/develop/packages/core/src/components
