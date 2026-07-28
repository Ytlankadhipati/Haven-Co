import razorpayInstance from "../config/razorpay.js";
import crypto from "crypto";

// POST /api/payments/create-order
// Frontend calls this when user clicks "Pay Now"
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
      key: process.env.RAZORPAY_KEY_ID, // frontend needs this to open checkout
    });
  } catch (error) {
    console.error("Create order error (full):", JSON.stringify(error, null, 2));
    res.status(500).json({ message: "Failed to create order", error: error.message });
  }
};

// POST /api/payments/verify
// Frontend calls this after Razorpay checkout completes
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification details" });
    }

    // Recreate the expected signature using our secret key
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed. Signature mismatch." });
    }

    // Signature matches — payment is genuine
    res.status(200).json({ message: "Payment verified successfully", paymentId: razorpay_payment_id });

    // NOTE: Once Booking model exists (later task), this is where we'll also
    // update booking.paymentStatus = "paid" and booking.status = "confirmed"
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ message: "Server error during verification", error: error.message });
  }
};