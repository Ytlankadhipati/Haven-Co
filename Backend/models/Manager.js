import mongoose from "mongoose";

const managerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    businessName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      // required only for email+password managers — Google managers won't have this
      required: function () {
        return this.authProvider === "password";
      },
    },
    firebaseUid: {
      type: String, // set only if manager signed up via Google
      unique: true,
      sparse: true, // allows multiple docs with firebaseUid: null/undefined
    },
    authProvider: {
      type: String,
      enum: ["password", "google"],
      required: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    resetPasswordToken: {
      type: String,
    },
    
    resetPasswordExpires: {
      type: Date,
    },
    govtIdDocument: {
      type: String,
      default: "",
    },
    kycStatus: {
      type: String,
      enum: ["not_submitted", "pending", "verified", "rejected"],
      default: "not_submitted",
    },
  },
  { timestamps: true }
);

const Manager = mongoose.model("Manager", managerSchema);

export default Manager;