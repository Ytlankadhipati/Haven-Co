// Run this ONCE, manually, from the Backend folder:
//   node scripts/seedAdmin.js
//
// It creates a single admin account directly in the database.
// This is intentional — there is no public admin registration endpoint,
// so this script (or editing MongoDB Atlas by hand) is the only way
// to create admin accounts.

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import Admin from "../models/Admin.js";

dotenv.config();

const ADMIN_FULL_NAME = "HavenCO Admin";
const ADMIN_EMAIL = "admin@havenco.com";
const ADMIN_PASSWORD = "admin@gmail"; // change this before running, and again after first login

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existing = await Admin.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log("An admin with this email already exists. Aborting.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const admin = await Admin.create({
      fullName: ADMIN_FULL_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
    });

    console.log("Admin created successfully:");
    console.log({ email: admin.email, id: admin._id.toString() });
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed admin:", error);
    process.exit(1);
  }
};

seedAdmin();