// App — top-level Gotham shell + router.

function App() {
  const [route, setRoute]               = React.useState("login");      // login | cases | workspace
  const [workspaceTab, setWorkspaceTab] = React.useState("map");
  const [selectedEntity, setSelected]   = React.useState("P-001");
  const [assistOpen, setAssistOpen]     = React.useState(false);

  if (route === "login") {
    return <LoginView onSignIn={() => setRoute("cases")} />;
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--bp-dark-gray1)" }} className="bp-dark">
      <ClassifiedBanner level="UNCLASSIFIED // FOR OFFICIAL USE ONLY" intent="warning" />

      {route === "workspace" ? (
        <TopBar
          caseId="OP-2024-0142"
          caseName="Operation Saltmarsh"
          active={workspaceTab}
          onNav={(id) => {
            if (id === "cases") setRoute("cases");
            else setWorkspaceTab(id);
          }}
          onSignOut={() => setRoute("login")}
          onToggleAssist={() => setAssistOpen(o => !o)}
          assistOpen={assistOpen}
          alertCount={3}
        />
      ) : (
        <CasesTopBar onSignOut={() => setRoute("login")} />
      )}

      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {route === "cases"
          ? <CasesView onOpenCase={() => setRoute("workspace")} />
          : <WorkspaceView
              tab={workspaceTab}
              onChangeTab={setWorkspaceTab}
              selectedId={selectedEntity}
              setSelectedId={setSelected}
            />
        }
        {route === "workspace" && (
          <AssistDrawer
            open={assistOpen}
            onClose={() => setAssistOpen(false)}
            onCiteEntity={(id) => setSelected(id)}
          />
        )}
      </div>

      <ClassifiedBanner level="UNCLASSIFIED // FOR OFFICIAL USE ONLY" intent="warning" />
    </div>
  );
}

function CasesTopBar({ onSignOut }) {
  return (
    <div style={{
      height: 50,
      background: "var(--bp-dark-gray2)",
      display: "flex",
      alignItems: "center",
      padding: "0 14px",
      gap: 12,
      borderBottom: "1px solid rgba(0,0,0,.5)",
      flexShrink: 0,
    }}>
      <div className="bp-row" style={{ gap: 8 }}>
        <img src="../../assets/palantir.svg" style={{ width: 18, height: 23, filter: "brightness(1.2)" }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--bp-light-gray5)", letterSpacing: ".04em" }}>GOTHAM</span>
      </div>
      <div style={{ width: 1, height: 24, background: "rgba(255,255,255,.12)" }} />
      <nav style={{ display: "flex", gap: 2 }}>
        <button className="bp-btn bp-btn-minimal" style={{ background: "rgba(76,144,240,.2)", color: "var(--bp-blue5)", fontWeight: 600 }}>
          Cases
        </button>
        <button className="bp-btn bp-btn-minimal">People</button>
        <button className="bp-btn bp-btn-minimal">Ingest</button>
        <button className="bp-btn bp-btn-minimal">Admin</button>
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
        <span style={{ fontSize: 13, color: "var(--bp-gray3)", flex: 1 }}>Search Gotham</span>
        <span className="bp-mono" style={{
          fontSize: 10, color: "var(--bp-gray3)",
          background: "rgba(255,255,255,.06)", padding: "2px 5px", borderRadius: 3,
          border: "1px solid rgba(255,255,255,.1)",
        }}>/</span>
      </div>
      <button className="bp-btn bp-btn-minimal"><Icon name="notifications" size={18} /></button>
      <button className="bp-btn bp-btn-minimal" onClick={onSignOut} style={{ padding: 4 }}>
        <Avatar name="MK" size={26} hue={4} />
      </button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
