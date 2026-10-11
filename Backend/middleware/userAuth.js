// Backend/middleware/userAuth.js
import { firebaseAuth } from "../firebase/firebaseAdmin.js";

const userAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "A Firebase Bearer token is required." });
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    return res.status(401).json({ message: "A Firebase Bearer token is required." });
  }

  if (!firebaseAuth) {
    return res.status(503).json({ message: "Firebase authentication is not configured on the server." });
  }

  try {
    const decoded = await firebaseAuth.verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email || "" };
    return next();
  } catch (error) {
    console.error(`Firebase token verification failed: ${error?.message || "Unknown verification error"}`);
    return res.status(401).json({ message: "Firebase authentication failed. Please sign in again." });
  }
};

export default userAuth;
