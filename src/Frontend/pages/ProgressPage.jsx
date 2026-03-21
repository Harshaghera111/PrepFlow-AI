// ProgressPage — GitHub heatmap + LeetCode stats layout
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getAllDays, getBookmarks, removeBookmark } from "../../Backend/services/db";
import Spinner from "../components/Spinner";

const DIFF_MAP = {
  Easy:   { bg: "var(--green-muted)",  color: "var(--green)",  border: "var(--green-border)" },
  Medium: { bg: "var(--yellow-muted)", color: "var(--yellow)", border: "rgba(255,192,30,0.25)" },
  Hard:   { bg: "var(--red-muted)",    color: "var(--red)",    border: "rgba(239,71,67,0.25)" },
};

function ProgressPage({ user }) {
  const [days, setDays]           = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading]     = useState(true);
  const userId = user?.uid;

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const [d, b] = await Promise.all([getAllDays(userId), getBookmarks(userId)]);
      setDays(d); setBookmarks(b); setLoading(false);
    })();
  }, [userId]);

  if (!userId) {
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
        <div className="card" style={{ textAlign: "center", padding: "48px 40px", maxWidth: "380px" }}>
          <div style={{ fontSize: "40px", marginBottom: "14px" }}>🔒</div>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-1)", marginBottom: "8px" }}>Login to track progress</h2>
          <p style={{ fontSize: "13px", color: "var(--text-3)" }}>Create a free account to save your streak and see your heatmap.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spinner message="Loading progress..." />
      </div>
    );
  }

  const solved  = days.filter(d => d.solved);
  const total   = solved.length;
  const sorted  = solved.map(d => d.date).sort();
  let best = 0, cur = 0, prev = null;
  for (const dt of sorted) {
    if (prev) { const diff = (new Date(dt) - new Date(prev)) / 86400000; cur = diff === 1 ? cur + 1 : 1; }
    else { cur = 1; }
    best = Math.max(best, cur); prev = dt;
  }

  const topicMap = {};
  days.forEach(d => { if (d.solved && d.topic) topicMap[d.topic] = (topicMap[d.topic] || 0) + 1; });
  const topicList = Object.entries(topicMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxT = Math.max(...topicList.map(e => e[1]), 1);

  const heatmap = buildHeatmap(days);
  const handleRemove = async id => { await removeBookmark(userId, id); setBookmarks(b => b.filter(x => x.id !== id)); };

  return (
    <div className="pf-dashboard-bg" style={{ minHeight: "100vh" }}>
      <div className="pf-dashboard-container">

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.4px", marginBottom: "3px" }}>My Progress</h1>
          <p style={{ fontSize: "12px", color: "var(--text-3)" }}>Your coding journey on PrepFlow AI</p>
        </motion.div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px", marginBottom: "14px" }}>
          {[
            { emoji: "✅", label: "Total Solved", value: total, color: "var(--green)" },
            { emoji: "🔥", label: "Current Streak", value: `${cur} days`, color: "var(--orange)" },
            { emoji: "🏆", label: "Best Streak", value: `${best} days`, color: "var(--yellow)" },
            { emoji: "🔖", label: "Bookmarked", value: bookmarks.length, color: "var(--blue)" },
          ].map(({ emoji, label, value, color }) => (
            <div key={label} className="card card-accent-orange" style={{ borderLeftColor: color, padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "9px" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.6px" }}>{label}</span>
                <span style={{ fontSize: "18px" }}>{emoji}</span>
              </div>
              <div style={{ fontSize: "22px", fontWeight: 800, color, fontVariantNumeric: "tabular-nums" }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Heatmap */}
        <div className="card" style={{ marginBottom: "12px" }}>
          <div className="section-header">
            <div className="section-title">
              <span style={{ fontSize: "16px" }}>📅</span>
              Contribution Calendar
            </div>
            <span style={{ fontSize: "12px", color: "var(--text-3)" }}>{total} days solved this year</span>
          </div>
          <Heatmap data={heatmap} />
          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "12px", justifyContent: "flex-end" }}>
            <span style={{ fontSize: "10px", color: "var(--text-3)" }}>Less</span>
            {["rgba(0,184,163,0.07)", "rgba(0,184,163,0.25)", "rgba(0,184,163,0.45)", "rgba(0,184,163,0.7)", "var(--green)"].map((c, i) => (
              <div key={i} style={{ width: "11px", height: "11px", borderRadius: "2px", background: c, border: `1px solid ${i === 0 ? "var(--border)" : "transparent"}` }} />
            ))}
            <span style={{ fontSize: "10px", color: "var(--text-3)" }}>More</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
          {/* Topics */}
          <div className="card card-accent-orange">
            <div className="section-title" style={{ marginBottom: "16px" }}>
              <span style={{ fontSize: "15px" }}>🏷️</span> Topics Solved
            </div>
            {topicList.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--text-3)" }}>No data yet. Solve questions to see breakdown!</p>
            ) : topicList.map(([t, cnt]) => (
              <div key={t} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span style={{ fontSize: "13px", color: "var(--text-2)" }}>{t}</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--orange)" }}>{cnt}</span>
                </div>
                <div style={{ height: "5px", borderRadius: "3px", background: "var(--bg-elevated)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(cnt / maxT) * 100}%`, borderRadius: "3px", background: "linear-gradient(90deg, var(--orange), var(--orange-hover))", transition: "width 0.7s ease" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Recent */}
          <div className="card card-accent-green">
            <div className="section-title" style={{ marginBottom: "16px" }}>
              <span style={{ fontSize: "15px" }}>🕐</span> Recent Activity
            </div>
            {solved.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--text-3)" }}>No activity yet. Solve your first question!</p>
            ) : (
              [...solved].reverse().slice(0, 5).map(d => (
                <div key={d.date} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: "6px", background: "var(--bg-elevated)", marginBottom: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--green)", flexShrink: 0 }} />
                    <span style={{ fontSize: "12px", color: "var(--text-2)" }}>{d.topic || "Question"}</span>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--text-3)" }}>{d.date}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bookmarks */}
        <div className="card card-accent-blue">
          <div className="section-header">
            <div className="section-title">
              <span style={{ fontSize: "15px" }}>🔖</span> Bookmarked Questions
            </div>
            <span style={{ fontSize: "12px", color: "var(--text-3)" }}>{bookmarks.length} saved</span>
          </div>
          {bookmarks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px", background: "var(--bg-elevated)", borderRadius: "8px" }}>
              <p style={{ fontSize: "24px", marginBottom: "8px" }}>📌</p>
              <p style={{ fontSize: "13px", color: "var(--text-3)" }}>No bookmarks yet. Click 📌 on any question to save it here.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {bookmarks.map(bm => {
                const ds = DIFF_MAP[bm.difficulty] || {};
                return (
                  <div key={bm.id} style={{ padding: "14px 16px", borderRadius: "8px", background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                      <p style={{ flex: 1, fontSize: "13px", color: "var(--text-1)", lineHeight: "1.65", fontWeight: 500 }}>{bm.question}</p>
                      <button onClick={() => handleRemove(bm.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: "14px", flexShrink: 0, padding: "2px" }}>✕</button>
                    </div>
                    <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap", alignItems: "center" }}>
                      {bm.difficulty && <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", background: ds.bg, color: ds.color, border: `1px solid ${ds.border}` }}>{bm.difficulty}</span>}
                      {bm.topic && <span style={{ fontSize: "11px", color: "var(--text-3)", background: "var(--bg-card)", padding: "2px 8px", borderRadius: "4px", border: "1px solid var(--border)" }}>{bm.topic}</span>}
                      {bm.company && bm.company !== "General" && bm.company !== "Any" && <span style={{ fontSize: "11px", color: "var(--text-3)" }}>@{bm.company}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function buildHeatmap(days) {
  const map = {};
  days.forEach(d => { map[d.date] = d.solved; });
  const today = new Date();
  const result = [];
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const key = d.toISOString().split("T")[0];
    result.push({ date: key, solved: !!map[key], dow: d.getDay() });
  }
  return result;
}

function Heatmap({ data }) {
  const weeks = [];
  let week = [];
  const fd = data[0]?.dow ?? 0;
  for (let i = 0; i < fd; i++) week.push(null);
  for (const d of data) {
    week.push(d);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length) weeks.push(week);
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "flex", gap: "3px" }}>
        {weeks.map((wk, wi) => (
          <div key={wi} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {wk.map((d, di) =>
              !d ? <div key={di} style={{ width: "11px", height: "11px" }} /> :
              <div
                key={di}
                title={`${d.date}${d.solved ? " — Solved ✅" : ""}`}
                className="heatmap-cell"
                style={{ background: d.solved ? "var(--green)" : "var(--bg-elevated)", border: `1px solid ${d.solved ? "transparent" : "var(--border)"}` }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProgressPage;
