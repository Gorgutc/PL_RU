# OSIRIS · Dashboard UI Kit

Interactive recreation of the OSIRIS command surface. Open `index.html`.

## Files

| File              | Role                                                            |
| ----------------- | --------------------------------------------------------------- |
| `index.html`      | Mounts the React app. Loads CSS + component JSX files in order. |
| `kit.css`         | Layout chrome — app shell, panel positioning, component-specific styles built on top of the shared design tokens. |
| `App.jsx`         | Root composition. Owns active-layer state + splash gating.      |
| `Icon.jsx`        | Inline Lucide-style SVG icons. 1.6 stroke.                      |
| `CommandBar.jsx`  | Top rail · brand, locate, zulu clock, projection switch.        |
| `MapSurface.jsx`  | Globe-style map mock + plotted entities.                        |
| `LayerPanel.jsx`  | Left rail · 5 grouped data-layer toggles.                       |
| `IntelFeed.jsx`   | Right rail · SIGINT items with risk badges.                     |
| `MarketsPanel.jsx`| Bottom-right · exchange + commodity readouts.                   |
| `StatusTicker.jsx`| Bottom rail · rolling marquee of country risk + CVEs.           |
| `Splash.jsx`      | Boot sequence · rotating gold rings + progress.                 |

## Interactions

- Click a layer to toggle. Active layers count up the bottom of the panel; corresponding entities appear or disappear on the map mock.
- Click a group header to collapse/expand. Click the toggle-all switch to flip every layer in a group.
- Click `GLOBE` in the command bar to flip to `MERCATOR`.
- Splash dismisses after the ~2s boot sequence — no click needed.

## Caveats

- Map rendering is mocked with an SVG. The production app uses MapLibre GL.
- API data is static. The production app polls flights, earthquakes, CCTV, RSS, etc.
- Icons are inline SVG; production app uses `lucide-react`.
