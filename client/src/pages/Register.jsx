import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [role, setRole] = useState("student");
  const [graduationYear, setGraduationYear] = useState("");
  const [branch, setBranch] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await register({
        name,
        email,
        password,
        photoUrl,
        role,
        graduationYear: role === "alumni" ? graduationYear : "",
        branch: role === "alumni" ? branch : "",
        company: role === "alumni" ? company : "",
        location: role === "alumni" ? location : ""
      });
      if (data?.requiresEmailVerification && data?.email) {
        window.location.href = `/verify-email?email=${encodeURIComponent(data.email)}`;
      } else {
        window.location.href = "/onboarding";
      }
    } catch (err) {
      if (err?.response?.data?.requiresEmailVerification && err?.response?.data?.email) {
        window.location.href = `/verify-email?email=${encodeURIComponent(err.response.data.email)}`;
      } else if (err?.response?.status === 409) {
        setError("User already registered");
      } else {
        setError(err?.response?.data?.message || "Registration failed");
      }
    } finally {
      setLoading(false);
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
          maxWidth: "460px",
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
          padding: "40px"
        }}
      >
        <div className="text-center mb-2">
          <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🎓</div>
          <h5 className="fw-bold mb-1" style={{ letterSpacing: "0.5px" }}>GCE Connect</h5>
        </div>

        <h2 className="text-center fw-bold mb-1" style={{ fontSize: "1.75rem" }}>Create Account</h2>
        <p className="text-center text-muted mb-4" style={{ fontSize: "0.95rem" }}>
          Quick signup with just your basic details
        </p>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError("")}></button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
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

          <div className="mb-3">
            <input
              type="password"
              className="form-control form-control-lg"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ borderRadius: "6px", padding: "12px 15px" }}
            />
          </div>

          <div className="mb-4">
            <input
              type="url"
              className="form-control form-control-lg"
              placeholder="Profile Photo URL (optional)"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              style={{ borderRadius: "6px", padding: "12px 15px" }}
            />
            <small className="text-muted">You can also upload a photo in onboarding.</small>
          </div>

          <div className="mb-3">
            <select
              className="form-control form-control-lg"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              style={{ borderRadius: "6px", padding: "12px 15px" }}
            >
              <option value="student">Student</option>
              <option value="alumni">Alumni</option>
            </select>
          </div>

          {role === "alumni" && (
            <>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Pass Out Year (e.g., 2022)"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  required
                  style={{ borderRadius: "6px", padding: "12px 15px" }}
                />
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Branch (e.g., Computer Engineering)"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  required
                  style={{ borderRadius: "6px", padding: "12px 15px" }}
                />
              </div>

              <div className="mb-3">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Current Company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                  style={{ borderRadius: "6px", padding: "12px 15px" }}
                />
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Current Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  style={{ borderRadius: "6px", padding: "12px 15px" }}
                />
              </div>
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
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center mt-4 small mb-0">
          Already have an account? <Link to="/login" className="text-decoration-none fw-bold">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
