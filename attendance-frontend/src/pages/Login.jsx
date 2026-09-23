import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "teacher") navigate("/teacher");
      else navigate("/student");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
      <div className="hidden lg:flex flex-col justify-between p-16 bg-hero-glow text-paper">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brass-light to-brass flex items-center justify-center font-display font-bold text-ink text-lg shadow-brand-mark shrink-0">
            AR
          </div>
          <div>
            <h1 className="text-lg text-paper">Attendance Register</h1>
            <span className="text-xs text-paper-line uppercase tracking-wider">College Attendance Management</span>
          </div>
        </div>
        <p className="font-display text-[30px] leading-snug max-w-[420px] text-paper">
          Every roll call, <span className="text-brass-light italic">recorded</span>. Every percentage,{" "}
          <span className="text-brass-light italic">accurate</span>. One register for admins, teachers, and students.
        </p>
        <div className="text-paper-line text-[13px]">
          Departments · Subjects · Sessions · Attendance — all in one ledger.
        </div>
      </div>

      <div className="flex items-center justify-center p-8 bg-ink">
        <div className="card w-full max-w-[400px] px-9 py-10">
          <h2 className="text-2xl mb-1">Welcome back</h2>
          <span className="block text-muted text-sm mb-6">Sign in to open your register</span>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? (
                <span className="w-4 h-4 border-[3px] border-white/30 border-t-paper rounded-full animate-spin"></span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
