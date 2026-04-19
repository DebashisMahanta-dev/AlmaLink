import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  Activity,
  ArrowRight,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Layers3,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  UserCheck,
  UserPlus,
} from "lucide-react";

const formatNumber = (value) => new Intl.NumberFormat("en-US").format(Number(value || 0));

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "-";

const statToneMap = {
  blue: "admin-stat--blue",
  green: "admin-stat--green",
  amber: "admin-stat--amber",
  rose: "admin-stat--rose",
  slate: "admin-stat--slate",
  violet: "admin-stat--violet"
};

const activitySeries = [
  { key: "signups7d", label: "Signups", color: "#20b14a" },
  { key: "jobs7d", label: "Jobs", color: "#3b82f6" },
  { key: "applications7d", label: "Applications", color: "#f59e0b" },
  { key: "messages7d", label: "Messages", color: "#8b5cf6" },
  { key: "posts7d", label: "Posts", color: "#ef4444" },
  { key: "approvals7d", label: "Approvals", color: "#0f766e" },
  { key: "connections7d", label: "Connections", color: "#14b8a6" }
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingAlumni, setPendingAlumni] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyUserId, setBusyUserId] = useState("");

  const currentUserId = user?._id || user?.id;
  const overview = analytics?.overview || {};
  const trends = analytics?.trends || {};

  const latestUsers = useMemo(
    () =>
      [...users]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 6),
    [users]
  );

  const weeklyActivity = useMemo(() => {
    const labels = trends.signups7d?.map((day) => day.label) || [];
    return labels.map((label, index) => {
      const day = {
        label,
        signups: trends.signups7d?.[index]?.count || 0,
        jobs: trends.jobs7d?.[index]?.count || 0,
        applications: trends.applications7d?.[index]?.count || 0,
        messages: trends.messages7d?.[index]?.count || 0,
        posts: trends.posts7d?.[index]?.count || 0,
        approvals: trends.approvals7d?.[index]?.count || 0,
        connections: trends.connections7d?.[index]?.count || 0
      };
      day.total =
        day.signups +
        day.jobs +
        day.applications +
        day.messages +
        day.posts +
        day.approvals +
        day.connections;
      return day;
    });
  }, [trends]);

  const maxWeeklyTotal = Math.max(...weeklyActivity.map((day) => day.total), 1);

  const metrics = useMemo(
    () => [
      {
        label: "Total Users",
        value: overview.totalUsers,
        icon: Users,
        tone: "blue",
        note: `${formatNumber(overview.activeUsers30d)} active in 30 days`
      },
      {
        label: "Pending Alumni",
        value: overview.pendingAlumni,
        icon: UserPlus,
        tone: "amber",
        note: "Waiting for review"
      },
      {
        label: "Approval Rate",
        value: `${overview.approvalRate || 0}%`,
        icon: ShieldCheck,
        tone: "green",
        note: `${formatNumber(overview.approvedAlumni)} approved alumni`
      },
      {
        label: "Live Jobs",
        value: overview.activeJobs,
        icon: Briefcase,
        tone: "violet",
        note: `${formatNumber(overview.expiringSoonJobs)} expiring soon`
      },
      {
        label: "Messages",
        value: overview.totalMessages,
        icon: MessageSquare,
        tone: "slate",
        note: `${formatNumber(overview.unreadMessages)} unread messages`
      },
      {
        label: "Engagement",
        value: formatNumber((overview.totalLikes || 0) + (overview.totalComments || 0) + (overview.acceptedConnections || 0)),
        icon: Activity,
        tone: "rose",
        note: `${formatNumber(overview.totalPosts)} posts and updates`
      }
    ],
    [overview]
  );

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [analyticsRes, usersRes, pendingRes, logsRes] = await Promise.all([
        api.get("/admin/analytics"),
        api.get("/admin/users"),
        api.get("/admin/pending-alumni"),
        api.get("/admin/audit-logs?limit=20")
      ]);

      setAnalytics(analyticsRes.data || null);
      setUsers(usersRes.data.users || []);
      setPendingAlumni(pendingRes.data.alumni || []);
      setAuditLogs(logsRes.data.logs || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load admin analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateRole = async (targetUser, role) => {
    setBusyUserId(targetUser._id);
    setError("");
    try {
      const res = await api.patch(`/admin/users/${targetUser._id}/role`, { role });
      toast.success(res.data.message || "Role updated");
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update role");
    } finally {
      setBusyUserId("");
    }
  };

  const approveAlumni = async (targetUser) => {
    setBusyUserId(targetUser._id);
    setError("");
    try {
      const res = await api.patch(`/admin/approve/${targetUser._id}`);
      toast.success(res.data.message || "Alumni approved");
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to approve alumni");
    } finally {
      setBusyUserId("");
    }
  };

  const handleDeleteUser = async (targetUser) => {
    const confirmed = window.confirm(`Delete user ${targetUser.email}? This cannot be undone.`);
    if (!confirmed) return;

    setBusyUserId(targetUser._id);
    setError("");
    try {
      const res = await api.delete(`/admin/users/${targetUser._id}`);
      toast.success(res.data.message || "User removed");
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete user");
    } finally {
      setBusyUserId("");
    }
  };

  return (
    <div className="admin-analytics-page">
      <section className="admin-analytics-hero">
        <div className="container">
          <div className="admin-analytics-hero__shell">
            <div className="admin-analytics-hero__copy">
              <span className="admin-analytics__eyebrow">
                <Sparkles size={14} />
                Admin Analytics
              </span>
              <h1>Measure the pulse of GCE Connect.</h1>
              <p>
                Track approvals, user activity, job flow, and community engagement in one clean dashboard connected
                to the live backend.
              </p>

              <div className="admin-analytics-hero__actions">
                <Link to="/approve-alumni" className="admin-pill-btn admin-pill-btn--light">
                  Review approvals
                  <ArrowRight size={16} />
                </Link>
                <Link to="/manage-jobs" className="admin-pill-btn admin-pill-btn--ghost">
                  Manage jobs
                </Link>
              </div>
            </div>

            <div className="admin-analytics-hero__summary">
              <div className="admin-analytics-hero__summary-card">
                <span className="admin-analytics__mini-label">Active users</span>
                <strong>{formatNumber(overview.activeUsers30d)}</strong>
                <p>Unique members active across posts, messages, applications, and connections.</p>
              </div>
              <div className="admin-analytics-hero__summary-card">
                <span className="admin-analytics__mini-label">Pending alumni</span>
                <strong>{formatNumber(overview.pendingAlumni)}</strong>
                <p>New alumni registrations waiting for admin approval.</p>
              </div>
              <div className="admin-analytics__summary-row">
                <div>
                  <span className="admin-analytics__mini-label">Approval rate</span>
                  <strong>{overview.approvalRate || 0}%</strong>
                </div>
                <div>
                  <span className="admin-analytics__mini-label">Live jobs</span>
                  <strong>{formatNumber(overview.activeJobs)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container admin-analytics__main">
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="admin-analytics__metrics">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <article key={metric.label} className={`admin-stat ${statToneMap[metric.tone] || ""}`}>
                <div className="admin-stat__top">
                  <span className="admin-stat__icon">
                    <Icon size={18} />
                  </span>
                  <span className="admin-stat__label">{metric.label}</span>
                </div>
                <strong className="admin-stat__value">{loading ? "..." : metric.value}</strong>
                <p className="admin-stat__note">{metric.note}</p>
              </article>
            );
          })}
        </div>

        <section className="admin-analytics__grid">
          <article className="admin-panel admin-panel--chart">
            <div className="admin-panel__head">
              <div>
                <span className="admin-analytics__section-label">
                  <TrendingUp size={14} />
                  Weekly activity
                </span>
                <h2>User activity over the last 7 days</h2>
              </div>
              <span className="admin-panel__badge">
                <Clock3 size={14} />
                Live data
              </span>
            </div>

            {loading ? (
              <div className="admin-panel__empty">Loading weekly activity...</div>
            ) : weeklyActivity.length === 0 ? (
              <div className="admin-panel__empty">No activity yet.</div>
            ) : (
              <>
                <div className="admin-analytics__legend">
                  {activitySeries.map((series) => (
                    <span key={series.key}>
                      <i style={{ backgroundColor: series.color }} />
                      {series.label}
                    </span>
                  ))}
                </div>

                <div className="admin-analytics__chart">
                  {weeklyActivity.map((day) => (
                    <div key={day.label} className="admin-analytics__bar">
                      <div className="admin-analytics__bar-stack" style={{ height: `${Math.max(44, Math.round((day.total / maxWeeklyTotal) * 180))}px` }}>
                        {activitySeries.map((series) => {
                          const count = day[series.key] || 0;
                          if (!count) return null;
                          return (
                            <span
                              key={series.key}
                              className="admin-analytics__bar-segment"
                              style={{ flex: count, backgroundColor: series.color }}
                              title={`${series.label}: ${count}`}
                            />
                          );
                        })}
                      </div>
                      <div className="admin-analytics__bar-meta">
                        <span>{day.label}</span>
                        <strong>{day.total}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </article>

          <article className="admin-panel admin-panel--snapshot">
            <div className="admin-panel__head">
              <div>
                <span className="admin-analytics__section-label">
                  <Layers3 size={14} />
                  Health snapshot
                </span>
                <h2>Platform health at a glance</h2>
              </div>
            </div>

            <div className="admin-snapshot">
              <div className="admin-snapshot__item">
                <div className="admin-snapshot__meta">
                  <span>Approval pipeline</span>
                  <strong>{overview.approvalRate || 0}%</strong>
                </div>
                <div className="admin-progress">
                  <span style={{ width: `${overview.approvalRate || 0}%` }} />
                </div>
                <p>{formatNumber(overview.approvedAlumni)} approved alumni out of {formatNumber(overview.totalAlumni)} total alumni.</p>
              </div>

              <div className="admin-snapshot__item">
                <div className="admin-snapshot__meta">
                  <span>Job health</span>
                  <strong>{overview.activeJobsRate || 0}%</strong>
                </div>
                <div className="admin-progress">
                  <span style={{ width: `${overview.activeJobsRate || 0}%`, background: "linear-gradient(135deg, #3b82f6, #60a5fa)" }} />
                </div>
                <p>{formatNumber(overview.activeJobs)} active job posts and {formatNumber(overview.expiringSoonJobs)} expiring soon.</p>
              </div>

              <div className="admin-snapshot__item">
                <div className="admin-snapshot__meta">
                  <span>Community engagement</span>
                  <strong>{overview.acceptedConnectionRate || 0}%</strong>
                </div>
                <div className="admin-progress">
                  <span style={{ width: `${overview.acceptedConnectionRate || 0}%`, background: "linear-gradient(135deg, #14b8a6, #2dd4bf)" }} />
                </div>
                <p>{formatNumber(overview.totalConnections)} connection requests, {formatNumber(overview.totalConversations)} conversations, and {formatNumber(overview.totalMessages)} messages.</p>
              </div>
            </div>

            <div className="admin-quick-links">
              <Link to="/approve-alumni">Approve alumni</Link>
              <Link to="/manage-jobs">Moderate jobs</Link>
              <Link to="/manage-events">Edit events</Link>
              <Link to="/announcements">Send announcements</Link>
            </div>
          </article>
        </section>

        <section className="admin-analytics__engagement">
          <article className="admin-mini-card">
            <span className="admin-mini-card__icon">
              <FileText size={16} />
            </span>
            <strong>{formatNumber(overview.totalPosts)}</strong>
            <p>Community posts</p>
          </article>
          <article className="admin-mini-card">
            <span className="admin-mini-card__icon">
              <MessageSquare size={16} />
            </span>
            <strong>{formatNumber(overview.totalMessages)}</strong>
            <p>Direct messages</p>
          </article>
          <article className="admin-mini-card">
            <span className="admin-mini-card__icon">
              <CalendarDays size={16} />
            </span>
            <strong>{formatNumber(overview.totalEvents)}</strong>
            <p>Events managed</p>
          </article>
          <article className="admin-mini-card">
            <span className="admin-mini-card__icon">
              <CheckCircle2 size={16} />
            </span>
            <strong>{formatNumber(overview.totalApplications)}</strong>
            <p>Job applications</p>
          </article>
          <article className="admin-mini-card">
            <span className="admin-mini-card__icon">
              <UserCheck size={16} />
            </span>
            <strong>{formatNumber(overview.totalConnections)}</strong>
            <p>Connection requests</p>
          </article>
          <article className="admin-mini-card">
            <span className="admin-mini-card__icon">
              <Users size={16} />
            </span>
            <strong>{formatNumber(overview.activeUsers30d)}</strong>
            <p>Active members</p>
          </article>
        </section>

        <section className="admin-analytics__ops-grid">
          <article className="admin-panel">
            <div className="admin-panel__head">
              <div>
                <span className="admin-analytics__section-label">
                  <UserPlus size={14} />
                  Pending approvals
                </span>
                <h2>Alumni accounts waiting for review</h2>
              </div>
              <span className="admin-panel__badge">{pendingAlumni.length} waiting</span>
            </div>

            {loading ? (
              <div className="admin-panel__empty">Loading pending alumni...</div>
            ) : pendingAlumni.length === 0 ? (
              <div className="admin-panel__empty">No pending alumni registrations right now.</div>
            ) : (
              <div className="admin-list">
                {pendingAlumni.map((entry) => {
                  const isBusy = busyUserId === entry._id;
                  return (
                    <div key={entry._id} className="admin-list__item">
                      <div>
                        <strong>{entry.name}</strong>
                        <p>{entry.email}</p>
                        <span>{entry.alumniProfile?.branch || "Branch not set"}</span>
                      </div>
                      <button
                        className="btn btn-sm btn-success"
                        disabled={isBusy}
                        onClick={() => approveAlumni(entry)}
                      >
                        Approve
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </article>

          <article className="admin-panel">
            <div className="admin-panel__head">
              <div>
                <span className="admin-analytics__section-label">
                  <Users size={14} />
                  Recent members
                </span>
                <h2>Latest signups</h2>
              </div>
              <span className="admin-panel__badge">Fresh users</span>
            </div>

            {loading ? (
              <div className="admin-panel__empty">Loading recent users...</div>
            ) : latestUsers.length === 0 ? (
              <div className="admin-panel__empty">No users found.</div>
            ) : (
              <div className="admin-list">
                {latestUsers.map((entry) => (
                  <div key={entry._id} className="admin-list__item">
                    <div>
                      <strong>{entry.name}</strong>
                      <p>{entry.email}</p>
                      <span>
                        {entry.role} {entry.approved ? "• approved" : "• pending"}
                      </span>
                    </div>
                    <span className="admin-list__time">{formatDateTime(entry.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>

        <section className="admin-panel admin-panel--table">
          <div className="admin-panel__head">
            <div>
              <span className="admin-analytics__section-label">
                <ShieldCheck size={14} />
                User control
              </span>
              <h2>Manage users and admin access</h2>
            </div>
            <span className="admin-panel__badge">Live management</span>
          </div>

          {loading ? (
            <div className="admin-panel__empty">Loading users...</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((entry) => {
                    const isSelf = entry._id === currentUserId;
                    const isBusy = busyUserId === entry._id;
                    return (
                      <tr key={entry._id}>
                        <td>{entry.name}</td>
                        <td>{entry.email}</td>
                        <td>
                          <span className={`admin-role-badge admin-role-badge--${entry.role}`}>
                            {entry.role}
                          </span>
                        </td>
                        <td>{entry.approved ? "Approved" : "Pending"}</td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2">
                            {entry.role !== "admin" ? (
                              <button
                                className="btn btn-sm btn-outline-success"
                                disabled={isBusy}
                                onClick={() => updateRole(entry, "admin")}
                              >
                                Make Admin
                              </button>
                            ) : (
                              <button
                                className="btn btn-sm btn-outline-warning"
                                disabled={isBusy || isSelf}
                                onClick={() => updateRole(entry, "alumni")}
                              >
                                Remove Admin
                              </button>
                            )}

                            <button
                              className="btn btn-sm btn-outline-danger"
                              disabled={isBusy || isSelf}
                              onClick={() => handleDeleteUser(entry)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="admin-panel admin-panel--table">
          <div className="admin-panel__head">
            <div>
              <span className="admin-analytics__section-label">
                <Clock3 size={14} />
                Recent admin activity
              </span>
              <h2>Audit trail</h2>
            </div>
            <span className="admin-panel__badge">Latest actions</span>
          </div>

          {loading ? (
            <div className="admin-panel__empty">Loading activity...</div>
          ) : auditLogs.length === 0 ? (
            <div className="admin-panel__empty">No admin actions logged yet.</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle admin-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Action</th>
                    <th>Admin</th>
                    <th>Target</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log._id}>
                      <td>{formatDateTime(log.createdAt)}</td>
                      <td>
                        <span className="admin-role-badge admin-role-badge--neutral">{log.action}</span>
                      </td>
                      <td>{log.actor?.email || "-"}</td>
                      <td>{log.target?.email || log.target?.name || "-"}</td>
                      <td>{log.details || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
