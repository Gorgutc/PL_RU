// DatasetsView — dense data table with filter chips
const DATASETS_DATA = [
  { id: "ds_01", name: "supply.shipments.canonical",          rows: "1,481,221", project: "Global Logistics", owner: "S. Park",   updated: "12 min ago",  status: "healthy",  format: "parquet" },
  { id: "ds_02", name: "supply.suppliers.master",             rows: "4,812",     project: "Global Logistics", owner: "S. Park",   updated: "1 hr ago",    status: "healthy",  format: "parquet" },
  { id: "ds_03", name: "fleet.maintenance.events",            rows: "212,884",   project: "Fleet Maint.",     owner: "K. Müller", updated: "23 min ago",  status: "warning",  format: "parquet" },
  { id: "ds_04", name: "fleet.vehicle.telemetry",             rows: "84,221,402",project: "Fleet Maint.",     owner: "K. Müller", updated: "3 min ago",   status: "healthy",  format: "parquet" },
  { id: "ds_05", name: "compliance.audits.q3_2026",           rows: "2,118",     project: "Compliance",       owner: "L. Romero", updated: "yesterday",   status: "stale",    format: "csv" },
  { id: "ds_06", name: "ontology.customers.enriched",         rows: "12,481",    project: "Ontology",         owner: "A. Slade",  updated: "8 hr ago",    status: "healthy",  format: "parquet" },
  { id: "ds_07", name: "rd.experiments.runs",                 rows: "884,201",   project: "R&D",              owner: "M. Tanaka", updated: "2 hr ago",    status: "healthy",  format: "delta" },
  { id: "ds_08", name: "rd.experiments.results",              rows: "1,204,884", project: "R&D",              owner: "M. Tanaka", updated: "2 hr ago",    status: "healthy",  format: "delta" },
  { id: "ds_09", name: "supply.routes.disruption_signals",    rows: "44,221",    project: "Global Logistics", owner: "S. Park",   updated: "5 min ago",   status: "failure",  format: "parquet" },
  { id: "ds_10", name: "fleet.driver.hours_of_service",       rows: "98,221",    project: "Fleet Maint.",     owner: "K. Müller", updated: "1 hr ago",    status: "healthy",  format: "parquet" },
  { id: "ds_11", name: "compliance.policy.versions",          rows: "184",       project: "Compliance",       owner: "L. Romero", updated: "3 days ago",  status: "stale",    format: "csv" },
];

const STATUS_TAGS = {
  healthy: { intent: "success", label: "Healthy",     icon: "tick-circle" },
  warning: { intent: "warning", label: "Stale > 1d",  icon: "warning-sign" },
  stale:   { intent: "warning", label: "Stale > 1d",  icon: "warning-sign" },
  failure: { intent: "danger",  label: "Failed",      icon: "error" },
};

