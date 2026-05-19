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
  const tRef = useRef(null);

  const startCategory = state?.startCategory;

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

  /* ─── LOADING ─── */
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, border: "3px solid #e2e8f0", borderTop: "3px solid #4f46e5", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }}/>
        <p style={{ color: "#64748b", fontWeight: 500 }}>Loading assessment…</p>
      </div>
    </div>
  );

  /* ─── ERROR ─── */
  if (err) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="card" style={{ padding: 40, textAlign: "center", maxWidth: 460 }}>
        <div style={{ fontSize: 48, marginBottom: 14 }}>⚠️</div>
        <h2 style={{ fontWeight: 700, marginBottom: 10 }}>Something went wrong</h2>
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
    <div style={{ minHeight: "100vh", maxWidth: 860, margin: "0 auto", padding: "16px 20px 60px" }}>

      {/* ── Navbar ── */}
      <div className="anim-in" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🚗</div>
          <span style={{ fontWeight: 800, fontSize: "0.95rem" }}>Drive<span style={{ color: "#4f46e5" }}>IQ</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.65rem", fontWeight: 800 }}>
            {user?.full_name?.charAt(0)?.toUpperCase() || "D"}
          </div>
          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#4f46e5" }}>{user?.full_name}</span>
        </div>
      </div>

      {/* ── Header ── */}
      <div className="card anim-in" style={{
        padding: "14px 22px", marginBottom: 18, display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: 10, borderRadius: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#1e293b" }}>
            {idx + 1}<span style={{ color: "#94a3b8", fontWeight: 500 }}> / {qs.length}</span>
          </span>
          <span className={`tag tag-${q.category}`}>
            {q.category === "text" ? "📝" : q.category === "audio" ? "🎧" : q.category === "video" ? "🎬" : "🖼️"} {q.category}
          </span>
        </div>
        <div style={{
          fontWeight: 800, fontSize: "1.1rem", fontFamily: "monospace", letterSpacing: "1px",
          color: danger ? "#ef4444" : "#4f46e5",
        }}>⏱ {fmt(time)}</div>
        <div style={{ fontSize: "0.82rem", color: "#94a3b8", fontWeight: 600 }}>
          ✅ {done}/{qs.length}
        </div>
      </div>

      {/* ── Progress ── */}
      <div className="prog-bar" style={{ marginBottom: 24 }}>
        <div className="fill" style={{ width: `${pct}%` }}/>
      </div>

      {/* ── Question ── */}
      <div className="anim-right" key={q.id}>
        <QuestionCard question={q} selectedAnswer={ans[q.id]} onSelect={opt => pick(q.id, opt)}/>
      </div>

      {/* ── Nav ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, gap: 12, flexWrap: "wrap" }}>
        <button className="btn-outline" onClick={() => setIdx(i => Math.max(0, i-1))} disabled={idx === 0}>← Previous</button>
        {last
          ? <button className="btn-primary" onClick={doSubmit} disabled={busy} style={{ minWidth: 170 }}>{busy ? "Submitting…" : "Submit Test ✓"}</button>
          : <button className="btn-primary" onClick={() => setIdx(i => Math.min(qs.length-1, i+1))}>Next →</button>
        }
      </div>

      {/* ── Navigator ── */}
      <div className="card" style={{ marginTop: 24, padding: "16px 18px", display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "center", borderRadius: 16 }}>
        {qs.map((item, i) => {
          const filled = !!ans[item.id];
          const here = i === idx;
          return (
            <button key={item.id} type="button" onClick={() => setIdx(i)} style={{
              width: 36, height: 36, borderRadius: 10,
              background: here ? "#eef2ff" : filled ? "#ecfdf5" : "#f8fafc",
              border: here ? "2px solid #4f46e5" : filled ? "2px solid #10b981" : "2px solid #e2e8f0",
              color: here ? "#4f46e5" : filled ? "#10b981" : "#94a3b8",
              fontWeight: 800, fontSize: "0.78rem", cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.2s ease",
            }}>{i + 1}</button>
          );
        })}
      </div>
    </div>
  );
}
