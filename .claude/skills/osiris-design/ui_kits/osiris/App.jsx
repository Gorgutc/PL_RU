/* eslint-disable */
/**
 * OSIRIS · App — the dashboard root
 * Composes CommandBar + MapSurface + LayerPanel + IntelFeed + MarketsPanel
 * + StatusTicker. Renders Splash on first paint.
 */
const { useState, useEffect } = React;

const DEFAULT_LAYERS = {
  flights: true, private: false, jets: false, military: true,
  maritime: false, satellites: true,
  cctv: false, livenews: false, sigint: true,
  earthquakes: true, fires: false, weather: false,
  nuclear: false, incidents: true, jamming: false,
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [activeLayers, setActiveLayers] = useState(DEFAULT_LAYERS);
  const [expandedGroups, setExpandedGroups] = useState({
    AVIATION: true, 'MARITIME & SPACE': true, SURVEILLANCE: false,
    'NATURAL HAZARDS': true, 'THREATS & INFRA': true,
  });
  const [projection, setProjection] = useState('globe');

  const toggleLayer = (key) => setActiveLayers(p => ({ ...p, [key]: !p[key] }));
  const toggleGroup = (group) => {
    const allActive = group.layers.every(l => activeLayers[l.key]);
    setActiveLayers(p => {
      const next = { ...p };
      group.layers.forEach(l => { next[l.key] = !allActive; });
      return next;
    });
  };
  const expandGroup = (label) => setExpandedGroups(p => ({ ...p, [label]: !p[label] }));

  return (
    <div className="app">
      {showSplash && <Splash onDismiss={() => setShowSplash(false)} />}

      <CommandBar
        projection={projection}
        onToggleProjection={() => setProjection(p => p === 'globe' ? 'mercator' : 'globe')}
        onSearchClick={() => {}}
      />

      <div className="workspace">
        <MapSurface activeLayers={activeLayers} />

        <div className="workspace__left">
          <LayerPanel
            activeLayers={activeLayers}
            onToggle={toggleLayer}
            onToggleGroup={toggleGroup}
            expandedGroups={expandedGroups}
            onExpand={expandGroup}
          />
        </div>

        <div className="workspace__right">
          <IntelFeed />
        </div>

        <div className="workspace__bottom-right">
          <MarketsPanel />
        </div>
      </div>

      <StatusTicker />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
