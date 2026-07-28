import express from "express";
import { updateManagerProfile } from "../controllers/managerController.js";
import {
  registerManager,
  loginManager,
  googleAuthManager,
  getManagerProfile,
  forgotPassword,
  resetPassword,
  uploadKyc,

} from "../controllers/managerController.js";
import managerAuth from "../middleware/managerAuth.js";
import upload from "../middleware/upload.js";

import { authLimiter, forgotPasswordLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/register", authLimiter, registerManager);
router.post("/login", authLimiter, loginManager);
router.post("/google-auth", googleAuthManager);
router.get("/me", managerAuth, getManagerProfile);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);
router.post("/upload-kyc", managerAuth, upload.single("document"), uploadKyc);
router.put("/:id", managerAuth, updateManagerProfile);


export default router;