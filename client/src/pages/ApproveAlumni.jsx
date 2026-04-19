import React, { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

const ApproveAlumni = () => {
  const toast = useToast();
  const [pendingAlumni, setPendingAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyUserId, setBusyUserId] = useState("");

  const loadPendingAlumni = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/pending-alumni");
      setPendingAlumni(res.data.alumni || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load pending alumni");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPendingAlumni();
  }, [loadPendingAlumni]);

  const approveAlumni = async (targetUser) => {
    setBusyUserId(targetUser._id);
    setError("");
    try {
      const res = await api.patch(`/admin/approve/${targetUser._id}`);
      toast.success(res.data.message || "Alumni approved");
      await loadPendingAlumni();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to approve alumni");
    } finally {
      setBusyUserId("");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f5f7fb 0%, #eef2f7 100%)",
        padding: "32px 16px"
      }}
    >
      <div className="container" style={{ maxWidth: "1180px" }}>
        <div className="d-flex align-items-end justify-content-between flex-wrap gap-3 mb-4">
          <div>
            <h1 className="fw-bold mb-2" style={{ letterSpacing: "-0.03em" }}>
              Approve Alumni Registrations
            </h1>
            <p className="text-muted mb-0">
              Review new alumni signups and approve them before they can post jobs.
            </p>
          </div>
          <button className="btn btn-outline-primary rounded-pill px-4" onClick={loadPendingAlumni} type="button">
            Refresh
          </button>
        </div>

        {error && (
          <div className="alert alert-danger border-0 shadow-sm rounded-4 mb-4" role="alert">
            {error}
          </div>
        )}

        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-4 p-md-5">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
              <h5 className="mb-0 fw-bold">Pending Alumni</h5>
              <span className="badge rounded-pill text-dark px-3 py-2" style={{ background: "#fff4cc" }}>
                {pendingAlumni.length} awaiting approval
              </span>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <div className="text-muted">Loading pending alumni...</div>
              </div>
            ) : pendingAlumni.length === 0 ? (
              <div
                className="text-center py-5 rounded-4"
                style={{ background: "linear-gradient(180deg, #fbfcfe 0%, #f7f9fc 100%)", border: "1px dashed #d8e0ea" }}
              >
                <div className="mb-3" style={{ fontSize: "2rem" }}>
                  {"\u2705"}
                </div>
                <h5 className="fw-semibold mb-2">No pending alumni registrations</h5>
                <p className="text-muted mb-0">
                  New alumni signups will appear here automatically after they complete registration.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Branch</th>
                      <th>Graduation Year</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingAlumni.map((entry) => {
                      const isBusy = busyUserId === entry._id;
                      return (
                        <tr key={entry._id}>
                          <td className="fw-semibold">{entry.name}</td>
                          <td>{entry.email}</td>
                          <td>{entry.alumniProfile?.branch || "-"}</td>
                          <td>{entry.alumniProfile?.graduationYear || "-"}</td>
                          <td className="text-end">
                            <button
                              className="btn btn-success rounded-pill px-4"
                              disabled={isBusy}
                              onClick={() => approveAlumni(entry)}
                            >
                              {isBusy ? "Approving..." : "Approve"}
                            </button>
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
      </div>
    </div>
  );
};

export default ApproveAlumni;
