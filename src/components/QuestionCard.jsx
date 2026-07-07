import { useState, useRef } from "react";
import { getMediaURL } from "../services/api";

const LABELS = ["1", "2", "3", "4", "5", "6"];

// gTTS has no native speaking-rate control, so narration is nudged slightly faster at
// playback time instead — a modest bump that shortens listening time while staying clear
// (modern browsers preserve pitch by default, so it doesn't sound sped-up/chipmunked).
const NARRATION_PLAYBACK_RATE = 1.15;

function applyNarrationRate(el) {
  if (!el) return;
  el.playbackRate = NARRATION_PLAYBACK_RATE;
  // Older WebKit/Firefox builds expose pitch-preservation behind prefixed flags;
  // modern browsers default this to true, but set it explicitly for safety.
  el.preservesPitch = true;
  el.mozPreservesPitch = true;
  el.webkitPreservesPitch = true;
}

function AudioZone({ src, label }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      applyNarrationRate(audioRef.current);
      audioRef.current.play().catch(() => {});
    }
  };

  const replay = () => {
    if (!audioRef.current) return;
    applyNarrationRate(audioRef.current);
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };

  return (
    <div className="audio-zone" style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <button className={`play-circle ${playing ? "on" : ""}`} onClick={toggle} type="button" aria-label={playing ? "Pause" : "Play"}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff">
            {playing
              ? <><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></>
              : <polygon points="6,3 20,12 6,21"/>}
          </svg>
        </button>
        <button onClick={replay} type="button" aria-label="Replay" title="Replay from start" style={{
          width: 36, height: 36, borderRadius: "50%", border: "1.5px solid #d1d5e4", background: "#fff",
          color: "#1a1f71", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          ↺
        </button>
      </div>
      <p style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 500 }}>{label}</p>
      <audio ref={audioRef} src={getMediaURL(src)}
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
        onLoadedMetadata={(e) => applyNarrationRate(e.currentTarget)}
        controls style={{ width: "100%", maxWidth: 400, height: 40 }}
      />
    </div>
  );
}

export default function QuestionCard({ question, selectedAnswer, onSelect }) {
  return (
    <div className="card" style={{ padding: "clamp(24px, 4vw, 36px)", overflow: "hidden" }}>

      {/* ── Audio ── */}
      {question.category === "audio" && question.media_url && (
        <AudioZone src={question.media_url} label="🎧 Listen to the question, then select your answer" />
      )}

      {/* ── Image ── */}
      {question.category === "image" && question.media_url && (
        <div className="img-frame" style={{ marginBottom: 24 }}>
          <img src={getMediaURL(question.media_url)} alt="Driving scenario" loading="eager" />
        </div>
      )}

      {/* ── Image scenario narration (optional) ── */}
      {question.category === "image" && question.audio_url && (
        <AudioZone src={question.audio_url} label="🎧 Listen to the scenario narration, then select your answer" />
      )}

      {/* ── Video (Dashcam Footage Simulation) ── */}
      {question.category === "video" && question.media_url && (
        <div className="video-frame" style={{ marginBottom: 24 }}>
          <div className="video-overlay"><div className="rec"></div> REC</div>
          {/* Dashcam timestamp overlay */}
          <div style={{
            position: "absolute", bottom: 10, left: 12, zIndex: 3,
            color: "rgba(255,255,255,0.7)", fontSize: "0.65rem", fontFamily: "monospace",
            fontWeight: 700, letterSpacing: "1px", textShadow: "0 1px 3px rgba(0,0,0,0.8)"
          }}>
            CAM-01 • {new Date().toLocaleDateString()}
          </div>
          <img
            src={getMediaURL(question.media_url)}
            alt="Driving scenario footage"
            loading="eager"
            onError={(e) => { e.target.style.display = "none"; }}
            style={{
              width: "100%", height: "280px", objectFit: "cover", display: "block",
            }}
          />
        </div>
      )}



      {/* ── Metadata Tags (Behavioral Category & Difficulty) ── */}
      {(question.difficulty || question.behavioral_category) && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
          {question.behavioral_category && (
            <span className="tag tag-audio" style={{ fontSize: "0.68rem", fontWeight: 700 }}>
              🧠 {question.behavioral_category}
            </span>
          )}
          {question.difficulty && (
            <span className="tag" style={{ 
              fontSize: "0.68rem",
              fontWeight: 700,
              background: question.difficulty === "Hard" ? "rgba(239, 68, 68, 0.15)" : question.difficulty === "Medium" ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)",
              color: question.difficulty === "Hard" ? "#f87171" : question.difficulty === "Medium" ? "#fbbf24" : "#34d399"
            }}>
              📶 {question.difficulty}
            </span>
          )}
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
