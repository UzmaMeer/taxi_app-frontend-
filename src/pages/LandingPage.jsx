import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  { icon: "📝", title: "Text-Based MCQs", desc: "Scenario-driven questions testing your decision-making in real driving situations.", color: "#4f46e5", bg: "#eef2ff", border: "#c7d2fe" },
  { icon: "🎧", title: "Audio-Based MCQs", desc: "Listen to realistic driving scenarios and choose the safest course of action.", color: "#7c3aed", bg: "#ede9fe", border: "#c4b5fd" },
  { icon: "🖼️", title: "Image Psychometrics", desc: "Analyze visual scenes to evaluate your psychological response and empathy.", color: "#d97706", bg: "#fef3c7", border: "#fcd34d" },
  { icon: "🎬", title: "Video Scenarios", desc: "Watch animated clips of dangerous driving behavior and identify the proper response.", color: "#0ea5e9", bg: "#e0f2fe", border: "#bae6fd" },
];

const STATS = [
  { value: "20", label: "Questions", icon: "📋" },
  { value: "4", label: "Categories", icon: "🎯" },
  { value: "<1s", label: "Response", icon: "⚡" },
  { value: "12m", label: "Time Limit", icon: "⏱️" },
];

const STEPS = [
  { num: "01", title: "Enter Your Name", desc: "Provide your name to personalize the assessment and your result card.", color: "#4f46e5", icon: "👤" },
  { num: "02", title: "Answer 20 MCQs", desc: "Navigate through text, audio, image, and video questions within the 12-minute timer.", color: "#0ea5e9", icon: "✍️" },
  { num: "03", title: "Get Instant Results", desc: "Receive a detailed scorecard with risk level, category breakdown, and 12-hour driving eligibility.", color: "#10b981", icon: "📊" },
];

