import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useManagerAuth } from "../context/ManagerAuthContext";
import "./ManagerAuth.css";

const ManagerAuth = () => {
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginManager } = useManagerAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ---- Google Sign-In ----
  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const res = await fetch("http://localhost:5001/api/managers/google-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: firebaseUser.uid,
          fullName: firebaseUser.displayName,
          email: firebaseUser.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Google sign-in failed");
        setLoading(false);
        return;
      }

      loginManager(data.token, data.manager);
      navigate("/manager/dashboard");
    } catch (err) {
      console.error(err);
      setError("Google sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  // ---- Email/Password Login or Register ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = mode === "login" ? "login" : "register";

    try {
      const res = await fetch(`http://localhost:5001/api/managers/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      if (mode === "login") {
        loginManager(data.token, data.manager);
        navigate("/manager/dashboard");
      } else {
        // after successful register, switch to login mode
        setMode("login");
        setError("Registered successfully! Please log in.");
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="manager-auth-page">
      <div className="manager-auth-card">
        <h1>{mode === "login" ? "Manager Login" : "Register as Manager"}</h1>

        <button
          className="google-btn"
          onClick={handleGoogleSignIn}
          disabled={loading}
          type="button"
        >
          Continue with Google
        </button>

        <div className="divider">OR</div>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="businessName"
                placeholder="Business Name (optional)"
                value={formData.businessName}
                onChange={handleChange}
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
              />
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Log In" : "Register"}
          </button>
        </form>

        <p className="switch-mode">
          {mode === "login" ? "New manager? " : "Already have an account? "}
          <span onClick={() => setMode(mode === "login" ? "register" : "login")}>
            {mode === "login" ? "Register here" : "Log in here"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default ManagerAuth;