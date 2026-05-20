import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import TestSession from "./pages/TestSession";
import ResultDashboard from "./pages/ResultDashboard";
import { useEffect } from "react";
import { fetchAllMCQs, getMediaURL } from "./services/api";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<GuestRoute><SignUp /></GuestRoute>} />
      <Route path="/signin" element={<GuestRoute><SignIn /></GuestRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/test" element={<ProtectedRoute><TestSession /></ProtectedRoute>} />
      <Route path="/result" element={<ProtectedRoute><ResultDashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  // Background preloader matching WhatsApp's zero-delay architecture
  useEffect(() => {
    fetchAllMCQs()
      .then(questions => {
        questions.forEach(q => {
          if (q.media_url) {
            const url = getMediaURL(q.media_url);
            if (q.category === "image" || q.category === "video") {
              const img = new Image();
              img.src = url;
            } else if (q.category === "audio") {
              const audio = new Audio();
              audio.src = url;
              audio.preload = "auto";
            }
          }
        });
      })
      .catch(() => {});
  }, []);

  return (
    <AuthProvider>
      <div className="bg-pattern">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}
