/* eslint-disable */
/**
 * OSIRIS · Splash
 * Boot sequence — counter-rotating gold rings + scan-line + progress.
 * Shows for ~2.5s on first paint.
 */
const Splash = ({ onDismiss }) => {
  const [progress, setProgress] = React.useState(0);
  const [phase, setPhase] = React.useState('BOOTING KERNEL');

  React.useEffect(() => {
    const phases = [
      'BOOTING KERNEL',
      'AUTHENTICATING SOURCE FEEDS',
      'GEOLOCATING ENTITIES',
      'STREAM ONLINE',
    ];
    let p = 0;
    const iv = setInterval(() => {
      p += 5;
      setProgress(Math.min(p, 100));
      setPhase(phases[Math.min(Math.floor(p/25), phases.length-1)]);
      if (p >= 100) {
        clearInterval(iv);
        setTimeout(onDismiss, 300);
      }
    }, 80);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="splash">
      <div className="splash__scanline"></div>
      <div className="splash__rings">
        <div className="splash-ring splash-ring--outer"></div>
        <div className="splash-ring splash-ring--mid"></div>
        <div className="splash-ring splash-ring--inner"></div>
        <div className="splash-ring splash-ring--core"></div>
        <img src="../../assets/osiris-icon.png" className="splash__icon" alt="" />
      </div>
      <div className="splash__brand">
        <div className="splash__name"><span style={{ color: 'var(--gold-primary)' }}>⬡</span>OSIRIS</div>
        <div className="splash__sub">GLOBAL INTELLIGENCE PLATFORM · v6.2</div>
      </div>
      <div className="splash__progress">
        <div className="intel-progress">
          <div className="intel-progress__bar" style={{ width: `${progress}%` }} />
        </div>
        <div className="splash__phase">
          <span>{phase}</span>
          <span style={{ color: 'var(--gold-primary)' }}>{progress.toString().padStart(3,'0')}%</span>
        </div>
      </div>
      <div className="splash__bottom">
        <span className="classified">⬢ CLASSIFIED</span>
        <span style={{ color: 'var(--text-muted)', letterSpacing: '0.18em', fontSize: 9 }}>
          AUTHORIZED OPERATOR ACCESS · SESSION {Math.floor(Math.random()*9000+1000)}-{Math.floor(Math.random()*9000+1000)}
        </span>
      </div>
    </div>
  );
};

window.Splash = Splash;
