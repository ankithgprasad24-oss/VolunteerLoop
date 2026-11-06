import { useEffect, useState } from "react";
import {
  Search, CalendarDays, Clock3, Users, LogOut, Plus,
  MapPin, ArrowRight, Heart, Award, CheckCircle2,
  XCircle, AlertCircle, RefreshCw
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./Dashboard.css";

export default function Dashboard() {
  const { user, logout } = useAuth();

  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [hours, setHours] = useState({ totalHours: 0, records: [] });
  const [activeTab, setActiveTab] = useState("discover");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Community Service",
    location: "",
    startDate: "",
    endDate: "",
    requiredVolunteers: 10
  });

  const isCoordinator = user?.role === "coordinator";

  const loadData = async () => {
    setLoading(true);

    const endpoints = [
      "/opportunities",
      "/applications",
      "/shifts",
      "/hours"
    ];

    const results = await Promise.allSettled(
      endpoints.map(endpoint => api.get(endpoint))
    );

    const [opp, app, shift, hour] = results;

    if (opp.status === "fulfilled") {
      setOpportunities(opp.value.data.opportunities || []);
    }

    if (app.status === "fulfilled") {
      setApplications(app.value.data.applications || []);
    }

    if (shift.status === "fulfilled") {
      setShifts(shift.value.data.shifts || []);
    }

    if (hour.status === "fulfilled") {
      setHours({
        totalHours: hour.value.data.totalHours || 0,
        records: hour.value.data.records || []
      });
    }

    const failed = results
      .map((result, index) =>
        result.status === "rejected" ? endpoints[index] : null
      )
      .filter(Boolean);

    setMessage(
      failed.length
        ? `Unable to load: ${failed.join(", ")}. Check server access.`
        : ""
    );

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const apply = async (id) => {
    try {
      await api.post(`/applications/${id}`);
      setMessage("Your application has been submitted!");
      await loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to apply.");
    }
  };

  const createOpportunity = async (event) => {
    event.preventDefault();

    try {
      await api.post("/opportunities", {
        ...form,
        requiredVolunteers: Number(form.requiredVolunteers)
      });

      setMessage("Opportunity published successfully!");
      setShowForm(false);

      setForm({
        title: "",
        description: "",
        category: "Community Service",
        location: "",
        startDate: "",
        endDate: "",
        requiredVolunteers: 10
      });

      await loadData();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not publish opportunity."
      );
    }
  };

  const reviewApplication = async (id, status) => {
    try {
      await api.patch(`/applications/${id}/status`, { status });
      setMessage(`Application ${status}.`);
      await loadData();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not update application."
      );
    }
  };

  const filteredOpportunities = opportunities.filter(item => {
    const text =
      `${item.title} ${item.category} ${item.location}`.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const navItems = [
    { id: "discover", label: "Discover opportunities", icon: Search },
    { id: "applications", label: "My applications", icon: CalendarDays },
    { id: "shifts", label: "My shifts", icon: Clock3 },
    { id: "hours", label: "Volunteer hours", icon: Award },
    ...(isCoordinator
      ? [{ id: "manage", label: "Manage applications", icon: Users }]
      : [])
  ];

  return (
    <div className="vl-dashboard">
      <aside className="vl-sidebar">
        <div className="vl-brand">
          <div className="vl-brand-icon">
            <Heart size={22} fill="white" />
          </div>
          <span>Volunteer<span>Loop</span></span>
        </div>

        <div className="vl-side-label">WORKSPACE</div>

        <nav className="vl-nav">
          {navItems.map(item => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={
                  activeTab === item.id
                    ? "vl-nav-item active"
                    : "vl-nav-item"
                }
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="vl-sidebar-bottom">
          <div className="vl-user-card">
            <div className="vl-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "V"}
            </div>

            <div className="vl-user-info">
              <strong>{user?.name}</strong>
              <span>{user?.role || "Student"}</span>
            </div>
          </div>

          <button className="vl-logout" onClick={logout}>
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>

      <main className="vl-main">
        <header className="vl-topbar">
          <div>
            <div className="vl-eyebrow">CAMPUS VOLUNTEERING PORTAL</div>
            <h1>
              {navItems.find(item => item.id === activeTab)?.label ||
                "Dashboard"}
            </h1>
          </div>

          <div className="vl-top-actions">
            <span className="vl-role-pill">
              {isCoordinator ? "Coordinator" : "Student"}
            </span>

            <button
              className="vl-refresh"
              onClick={loadData}
              title="Refresh data"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </header>

        {message && (
          <div className="vl-message">
            <AlertCircle size={18} />
            <span>{message}</span>
            <button onClick={() => setMessage("")}>×</button>
          </div>
        )}

        <section className="vl-welcome">
          <div>
            <span className="vl-welcome-tag">MAKE AN IMPACT</span>
            <h2>
              Welcome, {user?.name?.split(" ")[0] || "Volunteer"}!
            </h2>
            <p>
              Find meaningful opportunities, show up for your community,
              and track the difference you make.
            </p>
          </div>

          <div className="vl-welcome-art">
            <div className="vl-art-circle">
              <Heart size={45} fill="white" />
            </div>
            <span>Small acts. Big impact.</span>
          </div>
        </section>

        <section className="vl-stats">
          <div className="vl-stat-card">
            <div className="vl-stat-icon purple"><Search size={21} /></div>
            <div>
              <span>Available opportunities</span>
              <strong>
                {opportunities.filter(o => o.status === "open").length}
              </strong>
            </div>
          </div>

          <div className="vl-stat-card">
            <div className="vl-stat-icon orange"><CalendarDays size={21} /></div>
            <div>
              <span>My applications</span>
              <strong>{applications.length}</strong>
            </div>
          </div>

          <div className="vl-stat-card">
            <div className="vl-stat-icon green"><Clock3 size={21} /></div>
            <div>
              <span>Volunteer hours</span>
              <strong>{hours.totalHours}</strong>
            </div>
          </div>

          <div className="vl-stat-card">
            <div className="vl-stat-icon blue"><Award size={21} /></div>
            <div>
              <span>Assigned shifts</span>
              <strong>{shifts.length}</strong>
            </div>
          </div>
        </section>

        {activeTab === "discover" && (
          <section className="vl-content-section">
            <div className="vl-section-heading">
              <div>
                <h2>Explore opportunities</h2>
                <p>Discover ways to contribute on campus and beyond.</p>
              </div>

              {isCoordinator && (
                <button
                  className="vl-primary-btn"
                  onClick={() => setShowForm(!showForm)}
                >
                  <Plus size={18} /> Post opportunity
                </button>
              )}
            </div>

            {showForm && isCoordinator && (
              <form className="vl-create-form" onSubmit={createOpportunity}>
                <h3>Publish a new opportunity</h3>

                <div className="vl-form-grid">
                  <label>
                    Opportunity title
                    <input
                      required
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Campus Clean-up Drive"
                    />
                  </label>

                  <label>
                    Category
                    <select
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                    >
                      <option>Community Service</option>
                      <option>Environment</option>
                      <option>Education</option>
                      <option>Healthcare</option>
                      <option>Events</option>
                      <option>Animal Welfare</option>
                    </select>
                  </label>

                  <label>
                    Location
                    <input
                      required
                      value={form.location}
                      onChange={e => setForm({ ...form, location: e.target.value })}
                      placeholder="Campus / location"
                    />
                  </label>

                  <label>
                    Volunteers needed
                    <input
                      required
                      type="number"
                      min="1"
                      value={form.requiredVolunteers}
                      onChange={e => setForm({
                        ...form,
                        requiredVolunteers: e.target.value
                      })}
                    />
                  </label>

                  <label>
                    Start date
                    <input
                      required
                      type="datetime-local"
                      value={form.startDate}
                      onChange={e => setForm({ ...form, startDate: e.target.value })}
                    />
                  </label>

                  <label>
                    End date
                    <input
                      required
                      type="datetime-local"
                      value={form.endDate}
                      onChange={e => setForm({ ...form, endDate: e.target.value })}
                    />
                  </label>
                </div>

                <label className="vl-full-label">
                  Description
                  <textarea
                    required
                    value={form.description}
                    onChange={e => setForm({
                      ...form,
                      description: e.target.value
                    })}
                    placeholder="Describe the volunteering activity..."
                  />
                </label>

                <div className="vl-form-actions">
                  <button
                    type="button"
                    className="vl-secondary-btn"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>

                  <button className="vl-primary-btn">
                    Publish opportunity
                  </button>
                </div>
              </form>
            )}

            <div className="vl-search">
              <Search size={19} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by title, category or location..."
              />
            </div>

            {loading ? (
              <div className="vl-empty">Loading opportunities...</div>
            ) : (
              <div className="vl-opportunity-grid">
                {filteredOpportunities.map(item => {
                  const applied = applications.some(
                    a =>
                      a.opportunity?._id === item._id ||
                      a.opportunity === item._id
                  );

                  return (
                    <article className="vl-op-card" key={item._id}>
                      <div className="vl-op-top">
                        <span className="vl-category">{item.category}</span>
                        <span className={`vl-status ${item.status}`}>
                          {item.status}
                        </span>
                      </div>

                      <h3>{item.title}</h3>

                      <p className="vl-op-description">
                        {item.description}
                      </p>

                      <div className="vl-op-meta">
                        <span><MapPin size={15} />{item.location}</span>
                        <span>
                          <Users size={15} />
                          {item.requiredVolunteers} volunteers
                        </span>
                      </div>

                      <div className="vl-op-date">
                        <CalendarDays size={15} />
                        {new Date(item.startDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </div>

                      <div className="vl-op-footer">
                        <span>
                          By {item.createdBy?.name || "Campus coordinator"}
                        </span>

                        {!isCoordinator && (
                          <button
                            disabled={applied || item.status !== "open"}
                            onClick={() => apply(item._id)}
                          >
                            {applied ? "Applied" : "Apply now"}
                            <ArrowRight size={15} />
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}

                {!filteredOpportunities.length && (
                  <div className="vl-empty">
                    No opportunities found. Try a different search.
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {activeTab === "applications" && (
          <section className="vl-content-section">
            <div className="vl-section-heading">
              <div>
                <h2>My applications</h2>
                <p>Keep track of your volunteering requests.</p>
              </div>
            </div>

            <div className="vl-table-wrap">
              <table className="vl-table">
                <thead>
                  <tr><th>Opportunity</th><th>Applied on</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {applications.map(a => (
                    <tr key={a._id}>
                      <td><strong>{a.opportunity?.title || "Opportunity"}</strong></td>
                      <td>{new Date(a.appliedAt || a.createdAt).toLocaleDateString("en-IN")}</td>
                      <td><span className={`vl-status ${a.status}`}>{a.status}</span></td>
                    </tr>
                  ))}

                  {!applications.length && (
                    <tr>
                      <td colSpan="3" className="vl-empty-cell">
                        You haven't applied to any opportunities yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "shifts" && (
          <section className="vl-content-section">
            <div className="vl-section-heading">
              <div>
                <h2>My assigned shifts</h2>
                <p>Your approved volunteering schedule.</p>
              </div>
            </div>

            <div className="vl-opportunity-grid">
              {shifts.map(s => (
                <article className="vl-op-card" key={s._id}>
                  <span className="vl-category">Assigned shift</span>
                  <h3>{s.title}</h3>
                  <p>{s.opportunity?.title}</p>
                  <div className="vl-op-date">
                    <CalendarDays size={15} />
                    {new Date(s.startTime).toLocaleString("en-IN")}
                  </div>
                  <div className="vl-op-date">
                    <Clock3 size={15} />
                    Until {new Date(s.endTime).toLocaleString("en-IN")}
                  </div>
                </article>
              ))}

              {!shifts.length && (
                <div className="vl-empty">No shifts assigned yet.</div>
              )}
            </div>
          </section>
        )}

        {activeTab === "hours" && (
          <section className="vl-content-section">
            <div className="vl-section-heading">
              <div>
                <h2>Volunteer hour record</h2>
                <p>Your verified contribution to the community.</p>
              </div>
            </div>

            <div className="vl-hours-banner">
              <Award size={34} />
              <div>
                <span>TOTAL VERIFIED HOURS</span>
                <strong>{hours.totalHours} hours</strong>
              </div>
            </div>

            <div className="vl-table-wrap">
              <table className="vl-table">
                <thead>
                  <tr>
                    <th>Opportunity</th><th>Date</th><th>Hours</th><th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {hours.records.map(r => (
                    <tr key={r._id}>
                      <td>{r.opportunity?.title}</td>
                      <td>{new Date(r.date).toLocaleDateString("en-IN")}</td>
                      <td><strong>{r.hours}</strong></td>
                      <td>{r.notes || "—"}</td>
                    </tr>
                  ))}

                  {!hours.records.length && (
                    <tr>
                      <td colSpan="4" className="vl-empty-cell">
                        No verified hours recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "manage" && isCoordinator && (
          <section className="vl-content-section">
            <div className="vl-section-heading">
              <div>
                <h2>Review applications</h2>
                <p>Approve or reject applications for your opportunities.</p>
              </div>
            </div>

            <div className="vl-table-wrap">
              <table className="vl-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Opportunity</th>
                    <th>Applied on</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(a => (
                    <tr key={a._id}>
                      <td>{a.student?.name}</td>
                      <td>{a.opportunity?.title}</td>
                      <td>{new Date(a.appliedAt || a.createdAt).toLocaleDateString("en-IN")}</td>
                      <td><span className={`vl-status ${a.status}`}>{a.status}</span></td>
                      <td>
                        {a.status === "pending" ? (
                          <div className="vl-review-actions">
                            <button onClick={() => reviewApplication(a._id, "approved")}>
                              <CheckCircle2 size={16} />Approve
                            </button>
                            <button onClick={() => reviewApplication(a._id, "rejected")}>
                              <XCircle size={16} />Reject
                            </button>
                          </div>
                        ) : "Reviewed"}
                      </td>
                    </tr>
                  ))}

                  {!applications.length && (
                    <tr>
                      <td colSpan="5" className="vl-empty-cell">
                        No applications to review.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <footer className="vl-footer">
          VolunteerLoop <span>·</span> Every hour makes a difference.
        </footer>
      </main>
    </div>
  );
}