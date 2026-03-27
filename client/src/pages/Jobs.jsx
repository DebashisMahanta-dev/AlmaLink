import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Briefcase, MapPin, Building, Calendar, Users, AlertCircle, Filter } from "lucide-react";

const Jobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    title: "",
    company: "",
    roles: ""
  });
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  useEffect(() => {
    loadJobs();
    loadAppliedJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/jobs");
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error("Error loading jobs:", err);
      setError(err.response?.data?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const loadAppliedJobs = async () => {
    if (user?.role === "student") {
      try {
        const res = await api.get("/jobs/me/applications");
        const jobIds = new Set(res.data.applications?.map(app => app.job._id) || []);
        setAppliedJobs(jobIds);
      } catch (err) {
        console.error("Error loading applied jobs:", err);
      }
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredJobs = jobs.filter(job => {
    const titleMatch = job.title.toLowerCase().includes(filters.title.toLowerCase());
    const companyMatch = job.company.toLowerCase().includes(filters.company.toLowerCase());
    const rolesMatch = !filters.roles || (job.roles && job.roles.includes(filters.roles));
    return titleMatch && companyMatch && rolesMatch;
  });

  const handleApplyClick = (jobId) => {
    if (user?.role === "student") {
      navigate(`/jobs/${jobId}?action=apply`);
    } else {
      alert("Only students can apply for jobs");
    }
  };

  const handleViewJob = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", paddingBottom: "40px" }}>
      <div className="container py-4">
        <div className="row mb-4">
          <div className="col-md-8">
            <h1 className="fw-bold mb-2">Job Opportunities</h1>
            <p className="text-muted">Browse job postings shared by Government College of Engineering alumni</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card bg-white border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title fw-bold mb-3">
              <Filter size={20} className="me-2" />
              Search & Filter Jobs
            </h5>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label small fw-semibold">Job Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Software Engineer"
                  name="title"
                  value={filters.title}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold">Company</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Google"
                  name="company"
                  value={filters.company}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold">Target Role</label>
                <select
                  className="form-select"
                  name="roles"
                  value={filters.roles}
                  onChange={handleFilterChange}
                >
                  <option value="">All Roles</option>
                  <option value="freshers">Freshers</option>
                  <option value="experienced">Experienced</option>
                </select>
              </div>
              <div className="col-md-3 d-flex align-items-end">
                <button
                  className="btn btn-primary w-100"
                  onClick={loadJobs}
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
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
        ) : filteredJobs.length === 0 ? (
          <div className="card bg-white border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <Briefcase size={64} className="text-muted mb-3 d-block" />
              <h5 className="text-muted mb-2">No jobs found</h5>
              <p className="text-muted">Try adjusting your search filters or check back later</p>
            </div>
          </div>
        ) : (
          <div className="row g-3">
            {filteredJobs.map(job => (
              <div key={job._id} className="col-md-6">
                <div className="card bg-white border-0 shadow-sm h-100"
                  style={{
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "";
                  }}
                >
                  <div className="card-body">
                    <h5 className="card-title fw-bold mb-1">{job.title}</h5>
                    <div className="d-flex align-items-center mb-2">
                      <Building size={16} className="me-2 text-muted" />
                      <span className="text-muted small">{job.company}</span>
                    </div>

                    {job.location && (
                      <div className="d-flex align-items-center mb-2">
                        <MapPin size={16} className="me-2 text-muted" />
                        <span className="text-muted small">{job.location}</span>
                      </div>
                    )}

                    <div className="d-flex align-items-center mb-2">
                      <Briefcase size={16} className="me-2 text-muted" />
                      <span className="text-muted small">{job.type}</span>
                    </div>

                    {job.expiryDate && (
                      <div className="d-flex align-items-center mb-3">
                        <Calendar size={16} className="me-2 text-muted" />
                        <span className="text-muted small">
                          Expires: {new Date(job.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {job.roles && job.roles.length > 0 && (
                      <div className="mb-3">
                        <span className="badge bg-info me-1">
                          {job.roles.includes("freshers") ? "Freshers" : ""}
                          {job.roles.includes("freshers") && job.roles.includes("experienced") ? " & " : ""}
                          {job.roles.includes("experienced") ? "Experienced" : ""}
                        </span>
                      </div>
                    )}

                    {job.description && (
                      <p className="text-muted small mb-3" style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical"
                      }}>
                        {job.description}
                      </p>
                    )}

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary flex-grow-1"
                        onClick={() => handleViewJob(job._id)}
                      >
                        View Details
                      </button>
                      {user?.role === "student" && (
                        <button
                          className={`btn btn-sm flex-grow-1 ${
                            appliedJobs.has(job._id)
                              ? "btn-success"
                              : "btn-primary"
                          }`}
                          onClick={() => handleApplyClick(job._id)}
                          disabled={appliedJobs.has(job._id)}
                        >
                          {appliedJobs.has(job._id) ? "Applied ✓" : "Apply Now"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredJobs.length > 0 && (
          <div className="text-center mt-4 text-muted">
            <small>Showing {filteredJobs.length} of {jobs.length} jobs</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
