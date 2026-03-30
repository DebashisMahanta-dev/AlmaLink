import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { FileText, AlertCircle, Briefcase, MapPin, Calendar } from "lucide-react";

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/jobs/me/applications");
      setApplications(res.data.applications || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load your applications");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h1 className="mb-4">My Applications</h1>

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
      ) : applications.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <FileText size={48} className="text-muted mb-3 d-block" />
            <p className="text-muted">You haven't applied to any jobs yet.</p>
            <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {applications.map((application) => (
            <div key={application._id} className="col-md-6">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body">
                  <h5 className="card-title fw-bold mb-2">{application.job?.title || "Job"}</h5>
                  <div className="text-muted small mb-2 d-flex align-items-center">
                    <Briefcase size={14} className="me-2" />
                    {application.job?.company || "Unknown company"}
                  </div>
                  {application.job?.location && (
                    <div className="text-muted small mb-2 d-flex align-items-center">
                      <MapPin size={14} className="me-2" />
                      {application.job.location}
                    </div>
                  )}
                  <div className="text-muted small mb-3 d-flex align-items-center">
                    <Calendar size={14} className="me-2" />
                    Applied on {new Date(application.createdAt).toLocaleDateString()}
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <span className={`badge ${
                      application.status === "accepted"
                        ? "bg-success"
                        : application.status === "rejected"
                          ? "bg-danger"
                          : "bg-warning text-dark"
                    }`}>
                      {(application.status || "pending").toUpperCase()}
                    </span>
                    <Link to={`/jobs/${application.job?._id}`} className="btn btn-sm btn-outline-primary">
                      View Job
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
