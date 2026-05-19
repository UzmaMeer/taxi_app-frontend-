import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
  const { user, logout } = useAuth();

  const greetHour = new Date().getHours();
  const greeting = greetHour < 12 ? "Good Morning" : greetHour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div style={{ minHeight: "100vh", background: "#f7f8fc" }}>
      {/* ═══ NAVBAR ═══ */}
      <nav style={{
        padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        maxWidth: 1100, margin: "0 auto",
        flexWrap: "wrap", gap: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: "#1a1f71", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🚗</div>
          <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#1a1f71" }}>DriveIQ</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 16px", borderRadius: 12,
            background: "#eef0fa", border: "1px solid #c7cce6",
          }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#1a1f71", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.75rem", fontWeight: 800 }}>
              {user?.full_name?.charAt(0)?.toUpperCase() || "D"}
            </div>
            <span style={{ fontWeight: 600, fontSize: "0.88rem", color: "#1a1f71" }}>{user?.full_name || "Driver"}</span>
          </div>
          <button onClick={logout} style={{
            padding: "8px 18px", borderRadius: 10, border: "2px solid #d1d5e4",
            background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "0.82rem",
            fontFamily: "inherit", color: "#64748b", transition: "all 0.2s",
          }}>Logout</button>
        </div>
      </nav>

      {/* ═══ HERO AREA ═══ */}
      <section style={{ padding: "40px 24px 20px", maxWidth: 1000, margin: "0 auto" }}>
        <div className="anim-up" style={{ marginBottom: 32 }}>
          <p style={{ fontSize: "0.88rem", color: "#64748b", fontWeight: 500, marginBottom: 6 }}>{greeting} 👋</p>
          <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 900, color: "#1a1f71", marginBottom: 8 }}>
            Welcome, <span style={{ color: "#1a1f71" }}>{user?.full_name || "Driver"}</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.95rem", lineHeight: 1.7, maxWidth: 520 }}>
            Ready to evaluate your driving skills? Complete the assessment below to receive
            your personalized safety scorecard.
          </p>
        </div>

        {/* Quick stats */}
        <div className="card anim-up d1" style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 0, marginBottom: 40, overflow: "hidden", borderRadius: 18,
        }}>
          {QUICK_STATS.map((s, i) => (
            <div key={i} style={{
              padding: "20px 12px", textAlign: "center",
              borderRight: i < QUICK_STATS.length - 1 ? "1px solid #e8ecf2" : "none",
            }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#1a1f71" }}>{s.value}</div>
              <div style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ ASSESSMENT CATEGORIES ═══ */}
      <section style={{ padding: "0 24px 30px", maxWidth: 1000, margin: "0 auto" }}>
        <h2 className="anim-up d2" style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: 8, color: "#1a1f71" }}>
          Assessment Categories
        </h2>
        <p className="anim-up d2" style={{ color: "#94a3b8", fontSize: "0.88rem", marginBottom: 24 }}>
          Your test includes questions from all four dimensions
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
          {CATEGORIES.map((c, i) => (
            <div key={i} className="card card-hover anim-up" 
              onClick={() => nav("/test", { state: { startCategory: c.key } })}
              style={{
                padding: "28px 24px", animationDelay: `${0.25 + i * 0.1}s`, cursor: "pointer"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: c.bg, border: `1px solid ${c.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26,
                }}>{c.icon}</div>
                <span style={{
                  padding: "4px 12px", borderRadius: 8,
                  background: "#f5c518", color: "#1a1f71",
                  fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px",
                }}>{c.tag}</span>
              </div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1a1f71", marginBottom: 8 }}>{c.title}</h3>
              <p style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: 1.65, marginBottom: 16 }}>{c.desc}</p>
              
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", fontSize: "0.82rem", fontWeight: 600 }}>
                  <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#f5c518" }} />
                  {c.count} Questions
                </div>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1a1f71", display: "flex", alignItems: "center", gap: 4 }}>
                  Start →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ START CTA ═══ */}
      <section style={{ padding: "20px 24px 60px", maxWidth: 1000, margin: "0 auto" }}>
        <div className="card anim-up d4" style={{
          padding: "clamp(32px, 5vw, 48px)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 24,
        }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: 8, color: "#1a1f71" }}>
              🧪 Start Your Assessment
            </h3>
            <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.7 }}>
              20 multimedia questions • 12 minute time limit • instant results with risk analysis
            </p>
          </div>
          <button className="btn-primary" onClick={() => nav("/test")} style={{
            padding: "18px 48px", fontSize: "1.1rem", flexShrink: 0,
          }}>
            Begin Test →
          </button>
        </div>
      </section>
    </div>
  );
}