export default function LandingPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [hovered, setHovered] = useState(null);
  const go = user ? "/dashboard" : "/signup";

  const words = ["Intelligent", "Reliable", "Safe", "Advanced"];
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIdx((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: "100vh" }}>

      {/* ═══ NAVBAR ═══ */}
      <nav className="anim-in" style={{
        padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
        maxWidth: 1100, margin: "0 auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, color: "#fff", fontWeight: 900,
          }}>🚗</div>
          <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#1e293b" }}>
            Drive<span style={{ color: "#4f46e5" }}>IQ</span>
          </span>
        </div>
        <button className="btn-primary" onClick={() => nav(go)} style={{ padding: "10px 24px", fontSize: "0.88rem" }}>
          Start Test →
        </button>
      </nav>

      {/* ═══ HERO ═══ */}
      <section style={{ padding: "60px 24px 40px", maxWidth: 1100, margin: "0 auto" }}>
        
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 40, marginBottom: 40 }}>
          <div style={{ flex: "1 1 400px", textAlign: "left" }}>
            <h1 className="anim-up d1" style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 900,
              lineHeight: 1.1, marginBottom: 16, letterSpacing: "-1.5px",
            }}>
              Meet <span className="grad-text">DriveIQ</span>
            </h1>

            <h2 className="anim-up d2" style={{
              fontSize: "clamp(1.1rem, 2vw, 1.5rem)", fontWeight: 600,
              color: "#475569", marginBottom: 24,
            }}>
              <span style={{ color: "#4f46e5", transition: "all 0.3s ease" }}>{words[wordIdx]}</span> Driver Assessment System
            </h2>

            <p className="anim-up d3" style={{
              fontSize: "clamp(0.92rem, 1.3vw, 1.05rem)", color: "#64748b",
              lineHeight: 1.8, marginBottom: 36, maxWidth: 500
            }}>
              Evaluate your driving skills, behavioral awareness, and psychological stability
              through interactive multimedia assessments. Find out if you&apos;re ready for
              long-haul 12-hour shifts.
            </p>

            {/* CTA */}
            <div className="anim-up d4" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <button className="btn-primary" onClick={() => nav(go)} style={{ padding: "16px 40px", fontSize: "1.05rem" }}>
                🧪 Start Assessment
              </button>
              <a href="#how" className="btn-outline" style={{ padding: "16px 32px" }}>
                How it works ↓
              </a>
            </div>
          </div>
          
          <div className="anim-up d3" style={{ flex: "1 1 400px", display: "flex", justifyContent: "center" }}>
            <div style={{
              width: "100%", maxWidth: 500, borderRadius: 24, overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)", border: "4px solid #fff",
              position: "relative"
            }}>
              <img src="/static/images/landing_hero.png" alt="Driving Dashboard" style={{ width: "100%", display: "block" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)" }} />
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="card anim-up d5" style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          maxWidth: 560, margin: "0 auto", overflow: "hidden",
          borderRadius: 18,
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              padding: "20px 8px", textAlign: "center",
              borderRight: i < 3 ? "1px solid #f1f5f9" : "none",
            }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#4f46e5" }}>{s.value}</div>
              <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section style={{ padding: "60px 24px", maxWidth: 1000, margin: "0 auto" }}>
        <h3 className="anim-up" style={{ textAlign: "center", fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, marginBottom: 8 }}>
          <span className="grad-text">Three Assessment Dimensions</span>
        </h3>
        <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.95rem", marginBottom: 40, maxWidth: 460, margin: "0 auto 40px" }}>
          Each category targets a different cognitive and emotional skill set
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className={`card anim-up`}
              style={{
                padding: 32, animationDelay: `${0.15 + i * 0.1}s`,
                cursor: "default",
                borderColor: hovered === i ? f.border : "#e2e8f0",
                boxShadow: hovered === i
                  ? `0 8px 30px ${f.color}12, 0 4px 20px rgba(0,0,0,0.05)`
                  : "0 1px 3px rgba(0,0,0,0.04)",
                transform: hovered === i ? "translateY(-6px)" : "translateY(0)",
                transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: f.bg, border: `1px solid ${f.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, marginBottom: 20,
              }}>{f.icon}</div>
              <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: f.color, marginBottom: 10 }}>{f.title}</h4>
              <p style={{ fontSize: "0.88rem", color: "#64748b", lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how" style={{ padding: "40px 24px 60px", maxWidth: 720, margin: "0 auto" }}>
        <h3 style={{ textAlign: "center", fontSize: "clamp(1.3rem, 3vw, 1.8rem)", fontWeight: 800, marginBottom: 40 }}>
          <span className="grad-text">How It Works</span>
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {STEPS.map((s, i) => (
            <div key={i} className="card anim-up" style={{
              padding: "24px 28px", display: "flex", alignItems: "center", gap: 20,
              animationDelay: `${0.1 + i * 0.1}s`,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                background: `${s.color}10`, border: `1.5px solid ${s.color}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24,
              }}>{s.icon}</div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 800, color: s.color, fontFamily: "monospace" }}>{s.num}</span>
                  <h4 style={{ fontSize: "1rem", fontWeight: 700 }}>{s.title}</h4>
                </div>
                <p style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ BOTTOM CTA ═══ */}
      <section style={{ padding: "20px 24px 60px", textAlign: "center" }}>
        <div className="card anim-up" style={{
          maxWidth: 560, margin: "0 auto", padding: "44px 32px",
          background: "linear-gradient(135deg, #eef2ff, #f0f9ff)",
          borderColor: "#c7d2fe",
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🏁</div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 10 }}>Ready to Get Assessed?</h3>
          <p style={{ color: "#64748b", fontSize: "0.92rem", marginBottom: 28, lineHeight: 1.7 }}>
            Takes about 12 minutes. Get instant results with detailed analytics.
          </p>
          <button className="btn-primary" onClick={() => nav(go)} style={{ padding: "17px 48px", fontSize: "1.05rem" }}>
            🚀 Begin Now
          </button>
        </div>
        <p style={{ marginTop: 32, fontSize: "0.75rem", color: "#94a3b8" }}>
          DriveIQ v1.0 • Powered by AntiGravity Engine • FastAPI + React
        </p>
      </section>
    </div>
  );
}
