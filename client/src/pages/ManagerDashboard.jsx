import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useManagerAuth } from "../context/ManagerAuthContext";
import "./ManagerDashboard.css";

const ManagerDashboard = () => {
  const { managerProfile, managerToken, logoutManager, loading } = useManagerAuth();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [hotelsLoading, setHotelsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("properties"); // ✅ ADD THIS
  const [isEditingProfile, setIsEditingProfile] = useState(false); // ✅ ADD THIS
  const [profileFormData, setProfileFormData] = useState({}); // ✅ ADD THIS
  const [profileLoading, setProfileLoading] = useState(false); // ✅ ADD THIS
  const [profileMessage, setProfileMessage] = useState(""); // ✅ ADD THIS

  useEffect(() => {
    if (!managerProfile?._id) return;
    fetch(`http://localhost:5001/api/hotels/manager/${managerProfile._id}`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    })
      .then((res) => res.json())
      .then((data) => setHotels(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to load hotels:", err))
      .finally(() => setHotelsLoading(false));
  }, [managerProfile, managerToken]);

  // ✅ ADD THIS - Initialize profile form data
  useEffect(() => {
    if (managerProfile) {
      setProfileFormData({
        fullName: managerProfile.fullName || "",
        email: managerProfile.email || "",
        phone: managerProfile.phone || "",
        businessName: managerProfile.businessName || "",
      });
    }
  }, [managerProfile]);

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  if (!managerProfile) {
    navigate("/manager/auth");
    return null;
  }

  const handleLogout = () => {
    logoutManager();
    navigate("/manager/auth");
  };

  // ✅ ADD THIS - Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage("");

    try {
      const res = await fetch(`http://localhost:5001/api/managers/${managerProfile._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${managerToken}`,
        },
        body: JSON.stringify(profileFormData),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      setProfileMessage("✅ Profile updated successfully!");
      setIsEditingProfile(false);
      setTimeout(() => setProfileMessage(""), 3000);
    } catch (error) {
      setProfileMessage("❌ " + error.message);
    } finally {
      setProfileLoading(false);
    }
  };

  // ✅ ADD THIS - Handle profile form change
  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const totalRooms = hotels.reduce((sum, h) => sum + (Number(h.totalRooms) || 0), 0);
  const liveCount = hotels.filter((h) => h.status === "approved").length;
  const pendingCount = hotels.filter((h) => h.status === "pending").length;

  return (
    <div className="manager-dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">HAVENCO · MANAGER MANIFEST</p>
          <h1>Welcome back, {managerProfile.fullName}</h1>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Log Out
        </button>
      </header>

      {/* ✅ ADD THIS - Tab Navigation */}
      <nav className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === "properties" ? "active" : ""}`}
          onClick={() => setActiveTab("properties")}
        >
          🏨 My Properties
        </button>
        <button
          className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          👤 My Profile
        </button>
      </nav>

      {/* ✅ PROPERTIES TAB */}
      {activeTab === "properties" && (
        <>
          <section className="stat-board">
            <div className="stat-tile">
              <span className="stat-value">{hotels.length}</span>
              <span className="stat-label">PROPERTIES</span>
            </div>
            <div className="stat-tile">
              <span className="stat-value stat-live">{liveCount}</span>
              <span className="stat-label">LIVE</span>
            </div>
            <div className="stat-tile">
              <span className="stat-value stat-pending">{pendingCount}</span>
              <span className="stat-label">PENDING</span>
            </div>
            <div className="stat-tile">
              <span className="stat-value">{totalRooms}</span>
              <span className="stat-label">TOTAL ROOMS</span>
            </div>
          </section>

          <section className="join-haven-banner">
            <div>
              <p className="banner-eyebrow">NEW BOARDING</p>
              <h2>List another property</h2>
            </div>
            <button
              className="join-haven-btn"
              onClick={() => navigate("/manager/add-property")}
            >
              Join Haven →
            </button>
          </section>

          {managerProfile.status === "pending" && (
            <p className="status-note">
              Your manager account is pending admin approval.
            </p>
          )}
          {managerProfile.kycStatus === "not_submitted" && (
            <p className="status-note">
              <button
                onClick={() => navigate("/manager/kyc")}
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  textDecoration: "underline",
                  cursor: "pointer",
                  font: "inherit",
                  padding: 0,
                }}
              >
                Verify your identity
              </button>
              {" "}to speed up account approval.
            </p>
          )}

          <section className="properties-section">
            <p className="section-eyebrow">YOUR PROPERTIES</p>

            {hotelsLoading ? (
              <p className="empty-note">Loading your properties...</p>
            ) : hotels.length === 0 ? (
              <div className="empty-state">
                <p>No properties listed yet.</p>
                <button
                  className="join-haven-btn"
                  onClick={() => navigate("/manager/add-property")}
                >
                  List your first property →
                </button>
              </div>
            ) : (
              <div className="pass-grid">
                {hotels.map((hotel) => (
                  <div className="boarding-pass-card" key={hotel._id}>
                    <div className="pass-main">
                      <p className="pass-eyebrow">
                        {hotel.propertyType?.toUpperCase()} · {hotel.location}
                      </p>
                      <h3>{hotel.name}</h3>
                      <p className="pass-price">₹{hotel.price} / night</p>
                      <span className={`status-stamp status-${hotel.status}`}>
                        {hotel.status}
                      </span>
                    </div>

                    <div className="pass-perforation">
                      {Array.from({ length: 14 }).map((_, i) => (
                        <span key={i} className="perf-dot" />
                      ))}
                    </div>

                    <div className="pass-stub">
                      <button
                        className="stub-action"
                        onClick={() =>
                          navigate(`/manager/hotels/edit/${hotel._id}`)
                        }
                      >
                        Edit
                      </button>
                      <button
                        className="stub-action stub-danger"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete "${hotel.name}"? This can't be undone.`
                            )
                          ) {
                            fetch(`http://localhost:5001/api/hotels/${hotel._id}`, {
                              method: "DELETE",
                              headers: {
                                Authorization: `Bearer ${managerToken}`,
                              },
                            }).then(() =>
                              setHotels((prev) =>
                                prev.filter((h) => h._id !== hotel._id)
                              )
                            );
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* ✅ ADD THIS - PROFILE TAB */}
      {activeTab === "profile" && (
        <section className="profile-section">
          <div className="profile-header">
            <div className="profile-avatar">
              {managerProfile.fullName?.charAt(0).toUpperCase() || "M"}
            </div>
            <div className="profile-info">
              <h2>{managerProfile.fullName}</h2>
              <p>{managerProfile.email}</p>
              <div className="profile-badges">
                <span className={`badge status-${managerProfile.status}`}>
                  {managerProfile.status?.toUpperCase()}
                </span>
                <span className={`badge kyc-${managerProfile.kycStatus}`}>
                  KYC: {managerProfile.kycStatus?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {profileMessage && (
            <div
              className={`profile-message ${
                profileMessage.includes("✅") ? "success" : "error"
              }`}
            >
              {profileMessage}
            </div>
          )}

          <div className="profile-card">
            <div className="card-header">
              <h3>Personal Information</h3>
              <button
                className={`edit-btn ${isEditingProfile ? "cancel" : ""}`}
                onClick={() => setIsEditingProfile(!isEditingProfile)}
              >
                {isEditingProfile ? "Cancel" : "✎ Edit"}
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="profile-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={profileFormData.fullName}
                  onChange={handleProfileInputChange}
                  disabled={!isEditingProfile}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={profileFormData.email}
                  onChange={handleProfileInputChange}
                  disabled={!isEditingProfile}
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileFormData.phone}
                  onChange={handleProfileInputChange}
                  placeholder="+91 98765 43210"
                  disabled={!isEditingProfile}
                />
              </div>

              <div className="form-group">
                <label>Business Name</label>
                <input
                  type="text"
                  name="businessName"
                  value={profileFormData.businessName}
                  onChange={handleProfileInputChange}
                  placeholder="Your hotel business name"
                  disabled={!isEditingProfile}
                />
              </div>

              {isEditingProfile && (
                <button
                  type="submit"
                  className="save-btn"
                  disabled={profileLoading}
                >
                  {profileLoading ? "Saving..." : "💾 Save Changes"}
                </button>
              )}
            </form>
          </div>

          <div className="profile-card">
            <h3>📄 KYC Verification</h3>
            <div className="kyc-status">
              <p>
                <strong>Status:</strong>{" "}
                <span className={`badge kyc-${managerProfile.kycStatus}`}>
                  {managerProfile.kycStatus?.toUpperCase()}
                </span>
              </p>

              {managerProfile.govtIdDocument && (
                <p>
                  <strong>Document:</strong>{" "}
                  <a
                    href={managerProfile.govtIdDocument}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="doc-link"
                  >
                    📸 View Uploaded Document
                  </a>
                </p>
              )}

              {managerProfile.kycStatus === "not_submitted" && (
                <button
                  className="kyc-btn"
                  onClick={() => navigate("/manager/kyc")}
                >
                  📤 Upload KYC Document
                </button>
              )}

              {managerProfile.kycStatus === "pending" && (
                <p className="kyc-note">
                  ⏳ Your KYC is under review. This usually takes 24-48 hours.
                </p>
              )}

              {managerProfile.kycStatus === "verified" && (
                <p className="kyc-note success">
                  ✅ Your KYC verification is complete!
                </p>
              )}

              {managerProfile.kycStatus === "rejected" && (
                <p className="kyc-note error">
                  ❌ Your KYC was rejected. Please upload a clearer document.
                </p>
              )}
            </div>
          </div>

          <div className="profile-card">
            <h3>📊 Account Statistics</h3>
            <div className="stats-grid">
              <div className="stat">
                <div className="stat-value">{hotels.length}</div>
                <div className="stat-label">Hotels Listed</div>
              </div>
              <div className="stat">
                <div className="stat-value">{liveCount}</div>
                <div className="stat-label">Live Properties</div>
              </div>
              <div className="stat">
                <div className="stat-value">{managerProfile.status === "approved" ? "✅" : "⏳"}</div>
                <div className="stat-label">Account Status</div>
              </div>
              <div className="stat">
                <div className="stat-value">
                  {new Date(managerProfile.createdAt).toLocaleDateString()}
                </div>
                <div className="stat-label">Member Since</div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ManagerDashboard;