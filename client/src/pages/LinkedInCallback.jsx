import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

const LinkedInCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const handleLinkedInCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (error) {
        setError(`LinkedIn error: ${errorDescription || error}`);
        setTimeout(() => navigate("/login"), 3000);
        return;
      }

      if (!code) {
        setError("No authorization code received from LinkedIn");
        setTimeout(() => navigate("/login"), 3000);
        return;
      }

      try {
        // Exchange authorization code for access token
        // Note: This should be done on backend in production
        const response = await api.post("/auth/linkedin/callback", {
          code,
          state
        });

        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          // Force full page reload to update AuthContext
          window.location.href = "/dashboard";
        } else {
          setError("Failed to obtain access token");
        }
      } catch (err) {
        console.error("LinkedIn callback error:", err);
        setError(err?.response?.data?.message || "LinkedIn authentication failed");
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    handleLinkedInCallback();
  }, [navigate, searchParams]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #94c2c7 0%, #7fa9b0 50%, #4a8a95 100%)"
    }}>
      <div style={{
        background: "white",
        padding: "40px",
        borderRadius: "12px",
        textAlign: "center",
        boxShadow: "0 10px 40px rgba(0,0,0,0.1)"
      }}>
        {error ? (
          <>
            <h3 className="text-danger mb-3">Authentication Error</h3>
            <p>{error}</p>
            <p className="text-muted small">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h3>Completing LinkedIn Sign In...</h3>
            <p className="text-muted">Please wait while we finish your login.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default LinkedInCallback;
