// Cases dashboard — list of active investigations, dense table with status

const CASES = [
  { id: "OP-2024-0142", name: "Operation Saltmarsh",        owner: "M. Kalinski", entities: 412, alerts: 3, classification: "U//FOUO", status: "active",   updated: "12 min ago" },
  { id: "OP-2024-0139", name: "Northbridge Procurement",    owner: "S. Hwang",    entities: 218, alerts: 0, classification: "U//FOUO", status: "active",   updated: "2 hr ago"  },
  { id: "OP-2024-0118", name: "Cargo Theft · Port Authority", owner: "M. Kalinski", entities: 86,  alerts: 1, classification: "U",      status: "active",   updated: "yesterday" },
  { id: "OP-2024-0102", name: "Wire Fraud · Q2 Cohort",     owner: "D. Okafor",   entities: 364, alerts: 2, classification: "U//FOUO", status: "active",   updated: "3 days ago" },
  { id: "OP-2024-0099", name: "Synthetic Identity Ring",    owner: "L. Romero",   entities: 521, alerts: 0, classification: "U//FOUO", status: "review",   updated: "1 wk ago"  },
  { id: "OP-2023-0411", name: "Maritime · ROK FCN",         owner: "S. Hwang",    entities: 188, alerts: 0, classification: "U//FOUO", status: "archived", updated: "3 mo ago"  },
];

