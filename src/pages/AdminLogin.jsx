import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { MdEmail, MdLock } from "react-icons/md";
import { TbRoute } from "react-icons/tb";
import { auth } from "../firebase/config";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate("/admin");
    } catch (err) {
      setError("Login fail ho gaya. Email/password check karein.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A1A", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Sans', sans-serif" }}>
      <form onSubmit={handleSubmit} style={{
        width: "100%", maxWidth: 380, background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: 32,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, justifyContent: "center" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #FF8B5E, #FF6B35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TbRoute size={19} color="#14182B" />
          </div>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: "#F5F3ED", fontWeight: 600 }}>
            Connect<span style={{ color: "#FF8B5E" }}>Cab</span> Admin
          </span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", color: "#9CA3C4", fontSize: 12, fontWeight: 600, marginBottom: 7 }}>Email</label>
          <div style={{ position: "relative" }}>
            <MdEmail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#5ED4C4" }} />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{
              width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10, padding: "13px 14px 13px 40px", color: "#F5F3ED", fontSize: 14, outline: "none", boxSizing: "border-box",
            }} />
          </div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <label style={{ display: "block", color: "#9CA3C4", fontSize: 12, fontWeight: 600, marginBottom: 7 }}>Password</label>
          <div style={{ position: "relative" }}>
            <MdLock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#5ED4C4" }} />
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={{
              width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10, padding: "13px 14px 13px 40px", color: "#F5F3ED", fontSize: 14, outline: "none", boxSizing: "border-box",
            }} />
          </div>
        </div>

        {error && <p style={{ color: "#E8607A", fontSize: 12.5, marginBottom: 16 }}>{error}</p>}

        <button type="submit" disabled={loading} style={{
          width: "100%", background: loading ? "rgba(255,139,94,0.5)" : "linear-gradient(135deg, #FF8B5E, #FF6B35)",
          color: "#14182B", border: "none", borderRadius: 10, padding: "13px 0",
          fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
        }}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
