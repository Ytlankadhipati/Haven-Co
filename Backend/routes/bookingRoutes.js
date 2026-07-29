import express from "express";
import {
  createBooking,
  getUserBookings,
  getManagerIncomingBookings,
  updateBookingStatus,
  cancelBooking,
} from "../controllers/bookingController.js";
import managerAuth from "../middleware/managerAuth.js";

const router = express.Router();

router.post("/", createBooking);
router.get("/user/:userId", getUserBookings);
router.get("/manager/incoming", managerAuth, getManagerIncomingBookings);
router.put("/:id/status", managerAuth, updateBookingStatus);
router.put("/:id/cancel", cancelBooking);

export default router;