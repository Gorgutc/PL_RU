/* eslint-disable */
/**
 * OSIRIS · IntelFeed
 * Right rail. SIGINT-style news feed with risk badges & time-ago.
 */
const FEED_ITEMS = [
  { risk: 9, source: 'REUTERS',    coords: [48.3, 35.5], minsAgo: 2,  title: 'Drone strike reported near Kramatorsk; secondary explosions confirmed by 3 SIGINT channels.', assessment: 'High-confidence ELINT correlation with seismic micro-event at 09:22Z.' },
  { risk: 7, source: 'AL JAZEERA', coords: [33.5, 36.3], minsAgo: 14, title: 'IDF tankers cross northern Lebanese border crossing; UN monitor en-route.' },
  { risk: 8, source: 'NHK WORLD',  coords: [38.9, 121.6], minsAgo: 31, title: 'PLAN naval exercise resumes off Bohai Sea; 4 destroyers, 1 frigate broadcasting AIS.' },
  { risk: 5, source: 'BBC NEWS',   coords: [50.1, 8.7],   minsAgo: 47, title: 'EU emergency council convenes Friday; energy sanctions package under review.' },
  { risk: 6, source: 'AFP',        coords: [-15.7, 28.3], minsAgo: 62, title: 'Copperbelt mine workers strike enters day 12; logistics route to Lobito impacted.' },
  { risk: 4, source: 'KYODO',      coords: [35.6, 139.7], minsAgo: 78, title: 'GPS-jamming anomaly reported by 7 commercial flights over East China Sea.' },
  { risk: 3, source: 'TASS',       coords: [55.7, 37.6], minsAgo: 124, title: 'Cyber-firm Kaspersky flags new APT cluster targeting energy infrastructure.' },
];

function getRiskLevel(score) {
  if (score >= 8) return { label: 'CRITICAL', cls: 'critical' };
  if (score >= 6) return { label: 'HIGH',     cls: 'high' };
  if (score >= 4) return { label: 'ELEVATED', cls: 'elevated' };
  return                  { label: 'LOW',      cls: 'low' };
}
function timeAgo(mins) {
  if (mins < 60) return `${mins}m AGO`;
  return `${Math.floor(mins/60)}h ${mins%60}m AGO`;
}

const IntelFeed = () => {
  const [expanded, setExpanded] = React.useState(true);
  return (
    <div className="glass-panel intel-feed">
      <button className="intel-feed__head" onClick={() => setExpanded(e => !e)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="newspaper" size={14} style={{ color: 'var(--gold-primary)' }} />
          <span className="intel-feed__title">SIGINT FEED</span>
          <span className="gotham-tag gotham-tag--info" style={{ padding: '1px 5px', fontSize: 7 }}>{FEED_ITEMS.length}</span>
          {FEED_ITEMS.some(i => i.risk >= 8) && (
            <span className="gotham-tag gotham-tag--critical" style={{ padding: '1px 4px', fontSize: 7 }}>ALERTS</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="pulse-dot" style={{ width: 6, height: 6 }} />
          <Icon name={expanded ? 'chevronUp' : 'chevronDown'} size={12} style={{ color: 'var(--text-muted)' }} />
        </div>
      </button>

      {expanded && (
        <div className="intel-feed__items styled-scrollbar">
          {FEED_ITEMS.map((item, i) => {
            const r = getRiskLevel(item.risk);
            return (
              <div className="intel-feed__item" key={i}>
                <div className="intel-feed__row">
                  <span className={`intel-feed__risk risk-${r.cls === 'elevated' ? 'medium' : r.cls === 'low' ? 'low' : r.cls === 'high' ? 'high' : 'critical'}`}>
                    {r.label}
                  </span>
                  <span className="intel-feed__source">{item.source}</span>
                  <button className="intel-feed__pin" title="Locate"><Icon name="mapPin" size={10} /></button>
                  <span className="intel-feed__time">{timeAgo(item.minsAgo)}</span>
                </div>
                <h4 className="intel-feed__title-line">{item.title}</h4>
                {item.assessment && (
                  <div className="intel-feed__assessment">
                    <Icon name="zap" size={10} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{item.assessment}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

window.IntelFeed = IntelFeed;
