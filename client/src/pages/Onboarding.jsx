import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Onboarding = () => {
  const { user } = useAuth();
  const [skillsText, setSkillsText] = useState("");
  const [interestsText, setInterestsText] = useState("");
  const [photo, setPhoto] = useState(null);
  const [resume, setResume] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.onboardingCompleted !== false) {
    return <Navigate to="/dashboard" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const skills = skillsText
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean);

      const interests = interestsText
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean);

      if (skills.length === 0) {
        setError("Please add at least one skill");
        setLoading(false);
        return;
      }

      if (interests.length === 0) {
        setError("Please add at least one interest");
        setLoading(false);
        return;
      }

      if (!resume) {
        setError("Please upload your resume to complete setup");
        setLoading(false);
        return;
      }

      if (resume.type !== "application/pdf") {
        setError("Resume must be a PDF file");
        setLoading(false);
        return;
      }

      if (resume.size > 2 * 1024 * 1024) {
        setError("Resume must be less than 2MB");
        setLoading(false);
        return;
      }

      if (photo) {
        const formData = new FormData();
        formData.append("photo", photo);
        await api.post("/profile/me/photo", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      const resumeData = new FormData();
      resumeData.append("resume", resume);
      await api.post("/profile/me/resume", resumeData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      await api.patch("/profile/me", {
        skills,
        interests,
        onboardingCompleted: true
      });

      window.location.href = "/dashboard";
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #94c2c7 0%, #7fa9b0 50%, #4a8a95 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
          padding: "40px"
        }}
      >
        <div className="text-center mb-4">
          <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🚀</div>
          <h4 className="fw-bold mb-1">Finish Your Onboarding</h4>
          <p className="text-muted small mb-0">Add your profile photo, skills, and interests.</p>
        </div>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError("")}></button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Profile Photo Upload (Optional)</label>
            <input
              type="file"
              className="form-control form-control-lg"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              style={{ borderRadius: "6px", padding: "12px 15px" }}
            />
            <small className="text-muted">Skip this if you want to keep the default profile avatar.</small>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Resume Upload (PDF, Required)</label>
            <input
              type="file"
              className="form-control form-control-lg"
              accept="application/pdf"
              onChange={(e) => setResume(e.target.files?.[0] || null)}
              required
              style={{ borderRadius: "6px", padding: "12px 15px" }}
            />
            <small className="text-muted">Your resume will be stored with your profile.</small>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Skills</label>
            <textarea
              className="form-control form-control-lg"
              rows={3}
              placeholder="e.g., JavaScript, React, Data Structures"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              required
              style={{ borderRadius: "6px", padding: "12px 15px", resize: "vertical" }}
            />
            <small className="text-muted">Add skills separated by commas or new lines.</small>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Interests</label>
            <textarea
              className="form-control form-control-lg"
              rows={3}
              placeholder="e.g., AI, Web Development, Open Source"
              value={interestsText}
              onChange={(e) => setInterestsText(e.target.value)}
              required
              style={{ borderRadius: "6px", padding: "12px 15px", resize: "vertical" }}
            />
            <small className="text-muted">Add interests separated by commas or new lines.</small>
          </div>

          <button
            type="submit"
            className="btn w-100 fw-bold text-white"
            disabled={loading}
            style={{
              backgroundColor: "#52b788",
              borderColor: "#52b788",
              padding: "12px",
              borderRadius: "6px",
              fontSize: "1rem",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Saving..." : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
