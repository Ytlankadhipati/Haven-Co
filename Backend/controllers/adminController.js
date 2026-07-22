import Manager from "../models/Manager.js";
import Hotel from "../models/Hotel.js";
import User from "../models/User.js";

// ===== MANAGERS =====

// GET /api/admin/managers
export const getAllManagers = async (req, res) => {
  try {
    const managers = await Manager.find().sort({ createdAt: -1 });
    res.status(200).json(managers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/admin/managers/:id/approve
export const approveManager = async (req, res) => {
  try {
    const manager = await Manager.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }
    res.status(200).json(manager);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/admin/managers/:id/reject
export const rejectManager = async (req, res) => {
  try {
    const manager = await Manager.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }
    res.status(200).json(manager);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== HOTELS =====

// GET /api/admin/hotels — no status filter, admin sees everything
export const getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find().sort({ createdAt: -1 });
    res.status(200).json(hotels);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/admin/hotels/:id/approve
export const approveHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    res.status(200).json(hotel);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/admin/hotels/:id/reject
export const rejectHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    res.status(200).json(hotel);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== USERS (read-only) =====

// GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== KYC REVIEW =====

// PUT /api/admin/kyc/:managerId/verify
export const verifyKyc = async (req, res) => {
  try {
    const manager = await Manager.findByIdAndUpdate(
      req.params.managerId,
      { kycStatus: "verified" },
      { new: true }
    );
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }
    res.status(200).json(manager);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/admin/kyc/:managerId/reject
export const rejectKyc = async (req, res) => {
  try {
    const manager = await Manager.findByIdAndUpdate(
      req.params.managerId,
      { kycStatus: "rejected" },
      { new: true }
    );
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }
    res.status(200).json(manager);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};