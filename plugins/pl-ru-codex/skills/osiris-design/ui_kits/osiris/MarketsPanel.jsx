/* eslint-disable */
/**
 * OSIRIS · MarketsPanel
 * Bottom-right exchange + commodity readouts.
 */
const EXCHANGES = [
  { name: 'NYSE', open: true,  delta: '+0.42%' },
  { name: 'LSE',  open: true,  delta: '+0.18%' },
  { name: 'TSE',  open: false, delta: '−0.11%' },
  { name: 'HKG',  open: false, delta: '+0.61%' },
  { name: 'SSE',  open: false, delta: '−0.08%' },
  { name: 'XETRA',open: true,  delta: '+0.27%' },
];

const COMMODITIES = [
  { name: 'BRENT',  val: '88.42', delta: '+1.24', up: true },
  { name: 'WTI',    val: '82.15', delta: '+0.98', up: true },
  { name: 'GOLD',   val: '2,418', delta: '+12.3', up: true },
  { name: 'NATGAS', val: '2.81',  delta: '−0.04', up: false },
];

const MarketsPanel = () => {
  return (
    <div className="glass-panel markets-panel">
      <div className="markets-panel__head">
        <Icon name="activity" size={14} style={{ color: 'var(--gold-primary)' }} />
        <span className="markets-panel__title">MARKETS</span>
        <span className="gotham-tag gotham-tag--low" style={{ padding: '1px 6px', fontSize: 7, marginLeft: 'auto' }}>
          3 OPEN
        </span>
      </div>

      <div className="markets-panel__section">
        <div className="gotham-divider"><span className="gotham-divider__label">Exchanges</span></div>
        <div className="markets-panel__grid">
          {EXCHANGES.map(ex => (
            <div className="markets-panel__cell" key={ex.name}>
              <span className={`markets-panel__dot ${ex.open ? 'open' : ''}`} />
              <span className="markets-panel__name">{ex.name}</span>
              <span className={`markets-panel__delta ${ex.delta.startsWith('+') ? 'up' : 'down'}`}>{ex.delta}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="markets-panel__section">
        <div className="gotham-divider"><span className="gotham-divider__label">Commodities</span></div>
        <div className="markets-panel__commodities">
          {COMMODITIES.map(c => (
            <div className="markets-panel__commodity" key={c.name}>
              <div className="markets-panel__commodity-name">{c.name}</div>
              <div className="markets-panel__commodity-val">{c.val}</div>
              <div className={`markets-panel__commodity-delta ${c.up ? 'up' : 'down'}`}>
                {c.up ? '▲' : '▼'} {c.delta}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

window.MarketsPanel = MarketsPanel;
