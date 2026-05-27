// Sidebar — dark surface, project tree
function Sidebar({ activeSection = "all", onPick }) {
  const sections = [
    {
      title: "Workspace",
      items: [
        { id: "all", icon: "database", label: "All datasets", count: 482 },
        { id: "recent", icon: "refresh", label: "Recent", count: 24 },
        { id: "starred", icon: "star-empty", label: "Starred", count: 12 },
        { id: "shared", icon: "share", label: "Shared with me", count: 38 },
      ],
    },
    {
      title: "Projects",
      items: [
        { id: "logistics", icon: "folder-close", label: "Global Logistics" },
        { id: "supply", icon: "folder-close", label: "Supply Network" },
        { id: "fleet", icon: "folder-close", label: "Fleet Maintenance" },
        { id: "compliance", icon: "folder-close", label: "Compliance · Q3" },
        { id: "rd", icon: "folder-close", label: "R&D · Sandbox" },
      ],
    },
    {
      title: "Pipelines",
      items: [
        { id: "ingest", icon: "import", label: "Ingest" },
        { id: "transform", icon: "data-lineage", label: "Transform" },
        { id: "publish", icon: "export", label: "Publish" },
      ],
    },
  ];

  return (
    <div
      className="bp-dark"
      style={{
        width: 248,
        background: "var(--bp-dark-gray2)",
        color: "var(--bp-light-gray5)",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(0,0,0,.4)",
        overflowY: "auto",
      }}
    >
      <div style={{ padding: "16px 12px 8px" }}>
        <Button fill icon="add" intent="primary">
          New dataset
        </Button>
      </div>
      <div style={{ padding: "4px 12px 12px", flex: 1 }}>
        {sections.map((section, sIdx) => (
          <div key={sIdx} style={{ marginTop: sIdx === 0 ? 4 : 16 }}>
            <div
              style={{
                fontSize: 11,
                color: "var(--bp-gray3)",
                textTransform: "uppercase",
                letterSpacing: ".06em",
                fontWeight: 600,
                padding: "6px 8px 4px",
              }}
            >
              {section.title}
            </div>
            {section.items.map(item => {
              const isActive = item.id === activeSection;
              return (
                <div
                  key={item.id}
                  onClick={() => onPick && onPick(item.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 8px",
                    borderRadius: 4,
                    fontSize: 13,
                    cursor: "pointer",
                    background: isActive ? "rgba(76,144,240,.2)" : "transparent",
                    color: isActive ? "var(--bp-blue5)" : "var(--bp-light-gray5)",
                  }}
                >
                  <Icon
                    name={item.icon}
                    size={16}
                    color={isActive ? "var(--bp-blue5)" : "var(--bp-gray4)"}
                  />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.count != null && (
                    <span className="bp-mono" style={{
                      fontSize: 11,
                      color: "var(--bp-gray3)",
                    }}>
                      {item.count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div
        style={{
          padding: "10px 12px",
          borderTop: "1px solid rgba(0,0,0,.4)",
          fontSize: 11,
          color: "var(--bp-gray3)",
        }}
        className="bp-mono"
      >
        v3.2 · build 9c2e1a
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar });
