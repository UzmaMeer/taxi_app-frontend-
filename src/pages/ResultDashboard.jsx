import { useLocation, useNavigate } from "react-router-dom";

const CAT = {
  text:  { icon: "📝", label: "Text Understanding",    color: "#4f46e5", bg: "#eef2ff" },
  audio: { icon: "🎧", label: "Audio Comprehension",   color: "#7c3aed", bg: "#ede9fe" },
  image: { icon: "🖼️", label: "Image Decision-Making", color: "#d97706", bg: "#fef3c7" },
  video: { icon: "🎬", label: "Video Reaction Time",   color: "#0ea5e9", bg: "#e0f2fe" },
};

function Gauge({ pct, size = 160, stroke = 12, color }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(0.22,1,0.36,1)" }}/>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span className="stat-num" style={{ color }}>{pct}<span style={{ fontSize: "1.1rem" }}>%</span></span>
        <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 700, marginTop: 2, textTransform: "uppercase", letterSpacing: "1px" }}>Score</span>
      </div>
    </div>
  );
}

function CatBar({ cat, score, delay }) {
  const m = CAT[cat] || { icon: "❓", label: cat, color: "#64748b", bg: "#f1f5f9" };
  return (
    <div className="card anim-up" style={{ padding: "clamp(20px,3vw,28px)", animationDelay: `${delay}s`, borderRadius: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 14,
          background: m.bg, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 22,
        }}>{m.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1e293b" }}>{m.label}</div>
          <div style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{score.correct} / {score.total} correct</div>
        </div>
        <div style={{ fontWeight: 900, fontSize: "1.4rem", color: m.color }}>{score.percentage}%</div>
      </div>
      <div style={{ width: "100%", height: 8, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${score.percentage}%`,
          background: `linear-gradient(90deg, ${m.color}, ${m.color}bb)`,
          borderRadius: 999,
          transition: "width 1.4s cubic-bezier(0.22,1,0.36,1)",
        }}/>
      </div>
    </div>
  );
}

export default function ResultDashboard() {
  const { state } = useLocation();
  const nav = useNavigate();
  const r = state?.result;

  if (!r) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="card" style={{ padding: 44, textAlign: "center", maxWidth: 420, borderRadius: 24 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
        <h2 style={{ fontWeight: 800, marginBottom: 10 }}>No Results</h2>
        <p style={{ color: "#64748b", marginBottom: 24 }}>Complete the assessment first.</p>
        <button className="btn-primary" onClick={() => nav("/")}>Go Home</button>
      </div>
    </div>
  );

  const mainColor = r.overall_percentage >= 80 ? "#10b981" : r.overall_percentage >= 60 ? "#f59e0b" : "#ef4444";
  const riskEmoji = r.risk_level === "Low" ? "🟢" : r.risk_level === "Medium" ? "🟡" : "🔴";
  const riskColor = r.risk_level === "Low" ? "#10b981" : r.risk_level === "Medium" ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ minHeight: "100vh", maxWidth: 920, margin: "0 auto", padding: "24px 20px 80px" }}>

      {/* ── Navbar ── */}
      <div className="anim-in" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🚗</div>
        <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#1e293b" }}>Drive<span style={{ color: "#4f46e5" }}>IQ</span></span>
      </div>

      {/* ── Header ── */}
      <div className="anim-up" style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 900, marginBottom: 8 }}>
          <span className="grad-text">Assessment Complete</span>
        </h1>
        <p style={{ color: "#64748b", fontSize: "1rem" }}>
          Results for <strong style={{ color: "#1e293b" }}>{r.user_name}</strong>
        </p>
      </div>

      {/* ── Overall Gauge ── */}
      <div className="card anim-up d1" style={{
        padding: "clamp(28px,5vw,44px)", textAlign: "center",
        maxWidth: 420, margin: "0 auto 28px", borderRadius: 24,
        background: `linear-gradient(135deg, ${mainColor}06, #fff)`,
        borderColor: `${mainColor}30`,
      }}>
        <Gauge pct={r.overall_percentage} color={mainColor}/>
        <div style={{ marginTop: 16, fontWeight: 700, fontSize: "1.05rem", color: "#1e293b" }}>Overall Performance</div>
        <div style={{ color: "#94a3b8", fontSize: "0.88rem", marginTop: 4 }}>{r.total_score} out of {r.total_questions} correct</div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 32 }}>
        <div className="card anim-up d2" style={{ padding: "26px 16px", textAlign: "center", borderRadius: 20 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>{riskEmoji}</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: riskColor }}>{r.risk_level}</div>
          <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 700, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.8px" }}>Risk Level</div>
        </div>

        <div className="card anim-up d3" style={{ padding: "26px 16px", textAlign: "center", borderRadius: 20 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>{r.is_eligible_12hr ? "✅" : "❌"}</div>
          <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>
            <span className="grad-text-alt">{r.is_eligible_12hr ? "Eligible" : "Not Eligible"}</span>
          </div>
          <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 700, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.8px" }}>12-Hour Drive</div>
        </div>

        <div className="card anim-up d4" style={{ padding: "26px 16px", textAlign: "center", borderRadius: 20 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#4f46e5" }}>{r.total_questions}</div>
          <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 700, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.8px" }}>Total Questions</div>
        </div>
      </div>

      {/* ── Category Breakdown ── */}
      <h2 className="anim-up d3" style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: 18, textAlign: "center" }}>
        <span className="grad-text">Category Breakdown</span>
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginBottom: 36 }}>
        {Object.entries(r.category_scores).map(([cat, score], i) => (
          <CatBar key={cat} cat={cat} score={score} delay={0.35 + i * 0.1}/>
        ))}
      </div>

      {/* ── Recommendation ── */}
      <div className="card anim-up d5" style={{
        padding: "clamp(24px,4vw,36px)", textAlign: "center",
        maxWidth: 580, margin: "0 auto 40px", borderRadius: 20,
        background: `linear-gradient(135deg, ${mainColor}06, #f0f9ff)`,
        borderColor: `${mainColor}25`,
      }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: 12, color: "#1e293b" }}>📋 Recommendation</h3>
        <p style={{ color: "#475569", lineHeight: 1.8, fontSize: "0.95rem" }}>{r.recommendation}</p>
      </div>

      {/* ── Actions ── */}
      <div className="anim-up d6" style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
        <button className="btn-outline" onClick={() => nav("/")}>← Back to Home</button>
        <button className="btn-primary" onClick={() => nav("/test")}>🔄 Retake Assessment</button>
      </div>
    </div>
  );
}
