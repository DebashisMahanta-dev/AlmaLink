import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialEmail = useMemo(() => searchParams.get("email") || "", [searchParams]);

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [devOtpLoading, setDevOtpLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!email || !otp) {
      setError("Email and OTP are required");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/verify-otp", {
        email: email.toLowerCase().trim(),
        otp: otp.trim()
      });
      setInfo(response?.data?.message || "Email verified successfully");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setInfo("");

    if (!email) {
      setError("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/resend-verification", {
        email: email.toLowerCase().trim()
      });
      setInfo(response?.data?.message || "Verification OTP sent");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleGetDevOtp = async () => {
    setError("");
    setInfo("");

    if (!email) {
      setError("Please enter your email");
      return;
    }

    setDevOtpLoading(true);
    try {
      const response = await api.post("/auth/test-verification-otp", {
        email: email.toLowerCase().trim()
      });
      const receivedOtp = response?.data?.verificationOTP || "";
      if (receivedOtp) {
        setOtp(receivedOtp);
        setInfo("Test OTP filled in automatically.");
      } else {
        setInfo("No active OTP found for this account.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Could not fetch test OTP");
    } finally {
      setDevOtpLoading(false);
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
          <h3 className="fw-bold mb-1">Verify Your Email</h3>
          <p className="text-muted small mb-0">Enter the 6-digit OTP sent during signup</p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {info && (
          <div className="alert alert-info" role="status">
            {info}
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email Address</label>
            <input
              type="email"
              className="form-control form-control-lg"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ borderRadius: "6px", padding: "12px 15px" }}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">6-Digit OTP</label>
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength="6"
              inputMode="numeric"
              pattern="[0-9]{6}"
              required
              style={{ borderRadius: "6px", padding: "12px 15px", letterSpacing: "8px", textAlign: "center" }}
            />
          </div>

          <button
            type="submit"
            className="btn w-100 fw-bold text-white"
            disabled={loading || otp.length !== 6}
            style={{
              backgroundColor: "#52b788",
              borderColor: "#52b788",
              padding: "12px",
              borderRadius: "6px",
              fontSize: "1rem",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>

          <button
            type="button"
            className="btn btn-outline-secondary w-100 mt-2"
            disabled={loading}
            onClick={handleResend}
            style={{ borderRadius: "6px" }}
          >
            Resend OTP
          </button>

          <button
            type="button"
            className="btn btn-light w-100 mt-2"
            disabled={devOtpLoading}
            onClick={handleGetDevOtp}
            style={{ borderRadius: "6px" }}
          >
            {devOtpLoading ? "Getting Test OTP..." : "Get Test OTP (Dev)"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;
