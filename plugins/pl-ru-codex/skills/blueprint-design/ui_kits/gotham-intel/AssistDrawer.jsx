// AI Assist drawer — slides over the right side of the workspace.

function AssistDrawer({ open, onClose, onCiteEntity }) {
  const [draft, setDraft] = React.useState("");
  if (!open) return null;

  const messages = [
    { role: "system", text: "Connected to Operation Saltmarsh · 412 entities · 247 documents." },
    { role: "user",   text: "Summarise A. Pavlou's activity in April." },
    { role: "agent",  text: (
      <>
        <strong>Pavlou, A.</strong> shows three correlated patterns in <span className="bp-mono">2024-04</span>:
        <ol style={{ margin: "6px 0 0", paddingLeft: 18 }}>
          <li>Travel CY→NL on <span className="bp-mono">04-15</span>, return on <span className="bp-mono">04-21</span>.</li>
          <li>Phone log volume to <CiteChip onClick={onCiteEntity} id="P-002" label="Vasquez, K." /> increased 4× over weekly mean.</li>
          <li>A <CiteChip onClick={onCiteEntity} id="E-104" label="€1.4M wire" /> from <CiteChip onClick={onCiteEntity} id="O-014" label="Northbridge" /> to <CiteChip onClick={onCiteEntity} id="O-021" label="Saltmarsh" /> on 04-18 coincides with NL travel window.</li>
        </ol>
        <div style={{ marginTop: 8, fontSize: 11, color: "var(--bp-gray3)" }}>
          Cited from <span className="bp-mono">3 documents</span> · 2 ANPR feeds · phone CDR
        </div>
      </>
    )},
    { role: "user",   text: "Add a 'PEP' flag to Pavlou and a 'shell company' flag to Northbridge." },
    { role: "agent",  text: (
      <>
        Proposed two changes:
        <ProposedEdit entity="Pavlou, A. (P-001)" attr="flags" before="—" after="PEP · sanctions watch" />
        <ProposedEdit entity="Northbridge (O-014)" attr="flags" before="—" after="shell company indicators" />
        <div className="bp-row" style={{ gap: 6, marginTop: 8 }}>
          <Button intent="primary" size="small" icon="tick">Apply</Button>
          <Button size="small">Discard</Button>
          <Button variant="minimal" size="small">Edit</Button>
        </div>
      </>
    )},
  ];

  return (
    <div style={{
      position: "absolute", top: 0, right: 0, bottom: 0,
      width: 420,
      background: "var(--bp-dark-gray2)",
      borderLeft: "1px solid rgba(76,144,240,.4)",
      boxShadow: "-20px 0 40px -10px rgba(0,0,0,.5)",
      display: "flex", flexDirection: "column",
      zIndex: 20,
    }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        <div className="bp-row" style={{ justifyContent: "space-between" }}>
          <div className="bp-row" style={{ gap: 8 }}>
            <span style={{
              width: 26, height: 26, borderRadius: "50%",
              background: "linear-gradient(135deg, #4c90f0, #7961db)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon name="control" size={14} color="#fff" />
            </span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Gotham Assist</div>
              <div className="bp-mono" style={{ fontSize: 10, color: "var(--bp-gray3)" }}>
                claude-haiku · context: OP-2024-0142
              </div>
            </div>
          </div>
          <Button variant="minimal" size="small" icon="cross" onClick={onClose} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
        {messages.map((m, i) => <ChatBubble key={i} role={m.role} text={m.text} />)}
      </div>

      <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,.08)" }}>
        <div className="bp-row" style={{ gap: 6, marginBottom: 8 }}>
          <Tag minimal intent="primary" icon="user" style={{ cursor: "pointer" }}>Pavlou</Tag>
          <Tag minimal intent="primary" icon="people" style={{ cursor: "pointer" }}>Northbridge</Tag>
          <Tag minimal style={{ cursor: "pointer" }}>+ Add context</Tag>
        </div>
        <div style={{ position: "relative" }}>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Ask Gotham Assist…"
            rows={2}
            style={{
              width: "100%",
              background: "rgba(0,0,0,.3)",
              border: "1px solid rgba(255,255,255,.15)",
              borderRadius: 4,
              color: "var(--bp-light-gray5)",
              fontFamily: "var(--bp-font-sans)",
              fontSize: 13,
              padding: "8px 40px 8px 10px",
              resize: "none",
              outline: "none",
              lineHeight: 1.4,
            }}
          />
          <button style={{
            position: "absolute", right: 6, bottom: 6,
            width: 30, height: 30,
            background: "var(--bp-blue3)",
            color: "#fff", border: "none",
            borderRadius: 3, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="chevron-right" size={16} color="#fff" />
          </button>
        </div>
        <div className="bp-mono" style={{ marginTop: 6, fontSize: 10, color: "var(--bp-gray3)" }}>
          ⌘↵ to send · responses are advisory · audit log: 482 entries
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ role, text }) {
  if (role === "system") {
    return (
      <div className="bp-mono" style={{ fontSize: 11, color: "var(--bp-gray3)", textAlign: "center", margin: "6px 0 14px" }}>
        — {text} —
      </div>
    );
  }
  const isUser = role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 12 }}>
      <div style={{
        maxWidth: "88%",
        background: isUser ? "rgba(76,144,240,.15)" : "rgba(255,255,255,.04)",
        border: "1px solid " + (isUser ? "rgba(76,144,240,.3)" : "rgba(255,255,255,.08)"),
        borderRadius: 6,
        padding: "8px 12px",
        fontSize: 13,
        lineHeight: 1.45,
        color: "var(--bp-light-gray5)",
      }}>
        {!isUser && (
          <div className="bp-mono" style={{ fontSize: 10, color: "var(--bp-gray3)", marginBottom: 4 }}>Assist</div>
        )}
        <div>{text}</div>
      </div>
    </div>
  );
}

function CiteChip({ id, label, onClick }) {
  return (
    <span
      onClick={() => onClick && onClick(id)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        background: "rgba(76,144,240,.2)",
        color: "var(--bp-blue5)",
        padding: "1px 6px",
        borderRadius: 3,
        fontSize: 12,
        cursor: "pointer",
        margin: "0 2px",
        border: "1px solid rgba(76,144,240,.3)",
      }}
      className="bp-mono"
    >
      {label} <span style={{ opacity: 0.6, fontSize: 10 }}>· {id}</span>
    </span>
  );
}

function ProposedEdit({ entity, attr, before, after }) {
  return (
    <div style={{
      marginTop: 8,
      background: "rgba(0,0,0,.3)",
      border: "1px solid rgba(255,255,255,.1)",
      borderRadius: 4,
      padding: "8px 10px",
      fontSize: 12,
    }}>
      <div className="bp-mono" style={{ fontSize: 10, color: "var(--bp-gray3)" }}>{entity}</div>
      <div className="bp-row" style={{ marginTop: 4, gap: 6, alignItems: "center" }}>
        <span style={{ color: "var(--bp-gray3)", width: 50 }}>{attr}</span>
        <span className="bp-mono" style={{ color: "var(--bp-red4)", textDecoration: "line-through", background: "rgba(205,66,70,.1)", padding: "1px 6px", borderRadius: 2 }}>
          {before}
        </span>
        <Icon name="chevron-right" size={12} color="var(--bp-gray3)" />
        <span className="bp-mono" style={{ color: "var(--bp-green4)", background: "rgba(35,133,81,.1)", padding: "1px 6px", borderRadius: 2 }}>
          {after}
        </span>
      </div>
    </div>
  );
}

Object.assign(window, { AssistDrawer });
