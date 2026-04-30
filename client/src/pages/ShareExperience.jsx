import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

const ShareExperience = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    setLoading(true);
    try {
      const payload = `${title.trim()}\n\n${content.trim()}`;
      await api.post("/posts", { content: payload, images: [] });
      toast.success("Experience shared successfully!");
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to share experience");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h1 className="mb-4">Share Your Experience</h1>
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card">
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., My Journey to Tech Leadership"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={140}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Content</label>
                  <textarea
                    className="form-control"
                    rows="7"
                    placeholder="Share your experience, insights, and advice..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-success" disabled={loading}>
                  {loading ? "Sharing..." : "Share Experience"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareExperience;
