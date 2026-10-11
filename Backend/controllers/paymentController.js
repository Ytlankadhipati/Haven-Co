import crypto from "crypto";
import razorpayInstance from "../config/razorpay.js";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Manager from "../models/Manager.js";
import User from "../models/User.js";
import RoomType from "../models/RoomType.js";
import { sendEmail } from "../utils/notificationService.js";
import {
  userBookingEmail,
  managerBookingEmail,
} from "../utils/emailTemplates.js";

// POST /api/payments/create-order
export const createOrder = async (req, res) => {
  try {
    const { amount, bookingId } = req.body;
    let finalAmount = amount;

    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (!booking) return res.status(404).json({ message: "Booking not found." });
      if (booking.userId !== req.user?.uid) {
        return res.status(403).json({ message: "You cannot pay for another user's booking." });
      }
      if (booking.paymentStatus === "paid") {
        return res.status(400).json({ message: "This booking has already been paid for." });
      }
      finalAmount = booking.totalPrice;
    }

    if (!Number.isFinite(Number(finalAmount)) || Number(finalAmount) <= 0) {
      return res.status(400).json({ message: "A valid amount is required." });
    }

    const order = await razorpayInstance.orders.create({
      amount: Math.round(Number(finalAmount) * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create order failed:", error?.message || "Unknown payment error");
    return res.status(500).json({ message: "Failed to create payment order." });
  }
};

const sendBookingNotifications = async (booking, paymentId) => {
  const [hotel, roomType, user] = await Promise.all([
    Hotel.findById(booking.hotelId),
    RoomType.findById(booking.roomTypeId),
    User.findOne({ firebaseUid: booking.userId }),
  ]);
  const manager = hotel ? await Manager.findById(hotel.managerId) : null;
  const fullAddress = [
    hotel?.address?.buildingNo,
    hotel?.address?.near,
    hotel?.address?.road,
    hotel?.address?.city,
    hotel?.address?.state,
    hotel?.address?.zipCode,
  ].filter(Boolean).join(", ") || hotel?.location || "N/A";

  const messages = [];
  if (user?.email) {
    messages.push(sendEmail(
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
        paymentId,
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
    ));
  }

  if (manager?.email) {
    messages.push(sendEmail(
      manager.email,
      "New Booking Request Received",
      managerBookingEmail({
        hotelName: hotel?.name || "N/A",
        address: fullAddress,
        guestName: user?.fullName || booking.guestName || "Registered User",
        guestEmail: user?.email || "N/A",
        guestPhone: booking.guestPhone || "",
        bookingId: booking._id.toString(),
        paymentId,
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
    ));
  }

  const results = await Promise.allSettled(messages);
  const failures = results.filter((result) => result.status === "rejected");
  if (failures.length) {
    throw new Error(`${failures.length} booking notification email(s) failed.`);
  }
};

// POST /api/payments/verify
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
      bookingId,
    } = req.body;

    if (!orderId || !paymentId || !signature || !bookingId) {
      return res.status(400).json({ message: "Missing payment or booking verification details." });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const receivedBuffer = Buffer.from(signature, "hex");
    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return res.status(400).json({ message: "Payment verification failed. Signature mismatch." });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found." });
    if (booking.userId !== req.user?.uid) {
      return res.status(403).json({ message: "You cannot verify payment for another user's booking." });
    }

    booking.paymentStatus = "paid";
    booking.status = "confirmed";
    booking.razorpayOrderId = orderId;
    booking.razorpayPaymentId = paymentId;
    await booking.save();

    // Confirm success as soon as the verified payment and booking are persisted.
    res.status(200).json({ message: "Payment verified successfully", paymentId });

    // Notification delivery is deliberately detached from the payment response.
    void sendBookingNotifications(booking, paymentId).catch((error) => {
      console.error("Post-payment email failed:", error?.message || "Unknown notification error");
    });
  } catch (error) {
    console.error("Verify payment failed:", error?.message || "Unknown verification error");
    if (!res.headersSent) {
      return res.status(500).json({ message: "Server error during payment verification." });
    }
  }
};
