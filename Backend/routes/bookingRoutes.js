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

const router = express.Router();

router.post("/", createBooking);
router.post("/offline", managerAuth, createOfflineBooking);
router.get("/user/:userId", getUserBookings);
router.get("/manager/incoming", managerAuth, getManagerIncomingBookings);
router.get("/hotel/:hotelId/occupancy", managerAuth, getHotelOccupancy);
router.put("/:id/status", managerAuth, updateBookingStatus);
router.put("/:id/cancel", cancelBooking);

export default router;