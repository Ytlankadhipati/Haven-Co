import express from "express";
import {
  createHotel,
  getHotels,
  getHotelsByManager,
  getHotelById,
} from "../controllers/hotelController.js";
import upload from "../middleware/upload.js";
import managerAuth from "../middleware/managerAuth.js";

const router = express.Router();

router.post("/", managerAuth, upload.array("images", 10), createHotel);
router.get("/", getHotels);
router.get("/manager/:managerId", getHotelsByManager);
router.get("/:id", getHotelById);

export default router;