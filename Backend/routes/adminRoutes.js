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
  verifyKyc,
  rejectKyc,
} from "../controllers/adminController.js";

const router = express.Router();

// Every single route here is protected — no public routes in this file.
router.get("/managers", adminAuth, getAllManagers);
router.put("/managers/:id/approve", adminAuth, approveManager);
router.put("/managers/:id/reject", adminAuth, rejectManager);

router.get("/hotels", adminAuth, getAllHotels);
router.put("/hotels/:id/approve", adminAuth, approveHotel);
router.put("/hotels/:id/reject", adminAuth, rejectHotel);

router.get("/users", adminAuth, getAllUsers);

router.put("/kyc/:managerId/verify", adminAuth, verifyKyc);
router.put("/kyc/:managerId/reject", adminAuth, rejectKyc);

export default router;