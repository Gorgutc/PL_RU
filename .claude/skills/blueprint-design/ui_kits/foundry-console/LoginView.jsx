// Login view — dark full-screen with single dialog
function LoginView({ onSignIn }) {
  const [user, setUser] = React.useState("aslade@example.com");
  const [pass, setPass] = React.useState("••••••••");

  return (
    <div
      style={{
        minHeight: "100%",
        background: "var(--bp-black)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle blueprint grid background */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(76,144,240,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(76,144,240,.04) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
        }}
      />

      <div
        className="bp-dark"
        style={{
          background: "var(--bp-dark-gray2)",
          borderRadius: 6,
          width: 380,
          padding: 32,
          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,.2), 0 25px 50px -12px rgba(0,0,0,.6)",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <img src="../../assets/blueprint-hero.png" style={{ width: 56, height: 56, borderRadius: 8 }} />
          <div style={{ fontSize: 20, fontWeight: 600, color: "#fff" }}>Sign in to Foundry</div>
          <div style={{ fontSize: 13, color: "var(--bp-gray4)" }}>Palantir Technologies · production</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 12, color: "var(--bp-gray4)" }}>Work email</span>
            <Input
              large
              leftIcon="user"
              value={user}
              onChange={e => setUser(e.target.value)}
              fill
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 12, color: "var(--bp-gray4)" }}>Password</span>
            <Input
              large
              leftIcon="lock"
              type="password"
              value={pass}
              onChange={e => setPass(e.target.value)}
              fill
            />
          </label>
          <Button intent="primary" size="large" fill onClick={onSignIn}>
            Sign in
          </Button>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 4 }}>
            <a href="#" style={{ color: "var(--bp-blue5)", textDecoration: "none" }}>Forgot password</a>
            <a href="#" style={{ color: "var(--bp-blue5)", textDecoration: "none" }}>Use SSO instead</a>
          </div>
        </div>
      </div>

      <div
        className="bp-mono"
        style={{
          position: "absolute",
          bottom: 16,
          fontSize: 11,
          color: "var(--bp-gray2)",
        }}
      >
        © 2014–{new Date().getFullYear()} Palantir Technologies · Apache 2.0
      </div>
    </div>
  );
}

Object.assign(window, { LoginView });
