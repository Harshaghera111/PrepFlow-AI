// ─────────────────────────────────────────────────────────────────────────────
// services/api.js  —  PrepFlow AI  ·  Data-fetching layer
//
// Data flow (priority order):
//   1. Firestore cache  → skip API calls if today's data is already stored
//   2. n8n webhook      → PRIMARY source for question + hint + news
//   3. Gemini AI        → FALLBACK for question + hint  (if n8n fails)
//   4. NewsAPI          → FALLBACK for news             (if n8n fails)
//   5. Local bank       → LAST RESORT fallback question bank (always works)
//
// Exports used by UI:
//   fetchDashboardData(topic, company)  → { question, hint, difficulty, topic, company, articles[] }
//   fetchMoreNews()                      → articles[]   (refresh button)
//   checkAnswer(question, answer, mode, language) → { correct, feedback, suggestion }
// ─────────────────────────────────────────────────────────────────────────────

import { db } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// ── API endpoints & keys ──────────────────────────────────────────────────────

/** PRIMARY: n8n webhook — returns { question, hint, news }
 *  In development:  requests go through the Vite dev proxy (/api/n8n → n8n webhook)
 *                   which avoids browser CORS restrictions.
 *  In production:   requests go directly to n8n (CORS is allowed from deployed origin).
 */
const IS_DEV  = import.meta.env.DEV;
const N8N_URL = IS_DEV
  ? "/api/n8n"                                             // proxied by vite.config.js
  : "https://prepflow.app.n8n.cloud/webhook/prepflow";    // direct in production

/** FALLBACK: Google Gemini 2.0 Flash — question + hint generation */
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

/** FALLBACK: Groq — answer evaluation (6 000 free req/day) */
const GROQ_API_KEY  = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL      = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL    = "llama-3.1-8b-instant";

/** FALLBACK: NewsAPI — tech headlines */
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const NEWS_URL     = `https://newsapi.org/v2/top-headlines?category=technology&pageSize=5&language=en&apiKey=${NEWS_API_KEY}`;

// ── Local fallback question bank ──────────────────────────────────────────────
// Used as last resort when both n8n AND Gemini are unavailable.

const FALLBACK_QUESTIONS = [
  {
    question:
      "Given an array of integers, find two numbers such that they add up to a specific target. Return the indices of the two numbers. Each input has exactly one solution, and you may not use the same element twice. Example: nums = [2, 7, 11, 15], target = 9 → Output: [0, 1]",
    hint:
      "Use a hash map to store each number and its index as you iterate. For each number, check if (target - current number) already exists in the map.",
  },
  {
    question:
      "Given a string s, find the length of the longest substring without repeating characters. Example: s = 'abcabcbb' → Output: 3 (the answer is 'abc').",
    hint:
      "Use the sliding window technique with two pointers and a Set to track characters in the current window. Shrink the left pointer when a duplicate is found.",
  },
  {
    question:
      "Reverse a linked list. Given the head of a singly linked list, reverse the list and return the reversed list. Example: 1→2→3→4→5 → 5→4→3→2→1",
    hint:
      "Iterate through the list keeping track of three pointers: prev (null initially), curr (head), and next. At each step, reverse the link and advance all three pointers.",
  },
  {
    question:
      "Given a binary tree, return its maximum depth. The maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
    hint:
      "Use DFS recursion. The depth of a node is 1 + max(depth of left child, depth of right child). Base case: null node returns 0.",
  },
  {
    question:
      "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i ≠ j, i ≠ k, j ≠ k, and nums[i] + nums[j] + nums[k] == 0. The solution set must not contain duplicate triplets.",
    hint:
      "Sort the array first, then use a fixed pointer i and a two-pointer approach (left, right) for the remaining pair. Skip duplicates by checking if current element equals previous.",
  },
  {
    question:
      "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time O(1). Implement the MinStack class.",
    hint:
      "Maintain two stacks: one for regular values and one to track minimums. Push to the min stack only when the new value is ≤ the current minimum.",
  },
  {
    question:
      "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if every open bracket is closed by the same type of bracket in the correct order.",
    hint:
      "Use a stack. Push opening brackets onto the stack. For closing brackets, check if the stack's top matches — if not, return false. Valid if stack is empty at end.",
  },
];

