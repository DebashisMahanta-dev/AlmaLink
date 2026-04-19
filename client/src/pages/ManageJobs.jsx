import React, { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import {
  AlertCircle,
  BadgeCheck,
  Briefcase,
  CalendarClock,
  Building2,
  Clock3,
  Eye,
  MapPin,
  Trash2,
  Users
} from "lucide-react";

const ManageJobs = () => {
  const toast = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyJobId, setBusyJobId] = useState("");

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/jobs");
      setJobs(res.data.jobs || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load job posts");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleDeleteJob = async (jobId) => {
    const confirmed = window.confirm("Delete this job post? This cannot be undone.");
    if (!confirmed) return;

    setBusyJobId(jobId);
    try {
      await api.delete(`/admin/jobs/${jobId}`);
      setJobs((current) => current.filter((job) => job._id !== jobId));
      toast.success("Job deleted successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete job");
    } finally {
      setBusyJobId("");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(59, 130, 246, 0.10), transparent 28%), radial-gradient(circle at top right, rgba(16, 185, 129, 0.10), transparent 24%), linear-gradient(135deg, #eef4fb 0%, #f7fafc 100%)",
        paddingBottom: "40px"
      }}
    >
      <div className="container py-4">
        <div
          className="rounded-4 p-4 p-md-5 mb-4 position-relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8fbff 55%, #eef6ff 100%)",
            border: "1px solid #dbeafe",
            boxShadow: "0 18px 40px rgba(14, 30, 37, 0.06)"
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "auto -50px -40px auto",
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)"
            }}
          />
          <div className="position-relative">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
              <span className="badge rounded-pill px-3 py-2 text-bg-primary-subtle text-primary border border-primary-subtle d-inline-flex align-items-center gap-2">
                <Briefcase size={14} />
                Admin job board
              </span>
              <span className="badge rounded-pill px-3 py-2 text-bg-light text-secondary border">
                {jobs.length} posts
              </span>
            </div>

            <h1 className="fw-bold mb-2" style={{ fontSize: "clamp(2rem, 4vw, 2.9rem)", letterSpacing: "-0.03em" }}>
              Manage Job Posts
            </h1>
            <p className="text-muted mb-0" style={{ maxWidth: "44rem", fontSize: "1.05rem" }}>
              Review every job post in the system, open the original job details, and remove anything that should not stay live.
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger border-0 shadow-sm rounded-4 mb-4" role="alert">
            <AlertCircle size={18} className="me-2" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-4 p-5 text-center" style={{ background: "#fff", border: "1px solid #e3e8ef" }}>
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{ width: 80, height: 80, background: "#f2f6ff", color: "#94a3b8" }}
            >
              <Briefcase size={36} />
            </div>
            <h5 className="fw-semibold mb-2">No job posts to moderate</h5>
            <p className="text-muted mb-0">Jobs posted by approved alumni will appear here automatically.</p>
          </div>
        ) : (
          <div className="row g-4">
            {jobs.map((job) => {
              const postedBy = job.postedBy || {};
              const postedByAvatar =
                postedBy.photoUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(postedBy.name || "User")}&background=0D8ABC&color=fff&size=80`;
              const expiryLabel = job.expiryDate ? new Date(job.expiryDate).toLocaleDateString() : "No expiry";
              const createdLabel = job.createdAt ? new Date(job.createdAt).toLocaleDateString() : null;
              const roleLabel = job.roles?.length
                ? `${job.roles.includes("freshers") ? "Freshers" : ""}${job.roles.includes("freshers") && job.roles.includes("experienced") ? " & " : ""}${job.roles.includes("experienced") ? "Experienced" : ""}`
                : "All roles";

              return (
                <div key={job._id} className="col-md-6 col-xl-4">
                  <div
                    className="rounded-4 p-4 h-100 d-flex flex-column"
                    style={{
                      background: "#fff",
                      border: "1px solid #e3e8ef",
                      boxShadow: "0 12px 24px rgba(14, 30, 37, 0.05)"
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                          <span className="badge rounded-pill text-bg-primary-subtle text-primary border border-primary-subtle">
                            Live job
                          </span>
                          {job.type && (
                            <span className="badge rounded-pill text-bg-light text-secondary border">
                              {job.type}
                            </span>
                          )}
                        </div>
                        <h5 className="fw-bold mb-1" style={{ letterSpacing: "-0.02em" }}>
                          {job.title}
                        </h5>
                        <p className="text-muted mb-0">{job.company}</p>
                      </div>
                      <button
                        className="btn btn-link text-primary p-0"
                        onClick={() => window.open(`/jobs/${job._id}`, "_blank", "noreferrer")}
                        type="button"
                        aria-label="Open job"
                      >
                        <Eye size={18} />
                      </button>
                    </div>

                    <div className="d-flex align-items-center gap-3 mb-3">
                      <img
                        src={postedByAvatar}
                        alt={postedBy.name || "Posted by"}
                        className="rounded-circle"
                        style={{ width: 42, height: 42, objectFit: "cover", border: "2px solid #e8eefc" }}
                      />
                      <div>
                        <div className="small fw-semibold">Posted by</div>
                        <div className="text-muted small">{postedBy.name || "Unknown"}</div>
                        <div className="text-muted small">{postedBy.email || "-"}</div>
                      </div>
                    </div>

                    <div className="d-grid gap-2 mb-3">
                      {job.location && (
                        <div className="d-flex align-items-center gap-2 text-muted small">
                          <MapPin size={14} />
                          <span>{job.location}</span>
                        </div>
                      )}
                      {expiryLabel && (
                        <div className="d-flex align-items-center gap-2 text-muted small">
                          <CalendarClock size={14} />
                          <span>Expires {expiryLabel}</span>
                        </div>
                      )}
                      {createdLabel && (
                        <div className="d-flex align-items-center gap-2 text-muted small">
                          <Clock3 size={14} />
                          <span>Created {createdLabel}</span>
                        </div>
                      )}
                      <div className="d-flex align-items-center gap-2 text-muted small">
                        <Building2 size={14} />
                        <span>{postedBy.alumniProfile?.branch || "Alumni post"}</span>
                      </div>
                    </div>

                    <p className="text-muted small mb-4" style={{ lineHeight: 1.5 }}>
                      {job.description?.substring(0, 140)}
                      {job.description?.length > 140 ? "..." : ""}
                    </p>

                    <div className="mb-4">
                      <span className="badge rounded-pill px-3 py-2 text-bg-info-subtle text-info border border-info-subtle">
                        <BadgeCheck size={14} className="me-1" />
                        {roleLabel}
                      </span>
                    </div>

                    <div className="mt-auto d-flex gap-2">
                      <a
                        href={`/jobs/${job._id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline-primary rounded-pill flex-grow-1 d-inline-flex align-items-center justify-content-center gap-2"
                      >
                        View
                      </a>
                      <button
                        className="btn btn-outline-danger rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 44, height: 44 }}
                        onClick={() => handleDeleteJob(job._id)}
                        disabled={busyJobId === job._id}
                        type="button"
                        aria-label="Delete job"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageJobs;
