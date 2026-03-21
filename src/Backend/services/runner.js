// Code runner service using Piston API (100% free, no key needed)
// Docs: https://github.com/engineer-man/piston
// Supports 50+ languages with no rate limits on the community instance

const PISTON_URL = "https://emkc.org/api/v2/piston/execute";

// Latest stable versions for each language
const LANGUAGE_VERSIONS = {
  javascript: "18.15.0",
  python: "3.10.0",
  java: "15.0.2",
  cpp: "10.2.0",
  typescript: "5.0.3",
};

/**
 * Runs code via Piston API (free, no auth required).
 * @param {string} code - Source code to execute
 * @param {string} language - Language identifier (e.g. "python", "javascript")
 * @param {string} stdin - Optional stdin input
 * @returns {Promise<{stdout, stderr, exitCode, time}>}
 */
export async function runCode(code, language = "javascript", stdin = "") {
  const version = LANGUAGE_VERSIONS[language] || "latest";

  // Wrap C++ code with proper filename for compilation
  const filename =
    language === "cpp" ? "solution.cpp" :
    language === "java" ? "Solution.java" :
    language === "typescript" ? "solution.ts" :
    language === "python" ? "solution.py" :
    "solution.js";

  try {
    const response = await fetch(PISTON_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language,
        version,
        files: [{ name: filename, content: code }],
        stdin,
        run_timeout: 10000, // 10 second timeout
        compile_timeout: 15000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Piston API error: ${response.status}`);
    }

    const data = await response.json();
    const run = data.run || {};
    const compile = data.compile || {};

    // If compilation failed, return compile error
    if (compile.code !== undefined && compile.code !== 0) {
      return {
        stdout: "",
        stderr: compile.stderr || compile.output || "Compilation failed",
        exitCode: compile.code,
        time: 0,
      };
    }

    return {
      stdout: run.stdout || "",
      stderr: run.stderr || "",
      exitCode: run.code ?? 0,
      time: run.time ?? 0,
    };
  } catch (err) {
    return {
      stdout: "",
      stderr: `Runner error: ${err.message}. Check your internet connection.`,
      exitCode: 1,
      time: 0,
    };
  }
}
