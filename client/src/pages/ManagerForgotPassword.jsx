import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./ManagerPasswordFlow.css";

const API_BASE = "http://localhost:5001/api/managers";

const ManagerForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await fetch(`${API_BASE}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mpass-page">
      <div className="mpass-card">
        <p className="eyebrow mpass-eyebrow">HavenCO · Manager Access</p>
        <h2 className="mpass-title">Reset your password</h2>

        {submitted ? (
          <p className="mpass-success">
            If an account with that email exists, we've sent a reset link.
            Check your email (or, in development, the backend console log).
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mpass-form">
            <p className="mpass-sub">
              Enter the email you registered with, and we'll send you a link to reset your password.
            </p>

            <label className="eyebrow" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@business.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {error && <p className="mpass-error">{error}</p>}

            <button type="submit" className="mpass-submit" disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <Link to="/manager/auth" className="mpass-back">
          ← Back to login
        </Link>
      </div>
    </div>
  );
};

export default ManagerForgotPassword;