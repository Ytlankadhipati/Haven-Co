import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // bcrypt hash — never store plain text
    role: { type: String, default: "admin", immutable: true },
  },
  { timestamps: true }
);

export default mongoose.model("Admin", adminSchema);