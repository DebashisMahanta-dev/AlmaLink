import React from "react";
import { useNavigate } from "react-router-dom";
import AuthModal from "../components/AuthModal";

const AuthEntry = ({ mode = "login" }) => {
  const navigate = useNavigate();

  return (
    <div className="auth-entry-page">
      <AuthModal
        isOpen
        initialMode={mode}
        onClose={() => navigate("/", { replace: true })}
      />
    </div>
  );
};

export default AuthEntry;
