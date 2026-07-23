import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("approvals");
  const [managerFilter, setManagerFilter] = useState("pending");
  const [hotelFilter, setHotelFilter] = useState("pending");
  const [kycFilter, setKycFilter] = useState("pending"); // ✅ ADD THIS
  
  const [allManagers, setAllManagers] = useState([]);
  const [allHotels, setAllHotels] = useState([]);
  const [allKyc, setAllKyc] = useState([]); // ✅ ADD THIS
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  const { adminToken, adminProfile, logoutAdmin, loading: authLoading } =
    useAdminAuth();
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

    const fetchData = async () => {
      setLoading(true);
      try {
        const [managersRes, hotelsRes, kycRes] = await Promise.all([
          fetch("http://localhost:5001/api/admin/managers", {
            headers: { Authorization: `Bearer ${adminToken}` },
          }),
          fetch("http://localhost:5001/api/admin/hotels", {
            headers: { Authorization: `Bearer ${adminToken}` },
          }),
          // ✅ ADD THIS - Fetch KYC documents
          fetch("http://localhost:5001/api/admin/kyc?kycStatus=all", {
            headers: { Authorization: `Bearer ${adminToken}` },
          }),
        ]);

        if (!managersRes.ok || !hotelsRes.ok || !kycRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const managersData = await managersRes.json();
        const hotelsData = await hotelsRes.json();
        const kycData = await kycRes.json();

        setAllManagers(managersData);
        setAllHotels(hotelsData);
        setAllKyc(kycData); // ✅ ADD THIS

        console.log("✅ Loaded:", {
          managers: managersData.length,
          hotels: hotelsData.length,
          kyc: kycData.length,
        });
      } catch (error) {
        console.error("Failed to load data:", error);
        setActionError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [adminToken, hasCheckedAuth]);

  // Filter function
  const filterByStatus = (items, filterType) => {
    if (filterType === "all") return items;
    return items.filter((item) => item.status === filterType || item.kycStatus === filterType);
  };

  // Get filtered data
  const filteredManagers = filterByStatus(allManagers, managerFilter);
  const filteredHotels = filterByStatus(allHotels, hotelFilter);
  const filteredKyc = filterByStatus(allKyc, kycFilter); // ✅ ADD THIS

  // Count stats
  const stats = {
    managersTotal: allManagers.length,
    managersPending: allManagers.filter((m) => m.status === "pending").length,
    managersApproved: allManagers.filter((m) => m.status === "approved").length,
    managersRejected: allManagers.filter((m) => m.status === "rejected").length,

    hotelsTotal: allHotels.length,
    hotelsPending: allHotels.filter((h) => h.status === "pending").length,
    hotelsApproved: allHotels.filter((h) => h.status === "approved").length,
    hotelsRejected: allHotels.filter((h) => h.status === "rejected").length,

    // ✅ ADD THIS - KYC stats
    kycTotal: allKyc.length,
    kycPending: allKyc.filter((k) => k.kycStatus === "pending").length,
    kycVerified: allKyc.filter((k) => k.kycStatus === "verified").length,
    kycRejected: allKyc.filter((k) => k.kycStatus === "rejected").length,
  };

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

      setAllManagers((prev) =>
        prev.map((m) =>
          m._id === managerId
            ? {
                ...m,
                status:
                  action === "approve" ? "approved" : "rejected",
              }
            : m
        )
      );

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

      setAllHotels((prev) =>
        prev.map((h) =>
          h._id === hotelId
            ? {
                ...h,
                status:
                  action === "approve" ? "approved" : "rejected",
              }
            : h
        )
      );

      setActionSuccess(`Hotel ${action}ed successfully! 🎉`);
      setTimeout(() => setActionSuccess(""), 3000);
    } catch (error) {
      console.error(error);
      setActionError("Something went wrong");
    } finally {
      setProcessingId(null);
    }
  };

  // ✅ ADD THIS - KYC handler
  const handleKycAction = async (managerId, action) => {
    setActionError("");
    setActionSuccess("");
    setProcessingId(managerId);

    try {
      const res = await fetch(
        `http://localhost:5001/api/admin/kyc/${managerId}/${action}`,
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

      setAllKyc((prev) =>
        prev.map((k) =>
          k._id === managerId
            ? {
                ...k,
                kycStatus:
                  action === "verify" ? "verified" : "rejected",
              }
            : k
        )
      );

      setActionSuccess(`KYC ${action === "verify" ? "verified" : "rejected"} successfully! 🎉`);
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

  const totalPending =
    stats.managersPending + stats.hotelsPending + stats.kycPending;

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

        .stat-card.approved {
          border-left-color: #4CAF50;
        }

        .stat-card.rejected {
          border-left-color: #F44336;
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

        /* Filter Buttons */
        .filter-buttons {
          display: flex;
          gap: 0.8rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .filter-btn {
          background: white;
          border: 2px solid #f0f0f0;
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          color: #666;
        }

        .filter-btn:hover {
          border-color: #FF6B35;
          color: #FF6B35;
        }

        .filter-btn.active {
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          color: white;
          border-color: #FF6B35;
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

        .status-badge {
          padding: 0.4rem 1rem;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
        }

        .status-pending {
          background: #FFF3E0;
          color: #E65100;
        }

        .status-approved {
          background: #E8F5E9;
          color: #2E7D32;
        }

        .status-rejected {
          background: #FFEBEE;
          color: #C1272D;
        }

        .status-verified {
          background: #E8F5E9;
          color: #2E7D32;
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

        /* Document Link */
        .kyc-document-link {
          color: #FF6B35;
          text-decoration: underline;
          cursor: pointer;
          font-weight: 600;
        }

        .kyc-document-link:hover {
          color: #E55A2B;
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
            Manage and approve all applications
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
          <div className="stat-card approved">
            <div className="stat-content">
              <div className="stat-label">Approved Total</div>
              <div className="stat-number">
                {stats.managersApproved + stats.hotelsApproved}
              </div>
            </div>
            <div className="stat-icon">✅</div>
          </div>
          <div className="stat-card rejected">
            <div className="stat-content">
              <div className="stat-label">Rejected Total</div>
              <div className="stat-number">
                {stats.managersRejected + stats.hotelsRejected}
              </div>
            </div>
            <div className="stat-icon">❌</div>
          </div>
          {/* ✅ ADD KYC STAT */}
          <div className="stat-card pending">
            <div className="stat-content">
              <div className="stat-label">Pending KYC</div>
              <div className="stat-number">{stats.kycPending}</div>
            </div>
            <div className="stat-icon">📄</div>
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

        {/* ===== MANAGERS SECTION ===== */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">
              👥 Managers ({stats.managersTotal})
            </h2>
          </div>

          {/* Filter Buttons */}
          <div className="filter-buttons">
            <button
              className={`filter-btn ${
                managerFilter === "pending" ? "active" : ""
              }`}
              onClick={() => setManagerFilter("pending")}
            >
              ⏳ Pending ({stats.managersPending})
            </button>
            <button
              className={`filter-btn ${
                managerFilter === "approved" ? "active" : ""
              }`}
              onClick={() => setManagerFilter("approved")}
            >
              ✅ Approved ({stats.managersApproved})
            </button>
            <button
              className={`filter-btn ${
                managerFilter === "rejected" ? "active" : ""
              }`}
              onClick={() => setManagerFilter("rejected")}
            >
              ❌ Rejected ({stats.managersRejected})
            </button>
            <button
              className={`filter-btn ${managerFilter === "all" ? "active" : ""}`}
              onClick={() => setManagerFilter("all")}
            >
              📋 All ({stats.managersTotal})
            </button>
          </div>

          {filteredManagers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3 className="empty-title">No Managers</h3>
              <p className="empty-text">No managers found in this category</p>
            </div>
          ) : (
            <div className="cards-list">
              {filteredManagers.map((manager) => (
                <div key={manager._id} className="manager-card">
                  <div className="manager-content">
                    <div className="manager-name">{manager.fullName}</div>
                    <div className="manager-details">
                      <div className="detail-item">📧 {manager.email}</div>
                      <span className={`status-badge status-${manager.status}`}>
                        {manager.status}
                      </span>
                    </div>
                  </div>
                  {manager.status === "pending" && (
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
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== HOTELS SECTION ===== */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">🏢 Hotels ({stats.hotelsTotal})</h2>
          </div>

          {/* Filter Buttons */}
          <div className="filter-buttons">
            <button
              className={`filter-btn ${
                hotelFilter === "pending" ? "active" : ""
              }`}
              onClick={() => setHotelFilter("pending")}
            >
              ⏳ Pending ({stats.hotelsPending})
            </button>
            <button
              className={`filter-btn ${
                hotelFilter === "approved" ? "active" : ""
              }`}
              onClick={() => setHotelFilter("approved")}
            >
              ✅ Approved ({stats.hotelsApproved})
            </button>
            <button
              className={`filter-btn ${
                hotelFilter === "rejected" ? "active" : ""
              }`}
              onClick={() => setHotelFilter("rejected")}
            >
              ❌ Rejected ({stats.hotelsRejected})
            </button>
            <button
              className={`filter-btn ${hotelFilter === "all" ? "active" : ""}`}
              onClick={() => setHotelFilter("all")}
            >
              📋 All ({stats.hotelsTotal})
            </button>
          </div>

          {filteredHotels.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏢</div>
              <h3 className="empty-title">No Hotels</h3>
              <p className="empty-text">No hotels found in this category</p>
            </div>
          ) : (
            <div className="cards-list">
              {filteredHotels.map((hotel) => (
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
                      <span className={`status-badge status-${hotel.status}`}>
                        {hotel.status}
                      </span>
                      {hotel.price && (
                        <span className="hotel-price">₹{hotel.price}/night</span>
                      )}
                    </div>
                  </div>
                  {hotel.status === "pending" && (
                    <div className="action-buttons">
                      <button
                        className="btn btn-approve"
                        onClick={() => handleHotelAction(hotel._id, "approve")}
                        disabled={processingId === hotel._id}
                      >
                        ✓ Approve
                      </button>
                      <button
                        className="btn btn-reject"
                        onClick={() => handleHotelAction(hotel._id, "reject")}
                        disabled={processingId === hotel._id}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ✅ ===== KYC SECTION ===== */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">📄 KYC Documents ({stats.kycTotal})</h2>
          </div>

          {/* Filter Buttons */}
          <div className="filter-buttons">
            <button
              className={`filter-btn ${kycFilter === "pending" ? "active" : ""}`}
              onClick={() => setKycFilter("pending")}
            >
              ⏳ Pending ({stats.kycPending})
            </button>
            <button
              className={`filter-btn ${kycFilter === "verified" ? "active" : ""}`}
              onClick={() => setKycFilter("verified")}
            >
              ✅ Verified ({stats.kycVerified})
            </button>
            <button
              className={`filter-btn ${kycFilter === "rejected" ? "active" : ""}`}
              onClick={() => setKycFilter("rejected")}
            >
              ❌ Rejected ({stats.kycRejected})
            </button>
            <button
              className={`filter-btn ${kycFilter === "all" ? "active" : ""}`}
              onClick={() => setKycFilter("all")}
            >
              📋 All ({stats.kycTotal})
            </button>
          </div>

          {filteredKyc.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📄</div>
              <h3 className="empty-title">No KYC Documents</h3>
              <p className="empty-text">No KYC documents found in this category</p>
            </div>
          ) : (
            <div className="cards-list">
              {filteredKyc.map((kyc) => (
                <div key={kyc._id} className="manager-card">
                  <div className="manager-content">
                    <div className="manager-name">{kyc.fullName}</div>
                    <div className="manager-details">
                      <div className="detail-item">📧 {kyc.email}</div>
                      {kyc.govtIdDocument && (
                        <a
                          href={kyc.govtIdDocument}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="kyc-document-link"
                        >
                          📸 View Document
                        </a>
                      )}
                      <span className={`status-badge status-${kyc.kycStatus}`}>
                        {kyc.kycStatus}
                      </span>
                    </div>
                  </div>
                  {kyc.kycStatus === "pending" && (
                    <div className="action-buttons">
                      <button
                        className="btn btn-approve"
                        onClick={() =>
                          handleKycAction(kyc._id, "verify")
                        }
                        disabled={processingId === kyc._id}
                      >
                        ✓ Verify
                      </button>
                      <button
                        className="btn btn-reject"
                        onClick={() =>
                          handleKycAction(kyc._id, "reject")
                        }
                        disabled={processingId === kyc._id}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;