function getRandomFallback() {
  return FALLBACK_QUESTIONS[Math.floor(Math.random() * FALLBACK_QUESTIONS.length)];
}

// ── Fallback news (shown when n8n AND NewsAPI are both unavailable) ────────────

const FALLBACK_NEWS = [
  { title: "OpenAI releases new reasoning model with improved capabilities",            source: "TechCrunch", url: "", time: "" },
  { title: "Google DeepMind announces breakthrough in protein structure prediction",    source: "Nature",     url: "", time: "" },
  { title: "Meta open-sources new AI coding assistant for developers",                 source: "The Verge",  url: "", time: "" },
  { title: "Microsoft Azure expands AI services with new developer tools",             source: "ZDNet",      url: "", time: "" },
  { title: "Stack Overflow: TypeScript overtakes JavaScript in developer preference",  source: "InfoQ",      url: "", time: "" },
];

// ── Firestore cache helpers ───────────────────────────────────────────────────

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function getDailyContentRef() {
  return doc(db, "dailyContent", getTodayKey());
}

// ── 1. PRIMARY: n8n Webhook ───────────────────────────────────────────────────

/**
 * Fetches a coding question, hint, and news string from the n8n webhook.
 *
 * The webhook returns: { question: string, hint: string, news: string }
 *
 * @returns {{ question, hint, news } | null}  null = request failed / invalid
 */
async function fetchFromN8N() {
  try {
    console.log("🔗 Fetching from n8n webhook (primary)...");
    const response = await fetch(N8N_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "prepflow-dashboard" }),
    });

    if (!response.ok) {
      console.warn(`⚠️  n8n webhook returned HTTP ${response.status} — will use fallback.`);
      return null;
    }

    const data = await response.json();

    // Validate that the response has the expected fields
    if (!data?.question || !data?.hint) {
      console.warn("⚠️  n8n response missing required fields (question/hint) — will use fallback.", data);
      return null;
    }

    console.log("✅ n8n webhook succeeded.");
    return {
      question: String(data.question).trim(),
      hint:     String(data.hint).trim(),
      news:     data.news ? String(data.news).trim() : null,
    };
  } catch (err) {
    console.warn("⚠️  n8n fetch error — will use fallback:", err.message);
    return null;
  }
}

/**
 * Converts the n8n plain-text news string into the articles array format
 * used everywhere in the UI.
 *
 * If the string looks like it contains multiple headlines separated by
 * newlines or numbered lists, each line becomes its own article card.
 *
 * @param {string} newsText
 * @returns {Array<{title, source, url, time}>}
 */
function parseN8NNews(newsText) {
  if (!newsText) return FALLBACK_NEWS;

  // Split on newlines and clean up numbered-list prefixes like "1. " or "- "
  const lines = newsText
    .split(/\n+/)
    .map((l) => l.replace(/^\s*[\d]+[.)]\s*|^[-•*]\s*/, "").trim())
    .filter((l) => l.length > 8); // drop very short / empty lines

  if (lines.length === 0) {
    // Treat the whole string as a single headline
    return [{ title: newsText, source: "PrepFlow AI", url: "", time: "" }];
  }

  return lines.map((title) => ({ title, source: "PrepFlow AI", url: "", time: "" }));
}

// ── 2. FALLBACK: Google Gemini AI ────────────────────────────────────────────

/**
 * Generates a coding question + hint using Gemini 2.0 Flash.
 * Only called when n8n is unavailable.
 *
 * @param {string} topic   - e.g. "Arrays", "Any"
 * @param {string} company - e.g. "Google", "Any"
 * @returns {{ question, hint, difficulty, topic, company }}
 */
