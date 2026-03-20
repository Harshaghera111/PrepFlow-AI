// App.jsx — Root component with React Router
// Routes: / (Dashboard) | /progress (Progress Page)

import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./services/firebase";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProgressPage from "./pages/ProgressPage";
import Navbar from "./components/Navbar";
import Spinner from "./components/Spinner";

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  if (authLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <Spinner message="Loading PrepFlow AI..." />
      </div>
    );
  }

  const isLoggedIn = user || demoMode;

  return (
    <BrowserRouter>
      {isLoggedIn && (
        <Navbar
          user={user}
          streak={streak}
          demoMode={demoMode}
          onExitDemo={() => setDemoMode(false)}
        />
      )}
      <Routes>
        {!isLoggedIn ? (
          <Route path="*" element={<Login onDemo={() => setDemoMode(true)} setDemoMode={setDemoMode} />} />
        ) : (
          <>
            <Route
              path="/"
              element={<Dashboard user={user} onStreakChange={setStreak} />}
            />
            <Route
              path="/progress"
              element={<ProgressPage user={user} />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
