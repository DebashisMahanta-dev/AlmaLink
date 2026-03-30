import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

const PostJob = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time",
    description: "",
    expiryDate: "",
    roles: ["freshers", "experienced"]
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (role) => {
    setFormData(prev => {
      const roles = prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role];
      return { ...prev, roles };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.title || !formData.company || !formData.description) {
      setError("Title, company, and description are required");
      setLoading(false);
      return;
    }

    if (formData.roles.length === 0) {
      setError("Select at least one role (Freshers or Experienced)");
      setLoading(false);
      return;
    }

    try {
      await api.post("/jobs", formData);
      // Reset form
      setFormData({
        title: "",
        company: "",
        location: "",
        type: "Full-time",
        description: "",
        expiryDate: "",
        roles: ["freshers", "experienced"]
      });
      toast.success("Job posted successfully!");
      // Navigate back to jobs page after a short delay
      setTimeout(() => navigate("/my-jobs"), 1500);
    } catch (err) {
      console.error("Error posting job:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to post job";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h1 className="mb-4">Post a New Job</h1>
      
      {/* Show warning if alumni is not approved */}
      {user && !user.approved && (
        <div className="alert alert-warning mb-4">
          <h5 className="alert-heading">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Account Pending Approval
          </h5>
          <p className="mb-0">
            Your alumni account is currently pending admin approval. You will be able to post jobs once an administrator approves your account.
          </p>
        </div>
      )}
      
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card">
            <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Job Title *</label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  placeholder="e.g., Senior Software Engineer"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Company *</label>
                <input
                  type="text"
                  name="company"
                  className="form-control"
                  value={formData.company}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  name="location"
                  className="form-control"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Job Type</label>
                <select
                  name="type"
                  className="form-select"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Internship</option>
                  <option>Contract</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Description *</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="5"
                  placeholder="Job description..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              <div className="mb-3">
                <label className="form-label">Target Roles *</label>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="freshers"
                    checked={formData.roles.includes("freshers")}
                    onChange={() => handleRoleChange("freshers")}
                  />
                  <label className="form-check-label" htmlFor="freshers">
                    Freshers (0-2 years experience)
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="experienced"
                    checked={formData.roles.includes("experienced")}
                    onChange={() => handleRoleChange("experienced")}
                  />
                  <label className="form-check-label" htmlFor="experienced">
                    Experienced (2+ years experience)
                  </label>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Expiry Date (Optional)</label>
                <input
                  type="date"
                  name="expiryDate"
                  className="form-control"
                  value={formData.expiryDate}
                  onChange={handleChange}
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading || (user && !user.approved)}
              >
                {loading ? "Posting..." : (user && !user.approved) ? "Approval Required" : "Post Job"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default PostJob;
