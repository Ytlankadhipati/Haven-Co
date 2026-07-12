import { useNavigate } from "react-router-dom";
import { useManagerAuth } from "../context/ManagerAuthContext";
import "./ManagerDashboard.css";

const ManagerDashboard = () => {
  const { managerProfile, logoutManager, loading } = useManagerAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  if (!managerProfile) {
    // not logged in — redirect to auth page
    navigate("/manager/auth");
    return null;
  }

  const handleLogout = () => {
    logoutManager();
    navigate("/manager/auth");
  };

  return (
    <div className="manager-dashboard">
      <header className="dashboard-header">
        <h2>Welcome, {managerProfile.fullName}</h2>
        <button className="logout-btn" onClick={handleLogout}>
          Log Out
        </button>
      </header>

      <div className="dashboard-content">
        <div className="join-haven-banner">
          <h1>Join Haven</h1>
          <p>List your property and start welcoming guests today.</p>
          <button
            className="join-haven-btn"
            onClick={() => navigate("/manager/add-property")}
          >
            Join Haven
          </button>
        </div>

        {managerProfile.status === "pending" && (
          <p className="status-note">
            Your manager account is pending admin approval.
          </p>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;