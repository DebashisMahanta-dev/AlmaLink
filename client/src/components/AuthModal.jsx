import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { X } from "lucide-react";
import { FaGraduationCap, FaArrowRightToBracket, FaUserPlus } from "react-icons/fa6";
import "./AuthModal.css";

const AuthModal = ({ isOpen, initialMode = "login", onClose }) => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    photoUrl: "",
    role: "student",
    graduationYear: "",
    branch: "",
    company: "",
    location: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError("");
    }
  }, [initialMode, isOpen]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleGoogleLogin = () => {
    setError("");
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const scope = "openid email profile";

      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${Math.random().toString(36).substring(7)}`;
    } catch {
      setError("Google login failed. Please try again.");
    }
  };

  const handleGitHubLogin = () => {
    setError("");
    try {
      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
      const redirectUri = `${window.location.origin}/auth/github/callback`;
      const scope = "read:user user:email";

      window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${Math.random().toString(36).substring(7)}`;
    } catch {
      setError("GitHub login failed. Please try again.");
    }
  };

  const submitLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(loginForm.email, loginForm.password);
      navigate("/dashboard");
    } catch (err) {
      if (err?.response?.data?.requiresEmailVerification && err?.response?.data?.email) {
        navigate(`/verify-email?email=${encodeURIComponent(err.response.data.email)}`);
      } else {
        setError(err?.response?.data?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const submitRegister = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await register(registerForm);
      if (data?.requiresEmailVerification && data?.email) {
        navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
      } else {
        navigate("/onboarding");
      }
    } catch (err) {
      if (err?.response?.status === 409) {
        setError("User already registered");
      } else {
        setError(err?.response?.data?.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="auth-modal-backdrop" onMouseDown={handleBackdropClick}>
      <div className="auth-modal-shell" role="dialog" aria-modal="true" aria-label={mode === "login" ? "Sign in modal" : "Sign up modal"}>
        <button type="button" className="auth-modal-close" onClick={onClose} aria-label="Close auth modal">
          <X size={20} />
        </button>

        <div className="auth-modal-brand">
          <div className="auth-modal-brand__icon">
            <FaGraduationCap />
          </div>
          <div className="auth-modal-brand__text">
            <h2>GCE Connect</h2>
            <p>Government College of Engineering</p>
          </div>
        </div>

        <div className="auth-modal-switcher" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            className={`auth-modal-switcher__button ${mode === "login" ? "is-active" : ""}`}
            onClick={() => {
              setMode("login");
              setError("");
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-modal-switcher__button ${mode === "register" ? "is-active" : ""}`}
            onClick={() => {
              setMode("register");
              setError("");
            }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="auth-modal-alert" role="alert">
            {error}
          </div>
        )}

        {mode === "login" ? (
          <form className="auth-modal-form" onSubmit={submitLogin}>
            <h3>Log In to Your Account</h3>
            <input
              type="email"
              className="auth-modal-input"
              placeholder="Email Address"
              value={loginForm.email}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
            <input
              type="password"
              className="auth-modal-input"
              placeholder="Password"
              value={loginForm.password}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
              required
            />
            <div className="auth-modal-row">
              <label className="auth-modal-check">
                <input
                  type="checkbox"
                  checked={loginForm.rememberMe}
                  onChange={(event) => setLoginForm((prev) => ({ ...prev, rememberMe: event.target.checked }))}
                />
                <span>Remember Me</span>
              </label>
              <button type="button" className="auth-modal-link-button" onClick={() => navigate("/forgot-password")}>
                Forgot Password?
              </button>
            </div>

            <p className="auth-modal-divider-text">Or login with</p>

            <div className="auth-modal-social-row">
              <button type="button" className="auth-modal-social-button" onClick={handleGoogleLogin} disabled={loading}>
                Google
              </button>
              <button type="button" className="auth-modal-social-button" onClick={handleGitHubLogin} disabled={loading}>
                GitHub
              </button>
            </div>

            <button type="submit" className="auth-modal-primary-button auth-modal-primary-button--login" disabled={loading}>
              <FaArrowRightToBracket />
              {loading ? "Logging in..." : "Log In"}
            </button>

            <p className="auth-modal-footer-text">
              Don't have an account?{" "}
              <button
                type="button"
                className="auth-modal-link-button auth-modal-link-button--accent"
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
              >
                Sign up here!
              </button>
            </p>
          </form>
        ) : (
          <form className="auth-modal-form" onSubmit={submitRegister}>
            <h3>Create Account</h3>
            <p className="auth-modal-subtitle">Quick signup with just your basic details</p>
            <input
              type="text"
              className="auth-modal-input"
              placeholder="Full Name"
              value={registerForm.name}
              onChange={(event) => setRegisterForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
            <input
              type="email"
              className="auth-modal-input"
              placeholder="Email Address"
              value={registerForm.email}
              onChange={(event) => setRegisterForm((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
            <input
              type="password"
              className="auth-modal-input"
              placeholder="Password"
              value={registerForm.password}
              onChange={(event) => setRegisterForm((prev) => ({ ...prev, password: event.target.value }))}
              required
            />
            <input
              type="url"
              className="auth-modal-input"
              placeholder="Profile Photo URL (optional)"
              value={registerForm.photoUrl}
              onChange={(event) => setRegisterForm((prev) => ({ ...prev, photoUrl: event.target.value }))}
            />
            <select
              className="auth-modal-input"
              value={registerForm.role}
              onChange={(event) => setRegisterForm((prev) => ({ ...prev, role: event.target.value }))}
              required
            >
              <option value="student">Student</option>
              <option value="alumni">Alumni</option>
            </select>

            {registerForm.role === "alumni" && (
              <>
                <input
                  type="text"
                  className="auth-modal-input"
                  placeholder="Pass Out Year (e.g., 2022)"
                  value={registerForm.graduationYear}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({
                      ...prev,
                      graduationYear: event.target.value.replace(/\D/g, "").slice(0, 4)
                    }))
                  }
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  required
                />
                <input
                  type="text"
                  className="auth-modal-input"
                  placeholder="Branch (e.g., Computer Engineering)"
                  value={registerForm.branch}
                  onChange={(event) => setRegisterForm((prev) => ({ ...prev, branch: event.target.value }))}
                  required
                />
                <input
                  type="text"
                  className="auth-modal-input"
                  placeholder="Current Company"
                  value={registerForm.company}
                  onChange={(event) => setRegisterForm((prev) => ({ ...prev, company: event.target.value }))}
                  required
                />
                <input
                  type="text"
                  className="auth-modal-input"
                  placeholder="Current Location"
                  value={registerForm.location}
                  onChange={(event) => setRegisterForm((prev) => ({ ...prev, location: event.target.value }))}
                  required
                />
              </>
            )}
            <p className="auth-modal-help-text">You can also upload a photo in onboarding.</p>

            <button type="submit" className="auth-modal-primary-button auth-modal-primary-button--register" disabled={loading}>
              <FaUserPlus />
              {loading ? "Creating account..." : "Sign Up"}
            </button>

            <p className="auth-modal-footer-text">
              Already have an account?{" "}
              <button
                type="button"
                className="auth-modal-link-button auth-modal-link-button--accent"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
              >
                Log In
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
