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

  const inputStyle = {
    borderRadius: "16px",
    padding: "14px 16px",
    borderColor: "#d9e3df",
    boxShadow: "none"
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(82, 183, 136, 0.14), transparent 26%), radial-gradient(circle at top right, rgba(74, 138, 149, 0.16), transparent 24%), linear-gradient(135deg, #edf7f3 0%, #f7fbfb 44%, #edf3f6 100%)",
        padding: "24px 16px"
      }}
    >
      <div
        className="mx-auto"
        style={{
          width: "100%",
          maxWidth: "1180px",
          background: "rgba(255, 255, 255, 0.9)",
          borderRadius: "28px",
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(14, 30, 37, 0.1)",
          border: "1px solid rgba(255,255,255,0.65)",
          backdropFilter: "blur(14px)"
        }}
      >
        <div className="row g-0">
          <div
            className="col-lg-5 p-4 p-md-5 text-white"
            style={{
              background:
                "linear-gradient(160deg, #143d43 0%, #215e63 45%, #52b788 100%)",
              position: "relative"
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "-100px auto auto -90px",
                width: "220px",
                height: "220px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)"
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: "auto -80px -120px auto",
                width: "260px",
                height: "260px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)"
              }}
            />

            <div className="position-relative">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                style={{
                  width: "72px",
                  height: "72px",
                  background: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  fontSize: "2rem"
                }}
              >
                {"\uD83D\uDE80"}
              </div>

              <div
                className="badge rounded-pill mb-3 px-3 py-2"
                style={{ background: "rgba(255,255,255,0.16)", color: "#fff" }}
              >
                Profile completion
              </div>

              <h1 className="fw-bold mb-3" style={{ fontSize: "2.7rem", lineHeight: 1.05 }}>
                Finish Your Onboarding
              </h1>
              <p className="mb-4" style={{ fontSize: "1.05rem", opacity: 0.92, maxWidth: "32rem" }}>
                Add your photo, resume, skills, and interests to complete your account setup.
              </p>

              <div
                className="bg-white bg-opacity-10 rounded-4 p-3 mb-4"
                style={{ border: "1px solid rgba(255,255,255,0.16)" }}
              >
                <div className="small text-uppercase opacity-75 mb-2">Signed in as</div>
                <div className="fw-semibold">{user?.name || "User"}</div>
                <div className="small opacity-75 text-break">{user?.email || "-"}</div>
              </div>

              <div className="d-grid gap-3">
                <div className="d-flex gap-3 align-items-start">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: "40px", height: "40px", background: "rgba(255,255,255,0.14)" }}
                  >
                    1
                  </div>
                  <div>
                    <div className="fw-semibold">Upload a resume</div>
                    <div className="small opacity-75">PDF only, up to 2MB.</div>
                  </div>
                </div>
                <div className="d-flex gap-3 align-items-start">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: "40px", height: "40px", background: "rgba(255,255,255,0.14)" }}
                  >
                    2
                  </div>
                  <div>
                    <div className="fw-semibold">Share skills and interests</div>
                    <div className="small opacity-75">This helps peers and alumni discover you.</div>
                  </div>
                </div>
                <div className="d-flex gap-3 align-items-start">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: "40px", height: "40px", background: "rgba(255,255,255,0.14)" }}
                  >
                    3
                  </div>
                  <div>
                    <div className="fw-semibold">Go to dashboard</div>
                    <div className="small opacity-75">Your profile gets saved in one step.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-7 p-4 p-md-5">
            <div className="mb-4">
              <div className="badge rounded-pill px-3 py-2 text-dark mb-2" style={{ background: "#eef8f3" }}>
                Onboarding form
              </div>
              <h2 className="fw-bold mb-1" style={{ letterSpacing: "-0.02em" }}>
                Complete your profile
              </h2>
              <p className="text-muted mb-0">
                We only need a few final details before you continue.
              </p>
            </div>

            {error && (
              <div className="alert alert-danger border-0 shadow-sm rounded-4 mb-4" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold">Profile Photo Upload <span className="text-muted">(Optional)</span></label>
                  <div className="rounded-4 p-3" style={{ background: "#f8fbfa", border: "1px solid #e3eeea" }}>
                    <input
                      type="file"
                      className="form-control form-control-lg"
                      accept="image/*"
                      onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                      style={inputStyle}
                    />
                    <div className="form-text mb-0">Skip this if you want to keep the default profile avatar.</div>
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Resume Upload <span className="text-muted">(PDF, Required)</span></label>
                  <div className="rounded-4 p-3" style={{ background: "#f8fbfa", border: "1px solid #e3eeea" }}>
                    <input
                      type="file"
                      className="form-control form-control-lg"
                      accept="application/pdf"
                      onChange={(e) => setResume(e.target.files?.[0] || null)}
                      required
                      style={inputStyle}
                    />
                    <div className="form-text mb-0">Your resume will be stored with your profile.</div>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Skills</label>
                  <textarea
                    className="form-control form-control-lg"
                    rows={5}
                    placeholder="e.g., JavaScript, React, Data Structures"
                    value={skillsText}
                    onChange={(e) => setSkillsText(e.target.value)}
                    required
                    style={{
                      ...inputStyle,
                      resize: "vertical",
                      minHeight: "160px"
                    }}
                  />
                  <div className="form-text">Add skills separated by commas or new lines.</div>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Interests</label>
                  <textarea
                    className="form-control form-control-lg"
                    rows={5}
                    placeholder="e.g., AI, Web Development, Open Source"
                    value={interestsText}
                    onChange={(e) => setInterestsText(e.target.value)}
                    required
                    style={{
                      ...inputStyle,
                      resize: "vertical",
                      minHeight: "160px"
                    }}
                  />
                  <div className="form-text">Add interests separated by commas or new lines.</div>
                </div>
              </div>

              <div className="d-grid gap-3 mt-4">
                <button
                  type="submit"
                  className="btn btn-lg fw-bold text-white"
                  disabled={loading}
                  style={{
                    background: "linear-gradient(135deg, #52b788 0%, #40916c 100%)",
                    border: "none",
                    padding: "14px 18px",
                    borderRadius: "16px",
                    fontSize: "1rem",
                    boxShadow: "0 12px 28px rgba(82, 183, 136, 0.28)",
                    cursor: loading ? "not-allowed" : "pointer"
                  }}
                >
                  {loading ? "Saving..." : "Complete Setup"}
                </button>
                <p className="text-muted small text-center mb-0">
                  Once saved, you'll be redirected to your dashboard.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
