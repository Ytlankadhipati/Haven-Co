import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

// POST /api/admin/login
// NOTE: There is no registerAdmin function on purpose.
// Admin accounts must be created directly in the database (e.g. via a
// one-off seed script or MongoDB Atlas), never through a public endpoint.
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      // Same generic message whether the email doesn't exist or the
      // password is wrong — don't leak which one it was.
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Signed the same way manager tokens are (same JWT_SECRET,
    // verified the same way in managerAuth.js), so adminAuth.js
    // middleware can rely on one consistent token shape.
    const token = jwt.sign(
      {
        adminId: admin._id,
        email: admin.email,
        role: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // adjust to match whatever expiry managerController.js uses
    );

    res.status(200).json({
      token,
      admin: {
        adminId: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("loginAdmin error:", error);
    res.status(500).json({ message: "Something went wrong during login" });
  }
};

// GET /api/admin/me — verify token and return current admin profile
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.adminId).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};