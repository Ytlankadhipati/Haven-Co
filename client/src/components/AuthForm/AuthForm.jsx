import { useNavigate } from "react-router-dom";
import { signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth, googleProvider } from "../../firebase/firebaseConfig";
import "./AuthForm.css";
import React, { useState, useEffect, useRef } from "react";

const API_BASE = "http://localhost:5001/api/users";

// mode is just for the heading text — Firebase creates the account
// automatically on first Google/Phone sign-in, so login and signup
// use the exact same flow underneath.
const AuthForm = ({ mode = "login" }) => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone"); // "phone" | "otp"
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const heading = mode === "signup" ? "Create your account" : "Welcome back";

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await fetch(`${API_BASE}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: user.uid,
          fullName: user.displayName || "",
          email: user.email || "",
        }),
      });

      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const recaptchaVerifierRef = useRef(null);

  useEffect(() => {
    // Set up reCAPTCHA once when this component mounts
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
  
    // Clean up when this component unmounts, so React StrictMode's
    // double-mount in dev doesn't leave a stale widget behind
    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
  
    if (!/^\+\d{10,15}$/.test(phone)) {
      setError("Enter phone number in international format, e.g. +919876543210");
      return;
    }
  
    setLoading(true);
    try {
      const result = await signInWithPhoneNumber(auth, phone, recaptchaVerifierRef.current);
      setConfirmationResult(result);
      setStep("otp");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      await fetch(`${API_BASE}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: user.uid,
          phone: user.phoneNumber || "",
        }),
      });

      navigate("/");
    } catch (err) {
      setError("Incorrect code. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authform">
      <p className="eyebrow authform__eyebrow">HavenCO · Access</p>
      <h2 className="authform__title">{heading}</h2>

      <button
        type="button"
        className="authform__google"
        onClick={handleGoogleSignIn}
        disabled={loading}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.9v2.33A9 9 0 0 0 9 18z"
          />
          <path
            fill="#FBBC05"
            d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.7V4.97H.9A9 9 0 0 0 0 9c0 1.45.35 2.83.9 4.03l3.05-2.33z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .9 4.97l3.05 2.33C4.66 5.17 6.65 3.58 9 3.58z"
          />
        </svg>
        Continue with Google
      </button>

      <div className="authform__divider">
        <span />
        <p>or use your phone</p>
        <span />
      </div>

      {step === "phone" && (
        <form onSubmit={handleSendOtp} className="authform__form">
          <label className="eyebrow" htmlFor="phone">
            Phone number
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="+919876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button type="submit" className="authform__submit" disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="authform__form">
          <label className="eyebrow" htmlFor="otp">
            Enter OTP sent to {phone}
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button type="submit" className="authform__submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify & continue"}
          </button>
          <button
            type="button"
            className="authform__resend"
            onClick={() => setStep("phone")}
          >
            Use a different number
          </button>
        </form>
      )}

      {error && <p className="authform__error">{error}</p>}

      {/* Required by Firebase for invisible reCAPTCHA — keep it in the DOM */}
      <div id="recaptcha-container" />
    </div>
  );
};

export default AuthForm;