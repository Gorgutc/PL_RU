/* eslint-disable */
/**
 * OSIRIS · CommandBar
 * Top-rail navigation with brand mark, search, zulu clock, system pills.
 * Sticks to the top of the viewport. Backdrop-blurred over the map.
 */
const CommandBar = ({ onSearchClick, projection, onToggleProjection }) => {
  const [time, setTime] = React.useState(getZulu());

  React.useEffect(() => {
    const iv = setInterval(() => setTime(getZulu()), 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="command-bar">
      {/* Brand */}
      <div className="command-bar__section">
        <img src="../../assets/osiris-icon.png" className="command-bar__logo" alt="" />
        <div className="command-bar__brand">
          <span className="command-bar__hex">⬡</span>
          <span className="command-bar__name">OSIRIS</span>
          <span className="command-bar__sub">GLOBAL INTELLIGENCE</span>
        </div>
        <span className="classified">⬢ CLASSIFIED</span>
      </div>

      {/* Center search */}
      <div className="command-bar__center">
        <button className="command-bar__search" onClick={onSearchClick}>
          <Icon name="search" size={12} />
          <span>CMD: LOCATE — COORDINATES, CALLSIGN, OR NAME…</span>
          <kbd className="command-bar__kbd">⌘L</kbd>
        </button>
      </div>

      {/* Right cluster */}
      <div className="command-bar__section">
        <div className="command-bar__stat">
          <span className="hud-label">ZULU</span>
          <span className="command-bar__zulu">{time}</span>
        </div>
        <div className="command-bar__stat">
          <span className="hud-label">THROUGHPUT</span>
          <span className="command-bar__throughput">3.4 MB/s</span>
        </div>
        <div className="command-bar__divider" />
        <button className={`command-bar__projection ${projection === 'globe' ? 'active' : ''}`} onClick={onToggleProjection}>
          <Icon name="globe" size={14} />
          <span>{projection.toUpperCase()}</span>
        </button>
        <button className="btn-icon" title="Share"><Icon name="share" size={14} /></button>
        <button className="btn-icon" title="Settings"><Icon name="settings" size={14} /></button>
      </div>
    </div>
  );
};

function getZulu() {
  const d = new Date();
  return `${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}:${String(d.getUTCSeconds()).padStart(2,'0')}Z`;
}

window.CommandBar = CommandBar;
