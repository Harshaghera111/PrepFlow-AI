// Card component — clean, minimal
import React from "react";

function Card({ title, icon, children, badge, action, accentColor }) {
  return (
    <div className="card fade-in">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          {icon && <span style={{ fontSize: "15px" }}>{icon}</span>}
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-1)" }}>{title}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {action}
          {badge && (
            <span style={{
              fontSize: "11px", fontWeight: 500,
              padding: "2px 8px", borderRadius: "4px",
              background: "var(--bg-subtle)",
              color: "var(--text-3)",
              border: "1px solid var(--border)",
            }}>
              {badge}
            </span>
          )}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

export default Card;
