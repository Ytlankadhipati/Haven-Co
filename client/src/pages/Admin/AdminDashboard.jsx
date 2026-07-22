import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("approvals");
  const [pendingManagers, setPendingManagers] = useState([]);
  const [pendingHotels, setPendingHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);

  const { adminToken, adminProfile, logoutAdmin, loading: authLoading } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!adminToken) {
      navigate("/admin/login", { replace: true });
    }
    setHasCheckedAuth(true);
  }, [authLoading]);

  useEffect(() => {
    if (!adminToken || !hasCheckedAuth) return;

    const fetchApprovals = async () => {
      setLoading(true);
      try {
        const [managersRes, hotelsRes] = await Promise.all([
          fetch("http://localhost:5001/api/admin/managers", {
            headers: { Authorization: `Bearer ${adminToken}` },
          }),
          fetch("http://localhost:5001/api/admin/hotels", {
            headers: { Authorization: `Bearer ${adminToken}` },
          }),
        ]);

        if (!managersRes.ok || !hotelsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const managersData = await managersRes.json();
        const hotelsData = await hotelsRes.json();

        setPendingManagers(managersData.filter((m) => m.status === "pending"));
        setPendingHotels(hotelsData.filter((h) => h.status === "pending"));
      } catch (error) {
        console.error("Failed to load approvals:", error);
        setActionError("Failed to load approvals");
      } finally {
        setLoading(false);
      }
    };

    fetchApprovals();
  }, [adminToken, hasCheckedAuth]);

  const handleManagerAction = async (managerId, action) => {
    setActionError("");
    setActionSuccess("");
    setProcessingId(managerId);

    try {
      const res = await fetch(
        `http://localhost:5001/api/admin/managers/${managerId}/${action}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        setActionError(data.message || "Action failed");
        setProcessingId(null);
        return;
      }

      setPendingManagers((prev) => prev.filter((m) => m._id !== managerId));
      setActionSuccess(`Manager ${action}ed successfully! 🎉`);
      setTimeout(() => setActionSuccess(""), 3000);
    } catch (error) {
      console.error(error);
      setActionError("Something went wrong");
    } finally {
      setProcessingId(null);
    }
  };

  const handleHotelAction = async (hotelId, action) => {
    setActionError("");
    setActionSuccess("");
    setProcessingId(hotelId);

    try {
      const res = await fetch(
        `http://localhost:5001/api/admin/hotels/${hotelId}/${action}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        setActionError(data.message || "Action failed");
        setProcessingId(null);
        return;
      }

      setPendingHotels((prev) => prev.filter((h) => h._id !== hotelId));
      setActionSuccess(`Hotel ${action}ed successfully! 🎉`);
      setTimeout(() => setActionSuccess(""), 3000);
    } catch (error) {
      console.error(error);
      setActionError("Something went wrong");
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin/login", { replace: true });
  };

  if (authLoading || !hasCheckedAuth || loading) {
    return (
      <div className="admin-loading-container">
        <div className="loading-card">
          <div className="spinner"></div>
          <p>Preparing your dashboard...</p>
        </div>
      </div>
    );
  }

  const totalPending = pendingManagers.length + pendingHotels.length;

  return (
    <div className="admin-dashboard">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }

        .admin-dashboard {
          background: #f8f9fa;
          min-height: 100vh;
          padding: 0;
        }

        /* Navigation Bar */
        .admin-navbar {
          background: linear-gradient(135deg, #1a1f3a 0%, #16213e 100%);
          padding: 1.2rem 2.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .navbar-logo {
          font-size: 1.8rem;
          font-weight: 800;
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
        }

        .navbar-logo span {
          display: block;
          font-size: 0.7rem;
          color: #888;
          letter-spacing: 2px;
          margin-top: -0.5rem;
          text-transform: uppercase;
        }

        .navbar-user {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: white;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          font-size: 1.1rem;
        }

        .user-info h3 {
          font-size: 0.95rem;
          margin: 0;
        }

        .user-info p {
          font-size: 0.8rem;
          color: #aaa;
          margin: 0;
        }

        .logout-btn {
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          color: white;
          border: none;
          padding: 0.65rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          margin-left: 1rem;
        }

        .logout-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 107, 53, 0.3);
        }

        /* Main Content */
        .admin-main {
          padding: 2.5rem;
          max-width: 1600px;
          margin: 0 auto;
        }

        .header-section {
          margin-bottom: 3rem;
        }

        .header-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1a1f3a;
          margin-bottom: 0.5rem;
        }

        .header-subtitle {
          color: #666;
          font-size: 1rem;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s ease;
          border-left: 4px solid transparent;
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(255, 107, 53, 0.05) 0%, transparent 70%);
          border-radius: 50%;
        }

        .stat-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
        }

        .stat-card.pending {
          border-left-color: #FF6B35;
        }

        .stat-card.managers {
          border-left-color: #4CAF50;
        }

        .stat-card.hotels {
          border-left-color: #2196F3;
        }

        .stat-content {
          flex: 1;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .stat-number {
          font-size: 2.8rem;
          font-weight: 800;
          color: #1a1f3a;
          line-height: 1;
        }

        .stat-icon {
          font-size: 3.5rem;
          opacity: 0.8;
        }

        /* Alerts */
        .alert {
          padding: 1.2rem 1.5rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .alert-error {
          background: linear-gradient(135deg, #FFE5E5 0%, #FFCCCC 100%);
          color: #C1272D;
          border-left: 4px solid #C1272D;
        }

        .alert-success {
          background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
          color: #2E7D32;
          border-left: 4px solid #2E7D32;
        }

        /* Tabs */
        .tabs-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          margin-bottom: 2rem;
          overflow: hidden;
        }

        .tabs {
          display: flex;
          border-bottom: 2px solid #f0f0f0;
        }

        .tab-btn {
          background: none;
          border: none;
          padding: 1.2rem 2rem;
          font-weight: 600;
          color: #999;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.95rem;
          position: relative;
        }

        .tab-btn:hover {
          color: #FF6B35;
        }

        .tab-btn.active {
          color: #FF6B35;
        }

        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
        }

        /* Section Styles */
        .section {
          margin-bottom: 3rem;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1f3a;
        }

        .section-badge {
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          color: white;
          padding: 0.4rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        /* Empty State */
        .empty-state {
          background: white;
          border-radius: 12px;
          padding: 4rem 2rem;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: #1a1f3a;
          margin-bottom: 0.5rem;
        }

        .empty-text {
          color: #999;
          font-size: 0.95rem;
        }

        /* Cards List */
        .cards-list {
          display: grid;
          gap: 1.2rem;
        }

        /* Manager Card */
        .manager-card {
          background: white;
          border-radius: 12px;
          padding: 1.8rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          border: 1px solid #f0f0f0;
          position: relative;
          overflow: hidden;
        }

        .manager-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
        }

        .manager-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
        }

        .manager-content {
          flex: 1;
        }

        .manager-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1a1f3a;
          margin-bottom: 0.5rem;
        }

        .manager-details {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.9rem;
          color: #666;
        }

        .business-badge {
          background: linear-gradient(135deg, #F5F7FA 0%, #E9ECEF 100%);
          padding: 0.4rem 1rem;
          border-radius: 6px;
          font-weight: 500;
          color: #FF6B35;
        }

        /* Hotel Card */
        .hotel-card {
          background: white;
          border-radius: 12px;
          padding: 1.8rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          border: 1px solid #f0f0f0;
          position: relative;
          overflow: hidden;
        }

        .hotel-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
        }

        .hotel-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
        }

        .hotel-image-wrapper {
          position: relative;
          width: 100px;
          height: 100px;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          margin-right: 1.5rem;
        }

        .hotel-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hotel-image-fallback {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 2rem;
        }

        .hotel-content {
          flex: 1;
        }

        .hotel-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1a1f3a;
          margin-bottom: 0.5rem;
        }

        .hotel-info {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .hotel-info-item {
          font-size: 0.9rem;
          color: #666;
        }

        .hotel-price {
          font-size: 1.1rem;
          font-weight: 700;
          color: #FF6B35;
        }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          gap: 0.8rem;
          margin-left: auto;
        }

        .btn {
          border: none;
          padding: 0.7rem 1.4rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          min-width: 100px;
          justify-content: center;
        }

        .btn-approve {
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          color: white;
        }

        .btn-approve:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(76, 175, 80, 0.3);
        }

        .btn-reject {
          background: linear-gradient(135deg, #F44336 0%, #E53935 100%);
          color: white;
        }

        .btn-reject:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(244, 67, 54, 0.3);
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Loading */
        .admin-loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .loading-card {
          background: white;
          padding: 3rem 2rem;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .spinner {
          width: 60px;
          height: 60px;
          border: 4px solid #f0f0f0;
          border-top: 4px solid #FF6B35;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1.5rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .manager-card,
          .hotel-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .action-buttons {
            width: 100%;
            margin-left: 0;
            margin-top: 1rem;
          }

          .hotel-image-wrapper {
            margin-right: 0;
            margin-bottom: 1rem;
          }
        }

        @media (max-width: 768px) {
          .admin-navbar {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
          }

          .navbar-left {
            width: 100%;
          }

          .logout-btn {
            width: 100%;
            margin-left: 0;
          }

          .admin-main {
            padding: 1.5rem;
          }

          .header-title {
            font-size: 1.8rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .stat-card {
            flex-direction: column;
            text-align: center;
          }

          .stat-icon {
            order: 2;
          }

          .manager-card,
          .hotel-card {
            padding: 1.2rem;
          }

          .tabs {
            flex-wrap: wrap;
          }
        }
      `}</style>

      {/* Navbar */}
      <div className="admin-navbar">
        <div className="navbar-left">
          <div className="navbar-logo">
            🏨 HAVEN CO
            <span>Admin</span>
          </div>
        </div>
        <div className="navbar-user">
          <div className="user-avatar">
            {adminProfile?.fullName?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="user-info">
            <h3>{adminProfile?.fullName || "Admin"}</h3>
            <p>Administrator</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {/* Header */}
        <div className="header-section">
          <h1 className="header-title">Dashboard</h1>
          <p className="header-subtitle">
            Manage and approve pending applications
          </p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card pending">
            <div className="stat-content">
              <div className="stat-label">Total Pending</div>
              <div className="stat-number">{totalPending}</div>
            </div>
            <div className="stat-icon">⏳</div>
          </div>
          <div className="stat-card managers">
            <div className="stat-content">
              <div className="stat-label">Pending Managers</div>
              <div className="stat-number">{pendingManagers.length}</div>
            </div>
            <div className="stat-icon">👥</div>
          </div>
          <div className="stat-card hotels">
            <div className="stat-content">
              <div className="stat-label">Pending Hotels</div>
              <div className="stat-number">{pendingHotels.length}</div>
            </div>
            <div className="stat-icon">🏢</div>
          </div>
        </div>

        {/* Alerts */}
        {actionError && (
          <div className="alert alert-error">
            ⚠️ <span>{actionError}</span>
          </div>
        )}
        {actionSuccess && (
          <div className="alert alert-success">
            ✅ <span>{actionSuccess}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="tabs-container">
          <div className="tabs">
            <button
              className={`tab-btn ${activeTab === "approvals" ? "active" : ""}`}
              onClick={() => setActiveTab("approvals")}
            >
              📋 Approvals
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === "approvals" && (
          <>
            {/* Managers Section */}
            <div className="section">
              <div className="section-header">
                <h2 className="section-title">👥 Manager Approvals</h2>
                <span className="section-badge">{pendingManagers.length}</span>
              </div>

              {pendingManagers.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👥</div>
                  <h3 className="empty-title">No Pending Managers</h3>
                  <p className="empty-text">
                    All manager applications have been reviewed
                  </p>
                </div>
              ) : (
                <div className="cards-list">
                  {pendingManagers.map((manager) => (
                    <div key={manager._id} className="manager-card">
                      <div className="manager-content">
                        <div className="manager-name">{manager.fullName}</div>
                        <div className="manager-details">
                          <div className="detail-item">
                            📧 {manager.email}
                          </div>
                          {manager.businessName && (
                            <span className="business-badge">
                              {manager.businessName}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="action-buttons">
                        <button
                          className="btn btn-approve"
                          onClick={() =>
                            handleManagerAction(manager._id, "approve")
                          }
                          disabled={processingId === manager._id}
                        >
                          ✓ Approve
                        </button>
                        <button
                          className="btn btn-reject"
                          onClick={() =>
                            handleManagerAction(manager._id, "reject")
                          }
                          disabled={processingId === manager._id}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hotels Section */}
            <div className="section">
              <div className="section-header">
                <h2 className="section-title">🏢 Hotel Approvals</h2>
                <span className="section-badge">{pendingHotels.length}</span>
              </div>

              {pendingHotels.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🏢</div>
                  <h3 className="empty-title">No Pending Hotels</h3>
                  <p className="empty-text">
                    All hotel applications have been reviewed
                  </p>
                </div>
              ) : (
                <div className="cards-list">
                  {pendingHotels.map((hotel) => (
                    <div key={hotel._id} className="hotel-card">
                      <div className="hotel-image-wrapper">
                        {hotel.images?.[0] ? (
                          <img
                            src={hotel.images[0]}
                            alt={hotel.name}
                            className="hotel-image"
                          />
                        ) : (
                          <div className="hotel-image-fallback">🏨</div>
                        )}
                      </div>
                      <div className="hotel-content">
                        <div className="hotel-name">{hotel.name}</div>
                        <div className="hotel-info">
                          <span className="hotel-info-item">
                            📍 {hotel.location}
                          </span>
                          <span className="hotel-info-item">•</span>
                          <span className="hotel-info-item">
                            {hotel.propertyType}
                          </span>
                          <span className="hotel-price">
                            ₹{hotel.price}/night
                          </span>
                        </div>
                      </div>
                      <div className="action-buttons">
                        <button
                          className="btn btn-approve"
                          onClick={() =>
                            handleHotelAction(hotel._id, "approve")
                          }
                          disabled={processingId === hotel._id}
                        >
                          ✓ Approve
                        </button>
                        <button
                          className="btn btn-reject"
                          onClick={() =>
                            handleHotelAction(hotel._id, "reject")
                          }
                          disabled={processingId === hotel._id}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;