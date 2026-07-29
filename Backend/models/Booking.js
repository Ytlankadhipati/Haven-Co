import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Firebase UID of the user who booked
      required: true,
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    roomTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoomType",
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    numberOfGuests: {
      type: Number,
      required: true,
      min: 1,
    },
    // how many rooms/beds of this roomType this single booking occupies
    // (e.g. a family booking 2 Deluxe rooms, or a group booking 4 dorm beds)
    unitsBooked: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    // "online" = booked by a guest through the app
    // "offline" = manager entered it manually (walk-in, phone booking, etc.)
    source: {
      type: String,
      enum: ["online", "offline"],
      default: "online",
    },
    // only used for offline bookings, since there's no Firebase user to look up
    guestName: {
      type: String,
      trim: true,
    },
    guestPhone: {
      type: String,
      trim: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;