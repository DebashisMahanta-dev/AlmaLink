import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState("");
  const [manualToken, setManualToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [showResend, setShowResend] = useState(false);
  const [showDevInfo, setShowDevInfo] = useState(false);
  const [devToken, setDevToken] = useState("");
  const [devTokenLoading, setDevTokenLoading] = useState(false);

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
      verifyToken(urlToken);
    }
  }, [searchParams]);

  const verifyToken = async (verificationToken) => {
    setLoading(true);
    setError("");
    try {
      // Try OTP verification first (new method)
      const response = await api.post("/auth/verify-otp", {
        email: email || "", // Use email from state if available
        otp: verificationToken
      }).catch(async (err) => {
        // Fall back to token verification for backward compatibility
        if (err?.response?.status === 400) {
          return api.post("/auth/verify-email", {
            token: verificationToken
          });
        }
        throw err;
      });
      
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Verification failed");
      setShowResend(true);
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerify = async (e) => {
    e.preventDefault();
    if (!manualToken) {
      setError("Please enter the OTP");
      return;
    }
    if (!email && !searchParams.get("token")) {
      // If no email in state and no token in URL, we need email for OTP verification
      setError("Email is required for OTP verification");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      // Try OTP verification
      const response = await api.post("/auth/verify-otp", {
        email: email.toLowerCase(),
        otp: manualToken
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid OTP");
      setShowResend(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/auth/resend-verification", { email });
      setSuccess(true);
      setError("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to resend email");
    } finally {
      setLoading(false);
    }
  };

  const handleGetDevToken = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    setDevTokenLoading(true);
    setError("");
    try {
      const response = await api.post("/auth/test-verification-otp", { email });
      setDevToken(response.data.verificationOTP);
      setManualToken(response.data.verificationOTP);
      setError("");
      // Auto-fill the OTP but don't auto-verify - let user submit
      setShowDevInfo(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to get OTP. Email verification may be unavailable on this server.");
    } finally {
      setDevTokenLoading(false);
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
        <div className="text-center mb-4">
          <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>✉️</div>
          <h3 className="fw-bold mb-1">Verify Your Email</h3>
          <p className="text-muted small">We've sent a 6-digit OTP to your email address</p>
          <div className="alert alert-info mt-3" style={{ fontSize: "0.9rem" }}>
            <strong>📧 Check Your Email:</strong> Look for the OTP code and enter it below, or click the verification link
          </div>
        </div>

        {success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            ✓ Email verified successfully! Redirecting to login...
            <button type="button" className="btn-close" onClick={() => setSuccess(false)}></button>
          </div>
        )}

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError("")}></button>
          </div>
        )}

        {loading && !success && (
          <div className="alert alert-info" role="alert">
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            Verifying your email...
          </div>
        )}

        {!success && (
          <>
            <form onSubmit={handleManualVerify} className="mb-4">
              <div className="mb-3">
                <label className="form-label fw-semibold">6-Digit OTP</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="000000"
                  value={manualToken}
                  onChange={(e) => {
                    // Only allow digits and limit to 6
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setManualToken(value);
                  }}
                  maxLength="6"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  style={{ 
                    borderRadius: "6px", 
                    padding: "12px 15px",
                    fontSize: "24px",
                    letterSpacing: "10px",
                    textAlign: "center",
                    fontWeight: "bold"
                  }}
                />
                <small className="text-muted d-block mt-2">
                  Enter the 6-digit code sent to your email
                </small>
              </div>

              <button
                type="submit"
                className="btn w-100 fw-bold text-white"
                disabled={loading || manualToken.length !== 6}
                style={{
                  backgroundColor: "#52b788",
                  borderColor: "#52b788",
                  padding: "12px",
                  borderRadius: "6px",
                  fontSize: "1rem",
                  cursor: loading || manualToken.length !== 6 ? "not-allowed" : "pointer"
                }}
              >
                {loading ? "Verifying OTP..." : "Verify OTP"}
              </button>

              <button
                type="button"
                className="btn w-100 fw-bold mt-2"
                onClick={() => setShowDevInfo(!showDevInfo)}
                style={{
                  backgroundColor: "#f8f9fa",
                  color: "#666",
                  borderColor: "#ddd",
                  padding: "12px",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  cursor: "pointer"
                }}
              >
                {showDevInfo ? "▼ Hide" : "▶ Get Test OTP"} - Testing Only
              </button>

              {showDevInfo && (
                <form onSubmit={handleGetDevToken} className="mt-3 p-3 bg-light rounded">
                  <p className="small text-muted mb-2">
                    💡 <strong>Development Mode:</strong> Enter your email to get a test OTP
                  </p>
                  <label className="form-label small fw-semibold">Your Email Address</label>
                  <input
                    type="email"
                    className="form-control mb-2"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ borderRadius: "6px", padding: "10px 12px" }}
                  />
                  <button
                    type="submit"
                    className="btn btn-sm w-100"
                    disabled={devTokenLoading}
                    style={{
                      backgroundColor: "#6c757d",
                      color: "white",
                      borderColor: "#6c757d",
                      padding: "8px",
                      borderRadius: "4px",
                      fontSize: "0.9rem",
                      cursor: devTokenLoading ? "not-allowed" : "pointer"
                    }}
                  >
                    {devTokenLoading ? "Getting OTP..." : "Get Test OTP"}
                  </button>
                </form>
              )}
            </form>

            {showResend && (
              <>
                <form onSubmit={handleResendEmail}>
                  <p className="text-center text-muted small mb-3">Didn't receive the email?</p>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email Address</label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ borderRadius: "6px", padding: "12px 15px" }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn w-100 fw-bold"
                    disabled={loading}
                    style={{
                      backgroundColor: "#f5f5f5",
                      color: "#52b788",
                      borderColor: "#52b788",
                      padding: "12px",
                      borderRadius: "6px",
                      fontSize: "1rem",
                      cursor: loading ? "not-allowed" : "pointer"
                    }}
                  >
                    {loading ? "Sending..." : "Resend Verification Email"}
                  </button>
                </form>
              </>
            )}
          </>
        )}

        <div className="text-center mt-4">
          <p className="text-muted small">
            Already verified? <a href="/login" className="text-decoration-none fw-bold">Log in here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
