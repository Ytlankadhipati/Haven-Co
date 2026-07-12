import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer-not-to-say"],
    },
    maritalStatus: {
      type: String,
      enum: ["single", "married", "prefer-not-to-say"],
    },
    role: {
      type: String,
      enum: ["user", "manager", "admin"],
      default: "user",
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;