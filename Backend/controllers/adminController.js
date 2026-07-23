import Manager from "../models/Manager.js";
import Hotel from "../models/Hotel.js";
import User from "../models/User.js";

// ===== MANAGERS =====

// GET /api/admin/managers
export const getAllManagers = async (req, res) => {
  try {
    const managers = await Manager.find()
      .select("-password")
      .sort({ createdAt: -1 });
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
    ).select("-password");
    
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }
    
    console.log(`✅ Manager Approved: ${manager.fullName}`);
    res.status(200).json({
      message: "Manager approved successfully",
      manager
    });
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
    ).select("-password");
    
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }
    
    console.log(`❌ Manager Rejected: ${manager.fullName}`);
    res.status(200).json({
      message: "Manager rejected successfully",
      manager
    });
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
    
    console.log(`✅ Hotel Approved: ${hotel.name}`);
    res.status(200).json({
      message: "Hotel approved successfully",
      hotel
    });
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
    
    console.log(`❌ Hotel Rejected: ${hotel.name}`);
    res.status(200).json({
      message: "Hotel rejected successfully",
      hotel
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== USERS (read-only) =====

// GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== KYC REVIEW =====

// GET /api/admin/kyc?kycStatus=pending|verified|rejected|all
export const getKycDocuments = async (req, res) => {
  try {
    const { kycStatus } = req.query;
    
    // Build query: find managers who have uploaded a KYC document
    let query = {
      govtIdDocument: { $exists: true, $ne: "" }
    };
    
    // Optional filter by KYC status
    if (kycStatus && kycStatus !== "all") {
      query.kycStatus = kycStatus;
    }
    
    const managers = await Manager.find(query)
      .select("-password")
      .sort({ updatedAt: -1 });
    
    console.log(`✅ Found ${managers.length} KYC documents (filter: ${kycStatus || "all"})`);
    res.status(200).json(managers);
  } catch (error) {
    console.error("Error fetching KYC documents:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/admin/kyc/:managerId/verify
export const verifyKyc = async (req, res) => {
  try {
    const manager = await Manager.findByIdAndUpdate(
      req.params.managerId,
      { kycStatus: "verified" },
      { new: true }
    ).select("-password");
    
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }
    
    console.log(`✅ KYC Verified: ${manager.fullName}`);
    res.status(200).json({
      message: "KYC verified successfully",
      manager
    });
  } catch (error) {
    console.error("Error verifying KYC:", error);
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
    ).select("-password");
    
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }
    
    console.log(`❌ KYC Rejected: ${manager.fullName}`);
    res.status(200).json({
      message: "KYC rejected successfully",
      manager
    });
  } catch (error) {
    console.error("Error rejecting KYC:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};