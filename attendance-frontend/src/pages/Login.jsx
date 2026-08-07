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
    <div className="login-wrap">
      <div className="login-hero">
        <div className="brand">
          <div className="brand-mark">AR</div>
          <div className="brand-text">
            <h1>Attendance Register</h1>
            <span>College Attendance Management</span>
          </div>
        </div>
        <p className="login-hero-quote">
          Every roll call, <span>recorded</span>. Every percentage, <span>accurate</span>. One register for admins, teachers, and students.
        </p>
        <div style={{ color: "#d8cdb0", fontSize: 13 }}>
          Departments · Subjects · Sessions · Attendance — all in one ledger.
        </div>
      </div>

      <div className="login-form-side">
        <div className="card login-card">
          <h2>Welcome back</h2>
          <span className="sub">Sign in to open your register</span>

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
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 16, height: 16 }}></span> : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