function CasesView({ onOpenCase }) {
  const [selected, setSelected] = React.useState(CASES[0].id);
  const active = CASES.find(c => c.id === selected) || CASES[0];

  const statusTag = (s) => {
    const cfg = {
      active:   { intent: "success",  label: "Active",    icon: "tick-circle" },
      review:   { intent: "warning",  label: "In review", icon: "warning-sign" },
      archived: { intent: undefined,  label: "Archived",  icon: "lock" },
    }[s];
    return <Tag minimal intent={cfg.intent} icon={cfg.icon}>{cfg.label}</Tag>;
  };

  return (
    <div style={{
      flex: 1,
      display: "flex",
      background: "var(--bp-dark-gray1)",
      color: "var(--bp-light-gray5)",
      minHeight: 0,
    }} className="bp-dark">
      {/* List column */}
      <div style={{ width: 460, borderRight: "1px solid rgba(0,0,0,.5)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "20px 20px 12px" }}>
          <div className="bp-row" style={{ justifyContent: "space-between" }}>
            <h1 style={{ fontSize: 22, lineHeight: "25px", fontWeight: 600, margin: 0, color: "#fff" }}>Cases</h1>
            <Button icon="add" intent="primary" size="small">New case</Button>
          </div>
          <div className="bp-row" style={{ marginTop: 12, gap: 6 }}>
            <Input leftIcon="search" placeholder="Filter cases" style={{ flex: 1 }} fill />
            <Button variant="minimal" icon="filter" />
          </div>
          <div className="bp-row" style={{ marginTop: 10, gap: 6 }}>
            <Tag minimal intent="primary">Owner: Me</Tag>
            <Tag minimal>Status: Active</Tag>
            <Tag minimal>Last 30 days</Tag>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 12px" }}>
          {CASES.map(c => {
            const isActive = c.id === selected;
            return (
              <div
                key={c.id}
                onClick={() => setSelected(c.id)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 4,
                  cursor: "pointer",
                  background: isActive ? "rgba(76,144,240,.16)" : "transparent",
                  border: "1px solid " + (isActive ? "rgba(76,144,240,.3)" : "transparent"),
                  marginBottom: 2,
                }}
              >
                <div className="bp-row" style={{ justifyContent: "space-between", gap: 8 }}>
                  <span className="bp-mono" style={{ fontSize: 11, color: "var(--bp-gray3)" }}>{c.id}</span>
                  <span className="bp-mono" style={{ fontSize: 10, color: "var(--bp-orange4)" }}>{c.classification}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginTop: 2 }}>{c.name}</div>
                <div className="bp-row" style={{ marginTop: 6, gap: 8, justifyContent: "space-between" }}>
                  <div className="bp-row" style={{ gap: 6 }}>
                    {statusTag(c.status)}
                    {c.alerts > 0 && <Tag minimal intent="danger" icon="warning-sign">{c.alerts}</Tag>}
                  </div>
                  <span className="bp-mono" style={{ fontSize: 11, color: "var(--bp-gray3)" }}>{c.entities} entities · {c.updated}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail column */}
      <div style={{ flex: 1, padding: 24, overflow: "auto" }}>
        <div className="bp-row" style={{ gap: 6, fontSize: 12, color: "var(--bp-gray3)" }}>
          <span>Cases</span>
          <Icon name="chevron-right" size={12} color="var(--bp-gray3)" />
          <span className="bp-mono" style={{ color: "var(--bp-light-gray5)" }}>{active.id}</span>
        </div>
        <div className="bp-row" style={{ justifyContent: "space-between", marginTop: 8, alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: 26, lineHeight: "30px", fontWeight: 600, margin: 0, color: "#fff" }}>{active.name}</h1>
            <div className="bp-row" style={{ marginTop: 8, gap: 8 }}>
              {statusTag(active.status)}
              <Tag minimal style={{ background: "rgba(200,118,25,.2)", color: "var(--bp-orange4)" }} icon="lock">{active.classification}</Tag>
              <span style={{ fontSize: 13, color: "var(--bp-gray3)" }}>· Lead {active.owner}</span>
            </div>
          </div>
          <Button intent="primary" icon="map" onClick={() => onOpenCase && onOpenCase(active)}>Open workspace</Button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 24 }}>
          <Stat label="Entities" value={active.entities.toLocaleString()} sub="+18 this week" />
          <Stat label="Open alerts" value={active.alerts} intent={active.alerts ? "danger" : undefined} />
          <Stat label="Linked docs" value="247" sub="32 unreviewed" />
          <Stat label="Last activity" value="12m" sub="ago" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginTop: 16 }}>
          {/* Map preview */}
          <div style={{
            background: "var(--bp-dark-gray2)",
            borderRadius: 4,
            border: "1px solid rgba(255,255,255,.1)",
            overflow: "hidden",
            position: "relative",
            height: 260,
          }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Geographic distribution</span>
              <span className="bp-mono" style={{ fontSize: 11, color: "var(--bp-gray3)" }}>EU-W · 412 entities</span>
            </div>
            <MapPreview />
          </div>

          {/* Activity feed */}
          <div style={{
            background: "var(--bp-dark-gray2)",
            borderRadius: 4,
            border: "1px solid rgba(255,255,255,.1)",
            overflow: "hidden",
            height: 260,
            display: "flex",
            flexDirection: "column",
          }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Recent activity</span>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
              {[
                { who: "S. Hwang", what: "Added entity",   target: "PERSON · K. Vasquez",      ago: "12m", hue: 1 },
                { who: "system",   what: "Alert",          target: "Aimpoint match · Helmand", ago: "26m", hue: 5, intent: "danger" },
                { who: "M. Kalinski", what: "Edited prop", target: "VEHICLE · BMW · 9C2E1A",   ago: "1h",  hue: 4 },
                { who: "system",   what: "Document ingested", target: "court.records.2026Q1", ago: "2h",  hue: 5 },
                { who: "L. Romero", what: "Commented",     target: "PERSON · A. Pavlou",       ago: "3h",  hue: 2 },
                { who: "system",   what: "AI summary",     target: "Entity cluster #14",       ago: "5h",  hue: 5 },
              ].map((a, i) => (
                <div key={i} className="bp-row" style={{ padding: "6px 14px", gap: 8, fontSize: 12 }}>
                  {a.intent === "danger" ? (
                    <Icon name="warning-sign" size={14} color="var(--bp-red4)" />
                  ) : (
                    <Avatar name={a.who === "system" ? "SY" : a.who.split(" ").map(s => s[0]).join("")} size={18} hue={a.hue} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "var(--bp-light-gray5)" }}>
                      <span style={{ color: a.intent === "danger" ? "var(--bp-red4)" : "var(--bp-light-gray5)" }}>{a.who}</span>{" "}
                      <span style={{ color: "var(--bp-gray3)" }}>{a.what}</span>
                    </div>
                    <div className="bp-mono" style={{ color: "var(--bp-gray4)", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {a.target}
                    </div>
                  </div>
                  <span className="bp-mono" style={{ color: "var(--bp-gray3)", fontSize: 11, flexShrink: 0 }}>{a.ago}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, intent }) {
  const color = intent === "danger" ? "var(--bp-red4)" : "#fff";
  return (
    <div style={{
      background: "var(--bp-dark-gray2)",
      borderRadius: 4,
      padding: "12px 14px",
      border: "1px solid rgba(255,255,255,.1)",
    }}>
      <div style={{ fontSize: 11, color: "var(--bp-gray3)", textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 600, color, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--bp-gray3)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function MapPreview() {
  // Static stylised map — grid + outline + a few pins
  return (
    <svg viewBox="0 0 600 220" width="100%" height="100%" style={{ display: "block" }}>
      <defs>
        <pattern id="mapgrid2" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(76,144,240,.08)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="600" height="220" fill="#252a31" />
      <rect width="600" height="220" fill="url(#mapgrid2)" />
      {/* fake landmass */}
      <path d="M 30 130 Q 80 80, 150 90 T 280 60 Q 360 50, 420 90 T 560 110 Q 590 140, 540 180 T 380 200 Q 280 210, 200 190 T 60 180 Q 20 160, 30 130 Z"
            fill="rgba(95,107,124,.25)" stroke="rgba(95,107,124,.6)" strokeWidth="0.7" />
      <path d="M 70 80 Q 100 60, 140 70 T 200 80"
            fill="none" stroke="rgba(95,107,124,.4)" strokeWidth="0.5" />
      {/* pins */}
      {[
        { x: 160, y: 110, c: "#f5498b" },
        { x: 240, y: 130, c: "#f5498b" },
        { x: 320, y: 100, c: "#bdadff" },
        { x: 380, y: 140, c: "#fbb360" },
        { x: 430, y: 110, c: "#72ca9b" },
        { x: 200, y: 165, c: "#f5498b" },
        { x: 460, y: 160, c: "#bdadff" },
        { x: 290, y: 175, c: "#bdadff" },
      ].map((p, i) => (
        <g key={i} transform={`translate(${p.x},${p.y})`}>
          <circle r="6" fill={p.c + "44"} />
          <circle r="3" fill={p.c} stroke="#0c0e10" strokeWidth="1" />
        </g>
      ))}
      {/* density heat blob */}
      <ellipse cx="200" cy="140" rx="80" ry="50" fill="url(#blob)" opacity="0.3" />
      <defs>
        <radialGradient id="blob"><stop offset="0%" stopColor="#cd4246" /><stop offset="100%" stopColor="#cd4246" stopOpacity="0" /></radialGradient>
      </defs>
    </svg>
  );
}

Object.assign(window, { CasesView });
