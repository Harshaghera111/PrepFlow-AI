// API service — fetches real data from Google Gemini AI and NewsAPI
// Falls back to a curated question bank if Gemini quota is exceeded.

import { db } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// ─── Config ───────────────────────────────────────────────────────────────────
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

// Gemini — used ONLY for daily question generation (cached = ~1 call/day)
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// Groq — used for answer checking (6,000 req/day free, much more generous)
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant"; // fast, free, highly capable

const NEWS_URL = `https://newsapi.org/v2/top-headlines?category=technology&pageSize=5&language=en&apiKey=${NEWS_API_KEY}`;

// ─── Fallback Question Bank ───────────────────────────────────────────────────
// Used when Gemini API quota is exceeded or unavailable

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
  const idx = Math.floor(Math.random() * FALLBACK_QUESTIONS.length);
  return FALLBACK_QUESTIONS[idx];
}

// ─── Cache helper ─────────────────────────────────────────────────────────────

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function getDailyContentRef() {
  return doc(db, "dailyContent", getTodayKey());
}

// ─── Gemini: Coding Question + Hint ──────────────────────────────────────────

/**
 * Fetches a coding question from Gemini with optional topic/company filters.
 * Returns: { question, hint, difficulty, topic, company }
 */
async function fetchQuestionFromGemini(topic = "Any", company = "Any") {
  const topicClause = topic && topic !== "Any" ? ` about ${topic}` : "";
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

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.85, maxOutputTokens: 600 },
    }),
  });

  if (!response.ok) {
    console.warn(`⚠️ Gemini API error ${response.status} — using fallback question.`);
    return getRandomFallback();
  }

  const result = await response.json();
  const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    const fallback = getRandomFallback();
    return {
      question: parsed.question || fallback.question,
      hint: parsed.hint || fallback.hint,
      difficulty: parsed.difficulty || "Medium",
      topic: parsed.topic || topic || "General",
      company: parsed.company || company || "General",
    };
  } catch {
    console.warn("Gemini response parse failed — using fallback.");
    return getRandomFallback();
  }
}

// ─── NewsAPI: Tech News ───────────────────────────────────────────────────────


const FALLBACK_NEWS = [
  { title: "OpenAI releases new reasoning model with improved capabilities", source: "TechCrunch", url: "" },
  { title: "Google DeepMind announces breakthrough in protein structure prediction", source: "Nature", url: "" },
  { title: "Meta open-sources new AI coding assistant for developers", source: "The Verge", url: "" },
  { title: "Microsoft Azure expands AI services with new developer tools", source: "ZDNet", url: "" },
  { title: "Stack Overflow: TypeScript overtakes JavaScript in developer preference", source: "InfoQ", url: "" },
];

/**
 * Parses raw NewsAPI articles into structured objects.
 * @param {Array} articles - Raw article objects from NewsAPI
 * @returns {Array<{title, source, url, time}>}
 */
