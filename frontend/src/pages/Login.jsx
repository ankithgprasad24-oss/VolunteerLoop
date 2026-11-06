import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HeartHandshake, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      const message = err.response?.data?.message;

      setError(
        message ||
        (err.response
          ? `Server error (${err.response.status}). Please try again.`
          : `Cannot connect to the server: ${err.message}`)
      );
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="brand">
          <span className="brand-icon"><HeartHandshake size={25} /></span>
          <span>VolunteerLoop</span>
        </Link>

        <div className="auth-heading">
          <p className="eyebrow">WELCOME BACK</p>
          <h1>Make a difference today.</h1>
          <p>Sign in to discover opportunities and track your volunteering journey.</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="email">Email address</label>
          <div className="input-wrap">
            <Mail size={18} />
            <input
              id="email"
              type="email"
              placeholder="you@university.edu"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <label htmlFor="password">Password</label>
          <div className="input-wrap">
            <Lock size={18} />
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="auth-switch">
          New to VolunteerLoop? <Link to="/register">Create an account</Link>
        </p>
      </section>

      <aside className="auth-visual">
        <div className="visual-content">
          <span className="visual-tag">SMALL ACTIONS. BIG IMPACT.</span>
          <h2>Your time can change someone's world.</h2>
          <p>Find campus opportunities, connect with people, and make every volunteer hour count.</p>
          <div className="visual-stat">
            <HeartHandshake size={22} />
            <span>One campus. Countless ways to contribute.</span>
          </div>
        </div>
      </aside>
    </main>
  );
}