import { createContext, useContext, useState, useEffect } from "react";

const ManagerAuthContext = createContext();

export const useManagerAuth = () => useContext(ManagerAuthContext);

export const ManagerAuthProvider = ({ children }) => {
  const [managerToken, setManagerToken] = useState(localStorage.getItem("managerToken") || null);
  const [managerProfile, setManagerProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // whenever token changes, fetch fresh profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!managerToken) {
        setManagerProfile(null);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("http://localhost:5001/api/managers/me", {
          headers: { Authorization: `Bearer ${managerToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setManagerProfile(data);
        } else {
          // token invalid/expired
          logoutManager();
        }
      } catch (error) {
        console.error("Failed to fetch manager profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [managerToken]);

  const loginManager = (token, profile) => {
    localStorage.setItem("managerToken", token);
    setManagerToken(token);
    setManagerProfile(profile);
  };

  const logoutManager = () => {
    localStorage.removeItem("managerToken");
    setManagerToken(null);
    setManagerProfile(null);
  };

  return (
    <ManagerAuthContext.Provider
      value={{ managerToken, managerProfile, setManagerProfile, loginManager, logoutManager, loading }}
    >
      {children}
    </ManagerAuthContext.Provider>
  );
};