// Navbar — 50px tall, brand + primary nav + search + utility
const { useState: useStateNav } = React;

function Navbar({ active = "datasets", onNav, onSignOut }) {
  const navItems = [
    { id: "datasets", label: "Datasets" },
    { id: "pipelines", label: "Pipelines" },
    { id: "ontology", label: "Ontology" },
    { id: "workshop", label: "Workshop" },
    { id: "code", label: "Code" },
  ];

  return (
    <div
      style={{
        height: 50,
        background: "var(--bp-app-bg-secondary)",
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        gap: 12,
        boxShadow: "0 0 0 1px rgba(17,20,24,.15), 0 0 5px 0 rgba(0,0,0,.02)",
        flexShrink: 0,
        zIndex: 10,
        position: "relative",
      }}
    >
      <div className="bp-row" style={{ gap: 8 }}>
        <img src="../../assets/blueprint-hero.png" style={{ width: 26, height: 26, borderRadius: 4 }} />
        <span style={{ fontSize: 16, fontWeight: 600, color: "var(--bp-dark-gray1)" }}>Foundry</span>
      </div>
      <div className="bp-divider-y"></div>
      <nav style={{ display: "flex", gap: 2, flex: 1 }}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNav && onNav(item.id)}
            className="bp-btn bp-btn-minimal"
            style={
              active === item.id
                ? { background: "rgba(45,114,210,.15)", color: "var(--bp-blue2)", fontWeight: 600 }
                : {}
            }
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "var(--bp-light-gray5)", borderRadius: 4,
          padding: "0 10px", height: 30,
          boxShadow: "inset 0 0 0 1px rgba(17,20,24,.15)",
          width: 240,
        }}
      >
        <Icon name="search" size={14} intent="muted" />
        <span style={{ fontSize: 13, color: "var(--bp-gray3)", flex: 1 }}>Search Foundry</span>
        <span className="bp-mono" style={{
          fontSize: 11, color: "var(--bp-gray2)",
          background: "var(--bp-white)", padding: "2px 5px", borderRadius: 3,
          boxShadow: "0 0 0 1px rgba(17,20,24,.1)"
        }}>⌘K</span>
      </div>
      <button className="bp-btn bp-btn-minimal" title="Notifications">
        <Icon name="notifications" size={18} />
      </button>
      <button className="bp-btn bp-btn-minimal" title="Help">
        <Icon name="help" size={18} />
      </button>
      <button className="bp-btn bp-btn-minimal" onClick={onSignOut} style={{ paddingLeft: 4, paddingRight: 4 }}>
        <Avatar name="AS" size={26} hue={0} />
      </button>
    </div>
  );
}

Object.assign(window, { Navbar });
