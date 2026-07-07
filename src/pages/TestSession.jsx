import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchAllMCQs, submitAnswers } from "../services/api";
import { useAuth } from "../context/AuthContext";
import QuestionCard from "../components/QuestionCard";

const DURATION = 720;

export default function TestSession() {
  const nav = useNavigate();
  const { state } = useLocation();
  const { user } = useAuth();

  const [qs, setQs] = useState([]);
  const [idx, setIdx] = useState(0);
  const [ans, setAns] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const [time, setTime] = useState(DURATION);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const tRef = useRef(null);

  const startCategory = state?.startCategory;

  const jumpToCategory = (cat) => {
    const firstIdx = qs.findIndex(q => q.category === cat);
    if (firstIdx !== -1) {
      setIdx(firstIdx);
    }
  };

  useEffect(() => {
    fetchAllMCQs()
      .then(d => {
        setQs(d);
        if (startCategory) {
          const firstIdx = d.findIndex(q => q.category === startCategory);
          if (firstIdx !== -1) {
            setIdx(firstIdx);
          }
        }
        setLoading(false);
      })
      .catch(() => { setErr("Failed to load questions. Is the backend running?"); setLoading(false); });
  }, [startCategory]);

  useEffect(() => {
    if (loading || err) return;
    tRef.current = setInterval(() => {
      setTime(t => { if (t <= 1) { clearInterval(tRef.current); doSubmit(); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(tRef.current);
  }, [loading, err]);

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const pick = useCallback((id, opt) => setAns(a => ({ ...a, [id]: opt })), []);

  const doSubmit = async () => {
    if (busy) return; setBusy(true); clearInterval(tRef.current);
    try {
      const payload = qs.map(q => ({ question_id: q.id, selected_answer: ans[q.id] || "", category: q.category }));
      const result = await submitAnswers(user?.full_name || "Anonymous", payload);
      nav("/result", { state: { result } });
    } catch { setErr("Submission failed."); setBusy(false); }
  };

  const handleProfileClick = () => {
    if (window.confirm("Pause assessment and go to your profile page? Your current answers will be saved.")) {
      clearInterval(tRef.current);
      nav("/dashboard", { state: { activeTab: "profile" } });
    }
  };

  const handleExitClick = () => {
    if (window.confirm("Are you sure you want to pause and exit to Dashboard? Your progress will be saved!")) {
      clearInterval(tRef.current);
      nav("/dashboard");
    }
  };

  /* ─── LOADING ─── */
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f8fc" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, border: "3px solid #e8ecf2", borderTop: "3px solid #1a1f71", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }}/>
        <p style={{ color: "#64748b", fontWeight: 500 }}>Loading assessment…</p>
      </div>
    </div>
  );

  /* ─── ERROR ─── */
  if (err) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "#f7f8fc" }}>
      <div className="card" style={{ padding: 40, textAlign: "center", maxWidth: 460 }}>
        <div style={{ fontSize: 48, marginBottom: 14 }}>⚠️</div>
        <h2 style={{ fontWeight: 700, marginBottom: 10, color: "#1a1f71" }}>Something went wrong</h2>
        <p style={{ color: "#64748b", marginBottom: 24, lineHeight: 1.6 }}>{err}</p>
        <button className="btn-primary" onClick={() => window.location.reload()}>Retry</button>
      </div>
    </div>
  );

  /* ─── TEST ─── */
  const q = qs[idx];
  const pct = ((idx + 1) / qs.length) * 100;
  const done = Object.keys(ans).length;
  const last = idx === qs.length - 1;
  const danger = time <= 60;

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
          <span style={{ fontSize: "1rem", fontWeight: 800, color: "#1a1f71" }}>DriveIQ Test</span>
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
              <span style={{ fontSize: "0.68rem", color: "#cbd5e1", fontWeight: 700, textTransform: "uppercase" }}>Driver Test</span>
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
          onClick={handleProfileClick}
          style={{
            cursor: "pointer",
            transition: "background 0.2s"
          }}
          title="View profile page"
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

        {/* Sidebar Navigation & Controls */}
        <div className="test-sidebar-menu">
          {/* Progress Card */}
          <div style={{ padding: "0 8px 16px 8px", borderBottom: "1px solid #1e293b", marginBottom: 16 }}>
            <h4 style={{ margin: "0 0 6px 0", fontSize: "0.78rem", color: "#cbd5e1", fontWeight: 700, textTransform: "uppercase" }}>Test Progress</h4>
            <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#ffffff" }}>
              {done} / {qs.length} <span style={{ fontSize: "0.78rem", color: "#cbd5e1", fontWeight: 500 }}>Questions Filled</span>
            </div>
            <div style={{ width: "100%", height: 6, background: "#1e293b", borderRadius: 3, marginTop: 8, overflow: "hidden" }}>
              <div style={{ width: `${(done / qs.length) * 100}%`, height: "100%", background: "#10b981", borderRadius: 3 }} />
            </div>
          </div>

          {/* Category Jump list */}
          <div style={{ padding: "0 8px 16px 8px", borderBottom: "1px solid #1e293b", marginBottom: 16 }}>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "0.78rem", color: "#cbd5e1", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Category Jump</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { id: "text", label: "Text Based", icon: "📝" },
                { id: "audio", label: "Audio TTS", icon: "🎧" },
                { id: "image", label: "Image Psych", icon: "🖼️" },
                { id: "video", label: "Video GIF", icon: "🎬" }
              ].map(cat => {
                const count = qs.filter(item => item.category === cat.id).length;
                const active = q?.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { jumpToCategory(cat.id); setSidebarOpen(window.innerWidth > 768); }}
                    className={`test-sidebar-item ${active ? "active" : ""}`}
                    style={{
                      padding: "6px 10px",
                      fontSize: "0.8rem",
                      borderRadius: 6
                    }}
                  >
                    <span>{cat.icon}</span>
                    <span style={{ flex: 1 }}>{cat.label}</span>
                    <span style={{
                      fontSize: "0.7rem",
                      background: active ? "#1e1b4b" : "rgba(255,255,255,0.1)",
                      color: active ? "#f5c518" : "#cbd5e1",
                      padding: "1px 6px",
                      borderRadius: 4,
                      fontWeight: 800
                    }}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scrollable Questions list grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h4 style={{ margin: "0 0 4px 8px", fontSize: "0.78rem", color: "#cbd5e1", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Questions List</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, padding: "0 8px" }}>
              {qs.map((item, i) => {
                const filled = !!ans[item.id];
                const here = i === idx;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setIdx(i); setSidebarOpen(window.innerWidth > 768); }}
                    style={{
                      width: "100%", height: 38, borderRadius: 8,
                      background: here ? "#f5c518" : filled ? "rgba(16, 185, 129, 0.15)" : "rgba(255,255,255,0.05)",
                      border: here ? "2px solid #f5c518" : filled ? "2px solid #10b981" : "2px solid rgba(255,255,255,0.1)",
                      color: here ? "#1e1b4b" : filled ? "#10b981" : "#cbd5e1",
                      fontWeight: 800, fontSize: "0.78rem", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s"
                    }}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div style={{ padding: 16, borderTop: "1px solid #1e293b", display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={handleExitClick}
            className="test-exit-btn"
          >
            🏠 Exit to Dashboard
          </button>
          <button
            onClick={doSubmit}
            disabled={busy}
            className="test-submit-btn"
          >
            {busy ? "Submitting…" : "Submit Assessment ✓"}
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

      {/* MAIN CONTENT AREA */}
      <main className={`test-content-area ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
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
            <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#1a1f71" }}>DriveIQ Assessment Navigation</span>
          </div>

          {/* Header Card */}
          <div className="card anim-in" style={{
            padding: "14px 22px", marginBottom: 18, display: "flex", alignItems: "center",
            justifyContent: "space-between", flexWrap: "wrap", gap: 10, borderRadius: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#1a1f71" }}>
                Question {idx + 1}<span style={{ color: "#94a3b8", fontWeight: 500 }}> of {qs.length}</span>
              </span>
              <span className={`tag tag-${q.category}`}>
                {q.category === "text" ? "📝" : q.category === "audio" ? "🎧" : q.category === "video" ? "🎬" : "🖼️"} {q.category}
              </span>
            </div>
            <div style={{
              fontWeight: 800, fontSize: "1.1rem", fontFamily: "monospace", letterSpacing: "1px",
              color: danger ? "#ef4444" : "#1a1f71",
            }}>⏱ {fmt(time)}</div>
            <div style={{ fontSize: "0.82rem", color: "#94a3b8", fontWeight: 600 }}>
              {done}/{qs.length} Complete
            </div>
          </div>

          {/* Progress */}
          <div className="prog-bar" style={{ marginBottom: 24 }}>
            <div className="fill" style={{ width: `${pct}%` }}/>
          </div>

          {/* Question */}
          <div className="anim-right" key={q.id}>
            <QuestionCard question={q} selectedAnswer={ans[q.id]} onSelect={opt => pick(q.id, opt)}/>
          </div>

          {/* Nav */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, gap: 12, flexWrap: "wrap" }}>
            <button className="btn-outline" onClick={() => setIdx(i => Math.max(0, i-1))} disabled={idx === 0}>← Previous</button>
            {last
              ? <button className="btn-primary" onClick={doSubmit} disabled={busy} style={{ minWidth: 170 }}>{busy ? "Submitting…" : "Submit Test ✓"}</button>
              : <button className="btn-primary" onClick={() => setIdx(i => Math.min(qs.length-1, i+1))}>Next Question →</button>
            }
          </div>

          {/* Navigator */}
          <div className="card" style={{ marginTop: 24, padding: "16px 18px", display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "center", borderRadius: 16 }}>
            {qs.map((item, i) => {
              const filled = !!ans[item.id];
              const here = i === idx;
              return (
                <button key={item.id} type="button" onClick={() => setIdx(i)} style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: here ? "#eef0fa" : filled ? "#ecfdf5" : "#f7f8fc",
                  border: here ? "2px solid #1a1f71" : filled ? "2px solid #27ae60" : "2px solid #e8ecf2",
                  color: here ? "#1a1f71" : filled ? "#27ae60" : "#94a3b8",
                  fontWeight: 800, fontSize: "0.78rem", cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.2s ease",
                }}>{i + 1}</button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
