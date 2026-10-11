import express from "express";
import {
  createBooking,
  createOfflineBooking,
  getUserBookings,
  getManagerIncomingBookings,
  getHotelOccupancy,
  updateBookingStatus,
  cancelBooking,
} from "../controllers/bookingController.js";
import managerAuth from "../middleware/managerAuth.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

router.post("/", createBooking);
router.post("/offline", managerAuth, createOfflineBooking);
router.get("/user/:userId", userAuth, getUserBookings);
router.get("/manager/incoming", managerAuth, getManagerIncomingBookings);
router.get("/hotel/:hotelId/occupancy", managerAuth, getHotelOccupancy);
router.put("/:id/status", managerAuth, updateBookingStatus);
router.put("/:id/cancel", userAuth, cancelBooking);

export default router;