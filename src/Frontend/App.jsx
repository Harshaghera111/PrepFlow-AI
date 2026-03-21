// App.jsx — Root component with routing and global theme management
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../Backend/services/firebase";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import DashboardPremium from "./pages/DashboardPremium";
import ProgressPage from "./pages/ProgressPage";
import Navbar from "./components/Navbar";
import Spinner from "./components/Spinner";
import { AnimatePresence, motion } from "framer-motion";

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [streak, setStreak] = useState(0);
  const [theme, setTheme] = useState(() => localStorage.getItem("pf_theme") || "dark");

  // Apply theme to <html> element whenever it changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("pf_theme", theme);
  }, [theme]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  if (authLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg)" }}>
        <Spinner message="Loading PrepFlow AI..." />
      </div>
    );
  }

  const isLoggedIn = user || demoMode;

  return (
    <BrowserRouter>
      <AppRoutes
        isLoggedIn={isLoggedIn}
        user={user}
        demoMode={demoMode}
        theme={theme}
        streak={streak}
        onExitDemo={() => setDemoMode(false)}
        onToggleTheme={toggleTheme}
        onStartDemo={() => setDemoMode(true)}
        setDemoMode={setDemoMode}
        onStreakChange={setStreak}
      >
        {isLoggedIn && (
          <Navbar
            user={user}
            streak={streak}
            demoMode={demoMode}
            theme={theme}
            onExitDemo={() => setDemoMode(false)}
            onToggleTheme={toggleTheme}
          />
        )}
      </AppRoutes>
    </BrowserRouter>
  );
}

export default App;

function AppRoutes({
  isLoggedIn,
  user,
  demoMode,
  theme,
  streak,
  onExitDemo,
  onToggleTheme,
  onStartDemo,
  setDemoMode,
  onStreakChange,
  children,
}) {
  const location = useLocation();

  return (
    <div>
      {children}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${location.pathname}-${isLoggedIn ? "in" : "out"}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <Routes location={location}>
            {!isLoggedIn ? (
              <>
                <Route
                  path="/"
                  element={
                    <Landing
                      theme={theme}
                      onToggleTheme={onToggleTheme}
                      onStartDemo={onStartDemo}
                    />
                  }
                />
                <Route path="/login" element={<Login setDemoMode={setDemoMode} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            ) : (
              <>
                <Route path="/" element={<DashboardPremium user={user} onStreakChange={onStreakChange} />} />
                <Route path="/progress" element={<ProgressPage user={user} />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