function parseArticles(articles) {
  return articles
    .filter((a) => a.title && a.title !== "[Removed]")
    .map((a) => ({
      title: a.title,
      source: a.source?.name || "Unknown",
      url: a.url || "",
      time: a.publishedAt
        ? new Date(a.publishedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        : "",
    }));
}

/**
 * Internal: fetch news articles from NewsAPI (or use fallback).
 * @returns {Promise<Array<{title, source, url, time}>>}
 */
async function fetchNewsArticles() {
  try {
    const res = await fetch(NEWS_URL);
    if (!res.ok) throw new Error(`NewsAPI ${res.status}`);
    const data = await res.json();
    const parsed = parseArticles(data?.articles || []);
    return parsed.length > 0 ? parsed : FALLBACK_NEWS;
  } catch (err) {
    console.warn("NewsAPI failed — using fallback:", err.message);
    return FALLBACK_NEWS;
  }
}

/**
 * Fetches fresh news articles on demand (used by the refresh button).
 * Does NOT use or update Firestore cache.
 * @returns {Promise<Array<{title, source, url, time}>>}
 */
export async function fetchMoreNews() {
  return fetchNewsArticles();
}


// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Fetches today's dashboard content.
 * When topic/company are default ("Any"), uses Firestore cache to avoid repeat API calls.
 * When filtered, always fetches fresh.
 * Returns: { question, hint, difficulty, topic, company, articles }
 */
export async function fetchDashboardData(topic = "Any", company = "Any") {
  const isFiltered = topic !== "Any" || company !== "Any";

  // 1. Check Firestore cache (only for default/unfiltered)
  if (!isFiltered) {
    try {
      const cached = await getDoc(getDailyContentRef());
      if (cached.exists()) {
        const d = cached.data();
        if (d.question && d.hint) {
          console.log("📦 Loaded from Firestore cache");
          const articles = Array.isArray(d.articles)
            ? d.articles
            : d.news
            ? [{ title: d.news, source: "Cached", url: "", time: "" }]
            : [];
          return {
            question: d.question, hint: d.hint, articles,
            difficulty: d.difficulty || "Medium",
            topic: d.topic || "General",
            company: d.company || "General",
          };
        }
      }
    } catch (cacheErr) {
      console.warn("Cache read failed:", cacheErr.message);
    }
  }

  // 2. Fetch fresh (fallbacks built-in)
  const [questionData, articles] = await Promise.all([
    fetchQuestionFromGemini(topic, company),
    fetchNewsArticles(),
  ]);

  const { question, hint, difficulty = "Medium", topic: returnedTopic = topic, company: returnedCompany = company } = questionData;

  // 3. Save to cache (only for default, unfiltered queries)
  if (!isFiltered) {
    try {
      await setDoc(getDailyContentRef(), {
        question, hint, articles, difficulty,
        topic: returnedTopic, company: returnedCompany,
        generatedAt: serverTimestamp(),
      });
    } catch (saveErr) {
      console.warn("Cache save failed:", saveErr.message);
    }
  }

  return { question, hint, articles, difficulty, topic: returnedTopic, company: returnedCompany };
}

// ─── Answer Checker (Groq — LLaMA 3.1 8B Instant) ────────────────────────────
// Groq free tier: 6,000 req/day — much more generous than Gemini

/**
 * Checks a user's answer (code or plain English) using Groq's LLaMA model.
 * @param {string} question  - The coding question text
 * @param {string} answer    - The user's code or English explanation
 * @param {string} mode      - "code" | "english"
 * @param {string} language  - Programming language (for code mode)
 * @returns {Promise<{correct: boolean, feedback: string, suggestion: string}>}
 */
export async function checkAnswer(question, answer, mode = "code", language = "javascript") {
  // If no Groq key configured yet, return a helpful message
  if (!GROQ_API_KEY || GROQ_API_KEY === "YOUR_GROQ_API_KEY") {
    return {
      correct: null,
      feedback: "Add your free Groq API key to the .env file (VITE_GROQ_API_KEY) to enable answer checking. Get one free at console.groq.com",
      suggestion: "",
    };
  }

  const modeLabel = mode === "code"
    ? `${language} code solution`
    : "plain English explanation of the approach";

  const systemPrompt = `You are a coding interview evaluator. Evaluate answers concisely and accurately. Always respond with valid JSON only — no markdown, no extra text.`;

  const userPrompt = `Question: ${question}

User's ${modeLabel}:
${answer}

Evaluate this answer. Respond ONLY with this JSON:
{"correct": true_or_false, "feedback": "2-3 sentences on correctness and quality", "suggestion": "one improvement tip or empty string if perfect"}`;

  try {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 400,
        response_format: { type: "json_object" }, // Forces pure JSON output
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.warn(`Groq error ${response.status}:`, errText);
      return {
        correct: null,
        feedback: response.status === 429
          ? "Rate limit hit. Please wait a moment and try again."
          : "Evaluation service unavailable. Please try again.",
        suggestion: "",
      };
    }

    const result = await response.json();
    const rawText = result?.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(rawText);

    return {
      correct: parsed.correct ?? null,
      feedback: parsed.feedback || "No feedback available.",
      suggestion: parsed.suggestion || "",
    };
  } catch (err) {
    console.error("checkAnswer error:", err);
    return {
      correct: null,
      feedback: "Evaluation failed — check your internet connection and try again.",
      suggestion: "",
    };
  }
}
