import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import RoomType from "../models/RoomType.js";
import Hotel from "../models/Hotel.js";

// shared helper: how many units of this roomType are already booked
// (non-cancelled) for a date range that overlaps [checkInDate, checkOutDate)
const getOverlappingBookedUnits = async (roomTypeId, checkInDate, checkOutDate) => {
  const result = await Booking.aggregate([
    {
      $match: {
        roomTypeId: new mongoose.Types.ObjectId(roomTypeId),
        status: { $ne: "cancelled" },
        checkIn: { $lt: checkOutDate },
        checkOut: { $gt: checkInDate },
      },
    },
    { $group: { _id: null, totalUnits: { $sum: "$unitsBooked" } } },
  ]);
  return result[0]?.totalUnits || 0;
};

// POST /api/bookings — create a pending booking (before payment), guest-facing
export const createBooking = async (req, res) => {
  try {
    const { userId, hotelId, roomTypeId, checkIn, checkOut, numberOfGuests, unitsBooked } = req.body;

    if (!userId || !hotelId || !roomTypeId || !checkIn || !checkOut || !numberOfGuests) {
      return res.status(400).json({
        message: "userId, hotelId, roomTypeId, checkIn, checkOut, and numberOfGuests are all required",
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ message: "checkOut must be after checkIn" });
    }

    const requestedUnits = unitsBooked ? Number(unitsBooked) : 1;
    if (!Number.isInteger(requestedUnits) || requestedUnits < 1) {
      return res.status(400).json({ message: "unitsBooked must be a positive whole number" });
    }

    const roomType = await RoomType.findById(roomTypeId);
    if (!roomType) {
      return res.status(404).json({ message: "Room type not found" });
    }

    if (numberOfGuests > roomType.maxOccupancy * requestedUnits) {
      return res.status(400).json({
        message: `This room type only allows up to ${roomType.maxOccupancy} guests per unit`,
      });
    }

    // Availability check: sum unitsBooked across overlapping non-cancelled bookings
    const bookedUnits = await getOverlappingBookedUnits(roomTypeId, checkInDate, checkOutDate);

    if (bookedUnits + requestedUnits > roomType.totalRoomsOfThisType) {
      return res.status(409).json({
        message: "Not enough rooms of this type are available for the selected dates",
      });
    }

    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * roomType.pricePerNight * requestedUnits;

    const booking = await Booking.create({
      userId,
      hotelId,
      roomTypeId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      numberOfGuests,
      unitsBooked: requestedUnits,
      source: "online",
      totalPrice,
      status: "pending",
      paymentStatus: "pending",
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/bookings/offline — protected, manager manually logs a walk-in/phone booking
export const createOfflineBooking = async (req, res) => {
  try {
    const { hotelId, roomTypeId, checkIn, checkOut, numberOfGuests, unitsBooked, guestName, guestPhone } = req.body;

    if (!hotelId || !roomTypeId || !checkIn || !checkOut || !numberOfGuests || !guestName) {
      return res.status(400).json({
        message: "hotelId, roomTypeId, checkIn, checkOut, numberOfGuests, and guestName are all required",
      });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    if (hotel.managerId !== req.manager.managerId) {
      return res.status(403).json({ message: "You are not authorized to manage bookings for this hotel" });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ message: "checkOut must be after checkIn" });
    }

    const requestedUnits = unitsBooked ? Number(unitsBooked) : 1;
    if (!Number.isInteger(requestedUnits) || requestedUnits < 1) {
      return res.status(400).json({ message: "unitsBooked must be a positive whole number" });
    }

    const roomType = await RoomType.findById(roomTypeId);
    if (!roomType || String(roomType.hotelId) !== String(hotelId)) {
      return res.status(404).json({ message: "Room type not found for this hotel" });
    }

    const bookedUnits = await getOverlappingBookedUnits(roomTypeId, checkInDate, checkOutDate);

    if (bookedUnits + requestedUnits > roomType.totalRoomsOfThisType) {
      return res.status(409).json({
        message: "Not enough rooms of this type are available for the selected dates",
      });
    }

    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * roomType.pricePerNight * requestedUnits;

    const booking = await Booking.create({
      userId: "offline",
      hotelId,
      roomTypeId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      numberOfGuests,
      unitsBooked: requestedUnits,
      source: "offline",
      guestName,
      guestPhone,
      totalPrice,
      status: "confirmed",
      paymentStatus: "paid",
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/bookings/user/:userId — a user's own booking history
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId })
      .populate("hotelId", "name location images")
      .populate("roomTypeId", "roomTypeName pricePerNight")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/bookings/manager/incoming — protected, all bookings across a manager's hotels
export const getManagerIncomingBookings = async (req, res) => {
  try {
    const hotels = await Hotel.find({ managerId: req.manager.managerId }).select("_id");
    const hotelIds = hotels.map((h) => h._id);

    const bookings = await Booking.find({ hotelId: { $in: hotelIds } })
      .populate("hotelId", "name location")
      .populate("roomTypeId", "roomTypeName pricePerNight")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/bookings/hotel/:hotelId/occupancy — protected, current occupied/vacant
// count per room type for a manager's hotel (right now, i.e. today falls in [checkIn, checkOut))
export const getHotelOccupancy = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    if (hotel.managerId !== req.manager.managerId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const roomTypes = await RoomType.find({ hotelId: hotel._id });
    const now = new Date();

    const occupancy = await Promise.all(
      roomTypes.map(async (rt) => {
        const occupiedUnits = await getOverlappingBookedUnits(rt._id, now, now);
        return {
          roomTypeId: rt._id,
          roomTypeName: rt.roomTypeName,
          roomCategory: rt.roomCategory,
          totalUnits: rt.totalRoomsOfThisType,
          occupiedUnits,
          vacantUnits: Math.max(rt.totalRoomsOfThisType - occupiedUnits, 0),
        };
      })
    );

    res.status(200).json(occupancy);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/bookings/:id/status — protected, manager accepts/rejects a pending booking
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["confirmed", "cancelled", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const hotel = await Hotel.findById(booking.hotelId);
    if (hotel.managerId !== req.manager.managerId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/bookings/:id/cancel — user cancels their own booking
export const cancelBooking = async (req, res) => {
  try {
    const { userId } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ message: "You can only cancel your own bookings" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};