import express from "express";
import {
  registerManager,
  loginManager,
  googleAuthManager,
  getManagerProfile,
  forgotPassword,
  resetPassword,
} from "../controllers/managerController.js";
import managerAuth from "../middleware/managerAuth.js";

const router = express.Router();

router.post("/register", registerManager);
router.post("/login", loginManager);
router.post("/google-auth", googleAuthManager);
router.get("/me", managerAuth, getManagerProfile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;