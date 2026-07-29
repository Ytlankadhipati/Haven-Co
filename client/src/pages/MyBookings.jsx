import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./MyBookings.css";

const API_BASE = "http://localhost:5001/api/bookings";

const STATUS_META = {
  pending: { label: "Pending", className: "mb-badge--pending" },
  confirmed: { label: "Confirmed", className: "mb-badge--confirmed" },
  completed: { label: "Completed", className: "mb-badge--completed" },
  cancelled: { label: "Cancelled", className: "mb-badge--cancelled" },
};

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const MyBookings = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/user/${currentUser.uid}`);
        if (!res.ok) throw new Error("Failed to load bookings");
        const data = await res.json();
        setBookings(data);
      } catch (err) {
        setError("Couldn't load your bookings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentUser]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) return;

    try {
      setCancellingId(bookingId);
      const res = await fetch(`${API_BASE}/${bookingId}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.uid }),
      });
      if (!res.ok) throw new Error("Cancel failed");
      const updated = await res.json();
      setBookings((prev) =>
        prev.map((b) => (b._id === updated._id ? updated : b))
      );
    } catch (err) {
      alert("Couldn't cancel this booking. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="mb-page">
        <div className="mb-container">
          <h1 className="mb-title">My Bookings</h1>
          <div className="mb-skeleton-list">
            {[1, 2, 3].map((i) => (
              <div key={i} className="mb-skeleton-card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-page">
        <div className="mb-container">
          <h1 className="mb-title">My Bookings</h1>
          <p className="mb-error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-page">
      <div className="mb-container">
        <h1 className="mb-title">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="mb-empty">
            <p>You haven't booked any stays yet.</p>
            <Link to="/hotels" className="mb-empty-cta">
              Explore hotels
            </Link>
          </div>
        ) : (
          <div className="mb-list">
            {bookings.map((booking) => {
              const hotel = booking.hotelId;
              const roomType = booking.roomTypeId;
              const statusMeta =
                STATUS_META[booking.status] || STATUS_META.pending;
              const canCancel =
                (booking.status === "pending" ||
                  booking.status === "confirmed") &&
                new Date(booking.checkIn) > new Date();

              return (
                <div key={booking._id} className="mb-card">
                  <div className="mb-card__image">
                    <img
                      src={
                        hotel?.images?.[0] ||
                        "https://via.placeholder.com/300x200?text=Hotel"
                      }
                      alt={hotel?.name || "Hotel"}
                    />
                  </div>

                  <div className="mb-card__body">
                    <div className="mb-card__top">
                      <div>
                        <h3 className="mb-card__hotel">
                          {hotel?.name || "Hotel"}
                        </h3>
                        <p className="mb-card__location">
                          {hotel?.location}
                        </p>
                      </div>
                      <span
                        className={`mb-badge ${statusMeta.className}`}
                      >
                        {statusMeta.label}
                      </span>
                    </div>

                    <div className="mb-card__details">
                      <div className="mb-detail">
                        <span className="mb-detail__label">Check-in</span>
                        <span className="mb-detail__value">
                          {formatDate(booking.checkIn)}
                        </span>
                      </div>
                      <div className="mb-detail">
                        <span className="mb-detail__label">Check-out</span>
                        <span className="mb-detail__value">
                          {formatDate(booking.checkOut)}
                        </span>
                      </div>
                      <div className="mb-detail">
                        <span className="mb-detail__label">Room</span>
                        <span className="mb-detail__value">
                          {roomType?.roomTypeName || "-"}
                        </span>
                      </div>
                      <div className="mb-detail">
                        <span className="mb-detail__label">Guests</span>
                        <span className="mb-detail__value">
                          {booking.numberOfGuests}
                        </span>
                      </div>
                    </div>

                    <div className="mb-card__footer">
                      <div className="mb-card__price">
                        <span className="mb-card__price-label">
                          Total paid
                        </span>
                        <span className="mb-card__price-value">
                          ₹{booking.totalPrice?.toLocaleString("en-IN")}
                        </span>
                      </div>

                      {canCancel && (
                        <button
                          className="mb-cancel-btn"
                          disabled={cancellingId === booking._id}
                          onClick={() => handleCancel(booking._id)}
                        >
                          {cancellingId === booking._id
                            ? "Cancelling..."
                            : "Cancel Booking"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;