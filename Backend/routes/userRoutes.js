import express from "express";
import { syncUser, updateProfile, getUser } from "../controllers/userController.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

router.post("/sync", syncUser);
router.put("/profile", userAuth, updateProfile);
router.get("/:firebaseUid", getUser);

export default router;