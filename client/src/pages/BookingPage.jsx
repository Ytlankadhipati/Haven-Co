import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import "./BookingPage.css";
import { API_BASE_URL } from "../config/api";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function BookingPage() {
  const { hotelId, roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser, profile } = useAuth();

  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const adults = searchParams.get("adults") || 2;
  const rooms = searchParams.get("rooms") || 1;

  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState("");

  const [form, setForm] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        guestName: profile.fullName || "",
        guestEmail: currentUser?.email || "",
        guestPhone: profile.phone || "",
      });
    }
  }, [profile, currentUser]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hotelRes, roomRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/hotels/${hotelId}`),
          fetch(`${API_BASE_URL}/api/rooms/${roomId}`),
        ]);

        if (!hotelRes.ok) throw new Error("Hotel not found");
        if (!roomRes.ok) throw new Error("Room not found");

        const hotelData = await hotelRes.json();
        const roomData = await roomRes.json();

        setHotel(hotelData);
        setRoom(roomData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hotelId, roomId]);

  const calcNights = () => {
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const nights = calcNights();
  const pricePerNight = room?.pricePerNight || 0;
  const totalAmount = pricePerNight * nights * Number(rooms);

  const formatPrice = (val) =>
    typeof val === "number" ? val.toLocaleString("en-IN") : val;

  const formatDate = (val) => {
    if (!val) return "—";
    return new Date(val).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.guestName || !form.guestEmail || !form.guestPhone) {
      setError("All fields are required.");
      return;
    }
    if (nights <= 0) {
      setError("Invalid dates selected.");
      return;
    }
    if (!currentUser?.uid) {
      setError("You need to be logged in to book.");
      return;
    }

    setSubmitting(true);

    try {
      // Step 1 — create the booking in "pending" status
      const bookingRes = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.uid,
          hotelId,
          roomTypeId: roomId,
          checkIn,
          checkOut,
          numberOfGuests: Number(adults),
        }),
      });

      const bookingData = await bookingRes.json();

      if (!bookingRes.ok) {
        setError(bookingData.message || "Booking failed. Try again.");
        setSubmitting(false);
        return;
      }

      const newBookingId = bookingData._id;

      // Step 2 — load Razorpay's checkout script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Couldn't load the payment gateway. Please check your connection and try again.");
        setSubmitting(false);
        return;
      }

      // Step 3 — create a Razorpay order for this booking's amount
      const orderRes = await fetch(`${API_BASE_URL}/api/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        setError(orderData.message || "Couldn't start payment. Please try again.");
        setSubmitting(false);
        return;
      }

      // Step 4 — open the Razorpay checkout widget
      const razorpayOptions = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "HavenCO",
        description: `Booking at ${hotel?.name || "your stay"}`,
        order_id: orderData.orderId,
        prefill: {
          name: form.guestName,
          email: form.guestEmail,
          contact: form.guestPhone,
        },
        theme: { color: "#0f5257" },
        handler: async (response) => {
          // Step 5 — verify the payment, tell the backend which booking this was for
          try {
            const verifyRes = await fetch(`${API_BASE_URL}/api/payments/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: newBookingId,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              setError(verifyData.message || "Payment verification failed.");
              setSubmitting(false);
              return;
            }

            setBookingId(newBookingId);
            setSuccess(true);
          } catch (err) {
            console.error(err);
            setError("Payment succeeded but verification failed. Please contact support.");
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            setError("Payment was cancelled. Your booking is still pending — you can try paying again.");
          },
        },
      };

      console.log("Opening Razorpay...");
      console.log(razorpayOptions);

      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.open();      

   
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="booking-state">
          <p className="eyebrow">Please wait</p>
          <h2>Loading booking details…</h2>
        </div>
        <Footer />
      </>
    );
  }

  if (error && !hotel) {
    return (
      <>
        <Navbar />
        <div className="booking-state">
          <p className="eyebrow">Error</p>
          <h2>{error}</h2>
        </div>
        <Footer />
      </>
    );
  }

  if (success) {
    return (
      <>
        <Navbar />
        <div className="booking-success">
          <div className="booking-success__card">
            <div className="booking-success__icon">✓</div>
            <p className="eyebrow" style={{ color: "var(--teal-600)" }}>
              Booking Confirmed
            </p>
            <h1>You're all set!</h1>
            <p className="booking-success__sub">
              Your booking at <strong>{hotel?.name}</strong> has been confirmed and paid.
            </p>

            <div className="booking-success__detail">
              <div className="booking-success__row">
                <span>Booking ID</span>
                <span className="mono">{bookingId}</span>
              </div>
              <div className="booking-success__row">
                <span>Check-in</span>
                <span>{formatDate(checkIn)}</span>
              </div>
              <div className="booking-success__row">
                <span>Check-out</span>
                <span>{formatDate(checkOut)}</span>
              </div>
              <div className="booking-success__row">
                <span>Nights</span>
                <span>{nights}</span>
              </div>
              <div className="booking-success__row">
                <span>Rooms</span>
                <span>{rooms}</span>
              </div>
              <div className="booking-success__row total">
                <span>Total Paid</span>
                <span>₹{formatPrice(totalAmount)}</span>
              </div>
            </div>

            <div className="booking-success__actions">
              <button className="bp-btn bp-btn--primary" onClick={() => navigate("/")}>
                Back to Home
              </button>
              <button className="bp-btn bp-btn--ghost" onClick={() => navigate("/hotels")}>
                Explore More Hotels
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="booking-page">
        <div className="booking-page__left">
          <p className="eyebrow" style={{ color: "var(--teal-600)" }}>
            Almost there
          </p>
          <h1 className="booking-page__title">Complete your booking</h1>

          <div className="booking-hotel-card">
            {hotel?.images?.[0] && (
              <img src={hotel.images[0]} alt={hotel.name} className="booking-hotel-card__img" />
            )}
            <div className="booking-hotel-card__info">
              <p className="eyebrow">{hotel?.propertyType}</p>
              <h3>{hotel?.name}</h3>
              <p className="booking-hotel-card__location">
                📍 {hotel?.address?.city}, {hotel?.address?.state}
              </p>
              <p className="booking-hotel-card__room">🛏️ {room?.roomTypeName}</p>
            </div>
          </div>

          <div className="booking-stay-bar">
            <div className="booking-stay-bar__item">
              <p className="eyebrow">Check-in</p>
              <p>{formatDate(checkIn)}</p>
            </div>
            <span className="booking-stay-bar__div" />
            <div className="booking-stay-bar__item">
              <p className="eyebrow">Check-out</p>
              <p>{formatDate(checkOut)}</p>
            </div>
            <span className="booking-stay-bar__div" />
            <div className="booking-stay-bar__item">
              <p className="eyebrow">Nights</p>
              <p>{nights}</p>
            </div>
            <span className="booking-stay-bar__div" />
            <div className="booking-stay-bar__item">
              <p className="eyebrow">Guests</p>
              <p>{adults}</p>
            </div>
            <span className="booking-stay-bar__div" />
            <div className="booking-stay-bar__item">
              <p className="eyebrow">Rooms</p>
              <p>{rooms}</p>
            </div>
          </div>

          <form className="booking-form" onSubmit={handleSubmit}>
            <h2 className="booking-form__heading">Guest Details</h2>

            <div className="booking-form__field">
              <label>Full Name *</label>
              <input
                type="text"
                name="guestName"
                value={form.guestName}
                onChange={handleChange}
                placeholder="As on ID proof"
                required
              />
            </div>

            <div className="booking-form__row">
              <div className="booking-form__field">
                <label>Email *</label>
                <input
                  type="email"
                  name="guestEmail"
                  value={form.guestEmail}
                  onChange={handleChange}
                  placeholder="you@email.com"
                  required
                />
              </div>

              <div className="booking-form__field">
                <label>Phone *</label>
                <input
                  type="tel"
                  name="guestPhone"
                  value={form.guestPhone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </div>

            {error && <p className="booking-form__error">{error}</p>}

            <button
              type="submit"
              className="bp-btn bp-btn--primary bp-btn--full"
              disabled={submitting}
            >
              {submitting ? "Processing…" : `Pay & Confirm · ₹${formatPrice(totalAmount)}`}
            </button>

            <p className="booking-form__note">🔒 Secure payment via Razorpay (test mode).</p>
          </form>
        </div>

        <div className="booking-page__right">
          <div className="price-summary">
            <p className="eyebrow" style={{ color: "var(--teal-600)" }}>
              Price Breakdown
            </p>
            <h2 className="price-summary__title">Your Stay</h2>

            <div className="price-summary__rows">
              <div className="price-summary__row">
                <span>
                  ₹{formatPrice(pricePerNight)} × {nights} night{nights !== 1 ? "s" : ""}
                </span>
                <span>₹{formatPrice(pricePerNight * nights)}</span>
              </div>

              {Number(rooms) > 1 && (
                <div className="price-summary__row">
                  <span>× {rooms} rooms</span>
                  <span>₹{formatPrice(totalAmount)}</span>
                </div>
              )}

              <div className="price-summary__row">
                <span>Taxes & fees</span>
                <span className="price-summary__free">Included</span>
              </div>
            </div>

            <div className="price-summary__total">
              <span>Total</span>
              <span>₹{formatPrice(totalAmount)}</span>
            </div>

            <div className="price-summary__perks">
              <p>✓ Free cancellation before check-in</p>
              <p>✓ No hidden charges</p>
              <p>✓ Instant confirmation</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}