import { Link } from "react-router-dom";
import {
  ArrowRight,
  HeartHandshake,
  CalendarDays,
  Clock3,
  Users,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";

const features = [
  {
    icon: CalendarDays,
    title: "Discover Opportunities",
    description:
      "Explore campus volunteering events and find opportunities that match your interests.",
  },
  {
    icon: Users,
    title: "Easy Applications",
    description:
      "Apply for volunteering opportunities and track your application status.",
  },
  {
    icon: Clock3,
    title: "Track Volunteer Hours",
    description:
      "Maintain a record of your volunteering contributions and completed hours.",
  },
  {
    icon: ShieldCheck,
    title: "Prevent Shift Clashes",
    description:
      "Identify overlapping shifts and avoid scheduling conflicts automatically.",
  },
];

export default function Home() {
  return (
    <main className="home-page">
      <nav className="navbar">
        <Link to="/" className="brand">
          <span className="brand-icon">
            <HeartHandshake size={23} />
          </span>
          VolunteerLoop
        </Link>

        <div className="nav-links">
          <a href="#features">Features</a>
          <Link to="/login" className="nav-login">Log in</Link>
          <Link to="/register" className="nav-register">
            Get Started <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <div className="eyebrow">
            <GraduationCap size={16} />
            CAMPUS VOLUNTEERING PLATFORM
          </div>

          <h1>
            Make a difference.
            <br />
            <span>One hour at a time.</span>
          </h1>

          <p className="hero-description">
            Discover campus volunteering opportunities, connect with
            meaningful causes, manage your shifts, and track every hour
            you contribute.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="primary-button">
              Start Volunteering <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="secondary-button">
              Sign in
            </Link>
          </div>

          <div className="hero-note">
            <ShieldCheck size={17} />
            Built for a better campus community
          </div>
        </div>

        <div className="hero-visual">
          <div className="main-visual-card">
            <div className="visual-card-top">
              <span className="visual-label">YOUR IMPACT MATTERS</span>
              <HeartHandshake size={23} />
            </div>

            <div className="visual-illustration">
              <div className="illustration-circle circle-one" />
              <div className="illustration-circle circle-two" />
              <div className="illustration-person person-one">S</div>
              <div className="illustration-person person-two">V</div>
              <div className="illustration-person person-three">C</div>
              <div className="illustration-heart">
                <HeartHandshake size={42} />
              </div>
            </div>

            <h3>Small actions. Big impact.</h3>
            <p>Every contribution counts.</p>
          </div>

          <div className="impact-card impact-card-top">
            <span className="impact-icon">
              <CalendarDays size={21} />
            </span>
            <div className="impact-text">
              <strong>New opportunities</strong>
              <small>Find your next event</small>
            </div>
          </div>

          <div className="impact-card impact-card-bottom">
            <span className="impact-icon green">
              <Clock3 size={21} />
            </span>
            <div className="impact-text">
              <strong>Every hour counts</strong>
              <small>Track your contribution</small>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="section-heading">
          <span className="section-eyebrow">WHY VOLUNTEERLOOP?</span>
          <h2>Everything you need to give back.</h2>
          <p>
            One simple platform to discover, participate, and make your
            volunteering journey count.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article className="feature-card" key={feature.title}>
                <div className="feature-icon">
                  <Icon size={23} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bottom-cta">
        <h2>Ready to make an impact?</h2>
        <p>Join your campus volunteering community today.</p>
        <Link to="/register" className="primary-button">
          Create Your Account <ArrowRight size={18} />
        </Link>
      </section>

      <footer className="footer">
        <Link to="/" className="brand">
          <HeartHandshake size={20} />
          VolunteerLoop
        </Link>
        <span>Campus volunteering, made simple.</span>
        <span>© 2026 VolunteerLoop</span>
      </footer>
    </main>
  );
}