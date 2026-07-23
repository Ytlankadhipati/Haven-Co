import React, { useState } from "react";
import "./TestPayment.css";

const TestPayment = () => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const orderRes = await fetch("http://localhost:5001/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 1500 }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        alert("Could not start payment: " + (orderData.message || "Unknown error"));
        setLoading(false);
        return;
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "HavenCo",
        description: "Test booking payment",
        order_id: orderData.orderId,
        handler: async function (response) {
          const verifyRes = await fetch("http://localhost:5001/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();

          if (verifyRes.ok) {
            alert("✅ Payment verified! Payment ID: " + verifyData.paymentId);
          } else {
            alert("❌ Verification failed: " + verifyData.message);
          }
        },
        theme: { color: "#0f5257" },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", () => setLoading(false));
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Something went wrong: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="tp-page">
      <div className="tp-ticket">
        <div className="tp-ticket-top">
          <div className="tp-eyebrow">HavenCo · Secure Checkout</div>

          <div className="tp-route">
            <div className="tp-route-point">
              <span className="tp-route-code">YOU</span>
              <span className="tp-route-label">Guest</span>
            </div>
            <div className="tp-route-line"></div>
            <div className="tp-route-point" style={{ alignItems: "flex-end" }}>
              <span className="tp-route-code">HVN</span>
              <span className="tp-route-label">HavenCo Stay</span>
            </div>
          </div>

          <div className="tp-amount-row">
            <span className="tp-amount-label">Total due</span>
            <span className="tp-amount-value">₹1,500</span>
          </div>
        </div>

        <div className="tp-perforation"></div>

        <div className="tp-ticket-bottom">
          <p className="tp-fineprint">
            TEST MODE · CARD 4111 1111 1111 1111 · ANY FUTURE DATE / CVV
          </p>

          <button className="tp-shine-btn" onClick={handlePayment} disabled={loading}>
            <span>
              <svg className="tp-lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              {loading ? "Opening secure checkout…" : "Pay ₹1,500 now"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestPayment;