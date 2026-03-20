// Login Page — LeetCode-inspired clean login
import React, { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";

function Login({ setDemoMode }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      if (isSignUp) await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(getFriendlyError(err.code));
    } finally { setLoading(false); }
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
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: "var(--bg)",
    }}>
      {/* Left panel — branding */}
      <div style={{
        flex: 1,
        display: "none",
        background: "#111111",
        borderRight: "1px solid var(--border)",
        padding: "60px 48px",
        flexDirection: "column",
        justifyContent: "center",
        "@media(minWidth:768px)": { display: "flex" },
      }}>
        {/* Shown only on wider screens via inline */}
      </div>

      {/* Right panel — auth form */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}>
        <div style={{ width: "100%", maxWidth: "380px" }}>

          {/* Logo */}
          <div style={{ marginBottom: "36px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "9px",
                background: "var(--orange)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "17px", fontWeight: 900, color: "#1a1a1a",
              }}>P</div>
              <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-1)" }}>
                PrepFlow <span style={{ color: "var(--orange)" }}>AI</span>
              </span>
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-1)", marginBottom: "5px" }}>
              {isSignUp ? "Create an account" : "Welcome back"}
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-3)" }}>
              {isSignUp ? "Join thousands of students preparing for placements" : "Continue your coding preparation journey"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: "6px" }}>Email address</label>
              <input
                className="auth-input"
                type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                required autoComplete="email"
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: "6px" }}>Password</label>
              <input
                className="auth-input"
                type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                required autoComplete={isSignUp ? "new-password" : "current-password"}
              />
            </div>

            {error && (
              <div style={{ fontSize: "12px", color: "var(--red)", padding: "10px 13px", borderRadius: "6px", background: "var(--red-muted)", border: "1px solid rgba(239,71,67,0.25)" }}>
                ⚠️ {error}
              </div>
            )}

            <button
              className="btn btn-orange"
              type="submit" disabled={loading}
              style={{ width: "100%", justifyContent: "center", padding: "10px 16px", fontSize: "14px", marginTop: "4px" }}
            >
              {loading
                ? (isSignUp ? "Creating account..." : "Signing in...")
                : (isSignUp ? "Create account" : "Sign in")}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "var(--text-3)" }}>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
              style={{ background: "none", border: "none", color: "var(--orange)", fontWeight: 700, cursor: "pointer", fontSize: "13px", fontFamily: "Inter, sans-serif" }}
            >
              {isSignUp ? "Sign in" : "Sign up free"}
            </button>
          </p>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            <span style={{ fontSize: "11px", color: "var(--text-3)" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          </div>

          {/* Demo */}
          <button
            onClick={() => setDemoMode(true)}
            style={{
              width: "100%", padding: "10px",
              borderRadius: "6px",
              border: "1px dashed var(--border-strong)",
              background: "transparent",
              color: "var(--text-2)",
              fontSize: "13px", fontWeight: 500,
              cursor: "pointer", fontFamily: "Inter, sans-serif",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-card)"; e.currentTarget.style.borderColor = "var(--orange-border)"; e.currentTarget.style.color = "var(--orange)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.color = "var(--text-2)"; }}
          >
            🎮 Try demo — no account needed
          </button>

          {/* Platform badges */}
          <div style={{ marginTop: "28px", padding: "14px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: "10px", textAlign: "center" }}>What you get</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {[
                ["🎯", "Daily coding questions by topic & company"],
                ["▶", "Run code in 5+ languages (free)"],
                ["🤖", "AI-powered answer evaluation"],
                ["📅", "GitHub-style streak calendar"],
                ["📰", "Daily tech news from top sources"],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: "9px" }}>
                  <span style={{ fontSize: "13px", marginTop: "1px" }}>{icon}</span>
                  <span style={{ fontSize: "12px", color: "var(--text-2)" }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;
