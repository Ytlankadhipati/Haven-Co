import RoomType from "../models/RoomType.js";
import Hotel from "../models/Hotel.js";

const VALID_ROOM_CATEGORIES = ["Private", "Dormitory", "EntirePlace"];
const VALID_BATHROOM_TYPES = ["Private", "Shared"];

// form-data sends booleans as strings ("true"/"false"), so parse safely
const parseBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return false;
};

// POST /api/rooms
export const createRoomType = async (req, res) => {
  try {
    const {
      hotelId,
      roomTypeName,
      pricePerNight,
      originalPrice,
      maxOccupancy,
      totalRoomsOfThisType,
      roomAmenities,
      roomCategory,
      isAC,
      bedsPerUnit,
      bathroomType,
    } = req.body;

    if (!hotelId || !roomTypeName || !pricePerNight || !totalRoomsOfThisType) {
      return res.status(400).json({
        message: "hotelId, roomTypeName, pricePerNight, and totalRoomsOfThisType are required",
      });
    }

    if (isNaN(pricePerNight) || Number(pricePerNight) <= 0) {
      return res.status(400).json({ message: "pricePerNight must be a positive number" });
    }
    if (!Number.isInteger(Number(totalRoomsOfThisType)) || Number(totalRoomsOfThisType) <= 0) {
      return res.status(400).json({ message: "totalRoomsOfThisType must be a positive whole number" });
    }
    if (maxOccupancy !== undefined && (!Number.isInteger(Number(maxOccupancy)) || Number(maxOccupancy) <= 0)) {
      return res.status(400).json({ message: "maxOccupancy must be a positive whole number" });
    }

    // --- new field validation ---
    let resolvedRoomCategory = "Private";
    if (roomCategory !== undefined) {
      if (!VALID_ROOM_CATEGORIES.includes(roomCategory)) {
        return res.status(400).json({
          message: `roomCategory must be one of: ${VALID_ROOM_CATEGORIES.join(", ")}`,
        });
      }
      resolvedRoomCategory = roomCategory;
    }

    if (bathroomType !== undefined && !VALID_BATHROOM_TYPES.includes(bathroomType)) {
      return res.status(400).json({
        message: `bathroomType must be one of: ${VALID_BATHROOM_TYPES.join(", ")}`,
      });
    }

    let resolvedBedsPerUnit = 1;
    if (resolvedRoomCategory === "Dormitory") {
      if (bedsPerUnit === undefined || !Number.isInteger(Number(bedsPerUnit)) || Number(bedsPerUnit) < 1) {
        return res.status(400).json({
          message: "bedsPerUnit is required and must be a positive whole number for Dormitory rooms",
        });
      }
      resolvedBedsPerUnit = Number(bedsPerUnit);
    } else if (bedsPerUnit !== undefined) {
      if (!Number.isInteger(Number(bedsPerUnit)) || Number(bedsPerUnit) < 1) {
        return res.status(400).json({ message: "bedsPerUnit must be a positive whole number" });
      }
      resolvedBedsPerUnit = Number(bedsPerUnit);
    }
    // --- end new field validation ---

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    if (hotel.managerId !== req.manager.managerId) {
      return res.status(403).json({ message: "You are not authorized to add rooms to this hotel" });
    }

    const imageUrls = req.files ? req.files.map((file) => file.path) : [];

    const roomType = await RoomType.create({
      hotelId,
      roomTypeName,
      pricePerNight,
      originalPrice,
      maxOccupancy,
      totalRoomsOfThisType,
      roomAmenities: roomAmenities ? JSON.parse(roomAmenities) : [],
      images: imageUrls,
      roomCategory: resolvedRoomCategory,
      isAC: parseBoolean(isAC),
      bedsPerUnit: resolvedBedsPerUnit,
      bathroomType: bathroomType || "Private",
    });

    hotel.roomTypes.push(roomType._id);
    await hotel.save();

    res.status(201).json(roomType);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/rooms/hotel/:hotelId — public
export const getRoomTypesByHotel = async (req, res) => {
  try {
    const roomTypes = await RoomType.find({ hotelId: req.params.hotelId }).sort({ pricePerNight: 1 });
    res.status(200).json(roomTypes);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/rooms/:id — public
export const getRoomTypeById = async (req, res) => {
  try {
    const roomType = await RoomType.findById(req.params.id);
    if (!roomType) {
      return res.status(404).json({ message: "Room type not found" });
    }
    res.status(200).json(roomType);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/rooms/:id — protected
export const updateRoomType = async (req, res) => {
  try {
    const roomType = await RoomType.findById(req.params.id);
    if (!roomType) {
      return res.status(404).json({ message: "Room type not found" });
    }

    const hotel = await Hotel.findById(roomType.hotelId);
    if (hotel.managerId !== req.manager.managerId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (req.body.pricePerNight !== undefined && (isNaN(req.body.pricePerNight) || Number(req.body.pricePerNight) <= 0)) {
      return res.status(400).json({ message: "pricePerNight must be a positive number" });
    }
    if (req.body.totalRoomsOfThisType !== undefined && (!Number.isInteger(Number(req.body.totalRoomsOfThisType)) || Number(req.body.totalRoomsOfThisType) <= 0)) {
      return res.status(400).json({ message: "totalRoomsOfThisType must be a positive whole number" });
    }

    // --- new field validation ---
    if (req.body.roomCategory !== undefined && !VALID_ROOM_CATEGORIES.includes(req.body.roomCategory)) {
      return res.status(400).json({
        message: `roomCategory must be one of: ${VALID_ROOM_CATEGORIES.join(", ")}`,
      });
    }
    if (req.body.bathroomType !== undefined && !VALID_BATHROOM_TYPES.includes(req.body.bathroomType)) {
      return res.status(400).json({
        message: `bathroomType must be one of: ${VALID_BATHROOM_TYPES.join(", ")}`,
      });
    }

    const effectiveRoomCategory = req.body.roomCategory !== undefined ? req.body.roomCategory : roomType.roomCategory;

    if (req.body.bedsPerUnit !== undefined) {
      if (!Number.isInteger(Number(req.body.bedsPerUnit)) || Number(req.body.bedsPerUnit) < 1) {
        return res.status(400).json({ message: "bedsPerUnit must be a positive whole number" });
      }
    } else if (effectiveRoomCategory === "Dormitory" && !roomType.bedsPerUnit) {
      return res.status(400).json({
        message: "bedsPerUnit is required for Dormitory rooms",
      });
    }
    // --- end new field validation ---

    const updatable = [
      "roomTypeName",
      "pricePerNight",
      "originalPrice",
      "maxOccupancy",
      "totalRoomsOfThisType",
      "roomCategory",
      "bedsPerUnit",
      "bathroomType",
    ];
    updatable.forEach((field) => {
      if (req.body[field] !== undefined) {
        roomType[field] = req.body[field];
      }
    });

    if (req.body.isAC !== undefined) {
      roomType.isAC = parseBoolean(req.body.isAC);
    }

    if (req.body.roomAmenities !== undefined) {
      roomType.roomAmenities = JSON.parse(req.body.roomAmenities);
    }

    if (req.files && req.files.length > 0) {
      roomType.images = req.files.map((file) => file.path);
    }

    await roomType.save();
    res.status(200).json(roomType);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/rooms/:id — protected
export const deleteRoomType = async (req, res) => {
  try {
    const roomType = await RoomType.findById(req.params.id);
    if (!roomType) {
      return res.status(404).json({ message: "Room type not found" });
    }

    const hotel = await Hotel.findById(roomType.hotelId);
    if (hotel.managerId !== req.manager.managerId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await RoomType.findByIdAndDelete(req.params.id);
    await Hotel.findByIdAndUpdate(hotel._id, { $pull: { roomTypes: roomType._id } });

    res.status(200).json({ message: "Room type deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};