/* eslint-disable */
/**
 * OSIRIS · LayerPanel
 * Left rail. Grouped data-layer toggles with entity counts.
 * Mirrors src/components/LayerPanel.tsx — five groups, ~17 layers.
 */
const LAYER_GROUPS = [
  {
    label: 'AVIATION', icon: 'plane', color: '#00E5FF',
    layers: [
      { key: 'flights', label: 'Commercial', icon: 'plane', color: '#00E5FF', count: 8247 },
      { key: 'private',  label: 'Private',     icon: 'plane', color: '#00E676', count: 412 },
      { key: 'jets',     label: 'Private Jets',icon: 'plane', color: '#FF69B4', count: 89 },
      { key: 'military', label: 'Military',    icon: 'shield',color: '#FF3D3D', count: 23 },
    ],
  },
  {
    label: 'MARITIME & SPACE', icon: 'ship', color: '#00BCD4',
    layers: [
      { key: 'maritime',   label: 'Maritime / Naval', icon: 'ship',     color: '#00BCD4', count: 1340 },
      { key: 'satellites', label: 'Satellites',       icon: 'satellite',color: '#D4AF37', count: 2118 },
    ],
  },
  {
    label: 'SURVEILLANCE', icon: 'camera', color: '#39FF14',
    layers: [
      { key: 'cctv',      label: 'CCTV Cameras',    icon: 'camera',    color: '#39FF14', count: 2014 },
      { key: 'livenews',  label: 'Live News Feeds', icon: 'tv',        color: '#FF4081', count: 25 },
      { key: 'sigint',    label: 'SIGINT News (RSS)', icon: 'newspaper', color: '#D4AF37', count: 184 },
    ],
  },
  {
    label: 'NATURAL HAZARDS', icon: 'activity', color: '#FF9500',
    layers: [
      { key: 'earthquakes', label: 'Earthquakes (24h)', icon: 'activity',       color: '#FF9500', count: 47 },
      { key: 'fires',       label: 'Active Fires',      icon: 'flame',          color: '#FF6B00', count: 312 },
      { key: 'weather',     label: 'Severe Weather',    icon: 'cloudLightning', color: '#E040FB', count: 9 },
    ],
  },
  {
    label: 'THREATS & INFRA', icon: 'alert', color: '#FF3D3D',
    layers: [
      { key: 'nuclear',   label: 'Nuclear Facilities', icon: 'radiation', color: '#76FF03', count: 442 },
      { key: 'incidents', label: 'Global Incidents',   icon: 'alert',     color: '#FF3D3D', count: 38 },
      { key: 'jamming',   label: 'GPS Jamming',        icon: 'radar',     color: '#FF4444', count: 4 },
    ],
  },
];

const LayerPanel = ({ activeLayers, onToggle, onToggleGroup, expandedGroups, onExpand }) => {
  const allLayers = LAYER_GROUPS.flatMap(g => g.layers);
  const activeCount = Object.values(activeLayers).filter(Boolean).length;
  const totalEntities = allLayers.reduce((s, l) => s + (activeLayers[l.key] ? l.count : 0), 0);

  return (
    <div className="glass-panel layer-panel">
      {/* Header */}
      <div className="layer-panel__head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="pulse-dot pulse-dot--gold" style={{ width: 7, height: 7 }} />
          <span className="layer-panel__title">DATA LAYERS</span>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          <span className={`gotham-tag gotham-tag--${activeCount > 10 ? 'critical' : activeCount > 5 ? 'high' : 'low'}`} style={{ padding: '1px 6px', fontSize: 7 }}>
            {activeCount}/{allLayers.length}
          </span>
          <span className="gotham-tag gotham-tag--info" style={{ padding: '1px 5px', fontSize: 7 }}>
            {totalEntities.toLocaleString()} ENT
          </span>
        </div>
      </div>

      {/* Groups */}
      <div className="layer-panel__groups">
        {LAYER_GROUPS.map(group => {
          const expanded = expandedGroups[group.label];
          const groupActive = group.layers.filter(l => activeLayers[l.key]).length;
          const allActive = groupActive === group.layers.length;
          return (
            <div key={group.label} className="layer-group">
              <div className="layer-group__head">
                <button className="layer-group__head-btn" onClick={() => onExpand(group.label)}>
                  <Icon name={group.icon} size={12} style={{ color: group.color, flexShrink: 0 }} />
                  <span className="layer-group__label">{group.label}</span>
                  <span className="layer-group__count" style={{ color: groupActive > 0 ? group.color : 'var(--text-muted)' }}>
                    {groupActive}/{group.layers.length}
                  </span>
                  <Icon name={expanded ? 'chevronUp' : 'chevronDown'} size={12} style={{ color: 'var(--text-muted)' }} />
                </button>
                <button
                  className="layer-group__toggle-all"
                  onClick={() => onToggleGroup(group)}
                  title={allActive ? 'Disable all' : 'Enable all'}
                >
                  <Icon name={allActive ? 'toggleRight' : 'toggleLeft'} size={14} style={{ color: allActive ? group.color : 'var(--text-muted)' }} />
                </button>
              </div>

              {expanded && (
                <div className="layer-group__items">
                  {group.layers.map(layer => {
                    const isActive = activeLayers[layer.key];
                    return (
                      <button
                        key={layer.key}
                        className={`layer-item ${isActive ? 'active' : ''}`}
                        onClick={() => onToggle(layer.key)}
                      >
                        <span
                          className="layer-item__dot"
                          style={{
                            background: layer.color,
                            boxShadow: isActive ? `0 0 6px ${layer.color}99` : 'none',
                            opacity: isActive ? 1 : 0.3,
                          }}
                        />
                        <Icon
                          name={layer.icon}
                          size={13}
                          style={{ color: isActive ? layer.color : 'var(--text-muted)', flexShrink: 0 }}
                        />
                        <span className="layer-item__label" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {layer.label}
                        </span>
                        <span className="layer-item__count" style={{ color: isActive ? layer.color : 'var(--text-muted)' }}>
                          {layer.count.toLocaleString()}
                        </span>
                        <span className={`layer-toggle ${isActive ? 'active' : ''}`} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

window.LayerPanel = LayerPanel;
window.LAYER_GROUPS = LAYER_GROUPS;
