import express from "express";
import { authLimiter } from "../middleware/rateLimiter.js";
import { loginAdmin, getAdminProfile } from "../controllers/adminAuthController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// Public route — the only public admin route that should ever exist.
router.post("/login", loginAdmin);
router.get("/me", adminAuth, getAdminProfile);
router.post("/login", authLimiter, loginAdmin);

export default router;