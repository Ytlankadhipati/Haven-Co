// Backend/middleware/userAuth.js
// Firebase token verify karta hai — bina Admin SDK ke
// Firebase ka public endpoint use karta hai

const userAuth = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
  
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }
  
      const token = authHeader.split(" ")[1];
  
      // Firebase public key se token verify karo
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
      );
  
      if (!response.ok) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
  
      const decoded = await response.json();
  
      // decoded.sub = Firebase UID (same as firebaseUid)
      req.user = {
        uid: decoded.sub,
        email: decoded.email,
      };
  
      next();
    } catch (err) {
      console.error("User auth error:", err.message);
      res.status(401).json({ message: "Invalid or expired token" });
    }
  };
  
  export default userAuth;