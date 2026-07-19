import RoomType from "../models/RoomType.js";
import Hotel from "../models/Hotel.js";

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
    } = req.body;

    if (!hotelId || !roomTypeName || !pricePerNight || !totalRoomsOfThisType) {
      return res.status(400).json({
        message: "hotelId, roomTypeName, pricePerNight, and totalRoomsOfThisType are required",
      });
    }

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

    const updatable = [
      "roomTypeName",
      "pricePerNight",
      "originalPrice",
      "maxOccupancy",
      "totalRoomsOfThisType",
    ];
    updatable.forEach((field) => {
      if (req.body[field] !== undefined) {
        roomType[field] = req.body[field];
      }
    });

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