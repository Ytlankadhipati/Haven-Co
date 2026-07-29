import razorpayInstance from "../config/razorpay.js";
import crypto from "crypto";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Manager from "../models/Manager.js";
import User from "../models/User.js";
import RoomType from "../models/RoomType.js";
import { sendEmail } from "../utils/notificationService.js";
// 
import {
  userBookingEmail,
  managerBookingEmail,
} from "../utils/emailTemplates.js";

// POST /api/payments/create-order
export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees (e.g. 1500)

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "A valid amount is required" });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay needs amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create order error (full):", JSON.stringify(error, null, 2));
    res.status(500).json({ message: "Failed to create order", error: error.message });
  }
};

// POST /api/payments/verify
// Now also takes bookingId so we can flip the booking to paid/confirmed
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification details" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed. Signature mismatch." });
    }

    // Signature matches — payment is genuine. Update the booking if one was passed.
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (booking) {
        booking.paymentStatus = "paid";
        booking.status = "confirmed";
        booking.razorpayOrderId = razorpay_order_id;
        booking.razorpayPaymentId = razorpay_payment_id;
        await booking.save();

        // Fetch hotel, manager, room type, and user details for the emails
        const hotel = await Hotel.findById(booking.hotelId);
        const manager = hotel ? await Manager.findById(hotel.managerId) : null;
        const roomType = await RoomType.findById(booking.roomTypeId);
        // booking.userId stores the Firebase UID, not the Mongo _id
        const user = await User.findOne({ firebaseUid: booking.userId });

        // Build a readable full address once, reused by both emails
        const fullAddress = [
          hotel?.address?.buildingNo,
          hotel?.address?.near,
          hotel?.address?.road,
          hotel?.address?.city,
          hotel?.address?.state,
          hotel?.address?.zipCode,
        ]
          .filter(Boolean)
          .join(", ") || hotel?.location || "N/A";

        // 1. Email to the user
        if (user?.email) {
          await sendEmail(
            user.email,
            "Payment Successful - Your Hotel is Booked!",
            userBookingEmail({
              userName: user.fullName,
              hotelName: hotel?.name || "N/A",
              location: hotel?.address?.city || hotel?.location || "N/A",
              address: fullAddress,
              roomType: roomType?.roomTypeName || "N/A",
              rooms: booking.unitsBooked || 1,
              bookingId: booking._id.toString(),
              paymentId: razorpay_payment_id,
              paymentStatus: "Paid",
              hotelPhone: manager?.phone || "N/A",
              hotelEmail: manager?.email || "",
              supportPhone: process.env.SUPPORT_PHONE || "",
              supportEmail: process.env.SUPPORT_EMAIL || "",
              bookingDate: new Date().toDateString(),
              checkIn: booking.checkIn.toDateString(),
              checkOut: booking.checkOut.toDateString(),
              guests: booking.numberOfGuests,
              totalPrice: booking.totalPrice,
              latitude: hotel?.address?.latitude,
              longitude: hotel?.address?.longitude,
            })
          );
        }

        // 2. Email to the manager
        if (manager?.email) {
          await sendEmail(
            manager.email,
            "New Booking Request Received",
            managerBookingEmail({
              hotelName: hotel?.name || "N/A",
              address: fullAddress,
              guestName: user?.fullName || booking.guestName || "Registered User",
              guestEmail: user?.email || "N/A",
              guestPhone: booking.guestPhone || "",
              bookingId: booking._id.toString(),
              paymentId: razorpay_payment_id,
              roomType: roomType?.roomTypeName || "N/A",
              rooms: booking.unitsBooked || 1,
              checkIn: booking.checkIn.toDateString(),
              checkOut: booking.checkOut.toDateString(),
              guests: booking.numberOfGuests,
              totalPrice: booking.totalPrice,
              bookingDate: new Date().toDateString(),
              latitude: hotel?.address?.latitude,
              longitude: hotel?.address?.longitude,
            })
          );
        }
      }
    }

    res.status(200).json({ message: "Payment verified successfully", paymentId: razorpay_payment_id });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ message: "Server error during verification", error: error.message });
  }
};