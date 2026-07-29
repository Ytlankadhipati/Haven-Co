import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";

// helper — recompute hotel's rating + ratingCount from all its reviews
const recomputeHotelRating = async (hotelId) => {
  const reviews = await Review.find({ hotelId });
  const ratingCount = reviews.length;
  const rating =
    ratingCount > 0
      ? Number(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount).toFixed(1)
        )
      : 0;

  await Hotel.findByIdAndUpdate(hotelId, { rating, ratingCount });
};

// GET /api/reviews/hotel/:hotelId — public, list reviews for a hotel
export const getHotelReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ hotelId: req.params.hotelId }).sort({
      createdAt: -1,
    });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/reviews/eligibility/:hotelId — protected, can this user review this hotel?
export const checkReviewEligibility = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { hotelId } = req.params;

    // find a booking for this user + hotel that has finished and been paid for
    const eligibleBooking = await Booking.findOne({
      userId,
      hotelId,
      paymentStatus: "paid",
      status: { $ne: "cancelled" },
      checkOut: { $lte: new Date() },
    }).sort({ checkOut: -1 });

    if (!eligibleBooking) {
      return res.status(200).json({ eligible: false, reason: "no_completed_stay" });
    }

    const alreadyReviewed = await Review.findOne({ bookingId: eligibleBooking._id });
    if (alreadyReviewed) {
      return res.status(200).json({ eligible: false, reason: "already_reviewed" });
    }

    res.status(200).json({ eligible: true, bookingId: eligibleBooking._id });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/reviews — protected, submit a review
export const createReview = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { hotelId, bookingId, rating, comment } = req.body;

    if (!hotelId || !bookingId || !rating) {
      return res.status(400).json({ message: "hotelId, bookingId and rating are required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "rating must be between 1 and 5" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.userId !== userId) {
      return res.status(403).json({ message: "This booking does not belong to you" });
    }
    if (booking.paymentStatus !== "paid" || booking.status === "cancelled") {
      return res.status(400).json({ message: "This booking is not eligible for a review" });
    }
    if (new Date(booking.checkOut) > new Date()) {
      return res.status(400).json({ message: "You can review only after your stay is complete" });
    }

    const existing = await Review.findOne({ bookingId });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this stay" });
    }

    const review = await Review.create({
      hotelId,
      bookingId,
      userId,
      userEmail: req.user.email,
      rating,
      comment,
    });

    await recomputeHotelRating(hotelId);

    res.status(201).json(review);
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};