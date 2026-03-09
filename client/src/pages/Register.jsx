import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { register } = useAuth();
  const [role, setRole] = useState("");
  const [suggestedRole, setSuggestedRole] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alumniProfile, setAlumniProfile] = useState({ graduationYear: "", branch: "", company: "", location: "", contact: "" });
  const [studentProfile, setStudentProfile] = useState({ graduationYear: "", branch: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Helper function to determine role based on graduation year
  const determineRoleFromYear = (year) => {
    if (!year) return "";
    const yearInt = parseInt(year);

    // 2026 and later = student
    // Before 2026 = alumni
    return yearInt >= 2026 ? "student" : "alumni";
  };

  // Handle graduation year change and auto-detect role
  const handleGraduationYearChange = (value) => {
    setGraduationYear(value);
    setAlumniProfile({ ...alumniProfile, graduationYear: value });
    setStudentProfile({ ...studentProfile, graduationYear: value });
    const suggested = determineRoleFromYear(value);
    if (suggested) {
      setSuggestedRole(suggested);
      setRole(suggested);
    }
  };

  // Handle manual role selection
  const handleRoleChange = (value) => {
    setRole(value);
    // Clear suggested role if user manually changes
    setSuggestedRole("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setRegistrationSuccess(false);
    if (!role) {
      setError("Please select a role");
      return;
    }
    setLoading(true);
    try {
      await register({
        name,
        email,
        password,
        role,
        alumniProfile: role === "alumni" ? alumniProfile : undefined,
        studentProfile: role === "student" ? studentProfile : undefined
      });
      setRegistrationSuccess(true);
      setTimeout(() => window.location.href = "/verify-email", 2000);
    } catch (err) {
      if (err?.response?.status === 409) {
        setError("User already registered");
        return;
      }
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError("");
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const scope = "openid email profile";
      
      // Redirect to Google OAuth authorization
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${Math.random().toString(36).substring(7)}`;
    } catch (err) {
      setError("Google registration failed. Please try again.");
    }
  };

  const handleGitHubLogin = () => {
    setError("");
    try {
      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
      const redirectUri = `${window.location.origin}/auth/github/callback`;
      const scope = "read:user user:email";
      
      // Redirect to GitHub OAuth authorization
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${Math.random().toString(36).substring(7)}`;
    } catch (err) {
      setError("GitHub registration failed. Please try again.");
    }
  };

  return (
    <div 
      className="register-container" 
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #b8d4d7 0%, #a8c9cc 50%, #8ab5b8 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}
    >
      <div 
        className="register-card"
        style={{
          width: "100%",
          maxWidth: "500px",
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
          padding: "40px 40px 30px 40px"
        }}
      >
        {/* Logo */}
        <div className="text-center mb-1">
          <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🎓</div>
          <h5 className="fw-bold mb-1" style={{ letterSpacing: "0.5px" }}>AlmaLink</h5>
        </div>

        {/* Title */}
        <h2 className="text-center fw-bold mb-1" style={{ fontSize: "1.75rem" }}>Join Our Network</h2>
        <p className="text-center text-muted mb-4" style={{ fontSize: "0.95rem" }}>Create Your Account</p>

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setError("")}
            ></button>
          </div>
        )}

        {/* Success Message */}
        {registrationSuccess && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            ✓ Registration successful! A verification email has been sent to <strong>{email}</strong>.
            <br />
            <small>Please check your inbox and verify your email to login.</small>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setRegistrationSuccess(false)}
            ></button>
          </div>
        )}

        {/* Registration Form */}
    <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="mb-3">
            <input 
              type="text" 
              className="form-control form-control-lg" 
              placeholder="Full Name"
              value={name} 
              onChange={(e) => setName(e.target.value)}
              required
              style={{ borderRadius: "6px", padding: "12px 15px" }}
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <input 
              type="email" 
              className="form-control form-control-lg" 
              placeholder="Email Address"
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ borderRadius: "6px", padding: "12px 15px" }}
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <input 
              type="password" 
              className="form-control form-control-lg" 
              placeholder="Set Password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ borderRadius: "6px", padding: "12px 15px" }}
            />
          </div>

          {/* Affiliated Institution Section */}
          <div className="mb-3">
            <label className="form-label fw-semibold" style={{ fontSize: "0.95rem" }}>Affiliated Institution</label>
            <input 
              type="text" 
              className="form-control form-control-lg" 
              placeholder="Graduation Year"
              value={graduationYear}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                handleGraduationYearChange(value);
              }}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              style={{ borderRadius: "6px", padding: "12px 15px" }}
            />
          </div>

          {/* Role Selection */}
          <div className="mb-3">
            <label className="form-label fw-semibold" style={{ fontSize: "0.95rem" }}>Role</label>
            <div className="d-flex gap-3">
              <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="radio" 
                  name="role" 
                  id="roleAlumni"
                  value="alumni"
                  checked={role === "alumni"}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  required
                />
                <label className="form-check-label" htmlFor="roleAlumni">
                  Alumni
                </label>
              </div>
              <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="radio" 
                  name="role" 
                  id="roleStudent"
                  value="student"
                  checked={role === "student"}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  required
                />
                <label className="form-check-label" htmlFor="roleStudent">
                  Student
                </label>
              </div>
            </div>
          </div>

          {/* Terms & Privacy Checkbox */}
          <div className="form-check mb-4">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="agreeTerms"
              required
            />
            <label className="form-check-label small" htmlFor="agreeTerms">
              I agree to the <a href="/terms" className="text-decoration-none">Terms</a> & <a href="/privacy" className="text-decoration-none">Privacy Policy</a>
            </label>
          </div>

          {/* Register Button */}
          <button 
            type="submit" 
            className="btn w-100 fw-bold text-white mb-3"
            disabled={!role || loading}
            style={{
              backgroundColor: "#52b788",
              borderColor: "#52b788",
              padding: "12px",
              borderRadius: "6px",
              fontSize: "1rem",
              transition: "all 0.3s ease",
              cursor: !role || loading ? "not-allowed" : "pointer"
            }}
            onMouseOver={(e) => !role && !loading && (e.target.style.backgroundColor = "#40916c")}
            onMouseOut={(e) => !role && !loading && (e.target.style.backgroundColor = "#52b788")}
          >
            {loading ? "Registering..." : "Register Account"}
          </button>

          {/* Or register with */}
          <p className="text-center text-muted small mb-3">Or register with</p>

          {/* Social Registration Buttons */}
          <div className="d-flex gap-2">
            <button 
              type="button" 
              className="btn btn-outline-secondary flex-grow-1"
              onClick={handleGoogleLogin}
              style={{ borderRadius: "6px", padding: "10px" }}
            >
              Google
            </button>
            <button 
              type="button" 
              className="btn btn-outline-secondary flex-grow-1"
              onClick={handleGitHubLogin}
              style={{ borderRadius: "6px", padding: "10px" }}
            >
              GitHub
            </button>
          </div>
        </form>

        {/* Sign In Link */}
        <p className="text-center mt-4 small">
          Already have <a href="/login" className="text-decoration-none fw-bold">a account? Log In</a>
        </p>
      </div>
    </div>
  );
};

export default Register;