async function fetchQuestionFromGemini(topic = "Any", company = "Any") {
  const topicClause   = topic   && topic   !== "Any" ? ` about ${topic}`             : "";
  const companyClause = company && company !== "Any" ? ` commonly asked at ${company}` : "";

  const prompt = `You are a coding interview assistant. Generate ONE coding interview question${topicClause}${companyClause} suitable for a software engineering interview (algorithm or data structures). Also provide a helpful hint that guides without giving away the solution.

Respond ONLY with valid JSON (no markdown, no extra text):
{
  "question": "The full question text here",
  "hint": "A helpful hint here",
  "difficulty": "Easy" or "Medium" or "Hard",
  "topic": "exact topic e.g. Arrays, Trees, Dynamic Programming, Graphs, Strings, Sorting, Hashing, Two Pointers, Binary Search, Stack",
  "company": "${company !== "Any" ? company : "Google"}"
}`;

  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.85, maxOutputTokens: 600 },
      }),
    });

    if (!response.ok) {
      console.warn(`⚠️  Gemini API error ${response.status} — using fallback question.`);
      return { ...getRandomFallback(), difficulty: "Medium", topic: topic || "General", company: company || "General" };
    }

    const result  = await response.json();
    const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(cleaned);
    const fallback = getRandomFallback();
    return {
      question:   parsed.question   || fallback.question,
      hint:       parsed.hint       || fallback.hint,
      difficulty: parsed.difficulty || "Medium",
      topic:      parsed.topic      || topic  || "General",
      company:    parsed.company    || company || "General",
    };
  } catch {
    console.warn("Gemini response parse failed — using local fallback.");
    return { ...getRandomFallback(), difficulty: "Medium", topic: topic || "General", company: company || "General" };
  }
}

// ── 3. FALLBACK: NewsAPI ──────────────────────────────────────────────────────

