import express from "express";
import { loginAdmin } from "../controllers/adminAuthController.js";

const router = express.Router();

// Public route — the only public admin route that should ever exist.
router.post("/login", loginAdmin);

export default router;