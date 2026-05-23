// Workspace — main intel workspace with Map / Graph / Timeline / Files tabs.
// Three columns: Entity panel (left) · Canvas (center) · Property panel (right).

const ENTITIES = [
  { id: "P-001", type: "person",       label: "Pavlou, Andreas",      sub: "PERSON · 41 · Cyprus",       country: "CY", x: 280, y: 220, gx: 380, gy: 220, primary: true,
    props: { dob: "1984-06-14", nationality: "Cypriot", aliases: "A. Pavlou · Andy P.", phones: "+357 99 ████ ███", flags: "PEP · sanctions watch" },
    classification: "U//FOUO" },
  { id: "P-002", type: "person",       label: "Vasquez, Kira",        sub: "PERSON · 32 · USA",          country: "US", x: 460, y: 280, gx: 540, gy: 140 ,
    props: { dob: "1993-02-08", nationality: "American", aliases: "K. Vasquez", phones: "+1 410 ████ ████", flags: "" } },
  { id: "O-014", type: "organization", label: "Northbridge Holdings", sub: "ORG · Shell · Cyprus",       country: "CY", x: 220, y: 290, gx: 220, gy: 320,
    props: { incorporated: "2019-03-04", jurisdiction: "Cyprus", shareholders: "3 (1 nominee)", flags: "shell company indicators" } },
  { id: "O-021", type: "organization", label: "Saltmarsh Logistics",  sub: "ORG · Logistics · NL",       country: "NL", x: 380, y: 380, gx: 380, gy: 380,
    props: { incorporated: "2022-09-11", jurisdiction: "Netherlands", flags: "linked to OP-2024-0118" } },
  { id: "V-008", type: "vehicle",      label: "BMW 5-series · 9C2E1A", sub: "VEHICLE · DE plate",        country: "DE", x: 520, y: 200, gx: 700, gy: 220,
    props: { plate: "9C 2E1A", make: "BMW", model: "530d", colour: "Black", registered: "Pavlou, A.", lastSeen: "2024-04-21 · Rotterdam" } },
  { id: "L-031", type: "location",     label: "Port of Rotterdam",    sub: "LOCATION · Berth 9C",        country: "NL", x: 350, y: 450, gx: 540, gy: 380,
    props: { lat: "51.9244° N", lon: "4.4777° E", type: "Maritime · container terminal" } },
  { id: "L-032", type: "location",     label: "Limassol Marina",      sub: "LOCATION · CY",              country: "CY", x: 180, y: 360, gx: 220, gy: 480,
    props: { lat: "34.6720° N", lon: "33.0427° E", type: "Maritime · marina" } },
  { id: "E-104", type: "event",        label: "Wire transfer · €1.4M","sub": "EVENT · 2024-04-18",       country: "CY", x: 290, y: 380, gx: 380, gy: 540,
    props: { date: "2024-04-18 09:14 UTC", amount: "€1,420,000", from: "Northbridge Holdings", to: "Saltmarsh Logistics" } },
];

const RELATIONS = [
  { a: "P-001", b: "O-014", label: "directs",   intent: "primary" },
  { a: "P-001", b: "V-008", label: "owns" },
  { a: "P-001", b: "P-002", label: "contacts (124)" },
  { a: "O-014", b: "E-104", label: "sends" },
  { a: "O-021", b: "E-104", label: "receives", intent: "primary" },
  { a: "O-021", b: "L-031", label: "operates at" },
  { a: "P-001", b: "L-032", label: "frequents" },
];

