// DatasetDetailView — header + tabs + lineage graph + properties side panel
function DatasetDetailView({ dataset, onBack, onRunPipeline }) {
  const [activeTab, setActiveTab] = React.useState("lineage");
  const d = dataset || {
    name: "ontology.customers.enriched",
    project: "Ontology",
    rows: "12,481",
    owner: "A. Slade",
    updated: "8 hr ago",
    status: "healthy",
    format: "parquet",
    id: "ds_06",
  };

  const tabs = [
    { id: "preview",  label: "Preview",   icon: "th" },
    { id: "schema",   label: "Schema",    icon: "properties", count: 28 },
    { id: "lineage",  label: "Lineage",   icon: "data-lineage" },
    { id: "history",  label: "History",   icon: "timeline-events" },
    { id: "code",     label: "Code",      icon: "code" },
    { id: "perms",    label: "Permissions", icon: "lock" },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
      {/* Breadcrumbs + header */}
      <div style={{ padding: "16px 24px 0" }}>
        <div className="bp-row" style={{ gap: 4, fontSize: 12, color: "var(--bp-text-muted)" }}>
          <a onClick={onBack} style={{ color: "var(--bp-link)", textDecoration: "none", cursor: "pointer" }}>Datasets</a>
          <Icon name="chevron-right" size={12} intent="muted" />
          <span>{d.project}</span>
          <Icon name="chevron-right" size={12} intent="muted" />
          <span style={{ color: "var(--bp-text)" }} className="bp-mono">{d.name}</span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginTop: 12 }}>
          <Icon name="database" size={20} style={{ background: "var(--bp-blue3)", marginTop: 4 }} />
          <div style={{ flex: 1 }}>
            <h1 className="bp-mono" style={{ fontSize: 22, lineHeight: "25px", fontWeight: 600, margin: 0, color: "var(--bp-text)" }}>
              {d.name}
            </h1>
            <div className="bp-row" style={{ marginTop: 6, gap: 8 }}>
              <Tag minimal intent="success" icon="tick-circle">Healthy</Tag>
              <Tag minimal>{d.format}</Tag>
              <Tag minimal>{d.rows} rows</Tag>
              <span style={{ fontSize: 12, color: "var(--bp-text-muted)" }}>
                · Updated {d.updated} by <span style={{ color: "var(--bp-text)" }}>{d.owner}</span>
              </span>
            </div>
          </div>
          <div className="bp-row" style={{ gap: 8 }}>
            <Button icon="star-empty">Star</Button>
            <Button icon="share">Share</Button>
            <Button icon="play" intent="primary" onClick={onRunPipeline}>Run pipeline</Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 0, padding: "12px 24px 0",
        borderBottom: "1px solid var(--bp-divider)",
      }}>
        {tabs.map(t => {
          const active = t.id === activeTab;
          return (
            <div
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "8px 12px",
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                color: active ? "var(--bp-blue3)" : "var(--bp-text)",
                borderBottom: `3px solid ${active ? "var(--bp-blue3)" : "transparent"}`,
                marginBottom: -1,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {t.label}
              {t.count != null && (
                <span style={{
                  background: active ? "rgba(45,114,210,.15)" : "rgba(95,107,124,.15)",
                  color: active ? "var(--bp-blue2)" : "var(--bp-text-muted)",
                  fontSize: 11, padding: "1px 5px", borderRadius: 8, fontWeight: 500,
                }}>{t.count}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Content area: lineage view + properties side */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Lineage canvas */}
        <div style={{
          flex: 1, padding: 24, overflow: "auto",
          background: "var(--bp-light-gray5)",
          backgroundImage: "radial-gradient(circle, rgba(95,107,124,.15) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}>
          <LineageGraph datasetName={d.name} />
        </div>

        {/* Side panel */}
        <div style={{
          width: 320, flexShrink: 0, padding: 20,
          borderLeft: "1px solid var(--bp-divider)",
          background: "var(--bp-app-bg-secondary)",
          overflowY: "auto",
        }}>
          <div style={{ fontSize: 11, color: "var(--bp-text-muted)", textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 600, marginBottom: 8 }}>
            Properties
          </div>
          <PropRow k="dataset_id" v={d.id} mono />
          <PropRow k="storage" v="s3://foundry-prod-eu/ontology/" mono />
          <PropRow k="partitions" v="date / region" />
          <PropRow k="rows" v={d.rows} mono />
          <PropRow k="columns" v="28" mono />
          <PropRow k="size" v="142 GB" mono />
          <PropRow k="schema_version" v="v3.2" mono />

          <div style={{ fontSize: 11, color: "var(--bp-text-muted)", textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 600, marginTop: 18, marginBottom: 8 }}>
            Owners
          </div>
          <div className="bp-row" style={{ gap: 6, marginBottom: 6 }}>
            <Avatar name="AS" size={20} hue={0} />
            <span style={{ fontSize: 13 }}>A. Slade</span>
            <Tag minimal style={{ fontSize: 10, padding: "1px 5px" }}>owner</Tag>
          </div>
          <div className="bp-row" style={{ gap: 6, marginBottom: 16 }}>
            <Avatar name="LR" size={20} hue={2} />
            <span style={{ fontSize: 13 }}>L. Romero</span>
            <Tag minimal style={{ fontSize: 10, padding: "1px 5px" }}>editor</Tag>
          </div>

          <Callout intent="warning" title="Schema change in v3.3">
            Two new columns added; one renamed. <a href="#" style={{ color: "inherit", textDecoration: "underline" }}>View diff</a>
          </Callout>
        </div>
      </div>
    </div>
  );
}

function PropRow({ k, v, mono }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4, fontSize: 13 }}>
      <span style={{ width: 110, color: "var(--bp-text-muted)", flexShrink: 0 }}>{k}</span>
      <span className={mono ? "bp-mono" : ""} style={{ color: "var(--bp-text)", wordBreak: "break-all" }}>{v}</span>
    </div>
  );
}

function LineageGraph({ datasetName }) {
  // Simple static SVG lineage graph
  return (
    <div style={{ minWidth: 700 }}>
      <div style={{ fontSize: 11, color: "var(--bp-text-muted)", textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 600, marginBottom: 12 }}>
        Lineage · 3 inputs → 2 downstream
      </div>
      <svg width="100%" viewBox="0 0 760 360" style={{ display: "block" }}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#8f99a8" />
          </marker>
        </defs>
        {/* Lines */}
        <path d="M 160 80  C 260 80, 280 180, 360 180" stroke="#8f99a8" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
        <path d="M 160 180 C 260 180, 280 180, 360 180" stroke="#8f99a8" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
        <path d="M 160 280 C 260 280, 280 180, 360 180" stroke="#8f99a8" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
        <path d="M 540 180 C 580 180, 600 100, 660 100" stroke="#8f99a8" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
        <path d="M 540 180 C 580 180, 600 260, 660 260" stroke="#8f99a8" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />

        {/* Upstream nodes */}
        <LineageNode x={20}  y={56}  title="customers.raw"        sub="parquet · 18M rows" />
        <LineageNode x={20}  y={156} title="orders.canonical"     sub="parquet · 142M rows" />
        <LineageNode x={20}  y={256} title="addresses.geocoded"   sub="parquet · 9M rows" />

        {/* Current */}
        <LineageNode x={360} y={156} title={datasetName} sub="parquet · 12,481 rows" current />

        {/* Downstream */}
        <LineageNode x={660} y={76}  title="dashboard.customer_360" sub="workshop · daily" />
        <LineageNode x={660} y={236} title="model.churn_v4"          sub="modeling · weekly" />
      </svg>
    </div>
  );
}

function LineageNode({ x, y, title, sub, current }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect
        x="0" y="0" width="180" height="50" rx="4"
        fill={current ? "#fff" : "#fff"}
        stroke={current ? "#2d72d2" : "rgba(17,20,24,.15)"}
        strokeWidth={current ? "2" : "1"}
      />
      <rect x="0" y="0" width="4" height="50" rx="2" fill={current ? "#2d72d2" : "#5f6b7c"} />
      <text x="14" y="20" fontFamily="ui-monospace, Menlo, monospace" fontSize="11.5" fontWeight="600" fill="#1c2127">
        {title.length > 28 ? title.slice(0, 26) + "…" : title}
      </text>
      <text x="14" y="36" fontFamily="ui-monospace, Menlo, monospace" fontSize="10.5" fill="#5f6b7c">{sub}</text>
    </g>
  );
}

Object.assign(window, { DatasetDetailView });
