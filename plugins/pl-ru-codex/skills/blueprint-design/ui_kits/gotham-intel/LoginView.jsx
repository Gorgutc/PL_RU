// Sign-in screen — dark, classified-banner top, MFA-style password + token

function LoginView({ onSignIn }) {
  const [user, setUser] = React.useState("m.kalinski");
  const [pass, setPass] = React.useState("••••••••••••");
  const [token, setToken] = React.useState("");

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--bp-black)" }}>
      <ClassifiedBanner level="UNCLASSIFIED // FOR OFFICIAL USE ONLY" intent="warning" />

      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* topo-style background */}
        <svg
          aria-hidden
          width="100%" height="100%"
          style={{ position: "absolute", inset: 0, opacity: 0.12 }}
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 1200 800"
        >
          <defs>
            <radialGradient id="topoFade">
              <stop offset="0%" stopColor="#000" stopOpacity="0" />
              <stop offset="70%" stopColor="#000" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#000" stopOpacity="1" />
            </radialGradient>
          </defs>
          <g stroke="#4c90f0" strokeWidth="0.6" fill="none">
            {Array.from({length: 20}).map((_, i) => (
              <ellipse key={i} cx="600" cy="400" rx={60 + i*60} ry={40 + i*40} />
            ))}
          </g>
          <rect width="100%" height="100%" fill="url(#topoFade)" />
        </svg>

        <div className="bp-dark" style={{
          background: "var(--bp-dark-gray2)",
          borderRadius: 6,
          width: 380,
          padding: 32,
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,.15), 0 25px 50px -12px rgba(0,0,0,.7)",
          position: "relative",
          zIndex: 1,
        }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, marginBottom: 24 }}>
            <img src="../../assets/palantir.svg" style={{ width: 42, height: 54, filter: "brightness(1.2)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 600, color: "#fff", letterSpacing: ".08em" }}>GOTHAM</div>
              <div className="bp-mono" style={{ fontSize: 11, color: "var(--bp-gray4)", marginTop: 4, letterSpacing: ".08em" }}>
                INTELLIGENCE PLATFORM · v9.4
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 12, color: "var(--bp-gray4)" }}>User ID</span>
              <Input large leftIcon="user" value={user} onChange={e => setUser(e.target.value)} fill />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 12, color: "var(--bp-gray4)" }}>Password</span>
              <Input large leftIcon="lock" type="password" value={pass} onChange={e => setPass(e.target.value)} fill />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 12, color: "var(--bp-gray4)" }}>Token (6 digits)</span>
              <Input
                large
                leftIcon="key"
                value={token}
                onChange={e => setToken(e.target.value.replace(/\D/g, "").slice(0,6))}
                placeholder="000000"
                fill
                style={{ fontFamily: "var(--bp-font-mono)", letterSpacing: "0.4em" }}
              />
            </label>
            <Button intent="primary" size="large" fill onClick={onSignIn}>
              Sign in
            </Button>
          </div>

          <div className="bp-mono" style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: "1px solid rgba(255,255,255,.1)",
            fontSize: 10,
            color: "var(--bp-gray3)",
            lineHeight: 1.5,
          }}>
            By signing in you agree to access controls under Title 18 §1030.<br/>
            All actions are logged and audited.
          </div>
        </div>
      </div>

      <ClassifiedBanner level="UNCLASSIFIED // FOR OFFICIAL USE ONLY" intent="warning" />
    </div>
  );
}

Object.assign(window, { LoginView });
