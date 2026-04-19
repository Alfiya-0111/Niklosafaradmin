import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      setError("Invalid email or password. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center px-4">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "repeating-linear-gradient(45deg,#D4A853 0,#D4A853 1px,transparent 0,transparent 50%)",
          backgroundSize: "30px 30px",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <svg width="52" height="52" viewBox="0 0 36 36" fill="none" className="mb-4">
            <circle cx="18" cy="18" r="17" stroke="#D4A853" strokeWidth="1.2" />
            <path d="M7 22Q13 13 18 16Q23 19 29 12" stroke="#D4A853" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <circle cx="29" cy="12" r="2.5" fill="#D4A853" />
            <rect x="11" y="20" width="14" height="5" rx="2" fill="#2C2C4A" stroke="#D4A853" strokeWidth="0.8" />
          </svg>
          <h1 className="font-playfair text-3xl text-[#D4A853] tracking-wide">NikloSafar</h1>
          <p className="text-[#8B9BB4] text-sm mt-1 tracking-widest uppercase">Admin Panel</p>
        </div>

        {/* Card */}
        <div className="bg-white/4 border border-[#D4A853]/15 rounded-2xl p-8">
          <h2 className="font-playfair text-2xl text-white mb-1">Welcome back</h2>
          <p className="text-[#8B9BB4] text-sm mb-7">Sign in to manage your bookings</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#8B9BB4] uppercase tracking-widest mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@niklosafar.com"
                required
                className="w-full bg-white/6 border border-[#D4A853]/20 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D4A853] transition-colors placeholder-[#8B9BB4]/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8B9BB4] uppercase tracking-widest mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-white/6 border border-[#D4A853]/20 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D4A853] transition-colors placeholder-[#8B9BB4]/50"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D4A853] text-[#1A1A2E] py-3 rounded-lg font-bold text-sm tracking-wide hover:bg-[#F0C878] transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border-none"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-[#8B9BB4]/50 text-xs mt-6">
          Only authorized admins can access this panel
        </p>
      </div>
    </div>
  );
}