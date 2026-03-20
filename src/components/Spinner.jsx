// Loading Spinner component
// Shown while fetching data from the API

import React from "react";

/**
 * Spinner Component
 * @param {string} message - Optional loading message to display
 */
function Spinner({ message = "Loading..." }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        padding: "60px 20px",
      }}
    >
      {/* Animated ring spinner */}
      <div
        style={{
          width: "48px",
          height: "48px",
          border: "3px solid rgba(99, 102, 241, 0.2)",
          borderTop: "3px solid #6366f1",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      {/* Loading message */}
      <p style={{ color: "#94a3b8", fontSize: "14px" }}>{message}</p>
    </div>
  );
}

export default Spinner;
