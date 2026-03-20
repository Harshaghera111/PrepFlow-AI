// Navbar — LeetCode-style with orange accent
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { auth } from "../services/firebase";
import { signOut } from "firebase/auth";

function Navbar({ user, streak = 0, demoMode = false, onExitDemo }) {
  const loc = useLocation();

  const handleLogout = async () => {
    try { await signOut(auth); } catch (e) { console.error(e); }
  };

  const NavLink = ({ to, label }) => {
    const active = loc.pathname === to;
    return (
      <Link to={to} style={{
        textDecoration: "none",
        padding: "6px 12px",
        borderRadius: "6px",
        fontSize: "13px",
        fontWeight: active ? 600 : 400,
        color: active ? "var(--orange)" : "var(--text-2)",
        background: active ? "var(--orange-muted)" : "transparent",
        border: active ? "1px solid var(--orange-border)" : "1px solid transparent",
        transition: "all 0.15s",
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.color = "var(--text-1)"; e.currentTarget.style.background = "var(--bg-elevated)"; }}}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.background = "transparent"; }}}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav style={{
      height: "56px",
      background: "#111111",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "9px" }}>
          <div style={{
            width: "30px", height: "30px", borderRadius: "8px",
            background: "var(--orange)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "15px", fontWeight: 900, color: "#1a1a1a",
          }}>
            P
          </div>
          <span style={{
            fontSize: "15px", fontWeight: 800,
            color: "var(--text-1)", letterSpacing: "-0.3px",
          }}>
            PrepFlow <span style={{ color: "var(--orange)" }}>AI</span>
          </span>
        </Link>

        {!demoMode && (
          <div style={{ display: "flex", gap: "4px" }}>
            <NavLink to="/" label="Dashboard" />
            <NavLink to="/progress" label="My Progress" />
          </div>
        )}
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Streak badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: "5px",
          padding: "5px 12px", borderRadius: "20px",
          background: streak > 0 ? "rgba(255,161,22,0.1)" : "var(--bg-elevated)",
          border: streak > 0 ? "1px solid rgba(255,161,22,0.25)" : "1px solid var(--border)",
        }}>
          <span style={{ fontSize: "14px" }}>🔥</span>
          <span style={{ fontSize: "13px", fontWeight: 700, color: streak > 0 ? "var(--orange)" : "var(--text-3)" }}>{streak}</span>
          <span style={{ fontSize: "11px", color: "var(--text-3)" }}>streak</span>
        </div>

        {demoMode && (
          <span style={{ fontSize: "11px", color: "var(--text-3)", padding: "4px 10px", borderRadius: "20px", background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
            Demo mode
          </span>
        )}

        {user && !demoMode && (
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: "linear-gradient(135deg, var(--orange), #ff6b35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "13px", fontWeight: 800, color: "#1a1a1a",
          }}>
            {user.email?.charAt(0).toUpperCase()}
          </div>
        )}

        <button
          onClick={demoMode ? onExitDemo : handleLogout}
          style={{
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--text-2)",
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "12px", fontWeight: 500,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.color = "var(--text-1)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-2)"; }}
        >
          {demoMode ? "Exit demo" : "Sign out"}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
