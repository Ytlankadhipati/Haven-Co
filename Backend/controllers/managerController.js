import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Manager from "../models/Manager.js";

// helper — same token-signing logic reused everywhere
const generateToken = (manager) => {
  return jwt.sign(
    { managerId: manager._id, email: manager.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// POST /api/managers/register  (email+password path — unchanged logic, just added authProvider)
export const registerManager = async (req, res) => {
  try {
    const { fullName, businessName, email, password, phone } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "fullName, email, and password are required" });
    }

    const existing = await Manager.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const manager = await Manager.create({
      fullName,
      businessName,
      email,
      password: hashedPassword,
      phone,
      authProvider: "password",
    });

    const { password: _, ...managerData } = manager.toObject();
    res.status(201).json({ message: "Registered successfully. Awaiting admin approval.", manager: managerData });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/managers/login  (email+password path — unchanged)
export const loginManager = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const manager = await Manager.findOne({ email });
    if (!manager || manager.authProvider !== "password") {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, manager.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(manager);
    const { password: _, ...managerData } = manager.toObject();
    res.status(200).json({ token, manager: managerData });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/managers/google-auth  (NEW — Google Sign-In path)
// Frontend calls this right after Firebase Google popup succeeds
export const googleAuthManager = async (req, res) => {
  try {
    const { firebaseUid, fullName, email } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({ message: "firebaseUid and email are required" });
    }

    let manager = await Manager.findOne({ firebaseUid });

    if (!manager) {
      // check if this email already registered via password method
      const existingByEmail = await Manager.findOne({ email });
      if (existingByEmail) {
        return res.status(409).json({
          message: "An account with this email already exists. Please log in with email and password.",
        });
      }

      // first-time Google manager — create new doc
      manager = await Manager.create({
        fullName: fullName || "New Manager",
        email,
        firebaseUid,
        authProvider: "google",
      });
    }

    const token = generateToken(manager);
    const { password: _, ...managerData } = manager.toObject();
    res.status(200).json({ token, manager: managerData });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/managers/me — protected
export const getManagerProfile = async (req, res) => {
  try {
    const manager = await Manager.findById(req.manager.managerId).select("-password");
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }
    res.status(200).json(manager);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};