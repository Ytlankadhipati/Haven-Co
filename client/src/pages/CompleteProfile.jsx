import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "./CompleteProfile.css";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:5001/api/users";

const CompleteProfile = () => {
  const { currentUser } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    dob: "",
    gender: "",
    maritalStatus: "",
  });
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch existing data as soon as we know who's logged in
  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser?.uid) return;

      try {
        const res = await fetch(`${API_BASE}/${currentUser.uid}`);
        if (res.ok) {
          const data = await res.json();
          setForm({
            fullName: data.fullName || "",
            dob: data.dob ? data.dob.slice(0, 10) : "", // format for <input type="date">
            gender: data.gender || "",
            maritalStatus: data.maritalStatus || "",
          });
          if (data.profileCompleted) {
            setSaved(true);
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: currentUser?.uid,
          ...form,
        }),
      });

      setSaved(true);
      setEditing(false);
    } catch (err) {
      console.error("Failed to save profile:", err);
    }
  };

  if (loading) {
    return (
      <div className="complete-profile">
        <p style={{ color: "var(--ink-text-soft)" }}>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="complete-profile">
      <div className="complete-profile__card">
      <Link to="/" className="complete-profile__back">
      ← Back to home
      </Link>
        <p className="eyebrow" style={{ color: "var(--teal-700)" }}>
          {saved && !editing ? "Your details" : "One last step"}
        </p>
        <h2>{saved && !editing ? "Your profile" : "Tell us a bit about you"}</h2>
        <p className="complete-profile__sub">
          {saved && !editing
            ? "Saved to your account. You can update it anytime."
            : "This helps us personalize your stays and recommendations."}
        </p>

        {saved && !editing ? (
          <div className="complete-profile__summary">
            <p><strong>Name:</strong> {form.fullName || "—"}</p>
            <p><strong>Date of birth:</strong> {form.dob || "—"}</p>
            <p><strong>Gender:</strong> {form.gender || "—"}</p>
            <p><strong>Marital status:</strong> {form.maritalStatus || "—"}</p>
            <button
              className="complete-profile__submit"
              onClick={() => setEditing(true)}
              type="button"
            >
              Edit details
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="complete-profile__form">
            <div className="complete-profile__field">
              <label className="eyebrow" htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                type="text"
                placeholder="Your full name"
                value={form.fullName}
                onChange={handleChange("fullName")}
                required
              />
            </div>

            <div className="complete-profile__field">
              <label className="eyebrow" htmlFor="dob">Date of birth</label>
              <input
                id="dob"
                type="date"
                value={form.dob}
                onChange={handleChange("dob")}
                required
              />
            </div>

            <div className="complete-profile__field">
              <label className="eyebrow" htmlFor="gender">Gender</label>
              <select id="gender" value={form.gender} onChange={handleChange("gender")} required>
                <option value="" disabled>Select</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <div className="complete-profile__field">
              <label className="eyebrow" htmlFor="maritalStatus">Marital status</label>
              <select
                id="maritalStatus"
                value={form.maritalStatus}
                onChange={handleChange("maritalStatus")}
                required
              >
                <option value="" disabled>Select</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <button type="submit" className="complete-profile__submit">
              Save profile
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CompleteProfile;