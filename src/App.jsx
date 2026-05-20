import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
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
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Save current page to localStorage so we can restore after refresh
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem("driveiq_last_page", location.pathname);
      } else {
        localStorage.setItem("driveiq_last_page_guest", location.pathname);
      }
    } catch (e) {
      // ignore
    }
  }, [location.pathname, user]);

  // On initial load, if user is authenticated and is at root, redirect to last page
  useEffect(() => {
    if (loading) return;
    try {
      const last = localStorage.getItem("driveiq_last_page") || localStorage.getItem("driveiq_last_page_guest");
      if (user && last && location.pathname === "/") {
        navigate(last, { replace: true });
      }
    } catch (e) {
      // ignore
    }
  }, [loading, user, location.pathname, navigate]);

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
