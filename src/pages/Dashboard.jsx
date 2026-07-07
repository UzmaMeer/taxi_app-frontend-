import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchUserHistory, fetchLatestResult, fetchAllMCQs } from "../services/api";

const CATEGORIES = [
  {
    key: "text", icon: "📝", title: "Text-Based MCQs", count: 5,
    desc: "Scenario-driven questions evaluating decision-making in real driving situations.",
    color: "#1a1f71", bg: "#eef0fa", border: "#c7cce6", tag: "Cognitive",
  },
  {
    key: "audio", icon: "🎧", title: "Audio-Based MCQs", count: 5,
    desc: "Listen to realistic driving scenarios and choose the safest course of action.",
    color: "#1a1f71", bg: "#eef0fa", border: "#c7cce6", tag: "Perception",
  },
  {
    key: "image", icon: "🖼️", title: "Image Psychometrics", count: 5,
    desc: "Analyze visual driving scenes to evaluate psychological response and empathy.",
    color: "#1a1f71", bg: "#eef0fa", border: "#c7cce6", tag: "Emotional",
  },
  {
    key: "video", icon: "🎬", title: "Video Scenarios", count: 5,
    desc: "Watch dynamic video clips of road hazards to test real-time reaction.",
    color: "#1a1f71", bg: "#eef0fa", border: "#c7cce6", tag: "Reactive",
  },
];

const QUICK_STATS = [
  { icon: "📋", value: "20", label: "Total Questions" },
  { icon: "⏱️", value: "12 min", label: "Time Limit" },
  { icon: "⚡", value: "< 1 sec", label: "API Speed" },
  { icon: "🏆", value: "Instant", label: "Results" },
];

