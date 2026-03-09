import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
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
      setError("Google login failed. Please try again.");
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
      setError("GitHub login failed. Please try again.");
    }
  };

  return (
    <div 
      className="login-container" 
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
        className="login-card"
        style={{
          width: "100%",
          maxWidth: "450px",
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
          padding: "50px 40px"
        }}
      >
        {/* Logo */}
        <div className="text-center mb-2">
          <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>🎓</div>
          <h3 className="fw-bold" style={{ letterSpacing: "0.5px" }}>AlmaLink</h3>
        </div>

        {/* Welcome Text */}
        <p className="text-center text-muted mb-1">Welcome Back</p>
        <h2 className="text-center fw-bold mb-4">Log In to Your Account</h2>

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

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
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

          {/* Remember Me & Forgot Password */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="form-check">
              <input 
                className="form-check-input" 
                type="checkbox" 
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label className="form-check-label small" htmlFor="rememberMe">
                Remember Me
              </label>
            </div>
            <Link to="/forgot-password" className="small text-decoration-none" style={{ color: "#666" }}>
              Forgot Password?
            </Link>
          </div>

          {/* Or login with */}
          <p className="text-center text-muted small mb-3">Or login with</p>

          {/* Social Login Buttons */}
          <div className="d-flex gap-2 mb-4">
            <button 
              type="button" 
              className="btn btn-outline-secondary flex-grow-1"
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{ borderRadius: "6px" }}
            >
              Google
            </button>
            <button 
              type="button" 
              className="btn btn-outline-secondary flex-grow-1"
              onClick={handleGitHubLogin}
              disabled={loading}
              style={{ borderRadius: "6px" }}
            >
              GitHub
            </button>
          </div>

          {/* Log In Button */}
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
              transition: "all 0.3s ease",
              cursor: loading ? "not-allowed" : "pointer"
            }}
            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = "#40916c")}
            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = "#52b788")}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center mt-4 small">
          Don't have <a href="/register" className="text-decoration-none fw-bold">a account?</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
