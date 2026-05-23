// Gotham primitives: ClassifiedBanner, TopBar, ContextSidebar, EntityChip, Toolbar.
// Atoms.jsx already exports Icon, Button, Tag, Card, Callout, Input, Avatar onto window.

function ClassifiedBanner({ level = "UNCLASSIFIED//FOR INTERNAL USE ONLY", intent = "warning" }) {
  const bg = ({
    warning: "var(--bp-orange3)",
    danger: "var(--bp-red3)",
    success: "var(--bp-green3)",
    primary: "var(--bp-blue3)",
  })[intent];
  return (
    <div style={{
      background: bg, color: "#fff",
      textAlign: "center", padding: "3px 8px",
      fontSize: 11, fontWeight: 600, letterSpacing: "0.12em",
      fontFamily: "var(--bp-font-mono)",
      flexShrink: 0,
    }}>{level}</div>
  );
}

function EntityChip({ type = "person", label, sub, selected, onClick, dense }) {
  const styles = {
    person:       { color: "#bdadff", icon: "user",          shape: "circle" },
    organization: { color: "#fbb360", icon: "people",        shape: "square" },
    vehicle:      { color: "#72ca9b", icon: "locate",        shape: "diamond" },
    location:     { color: "#f5498b", icon: "pin",           shape: "pin" },
    event:        { color: "#8abbff", icon: "calendar",      shape: "circle" },
    document:     { color: "#abb3bf", icon: "document",      shape: "square" },
    device:       { color: "#13c9ba", icon: "satellite",     shape: "circle" },
  };
  const s = styles[type] || styles.person;
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: dense ? "4px 8px" : "8px 10px",
        background: selected ? "rgba(76,144,240,.16)" : "transparent",
        border: "1px solid " + (selected ? "var(--bp-blue4)" : "transparent"),
        borderRadius: 4,
        cursor: onClick ? "pointer" : "default",
        fontSize: 13,
      }}
    >
      <span style={{
        width: 20, height: 20, borderRadius: s.shape === "circle" ? "50%" : s.shape === "diamond" ? 0 : 3,
        transform: s.shape === "diamond" ? "rotate(45deg)" : "none",
        background: s.color + "33",
        boxShadow: "inset 0 0 0 1.5px " + s.color,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <span style={{
          transform: s.shape === "diamond" ? "rotate(-45deg)" : "none",
          display: "flex",
        }}>
          <Icon name={s.icon} size={12} color={s.color} />
        </span>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="bp-mono" style={{ color: "var(--bp-light-gray5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {label}
        </div>
        {sub && (
          <div className="bp-mono" style={{ color: "var(--bp-gray3)", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

function TopBar({ caseId, caseName, active, onNav, onSignOut, onToggleAssist, assistOpen, alertCount }) {
  const tabs = [
    { id: "map",      label: "Map",       icon: "map" },
    { id: "graph",    label: "Graph",     icon: "graph" },
    { id: "timeline", label: "Timeline",  icon: "timeline-events" },
    { id: "files",    label: "Files",     icon: "folder-close" },
  ];
  return (
    <div style={{
      height: 50,
      background: "var(--bp-dark-gray2)",
      display: "flex",
      alignItems: "center",
      padding: "0 8px 0 14px",
      gap: 10,
      borderBottom: "1px solid rgba(0,0,0,.5)",
      flexShrink: 0,
      position: "relative",
      zIndex: 10,
    }}>
      <div className="bp-row" style={{ gap: 8 }}>
        <img src="../../assets/palantir.svg" style={{ width: 18, height: 23, filter: "brightness(1.2)" }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--bp-light-gray5)", letterSpacing: ".04em" }}>GOTHAM</span>
      </div>
      <div style={{ width: 1, height: 24, background: "rgba(255,255,255,.12)" }} />

      <button
        onClick={() => onNav && onNav("cases")}
        style={{
          background: "rgba(255,255,255,.05)",
          border: "1px solid rgba(255,255,255,.12)",
          color: "var(--bp-light-gray5)",
          borderRadius: 4,
          padding: "0 10px",
          height: 30,
          display: "flex",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
          fontFamily: "var(--bp-font-sans)",
        }}
        title="Switch case"
      >
        <Icon name="folder-close" size={14} color="var(--bp-gray3)" />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.1, gap: 1 }}>
          <span className="bp-mono" style={{ fontSize: 10, color: "var(--bp-gray3)" }}>{caseId || "OP-2024-0142"}</span>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{caseName || "Operation Saltmarsh"}</span>
        </div>
        <Icon name="chevron-down" size={12} color="var(--bp-gray3)" />
      </button>

      <nav style={{ display: "flex", gap: 2, marginLeft: 6 }}>
        {tabs.map(t => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onNav && onNav(t.id)}
              className="bp-btn bp-btn-minimal"
              style={isActive ? { background: "rgba(76,144,240,.2)", color: "var(--bp-blue5)", fontWeight: 600 } : {}}
            >
              <Icon name={t.icon} size={14} color={isActive ? "var(--bp-blue5)" : "var(--bp-gray3)"} />
              {t.label}
            </button>
          );
        })}
      </nav>

      <div className="bp-grow" />

      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "rgba(0,0,0,.3)", borderRadius: 4,
        padding: "0 10px", height: 30,
        border: "1px solid rgba(255,255,255,.1)",
        width: 280,
      }}>
        <Icon name="search" size={14} color="var(--bp-gray3)" />
        <span style={{ fontSize: 13, color: "var(--bp-gray3)", flex: 1 }}>Search entities, documents, places</span>
        <span className="bp-mono" style={{
          fontSize: 10, color: "var(--bp-gray3)",
          background: "rgba(255,255,255,.06)", padding: "2px 5px", borderRadius: 3,
          border: "1px solid rgba(255,255,255,.1)",
        }}>/</span>
      </div>

      <button
        onClick={onToggleAssist}
        className="bp-btn"
        style={
          assistOpen
            ? { background: "var(--bp-blue3)", color: "#fff", border: "1px solid var(--bp-blue4)" }
            : {}
        }
        title="AI Assist"
      >
        <Icon name="control" size={14} color={assistOpen ? "#fff" : "var(--bp-light-gray5)"} />
        Assist
      </button>

      <button className="bp-btn bp-btn-minimal" title="Notifications" style={{ position: "relative" }}>
        <Icon name="notifications" size={18} />
        {alertCount > 0 && (
          <span style={{
            position: "absolute", top: 4, right: 4,
            background: "var(--bp-red3)", color: "#fff",
            fontSize: 9, fontWeight: 700,
            borderRadius: 8, padding: "1px 4px",
            minWidth: 14, height: 14,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{alertCount}</span>
        )}
      </button>

      <button className="bp-btn bp-btn-minimal" onClick={onSignOut} title="Sign out" style={{ padding: 4 }}>
        <Avatar name="MK" size={26} hue={4} />
      </button>
    </div>
  );
}

Object.assign(window, { ClassifiedBanner, TopBar, EntityChip });
