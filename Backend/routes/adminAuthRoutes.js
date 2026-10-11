import express from "express";
import { authLimiter } from "../middleware/rateLimiter.js";
import { loginAdmin, getAdminProfile } from "../controllers/adminAuthController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// Public route — rate limited
router.post("/login", authLimiter, loginAdmin);
router.get("/me", adminAuth, getAdminProfile);

export default router;