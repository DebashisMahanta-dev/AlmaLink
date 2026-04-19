import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import {
  Briefcase,
  Plus,
  Edit3,
  Trash2,
  AlertCircle,
  FolderKanban,
  Sparkles,
  ArrowRight,
  MapPin,
  CalendarClock,
  BadgeCheck
} from "lucide-react";
import PostJob from "./PostJob";
import ShareExperience from "./ShareExperience";

const MyJobs = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("jobs");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (activeTab === "jobs") {
      loadJobs();
    }
  }, [activeTab]);

  const loadJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/jobs/my-posts");
      setJobs(res.data.jobs || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job posting?")) return;

    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs((current) => current.filter((job) => job._id !== jobId));
      toast.success("Job deleted successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete job");
    }
  };

  const tabs = [
    { key: "jobs", label: "My Job Posts", icon: Briefcase },
    { key: "post", label: "Post a Job", icon: Plus },
    { key: "share", label: "Share Experience", icon: Edit3 }
  ];

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
                <FolderKanban size={14} />
                Job workspace
              </span>
              <span className="badge rounded-pill px-3 py-2 text-bg-light text-secondary border">
                {jobs.length} live posts
              </span>
            </div>

            <h2 className="fw-bold mb-2" style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", letterSpacing: "-0.03em" }}>
              Job Management
            </h2>
            <p className="text-muted mb-4" style={{ maxWidth: "42rem" }}>
              Manage your openings, publish new opportunities, and share expertise with the GCE community.
            </p>

            <div className="d-flex flex-wrap gap-2" role="tablist">
              {tabs.map((tab) => {
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    className={`btn btn-lg rounded-pill px-4 d-inline-flex align-items-center gap-2 ${active ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setActiveTab(tab.key)}
                    role="tab"
                    type="button"
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {activeTab === "jobs" && (
          <div>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : error ? (
              <div className="alert alert-danger" role="alert">
                <AlertCircle size={18} className="me-2" />
                {error}
              </div>
            ) : jobs.length === 0 ? (
              <div className="rounded-4 p-5 text-center" style={{ background: "#fff", border: "1px solid #e3e8ef" }}>
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                  style={{ width: 80, height: 80, background: "#f2f6ff", color: "#94a3b8" }}
                >
                  <Briefcase size={36} />
                </div>
                <h5 className="fw-semibold mb-2">You haven't posted any jobs yet</h5>
                <p className="text-muted mb-4">Create your first opportunity and reach students instantly.</p>
                <button className="btn btn-primary rounded-pill px-4 d-inline-flex align-items-center gap-2" onClick={() => setActiveTab("post")} type="button">
                  <Plus size={16} />
                  Post Your First Job
                </button>
              </div>
            ) : (
              <div className="row g-4">
                {jobs.map((job) => {
                  const expiryLabel = job.expiryDate ? new Date(job.expiryDate).toLocaleDateString() : null;
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
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <span className="badge rounded-pill text-bg-primary-subtle text-primary border border-primary-subtle">
                                Active post
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
                            onClick={() => navigate(`/jobs/${job._id}`)}
                            type="button"
                            aria-label="Open job details"
                          >
                            <ArrowRight size={18} />
                          </button>
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

                        <div className="d-flex gap-2 mt-auto">
                          <Link
                            to={`/jobs/${job._id}`}
                            className="btn btn-outline-primary rounded-pill flex-grow-1 d-inline-flex align-items-center justify-content-center gap-2"
                          >
                            View
                          </Link>
                          <button
                            className="btn btn-outline-danger rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: 44, height: 44 }}
                            onClick={() => handleDeleteJob(job._id)}
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
        )}

        {activeTab === "post" && (
          <div className="rounded-4 p-3 p-md-4" style={{ background: "#fff", border: "1px solid #e3e8ef" }}>
            <PostJob />
          </div>
        )}

        {activeTab === "share" && (
          <div className="rounded-4 p-3 p-md-4" style={{ background: "#fff", border: "1px solid #e3e8ef" }}>
            <ShareExperience />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJobs;
