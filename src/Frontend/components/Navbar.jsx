// Navbar — sticky top bar with logo, navigation, streak, and theme toggle
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { auth } from "../../Backend/services/firebase";
import { signOut } from "firebase/auth";
import { AnimatePresence, motion } from "framer-motion";

function Navbar({ user, streak = 0, demoMode = false, theme = "dark", onExitDemo, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try { await signOut(auth); } catch (e) { console.error(e); }
  };

  return (
    <div>
      <nav style={{
        height: "56px",
        background: "var(--nav-bg)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 18px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "var(--shadow-sm)",
        transition: "background 0.2s ease, border-color 0.2s ease",
      }}>
        {/* Left — Logo + Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "9px" }}>
          <div style={{
            width: "30px", height: "30px", borderRadius: "8px",
            background: "var(--orange)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "15px", fontWeight: 900, color: "#1a1a1a",
            boxShadow: "0 2px 8px rgba(255, 161, 22, 0.35)",
          }}>
            P
          </div>
          <span style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.3px" }}>
            PrepFlow <span style={{ color: "var(--orange)" }}>AI</span>
          </span>
          </Link>

          {!demoMode && (
            <>
              {/* Desktop nav links */}
              <div className="pf-nav-links-desktop" style={{ display: "flex", gap: "4px" }}>
                <NavLink to="/" label="Dashboard" />
                <NavLink to="/progress" label="My Progress" />
              </div>

              {/* Mobile hamburger */}
              <button
                className="pf-nav-hamburger"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--bg-elevated)",
                  color: "var(--text-1)",
                  cursor: "pointer",
                  fontSize: 18,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {menuOpen ? "✕" : "☰"}
              </button>
            </>
          )}
        </div>

        {/* Right — Streak, theme toggle, user avatar, sign out */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {/* Streak badge */}
          <div className="pf-nav-streak" style={{
            display: "flex", alignItems: "center", gap: "5px",
            padding: "5px 12px", borderRadius: "20px",
            background: streak > 0 ? "var(--orange-muted)" : "var(--bg-elevated)",
            border: streak > 0 ? "1px solid var(--orange-border)" : "1px solid var(--border)",
            transition: "all 0.2s",
          }}>
            <span style={{ fontSize: "14px" }}>🔥</span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: streak > 0 ? "var(--orange)" : "var(--text-3)" }}>{streak}</span>
            <span style={{ fontSize: "11px", color: "var(--text-3)" }}>streak</span>
          </div>

          {/* Theme toggle */}
          <button
          className="pf-theme-toggle"
            onClick={onToggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            style={{
              width: "32px", height: "32px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "var(--bg-elevated)",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "15px",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-hover)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-elevated)"; e.currentTarget.style.borderColor = "var(--border)"; }}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

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
              flexShrink: 0,
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
              borderRadius: "7px",
              fontSize: "12px", fontWeight: 500,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              transition: "all 0.15s",
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.color = "var(--text-1)"; e.currentTarget.style.background = "var(--bg-elevated)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.background = "transparent"; }}
          >
            {demoMode ? "Exit demo" : "Sign out"}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {menuOpen && !demoMode && (
          <motion.div
            className="pf-nav-dropdown"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            <div className="pf-nav-dropdown-inner">
              <NavLink to="/" label="Dashboard" onNavigate={() => setMenuOpen(false)} />
              <NavLink to="/progress" label="My Progress" onNavigate={() => setMenuOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const NavLink = ({ to, label, onNavigate }) => {
  const loc = useLocation();
  const active = loc.pathname === to;
  return (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        padding: "6px 12px",
        borderRadius: "7px",
        fontSize: "13px",
        fontWeight: active ? 600 : 400,
        color: active ? "var(--orange)" : "var(--text-2)",
        background: active ? "var(--orange-muted)" : "transparent",
        border: active ? "1px solid var(--orange-border)" : "1px solid transparent",
        transition: "all 0.15s",
      }}
      onClick={onNavigate}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.color = "var(--text-1)"; e.currentTarget.style.background = "var(--bg-elevated)"; }}}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.background = "transparent"; }}}
    >
      {label}
    </Link>
  );
};

export default Navbar;
