// Login — Split-panel auth screen with branding sidebar visible on desktop
import React, { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../Backend/services/firebase";

const FEATURES = [
  ["🎯", "Daily coding questions by topic & company"],
  ["▶",  "Run code in 5+ languages — free"],
  ["🤖", "AI-powered answer evaluation"],
  ["📅", "GitHub-style streak calendar"],
  ["📰", "Daily tech news from top sources"],
];

function Login({ setDemoMode }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (isSignUp) await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(getFriendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const getFriendlyError = (code) => ({
    "auth/user-not-found":       "No account with this email.",
    "auth/wrong-password":       "Incorrect password.",
    "auth/email-already-in-use": "Email already registered.",
    "auth/weak-password":        "Password must be 6+ characters.",
    "auth/invalid-email":        "Invalid email address.",
    "auth/invalid-credential":   "Invalid email or password.",
    "auth/too-many-requests":    "Too many attempts. Try later.",
  }[code] || "Something went wrong.");

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)" }}>

      {/* ── Left panel — branding (visible on md+ screens via CSS class) ── */}
      <div
        className="login-left"
        style={{
          flex: 1,
          background: "var(--nav-bg)",
          borderRight: "1px solid var(--border)",
          padding: "60px 48px",
          flexDirection: "column",
          justifyContent: "center",
          gap: "0",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "48px" }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "12px",
            background: "var(--orange)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "20px", fontWeight: 900, color: "#1a1a1a",
            boxShadow: "0 4px 14px rgba(255, 161, 22, 0.4)",
          }}>
            P
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-1)" }}>
              PrepFlow <span style={{ color: "var(--orange)" }}>AI</span>
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "1px" }}>
              Your daily interview prep companion
            </div>
          </div>
        </div>

        {/* Headline */}
        <h2 style={{ fontSize: "30px", fontWeight: 800, color: "var(--text-1)", lineHeight: 1.3, marginBottom: "12px", letterSpacing: "-0.5px" }}>
          Crack your next<br />
          <span style={{ color: "var(--orange)" }}>coding interview</span>
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-3)", lineHeight: 1.7, marginBottom: "36px", maxWidth: "320px" }}>
          A focused, daily-driver platform for placement preparation — AI questions, instant feedback, and a streak system to keep you consistent.
        </p>

        {/* Feature list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {FEATURES.map(([icon, text]) => (
            <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "7px", flexShrink: 0,
                background: "var(--orange-muted)", border: "1px solid var(--orange-border)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px",
              }}>
                {icon}
              </div>
              <span style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.6, paddingTop: "4px" }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div style={{ marginTop: "48px", padding: "16px 18px", borderRadius: "10px", background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
          <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.65, fontStyle: "italic" }}>
            "PrepFlow helped me stay consistent with daily practice — I solved 60 questions before my Google interview."
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "8px" }}>— Placement season 2025</p>
        </div>
      </div>

      {/* ── Right panel — auth form ── */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}>
        <div style={{ width: "100%", maxWidth: "390px" }}>

          {/* Logo (mobile only — shown when left panel is hidden) */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "9px",
                background: "var(--orange)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "17px", fontWeight: 900, color: "#1a1a1a",
                boxShadow: "0 3px 10px rgba(255, 161, 22, 0.35)",
              }}>P</div>
              <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-1)" }}>
                PrepFlow <span style={{ color: "var(--orange)" }}>AI</span>
              </span>
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-1)", marginBottom: "5px" }}>
              {isSignUp ? "Create your account" : "Welcome back"}
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-3)" }}>
              {isSignUp
                ? "Join thousands preparing for placements"
                : "Continue your coding prep journey"}
            </p>
          </div>

          {/* Auth form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: "6px" }}>
                Email address
              </label>
              <input
                className="auth-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: "6px" }}>
                Password
              </label>
              <input
                className="auth-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isSignUp ? "new-password" : "current-password"}
              />
            </div>

            {error && (
              <div style={{
                fontSize: "12px", color: "var(--red)",
                padding: "10px 13px", borderRadius: "7px",
                background: "var(--red-muted)", border: "1px solid rgba(239,71,67,0.25)",
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              className="btn btn-orange"
              type="submit"
              disabled={loading}
              style={{ width: "100%", justifyContent: "center", padding: "11px 16px", fontSize: "14px", marginTop: "4px" }}
            >
              {loading
                ? (isSignUp ? "Creating account..." : "Signing in...")
                : (isSignUp ? "Create account" : "Sign in")}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "18px", fontSize: "13px", color: "var(--text-3)" }}>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
              style={{
                background: "none", border: "none", color: "var(--orange)",
                fontWeight: 700, cursor: "pointer", fontSize: "13px",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {isSignUp ? "Sign in" : "Sign up free"}
            </button>
          </p>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "18px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            <span style={{ fontSize: "11px", color: "var(--text-3)" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          </div>

          {/* Demo mode */}
          <button
            onClick={() => setDemoMode(true)}
            style={{
              width: "100%", padding: "11px",
              borderRadius: "7px",
              border: "1px dashed var(--border-strong)",
              background: "transparent",
              color: "var(--text-2)",
              fontSize: "13px", fontWeight: 500,
              cursor: "pointer", fontFamily: "Inter, sans-serif",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-card)";
              e.currentTarget.style.borderColor = "var(--orange-border)";
              e.currentTarget.style.color = "var(--orange)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "var(--border-strong)";
              e.currentTarget.style.color = "var(--text-2)";
            }}
          >
            🎮 Try demo — no account needed
          </button>

        </div>
      </div>
    </div>
  );
}

export default Login;
