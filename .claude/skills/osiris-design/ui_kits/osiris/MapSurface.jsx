/* eslint-disable */
/**
 * OSIRIS · MapSurface
 * Stylised globe + plotted entities. SVG mock; the production app
 * uses MapLibre GL with WebGL-rendered points.
 *
 * - background: dark globe rim + grid
 * - plotted entities: jittered dots by category, color follows --layer-*
 * - hovering an entity surfaces a callsign popover
 * - flight paths drawn as faint great-circle arcs
 */
const ENTITIES = [
  // Aviation
  ...Array.from({ length: 60 }, (_, i) => ({ type: 'flights',  x: 6 + Math.random()*88, y: 12 + Math.random()*76, label: `FLT${1100+i}` })),
  ...Array.from({ length: 12 }, (_, i) => ({ type: 'military', x: 5 + Math.random()*90, y: 12 + Math.random()*76, label: `MIL${430+i}` })),
  ...Array.from({ length: 8  }, (_, i) => ({ type: 'jets',     x: 5 + Math.random()*90, y: 12 + Math.random()*76, label: `JET${i+1}` })),
  // Maritime + satellites
  ...Array.from({ length: 18 }, (_, i) => ({ type: 'maritime', x: 5 + Math.random()*90, y: 30 + Math.random()*58, label: `MV-${i+1}` })),
  ...Array.from({ length: 22 }, (_, i) => ({ type: 'satellites',x: 5 + Math.random()*90, y: 6 + Math.random()*88, label: `SAT-${i+10}` })),
  // Quakes + fires
  ...Array.from({ length: 14 }, (_, i) => ({ type: 'earthquakes', x: 6 + Math.random()*88, y: 18 + Math.random()*70, label: `M${(2 + Math.random()*4).toFixed(1)}` })),
  ...Array.from({ length: 10 }, (_, i) => ({ type: 'fires',       x: 6 + Math.random()*88, y: 18 + Math.random()*70, label: 'HOT' })),
  // CCTV
  ...Array.from({ length: 35 }, (_, i) => ({ type: 'cctv',     x: 4 + Math.random()*92, y: 16 + Math.random()*72, label: `CAM-${i}` })),
  // Conflict markers (incidents)
  { type: 'incident', x: 56, y: 38, label: 'UKR — Active' },
  { type: 'incident', x: 60, y: 50, label: 'SYR — Hot' },
  { type: 'incident', x: 76, y: 56, label: 'PRK DMZ' },
  { type: 'incident', x: 82, y: 44, label: 'TWN strait' },
];

const COLOR_MAP = {
  flights: '#00E5FF',
  military: '#FF3D3D',
  jets: '#FF69B4',
  maritime: '#00BCD4',
  satellites: '#D4AF37',
  earthquakes: '#FF9500',
  fires: '#FF6B00',
  cctv: '#39FF14',
  incident: '#FF3D3D',
};

const MapSurface = ({ activeLayers, focus }) => {
  const visible = ENTITIES.filter(e => {
    if (e.type === 'incident') return activeLayers.incidents;
    return activeLayers[e.type];
  });

  return (
    <div className="map-surface">
      {/* base globe / grid */}
      <svg className="map-surface__bg" viewBox="0 0 100 60" preserveAspectRatio="none">
        <defs>
          <radialGradient id="globe-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor="#0A1228" stopOpacity="0.9"/>
            <stop offset="60%" stopColor="#06060C" stopOpacity="0.0"/>
          </radialGradient>
          <pattern id="map-grid" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(212,175,55,0.06)" strokeWidth="0.08"/>
          </pattern>
          <radialGradient id="orb" cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor="rgba(212,175,55,0.04)"/>
            <stop offset="80%" stopColor="rgba(0,229,255,0.02)"/>
            <stop offset="100%" stopColor="rgba(4,4,10,0)"/>
          </radialGradient>
        </defs>
        <rect width="100" height="60" fill="url(#orb)"/>
        <rect width="100" height="60" fill="url(#map-grid)"/>
        {/* meridian arcs */}
        {[20,40,60,80].map(x => (
          <ellipse key={x} cx={x} cy="30" rx="22" ry="28" fill="none" stroke="rgba(212,175,55,0.04)" strokeWidth="0.1"/>
        ))}
        {/* equator */}
        <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(0,229,255,0.06)" strokeWidth="0.1" strokeDasharray="0.6,0.6"/>
        {/* faint continent silhouettes */}
        <path d="M 18 18 L 28 16 L 35 22 L 33 30 L 25 32 L 18 28 Z" fill="rgba(212,175,55,0.04)" stroke="rgba(212,175,55,0.12)" strokeWidth="0.1"/>
        <path d="M 42 14 L 60 12 L 70 20 L 72 32 L 62 36 L 54 32 L 46 22 Z" fill="rgba(212,175,55,0.04)" stroke="rgba(212,175,55,0.12)" strokeWidth="0.1"/>
        <path d="M 36 36 L 44 38 L 46 50 L 38 52 L 32 44 Z" fill="rgba(212,175,55,0.04)" stroke="rgba(212,175,55,0.12)" strokeWidth="0.1"/>
        <path d="M 72 34 L 80 32 L 86 40 L 82 48 L 74 46 Z" fill="rgba(212,175,55,0.04)" stroke="rgba(212,175,55,0.12)" strokeWidth="0.1"/>

        {/* great-circle flight paths */}
        {activeLayers.flights && Array.from({length: 8}).map((_,i) => (
          <path
            key={i}
            d={`M ${10+i*9} ${20+Math.sin(i)*8} Q ${50+i*4} ${10+Math.cos(i)*6}, ${85-i*5} ${30+Math.sin(i*2)*10}`}
            fill="none"
            stroke="rgba(0,229,255,0.18)"
            strokeWidth="0.08"
            strokeDasharray="0.5,0.5"
          />
        ))}
      </svg>

      {/* entities */}
      <div className="map-surface__entities">
        {visible.map((e, i) => (
          <span
            key={i}
            className={`entity entity--${e.type}`}
            style={{
              left: `${e.x}%`,
              top:  `${e.y}%`,
              color: COLOR_MAP[e.type],
              boxShadow: `0 0 ${e.type === 'incident' ? 12 : 5}px ${COLOR_MAP[e.type]}`,
            }}
            title={e.label}
          />
        ))}
      </div>

      {/* hover ring + corner brackets */}
      {focus && (
        <div className="map-surface__focus" style={{ left: `${focus.x}%`, top: `${focus.y}%` }}>
          <div className="map-surface__focus-ring" />
          <div className="map-surface__focus-label">
            <span className="hud-label">TARGET</span>
            <span className="hud-value">{focus.label}</span>
          </div>
        </div>
      )}

      {/* scan sweep */}
      <div className="scan-line scan-line--gold" style={{ animationDuration: '6s', opacity: 0.6 }} />

      {/* vignette */}
      <div className="vignette" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

      {/* coords HUD bottom-left */}
      <div className="map-surface__coords">
        <div><span className="hud-label">LAT</span> <span className="hud-value">48.8566° N</span></div>
        <div><span className="hud-label">LON</span> <span className="hud-value">002.3522° E</span></div>
        <div><span className="hud-label">ZOOM</span> <span className="hud-value">2.4</span></div>
      </div>

      {/* scale bar top-right */}
      <div className="map-surface__scale">
        <div className="hud-label">SCALE</div>
        <div className="map-surface__scale-bar" />
        <div className="hud-value">~ 500 km</div>
      </div>
    </div>
  );
};

window.MapSurface = MapSurface;