export default function Dashboard() {
  const nav = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "tests");
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [history, setHistory] = useState([]);
  const [latestResult, setLatestResult] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const greetHour = new Date().getHours();
  const greeting = greetHour < 12 ? "Good Morning" : greetHour < 17 ? "Good Afternoon" : "Good Evening";

  // Prefetch data immediately on load (like WhatsApp)
  useEffect(() => {
    if (!user) return;
    
    Promise.all([
      fetchUserHistory(user.full_name),
      fetchLatestResult(user.full_name),
      fetchAllMCQs()
    ]).then(([histData, latestData, mcqData]) => {
      setHistory(histData || []);
      setLatestResult(latestData);
      setQuestions(mcqData || []);
      setLoading(false);
    }).catch(err => {
      console.error("Failed prefetching dashboard data", err);
      setLoading(false);
    });
  }, [user]);

  const totalQuestions = questions.length || 20;

  const dynamicQuickStats = [
    { icon: "📋", value: String(totalQuestions), label: "Total Questions" },
    { icon: "⏱️", value: `${Math.ceil(totalQuestions * 36 / 60)} min`, label: "Time Limit" },
    { icon: "⚡", value: "< 1 sec", label: "API Speed" },
    { icon: "🏆", value: "Instant", label: "Results" },
  ];

  const dynamicCategories = [
    {
      key: "text", icon: "📝", title: "Text-Based MCQs", count: questions.filter(q => q.category === "text").length || 5,
      desc: "Scenario-driven questions evaluating decision-making in real driving situations.",
      bg: "#eef0fa", border: "#c7cce6", tag: "Cognitive",
    },
    {
      key: "audio", icon: "🎧", title: "Audio-Based MCQs", count: questions.filter(q => q.category === "audio").length || 5,
      desc: "Listen to realistic driving scenarios and choose the safest course of action.",
      bg: "#eef0fa", border: "#c7cce6", tag: "Perception",
    },
    {
      key: "image", icon: "🖼️", title: "Image Psychometrics", count: questions.filter(q => q.category === "image").length || 5,
      desc: "Analyze visual driving scenes to evaluate psychological response and empathy.",
      bg: "#eef0fa", border: "#c7cce6", tag: "Emotional",
    },
    {
      key: "video", icon: "🎬", title: "Video Scenarios", count: questions.filter(q => q.category === "video").length || 5,
      desc: "Watch dynamic video clips of road hazards to test real-time reaction.",
      bg: "#eef0fa", border: "#c7cce6", tag: "Reactive",
    },
  ];

  /* ─────────────────────── RENDER TESTS TAB ─────────────────────── */
  const renderTestsTab = () => {
    const passedLatest = latestResult?.overall_percentage >= 60;
    
    return (
      <div className="anim-up">
        {/* Welcome Section */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: "0.88rem", color: "#64748b", fontWeight: 500, marginBottom: 4 }}>{greeting} 👋</p>
          <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 900, color: "#1a1f71", marginBottom: 6 }}>
            Welcome, <span style={{ color: "#1a1f71" }}>{user?.full_name || "Driver"}</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.6, maxWidth: 520 }}>
            Evaluate your driving skills with simulated text, audio, image, and video scenarios to unlock premium taxi shifts.
          </p>
        </div>

        {/* Latest Verdict Quick Badge if exists */}
        {latestResult && (
          <div className="card card-hover" onClick={() => nav("/result", { state: { result: latestResult } })} style={{
            padding: "16px 20px", borderRadius: 16, background: "#ffffff", border: "1.5px solid #f5c518",
            display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, cursor: "pointer",
            boxShadow: "0 4px 16px rgba(245, 197, 24, 0.1)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 24 }}>🏆</span>
              <div>
                <h4 style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1a1f71" }}>Latest Assessment Verdict</h4>
                <p style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 2 }}>
                  Score: <strong>{latestResult.total_score}/{latestResult.total_questions} ({latestResult.overall_percentage}%)</strong> • {latestResult.risk_level} Risk
                </p>
              </div>
            </div>
            <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#1a1f71" }}>Report →</span>
          </div>
        )}

        {/* Quick stats grid */}
        <div className="card" style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: 10, padding: "14px", marginBottom: 28, borderRadius: 18,
          background: "#ffffff", border: "1px solid #e8ecf2",
        }}>
          {dynamicQuickStats.map((s, i) => (
            <div key={i} style={{
              textAlign: "center",
              borderRight: i < 3 ? "1px solid #e8ecf2" : "none",
              padding: "4px 0"
            }}>
              <div style={{ fontSize: 20, marginBottom: 2 }}>{s.icon}</div>
              <div style={{ fontSize: "1rem", fontWeight: 800, color: "#1a1f71" }}>{s.value}</div>
              <div style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Assessment categories header */}
        <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: 4, color: "#1a1f71" }}>
          Assessment Categories
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "0.82rem", marginBottom: 18 }}>
          Take individual category challenges or the full unified evaluation.
        </p>

        {/* Categories List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
          {dynamicCategories.map((c, i) => (
            <div key={i} className="card card-hover" 
              onClick={() => nav("/test", { state: { startCategory: c.key } })}
              style={{
                padding: "20px 22px", cursor: "pointer", display: "flex", alignItems: "center", justifySelf: "stretch",
                justifyContent: "space-between", background: "#ffffff", border: "1px solid #e8ecf2", borderRadius: 16
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 12,
                  background: c.bg, border: `1px solid ${c.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22,
                }}>{c.icon}</div>
                <div>
                  <h3 style={{ fontSize: "0.98rem", fontWeight: 800, color: "#1a1f71", marginBottom: 3 }}>{c.title}</h3>
                  <p style={{ fontSize: "0.78rem", color: "#64748b", lineHeight: 1.4 }}>{c.desc}</p>
                </div>
              </div>
              <div style={{ textAlign: "right", marginLeft: 16 }}>
                <span style={{
                  padding: "3px 8px", borderRadius: 6,
                  background: "#f5c518", color: "#1a1f71",
                  fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase",
                }}>{c.tag}</span>
                <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: 6, fontWeight: 600 }}>{c.count} Qs</div>
              </div>
            </div>
          ))}
        </div>

        {/* Unified start test card */}
        <div className="card" style={{
          padding: "24px 20px", background: "linear-gradient(135deg, #1a1f71 0%, #2a3182 100%)",
          color: "#ffffff", borderRadius: 20, border: "none", textAlign: "center"
        }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: 6 }}>🧪 Unified Theory Assessment</h3>
          <p style={{ opacity: 0.85, fontSize: "0.82rem", lineHeight: 1.5, maxWidth: 460, margin: "0 auto 16px" }}>
            Take the complete 20-question multi-media exam covering driving judgment, perception, hazard reactive drills, and psychometrics.
          </p>
          <button className="btn-primary" onClick={() => nav("/test")} style={{
            background: "#f5c518", color: "#1a1f71", padding: "12px 36px", fontSize: "0.95rem", border: "none", margin: "0 auto"
          }}>
            Begin Assessment →
          </button>
        </div>
      </div>
    );
  };

  /* ─────────────────────── RENDER PRACTICE TAB ─────────────────────── */
  const renderPracticeTab = () => {
    const modules = [
      { icon: "📝", title: "Cognitive Module", desc: "Rules of the road, traffic regulations, & road sign vocabulary.", progress: 100, status: "Completed" },
      { icon: "🎧", title: "Perception Module", desc: "Emergency hazard audios & sound cues in low-visibility environments.", progress: 85, status: "Active" },
      { icon: "🖼️", title: "Emotional Psychometrics", desc: "Driver empathy, active listening, & managing upset passenger cues.", progress: 70, status: "Active" },
      { icon: "🎬", title: "Reactive Hazard Module", desc: "Interactive emergency braking and text-driving video drills.", progress: 50, status: "In Progress" },
    ];

    return (
      <div className="anim-up">
        {/* Practice Hero */}
        <div className="card" style={{
          padding: "28px 24px", borderRadius: 20, marginBottom: 24,
          background: "linear-gradient(135deg, #1a1f71 0%, #343b8a 100%)",
          color: "#ffffff", border: "none", position: "relative", overflow: "hidden"
        }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 900, marginBottom: 6 }}>DriveIQ Practice Center</h2>
          <p style={{ fontSize: "0.85rem", opacity: 0.85, lineHeight: 1.5, maxWidth: 450, marginBottom: 18 }}>
            Hone your driving judgment, perception, and psychology using our mock training drills. Keep your score above 80% to maintain gold shift eligibility!
          </p>
          <button onClick={() => nav("/test")} className="btn-primary" style={{
            background: "#f5c518", color: "#1a1f71", padding: "10px 20px", fontSize: "0.85rem", border: "none"
          }}>
            ⚡ Launch Quick Mock Test
          </button>
        </div>

        <div style={{
          fontSize: "0.78rem", fontWeight: 700, color: "#64748b",
          textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12, paddingLeft: 4
        }}>
          Interactive Training Modules
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {modules.map((m, idx) => (
            <div key={idx} className="card card-hover" style={{ padding: "18px 20px", borderRadius: 16, background: "#ffffff", border: "1px solid #e8ecf2" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: "#f0f2fa",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
                }}>{m.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h3 style={{ fontWeight: 800, fontSize: "0.95rem", color: "#1a1f71" }}>{m.title}</h3>
                    <span style={{
                      fontSize: "0.68rem", fontWeight: 800, padding: "2px 8px", borderRadius: 6,
                      background: m.progress === 100 ? "#ecfdf5" : "#fff9db",
                      color: m.progress === 100 ? "#10b981" : "#f5c518"
                    }}>{m.status}</span>
                  </div>
                  <p style={{ color: "#64748b", fontSize: "0.82rem", margin: "4px 0 12px", lineHeight: 1.5 }}>{m.desc}</p>
                  
                  {/* Progress bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1, height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${m.progress}%`, height: "100%", background: "#1a1f71", borderRadius: 3 }}/>
                    </div>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569" }}>{m.progress}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ─────────────────────── RENDER HISTORY TAB ─────────────────────── */
  const renderHistoryTab = () => {
    if (loading) {
      return (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #e8ecf2", borderTop: "3px solid #1a1f71", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }}/>
          <p style={{ color: "#64748b", fontWeight: 500, fontSize: "0.9rem" }}>Fetching test logs…</p>
        </div>
      );
    }

    if (!history || history.length === 0) {
      return (
        <div className="anim-up" style={{ padding: "40px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>⏱️</div>
          <h2 style={{ fontWeight: 800, marginBottom: 10, color: "#1a1f71" }}>No Test History</h2>
          <p style={{ color: "#64748b", marginBottom: 24, fontSize: "0.95rem" }}>You haven't completed any assessments yet.</p>
          <button className="btn-primary" onClick={() => nav("/test")} style={{ margin: "0 auto" }}>Take Your First Test</button>
        </div>
      );
    }

    return (
      <div className="anim-up">
        <div style={{
          fontSize: "0.78rem", fontWeight: 700, color: "#64748b",
          textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14, paddingLeft: 4
        }}>
          Assessment History Timeline
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {history.map((h) => {
            const dateStr = new Date(h.submitted_at).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
            });
            const hPassed = h.overall_percentage >= 60;

            return (
              <div key={h._id} className="card card-hover" style={{
                padding: "20px", borderRadius: 16, background: "#ffffff", border: "1px solid #e8ecf2"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8" }}>{dateStr}</span>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1a1f71", marginTop: 2 }}>
                      Score: {h.total_score}/{h.total_questions}
                    </h3>
                  </div>
                  <div style={{
                    background: hPassed ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                    color: hPassed ? "#10b981" : "#ef4444",
                    fontWeight: 800, fontSize: "0.7rem", padding: "4px 10px", borderRadius: 8,
                    textTransform: "uppercase"
                  }}>
                    {hPassed ? "PASSED" : "FAILED"}
                  </div>
                </div>

                <p style={{ color: "#64748b", fontSize: "0.82rem", lineHeight: 1.5, margin: "0 0 16px" }}>
                  {h.risk_level} Risk • {h.is_eligible_12hr ? "Eligible for 12h shifts" : "Short distance trips only"}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 4, background: "#f1f3f9", color: "#64748b", fontWeight: 700 }}>
                      Text: {h.category_scores?.text?.correct || 0}
                    </span>
                    <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 4, background: "#f1f3f9", color: "#64748b", fontWeight: 700 }}>
                      Video: {h.category_scores?.video?.correct || 0}
                    </span>
                  </div>

                  <button onClick={() => nav("/result", { state: { result: h } })} className="btn-outline" style={{
                    padding: "6px 14px", fontSize: "0.75rem", borderRadius: 8, border: "1px solid #1a1f71", color: "#1a1f71"
                  }}>
                    View Analytics →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /* ─────────────────────── RENDER PROFILE TAB ─────────────────────── */
  const renderProfileTab = () => {
    const passedLatest = latestResult?.overall_percentage >= 60;
    
    return (
      <div className="anim-up">
        {/* Profile Card */}
        <div className="card" style={{ padding: "32px 24px", borderRadius: 20, textAlign: "center", background: "#ffffff", border: "1px solid #e8ecf2", marginBottom: 24 }}>
          <div style={{ position: "relative", width: 90, height: 90, margin: "0 auto 16px" }}>
            <div style={{
              width: "100%", height: "100%", borderRadius: "50%", background: "#1a1f71",
              color: "#ffffff", fontSize: "2rem", fontWeight: 800, display: "flex",
              alignItems: "center", justifyContent: "center", border: "4px solid #f5c518",
              boxShadow: "0 0 16px rgba(245, 197, 24, 0.4)"
            }}>
              {user?.full_name?.charAt(0)?.toUpperCase() || "D"}
            </div>
            <div style={{
              position: "absolute", bottom: 0, right: 0, width: 26, height: 26, borderRadius: "50%",
              background: passedLatest ? "#10b981" : "#f5c518", border: "3px solid #ffffff",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11
            }}>
              {passedLatest ? "⭐" : "⚠️"}
            </div>
          </div>

          <h2 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#1a1f71" }}>{user?.full_name || "Driver"}</h2>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>
            {passedLatest ? "Certified Elite Taxi Operator" : "Restricted Duty Taxi Driver"}
          </span>

          <hr style={{ border: "none", height: 1, background: "#e8ecf2", margin: "20px 0" }}/>

          {/* Details list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
              <span style={{ color: "#64748b", fontWeight: 600 }}>Email Address</span>
              <strong style={{ color: "#1a1f71" }}>{user?.email || "uzma@gmail.com"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
              <span style={{ color: "#64748b", fontWeight: 600 }}>Active Status</span>
              <strong style={{ color: "#10b981" }}>Active Duty</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
              <span style={{ color: "#64748b", fontWeight: 600 }}>12h Shift Authorization</span>
              <strong style={{ color: passedLatest ? "#10b981" : "#ef4444" }}>
                {passedLatest ? "APPROVED" : "DENIED"}
              </strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
              <span style={{ color: "#64748b", fontWeight: 600 }}>Safety Risk Category</span>
              <strong style={{ color: passedLatest ? "#10b981" : "#f5c518" }}>
                {latestResult ? `${latestResult.risk_level} Risk` : "N/A"}
              </strong>
            </div>
          </div>
        </div>

        {/* Shift eligibility message */}
        <div className="card" style={{
          padding: "16px 20px", borderRadius: 16, background: passedLatest ? "#ecfdf5" : "#fef2f2",
          border: passedLatest ? "1px solid #a7f3d0" : "1px solid #fecaca", marginBottom: 24,
          display: "flex", alignItems: "flex-start", gap: 14
        }}>
          <span style={{ fontSize: 20 }}>{passedLatest ? "🛡️" : "⚠️"}</span>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontWeight: 800, fontSize: "0.88rem", color: passedLatest ? "#065f46" : "#991b1b", marginBottom: 4 }}>
              {passedLatest ? "12-Hour Shift Approved" : "Limited Shift Warning"}
            </h4>
            <p style={{ fontSize: "0.8rem", color: passedLatest ? "#047857" : "#b91c1c", lineHeight: 1.5 }}>
              {passedLatest 
                ? "Your psychometric safety score shows great attention, emotional stability, and reactive control. Safe to drive up to 12 hours."
                : "Your safety score is below the 80% gold standard. Restricted to daytime 6-hour shifts. Retake test to clear restriction."}
            </p>
          </div>
        </div>


        {/* Logout button */}
        <button onClick={logout} className="btn-outline" style={{
          width: "100%", padding: "15px", borderRadius: 14, color: "#ef4444", border: "2px solid #fecaca", fontWeight: 800
        }}>
          🚪 Log Out of DriveIQ
        </button>
      </div>
    );
  };

  return (
    <div className="test-layout">
      {/* MOBILE HEADER BAR */}
      <header style={{
        display: "none",
        position: "fixed", top: 0, left: 0, right: 0, height: 60,
        background: "#ffffff", borderBottom: "1px solid #e8ecf2",
        alignItems: "center", justifyContent: "space-between", padding: "0 20px",
        zIndex: 90, boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
      }} className="mobile-header-bar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🚗</span>
          <span style={{ fontSize: "1rem", fontWeight: 800, color: "#1a1f71" }}>DriveIQ Dashboard</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            background: "none", border: "none", fontSize: "1.5rem",
            color: "#1a1f71", cursor: "pointer", display: "flex", alignItems: "center"
          }}
          title="Toggle Sidebar"
        >
          ☰
        </button>
      </header>

      {/* PERSISTENT SIDEBAR */}
      <aside className={`test-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Close button on mobile sidebar */}
        <div style={{
          position: "absolute", top: 16, right: 16, display: "none", 
          cursor: "pointer", fontSize: "1.4rem", color: "#cbd5e1"
        }} className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
          ×
        </div>

        <div className="test-sidebar-header" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>🚗</span>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "1.15rem", fontWeight: 900, color: "#f5c518", letterSpacing: "0.5px" }}>DriveIQ</span>
              <span style={{ fontSize: "0.68rem", color: "#cbd5e1", fontWeight: 700, textTransform: "uppercase" }}>Driver Console</span>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            style={{
              background: "none", border: "none", color: "#cbd5e1", fontSize: "1.2rem", cursor: "pointer",
              padding: 4, display: "flex", alignItems: "center"
            }}
            className="sidebar-collapse-btn-desktop"
            title="Collapse Sidebar"
          >
            ◀
          </button>
        </div>

        {/* Driver profile details */}
        <div 
          className="test-sidebar-profile"
          onClick={() => { setActiveTab("profile"); setSidebarOpen(window.innerWidth > 768); }}
        >
          <div className="test-sidebar-avatar">
            {user?.full_name?.charAt(0)?.toUpperCase() || "D"}
          </div>
          <div style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
            <h4 style={{ fontSize: "0.88rem", fontWeight: 800, color: "#ffffff", marginBottom: 2 }}>{user?.full_name || "Driver"}</h4>
            <p style={{ fontSize: "0.72rem", color: "#cbd5e1", marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email}</p>
            <span style={{ fontSize: "0.62rem", background: "rgba(245, 197, 24, 0.15)", color: "#f5c518", padding: "2px 8px", borderRadius: 4, fontWeight: 800 }}>
              📋 DRIVER PROFILE
            </span>
          </div>
        </div>

        {/* Sidebar Navigation Options */}
        <div className="test-sidebar-menu">
          <button 
            className={`test-sidebar-item ${activeTab === "tests" ? "active" : ""}`}
            onClick={() => { setActiveTab("tests"); setSidebarOpen(window.innerWidth > 768); }}
          >
            <span>📋</span>
            <span>Theory Tests</span>
          </button>

          {/* Sub-menu categories under Theory Tests */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            paddingLeft: 20,
            marginTop: -2,
            marginBottom: 10,
            borderLeft: "2px solid rgba(255, 255, 255, 0.15)",
            marginLeft: 26
          }} className="anim-down">
            {[
              { id: "text", label: "Text Based", icon: "📝" },
              { id: "audio", label: "Audio TTS", icon: "🎧" },
              { id: "image", label: "Image Psych", icon: "🖼️" },
              { id: "video", label: "Video GIF", icon: "🎬" }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setSidebarOpen(window.innerWidth > 768);
                  nav("/test", { state: { startCategory: cat.id } });
                }}
                className="test-sidebar-item"
                style={{
                  padding: "8px 12px",
                  fontSize: "0.8rem",
                  borderRadius: 6
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          <button 
            className={`test-sidebar-item ${activeTab === "practice" ? "active" : ""}`}
            onClick={() => { setActiveTab("practice"); setSidebarOpen(window.innerWidth > 768); }}
          >
            <span>📖</span>
            <span>Training Mock Modules</span>
          </button>

          <button 
            className={`test-sidebar-item ${activeTab === "history" ? "active" : ""}`}
            onClick={() => { setActiveTab("history"); setSidebarOpen(window.innerWidth > 768); }}
          >
            <span>⏱️</span>
            <span>Assessment Log History</span>
          </button>

          <button 
            className={`test-sidebar-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => { setActiveTab("profile"); setSidebarOpen(window.innerWidth > 768); }}
          >
            <span>👤</span>
            <span>Profile Settings</span>
          </button>
        </div>

        {/* Footer actions */}
        <div style={{ padding: 16, borderTop: "1px solid #1e293b" }}>
          <button 
            className="test-exit-btn" 
            onClick={logout} 
            style={{ color: "#fca5a5 !important" }}
          >
            <span>🚪</span>
            <span>Sign Out of DriveIQ</span>
          </button>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="mobile-sidebar-backdrop"
          style={{ position: "fixed", top: 0, bottom: 0, left: 0, right: 0, background: "rgba(15, 23, 42, 0.4)", zIndex: 99 }}
        />
      )}

      {/* MAIN CONTENT DISPLAY */}
      <main className={`test-content-area ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          {/* Desktop Toggle Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }} className="desktop-toggle-header">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: "#ffffff", border: "1.5px solid #e8ecf2", borderRadius: 10,
                width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: 16, color: "#1a1f71", fontWeight: 800,
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
              }}
              title="Toggle Sidebar"
            >
              ☰
            </button>
            <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#1a1f71" }}>DriveIQ Dashboard Navigation</span>
          </div>

          {activeTab === "tests" && renderTestsTab()}
          {activeTab === "practice" && renderPracticeTab()}
          {activeTab === "history" && renderHistoryTab()}
          {activeTab === "profile" && renderProfileTab()}
        </div>
      </main>
    </div>
  );
}
