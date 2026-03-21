// Dashboard — PrepFlow AI main view
import React, { useState, useEffect, useCallback, useRef } from "react";
import Spinner from "../components/Spinner";
import AnswerPanel from "../components/AnswerPanel";
import QuestionCard from "../components/QuestionCard";
import HintCard from "../components/HintCard";
import NewsCard from "../components/NewsCard";
import { fetchDashboardData, fetchMoreNews } from "../../Backend/services/api";
import { getDayProgress, markSolved, unmarkSolved, recordHintUsed, addBookmark, removeBookmark } from "../../Backend/services/db";

const TOPICS   = ["Any", "Arrays", "Strings", "Trees", "Graphs", "Dynamic Programming", "Sorting", "Binary Search", "Hashing", "Two Pointers", "Stack"];
const COMPANIES = ["Any", "Google", "Amazon", "Meta", "Microsoft", "Apple", "Netflix", "Uber"];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function Dashboard({ user, onStreakChange }) {
  const [question, setQuestion]       = useState("");
  const [hint, setHint]               = useState("");
  const [difficulty, setDifficulty]   = useState("Medium");
  const [topic, setTopic]             = useState("General");
  const [articles, setArticles]       = useState([]);
  const [newsIndex, setNewsIndex]     = useState(0);
  const [newsLoading, setNewsLoading] = useState(false);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  const [selTopic,   setSelTopic]   = useState("Any");
  const [selCompany, setSelCompany] = useState("Any");

  const [showHint, setShowHint]   = useState(false);
  const [solved, setSolved]       = useState(false);
  const [streak, setStreak]       = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [bookmarkId, setBookmarkId] = useState(null);

  const [elapsed, setElapsed] = useState(0);
  const [timerOn, setTimerOn] = useState(false);
  const timerRef = useRef(null);

  const isDemoMode = !user?.uid;
  const userId = user?.uid;

  // Derive a display name: prefer first name from displayName, fallback to email prefix, then "Harsh"
  const displayName =
    user?.displayName?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Harsh";

  // Timer logic
  useEffect(() => {
    if (timerOn) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerOn]);

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const loadData = useCallback(
    async (t = selTopic, c = selCompany, force = false) => {
      setLoading(true); setError(""); setShowHint(false);
      setNewsIndex(0); setBookmarkId(null); setElapsed(0); setTimerOn(false);
      try {
        const [api, prog] = await Promise.all([
          fetchDashboardData(t, c, force),
          isDemoMode ? { solved: false, hintsUsed: 0, streak: 7 } : getDayProgress(userId),
        ]);
        setQuestion(api.question);
        setHint(api.hint);
        setDifficulty(api.difficulty || "Medium");
        setTopic(api.topic || t);
        setArticles(api.articles || []);
        setSolved(prog.solved);
        setHintsUsed(prog.hintsUsed);
        setStreak(prog.streak);
        onStreakChange?.(prog.streak);
        setTimerOn(true);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [userId, isDemoMode, selTopic, selCompany, onStreakChange]
  );

  useEffect(() => { loadData(); }, []); // eslint-disable-line

  const handleTopicChange = (t) => { setSelTopic(t); loadData(t, selCompany); };
  const handleCompanyChange = (c) => { setSelCompany(c); loadData(selTopic, c); };

  const handleSolved = async () => {
    const n = !solved;
    setSolved(n);
    if (n) setTimerOn(false);
    if (!isDemoMode) {
      if (n) {
        await markSolved(userId, streak);
        setStreak((s) => { const x = s + 1; onStreakChange?.(x); return x; });
      } else {
        await unmarkSolved(userId);
      }
    }
  };

  const handleHint = async () => {
    const n = !showHint;
    setShowHint(n);
    if (n && hintsUsed === 0 && !isDemoMode) {
      await recordHintUsed(userId);
      setHintsUsed(1);
    }
  };

  const handleBookmark = async () => {
    if (isDemoMode) return;
    if (bookmarkId) {
      await removeBookmark(userId, bookmarkId);
      setBookmarkId(null);
    } else {
      const id = await addBookmark(userId, { question, hint, difficulty, topic, company: selCompany });
      setBookmarkId(id);
    }
  };

  const handleRefreshNews = async () => {
    setNewsLoading(true);
    try { const f = await fetchMoreNews(); setArticles(f); setNewsIndex(0); }
    finally { setNewsLoading(false); }
  };

  const handleNewQuestion = () => {
    localStorage.removeItem("prepflow_daily_data");
    loadData(selTopic, selCompany, true);
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", padding: "28px 20px 80px", transition: "background 0.2s ease" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* ── Greeting + Timer ── */}
        <div style={{
          display: "flex", alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "22px", flexWrap: "wrap", gap: "12px",
        }}>
          <div>
            <h1 style={{
              fontSize: "22px", fontWeight: 800,
              color: "var(--text-1)", letterSpacing: "-0.4px", marginBottom: "3px",
            }}>
              {getGreeting()}, {displayName} 👋
            </h1>
            <p style={{ fontSize: "12px", color: "var(--text-3)" }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              {isDemoMode && (
                <span style={{
                  marginLeft: "8px", padding: "2px 8px", borderRadius: "4px",
                  background: "var(--orange-muted)", color: "var(--orange)",
                  fontSize: "11px", fontWeight: 600,
                }}>
                  Demo
                </span>
              )}
            </p>
          </div>

          {/* Timer */}
          {!loading && !error && (
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "8px 14px", borderRadius: "9px",
              background: "var(--bg-card)", border: `1px solid ${solved ? "var(--green-border)" : "var(--border)"}`,
              boxShadow: "var(--shadow-sm)", transition: "border-color 0.2s",
            }}>
              <span style={{ fontSize: "12px", color: "var(--text-3)" }}>
                {solved ? "✅ Solved in" : timerOn ? "⏱ Solving" : "⏸ Paused"}
              </span>
              <span style={{
                fontFamily: "monospace", fontSize: "17px", fontWeight: 700,
                color: solved ? "var(--green)" : "var(--orange)", letterSpacing: "1px",
              }}>
                {fmt(elapsed)}
              </span>
              {!solved && (
                <button
                  className="btn-icon"
                  onClick={() => setTimerOn((a) => !a)}
                  style={{ width: "26px", height: "26px" }}
                >
                  {timerOn ? "⏸" : "▶"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Stats row ── */}
        {!loading && !error && (
          <div
            className="stats-grid-3"
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" }}
          >
            <StatCard emoji="🔥" label="Day Streak" value={streak} color="var(--orange)" sub={streak === 0 ? "Start today!" : "Keep it up!"} />
            <StatCard emoji={solved ? "✅" : "○"} label="Today" value={solved ? "Solved!" : "Unsolved"} isText color={solved ? "var(--green)" : "var(--text-1)"} sub={solved ? "Great work!" : "Give it a try"} />
            <StatCard emoji="💡" label="Hints Used" value={hintsUsed} color="var(--yellow)" sub="Use wisely" />
          </div>
        )}

        {/* ── Filters ── */}
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "10px", padding: "14px 16px", marginBottom: "12px",
          boxShadow: "var(--shadow-sm)",
        }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: "10px" }}>Topic</p>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
            {TOPICS.map((t) => (
              <button key={t} onClick={() => handleTopicChange(t)} className={`tag${selTopic === t ? " active" : ""}`}>{t}</button>
            ))}
          </div>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: "10px" }}>Company</p>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {COMPANIES.map((c) => (
              <button key={c} onClick={() => handleCompanyChange(c)} className={`tag${selCompany === c ? " active-blue" : ""}`}>
                {c === "Any" ? "🏢 Any" : c}
              </button>
            ))}
          </div>
        </div>

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="card" style={{ textAlign: "center", padding: "56px" }}>
            <Spinner message="AI is generating your question..." />
          </div>
        )}

        {/* ── Error state ── */}
        {!loading && error && (
          <div className="card fade-in" style={{ textAlign: "center", padding: "40px", borderLeft: "3px solid var(--red)" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>⚠️</div>
            <p style={{ color: "var(--red)", fontSize: "13px", marginBottom: "16px" }}>{error}</p>
            <button className="btn btn-outline" onClick={() => loadData()}>↺ Retry</button>
          </div>
        )}

        {/* ── Main content ── */}
        {!loading && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* Question */}
            <QuestionCard
              question={question}
              difficulty={difficulty}
              topic={topic}
              solved={solved}
              showHint={showHint}
              bookmarkId={bookmarkId}
              isDemoMode={isDemoMode}
              loading={loading}
              onSolved={handleSolved}
              onHint={handleHint}
              onBookmark={handleBookmark}
              onNewQuestion={handleNewQuestion}
            />

            {/* Code editor + answer checker */}
            <AnswerPanel
              question={question}
              userId={isDemoMode ? null : userId}
              solved={solved}
              onSolved={() => {
                setSolved(true);
                setTimerOn(false);
                setStreak((s) => { const n = s + 1; onStreakChange?.(n); return n; });
              }}
            />

            {/* Hint (toggled) */}
            {showHint && <HintCard hint={hint} />}

            {/* Tech news */}
            <NewsCard
              articles={articles}
              newsIndex={newsIndex}
              newsLoading={newsLoading}
              onPrev={() => setNewsIndex((i) => (i - 1 + articles.length) % articles.length)}
              onNext={() => setNewsIndex((i) => (i + 1) % articles.length)}
              onSetIndex={setNewsIndex}
              onRefresh={handleRefreshNews}
            />

          </div>
        )}
      </div>
    </div>
  );
}

// ── Stat card (inline sub-component) ──────────────────────────────────────
function StatCard({ emoji, label, value, isText, color, sub }) {
  return (
    <div className="card fade-in" style={{ padding: "16px 18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.6px" }}>{label}</span>
        <span style={{ fontSize: "18px" }}>{emoji}</span>
      </div>
      <div style={{
        fontSize: isText ? "18px" : "28px", fontWeight: 800, color,
        letterSpacing: "-0.5px", lineHeight: 1, marginBottom: "6px",
        fontVariantNumeric: "tabular-nums",
      }}>
        {value}
      </div>
      <p style={{ fontSize: "11px", color: "var(--text-3)" }}>{sub}</p>
    </div>
  );
}

export default Dashboard;
