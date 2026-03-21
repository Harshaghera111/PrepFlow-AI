// QuestionCard — Today's coding question with difficulty badge, actions, and bookmark
import React from "react";
import { motion } from "framer-motion";
import TiltCard from "./TiltCard";

const DIFF_MAP = { Easy: "diff-easy", Medium: "diff-medium", Hard: "diff-hard" };

function QuestionCard({
  question,
  difficulty,
  topic,
  solved,
  showHint,
  bookmarkId,
  isDemoMode,
  loading,
  onSolved,
  onHint,
  onBookmark,
  onNewQuestion,
}) {
  return (
    <TiltCard className="card card-accent-orange fade-in pf-glass-card">
      {/* ── Header row ── */}
      <div style={{
        display: "flex", alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: "16px", flexWrap: "wrap", gap: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "15px" }}>💻</span>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-1)" }}>Today's Question</span>
          <span className={DIFF_MAP[difficulty] || "diff-medium"}>{difficulty}</span>
          {topic && topic !== "Any" && topic !== "General" && (
            <span style={{
              fontSize: "11px", color: "var(--text-3)",
              background: "var(--bg-elevated)", padding: "2px 8px",
              borderRadius: "4px", border: "1px solid var(--border)",
            }}>
              {topic}
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
          {!isDemoMode && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="btn-icon"
              onClick={onBookmark}
              title={bookmarkId ? "Remove bookmark" : "Bookmark this question"}
              style={{ color: bookmarkId ? "var(--yellow)" : "var(--text-3)" }}
            >
              {bookmarkId ? "🔖" : "📌"}
            </motion.button>
          )}
          <motion.button
            whileHover={!loading ? { y: -1 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            className="btn btn-outline btn-sm"
            onClick={onNewQuestion}
            disabled={loading}
            style={{ fontWeight: 900 }}
          >
            {loading ? (
              <>
                <span className="spin-anim" style={{ marginRight: 6 }}>↻</span>
                Refreshing…
              </>
            ) : (
              <>
                <span style={{ marginRight: 6 }}>↻</span>
                Refresh Question
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* ── Question text ── */}
      <div style={{
        background: "var(--bg-elevated)",
        borderRadius: "8px",
        padding: "16px 18px",
        marginBottom: "18px",
        borderLeft: "3px solid var(--border-strong)",
      }}>
        <p style={{
          fontSize: "14px", color: "var(--text-1)",
          lineHeight: "1.9", fontWeight: 400,
          whiteSpace: "pre-wrap",
        }}>
          {question}
        </p>
      </div>

      {/* ── Action buttons ── */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
        <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} className="btn btn-green" onClick={onSolved}>
          {solved ? "✅ Marked as Solved" : "✔ Mark as Solved"}
        </motion.button>
        <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} className="btn btn-outline" onClick={onHint}>
          {showHint ? "🙈 Hide Hint" : "💡 Show Hint"}
        </motion.button>
      </div>
    </TiltCard>
  );
}

export default QuestionCard;
