import { createContext, useContext, useState, useEffect } from "react";
import { fetchAllMCQs } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mcqsPreloaded, setMcqsPreloaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("driveiq_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // If a user session is restored and MCQs are not cached, preload them
    const cached = localStorage.getItem("driveiq_mcqs_cache");
    if (user && !cached) {
      preloadMCQs();
    }
  }, [user]);

  const preloadMCQs = async () => {
    try {
      const q = await fetchAllMCQs();
      if (q && Array.isArray(q)) setMcqsPreloaded(true);
      return q;
    } catch (err) {
      console.error("preloadMCQs failed", err);
      return null;
    }
  };

  const login = async (userData) => {
    setUser(userData);
    localStorage.setItem("driveiq_user", JSON.stringify(userData));
    // Preload MCQs immediately after login to avoid delay when user starts test
    await preloadMCQs();
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("driveiq_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, preloadMCQs, mcqsPreloaded }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
