import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const API_BASE = "http://localhost:5001/api/users";

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Pull the saved MongoDB profile (has fullName, etc.)
        try {
          const res = await fetch(`${API_BASE}/${user.uid}`);
          if (res.ok) {
            const data = await res.json();
            setProfile(data);
          }
        } catch (err) {
          console.error("Failed to load profile:", err);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = () => signOut(auth);

  const value = { currentUser, profile, setProfile, loading, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};