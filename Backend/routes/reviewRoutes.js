import express from "express";
import {
  getHotelReviews,
  checkReviewEligibility,
  createReview,
} from "../controllers/reviewController.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

router.get("/hotel/:hotelId", getHotelReviews);
router.get("/eligibility/:hotelId", userAuth, checkReviewEligibility);
router.post("/", userAuth, createReview);

export default router;