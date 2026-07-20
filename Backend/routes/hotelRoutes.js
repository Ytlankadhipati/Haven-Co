import express from "express";
import {
  createHotel,
  getHotels,
  getHotelsByManager,
  getHotelById,
  updateHotel,
  deleteHotel,
} from "../controllers/hotelController.js";
import managerAuth from "../middleware/managerAuth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/", managerAuth, upload.array("images", 10), createHotel);
router.get("/", getHotels);
router.get("/manager/:managerId", getHotelsByManager);
router.get("/:id", getHotelById);
router.put("/:id", managerAuth, upload.array("images", 10), updateHotel);
router.delete("/:id", managerAuth, deleteHotel);

export default router;