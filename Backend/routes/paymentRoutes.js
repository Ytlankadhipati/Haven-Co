import express from "express";
import { createOrder, verifyPayment } from "../controllers/paymentController.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

router.post("/create-order", userAuth, createOrder);
router.post("/verify", userAuth, verifyPayment);

export default router;
