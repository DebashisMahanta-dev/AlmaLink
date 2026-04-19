import React, { useEffect, useMemo, useState } from "react";
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

  const roleHint = useMemo(() => {
    if (!graduationYear || graduationYear.length !== 4) return "";
    const yearInt = Number.parseInt(graduationYear, 10);
    if (Number.isNaN(yearInt)) return "";
    return yearInt >= 2026 ? "student" : "alumni";
  }, [graduationYear]);

  const handleGraduationYearChange = (value) => {
    setGraduationYear(value);
    if (value.length === 4) {
      const yearInt = Number.parseInt(value, 10);
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

      if (!graduationYear || graduationYear.length !== 4) {
        setError("Please enter a valid 4-digit graduation year");
        setLoading(false);
        return;
      }

      if (!role) {
        setError("Please select whether you are a student or alumni");
        setLoading(false);
        return;
      }

      if (!branch.trim()) {
        setError("Please enter your branch or department");
        setLoading(false);
        return;
      }

      if (!country.trim()) {
        setError("Please enter your country");
        setLoading(false);
        return;
      }

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
        country: country.trim(),
        graduationYear,
        branch: branch.trim(),
        currentYear,
        college: college.trim(),
        photoUrl: photoUrl.trim(),
        skills,
        projects,
        achievements
      };

      if (role === "alumni") {
        payload.employmentStatus = employmentStatus;
        if (employmentStatus === "working") {
          payload.company = company.trim();
          payload.location = location.trim();
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

  const roleCardBase =
    "d-flex align-items-center justify-content-between w-100 p-3 rounded-4 border position-relative";

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(82, 183, 136, 0.12), transparent 30%), radial-gradient(circle at top right, rgba(74, 138, 149, 0.16), transparent 28%), linear-gradient(135deg, #edf7f3 0%, #f6fafb 45%, #edf3f6 100%)",
        padding: "28px 16px"
      }}
    >
      <div
        className="mx-auto"
        style={{
          width: "100%",
          maxWidth: "1180px",
          background: "rgba(255, 255, 255, 0.88)",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(255, 255, 255, 0.6)",
          borderRadius: "28px",
          boxShadow: "0 24px 80px rgba(14, 30, 37, 0.10)",
          overflow: "hidden"
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
                inset: "auto -80px -120px auto",
                width: "260px",
                height: "260px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.08)",
                filter: "blur(2px)"
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: "-80px auto auto -90px",
                width: "220px",
                height: "220px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.08)"
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
                {"\uD83C\uDF93"}
              </div>

              <div className="badge rounded-pill mb-3 px-3 py-2" style={{ background: "rgba(255,255,255,0.16)", color: "#fff" }}>
                Google profile setup
              </div>

              <h1 className="fw-bold mb-3" style={{ fontSize: "2.7rem", lineHeight: 1.04 }}>
                Complete Your Profile
              </h1>
              <p className="mb-4" style={{ fontSize: "1.05rem", opacity: 0.92, maxWidth: "32rem" }}>
                Tell us a little more about yourself so we can finish setting up your GCE Connect account.
              </p>

              <div className="bg-white bg-opacity-10 rounded-4 p-3 mb-4" style={{ border: "1px solid rgba(255,255,255,0.16)" }}>
                <div className="small text-uppercase opacity-75 mb-2">Signed in as</div>
                <div className="fw-semibold">{userName || "User"}</div>
                <div className="small opacity-75 text-break">{userEmail || "No email found"}</div>
              </div>

              <div className="d-grid gap-3">
                <div className="d-flex gap-3 align-items-start">
                  <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: "40px", height: "40px", background: "rgba(255,255,255,0.14)" }}>
                    1
                  </div>
                  <div>
                    <div className="fw-semibold">Choose your role</div>
                    <div className="small opacity-75">Student or alumni based on your graduation year and profile.</div>
                  </div>
                </div>
                <div className="d-flex gap-3 align-items-start">
                  <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: "40px", height: "40px", background: "rgba(255,255,255,0.14)" }}>
                    2
                  </div>
                  <div>
                    <div className="fw-semibold">Add skills and details</div>
                    <div className="small opacity-75">Your profile helps others discover and connect with you.</div>
                  </div>
                </div>
                <div className="d-flex gap-3 align-items-start">
                  <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: "40px", height: "40px", background: "rgba(255,255,255,0.14)" }}>
                    3
                  </div>
                  <div>
                    <div className="fw-semibold">Finish onboarding</div>
                    <div className="small opacity-75">Student profiles go live immediately; alumni may need approval first.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-7 p-4 p-md-5">
            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                <div className="badge rounded-pill px-3 py-2 text-dark" style={{ background: "#eef8f3" }}>
                  Profile details
                </div>
                {roleHint && (
                  <div className="small text-muted">
                    Based on graduation year, this looks like: <span className="fw-semibold text-dark">{roleHint}</span>
                  </div>
                )}
              </div>
              <h2 className="fw-bold mb-1" style={{ letterSpacing: "-0.02em" }}>
                Fill the remaining details
              </h2>
              <p className="text-muted mb-0">
                Keep it short, clear, and professional.
              </p>
            </div>

            {error && (
              <div className="alert alert-danger border-0 shadow-sm rounded-4 mb-4" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
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
                    style={{
                      borderRadius: "16px",
                      padding: "14px 16px",
                      borderColor: "#dbe5e1",
                      boxShadow: "none"
                    }}
                  />
                  <div className="form-text">Enter only the year you graduated or expect to graduate.</div>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Country</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="e.g., India"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                    style={{
                      borderRadius: "16px",
                      padding: "14px 16px",
                      borderColor: "#dbe5e1",
                      boxShadow: "none"
                    }}
                  />
                  <div className="form-text">Where are you currently based?</div>
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">I am a</label>
                  <div className="d-grid d-md-flex gap-3">
                    <label
                      className={`${roleCardBase} ${role === "student" ? "border-success bg-success-subtle" : "bg-white"}`}
                      style={{ cursor: "pointer", transition: "all 0.2s ease", borderWidth: "1.5px" }}
                    >
                      <div>
                        <div className="fw-semibold">Student</div>
                        <div className="small text-muted">Current learner / future graduate</div>
                      </div>
                      <input
                        className="form-check-input m-0"
                        type="radio"
                        name="role"
                        id="roleStudent"
                        value="student"
                        checked={role === "student"}
                        onChange={(e) => setRole(e.target.value)}
                        required
                      />
                    </label>

                    <label
                      className={`${roleCardBase} ${role === "alumni" ? "border-success bg-success-subtle" : "bg-white"}`}
                      style={{ cursor: "pointer", transition: "all 0.2s ease", borderWidth: "1.5px" }}
                    >
                      <div>
                        <div className="fw-semibold">Alumni</div>
                        <div className="small text-muted">Graduated and ready to connect</div>
                      </div>
                      <input
                        className="form-check-input m-0"
                        type="radio"
                        name="role"
                        id="roleAlumni"
                        value="alumni"
                        checked={role === "alumni"}
                        onChange={(e) => setRole(e.target.value)}
                        required
                      />
                    </label>
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Branch / Department</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="e.g., Computer Science"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    required
                    style={{
                      borderRadius: "16px",
                      padding: "14px 16px",
                      borderColor: "#dbe5e1",
                      boxShadow: "none"
                    }}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Profile Photo URL <span className="text-muted">(Optional)</span></label>
                  <input
                    type="url"
                    className="form-control form-control-lg"
                    placeholder="https://example.com/my-photo.jpg"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    style={{
                      borderRadius: "16px",
                      padding: "14px 16px",
                      borderColor: "#dbe5e1",
                      boxShadow: "none"
                    }}
                  />
                  <div className="form-text">Leave blank to use the default avatar.</div>
                </div>

                <div className="col-12">
                  <div className="rounded-4 p-4" style={{ background: "#f8fbfa", border: "1px solid #e3eeea" }}>
                    <h5 className="fw-bold mb-3">Skills Acquired</h5>
                    <textarea
                      className="form-control form-control-lg"
                      placeholder="e.g., JavaScript, React, Problem Solving"
                      value={skillsText}
                      onChange={(e) => setSkillsText(e.target.value)}
                      required
                      rows={3}
                      style={{
                        borderRadius: "16px",
                        padding: "14px 16px",
                        borderColor: "#dbe5e1",
                        boxShadow: "none",
                        resize: "vertical"
                      }}
                    />
                    <div className="form-text">Add skills separated by commas or new lines.</div>
                  </div>
                </div>

                {role === "student" && (
                  <>
                    <div className="col-12">
                      <div className="rounded-4 p-4" style={{ background: "#eef7ff", border: "1px solid #dbeafe" }}>
                        <h5 className="fw-bold mb-3">Student-only details</h5>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">College</label>
                            <input
                              type="text"
                              className="form-control form-control-lg"
                              value={college}
                              onChange={(e) => setCollege(e.target.value)}
                              required
                              style={{
                                borderRadius: "16px",
                                padding: "14px 16px",
                                borderColor: "#dbe5e1",
                                boxShadow: "none"
                              }}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">Current Study Year</label>
                            <select
                              className="form-select form-select-lg"
                              value={currentYear}
                              onChange={(e) => setCurrentYear(e.target.value)}
                              required
                              style={{
                                borderRadius: "16px",
                                padding: "14px 16px",
                                borderColor: "#dbe5e1",
                                boxShadow: "none"
                              }}
                            >
                              <option value="">Select year</option>
                              <option value="1st Year">1st Year</option>
                              <option value="2nd Year">2nd Year</option>
                              <option value="3rd Year">3rd Year</option>
                              <option value="4th Year">4th Year</option>
                            </select>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">Projects</label>
                            <textarea
                              className="form-control form-control-lg"
                              placeholder="e.g., Alumni Portal, Attendance Predictor"
                              value={projectsText}
                              onChange={(e) => setProjectsText(e.target.value)}
                              required
                              rows={3}
                              style={{
                                borderRadius: "16px",
                                padding: "14px 16px",
                                borderColor: "#dbe5e1",
                                boxShadow: "none",
                                resize: "vertical"
                              }}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">Achievements</label>
                            <textarea
                              className="form-control form-control-lg"
                              placeholder="e.g., Hackathon finalist, Scholarship recipient"
                              value={achievementsText}
                              onChange={(e) => setAchievementsText(e.target.value)}
                              required
                              rows={3}
                              style={{
                                borderRadius: "16px",
                                padding: "14px 16px",
                                borderColor: "#dbe5e1",
                                boxShadow: "none",
                                resize: "vertical"
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {role === "alumni" && (
                  <div className="col-12">
                    <div className="rounded-4 p-4" style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}>
                      <h5 className="fw-bold mb-3">Alumni-only details</h5>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Employment Status</label>
                        <div className="d-grid d-md-flex gap-3">
                          <label
                            className={`${roleCardBase} ${employmentStatus === "working" ? "border-warning bg-warning-subtle" : "bg-white"}`}
                            style={{ cursor: "pointer", transition: "all 0.2s ease", borderWidth: "1.5px" }}
                          >
                            <div>
                              <div className="fw-semibold">Working Professional</div>
                              <div className="small text-muted">Currently employed in industry</div>
                            </div>
                            <input
                              className="form-check-input m-0"
                              type="radio"
                              name="employmentStatus"
                              id="statusWorking"
                              value="working"
                              checked={employmentStatus === "working"}
                              onChange={(e) => setEmploymentStatus(e.target.value)}
                              required
                            />
                          </label>
                          <label
                            className={`${roleCardBase} ${employmentStatus === "searching" ? "border-warning bg-warning-subtle" : "bg-white"}`}
                            style={{ cursor: "pointer", transition: "all 0.2s ease", borderWidth: "1.5px" }}
                          >
                            <div>
                              <div className="fw-semibold">Job Seeking</div>
                              <div className="small text-muted">Open to opportunities</div>
                            </div>
                            <input
                              className="form-check-input m-0"
                              type="radio"
                              name="employmentStatus"
                              id="statusSearching"
                              value="searching"
                              checked={employmentStatus === "searching"}
                              onChange={(e) => setEmploymentStatus(e.target.value)}
                              required
                            />
                          </label>
                        </div>
                      </div>

                      {employmentStatus === "working" && (
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">Company</label>
                            <input
                              type="text"
                              className="form-control form-control-lg"
                              placeholder="e.g., Google"
                              value={company}
                              onChange={(e) => setCompany(e.target.value)}
                              required
                              style={{
                                borderRadius: "16px",
                                padding: "14px 16px",
                                borderColor: "#dbe5e1",
                                boxShadow: "none"
                              }}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">Work Location</label>
                            <input
                              type="text"
                              className="form-control form-control-lg"
                              placeholder="e.g., New York, USA"
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                              required
                              style={{
                                borderRadius: "16px",
                                padding: "14px 16px",
                                borderColor: "#dbe5e1",
                                boxShadow: "none"
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
                  {loading ? "Completing..." : "Complete Profile"}
                </button>

                <p className="text-muted small mb-0 text-center">
                  Student profiles are activated immediately. Alumni profiles may require admin approval before posting jobs.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteGoogleProfile;
