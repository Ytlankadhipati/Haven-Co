import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import {
  getAllManagers,
  approveManager,
  rejectManager,
  getAllHotels,
  approveHotel,
  rejectHotel,
  getAllUsers,
  getKycDocuments,      // ✅ MUST BE IMPORTED
  verifyKyc,
  rejectKyc,
} from "../controllers/adminController.js";

const router = express.Router();

// Managers
router.get("/managers", adminAuth, getAllManagers);
router.put("/managers/:id/approve", adminAuth, approveManager);
router.put("/managers/:id/reject", adminAuth, rejectManager);

// Hotels
router.get("/hotels", adminAuth, getAllHotels);
router.put("/hotels/:id/approve", adminAuth, approveHotel);
router.put("/hotels/:id/reject", adminAuth, rejectHotel);

// Users
router.get("/users", adminAuth, getAllUsers);

// KYC — ✅ ALL THREE ROUTES MUST EXIST
router.get("/kyc", adminAuth, getKycDocuments);
router.put("/kyc/:managerId/verify", adminAuth, verifyKyc);
router.put("/kyc/:managerId/reject", adminAuth, rejectKyc);

export default router;