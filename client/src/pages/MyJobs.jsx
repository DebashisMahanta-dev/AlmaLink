import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { Briefcase, Plus, Edit3, Trash2, AlertCircle } from "lucide-react";
import PostJob from "./PostJob";
import ShareExperience from "./ShareExperience";

const MyJobs = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("jobs"); // "jobs", "post", "share"
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
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      try {
        await api.delete(`/jobs/${jobId}`);
        setJobs(jobs.filter(job => job._id !== jobId));
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to delete job");
      }
    }
  };

  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", paddingBottom: "40px" }}>
      <div className="container py-4">
        <div className="row mb-4">
          <div className="col-md-8">
            <h2 className="fw-bold mb-3">Job Management</h2>
            
            {/* Tabs */}
            <div className="mt-3">
              <div className="btn-group" role="tablist">
                <button
                  className={`btn ${activeTab === "jobs" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setActiveTab("jobs")}
                  role="tab"
                >
                  <Briefcase size={16} className="me-2" />
                  My Job Posts
                </button>
                <button
                  className={`btn ${activeTab === "post" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setActiveTab("post")}
                  role="tab"
                >
                  <Plus size={16} className="me-2" />
                  Post a Job
                </button>
                <button
                  className={`btn ${activeTab === "share" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setActiveTab("share")}
                  role="tab"
                >
                  <Edit3 size={16} className="me-2" />
                  Share Experience
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
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
              <div className="card bg-white border-0 shadow-sm">
                <div className="card-body text-center py-5">
                  <Briefcase size={48} className="text-muted mb-3 d-block" />
                  <p className="text-muted mb-3">You haven't posted any jobs yet.</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setActiveTab("post")}
                  >
                    <Plus size={16} className="me-2" />
                    Post Your First Job
                  </button>
                </div>
              </div>
            ) : (
              <div className="row g-3">
                {jobs.map(job => (
                  <div key={job._id} className="col-md-6">
                    <div className="card bg-white border-0 shadow-sm h-100">
                      <div className="card-body">
                        <h5 className="card-title fw-bold mb-2">{job.title}</h5>
                        <p className="text-muted small mb-2">{job.company}</p>
                        {job.location && (
                          <p className="text-muted small mb-2">📍 {job.location}</p>
                        )}
                        {job.expiryDate && (
                          <p className="text-muted small mb-2">
                            Expires: {new Date(job.expiryDate).toLocaleDateString()}
                          </p>
                        )}
                        {job.roles && job.roles.length > 0 && (
                          <div className="mb-3">
                            <small className="badge bg-info me-1">
                              {job.roles.includes("freshers") ? "Freshers" : ""}
                              {job.roles.includes("freshers") && job.roles.includes("experienced") ? " & " : ""}
                              {job.roles.includes("experienced") ? "Experienced" : ""}
                            </small>
                          </div>
                        )}
                        <div className="d-flex gap-2">
                          <Link
                            to={`/jobs/${job._id}`}
                            className="btn btn-sm btn-outline-primary flex-grow-1"
                          >
                            View
                          </Link>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteJob(job._id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "post" && (
          <PostJob />
        )}

        {activeTab === "share" && (
          <ShareExperience />
        )}
      </div>
    </div>
  );
};

export default MyJobs;
