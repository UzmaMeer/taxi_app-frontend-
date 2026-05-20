import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchUserHistory, fetchLatestResult } from "../services/api";

function Gauge({ correct, total, size = 160, stroke = 12 }) {
  const pct = total > 0 ? (correct / total) * 100 : 0;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e8ecf2" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1a1f71" strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(0.22,1,0.36,1)" }}/>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "2.4rem", fontWeight: 800, color: "#1a1f71", lineHeight: 1 }}>
          {correct}/{total}
        </span>
        <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, marginTop: 4, textTransform: "uppercase", letterSpacing: "1.5px" }}>Score</span>
      </div>
    </div>
  );
}

export default function ResultDashboard() {
  const { state } = useLocation();
  const nav = useNavigate();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("tests");
  const [history, setHistory] = useState([]);
  const [latestResult, setLatestResult] = useState(state?.result || null);
  const [displayedResult, setDisplayedResult] = useState(state?.result || null);
  const [loading, setLoading] = useState(true);

  // Instant prefetching of all resources (like WhatsApp) on mount
  useEffect(() => {
    if (!user) return;
    
    Promise.all([
      fetchUserHistory(user.full_name),
      fetchLatestResult(user.full_name)
    ]).then(([histData, latestData]) => {
      setHistory(histData || []);
      const activeRes = state?.result || latestData;
      setLatestResult(activeRes);
      if (!displayedResult) {
        setDisplayedResult(activeRes);
      }
      setLoading(false);
    }).catch(err => {
      console.error("Failed prefetching data", err);
      setLoading(false);
    });
  }, [user, state?.result]);

  const handleViewHistoricalResult = (res) => {
    setDisplayedResult(res);
    setActiveTab("tests");
  };

  const handleResetToLatest = () => {
    setDisplayedResult(latestResult);
  };

  /* ─────────────────────── RENDER TESTS TAB ─────────────────────── */
  const renderTestsTab = () => {
    const r = displayedResult;
    if (!r) {
      return (
        <div className="anim-up" style={{ padding: "40px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
          <h2 style={{ fontWeight: 800, marginBottom: 10, color: "#1a1f71" }}>No Assessment Data</h2>
          <p style={{ color: "#64748b", marginBottom: 24, fontSize: "0.95rem" }}>You have not completed any test sessions yet.</p>
          <button className="btn-primary" onClick={() => nav("/test")} style={{ margin: "0 auto" }}>Begin Test</button>
        </div>
      );
    }

    const passed = r.overall_percentage >= 60;
    const isShowingHistory = latestResult && r._id !== latestResult._id;

    const breakDown = [
      { q: "Question 1", topic: "Road Signs & Markings", isCorrect: (r.category_scores?.text?.correct || 0) >= 3 },
      { q: "Question 2", topic: "Licensing Regulations", isCorrect: (r.category_scores?.audio?.correct || 0) >= 3 },
      { q: "Question 3", topic: "Passenger Safety", isCorrect: (r.category_scores?.image?.correct || 0) >= 4 },
      { q: "Question 4", topic: "Route Planning", isCorrect: (r.category_scores?.video?.correct || 0) >= 3 },
      { q: "Question 5", topic: "Professional Conduct", isCorrect: passed }
    ];

    return (
      <div className="anim-up">
        {isShowingHistory && (
          <div style={{
            background: "#fff9db",
            border: "1px solid #ffe3e3",
            padding: "10px 16px",
            borderRadius: 12,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.85rem",
            color: "#856404"
          }}>
            <span>Viewing historical test from <strong>{new Date(r.submitted_at).toLocaleDateString()}</strong></span>
            <button onClick={handleResetToLatest} style={{
              background: "#1a1f71",
              color: "#fff",
              border: "none",
              padding: "4px 10px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: "0.75rem",
              fontWeight: 700
            }}>Latest Result</button>
          </div>
        )}

        {/* ── Main Score Card ── */}
        <div className="card" style={{
          padding: "36px 24px",
          textAlign: "center",
          borderRadius: 24,
          marginBottom: 24,
          background: "#ffffff",
          border: "1px solid #e8ecf2",
        }}>
          <Gauge correct={r.total_score} total={r.total_questions} />

          {/* PASS / FAIL Badges */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
            <div style={{
              background: passed ? "#f5c518" : "#e74c3c",
              color: passed ? "#1a1f71" : "#ffffff",
              padding: "8px 26px",
              borderRadius: "999px",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 800,
              fontSize: "0.95rem",
              letterSpacing: "0.5px",
              boxShadow: passed ? "0 4px 12px rgba(245, 197, 24, 0.3)" : "0 4px 12px rgba(231, 76, 60, 0.3)",
            }}>
              <span style={{ fontSize: "1.1rem" }}>{passed ? "⭐" : "⚠️"}</span>
              <span>{passed ? "PASS" : "FAIL"}</span>
            </div>
          </div>

          <p style={{
            color: "#475569",
            fontSize: "0.95rem",
            lineHeight: 1.6,
            marginTop: 20,
            maxWidth: 460,
            margin: "20px auto 0",
            fontWeight: 500,
          }}>
            {passed 
              ? "Excellent work! You have met the required standard for this section." 
              : "Additional preparation is recommended. You did not meet the passing standard."}
          </p>
        </div>

        {/* ── Recommendation Box ── */}
        <div className="card" style={{
          padding: "20px 24px",
          borderRadius: 18,
          marginBottom: 24,
          background: "#f1f3f9",
          border: "1px solid #d1d5e4",
        }}>
          <h4 style={{ fontSize: "0.9rem", fontWeight: 800, color: "#1a1f71", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            📋 Driver Verdict
          </h4>
          <p style={{ color: "#475569", fontSize: "0.88rem", lineHeight: 1.6 }}>
            {r.recommendation}
          </p>
        </div>

        {/* ── Result Breakdown Section Header ── */}
        <div style={{
          fontSize: "0.78rem",
          fontWeight: 700,
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "1px",
          marginBottom: 12,
          paddingLeft: 4,
        }}>
          Result Breakdown
        </div>

        {/* ── Question Cards ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {breakDown.map((item, i) => (
            <div key={i} className="card card-hover" style={{
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: 16,
              background: "#ffffff",
              border: "1px solid #e8ecf2",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {item.isCorrect ? (
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: "#ecfdf5", border: "2px solid #a7f3d0",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#27ae60", fontSize: "1.1rem", fontWeight: "bold",
                  }}>✓</div>
                ) : (
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: "#fef2f2", border: "2px solid #fecaca",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#e74c3c", fontSize: "1.1rem", fontWeight: "bold",
                  }}>✗</div>
                )}
                <div>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#1a1f71" }}>{item.q}</div>
                  <div style={{ color: "#64748b", fontSize: "0.82rem", marginTop: 2 }}>{item.topic}</div>
                </div>
              </div>
              <div style={{ color: item.isCorrect ? "#cbd5e1" : "#e74c3c", fontSize: "1.2rem", display: "flex", alignItems: "center" }}>
                {item.isCorrect ? "›" : "⚠️"}
              </div>
            </div>
          ))}
        </div>

        {/* ── Action Buttons ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button className="btn-primary" onClick={() => nav("/test")} style={{
            width: "100%", padding: "16px", fontSize: "1.05rem", borderRadius: "14px",
            background: "#1a1f71", color: "#ffffff", fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}>
            🔄 Retake Test
          </button>
          <button className="btn-outline" onClick={() => nav("/dashboard")} style={{
            width: "100%", padding: "15px", fontSize: "1rem", borderRadius: "14px",
          }}>
            Go to Dashboard →
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
          {history.map((h, index) => {
            const dateStr = new Date(h.submitted_at).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
            });
            const hPassed = h.overall_percentage >= 60;
            const isCurrent = displayedResult && h._id === displayedResult._id;

            return (
              <div key={h._id} className="card card-hover" style={{
                padding: "20px", borderRadius: 16, background: "#ffffff",
                border: isCurrent ? "2px solid #f5c518" : "1px solid #e8ecf2",
                boxShadow: isCurrent ? "0 4px 16px rgba(245, 197, 24, 0.15)" : "none"
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

                  {isCurrent ? (
                    <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#f5c518", display: "flex", alignItems: "center", gap: 4 }}>
                      Selected Result ✓
                    </span>
                  ) : (
                    <button onClick={() => handleViewHistoricalResult(h)} className="btn-outline" style={{
                      padding: "6px 14px", fontSize: "0.75rem", borderRadius: 8, border: "1px solid #1a1f71", color: "#1a1f71"
                    }}>
                      View Analytics →
                    </button>
                  )}
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
    <div style={{ minHeight: "100vh", background: "#f7f8fc" }}>
      {/* ── Navbar ── */}
      <nav style={{
        padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#ffffff",
        borderBottom: "1px solid #e8ecf2",
        position: "sticky", top: 0, zIndex: 100
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }} onClick={() => nav("/dashboard")}>
          <div style={{ cursor: "pointer", fontSize: 20, color: "#1a1f71", display: "flex", alignItems: "center" }}>
            🚗
          </div>
          <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#1a1f71", cursor: "pointer" }}>DriveIQ</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#1a1f71", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.65rem", fontWeight: 800 }}>
            {user?.full_name?.charAt(0)?.toUpperCase() || "D"}
          </div>
          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1a1f71" }}>{user?.full_name}</span>
        </div>
      </nav>

      {/* Main Container */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 20px 100px" }}>
        {activeTab === "tests" && renderTestsTab()}
        {activeTab === "practice" && renderPracticeTab()}
        {activeTab === "history" && renderHistoryTab()}
        {activeTab === "profile" && renderProfileTab()}
      </div>

      {/* ── Bottom Navigation Tabs (Dynamic State Switcher) ── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, height: 68,
        background: "#ffffff", borderTop: "1px solid #e8ecf2",
        display: "flex", justifyContent: "space-around", alignItems: "center",
        zIndex: 100, boxShadow: "0 -4px 16px rgba(0, 0, 0, 0.05)"
      }}>
        <button onClick={() => setActiveTab("tests")} style={{
          background: activeTab === "tests" ? "#f5c518" : "none",
          color: activeTab === "tests" ? "#1a1f71" : "#94a3b8",
          border: "none", padding: "6px 16px", borderRadius: 12, fontWeight: 800, fontSize: "0.75rem",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer",
          transition: "all 0.2s"
        }}>
          <span>📋</span>
          <span>Tests</span>
        </button>

        <button onClick={() => setActiveTab("practice")} style={{
          background: activeTab === "practice" ? "#f5c518" : "none",
          color: activeTab === "practice" ? "#1a1f71" : "#94a3b8",
          border: "none", padding: "6px 16px", borderRadius: 12, fontWeight: 800, fontSize: "0.75rem",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer",
          transition: "all 0.2s"
        }}>
          <span>📖</span>
          <span>Practice</span>
        </button>

        <button onClick={() => setActiveTab("history")} style={{
          background: activeTab === "history" ? "#f5c518" : "none",
          color: activeTab === "history" ? "#1a1f71" : "#94a3b8",
          border: "none", padding: "6px 16px", borderRadius: 12, fontWeight: 800, fontSize: "0.75rem",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer",
          transition: "all 0.2s"
        }}>
          <span>⏱️</span>
          <span>History</span>
        </button>

        <button onClick={() => setActiveTab("profile")} style={{
          background: activeTab === "profile" ? "#f5c518" : "none",
          color: activeTab === "profile" ? "#1a1f71" : "#94a3b8",
          border: "none", padding: "6px 16px", borderRadius: 12, fontWeight: 800, fontSize: "0.75rem",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer",
          transition: "all 0.2s"
        }}>
          <span>👤</span>
          <span>Profile</span>
        </button>
      </div>
    </div>
  );
}
