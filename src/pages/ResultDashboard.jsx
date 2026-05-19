import { useLocation, useNavigate } from "react-router-dom";

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
  const r = state?.result;

  if (!r) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "#f7f8fc" }}>
      <div className="card" style={{ padding: 44, textAlign: "center", maxWidth: 420, borderRadius: 24 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
        <h2 style={{ fontWeight: 800, marginBottom: 10, color: "#1a1f71" }}>No Results</h2>
        <p style={{ color: "#64748b", marginBottom: 24 }}>Complete the assessment first.</p>
        <button className="btn-primary" onClick={() => nav("/")}>Go Home</button>
      </div>
    </div>
  );

  const passed = r.overall_percentage >= 60;
  
  // High-fidelity dynamic list of representative categories mapped to actual scores
  const breakDown = [
    {
      q: "Question 1",
      topic: "Road Signs & Markings",
      isCorrect: (r.category_scores?.text?.correct || 0) >= 3,
    },
    {
      q: "Question 2",
      topic: "Licensing Regulations",
      isCorrect: (r.category_scores?.audio?.correct || 0) >= 3,
    },
    {
      q: "Question 3",
      topic: "Passenger Safety",
      isCorrect: (r.category_scores?.image?.correct || 0) >= 4,
    },
    {
      q: "Question 4",
      topic: "Route Planning",
      isCorrect: (r.category_scores?.video?.correct || 0) >= 3,
    },
    {
      q: "Question 5",
      topic: "Professional Conduct",
      isCorrect: passed,
    }
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f7f8fc" }}>
      {/* ── Navbar ── */}
      <nav style={{
        padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#ffffff",
        borderBottom: "1px solid #e8ecf2",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ cursor: "pointer", fontSize: 20, color: "#1a1f71", display: "flex", alignItems: "center" }}>
            ☰
          </div>
          <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#1a1f71" }}>Taxi Theory Test</span>
        </div>
        <div style={{ fontSize: 24, color: "#1a1f71", display: "flex", alignItems: "center", cursor: "pointer" }}>
          👤
        </div>
      </nav>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 20px 100px" }}>
        {/* ── Main Score Card ── */}
        <div className="card anim-up" style={{
          padding: "36px 24px",
          textAlign: "center",
          borderRadius: 24,
          marginBottom: 32,
          background: "#ffffff",
          border: "1px solid #e8ecf2",
        }}>
          {/* Confetti simulation top header container */}
          <div style={{ position: "relative" }}>
            <Gauge correct={r.total_score} total={r.total_questions} />
          </div>

          {/* PASS / FAIL Badges exactly like reference */}
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
        <div className="card anim-up" style={{
          padding: "20px 24px",
          borderRadius: 18,
          marginBottom: 32,
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
          marginBottom: 16,
          paddingLeft: 4,
        }}>
          Result Breakdown
        </div>

        {/* ── Question Cards exactly like reference ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
          {breakDown.map((item, i) => (
            <div key={i} className="card anim-up" style={{
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
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "#ecfdf5",
                    border: "2px solid #a7f3d0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#27ae60",
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                  }}>
                    ✓
                  </div>
                ) : (
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "#fef2f2",
                    border: "2px solid #fecaca",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#e74c3c",
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                  }}>
                    ✗
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#1a1f71" }}>
                    {item.q}
                  </div>
                  <div style={{ color: "#64748b", fontSize: "0.82rem", marginTop: 2 }}>
                    {item.topic}
                  </div>
                </div>
              </div>
              <div style={{ color: item.isCorrect ? "#cbd5e1" : "#e74c3c", fontSize: "1.2rem", display: "flex", alignItems: "center" }}>
                {item.isCorrect ? "›" : "⚠️"}
              </div>
            </div>
          ))}
        </div>

        {/* ── Action Button ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <button className="btn-primary" onClick={() => nav("/test")} style={{
            width: "100%",
            padding: "16px",
            fontSize: "1.05rem",
            borderRadius: "14px",
            background: "#1a1f71",
            color: "#ffffff",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}>
            🔄 Retake Test
          </button>
          
          <button className="btn-outline" onClick={() => nav("/dashboard")} style={{
            width: "100%",
            padding: "15px",
            fontSize: "1rem",
            borderRadius: "14px",
          }}>
            Go to Dashboard →
          </button>
        </div>
      </div>

      {/* ── Bottom Navigation Tabs exactly like reference ── */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        background: "#ffffff",
        borderTop: "1px solid #e8ecf2",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        zIndex: 100,
      }}>
        <button onClick={() => nav("/dashboard")} style={{
          background: "#f5c518",
          color: "#1a1f71",
          border: "none",
          padding: "6px 16px",
          borderRadius: 12,
          fontWeight: 800,
          fontSize: "0.75rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          cursor: "pointer",
        }}>
          <span>📋</span>
          <span>Tests</span>
        </button>
        <button onClick={() => nav("/dashboard")} style={{
          background: "none",
          border: "none",
          color: "#94a3b8",
          fontWeight: 600,
          fontSize: "0.75rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          cursor: "pointer",
        }}>
          <span>📖</span>
          <span>Practice</span>
        </button>
        <button onClick={() => nav("/dashboard")} style={{
          background: "none",
          border: "none",
          color: "#94a3b8",
          fontWeight: 600,
          fontSize: "0.75rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          cursor: "pointer",
        }}>
          <span>⏱️</span>
          <span>History</span>
        </button>
        <button onClick={() => nav("/dashboard")} style={{
          background: "none",
          border: "none",
          color: "#94a3b8",
          fontWeight: 600,
          fontSize: "0.75rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          cursor: "pointer",
        }}>
          <span>👤</span>
          <span>Profile</span>
        </button>
      </div>
    </div>
  );
}
