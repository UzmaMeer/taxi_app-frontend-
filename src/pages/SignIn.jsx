import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function SignIn() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handle = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.email.trim() || !form.password) return setErr("All fields are required");
    setBusy(true);
    try {
      const res = await loginUser(form.email, form.password);
      login(res.user);
      nav("/dashboard");
    } catch (e) {
      setErr(e.response?.data?.detail || "Login failed");
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 900, display: "flex", borderRadius: 24, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>

        {/* Left panel - form */}
        <div style={{ flex: 1, background: "#fff", padding: "clamp(28px, 5vw, 48px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🚗</div>
            <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>Drive<span style={{ color: "#4f46e5" }}>IQ</span></span>
          </div>

          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 6, color: "#1e293b" }}>Welcome Back</h1>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: 28 }}>
            Don&apos;t have an account? <Link to="/signup" style={{ color: "#4f46e5", fontWeight: 600, textDecoration: "none" }}>Sign Up</Link>
          </p>

          {err && <div style={{ padding: "12px 16px", borderRadius: 12, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "0.88rem", fontWeight: 500, marginBottom: 18 }}>{err}</div>}

          <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>Email Address</label>
              <input type="email" placeholder="driver@example.com" value={form.email} onChange={e => set("email", e.target.value)}
                style={{ width: "100%", padding: "13px 16px", fontSize: "0.95rem", fontFamily: "inherit", border: "2px solid #e2e8f0", borderRadius: 12, color: "#1e293b", outline: "none", background: "#f8fafc", transition: "border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor = "#4f46e5"} onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>Password</label>
              <input type="password" placeholder="••••••••" value={form.password} onChange={e => set("password", e.target.value)}
                style={{ width: "100%", padding: "13px 16px", fontSize: "0.95rem", fontFamily: "inherit", border: "2px solid #e2e8f0", borderRadius: 12, color: "#1e293b", outline: "none", background: "#f8fafc", transition: "border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor = "#4f46e5"} onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>
            <button className="btn-primary" type="submit" disabled={busy} style={{ marginTop: 6, width: "100%", padding: 15 }}>
              {busy ? "Signing in…" : "Sign In →"}
            </button>
          </form>
        </div>

        {/* Right panel - visual */}
        <div style={{
          flex: 1, minHeight: 440,
          background: "linear-gradient(135deg, #0ea5e9, #4f46e5, #7c3aed)",
          display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
          padding: 40, color: "#fff",
        }}
          className="hide-mobile"
        >
          <div style={{ fontSize: 64, marginBottom: 20, animation: "float 3s ease-in-out infinite" }}>🧠</div>
          <h2 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: 10 }}>Welcome Back!</h2>
          <p style={{ fontSize: "0.95rem", opacity: 0.85, textAlign: "center", lineHeight: 1.7, maxWidth: 280 }}>
            Continue your driver assessment journey. Your progress and results are saved.
          </p>
        </div>
      </div>

      <style>{`@media(max-width:768px){.hide-mobile{display:none!important}}`}</style>
    </div>
  );
}
