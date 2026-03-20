# 🚀 PrepFlow AI

> **PrepFlow AI** is a smart coding interview preparation platform powered by Google Gemini AI. It generates daily, personalized coding questions, evaluates your answers in real-time using LLaMA via Groq, tracks your streaks and progress, and keeps you updated with the latest tech news — all in a sleek, LeetCode-inspired dark UI.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vite.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%26%20Auth-FFCA28?logo=firebase)](https://firebase.google.com)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-38BDF8?logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📸 Overview

PrepFlow AI is designed for students and developers who want to consistently practice coding problems, especially for FAANG and top-tech company interviews. Think of it as your personal daily coding coach — powered by the latest AI models.

---

## ✨ Features

### 🤖 AI-Powered Daily Questions
- Generates a **unique coding question every day** using the **Google Gemini 2.0 Flash** model
- Filter questions by **topic** (Arrays, Trees, Graphs, DP, Sorting, etc.) and **company** (Google, Amazon, Meta, Microsoft, Apple, Netflix, Uber)
- **Difficulty badges**: Easy / Medium / Hard displayed for every question
- **Fallback question bank** ensures the app always works even if the API quota is exceeded

### ✅ Smart Answer Checker
- Submit answers as **code** (using the Monaco Editor — same editor as VS Code) or in **plain English**
- Powered by **Groq's LLaMA 3.1 8B Instant** model (6,000 free requests/day)
- Provides **feedback**, **correctness verdict**, and **improvement suggestions**

### 🔥 Streak & Progress Tracking
- **Daily streak counter** — keep your momentum going!
- Tracks whether you've **solved today's question** and how many **hints** you've used
- All progress is stored per-user, per-day in **Firebase Firestore**

### 📌 Bookmarks
- Bookmark any question for later review
- Revisit bookmarked questions from your Progress Page

### 📊 Progress Page & Heatmap
- Visual activity **heatmap** (GitHub-style contribution calendar) showing your solving history
- Full list of all past solved questions with date tracking

### 📰 Live Tech News
- Fetches the **latest technology headlines** using NewsAPI
- Paginated news carousel with a **refresh button**
- Graceful fallback news if the API is unavailable

### ⏱ Session Timer
- Built-in **solve timer** starts automatically when a new question loads
- Pause / resume the timer anytime
- Displays total time when you mark a question as solved

### 🔐 Firebase Authentication
- **Google Sign-In** (OAuth 2.0) via Firebase Auth
- **Demo Mode** — try the app without logging in (streak defaults to 7 for demo)
- Auth state persisted across sessions

### 🌑 LeetCode-Inspired Dark UI
- Dark slate theme with **orange accent**
- Monaco code editor with syntax highlighting
- Animated difficulty badges, stat cards, and fade-in transitions
- Fully responsive layout

---

## 🗂 Project Structure

```
PrepFlow/
├── public/                  # Static assets
├── src/
│   ├── assets/              # Images and media
│   ├── components/
│   │   ├── AnswerPanel.jsx  # Monaco editor + Groq-powered answer checker
│   │   ├── Card.jsx         # Reusable card component
│   │   ├── Navbar.jsx       # Top navigation with auth controls
│   │   └── Spinner.jsx      # Loading spinner
│   ├── pages/
│   │   ├── Dashboard.jsx    # Main daily question view (home page)
│   │   ├── Login.jsx        # Firebase Google Sign-In page
│   │   └── ProgressPage.jsx # Heatmap + bookmarks + history
│   ├── services/
│   │   ├── api.js           # Gemini AI + Groq + NewsAPI integration
│   │   ├── db.js            # Firestore helpers (streaks, bookmarks, history)
│   │   ├── firebase.js      # Firebase app initialization
│   │   └── runner.js        # Code execution helper (judge utilities)
│   ├── App.jsx              # Root component with routing
│   ├── App.css              # App-level styles
│   ├── index.css            # Global CSS design system (variables, components)
│   └── main.jsx             # React entry point
├── .env                     # Environment variables (not committed)
├── .gitignore
├── index.html
├── package.json
├── vercel.json              # Vercel deployment config (SPA rewrites)
└── vite.config.js
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 + Vite 8 |
| **Styling** | Tailwind CSS 4 + Custom CSS Variables |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`) |
| **Routing** | React Router DOM v7 |
| **Authentication** | Firebase Auth (Google OAuth) |
| **Database** | Firebase Firestore |
| **AI – Questions** | Google Gemini 2.0 Flash API |
| **AI – Answer Check** | Groq API (LLaMA 3.1 8B Instant) |
| **News** | NewsAPI.org |
| **Deployment** | Vercel |

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js ≥ 18
- A Firebase project (free)
- Google Gemini API key ([get one here](https://aistudio.google.com/apikey))
- Groq API key ([free at console.groq.com](https://console.groq.com))
- NewsAPI key ([free at newsapi.org](https://newsapi.org))

### 1. Clone the repository

```bash
git clone https://github.com/Harshaghera111/PrepFlow-AI.git
cd PrepFlow-AI
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
# Google Gemini AI (for daily question generation)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Groq AI (for answer checking — free tier: 6000 req/day)
VITE_GROQ_API_KEY=your_groq_api_key_here

# NewsAPI (for tech news feed)
VITE_NEWS_API_KEY=your_newsapi_key_here

# Firebase (get from your Firebase project settings)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> ⚠️ **Never commit your `.env` file.** It's already listed in `.gitignore`.

### 4. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com) and create a new project
2. Enable **Authentication** → Sign-in method → **Google**
3. Enable **Firestore Database** → Start in production mode
4. Add your domain to the **Authorized Domains** list in Firebase Auth settings

### 5. Run locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🚀 Deployment (Vercel)

This project is pre-configured for Vercel with SPA routing support via `vercel.json`.

```bash
# Install Vercel CLI (optional)
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repository to [vercel.com](https://vercel.com) for automatic deployments on every push.

> Add all your `.env` variables to Vercel's **Environment Variables** settings in the project dashboard.

---

## 📐 Firestore Data Schema

```
users/
  {userId}/
    streak: number              ← current streak count
    days/
      {YYYY-MM-DD}/
        solved: boolean
        hintsUsed: number
        lastUpdated: timestamp
    bookmarks/
      {bm_timestamp}/
        question: string
        hint: string
        difficulty: string
        topic: string
        company: string
        savedAt: timestamp

dailyContent/
  {YYYY-MM-DD}/                ← cached daily question (reduces API calls)
    question: string
    hint: string
    difficulty: string
    topic: string
    company: string
    articles: array
    generatedAt: timestamp
```

---

## 📦 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a pull request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Harsh Aghera**
- GitHub: [@Harshaghera111](https://github.com/Harshaghera111)

---

> Built with ❤️ to help developers ace their coding interviews, one question at a time.
