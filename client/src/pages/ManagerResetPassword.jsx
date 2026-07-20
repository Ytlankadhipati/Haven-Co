import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./ManagerPasswordFlow.css";

const API_BASE = "http://localhost:5001/api/managers";

const ManagerResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      navigate("/manager/auth", { state: { resetSuccess: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mpass-page">
      <div className="mpass-card">
        <p className="eyebrow mpass-eyebrow">HavenCO · Manager Access</p>
        <h2 className="mpass-title">Set a new password</h2>

        <form onSubmit={handleSubmit} className="mpass-form">
          <label className="eyebrow" htmlFor="password">New password</label>
          <input
            id="password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label className="eyebrow" htmlFor="confirmPassword">Confirm new password</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && <p className="mpass-error">{error}</p>}

          <button type="submit" className="mpass-submit" disabled={loading}>
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>

        <Link to="/manager/auth" className="mpass-back">
          ← Back to login
        </Link>
      </div>
    </div>
  );
};

export default ManagerResetPassword;