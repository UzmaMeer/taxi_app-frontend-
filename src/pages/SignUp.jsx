import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function SignUp() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handle = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.name.trim() || !form.email.trim() || !form.password) return setErr("All fields are required");
    if (form.password.length < 4) return setErr("Password must be at least 4 characters");
    if (form.password !== form.confirm) return setErr("Passwords do not match");
    setBusy(true);
    try {
      const res = await registerUser(form.name, form.email, form.password);
      login(res.user);
      nav("/dashboard");
    } catch (e) {
      setErr(e.response?.data?.detail || "Registration failed");
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "#f7f8fc" }}>
      <div className="card anim-scale" style={{ width: "100%", maxWidth: 900, display: "flex", overflow: "hidden" }}>

        {/* Left panel - visual */}
        <div style={{
          flex: 1, minHeight: 500,
          background: "linear-gradient(135deg, #1a1f71, #2d3494)",
          display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
          padding: 40, color: "#fff",
        }}
          className="hide-mobile"
        >
          <div style={{ fontSize: 64, marginBottom: 20, animation: "float 3s ease-in-out infinite" }}>🚗</div>
          <h2 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: 10, color: "#fff" }}>DriveIQ</h2>
          <p style={{ fontSize: "0.95rem", opacity: 0.85, textAlign: "center", lineHeight: 1.7, maxWidth: 280, color: "#e2e8f0" }}>
            Join thousands of drivers getting assessed for safety, stability, and 12-hour eligibility.
          </p>
        </div>

        {/* Right panel - form */}
        <div style={{ flex: 1, padding: "clamp(28px, 5vw, 48px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
            <button onClick={() => nav("/")} type="button" style={{
              width: 36, height: 36, borderRadius: 10, background: "#eef0fa", border: "1.5px solid #c7cce6",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              fontSize: 16, color: "#1a1f71", fontWeight: 800, transition: "all 0.2s"
            }}>←</button>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#1a1f71", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🚗</div>
            <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#1a1f71" }}>DriveIQ</span>
          </div>

          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 6, color: "#1a1f71" }}>Create Account</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: 28 }}>
            Already have an account? <Link to="/signin" style={{ color: "#1a1f71", fontWeight: 600, textDecoration: "none" }}>Sign In</Link>
          </p>

          {err && <div style={{ padding: "12px 16px", borderRadius: 12, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "0.88rem", fontWeight: 500, marginBottom: 18 }}>{err}</div>}

          <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>Full Name</label>
              <input type="text" placeholder="Muhammad Uzma" value={form.name} onChange={e => set("name", e.target.value)}
                style={{ width: "100%", padding: "13px 16px", fontSize: "0.95rem", fontFamily: "inherit", border: "2px solid #d1d5e4", borderRadius: 12, color: "#1a1f71", outline: "none", background: "#ffffff", transition: "border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor = "#1a1f71"} onBlur={e => e.target.style.borderColor = "#d1d5e4"}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>Email Address</label>
              <input type="email" placeholder="driver@example.com" value={form.email} onChange={e => set("email", e.target.value)}
                style={{ width: "100%", padding: "13px 16px", fontSize: "0.95rem", fontFamily: "inherit", border: "2px solid #d1d5e4", borderRadius: 12, color: "#1a1f71", outline: "none", background: "#ffffff", transition: "border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor = "#1a1f71"} onBlur={e => e.target.style.borderColor = "#d1d5e4"}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>Password</label>
              <input type="password" placeholder="••••••••" value={form.password} onChange={e => set("password", e.target.value)}
                style={{ width: "100%", padding: "13px 16px", fontSize: "0.95rem", fontFamily: "inherit", border: "2px solid #d1d5e4", borderRadius: 12, color: "#1a1f71", outline: "none", background: "#ffffff", transition: "border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor = "#1a1f71"} onBlur={e => e.target.style.borderColor = "#d1d5e4"}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>Confirm Password</label>
              <input type="password" placeholder="••••••••" value={form.confirm} onChange={e => set("confirm", e.target.value)}
                style={{ width: "100%", padding: "13px 16px", fontSize: "0.95rem", fontFamily: "inherit", border: "2px solid #d1d5e4", borderRadius: 12, color: "#1a1f71", outline: "none", background: "#ffffff", transition: "border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor = "#1a1f71"} onBlur={e => e.target.style.borderColor = "#d1d5e4"}
              />
            </div>
            <button className="btn-primary" type="submit" disabled={busy} style={{ marginTop: 6, width: "100%", padding: 15 }}>
              {busy ? "Creating account…" : "Create Account →"}
            </button>
          </form>
        </div>
      </div>

      <style>{`@media(max-width:768px){.hide-mobile{display:none!important}}`}</style>
    </div>
  );
}
