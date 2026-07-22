import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useManagerAuth } from "../context/ManagerAuthContext";
import "./ManagerDashboard.css";

const ManagerDashboard = () => {
  const { managerProfile, managerToken, logoutManager, loading } = useManagerAuth();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [hotelsLoading, setHotelsLoading] = useState(true);

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
        <button className="join-haven-btn" onClick={() => navigate("/manager/add-property")}>
          Join Haven →
        </button>
      </section>

      {managerProfile.status === "pending" && (
        <p className="status-note">Your manager account is pending admin approval.</p>
      )}
      {managerProfile.kycStatus === "not_submitted" && (
  <p className="status-note">
    <button
      onClick={() => navigate("/manager/kyc")}
      style={{ background: "none", border: "none", color: "inherit", textDecoration: "underline", cursor: "pointer", font: "inherit", padding: 0 }}
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
            <button className="join-haven-btn" onClick={() => navigate("/manager/add-property")}>
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
                    onClick={() => navigate(`/manager/hotels/edit/${hotel._id}`)}
                  >
                    Edit
                  </button>
                  <button
                    className="stub-action stub-danger"
                    onClick={() => {
                      if (window.confirm(`Delete "${hotel.name}"? This can't be undone.`)) {
                        fetch(`http://localhost:5001/api/hotels/${hotel._id}`, {
                          method: "DELETE",
                          headers: { Authorization: `Bearer ${managerToken}` },
                        }).then(() => setHotels((prev) => prev.filter((h) => h._id !== hotel._id)));
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
    </div>
  );
};

export default ManagerDashboard;