function WorkspaceView({ tab = "map", onChangeTab, selectedId, setSelectedId }) {
  const selected = ENTITIES.find(e => e.id === selectedId) || ENTITIES[0];

  return (
    <div style={{
      flex: 1, display: "flex",
      background: "var(--bp-dark-gray1)",
      minHeight: 0, color: "var(--bp-light-gray5)",
    }} className="bp-dark">
      {/* LEFT: entities panel */}
      <div style={{
        width: 260, flexShrink: 0,
        background: "var(--bp-dark-gray2)",
        borderRight: "1px solid rgba(0,0,0,.5)",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "12px 12px 8px" }}>
          <div className="bp-row" style={{ justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", letterSpacing: ".06em", textTransform: "uppercase" }}>
              Entities
            </span>
            <Tag minimal>{ENTITIES.length}</Tag>
          </div>
          <Input leftIcon="search" placeholder="Filter" style={{ marginTop: 8 }} fill />
        </div>
        <div style={{ padding: "0 8px 8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto", flex: 1 }}>
          {Object.entries(groupBy(ENTITIES, "type")).map(([type, items]) => (
            <div key={type} style={{ marginTop: 8 }}>
              <div className="bp-mono" style={{ fontSize: 10, color: "var(--bp-gray3)", textTransform: "uppercase", letterSpacing: ".06em", padding: "4px 8px" }}>
                {type} · {items.length}
              </div>
              {items.map(e => (
                <EntityChip
                  key={e.id}
                  type={e.type}
                  label={e.label}
                  sub={e.id}
                  dense
                  selected={selected.id === e.id}
                  onClick={() => setSelectedId(e.id)}
                />
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", padding: 10 }}>
          <Button fill icon="add" intent="primary" size="small">Add entity</Button>
        </div>
      </div>

      {/* CENTER: canvas */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <WorkspaceToolbar selected={selected} />
        <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
          {tab === "map"      && <MapCanvas selected={selected} setSelected={setSelectedId} />}
          {tab === "graph"    && <GraphCanvas selected={selected} setSelected={setSelectedId} />}
          {tab === "timeline" && <TimelineCanvas selected={selected} />}
          {tab === "files"    && <FilesCanvas />}
        </div>
      </div>

      {/* RIGHT: properties */}
      <PropertyPanel entity={selected} />
    </div>
  );
}

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    (acc[item[key]] ||= []).push(item);
    return acc;
  }, {});
}

function WorkspaceToolbar({ selected }) {
  return (
    <div style={{
      height: 40,
      flexShrink: 0,
      padding: "0 14px",
      borderBottom: "1px solid rgba(0,0,0,.5)",
      background: "var(--bp-dark-gray2)",
      display: "flex",
      alignItems: "center",
      gap: 6,
    }}>
      <div className="bp-row" style={{ gap: 4, fontSize: 12, color: "var(--bp-gray3)" }}>
        <span>Operation Saltmarsh</span>
        <Icon name="chevron-right" size={12} color="var(--bp-gray3)" />
        <span className="bp-mono" style={{ color: "var(--bp-light-gray5)" }}>{selected.id}</span>
      </div>
      <div className="bp-grow" />
      <Button variant="minimal" size="small" icon="layers">Layers · 4</Button>
      <Button variant="minimal" size="small" icon="filter">Filter</Button>
      <div style={{ width: 1, height: 20, background: "rgba(255,255,255,.1)" }} />
      <Button variant="minimal" size="small" icon="share" />
      <Button variant="minimal" size="small" icon="download" />
      <Button variant="minimal" size="small" icon="more" />
    </div>
  );
}

/* ---------- MAP ---------- */
function MapCanvas({ selected, setSelected }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#1c2127" }}>
      <svg viewBox="0 0 720 540" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(76,144,240,.06)" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="hotspot"><stop offset="0%" stopColor="#cd4246" stopOpacity="0.5" /><stop offset="100%" stopColor="#cd4246" stopOpacity="0" /></radialGradient>
        </defs>
        <rect width="720" height="540" fill="#1c2127" />
        <rect width="720" height="540" fill="url(#mapgrid)" />

        {/* coast outlines */}
        <path d="M 40 200 Q 100 140, 220 160 T 420 130 Q 520 130, 600 180 T 680 280 L 680 540 L 40 540 Z"
              fill="rgba(95,107,124,.18)" stroke="rgba(95,107,124,.45)" strokeWidth="0.7" />
        <path d="M 100 320 Q 180 280, 280 310 T 460 340 Q 550 350, 600 400"
              fill="none" stroke="rgba(95,107,124,.5)" strokeWidth="0.5" strokeDasharray="2 2" />
        <path d="M 80 450 Q 200 420, 380 470 T 660 480"
              fill="none" stroke="rgba(95,107,124,.4)" strokeWidth="0.5" />

        {/* heat */}
        <ellipse cx="300" cy="380" rx="120" ry="80" fill="url(#hotspot)" />
        <ellipse cx="500" cy="220" rx="80" ry="60" fill="url(#hotspot)" opacity="0.6" />

        {/* connection arcs between pins */}
        {RELATIONS.map((r, i) => {
          const a = ENTITIES.find(e => e.id === r.a);
          const b = ENTITIES.find(e => e.id === r.b);
          if (!a || !b) return null;
          const mx = (a.x + b.x) / 2;
          const my = Math.min(a.y, b.y) - 30;
          return (
            <path
              key={i}
              d={`M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`}
              fill="none"
              stroke={r.intent === "primary" ? "var(--bp-blue4)" : "rgba(143,153,168,.4)"}
              strokeWidth={r.intent === "primary" ? 1.6 : 0.8}
              strokeDasharray={r.intent === "primary" ? "" : "3 3"}
            />
          );
        })}

        {/* pins */}
        {ENTITIES.map(e => {
          const isSelected = e.id === selected.id;
          const colors = {
            person: "#bdadff", organization: "#fbb360", vehicle: "#72ca9b",
            location: "#f5498b", event: "#8abbff", document: "#abb3bf", device: "#13c9ba",
          };
          const c = colors[e.type] || "#fff";
          return (
            <g key={e.id} transform={`translate(${e.x},${e.y})`}
               style={{ cursor: "pointer" }}
               onClick={() => setSelected(e.id)}
            >
              {isSelected && <circle r="18" fill="none" stroke={c} strokeWidth="1.5" strokeDasharray="2 2" />}
              <circle r="11" fill={c + "33"} stroke={c} strokeWidth="1.2" />
              <circle r="4" fill={c} />
              {isSelected && (
                <g transform="translate(16, -8)">
                  <rect x="0" y="-12" width="124" height="32" rx="3" fill="#0c0e10" stroke={c} strokeWidth="1" />
                  <text x="8" y="0" fontSize="10.5" fontFamily="ui-monospace, Menlo, monospace" fill="#fff" fontWeight="600">{e.label.slice(0,18)}</text>
                  <text x="8" y="14" fontSize="9.5" fontFamily="ui-monospace, Menlo, monospace" fill="rgba(255,255,255,.6)">{e.id}</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* legend */}
      <div style={{
        position: "absolute", bottom: 14, left: 14,
        background: "rgba(28,33,39,.92)",
        border: "1px solid rgba(255,255,255,.1)",
        borderRadius: 4,
        padding: "8px 12px",
        display: "flex", gap: 14,
        fontSize: 11,
      }}>
        {[
          ["person", "#bdadff"], ["organization", "#fbb360"],
          ["vehicle", "#72ca9b"], ["location", "#f5498b"],
          ["event", "#8abbff"],
        ].map(([t,c]) => (
          <span key={t} style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--bp-light-gray5)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: c }} /> {t}
          </span>
        ))}
      </div>

      {/* zoom controls */}
      <div style={{
        position: "absolute", bottom: 14, right: 14,
        background: "rgba(28,33,39,.92)",
        border: "1px solid rgba(255,255,255,.1)",
        borderRadius: 4,
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        <button style={zoomBtn}><Icon name="add" size={14} /></button>
        <button style={{ ...zoomBtn, borderTop: "1px solid rgba(255,255,255,.1)" }}><Icon name="cross" size={14} /></button>
      </div>

      {/* time scrubber */}
      <div style={{
        position: "absolute", top: 14, left: 14, right: 14,
        background: "rgba(28,33,39,.92)",
        border: "1px solid rgba(255,255,255,.1)",
        borderRadius: 4,
        padding: "6px 12px",
        display: "flex", alignItems: "center", gap: 10,
        fontSize: 11,
      }}>
        <button className="bp-btn bp-btn-minimal bp-btn-small"><Icon name="play" size={12} /></button>
        <span className="bp-mono" style={{ color: "var(--bp-gray3)" }}>2024-01-01</span>
        <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,.1)", borderRadius: 2, position: "relative" }}>
          <div style={{ position: "absolute", left: "0%", width: "62%", height: "100%", background: "var(--bp-blue4)", borderRadius: 2 }} />
          <div style={{ position: "absolute", left: "62%", top: -3, width: 10, height: 10, background: "var(--bp-blue3)", borderRadius: "50%", border: "1.5px solid #fff" }} />
        </div>
        <span className="bp-mono" style={{ color: "var(--bp-gray3)" }}>2024-04-21</span>
      </div>
    </div>
  );
}

const zoomBtn = {
  width: 30, height: 30, background: "transparent",
  border: "none", color: "var(--bp-light-gray5)", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
};

/* ---------- GRAPH ---------- */
function GraphCanvas({ selected, setSelected }) {
  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "#1c2127",
      backgroundImage: "radial-gradient(circle, rgba(76,144,240,.06) 1px, transparent 1px)",
      backgroundSize: "20px 20px",
      overflow: "hidden",
    }}>
      <svg viewBox="0 0 900 600" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#5f6b7c" />
          </marker>
          <marker id="gaP" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#4c90f0" />
          </marker>
        </defs>

        {/* edges */}
        {RELATIONS.map((r, i) => {
          const a = ENTITIES.find(e => e.id === r.a);
          const b = ENTITIES.find(e => e.id === r.b);
          if (!a || !b) return null;
          const isPrimary = r.intent === "primary";
          const mx = (a.gx + b.gx) / 2;
          const my = (a.gy + b.gy) / 2;
          return (
            <g key={i}>
              <line
                x1={a.gx} y1={a.gy} x2={b.gx} y2={b.gy}
                stroke={isPrimary ? "#4c90f0" : "#5f6b7c"}
                strokeWidth={isPrimary ? 2 : 1}
                strokeDasharray={isPrimary ? "" : ""}
                markerEnd={isPrimary ? "url(#gaP)" : "url(#ga)"}
                opacity={isPrimary ? 0.9 : 0.55}
              />
              <text
                x={mx} y={my - 4}
                fontSize="9.5"
                fontFamily="ui-monospace, Menlo, monospace"
                fill={isPrimary ? "#8abbff" : "#8f99a8"}
                textAnchor="middle"
              >{r.label}</text>
            </g>
          );
        })}

        {/* nodes */}
        {ENTITIES.map(e => {
          const isSelected = e.id === selected.id;
          const colors = {
            person: "#bdadff", organization: "#fbb360", vehicle: "#72ca9b",
            location: "#f5498b", event: "#8abbff", document: "#abb3bf", device: "#13c9ba",
          };
          const c = colors[e.type] || "#fff";
          const r = isSelected ? 24 : 18;
          return (
            <g key={e.id} transform={`translate(${e.gx},${e.gy})`} style={{ cursor: "pointer" }} onClick={() => setSelected(e.id)}>
              {isSelected && <circle r={r + 8} fill="none" stroke={c} strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />}
              <circle r={r} fill="#0c0e10" stroke={c} strokeWidth="2" />
              <circle r={r - 4} fill={c + "22"} />
              <text y="4" fontSize="10" fontFamily="ui-monospace, Menlo, monospace" fontWeight="700" fill={c} textAnchor="middle">
                {e.type[0].toUpperCase()}
              </text>
              <text y={r + 14} fontSize="11" fontFamily="ui-monospace, Menlo, monospace" fill="#fff" textAnchor="middle" fontWeight="600">
                {e.label.length > 22 ? e.label.slice(0, 20) + "…" : e.label}
              </text>
              <text y={r + 26} fontSize="9.5" fontFamily="ui-monospace, Menlo, monospace" fill="#8f99a8" textAnchor="middle">
                {e.id}
              </text>
            </g>
          );
        })}
      </svg>

      <div style={{
        position: "absolute", top: 14, left: 14,
        background: "rgba(28,33,39,.92)",
        border: "1px solid rgba(255,255,255,.1)",
        borderRadius: 4,
        padding: "8px 12px",
        fontSize: 11,
      }}>
        <div className="bp-row" style={{ gap: 16, color: "var(--bp-gray3)" }}>
          <span><strong style={{ color: "#fff", fontVariantNumeric: "tabular-nums" }}>{ENTITIES.length}</strong> nodes</span>
          <span><strong style={{ color: "#fff", fontVariantNumeric: "tabular-nums" }}>{RELATIONS.length}</strong> edges</span>
          <span>Layout: <strong style={{ color: "#fff" }}>Force-directed</strong></span>
        </div>
      </div>
    </div>
  );
}

/* ---------- TIMELINE ---------- */
function TimelineCanvas({ selected }) {
  const TRACKS = [
    { lane: "PERSON · Pavlou, A.", color: "#bdadff", events: [
      { x: 8,  label: "Travel · CY→NL", icon: "locate" },
      { x: 28, label: "Met K. Vasquez", icon: "people" },
      { x: 54, label: "Phone log spike", icon: "comment" },
      { x: 72, label: "Travel · NL→CY", icon: "locate" },
    ]},
    { lane: "ORG · Northbridge",   color: "#fbb360", events: [
      { x: 18, label: "Incorporated nominee", icon: "people" },
      { x: 46, label: "Wire €1.4M", icon: "export", intent: "danger" },
    ]},
    { lane: "ORG · Saltmarsh",      color: "#fbb360", events: [
      { x: 46, label: "Wire received €1.4M", icon: "import", intent: "danger" },
      { x: 64, label: "Berth booked · 9C", icon: "pin" },
    ]},
    { lane: "VEHICLE · 9C 2E1A",    color: "#72ca9b", events: [
      { x: 22, label: "ANPR · DE A2", icon: "locate" },
      { x: 38, label: "ANPR · NL A12", icon: "locate" },
      { x: 70, label: "Last seen", icon: "warning-sign", intent: "warning" },
    ]},
  ];
  return (
    <div style={{ position: "absolute", inset: 0, padding: "20px 24px", overflowY: "auto" }}>
      <div className="bp-row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>Timeline · 2024-01 → 2024-04</span>
        <div className="bp-row">
          <Button variant="minimal" size="small" icon="filter">Filter events</Button>
          <Button variant="minimal" size="small" icon="layers">By type</Button>
        </div>
      </div>

      {/* time ruler */}
      <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 12, alignItems: "center", marginBottom: 8 }}>
        <div></div>
        <div style={{
          height: 22, background: "rgba(255,255,255,.04)",
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 3, display: "flex", padding: "0 6px",
        }}>
          {["Jan", "Feb", "Mar", "Apr"].map((m, i) => (
            <div key={m} style={{ flex: 1, fontSize: 10, color: "var(--bp-gray3)", display: "flex", alignItems: "center", justifyContent: "flex-start", borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,.06)", paddingLeft: 8 }}>
              {m} 2024
            </div>
          ))}
        </div>
      </div>

      {/* lanes */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {TRACKS.map((t, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 12, alignItems: "center" }}>
            <div className="bp-row" style={{ gap: 6, fontSize: 12, color: "var(--bp-light-gray5)", minWidth: 0 }}>
              <span style={{ width: 8, height: 8, borderRadius: 1, background: t.color, flexShrink: 0 }} />
              <span className="bp-mono" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.lane}</span>
            </div>
            <div style={{
              position: "relative", height: 36,
              background: "rgba(255,255,255,.03)",
              borderRadius: 3,
              border: "1px solid rgba(255,255,255,.06)",
            }}>
              {t.events.map((ev, j) => {
                const intentColor = ev.intent === "danger" ? "var(--bp-red4)" : ev.intent === "warning" ? "var(--bp-orange4)" : t.color;
                return (
                  <div key={j} style={{
                    position: "absolute",
                    left: `${ev.x}%`,
                    top: 4, height: 28,
                    background: "rgba(0,0,0,.4)",
                    border: "1px solid " + intentColor,
                    borderRadius: 3,
                    padding: "0 8px",
                    display: "flex", alignItems: "center", gap: 5,
                    color: "var(--bp-light-gray5)",
                    fontSize: 11,
                  }}>
                    <Icon name={ev.icon} size={11} color={intentColor} />
                    <span style={{ whiteSpace: "nowrap" }}>{ev.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- FILES ---------- */
function FilesCanvas() {
  const FILES = [
    { name: "incident.report.2024-04-18.pdf",   type: "PDF",   size: "2.4 MB",  ago: "12 min",  ents: 14, classification: "U//FOUO" },
    { name: "wire.transfer.bnp.04-18.csv",       type: "CSV",   size: "118 KB",  ago: "1 hr",    ents: 8,  classification: "U//FOUO" },
    { name: "anpr.dump.de-a2.2024-03.parquet",  type: "PARQ",  size: "84.2 MB", ago: "3 hr",    ents: 41, classification: "U" },
    { name: "shipping.manifest.berth9c.pdf",    type: "PDF",   size: "4.1 MB",  ago: "yesterday", ents: 22, classification: "U//FOUO" },
    { name: "corporate.registry.cy.json",        type: "JSON",  size: "1.2 MB",  ago: "2 days",   ents: 6,  classification: "U" },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "auto", padding: "16px 24px" }}>
      <div className="bp-row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>Linked files · {FILES.length}</span>
        <div className="bp-row">
          <Button variant="minimal" size="small" icon="upload">Ingest</Button>
          <Button variant="minimal" size="small" icon="search">Find in files</Button>
        </div>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ color: "var(--bp-gray3)", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,.1)" }}>
            <th style={{ fontWeight: 500, padding: "6px 8px" }}>Name</th>
            <th style={{ fontWeight: 500, padding: "6px 8px" }}>Type</th>
            <th style={{ fontWeight: 500, padding: "6px 8px", textAlign: "right" }}>Size</th>
            <th style={{ fontWeight: 500, padding: "6px 8px", textAlign: "right" }}>Entities</th>
            <th style={{ fontWeight: 500, padding: "6px 8px" }}>Classification</th>
            <th style={{ fontWeight: 500, padding: "6px 8px" }}>Ingested</th>
            <th style={{ width: 32 }}></th>
          </tr>
        </thead>
        <tbody>
          {FILES.map((f, i) => (
            <tr key={f.name} style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}>
              <td style={{ padding: "8px" }}>
                <span className="bp-row" style={{ gap: 8 }}>
                  <Icon name="document" size={14} color="var(--bp-gray3)" />
                  <span className="bp-mono">{f.name}</span>
                </span>
              </td>
              <td style={{ padding: "8px" }}><Tag minimal style={{ fontSize: 10 }}>{f.type}</Tag></td>
              <td className="bp-mono" style={{ padding: "8px", textAlign: "right", color: "var(--bp-gray3)" }}>{f.size}</td>
              <td className="bp-mono" style={{ padding: "8px", textAlign: "right" }}>{f.ents}</td>
              <td style={{ padding: "8px" }}>
                <Tag minimal style={{ background: "rgba(200,118,25,.2)", color: "var(--bp-orange4)" }}>{f.classification}</Tag>
              </td>
              <td style={{ padding: "8px", color: "var(--bp-gray3)" }}>{f.ago} ago</td>
              <td style={{ padding: "8px" }}><Button variant="minimal" size="small" icon="more" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- PROPERTY PANEL ---------- */
function PropertyPanel({ entity }) {
  return (
    <div style={{
      width: 320, flexShrink: 0,
      background: "var(--bp-dark-gray2)",
      borderLeft: "1px solid rgba(0,0,0,.5)",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div className="bp-row" style={{ justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: "var(--bp-gray3)", textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 600 }}>
            Properties
          </span>
          <Button variant="minimal" size="small" icon="edit" />
        </div>
        <div className="bp-row" style={{ gap: 10, marginTop: 12, alignItems: "flex-start" }}>
          <EntityIcon type={entity.type} size={36} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{entity.label}</div>
            <div className="bp-mono" style={{ fontSize: 11, color: "var(--bp-gray3)", marginTop: 2 }}>{entity.id} · {entity.type}</div>
            <div className="bp-row" style={{ marginTop: 8, gap: 4 }}>
              {entity.classification && (
                <Tag minimal style={{ background: "rgba(200,118,25,.2)", color: "var(--bp-orange4)" }} icon="lock">
                  {entity.classification}
                </Tag>
              )}
              {entity.primary && <Tag minimal intent="danger" icon="warning-sign">Primary</Tag>}
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
        <div style={{ fontSize: 11, color: "var(--bp-gray3)", textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 600, marginBottom: 6 }}>
          Attributes
        </div>
        {Object.entries(entity.props || {}).filter(([,v]) => v).map(([k, v]) => (
          <div key={k} style={{ display: "flex", gap: 8, fontSize: 12, padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
            <span style={{ width: 90, color: "var(--bp-gray3)", flexShrink: 0 }}>{k}</span>
            <span className="bp-mono" style={{ color: "var(--bp-light-gray5)", flex: 1, wordBreak: "break-word" }}>{v}</span>
          </div>
        ))}

        <div style={{ fontSize: 11, color: "var(--bp-gray3)", textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 600, marginTop: 18, marginBottom: 8 }}>
          Relations · {RELATIONS.filter(r => r.a === entity.id || r.b === entity.id).length}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {RELATIONS.filter(r => r.a === entity.id || r.b === entity.id).map((r, i) => {
            const other = r.a === entity.id ? r.b : r.a;
            const dir = r.a === entity.id ? "→" : "←";
            const otherEnt = ENTITIES.find(e => e.id === other);
            if (!otherEnt) return null;
            return (
              <div key={i} className="bp-row" style={{ gap: 8, padding: "6px 8px", borderRadius: 3, background: "rgba(255,255,255,.03)", fontSize: 12 }}>
                <span className="bp-mono" style={{ color: "var(--bp-blue5)", flexShrink: 0 }}>{dir}</span>
                <span style={{ color: "var(--bp-gray3)", flexShrink: 0 }}>{r.label}</span>
                <span className="bp-mono" style={{ color: "var(--bp-light-gray5)", flex: 1, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {otherEnt.label}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 16 }}>
          <Callout intent="warning" title="Modified by AI Assist">
            3 fields were proposed by the agent. <a href="#" style={{ color: "inherit", textDecoration: "underline" }}>Review</a>
          </Callout>
        </div>
      </div>
    </div>
  );
}

function EntityIcon({ type, size = 24 }) {
  const cfg = {
    person:       { color: "#bdadff", icon: "user",     shape: "circle" },
    organization: { color: "#fbb360", icon: "people",   shape: "square" },
    vehicle:      { color: "#72ca9b", icon: "locate",   shape: "diamond" },
    location:     { color: "#f5498b", icon: "pin",      shape: "pin" },
    event:        { color: "#8abbff", icon: "calendar", shape: "circle" },
    document:     { color: "#abb3bf", icon: "document", shape: "square" },
    device:       { color: "#13c9ba", icon: "satellite", shape: "circle" },
  }[type] || { color: "#fff", icon: "user", shape: "circle" };
  return (
    <span style={{
      width: size, height: size,
      borderRadius: cfg.shape === "circle" ? "50%" : cfg.shape === "diamond" ? 0 : 4,
      transform: cfg.shape === "diamond" ? "rotate(45deg)" : "none",
      background: cfg.color + "22",
      border: "1.5px solid " + cfg.color,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <span style={{ transform: cfg.shape === "diamond" ? "rotate(-45deg)" : "none", display: "flex" }}>
        <Icon name={cfg.icon} size={Math.round(size * 0.5)} color={cfg.color} />
      </span>
    </span>
  );
}

Object.assign(window, { WorkspaceView, ENTITIES, RELATIONS });
