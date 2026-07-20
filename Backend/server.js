import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import managerRoutes from "./routes/managerRoutes.js";
import hotelRoutes from "./routes/hotelRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("HavenCO backend is running 🚀");
});

app.use("/api/users", userRoutes);
app.use("/api/managers", managerRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/admin", adminAuthRoutes);

// Global error handler — catches errors from multer/cloudinary/etc that would otherwise return HTML
app.use((err, req, res, next) => {
  console.error("Global error handler caught:", err);
  res.status(500).json({ message: err.message || "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});