function parseNewsAPIArticles(articles) {
  return articles
    .filter((a) => a.title && a.title !== "[Removed]")
    .map((a) => ({
      title:  a.title,
      source: a.source?.name || "Unknown",
      url:    a.url  || "",
      time:   a.publishedAt
        ? new Date(a.publishedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        : "",
    }));
}

async function fetchNewsArticles() {
  try {
    const res  = await fetch(NEWS_URL);
    if (!res.ok) throw new Error(`NewsAPI HTTP ${res.status}`);
    const data   = await res.json();
    const parsed = parseNewsAPIArticles(data?.articles || []);
    return parsed.length > 0 ? parsed : FALLBACK_NEWS;
  } catch (err) {
    console.warn("NewsAPI failed — using fallback:", err.message);
    return FALLBACK_NEWS;
  }
}

// ── Public: Refresh news (used by Dashboard refresh button) ──────────────────

/**
 * Fetches fresh news articles on demand.
 * Tries n8n first, then NewsAPI, then local fallback.
 * Does NOT read/write Firestore cache.
 *
 * @returns {Promise<Array<{title, source, url, time}>>}
 */
export async function fetchMoreNews() {
  // Try n8n for fresh news
  const n8nData = await fetchFromN8N();
  if (n8nData?.news) return parseN8NNews(n8nData.news);

  // Fall back to NewsAPI
  return fetchNewsArticles();
}

// ── Main export: Dashboard data ───────────────────────────────────────────────

/**
 * Fetches today's full dashboard content.
 *
 * Priority:
 *   1. Firestore cache  (default/unfiltered queries only)
 *   2. n8n webhook      (primary live source)
 *   3. Gemini + NewsAPI (fallback if n8n fails)
 *
 * Topic/company filters bypass the cache and always hit the API.
 * When n8n is used, difficulty defaults to "Medium" and topic/company
 * default to "General" since the webhook doesn't return those fields.
 *
 * @param {string} topic   - Filter topic,   "Any" = no filter
 * @param {string} company - Filter company, "Any" = no filter
 * @returns {{ question, hint, difficulty, topic, company, articles[] }}
 */
export async function fetchDashboardData(topic = "Any", company = "Any") {
  const isFiltered = topic !== "Any" || company !== "Any";

  // ── Step 1: Check Firestore cache (only for unfiltered default queries) ──
  if (!isFiltered) {
    try {
      const cached = await getDoc(getDailyContentRef());
      if (cached.exists()) {
        const d = cached.data();
        if (d.question && d.hint) {
          console.log("📦 Loaded from Firestore cache.");
          const articles = Array.isArray(d.articles)
            ? d.articles
            : d.news
            ? parseN8NNews(d.news)
            : FALLBACK_NEWS;
          return {
            question:   d.question,
            hint:       d.hint,
            articles,
            difficulty: d.difficulty || "Medium",
            topic:      d.topic      || "General",
            company:    d.company    || "General",
          };
        }
      }
    } catch (cacheErr) {
      console.warn("Cache read failed:", cacheErr.message);
    }
  }

  // ── Step 2: Try n8n webhook (PRIMARY) ────────────────────────────────────
  let question, hint, difficulty, returnedTopic, returnedCompany, articles;

  const n8nResult = isFiltered ? null : await fetchFromN8N();
  // Note: When topic/company filters are active we skip n8n because it doesn't
  // support those parameters — Gemini handles filtered queries.

  if (n8nResult) {
    // ✅ n8n succeeded — use its question, hint, and news
    question         = n8nResult.question;
    hint             = n8nResult.hint;
    difficulty       = "Medium";       // n8n doesn't return difficulty
    returnedTopic    = topic  !== "Any" ? topic   : "General";
    returnedCompany  = company !== "Any" ? company : "General";
    articles         = parseN8NNews(n8nResult.news);
  } else {
    // ── Step 3: Fallback — Gemini AI + NewsAPI ────────────────────────────
    console.log("↩️  Falling back to Gemini + NewsAPI...");
    const [questionData, newsArticles] = await Promise.all([
      fetchQuestionFromGemini(topic, company),
      fetchNewsArticles(),
    ]);

    question        = questionData.question;
    hint            = questionData.hint;
    difficulty      = questionData.difficulty    || "Medium";
    returnedTopic   = questionData.topic         || topic   || "General";
    returnedCompany = questionData.company       || company || "General";
    articles        = newsArticles;
  }

  // ── Step 4: Save to Firestore cache (unfiltered queries only) ────────────
  if (!isFiltered) {
    try {
      await setDoc(getDailyContentRef(), {
        question, hint, articles, difficulty,
        topic:       returnedTopic,
        company:     returnedCompany,
        generatedAt: serverTimestamp(),
        source:      n8nResult ? "n8n" : "gemini",
      });
      console.log("💾 Saved to Firestore cache.");
    } catch (saveErr) {
      console.warn("Cache save failed:", saveErr.message);
    }
  }

  return { question, hint, articles, difficulty, topic: returnedTopic, company: returnedCompany };
}

// ── Answer Checker (Groq — LLaMA 3.1 8B Instant) ─────────────────────────────
// No changes — Groq is independent of the question source.

/**
 * Evaluates a user's answer (code or plain English) via Groq's LLaMA model.
 *
 * @param {string} question  - The coding question text
 * @param {string} answer    - The user's code or English explanation
 * @param {string} mode      - "code" | "english"
 * @param {string} language  - Programming language (for code mode)
 * @returns {Promise<{correct: boolean|null, feedback: string, suggestion: string}>}
 */
export async function checkAnswer(question, answer, mode = "code", language = "javascript") {
  if (!GROQ_API_KEY || GROQ_API_KEY === "YOUR_GROQ_API_KEY") {
    return {
      correct:    null,
      feedback:   "Add your free Groq API key to the .env file (VITE_GROQ_API_KEY) to enable answer checking. Get one free at console.groq.com",
      suggestion: "",
    };
  }

  const modeLabel    = mode === "code" ? `${language} code solution` : "plain English explanation of the approach";
  const systemPrompt = `You are a coding interview evaluator. Evaluate answers concisely and accurately. Always respond with valid JSON only — no markdown, no extra text.`;
  const userPrompt   = `Question: ${question}

User's ${modeLabel}:
${answer}

Evaluate this answer. Respond ONLY with this JSON:
{"correct": true_or_false, "feedback": "2-3 sentences on correctness and quality", "suggestion": "one improvement tip or empty string if perfect"}`;

  try {
    const response = await fetch(GROQ_URL, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model:           GROQ_MODEL,
        messages:        [
          { role: "system", content: systemPrompt },
          { role: "user",   content: userPrompt },
        ],
        temperature:     0.3,
        max_tokens:      400,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.warn(`Groq error ${response.status}:`, errText);
      return {
        correct:    null,
        feedback:   response.status === 429
          ? "Rate limit hit. Please wait a moment and try again."
          : "Evaluation service unavailable. Please try again.",
        suggestion: "",
      };
    }

    const result  = await response.json();
    const rawText = result?.choices?.[0]?.message?.content ?? "{}";
    const parsed  = JSON.parse(rawText);

    return {
      correct:    parsed.correct    ?? null,
      feedback:   parsed.feedback   || "No feedback available.",
      suggestion: parsed.suggestion || "",
    };
  } catch (err) {
    console.error("checkAnswer error:", err);
    return {
      correct:    null,
      feedback:   "Evaluation failed — check your internet connection and try again.",
      suggestion: "",
    };
  }
}
