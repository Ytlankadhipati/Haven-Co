import Booking from "../models/Booking.js";
import RoomType from "../models/RoomType.js";
import Hotel from "../models/Hotel.js";

// POST /api/bookings — create a pending booking (before payment)
export const createBooking = async (req, res) => {
  try {
    const { userId, hotelId, roomTypeId, checkIn, checkOut, numberOfGuests } = req.body;

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

    const roomType = await RoomType.findById(roomTypeId);
    if (!roomType) {
      return res.status(404).json({ message: "Room type not found" });
    }

    if (numberOfGuests > roomType.maxOccupancy) {
      return res.status(400).json({
        message: `This room type only allows up to ${roomType.maxOccupancy} guests`,
      });
    }

    // Availability check: count non-cancelled bookings for this room type
    // whose date range overlaps the requested dates
    const overlappingBookings = await Booking.countDocuments({
      roomTypeId,
      status: { $ne: "cancelled" },
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate },
    });

    if (overlappingBookings >= roomType.totalRoomsOfThisType) {
      return res.status(409).json({
        message: "No rooms of this type are available for the selected dates",
      });
    }

    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * roomType.pricePerNight;

    const booking = await Booking.create({
      userId,
      hotelId,
      roomTypeId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      numberOfGuests,
      totalPrice,
      status: "pending",
      paymentStatus: "pending",
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