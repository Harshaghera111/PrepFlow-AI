// NewsCard — Tech news carousel with navigation dots and refresh button
import React from "react";
import { motion } from "framer-motion";
import TiltCard from "./TiltCard";

function NewsCard({ articles, newsIndex, newsLoading, onPrev, onNext, onSetIndex, onRefresh }) {
  const article = articles[newsIndex];

  return (
    <TiltCard className="card card-accent-green fade-in pf-glass-card" strength={8}>
      {/* ── Header ── */}
      <div className="section-header">
        <div className="section-title">
          <span style={{ fontSize: "15px" }}>📰</span>
          Tech News
        </div>
        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "var(--text-3)", marginRight: "4px" }}>
            {newsIndex + 1} / {Math.max(articles.length, 1)}
          </span>
          {articles.length > 1 && (
            <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} className="btn-icon" onClick={onPrev} title="Previous">
              ‹
            </motion.button>
          )}
          {articles.length > 1 && (
            <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} className="btn-icon" onClick={onNext} title="Next">
              ›
            </motion.button>
          )}
          <motion.button
            whileHover={!newsLoading ? { y: -1 } : {}}
            whileTap={!newsLoading ? { scale: 0.98 } : {}}
            className="btn-icon"
            onClick={onRefresh}
            disabled={newsLoading}
            title="Refresh news"
          >
            <span className={newsLoading ? "spin-anim" : ""}>↻</span>
          </motion.button>
        </div>
      </div>

      {/* ── Article ── */}
      {article ? (
        <div key={newsIndex} className="fade-in">
          <p style={{
            fontSize: "15px", fontWeight: 600, color: "var(--text-1)",
            lineHeight: "1.7", marginBottom: "14px",
          }}>
            {article.title}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span className="source-tag">{article.source}</span>
            {article.time && (
              <span style={{ fontSize: "11px", color: "var(--text-3)" }}>{article.time}</span>
            )}
            {article.url && (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "12px", color: "var(--orange)", fontWeight: 600,
                  textDecoration: "none", marginLeft: "auto",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                Read more →
              </a>
            )}
          </div>

          {/* Navigation dots */}
          {articles.length > 1 && (
            <div style={{ display: "flex", gap: "4px", marginTop: "16px" }}>
              {articles.map((_, i) => (
                <button
                  key={i}
                  onClick={() => onSetIndex(i)}
                  style={{
                    height: "4px",
                    width: i === newsIndex ? "22px" : "6px",
                    borderRadius: "2px", border: "none", padding: 0,
                    cursor: "pointer",
                    background: i === newsIndex ? "var(--green)" : "var(--border)",
                    transition: "all 0.25s ease",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <p style={{ color: "var(--text-3)", fontSize: "13px" }}>Loading news...</p>
      )}
    </TiltCard>
  );
}

export default NewsCard;
