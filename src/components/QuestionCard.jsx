import { useState, useRef } from "react";

const LABELS = ["A", "B", "C", "D", "E", "F"];

export default function QuestionCard({ question, selectedAnswer, onSelect }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const toggle = () => {
    if (!audioRef.current) return;
    playing ? audioRef.current.pause() : audioRef.current.play().catch(() => {});
  };

  const getMediaUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const base = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "") : "http://localhost:8000";
    return `${base}${url}`;
  };

  return (
    <div className="card" style={{ padding: "clamp(24px, 4vw, 36px)", overflow: "hidden" }}>

      {/* ── Audio ── */}
      {question.category === "audio" && question.media_url && (
        <div className="audio-zone" style={{ marginBottom: 24 }}>
          <button className={`play-circle ${playing ? "on" : ""}`} onClick={toggle} type="button">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff">
              {playing
                ? <><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></>
                : <polygon points="6,3 20,12 6,21"/>}
            </svg>
          </button>
          <p style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 500 }}>🎧 Listen to the question, then select your answer</p>
          <audio ref={audioRef} src={getMediaUrl(question.media_url)}
            onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
            controls style={{ width: "100%", maxWidth: 400, height: 40 }}
          />
        </div>
      )}

      {/* ── Image ── */}
      {question.category === "image" && question.media_url && (
        <div className="img-frame" style={{ marginBottom: 24 }}>
          <img src={getMediaUrl(question.media_url)} alt="Driving scenario" loading="eager" />
        </div>
      )}

      {/* ── Video (CSS Zoom Loop) ── */}
      {question.category === "video" && question.media_url && (
        <div className="video-frame" style={{ marginBottom: 24, borderRadius: 12, overflow: "hidden", background: "#000" }}>
          <div className="video-overlay" style={{ zIndex: 10, position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.5)", padding: "4px 8px", borderRadius: 4, color: "#fff", display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", fontWeight: 700 }}>
            <div className="rec" style={{ width: 8, height: 8, background: "#ef4444", borderRadius: "50%", animation: "blink 1s infinite" }}></div> REC
          </div>
          <img src={getMediaUrl(question.media_url)} alt="Video Scenario" />
        </div>
      )}

      {/* ── Question ── */}
      <h2 style={{
        fontSize: "clamp(1rem, 2.2vw, 1.2rem)", fontWeight: 700,
        lineHeight: 1.6, marginBottom: 24, color: "#1e293b",
      }}>
        {question.question}
      </h2>

      {/* ── Options ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {question.options.map((opt, i) => (
          <button key={i} type="button"
            className={`mcq-opt ${selectedAnswer === opt ? "picked" : ""}`}
            onClick={() => onSelect(opt)}
          >
            <span className="letter">{LABELS[i]}</span>
            <span style={{ flex: 1 }}>{opt}</span>
            {selectedAnswer === opt && (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
