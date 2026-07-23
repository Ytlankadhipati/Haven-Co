import { useState, useEffect } from "react";
import { useManagerAuth } from "../../context/ManagerAuthContext";
import "./ManagerProfile.css";

const ManagerProfile = () => {
  const { manager, updateManager } = useManagerAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    fullName: manager?.fullName || "",
    email: manager?.email || "",
    phone: manager?.phone || "",
    businessName: manager?.businessName || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = localStorage.getItem("managerToken");
      
      const res = await fetch(`http://localhost:5001/api/managers/${manager._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update profile");
      }

      const updatedManager = await res.json();
      updateManager(updatedManager);
      setSuccess("✅ Profile updated successfully!");
      setIsEditing(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("❌ Passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("❌ Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("managerToken");
      
      const res = await fetch(`http://localhost:5001/api/managers/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to change password");
      }

      setSuccess("✅ Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manager-profile">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          {manager?.fullName?.charAt(0).toUpperCase() || "M"}
        </div>
        <div className="profile-intro">
          <h1>{manager?.fullName}</h1>
          <p className="profile-email">{manager?.email}</p>
          <div className="status-badges">
            <span className={`badge status-${manager?.status || "pending"}`}>
              {manager?.status?.toUpperCase() || "PENDING"}
            </span>
            <span className={`badge kyc-${manager?.kycStatus || "not_submitted"}`}>
              KYC: {manager?.kycStatus?.toUpperCase() || "NOT SUBMITTED"}
            </span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="profile-content">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="card-header">
            <h2>📋 Profile Information</h2>
            <button
              className={`btn-edit ${isEditing ? "cancel" : ""}`}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel" : "✎ Edit"}
            </button>
          </div>

          <form onSubmit={handleUpdateProfile} className="profile-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+91 98765 43210"
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label>Business Name</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                placeholder="Your hotel/property business name"
                disabled={!isEditing}
              />
            </div>

            {isEditing && (
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Saving..." : "💾 Save Changes"}
              </button>
            )}
          </form>
        </div>

        {/* Security Card */}
        <div className="profile-card">
          <div className="card-header">
            <h2>🔒 Security & Password</h2>
          </div>

          <form onSubmit={handleChangePassword} className="profile-form">
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-secondary" disabled={loading}>
              {loading ? "Changing..." : "🔐 Change Password"}
            </button>
          </form>
        </div>

        {/* KYC Status Card */}
        <div className="profile-card">
          <div className="card-header">
            <h2>📄 KYC Verification Status</h2>
          </div>

          <div className="kyc-status">
            <div className="status-item">
              <span className="label">Current Status:</span>
              <span className={`badge kyc-${manager?.kycStatus || "not_submitted"}`}>
                {manager?.kycStatus?.toUpperCase() || "NOT SUBMITTED"}
              </span>
            </div>

            {manager?.govtIdDocument && (
              <div className="status-item">
                <span className="label">Uploaded Document:</span>
                <a
                  href={manager.govtIdDocument}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="doc-link"
                >
                  📸 View Document
                </a>
              </div>
            )}

            {manager?.kycStatus === "not_submitted" && (
              <p className="kyc-note">
                ⚠️ Please upload your government ID document to complete KYC verification
              </p>
            )}

            {manager?.kycStatus === "pending" && (
              <p className="kyc-note">
                ⏳ Your KYC document is under review. This usually takes 24-48 hours
              </p>
            )}

            {manager?.kycStatus === "verified" && (
              <p className="kyc-note">
                ✅ Your KYC verification is complete. You're all set!
              </p>
            )}

            {manager?.kycStatus === "rejected" && (
              <p className="kyc-note error">
                ❌ Your KYC document was rejected. Please upload a clearer image
              </p>
            )}
          </div>
        </div>

        {/* Account Stats */}
        <div className="profile-card">
          <div className="card-header">
            <h2>📊 Account Statistics</h2>
          </div>

          <div className="stats-grid">
            <div className="stat">
              <div className="stat-value">
                {manager?.hotelCount || 0}
              </div>
              <div className="stat-label">Hotels Listed</div>
            </div>
            <div className="stat">
              <div className="stat-value">
                {manager?.status === "approved" ? "✅" : "⏳"}
              </div>
              <div className="stat-label">Account Status</div>
            </div>
            <div className="stat">
              <div className="stat-value">
                {manager?.kycStatus === "verified" ? "✅" : "❌"}
              </div>
              <div className="stat-label">KYC Status</div>
            </div>
            <div className="stat">
              <div className="stat-value">
                {new Date(manager?.createdAt).toLocaleDateString()}
              </div>
              <div className="stat-label">Member Since</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerProfile;