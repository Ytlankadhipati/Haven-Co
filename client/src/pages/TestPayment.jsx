import React, { useState } from "react";
import "./TestPayment.css";

// Each key maps to exactly what that button should show — nothing else.
// Schema below matches Razorpay's documented "config.display" format exactly
// (no extra fields beyond what their docs define — that's what broke it last time).
const METHOD_CONFIGS = {
  card: {
    display: {
      blocks: {
        cardBlock: {
          name: "Pay via Card",
          instruments: [{ method: "card" }],
        },
      },
      sequence: ["block.cardBlock"],
      preferences: { show_default_blocks: false },
    },
  },
  netbanking: {
    display: {
      blocks: {
        nbBlock: {
          name: "Other payment options",
          instruments: [
            { method: "netbanking" },
            { method: "wallet" },
            { method: "paylater" },
            { method: "emi" },
          ],
        },
      },
      sequence: ["block.nbBlock"],
      preferences: { show_default_blocks: false },
    },
  },
  upi: {
    display: {
      blocks: {
        upiBlock: {
          name: "Pay via UPI",
          instruments: [{ method: "upi" }],
        },
      },
      sequence: ["block.upiBlock"],
      preferences: { show_default_blocks: false },
    },
  },
};

const TestPayment = () => {
  // "card" | "netbanking" | "upi" | null — tracks which button is mid-flow
  const [loadingMethod, setLoadingMethod] = useState(null);

  const handlePayment = async (preferredMethod) => {
    // UPI needs merchant KYC/activation on this Razorpay account before it can
    // open — don't attempt checkout, just say so clearly instead of showing
    // Razorpay's confusing "no appropriate payment method" error.
    if (preferredMethod === "upi") {
      alert(
        "UPI isn't available yet on this account.\n\nRazorpay requires merchant KYC (PAN + bank details) to be verified before UPI can go live — even in test mode. Card and Netbanking are fully working right now."
      );
      return;
    }

    setLoadingMethod(preferredMethod);
    try {
      const orderRes = await fetch("http://localhost:5001/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 1500 }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        alert("Could not start payment: " + (orderData.message || "Unknown error"));
        setLoadingMethod(null);
        return;
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "HavenCo",
        description: "Test booking payment",
        order_id: orderData.orderId,
        config: METHOD_CONFIGS[preferredMethod],
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
          ondismiss: () => setLoadingMethod(null),
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", () => setLoadingMethod(null));
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Something went wrong: " + error.message);
      setLoadingMethod(null);
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
            TEST MODE · CARD 4386 2894 0766 0153
          </p>

          <div className="tp-btn-row">
            <button
              className="tp-shine-btn"
              onClick={() => handlePayment("card")}
              disabled={loadingMethod !== null}
            >
              <span>
                <svg className="tp-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2.5" y="5.5" width="19" height="13" rx="2" />
                  <path d="M2.5 9.5h19" />
                </svg>
                {loadingMethod === "card" ? "Opening…" : "Card"}
              </span>
            </button>

            <button
              className="tp-shine-btn tp-shine-btn--nb"
              onClick={() => handlePayment("netbanking")}
              disabled={loadingMethod !== null}
            >
              <span>
                <svg className="tp-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 10l9-6 9 6" />
                  <path d="M5 10v9h14v-9" />
                  <path d="M9 19v-6h6v6" />
                </svg>
                {loadingMethod === "netbanking" ? "Opening…" : "Netbanking"}
              </span>
            </button>

            <button
              className="tp-shine-btn tp-shine-btn--upi tp-shine-btn--pending"
              onClick={() => handlePayment("upi")}
              disabled={loadingMethod !== null}
            >
              <span>
                <svg className="tp-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <path d="M14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z" />
                </svg>
                UPI / QR
              </span>
              <span className="tp-pending-badge">Merchant activation pending</span>
            </button>
          </div>

          <p className="tp-subnote">Card and Netbanking are fully live in test mode.</p>
        </div>
      </div>
    </div>
  );
};

export default TestPayment;