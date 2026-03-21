// Landing — modern, premium hero + parallax background
import React, { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";

function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    const rand = (min, max) => min + Math.random() * (max - min);
    const particles = Array.from({ length: 90 }).map(() => ({
      x: rand(0, window.innerWidth),
      y: rand(0, window.innerHeight),
      vx: rand(-0.2, 0.2),
      vy: rand(-0.12, 0.12),
      r: rand(1, 2.4),
      a: rand(0.18, 0.55),
    }));

    const draw = () => {
      if (!running) return;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Gradient wash for softness
      const g = ctx.createRadialGradient(
        window.innerWidth * 0.25,
        window.innerHeight * 0.15,
        30,
        window.innerWidth * 0.6,
        window.innerHeight * 0.7,
        Math.max(window.innerWidth, window.innerHeight) * 0.7
      );
      g.addColorStop(0, "rgba(255,161,22,0.10)");
      g.addColorStop(0.55, "rgba(59,130,246,0.06)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < -10) p.x = window.innerWidth + 10;
        if (p.x > window.innerWidth + 10) p.x = -10;
        if (p.y < -10) p.y = window.innerHeight + 10;
        if (p.y > window.innerHeight + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,161,22,${p.a})`;
        ctx.fill();
      }

      // Connect a few nearby points
      for (let i = 0; i < particles.length; i += 2) {
        for (let j = i + 1; j < i + 8 && j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.18;
            ctx.strokeStyle = `rgba(255,161,22,${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      raf = window.requestAnimationFrame(draw);
    };

    raf = window.requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      running = false;
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity: 0.95,
        filter: "saturate(1.15)",
      }}
    />
  );
}

function Landing({ theme, onToggleTheme, onStartDemo }) {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -34]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 0.985]);

  const features = useMemo(
    () => [
      ["🧠 AI Questions + Hints", "Daily practice with clear hints that don't spoil the challenge."],
      ["⚡ Instant Feedback", "Check your approach and get focused improvement tips."],
      ["📰 Tech News", "Stay updated with short, relevant headlines while you study."],
      ["🔥 Streaks That Matter", "Build consistency like a real learning platform."],
    ],
    []
  );

  return (
    <div
      className="pf-landing-bg"
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        paddingBottom: 56,
      }}
    >
      <ParticleCanvas />

      {/* Top nav */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 22px",
          background: "rgba(0,0,0,0.15)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: "var(--orange)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              color: "#1a1a1a",
              boxShadow: "0 10px 30px rgba(255,161,22,0.25)",
            }}
          >
            P
          </div>
          <div style={{ fontWeight: 900, color: "var(--text-1)" }}>
            PrepFlow <span style={{ color: "var(--orange)" }}>AI</span>
          </div>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={onToggleTheme}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "var(--text-1)",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          <Link
            to="/login"
            className="btn btn-outline"
            style={{
              textDecoration: "none",
              padding: "9px 14px",
              fontWeight: 700,
              borderRadius: 10,
              borderColor: "rgba(255,255,255,0.18)",
            }}
          >
            Sign in
          </Link>

          <motion.button
            whileHover={{ y: -1, boxShadow: "0 10px 30px rgba(255,161,22,0.25)" }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartDemo}
            className="btn btn-orange"
            style={{ padding: "10px 16px", borderRadius: 10, fontWeight: 800 }}
          >
            Start Challenge
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "64px 20px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 18 }}>
          <motion.div
            style={{
              y: heroY,
              scale: heroScale,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div
              className="pf-hero-glass"
              style={{
                padding: "26px 22px",
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(14px)",
                boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                <span
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: "rgba(255,161,22,0.12)",
                    border: "1px solid rgba(255,161,22,0.25)",
                    color: "var(--orange)",
                    fontWeight: 800,
                    fontSize: 12,
                  }}
                >
                  Daily coding + AI hints
                </span>
                <span style={{ color: "var(--text-3)", fontSize: 12, fontWeight: 600 }}>
                  Built for consistency, not randomness
                </span>
              </div>

              <h1
                style={{
                  fontSize: "clamp(34px, 4.5vw, 56px)",
                  lineHeight: 1.04,
                  marginBottom: 12,
                  fontWeight: 950,
                  letterSpacing: "-1.2px",
                  color: "var(--text-1)",
                }}
              >
                Master Coding Daily with AI
              </h1>
              <p style={{ maxWidth: 650, color: "var(--text-2)", fontSize: 16, lineHeight: 1.75, marginBottom: 18 }}>
                PrepFlow AI delivers one focused question per day, smart hints when you need them, and quick tech news—so you
                stay sharp for interviews.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onStartDemo}
                  className="btn btn-orange"
                  style={{ padding: "12px 18px", borderRadius: 12, fontWeight: 900, fontSize: 14 }}
                >
                  Start Challenge
                </motion.button>
                <Link
                  to="/login"
                  style={{
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 18px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.16)",
                    background: "rgba(255,255,255,0.05)",
                    color: "var(--text-1)",
                    fontWeight: 800,
                  }}
                >
                  Sign in for full progress
                </Link>
              </div>

              <div style={{ display: "flex", gap: 14, marginTop: 18, flexWrap: "wrap" }}>
                {[
                  { title: "1 question/day", sub: "Focused practice" },
                  { title: "Animated hints", sub: "Reveal when ready" },
                  { title: "Fresh tech news", sub: "Short & relevant" },
                ].map((x) => (
                  <motion.div
                    key={x.title}
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    style={{
                      flex: "1 1 200px",
                      minWidth: 210,
                      padding: "12px 14px",
                      borderRadius: 14,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.10)",
                    }}
                  >
                    <div style={{ fontWeight: 900, color: "var(--text-1)", marginBottom: 4 }}>{x.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 600 }}>{x.sub}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            style={{
              marginTop: 8,
              display: "grid",
              gridTemplateColumns: "repeat(12, 1fr)",
              gap: 12,
            }}
          >
            {features.map(([title, desc], idx) => (
              <motion.div
                key={title}
                whileHover={{ y: -2, rotateX: 1.5 }}
                transition={{ type: "spring", stiffness: 280, damping: 20 }}
                style={{
                  gridColumn: idx < 2 ? "span 6" : idx < 3 ? "span 4" : "span 4",
                  padding: 16,
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  backdropFilter: "blur(14px)",
                }}
              >
                <div style={{ fontSize: 18, marginBottom: 8 }}>{title.split(" ")[0]}</div>
                <div style={{ fontWeight: 900, color: "var(--text-1)", marginBottom: 6 }}>{title}</div>
                <div style={{ color: "var(--text-2)", lineHeight: 1.65, fontSize: 13 }}>{desc}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA strip */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            style={{
              marginTop: 12,
              padding: 18,
              borderRadius: 18,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.10)",
              backdropFilter: "blur(14px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontWeight: 950, fontSize: 18, color: "var(--text-1)", marginBottom: 3 }}>
                Ready to build daily momentum?
              </div>
              <div style={{ color: "var(--text-3)", fontSize: 13, fontWeight: 600 }}>
                Start free in demo mode and see how your daily challenge feels.
              </div>
            </div>
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStartDemo}
              className="btn btn-orange"
              style={{ padding: "11px 16px", borderRadius: 12, fontWeight: 900 }}
            >
              Start Challenge
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Landing;

