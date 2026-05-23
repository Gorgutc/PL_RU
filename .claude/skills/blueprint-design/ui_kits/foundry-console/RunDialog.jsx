// RunDialog — modal for running a pipeline
function RunDialog({ open, dataset, onClose, onConfirm }) {
  const [env, setEnv] = React.useState("staging");
  const [notify, setNotify] = React.useState(true);
  const [concurrency, setConcurrency] = React.useState(12);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(17,20,24,.5)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 6,
          width: 520,
          boxShadow: "0 0 0 1px rgba(17,20,24,.1), 0 20px 25px -5px rgba(0,0,0,.2), 0 10px 15px -3px rgba(0,0,0,.1)",
          overflow: "hidden",
        }}
      >
        <div style={{
          padding: "14px 20px",
          borderBottom: "1px solid var(--bp-divider)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <Icon name="play" size={16} intent="primary" />
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--bp-text)", flex: 1 }}>
            Run pipeline
          </div>
          <Button variant="minimal" size="small" icon="cross" onClick={onClose} />
        </div>

        <div style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--bp-text)" }}>
            Rebuild <code className="bp-mono" style={{
              background: "rgba(255,255,255,.7)", padding: "1px 5px", borderRadius: 3,
              boxShadow: "inset 0 0 0 1px rgba(17,20,24,.2)", color: "var(--bp-text-muted)", fontSize: 12,
            }}>{dataset?.name || "ontology.customers.enriched"}</code> and all downstream dependencies.
          </div>

          <Callout intent="primary" title="3 downstream artifacts will be rebuilt">
            <span className="bp-mono" style={{ fontSize: 12 }}>dashboard.customer_360</span>,
            <span className="bp-mono" style={{ fontSize: 12 }}> model.churn_v4</span>,
            and 1 other. Estimated 14 minutes.
          </Callout>

          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 12, color: "var(--bp-text-muted)" }}>Environment</span>
              <div style={{
                display: "inline-flex", background: "var(--bp-light-gray4)", borderRadius: 4, padding: 2,
                boxShadow: "inset 0 0 0 1px rgba(17,20,24,.1)", alignSelf: "flex-start",
              }}>
                {["staging", "preprod", "production"].map(e => (
                  <button
                    key={e}
                    onClick={() => setEnv(e)}
                    className="bp-mono"
                    style={{
                      border: "none",
                      background: env === e ? "#fff" : "transparent",
                      color: env === e ? "var(--bp-text)" : "var(--bp-text-muted)",
                      fontFamily: "var(--bp-font-mono)",
                      fontSize: 12,
                      padding: "5px 12px",
                      borderRadius: 3,
                      boxShadow: env === e ? "0 0 0 1px rgba(17,20,24,.1), 0 1px 2px 0 rgba(0,0,0,.1)" : "none",
                      cursor: "pointer",
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 12, color: "var(--bp-text-muted)" }}>Concurrency</span>
              <input
                className="bp-input bp-mono"
                type="number"
                value={concurrency}
                onChange={e => setConcurrency(+e.target.value)}
                style={{ width: 100 }}
              />
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
              <span
                onClick={() => setNotify(!notify)}
                style={{
                  width: 16, height: 16,
                  background: notify ? "var(--bp-blue3)" : "#fff",
                  border: "none",
                  borderRadius: 3,
                  boxShadow: "inset 0 0 0 1px rgba(17,20,24,.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 11, lineHeight: 1,
                }}
              >{notify ? "✓" : ""}</span>
              Notify owners on failure
            </label>
          </div>
        </div>

        <div style={{
          padding: "12px 20px",
          background: "var(--bp-light-gray5)",
          borderTop: "1px solid var(--bp-divider)",
          display: "flex", justifyContent: "flex-end", gap: 8,
        }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button intent="primary" icon="play" onClick={onConfirm}>Run on {env}</Button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { RunDialog });
