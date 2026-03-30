import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

const CompleteGoogleProfile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [country, setCountry] = useState("");
  const [branch, setBranch] = useState("");
  const [currentYear, setCurrentYear] = useState("");
  const [college, setCollege] = useState("Government College of Engineering");
  const [photoUrl, setPhotoUrl] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [projectsText, setProjectsText] = useState("");
  const [achievementsText, setAchievementsText] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const tempToken = searchParams.get("token");
  const userName = searchParams.get("name");
  const userEmail = searchParams.get("email");

  useEffect(() => {
    if (!tempToken) {
      navigate("/login");
    }
  }, [tempToken, navigate]);

  // Auto-detect role from graduation year
  const handleGraduationYearChange = (value) => {
    setGraduationYear(value);
    if (value.length === 4) {
      const yearInt = parseInt(value);
      const suggested = yearInt >= 2026 ? "student" : "alumni";
      setRole(suggested);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const skills = skillsText
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean);

      const projects = projectsText
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean);

      const achievements = achievementsText
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean);

      if (skills.length === 0) {
        setError("Please add at least one skill you have acquired");
        setLoading(false);
        return;
      }

      if (role === "student" && projects.length === 0) {
        setError("Please add at least one project");
        setLoading(false);
        return;
      }

      if (role === "student" && achievements.length === 0) {
        setError("Please add at least one achievement");
        setLoading(false);
        return;
      }

      if (role === "student" && !currentYear) {
        setError("Please select your current study year");
        setLoading(false);
        return;
      }

      const payload = {
        tempToken,
        role,
        country,
        graduationYear,
        branch,
        currentYear,
        college,
        photoUrl,
        skills,
        projects,
        achievements
      };

      if (role === "alumni") {
        payload.employmentStatus = employmentStatus;
        if (employmentStatus === "working") {
          payload.company = company;
          payload.location = location;
        }
      }

      const response = await api.post("/auth/google/complete-profile", payload);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to complete profile");
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
          maxWidth: "500px",
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
          padding: "40px"
        }}
      >
        <div className="text-center mb-3">
          <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🎓</div>
          <h5 className="fw-bold mb-1">Complete Your Profile</h5>
          <p className="text-muted small">Welcome, {userName || "User"}!</p>
        </div>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError("")}></button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Graduation Year */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Graduation Year</label>
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="e.g., 2024"
              value={graduationYear}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                handleGraduationYearChange(value);
              }}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              required
              style={{ borderRadius: "6px", padding: "12px 15px" }}
            />
          </div>

          {/* Role */}
          <div className="mb-3">
            <label className="form-label fw-semibold">I am a</label>
            <div className="d-flex gap-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="role"
                  id="roleStudent"
                  value="student"
                  checked={role === "student"}
                  onChange={(e) => setRole(e.target.value)}
                  required
                />
                <label className="form-check-label" htmlFor="roleStudent">
                  Student
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="role"
                  id="roleAlumni"
                  value="alumni"
                  checked={role === "alumni"}
                  onChange={(e) => setRole(e.target.value)}
                  required
                />
                <label className="form-check-label" htmlFor="roleAlumni">
                  Alumni
                </label>
              </div>
            </div>
          </div>

          {/* Branch */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Branch/Department</label>
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="e.g., Computer Science"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              required
              style={{ borderRadius: "6px", padding: "12px 15px" }}
            />
          </div>

          {role === "student" && (
            <>
              <div className="mb-3">
                <label className="form-label fw-semibold">College</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  required
                  style={{ borderRadius: "6px", padding: "12px 15px" }}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Current Study Year</label>
                <select
                  className="form-select form-select-lg"
                  value={currentYear}
                  onChange={(e) => setCurrentYear(e.target.value)}
                  required
                  style={{ borderRadius: "6px", padding: "12px 15px" }}
                >
                  <option value="">Select year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
            </>
          )}

          {/* Country */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Country</label>
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="e.g., United States"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              style={{ borderRadius: "6px", padding: "12px 15px" }}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Profile Photo URL (Optional)</label>
            <input
              type="url"
              className="form-control form-control-lg"
              placeholder="https://example.com/my-photo.jpg"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              style={{ borderRadius: "6px", padding: "12px 15px" }}
            />
            <small className="text-muted">Leave blank to use the default avatar.</small>
          </div>

          {/* Skills */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Skills Acquired</label>
            <textarea
              className="form-control form-control-lg"
              placeholder="e.g., JavaScript, React, Problem Solving"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              required
              rows={3}
              style={{ borderRadius: "6px", padding: "12px 15px", resize: "vertical" }}
            />
            <small className="text-muted">Add skills separated by commas or new lines.</small>
          </div>

          {role === "student" && (
            <>
              <div className="mb-3">
                <label className="form-label fw-semibold">Projects</label>
                <textarea
                  className="form-control form-control-lg"
                  placeholder="e.g., Alumni Portal, Attendance Predictor"
                  value={projectsText}
                  onChange={(e) => setProjectsText(e.target.value)}
                  required
                  rows={3}
                  style={{ borderRadius: "6px", padding: "12px 15px", resize: "vertical" }}
                />
                <small className="text-muted">Add projects separated by commas or new lines.</small>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Achievements</label>
                <textarea
                  className="form-control form-control-lg"
                  placeholder="e.g., Hackathon finalist, Scholarship recipient"
                  value={achievementsText}
                  onChange={(e) => setAchievementsText(e.target.value)}
                  required
                  rows={3}
                  style={{ borderRadius: "6px", padding: "12px 15px", resize: "vertical" }}
                />
                <small className="text-muted">Add achievements separated by commas or new lines.</small>
              </div>
            </>
          )}

          {/* Alumni-specific fields */}
          {role === "alumni" && (
            <>
              <div className="mb-3">
                <label className="form-label fw-semibold">Employment Status</label>
                <div className="d-flex gap-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="employmentStatus"
                      id="statusWorking"
                      value="working"
                      checked={employmentStatus === "working"}
                      onChange={(e) => setEmploymentStatus(e.target.value)}
                      required
                    />
                    <label className="form-check-label" htmlFor="statusWorking">
                      Working Professional
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="employmentStatus"
                      id="statusSearching"
                      value="searching"
                      checked={employmentStatus === "searching"}
                      onChange={(e) => setEmploymentStatus(e.target.value)}
                      required
                    />
                    <label className="form-check-label" htmlFor="statusSearching">
                      Job Seeking
                    </label>
                  </div>
                </div>
              </div>

              {employmentStatus === "working" && (
                <>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Company</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="e.g., Google"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      required
                      style={{ borderRadius: "6px", padding: "12px 15px" }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Work Location</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="e.g., New York, USA"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                      style={{ borderRadius: "6px", padding: "12px 15px" }}
                    />
                  </div>
                </>
              )}
            </>
          )}

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
            {loading ? "Completing..." : "Complete Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteGoogleProfile;
