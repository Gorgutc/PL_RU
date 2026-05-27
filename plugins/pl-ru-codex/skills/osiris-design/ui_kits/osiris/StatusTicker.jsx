/* eslint-disable */
/**
 * OSIRIS · StatusTicker
 * Bottom rail. Country-risk markers + CVE count, rolling marquee.
 */
const TICKER_DATA = {
  exchanges: [
    { name: 'NYSE',  open: true },
    { name: 'LSE',   open: true },
    { name: 'XETRA', open: true },
    { name: 'TSE',   open: false },
    { name: 'HKG',   open: false },
  ],
  risks: [
    { code: 'UA', score: 87, level: 'CRITICAL' },
    { code: 'SY', score: 71, level: 'HIGH' },
    { code: 'TW', score: 54, level: 'ELEVATED' },
    { code: 'KP', score: 68, level: 'HIGH' },
    { code: 'YE', score: 79, level: 'CRITICAL' },
    { code: 'CH', score: 8,  level: 'LOW' },
  ],
  cves: 128,
};

function flag(code) {
  try {
    return String.fromCodePoint(...code.toUpperCase().split('').map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
  } catch { return code; }
}
function riskColor(level) {
  return level === 'CRITICAL' ? '#FF3D3D'
       : level === 'HIGH'     ? '#FF9500'
       : level === 'ELEVATED' ? '#D4AF37'
       :                        '#00E676';
}

const StatusTicker = () => {
  const openCount = TICKER_DATA.exchanges.filter(e => e.open).length;
  const content = (
    <>
      {TICKER_DATA.exchanges.map(ex => (
        <span className="ticker__item" key={ex.name}>
          <span className={`ticker__dot ${ex.open ? 'open' : ''}`} />
          <span style={{ color: ex.open ? 'var(--text-primary)' : 'rgba(155,151,142,0.45)' }}>{ex.name}</span>
        </span>
      ))}
      <span className="ticker__sep">|</span>
      {TICKER_DATA.risks.map(r => (
        <span className="ticker__item" key={r.code}>
          <span style={{ fontSize: 11 }}>{flag(r.code)}</span>
          <span style={{ color: riskColor(r.level), fontWeight: 700 }}>{r.score}</span>
        </span>
      ))}
      <span className="ticker__sep">|</span>
      <span className="ticker__item">
        <span style={{ color: '#E040FB' }}>CYBER</span>
        <span>{TICKER_DATA.cves} CVEs</span>
      </span>
      <span className="ticker__sep">|</span>
      <span className="ticker__item">
        <span style={{ color: 'var(--cyan-primary)' }}>SAT</span>
        <span>2,118 / 2,150</span>
      </span>
      <span className="ticker__sep">|</span>
      <span className="ticker__item">
        <span style={{ color: 'var(--gold-primary)' }}>RECON</span>
        <span>14 SWEEPS ACTIVE</span>
      </span>
    </>
  );
  return (
    <div className="status-ticker">
      <div className="status-ticker__static">
        <span style={{ color: 'var(--text-muted)' }}>MKT</span>
        <span style={{ color: 'var(--gold-primary)', fontWeight: 700 }}>{openCount}/{TICKER_DATA.exchanges.length}</span>
      </div>
      <div className="status-ticker__rolling">
        <div className="status-ticker__inner animate-ticker">
          {content}
          {content}
        </div>
      </div>
      <div className="status-ticker__right">
        <span className="pulse-dot" style={{ width: 6, height: 6 }} />
        <span>OSIRIS · v6.2 · UPTIME 04:21:18</span>
      </div>
    </div>
  );
};

window.StatusTicker = StatusTicker;
