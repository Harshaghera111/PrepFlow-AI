// HintCard — Collapsible hint panel with a subtle yellow accent
import React from "react";
import { motion } from "framer-motion";
import TiltCard from "./TiltCard";

function HintCard({ hint }) {
  return (
    <TiltCard className="card card-accent-yellow fade-in pf-glass-card" strength={8}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <span style={{ fontSize: "18px" }}>💡</span>
        <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--yellow)" }}>Hint</span>
        <motion.span
          whileHover={{ scale: 1.02 }}
          style={{
          fontSize: "10px", color: "var(--yellow)",
          background: "var(--yellow-muted)", border: "1px solid rgba(255,192,30,0.2)",
          padding: "1px 7px", borderRadius: "4px", fontWeight: 600,
          }}
        >
          Don't peek too soon!
        </motion.span>
      </div>
      <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: "1.85" }}>
        {hint}
      </p>
    </TiltCard>
  );
}

export default HintCard;
