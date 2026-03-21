// Spinner — animated loading indicator using the orange design system
import React from "react";

function Spinner({ message = "Loading..." }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "16px",
      padding: "60px 20px",
    }}>
      {/* Dual-ring spinner with orange accent */}
      <div style={{ position: "relative", width: "44px", height: "44px" }}>
        <div style={{
          position: "absolute", inset: 0,
          border: "3px solid var(--border)",
          borderTop: "3px solid var(--orange)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
      </div>
      <p style={{ color: "var(--text-3)", fontSize: "13px", fontWeight: 500 }}>{message}</p>
    </div>
  );
}

export default Spinner;
