import { createContext, useContext, useState, useEffect } from "react";

const AdminAuthContext = createContext();

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
  const [adminToken, setAdminToken] = useState(localStorage.getItem("adminToken") || null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // whenever token changes, fetch fresh profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!adminToken) {
        setAdminProfile(null);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("http://localhost:5001/api/admin/me", {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAdminProfile(data);
        } else {
          // token invalid/expired
          logoutAdmin();
        }
      } catch (error) {
        console.error("Failed to fetch admin profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [adminToken]);

  const loginAdmin = (token, profile) => {
    localStorage.setItem("adminToken", token);
    setAdminToken(token);
    setAdminProfile(profile);
  };

  const logoutAdmin = () => {
    localStorage.removeItem("adminToken");
    setAdminToken(null);
    setAdminProfile(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{ adminToken, adminProfile, setAdminProfile, loginAdmin, logoutAdmin, loading }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};