function DatasetsView({ onOpenDataset }) {
  const [selectedIds, setSelectedIds] = React.useState(new Set(["ds_06"]));
  const [filter, setFilter] = React.useState("");

  const toggle = (id) => {
    setSelectedIds(s => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filtered = DATASETS_DATA.filter(d =>
    !filter || d.name.toLowerCase().includes(filter.toLowerCase()) || d.project.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
      {/* Page header */}
      <div style={{ padding: "20px 24px 12px", display: "flex", alignItems: "flex-start", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "var(--bp-text-muted)", textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 600 }}>
            Workspace · All datasets
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <h1 style={{ fontSize: 22, lineHeight: "25px", fontWeight: 600, margin: 0, color: "var(--bp-text)" }}>
              Datasets
            </h1>
            <Tag minimal>{DATASETS_DATA.length} of 482</Tag>
          </div>
        </div>
        <div className="bp-row">
          <Button icon="import">Import</Button>
          <Button icon="add" intent="primary">New dataset</Button>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{
        padding: "0 24px 12px", display: "flex", alignItems: "center", gap: 8,
        borderBottom: "1px solid var(--bp-divider)",
      }}>
        <Input
          leftIcon="search"
          placeholder="Filter datasets · paths · owners"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ width: 280 }}
        />
        <Button icon="filter">Project: <strong style={{ marginLeft: 2 }}>All</strong></Button>
        <Button icon="user">Owner: Anyone</Button>
        <Button icon="calendar">Updated: 7d</Button>
        <div className="bp-grow" />
        <span className="bp-mono" style={{ fontSize: 12, color: "var(--bp-text-muted)" }}>
          {selectedIds.size} selected
        </span>
        <Button variant="minimal" icon="more" />
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead style={{ position: "sticky", top: 0, background: "var(--bp-app-bg-secondary)", zIndex: 1 }}>
            <tr style={{ borderBottom: "1px solid var(--bp-divider)", color: "var(--bp-text-muted)", textAlign: "left" }}>
              <th style={{ width: 32, padding: "6px 0 6px 24px" }}>
                <input
                  type="checkbox"
                  checked={selectedIds.size === filtered.length && filtered.length > 0}
                  onChange={() => setSelectedIds(
                    selectedIds.size === filtered.length ? new Set() : new Set(filtered.map(d => d.id))
                  )}
                />
              </th>
              <th style={{ padding: "6px 12px", fontWeight: 500 }}>
                <span className="bp-row" style={{ gap: 4 }}>
                  Name <Icon name="chevron-down" size={12} intent="muted" />
                </span>
              </th>
              <th style={{ padding: "6px 12px", fontWeight: 500 }}>Project</th>
              <th style={{ padding: "6px 12px", fontWeight: 500 }}>Owner</th>
              <th style={{ padding: "6px 12px", fontWeight: 500, textAlign: "right" }}>Rows</th>
              <th style={{ padding: "6px 12px", fontWeight: 500 }}>Status</th>
              <th style={{ padding: "6px 12px", fontWeight: 500 }}>Updated</th>
              <th style={{ padding: "6px 24px 6px 12px", width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, idx) => {
              const isSelected = selectedIds.has(d.id);
              const status = STATUS_TAGS[d.status];
              return (
                <tr
                  key={d.id}
                  onClick={() => onOpenDataset && onOpenDataset(d)}
                  style={{
                    height: 36,
                    background: isSelected ? "rgba(45,114,210,.10)" : (idx % 2 ? "transparent" : "transparent"),
                    cursor: "pointer",
                    borderBottom: "1px solid var(--bp-divider-muted)",
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "var(--bp-light-gray5)"; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                >
                  <td style={{ padding: "0 0 0 24px" }} onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={isSelected} onChange={() => toggle(d.id)} />
                  </td>
                  <td style={{ padding: "0 12px" }}>
                    <span className="bp-row" style={{ gap: 8 }}>
                      <Icon name="database" size={16} intent="muted" />
                      <span className="bp-mono" style={{ color: "var(--bp-text)" }}>{d.name}</span>
                      <Tag minimal style={{ fontSize: 10, padding: "1px 5px" }}>{d.format}</Tag>
                    </span>
                  </td>
                  <td style={{ padding: "0 12px", color: "var(--bp-text-muted)" }}>{d.project}</td>
                  <td style={{ padding: "0 12px" }}>
                    <span className="bp-row" style={{ gap: 6 }}>
                      <Avatar name={d.owner.split(" ").map(s => s[0]).join("")} size={20} />
                      <span style={{ color: "var(--bp-text)" }}>{d.owner}</span>
                    </span>
                  </td>
                  <td className="bp-mono" style={{ padding: "0 12px", textAlign: "right", color: "var(--bp-text)" }}>
                    {d.rows}
                  </td>
                  <td style={{ padding: "0 12px" }}>
                    <Tag minimal intent={status.intent} icon={status.icon}>{status.label === "Healthy" ? "Healthy" : status.label}</Tag>
                  </td>
                  <td style={{ padding: "0 12px", color: "var(--bp-text-muted)" }}>{d.updated}</td>
                  <td style={{ padding: "0 24px 0 12px" }} onClick={e => e.stopPropagation()}>
                    <Button variant="minimal" size="small" icon="more" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

Object.assign(window, { DatasetsView, DATASETS_DATA, STATUS_TAGS });
