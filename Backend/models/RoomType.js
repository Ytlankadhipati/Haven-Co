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