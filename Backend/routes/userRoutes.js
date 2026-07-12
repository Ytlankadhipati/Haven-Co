import express from "express";
import { syncUser, updateProfile, getUser } from "../controllers/userController.js";

const router = express.Router();

router.post("/sync", syncUser);
router.put("/profile", updateProfile);
router.get("/:firebaseUid", getUser);

export default router;