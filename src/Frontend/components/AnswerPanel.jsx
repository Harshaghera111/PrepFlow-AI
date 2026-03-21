// AnswerPanel — LeetCode-style code editor with run + check
import React, { useState } from "react";
import { checkAnswer } from "../../Backend/services/api";
import { runCode } from "../../Backend/services/runner";

const LANGS = ["javascript", "python", "java", "cpp", "typescript"];
const LANG_LABEL = { javascript: "JavaScript", python: "Python", java: "Java", cpp: "C++", typescript: "TypeScript" };
const LANG_EXT   = { javascript: "js", python: "py", java: "java", cpp: "cpp", typescript: "ts" };
const STARTERS   = {
  javascript: "// Write your solution here\nfunction solution() {\n  \n}",
  python:     "# Write your solution here\ndef solution():\n    pass",
  java:       "// Write your solution here\npublic class Solution {\n    public void solve() {\n        \n    }\n}",
  cpp:        "#include <bits/stdc++.h>\nusing namespace std;\n\nvoid solution() {\n    \n}",
  typescript: "// Write your solution here\nfunction solution(): void {\n  \n}",
};

function AnswerPanel({ question, onSolved }) {
  const [mode, setMode]         = useState("code");
  const [lang, setLang]         = useState("javascript");
  const [code, setCode]         = useState(STARTERS["javascript"]);
  const [text, setText]         = useState("");
  const [result, setResult]     = useState(null);
  const [output, setOutput]     = useState(null);
  const [checking, setChecking] = useState(false);
  const [running, setRunning]   = useState(false);

  const changeLang = l => { setLang(l); setCode(STARTERS[l]); setOutput(null); };

  const handleTab = e => {
    if (e.key !== "Tab") return;
    e.preventDefault();
    const { selectionStart: s, selectionEnd: en, value: v } = e.target;
    const nv = v.slice(0, s) + "  " + v.slice(en);
    e.target.value = nv; e.target.selectionStart = e.target.selectionEnd = s + 2;
    setCode(nv);
  };

  const handleRun = async () => {
    if (!code.trim()) return;
    setRunning(true); setOutput(null);
    setOutput(await runCode(code, lang));
    setRunning(false);
  };

  const handleCheck = async () => {
    const answer = mode === "code" ? code : text;
    if (!answer.trim()) return;
    setChecking(true); setResult(null);
    const res = await checkAnswer(question, answer, mode, lang);
    setResult(res); setChecking(false);
    if (res.correct) onSolved?.();
  };

  const RES = {
    true:  { icon: "✅", label: "Correct!",           bg: "var(--green-muted)", border: "var(--green-border)",   color: "var(--green)" },
    false: { icon: "❌", label: "Needs Improvement",  bg: "var(--red-muted)",   border: "rgba(239,71,67,0.25)", color: "var(--red)" },
    null:  { icon: "⚠️", label: "Unable to evaluate", bg: "var(--orange-muted)", border: "var(--orange-border)", color: "var(--orange)" },
  };
  const rc = RES[String(result?.correct ?? "null")];

  return (
    <div className="card card-accent-blue fade-in pf-glass-card" style={{ padding: 0 }}>

      {/* ─ Header ─ */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <span style={{ fontSize: "16px" }}>⚡</span>
          <div>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-1)" }}>Your Answer</span>
            <span style={{ fontSize: "11px", color: "var(--text-3)", marginLeft: "8px" }}>— AI-powered evaluation</span>
          </div>
        </div>
        {/* Mode switch */}
        <div style={{ display: "flex", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "6px", overflow: "hidden", padding: "2px", gap: "2px", flexWrap: "wrap", justifyContent: "center" }}>
          {["code", "english"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: "5px 13px", border: "none", cursor: "pointer",
              fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600,
              borderRadius: "5px",
              background: mode === m ? "var(--bg-card)" : "transparent",
              color: mode === m ? "var(--orange)" : "var(--text-3)",
              transition: "all 0.15s",
            }}>
              {m === "code" ? "💻 Code" : "📝 Plain English"}
            </button>
          ))}
        </div>
      </div>

      {/* ─ Code Mode ─ */}
      {mode === "code" && (
        <>
          {/* Language bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px", borderBottom: "1px solid var(--border)", background: "rgba(0,0,0,0.15)", flexWrap: "wrap", rowGap: 8 }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.8px", marginRight: "6px" }}>Language</span>
            {LANGS.map(l => (
              <button key={l} onClick={() => changeLang(l)} style={{
                padding: "4px 11px", borderRadius: "5px", cursor: "pointer",
                fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600,
                border: `1px solid ${lang === l ? "var(--orange-border)" : "var(--border)"}`,
                background: lang === l ? "var(--orange-muted)" : "var(--bg-elevated)",
                color: lang === l ? "var(--orange)" : "var(--text-3)",
                transition: "all 0.15s",
              }}>
                {LANG_LABEL[l]}
              </button>
            ))}
          </div>

          {/* Editor */}
          <div style={{ margin: "12px" }}>
            <div className="code-wrap">
              <div className="code-titlebar">
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ff5f57", display: "inline-block" }} />
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ffbd2e", display: "inline-block" }} />
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#28c840", display: "inline-block" }} />
                <span style={{ fontSize: "11px", color: "var(--text-3)", marginLeft: "8px", fontFamily: "monospace" }}>
                  solution.{LANG_EXT[lang]}
                </span>
              </div>
              <textarea
                className="code-textarea"
                value={code}
                onChange={e => setCode(e.target.value)}
                onKeyDown={handleTab}
                spellCheck={false}
              />
            </div>
          </div>

          {/* Output panel */}
          {output && (
            <div className="fade-in" style={{ margin: "0 12px 12px", background: "#0d0d0d", border: "1px solid var(--border)", borderRadius: "6px", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", background: "#111", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.6px" }}>Output</span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: output.exitCode === 0 ? "var(--green)" : "var(--red)" }}>
                    {output.exitCode === 0 ? "✓ Passed" : `✗ Exit ${output.exitCode}`}
                  </span>
                  {output.time > 0 && <span style={{ fontSize: "11px", color: "var(--text-3)" }}>{output.time}s</span>}
                </div>
              </div>
              <pre style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: "12px", lineHeight: "1.6", margin: 0, color: output.stderr && !output.stdout ? "var(--red)" : "#34d399", whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: "150px", overflowY: "auto" }}>
                {output.stdout || output.stderr || "(no output)"}
              </pre>
            </div>
          )}
        </>
      )}

      {/* ─ Plain English Mode ─ */}
      {mode === "english" && (
        <div style={{ padding: "14px" }}>
          <p style={{ fontSize: "12px", color: "var(--text-3)", marginBottom: "10px" }}>
            Describe your approach — algorithm, data structures, steps. AI will evaluate your thinking.
          </p>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="e.g. I'd use a hash map to store each element's index. Then iterate through the array and check if target minus current element exists in the map..."
            style={{
              width: "100%", minHeight: "160px", padding: "13px",
              background: "var(--bg-input)", border: "1px solid var(--border)",
              borderRadius: "6px", color: "var(--text-1)",
              fontFamily: "Inter, sans-serif", fontSize: "14px", lineHeight: "1.75",
              resize: "vertical", outline: "none",
            }}
            onFocus={e => e.target.style.borderColor = "var(--orange-border)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"}
          />
        </div>
      )}

      {/* ─ Action bar ─ */}
      <div className="pf-answer-actionbar" style={{ display: "flex", gap: "8px", padding: "12px 18px", borderTop: "1px solid var(--border)", background: "rgba(0,0,0,0.1)" }}>
        {mode === "code" && (
          <button className="btn btn-outline btn-sm" onClick={handleRun} disabled={running || !code.trim()}>
            {running ? "Running..." : "▶ Run Code"}
          </button>
        )}
        <button className="btn btn-orange btn-sm" onClick={handleCheck} disabled={checking || (mode === "code" ? !code.trim() : !text.trim())}>
          {checking ? "⏳ Checking..." : "⚡ Check Answer"}
        </button>
      </div>

      {/* ─ Result ─ */}
      {result && (
        <div className="fade-in" style={{ margin: "0 12px 14px", padding: "14px 16px", borderRadius: "8px", background: rc.bg, border: `1px solid ${rc.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{ fontSize: "16px" }}>{rc.icon}</span>
            <span style={{ fontWeight: 700, color: rc.color, fontSize: "14px" }}>{rc.label}</span>
          </div>
          <p style={{ color: "var(--text-2)", fontSize: "13px", lineHeight: "1.7" }}>{result.feedback}</p>
          {result.suggestion && (
            <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ fontSize: "12px", color: "var(--text-3)", lineHeight: "1.6" }}>
                💡 <strong style={{ color: "var(--text-2)" }}>Tip:</strong> {result.suggestion}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AnswerPanel;
