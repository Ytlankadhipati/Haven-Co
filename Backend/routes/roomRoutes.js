import express from "express";
import {
  createRoomType,
  getRoomTypesByHotel,
  getRoomTypeById,
  updateRoomType,
  deleteRoomType,
} from "../controllers/roomController.js";
import upload from "../middleware/upload.js";
import managerAuth from "../middleware/managerAuth.js";

const router = express.Router();

router.post("/", managerAuth, upload.array("images", 5), createRoomType);
router.get("/hotel/:hotelId", getRoomTypesByHotel);
router.get("/:id", getRoomTypeById);
router.put("/:id", managerAuth, upload.array("images", 5), updateRoomType);
router.delete("/:id", managerAuth, deleteRoomType);

export default router;