import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HeartHandshake, User, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create account. Please try again.");
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
          <p className="eyebrow">JOIN THE COMMUNITY</p>
          <h1>Start making an impact.</h1>
          <p>Create your account and discover ways to contribute on campus.</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="name">Full name</label>
          <div className="input-wrap">
            <User size={18} />
            <input
              id="name"
              type="text"
              placeholder="Your full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              minLength={2}
              maxLength={60}
              required
            />
          </div>

          <label htmlFor="email">University email</label>
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

          <label htmlFor="role">Account type</label>
          <select
            id="role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="student">Student volunteer</option>
            <option value="coordinator">Event coordinator</option>
          </select>

          <label htmlFor="password">Password</label>
          <div className="input-wrap">
            <Lock size={18} />
            <input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              minLength={8}
              required
            />
          </div>

          <label htmlFor="confirmPassword">Confirm password</label>
          <div className="input-wrap">
            <Lock size={18} />
            <input
              id="confirmPassword"
              type="password"
              placeholder="Enter your password again"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              minLength={8}
              required
            />
          </div>

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="auth-switch">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </section>

      <aside className="auth-visual">
        <div className="visual-content">
          <span className="visual-tag">BE PART OF SOMETHING GOOD</span>
          <h2>Give your time. Grow your community.</h2>
          <p>Every event, every hour, and every helping hand makes a difference.</p>
          <div className="visual-stat">
            <HeartHandshake size={22} />
            <span>Your volunteering journey starts here.</span>
          </div>
        </div>
      </aside>
    </main>
  );
}
