// App — top-level shell + page router
function App() {
  const [route, setRoute] = React.useState("login");        // login | console
  const [activeNav, setActiveNav] = React.useState("datasets");
  const [activeSection, setActiveSection] = React.useState("all");
  const [openDataset, setOpenDataset] = React.useState(null);
  const [runDialogOpen, setRunDialogOpen] = React.useState(false);

  if (route === "login") {
    return <LoginView onSignIn={() => setRoute("console")} />;
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Navbar
        active={activeNav}
        onNav={setActiveNav}
        onSignOut={() => setRoute("login")}
      />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <Sidebar
          activeSection={activeSection}
          onPick={(id) => {
            setActiveSection(id);
            setOpenDataset(null);
          }}
        />
        {openDataset
          ? <DatasetDetailView
              dataset={openDataset}
              onBack={() => setOpenDataset(null)}
              onRunPipeline={() => setRunDialogOpen(true)}
            />
          : <DatasetsView onOpenDataset={setOpenDataset} />
        }
      </div>
      <RunDialog
        open={runDialogOpen}
        dataset={openDataset}
        onClose={() => setRunDialogOpen(false)}
        onConfirm={() => setRunDialogOpen(false)}
      />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
