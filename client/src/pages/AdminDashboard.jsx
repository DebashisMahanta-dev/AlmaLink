import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [pendingAlumni, setPendingAlumni] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyUserId, setBusyUserId] = useState("");

  const currentUserId = user?._id || user?.id;

  const stats = useMemo(() => {
    const adminCount = users.filter((u) => u.role === "admin").length;
    const alumniCount = users.filter((u) => u.role === "alumni").length;
    return {
      totalUsers: users.length,
      admins: adminCount,
      alumni: alumniCount,
      pending: pendingAlumni.length
    };
  }, [users, pendingAlumni]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [usersRes, pendingRes, logsRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/pending-alumni"),
        api.get("/admin/audit-logs?limit=25")
      ]);
      setUsers(usersRes.data.users || []);
      setPendingAlumni(pendingRes.data.alumni || []);
      setAuditLogs(logsRes.data.logs || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load admin data");
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
      alert(res.data.message || "Role updated");
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update role");
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
      alert(res.data.message || "User removed");
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete user");
    } finally {
      setBusyUserId("");
    }
  };

  return (
    <div className="container py-5">
      <h1 className="mb-4">Admin Dashboard</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="alert alert-info">
        Only official staff can be promoted to admin according to backend policy settings.
      </div>

      <div className="row g-4">
        <div className="col-md-3">
          <div className="card bg-light">
            <div className="card-body text-center">
              <h3 className="card-title">{stats.pending}</h3>
              <p className="card-text text-muted">Pending Alumni</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-light">
            <div className="card-body text-center">
              <h3 className="card-title">{stats.admins}</h3>
              <p className="card-text text-muted">Admin Accounts</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-light">
            <div className="card-body text-center">
              <h3 className="card-title">{stats.totalUsers}</h3>
              <p className="card-text text-muted">Total Users</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-light">
            <div className="card-body text-center">
              <h3 className="card-title">{stats.alumni}</h3>
              <p className="card-text text-muted">Alumni Users</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-body">
          <h5 className="mb-3">Manage Users and Admins</h5>

          {loading ? (
            <div className="text-center py-4">Loading users...</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
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
                          <span className={`badge ${entry.role === "admin" ? "bg-danger" : "bg-secondary"}`}>
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
                              Delete User
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
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-body">
          <h5 className="mb-3">Recent Admin Activity</h5>
          {loading ? (
            <div className="text-center py-4">Loading activity...</div>
          ) : auditLogs.length === 0 ? (
            <p className="text-muted mb-0">No admin actions logged yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
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
                      <td>{new Date(log.createdAt).toLocaleString()}</td>
                      <td>
                        <span className="badge bg-dark">{log.action}</span>
                      </td>
                      <td>{log.actor?.email || "-"}</td>
                      <td>{log.target?.email || "-"}</td>
                      <td>{log.details || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
