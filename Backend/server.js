import paymentRoutes from "./routes/paymentRoutes.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import managerRoutes from "./routes/managerRoutes.js";
import hotelRoutes from "./routes/hotelRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

dotenv.config();
connectDB();

const app = express();
const defaultClientUrls = [
  "http://localhost:5173",
  "https://haven-co-rose.vercel.app",
];
const clientUrls = (process.env.CLIENT_URLS || defaultClientUrls.join(","))
  .split(",")
  .map((url) => url.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Requests without an Origin header (such as server-to-server or health checks) are allowed.
      if (!origin || clientUrls.includes(origin.replace(/\/$/, ""))) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("HavenCO backend is running 🚀");
});

app.use("/api/users", userRoutes);
app.use("/api/managers", managerRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes); 
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
// Global error handler — catches errors from multer/cloudinary/etc that would otherwise return HTML
app.use((err, req, res, next) => {
  console.error("Request failed:", err?.message || "Unknown server error");
  if (res.headersSent) return next(err);
  res.status(500).json({ message: err.message || "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("HavenCO backend is listening.");
});
