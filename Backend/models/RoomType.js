import mongoose from "mongoose";

const roomTypeSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    roomTypeName: {
      type: String,
      required: true,
      trim: true,
    },
    // Private = normal hotel-style room (Standard/Deluxe/Suite etc.)
    // Dormitory = shared room booked bed-by-bed
    // EntirePlace = whole homestay/home booked as one unit
    roomCategory: {
      type: String,
      enum: ["Private", "Dormitory", "EntirePlace"],
      default: "Private",
    },
    // AC vs Normal — applies to both Private rooms and Dormitory
    isAC: {
      type: Boolean,
      default: false,
    },
    // Only relevant when roomCategory === "Dormitory"
    // e.g. 6 means it's a 6-bed dorm room
    bedsPerUnit: {
      type: Number,
      min: 1,
      default: 1,
      validate: {
        validator: function (value) {
          if (this.roomCategory === "Dormitory") {
            return value && value >= 1;
          }
          return true;
        },
        message: "bedsPerUnit is required and must be at least 1 for Dormitory rooms",
      },
    },
    bathroomType: {
      type: String,
      enum: ["Private", "Shared"],
      default: "Private",
    },
    pricePerNight: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
    },
    maxOccupancy: {
      type: Number,
      required: true,
      default: 2,
    },
    totalRoomsOfThisType: {
      type: Number,
      required: true,
      min: 1,
    },
    roomAmenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("RoomType", roomTypeSchema);