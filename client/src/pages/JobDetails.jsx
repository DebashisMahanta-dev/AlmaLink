import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Building, MapPin, Briefcase, Calendar, Users, AlertCircle, FileText } from "lucide-react";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showApplyForm, setShowApplyForm] = useState(searchParams.get("action") === "apply");
  const [applyLoading, setApplyLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [applyError, setApplyError] = useState("");

  useEffect(() => {
    loadJobDetails();
  }, [id]);

  const loadJobDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/jobs/${id}`);
      setJob(res.data.job);
    } catch (err) {
      console.error("Error loading job details:", err);
      setError(err.response?.data?.message || "Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyError("");
    setApplyLoading(true);

    if (!resumeFile) {
      setApplyError("Resume is required");
      setApplyLoading(false);
      return;
    }

    if (resumeFile.type !== "application/pdf") {
      setApplyError("Resume must be a PDF file");
      setApplyLoading(false);
      return;
    }

    if (resumeFile.size > 2 * 1024 * 1024) {
      setApplyError("Resume must be less than 2MB");
      setApplyLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("coverLetter", coverLetter);

      const res = await api.post(`/jobs/${id}/apply`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Application submitted successfully!");
      setShowApplyForm(false);
      setResumeFile(null);
      setCoverLetter("");
      navigate("/my-applications");
    } catch (err) {
      console.error("Error applying to job:", err);
      setApplyError(err.response?.data?.message || "Failed to submit application");
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <AlertCircle size={18} className="me-2" />
          {error || "Job not found"}
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/jobs")}>
          <ArrowLeft size={16} className="me-2" />
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", paddingBottom: "40px" }}>
      <div className="container py-4">
        {/* Back Button */}
        <button
          className="btn btn-outline-secondary mb-4"
          onClick={() => navigate("/jobs")}
        >
          <ArrowLeft size={16} className="me-2" />
          Back to Jobs
        </button>

        <div className="row">
          {/* Job Details */}
          <div className="col-lg-8 mb-4">
            <div className="card bg-white border-0 shadow-sm">
              <div className="card-body">
                <h1 className="fw-bold mb-2">{job.title}</h1>
                
                <div className="d-flex align-items-center mb-3">
                  <Building size={18} className="me-2 text-primary" />
                  <h5 className="mb-0">{job.company}</h5>
                </div>

                <div className="row mb-4">
                  {job.location && (
                    <div className="col-md-6">
                      <div className="d-flex align-items-center mb-2">
                        <MapPin size={16} className="me-2 text-muted" />
                        <span>{job.location}</span>
                      </div>
                    </div>
                  )}
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-2">
                      <Briefcase size={16} className="me-2 text-muted" />
                      <span>{job.type}</span>
                    </div>
                  </div>
                  {job.expiryDate && (
                    <div className="col-md-6">
                      <div className="d-flex align-items-center mb-2">
                        <Calendar size={16} className="me-2 text-muted" />
                        <span>Closes: {new Date(job.expiryDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                  {job.roles && job.roles.length > 0 && (
                    <div className="col-md-6">
                      <div className="d-flex align-items-center mb-2">
                        <Users size={16} className="me-2 text-muted" />
                        <span>
                          For: {job.roles.includes("freshers") ? "Freshers" : ""}
                          {job.roles.includes("freshers") && job.roles.includes("experienced") ? " & " : ""}
                          {job.roles.includes("experienced") ? "Experienced" : ""}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <hr />

                <h5 className="fw-bold mb-3">Job Description</h5>
                <p className="text-muted" style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                  {job.description}
                </p>

                {job.postedBy && (
                  <>
                    <hr />
                    <h6 className="fw-bold mb-3">Posted By</h6>
                    <div className="d-flex align-items-center">
                      <img
                        src={`https://i.pravatar.cc/40?u=${job.postedBy.email}`}
                        alt={job.postedBy.name}
                        className="rounded-circle me-3"
                        style={{ width: "40px", height: "40px" }}
                      />
                      <div>
                        <p className="mb-0 fw-semibold">{job.postedBy.name}</p>
                        <small className="text-muted">{job.postedBy.email}</small>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Apply Section */}
          <div className="col-lg-4 mb-4">
            {user?.role === "student" ? (
              <>
                {!showApplyForm ? (
                  <div className="card bg-white border-0 shadow-sm">
                    <div className="card-body text-center">
                      <FileText size={48} className="text-primary mb-3 d-block mx-auto" />
                      <h5 className="fw-bold mb-3">Ready to Apply?</h5>
                      <p className="text-muted small mb-3">
                        Click the button below to submit your application with your resume and cover letter.
                      </p>
                      <button
                        className="btn btn-primary w-100"
                        onClick={() => setShowApplyForm(true)}
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="card bg-white border-0 shadow-sm">
                    <div className="card-body">
                      <h5 className="fw-bold mb-3">Submit Your Application</h5>
                      {applyError && (
                        <div className="alert alert-danger small">{applyError}</div>
                      )}
                      <form onSubmit={handleApplySubmit}>
                        <div className="mb-3">
                          <label className="form-label small fw-semibold">Resume (PDF) *</label>
                          <input
                            type="file"
                            className="form-control"
                            accept=".pdf"
                            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                            required
                          />
                          <small className="text-muted d-block mt-1">
                            Max 2MB, PDF only
                          </small>
                        </div>
                        <div className="mb-3">
                          <label className="form-label small fw-semibold">Cover Letter</label>
                          <textarea
                            className="form-control"
                            rows="4"
                            placeholder="Tell the employer why you're a great fit (optional)"
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                          ></textarea>
                        </div>
                        <button
                          type="submit"
                          className="btn btn-primary w-100 mb-2"
                          disabled={applyLoading}
                        >
                          {applyLoading ? "Submitting..." : "Submit Application"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary w-100"
                          onClick={() => setShowApplyForm(false)}
                        >
                          Cancel
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </>
            ) : user?.role === "alumni" ? (
              <div className="card bg-white border-0 shadow-sm">
                <div className="card-body text-center">
                  <AlertCircle size={48} className="text-info mb-3 d-block mx-auto" />
                  <h5 className="fw-bold mb-3">Alumni Only</h5>
                  <p className="text-muted small">
                    Only students can apply for jobs. As an alumni, you can post and manage jobs from your dashboard.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
