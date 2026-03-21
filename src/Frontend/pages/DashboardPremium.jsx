// DashboardPremium — product-level premium UI/UX
import React, { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AnswerPanel from "../components/AnswerPanel";
import QuestionCard from "../components/QuestionCard";
import HintCard from "../components/HintCard";
import NewsCard from "../components/NewsCard";
import { fetchDashboardData, fetchMoreNews } from "../../Backend/services/api";
import {
  getDayProgress,
  markSolved,
  unmarkSolved,
  recordHintUsed,
  addBookmark,
  removeBookmark,
} from "../../Backend/services/db";

const TOPICS = ["Any", "Arrays", "Strings", "Trees", "Graphs", "Dynamic Programming", "Sorting", "Binary Search", "Hashing", "Two Pointers", "Stack"];
const COMPANIES = ["Any", "Google", "Amazon", "Meta", "Microsoft", "Apple", "Netflix", "Uber"];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function SkeletonLine({ w = "100%", h = 14, br = 10, mb = 10 }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: br, marginBottom: mb }} />;
}

function SkeletonCard({ variant }) {
  if (variant === "question") {
    return (
      <div className="card pf-glass-card" style={{ padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="skeleton" style={{ width: 28, height: 18, borderRadius: 8 }} />
            <SkeletonLine w="190px" h={14} br={8} mb={0} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 12 }} />
            <div className="skeleton" style={{ width: 120, height: 36, borderRadius: 12 }} />
          </div>
        </div>
        <SkeletonLine w="86%" h={14} br={10} mb={10} />
        <SkeletonLine w="72%" h={14} br={10} mb={18} />
        <div className="skeleton" style={{ width: "100%", height: 170, borderRadius: 14, marginBottom: 18 }} />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div className="skeleton" style={{ width: 180, height: 38, borderRadius: 12 }} />
          <div className="skeleton" style={{ width: 160, height: 38, borderRadius: 12 }} />
        </div>
      </div>
    );
  }

  if (variant === "answer") {
    return (
      <div className="card pf-glass-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="skeleton" style={{ height: 54, borderRadius: 0, marginBottom: 0 }} />
        <div style={{ padding: 12 }}>
          <div className="skeleton" style={{ height: 260, borderRadius: 12 }} />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
            <div className="skeleton" style={{ width: 170, height: 38, borderRadius: 12 }} />
            <div className="skeleton" style={{ width: 190, height: 38, borderRadius: 12 }} />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "hint") {
    return (
      <div className="card pf-glass-card" style={{ padding: 18, borderLeft: "3px solid var(--yellow)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div className="skeleton" style={{ width: 34, height: 20, borderRadius: 10 }} />
          <div className="skeleton" style={{ width: 120, height: 14, borderRadius: 10 }} />
        </div>
        <div className="skeleton" style={{ width: "100%", height: 92, borderRadius: 12 }} />
      </div>
    );
  }

  // news
  return (
    <div className="card pf-glass-card" style={{ padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="skeleton" style={{ width: 34, height: 18, borderRadius: 10 }} />
          <div className="skeleton" style={{ width: 150, height: 14, borderRadius: 10 }} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div className="skeleton" style={{ width: 38, height: 38, borderRadius: 12 }} />
          <div className="skeleton" style={{ width: 38, height: 38, borderRadius: 12 }} />
        </div>
      </div>
      <div className="skeleton" style={{ width: "100%", height: 16, borderRadius: 10, marginBottom: 10 }} />
      <div className="skeleton" style={{ width: "92%", height: 40, borderRadius: 14, marginBottom: 16 }} />
      <div className="skeleton" style={{ width: "66%", height: 14, borderRadius: 10 }} />
    </div>
  );
}

function StatCard({ emoji, label, value, color, sub }) {
  return (
    <div className="card pf-glass-card" style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 950, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.6px" }}>
          {label}
        </span>
        <span style={{ fontSize: 18 }}>{emoji}</span>
      </div>
      <div style={{ fontSize: typeof value === "number" ? 28 : 22, fontWeight: 980, color, letterSpacing: "-0.5px", lineHeight: 1, fontVariantNumeric: "tabular-nums", marginBottom: 6 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 800 }}>{sub}</div>
    </div>
  );
}

export default function DashboardPremium({ user, onStreakChange }) {
  const [question, setQuestion] = useState("");
  const [hint, setHint] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [topic, setTopic] = useState("General");
  const [articles, setArticles] = useState([]);
  const [newsIndex, setNewsIndex] = useState(0);
  const [newsLoading, setNewsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selTopic, setSelTopic] = useState("Any");
  const [selCompany, setSelCompany] = useState("Any");

  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState(false);
  const [streak, setStreak] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [bookmarkId, setBookmarkId] = useState(null);

  const [elapsed, setElapsed] = useState(0);
  const [timerOn, setTimerOn] = useState(false);
  const timerRef = useRef(null);

  const isDemoMode = !user?.uid;
  const userId = user?.uid;

  const displayName = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "Harsh";

  useEffect(() => {
    if (timerOn) timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [timerOn]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const loadData = useCallback(
    async (t = selTopic, c = selCompany, force = false) => {
      setLoading(true);
      setError("");
      setShowHint(false);
      setNewsIndex(0);
      setBookmarkId(null);
      setElapsed(0);
      setTimerOn(false);
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
        setError(err?.message || "Failed to fetch your daily challenge.");
      } finally {
        setLoading(false);
      }
    },
    [userId, isDemoMode, selTopic, selCompany, onStreakChange]
  );

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTopicChange = (t) => {
    setSelTopic(t);
    loadData(t, selCompany);
  };

  const handleCompanyChange = (c) => {
    setSelCompany(c);
    loadData(selTopic, c);
  };

  const handleSolved = async () => {
    const n = !solved;
    setSolved(n);
    if (n) setTimerOn(false);
    if (!isDemoMode) {
      if (n) {
        await markSolved(userId, streak);
        setStreak((s) => {
          const x = s + 1;
          onStreakChange?.(x);
          return x;
        });
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
    try {
      const f = await fetchMoreNews();
      setArticles(f);
      setNewsIndex(0);
    } finally {
      setNewsLoading(false);
    }
  };

  const handleNewQuestion = () => {
    if (loading) return;
    localStorage.removeItem("prepflow_daily_data");
    loadData(selTopic, selCompany, true);
  };

  return (
    <div className="pf-dashboard-bg">
      <div className="pf-dashboard-container">
        {/* Header */}
        <motion.div
          className="pf-dashboard-header pf-glass-card"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontWeight: 980, fontSize: 22, letterSpacing: "-0.5px", color: "var(--text-1)" }}>
                PrepFlow AI
              </div>
              <span style={{ padding: "6px 10px", borderRadius: 999, background: "var(--orange-muted)", border: "1px solid var(--orange-border)", color: "var(--orange)", fontWeight: 900, fontSize: 12 }}>
                EdTech Daily Challenge
              </span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-3)", marginTop: 4 }}>
              Master one coding skill each day with AI hints + tech news.
            </div>
            <div style={{ fontSize: 12, fontWeight: 900, color: "var(--text-2)", marginTop: 6 }}>
              {getGreeting()}, {displayName}
              {isDemoMode && (
                <span style={{ marginLeft: 10, padding: "2px 8px", borderRadius: 999, background: "var(--orange-muted)", border: "1px solid var(--orange-border)", color: "var(--orange)", fontSize: 11 }}>
                  Demo
                </span>
              )}
            </div>
          </div>

          {!loading && !error && (
            <div className="pf-timer">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 900 }}>
                  {solved ? "✅ Solved in" : timerOn ? "⏱ Solving" : "⏸ Paused"}
                </span>
                <span style={{ fontFamily: "monospace", fontSize: 17, fontWeight: 980, color: solved ? "var(--green)" : "var(--orange)", letterSpacing: "1px" }}>
                  {fmt(elapsed)}
                </span>
              </div>
              {!solved && (
                <button className="btn-icon" onClick={() => setTimerOn((a) => !a)} style={{ width: 28, height: 28 }}>
                  {timerOn ? "⏸" : "▶"}
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* Stats */}
        {!loading && !error && (
          <motion.div className="pf-stats-grid" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <StatCard emoji="🔥" label="Day Streak" value={streak} color="var(--orange)" sub={streak === 0 ? "Start today!" : "Keep it up!"} />
            <StatCard emoji={solved ? "✅" : "○"} label="Today" value={solved ? "Solved!" : "Unsolved"} color={solved ? "var(--green)" : "var(--text-1)"} sub={solved ? "Great work!" : "Give it a try"} />
            <StatCard emoji="💡" label="Hints Used" value={hintsUsed} color="var(--yellow)" sub="Use wisely" />
          </motion.div>
        )}

        {/* Filters */}
        <div className="pf-filters pf-glass-card">
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 950, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 10 }}>
                Topic
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {TOPICS.map((t) => (
                  <button key={t} onClick={() => handleTopicChange(t)} className={`tag${selTopic === t ? " active" : ""}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 950, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 10 }}>
                Company
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {COMPANIES.map((c) => (
                  <button key={c} onClick={() => handleCompanyChange(c)} className={`tag${selCompany === c ? " active-blue" : ""}`}>
                    {c === "Any" ? "🏢 Any" : c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="loading" className="pf-dashboard-grid" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <SkeletonCard variant="question" />
                <SkeletonCard variant="answer" />
                <SkeletonCard variant="hint" />
              </div>
              <div>
                <SkeletonCard variant="news" />
              </div>
            </motion.div>
          )}

          {!loading && error && (
            <motion.div
              key="error"
              className="card pf-glass-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ textAlign: "center", padding: 46, borderLeft: "3px solid var(--red)" }}
            >
              <div style={{ fontSize: 34, marginBottom: 12 }}>⚠️</div>
              <div style={{ color: "var(--red)", fontWeight: 900, marginBottom: 14, fontSize: 13 }}>{error}</div>
              <button className="btn btn-outline" onClick={() => loadData()}>
                ↺ Retry
              </button>
            </motion.div>
          )}

          {!loading && !error && (
            <motion.div key="content" className="pf-dashboard-grid" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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

                <AnswerPanel
                  question={question}
                  userId={isDemoMode ? null : userId}
                  solved={solved}
                  onSolved={() => {
                    setSolved(true);
                    setTimerOn(false);
                    setStreak((s) => {
                      const n = s + 1;
                      onStreakChange?.(n);
                      return n;
                    });
                  }}
                />

                <AnimatePresence initial={false}>
                  {showHint && (
                    <motion.div
                      key="hint"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                    >
                      <HintCard hint={hint} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

