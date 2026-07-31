import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HotelListCard from "../components/HotelListCard/HotelListCard";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import "./HotelDetail.css";
import { API_BASE_URL } from "../config/api";

export default function HotelDetail() {
  const { hotelId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const adults = searchParams.get("adults") || 2;
  const roomsRequested = searchParams.get("rooms") || 1;

  const todayStr = new Date().toISOString().split("T")[0];

  const updateSearchParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next, { replace: true });
  };

  const handleCheckInChange = (e) => {
    const value = e.target.value;
    updateSearchParam("checkIn", value);
    if (checkOut && value && checkOut <= value) {
      updateSearchParam("checkOut", "");
    }
  };

  const handleCheckOutChange = (e) => updateSearchParam("checkOut", e.target.value);
  const handleAdultsChange = (e) => updateSearchParam("adults", e.target.value);
  const handleRoomsChange = (e) => updateSearchParam("rooms", e.target.value);

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [similarHotels, setSimilarHotels] = useState([]);

  // ---- Reviews state ----
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [eligibility, setEligibility] = useState(null); // {eligible, reason, bookingId}
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        setLoading(true);
        const hotelResponse = await fetch(
          `${API_BASE_URL}/api/hotels/${hotelId}`
        );
        if (!hotelResponse.ok) throw new Error("Failed to fetch hotel details");
        const hotelData = await hotelResponse.json();
        setHotel(hotelData);
        setSelectedImage(0);

        const roomResponse = await fetch(
          `${API_BASE_URL}/api/rooms/hotel/${hotelId}`
        );
        if (!roomResponse.ok) throw new Error("Failed to fetch room types");
        const roomData = await roomResponse.json();
        setRooms(roomData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHotelData();
  }, [hotelId]);

  useEffect(() => {
    if (!hotel) return;

    const fetchSimilarHotels = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/hotels?city=${encodeURIComponent(hotel.location || "")}`
        );
        if (!response.ok) throw new Error("Failed to fetch similar hotels");
        const data = await response.json();
        const filteredHotels = data
          .filter((item) => item._id !== hotel._id)
          .slice(0, 4);
        setSimilarHotels(filteredHotels);
      } catch (err) {
        console.error("Failed to load similar hotels:", err);
      }
    };

    fetchSimilarHotels();
  }, [hotel]);

  // ---- Fetch reviews (public) ----
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/reviews/hotel/${hotelId}`);
        if (!res.ok) throw new Error("Failed to fetch reviews");
        const data = await res.json();
        setReviews(data);
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [hotelId]);

  // ---- Check review eligibility for the logged-in user ----
  useEffect(() => {
    if (!currentUser) {
      setEligibility({ eligible: false, reason: "not_logged_in" });
      return;
    }

    const checkEligibility = async () => {
      try {
        const token = await currentUser.getIdToken();
        const res = await fetch(
          `${API_BASE_URL}/api/reviews/eligibility/${hotelId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setEligibility(data);
      } catch (err) {
        console.error("Failed to check review eligibility:", err);
        setEligibility({ eligible: false, reason: "error" });
      }
    };

    checkEligibility();
  }, [currentUser, hotelId]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError("");
    setSubmittingReview(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hotelId,
          bookingId: eligibility.bookingId,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit review");

      setReviews((prev) => [data, ...prev]);
      setReviewSubmitted(true);
      setEligibility({ eligible: false, reason: "already_reviewed" });
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatPrice = (value) =>
    typeof value === "number" ? value.toLocaleString("en-IN") : value;

  const formatDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d)) return value;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleBookNow = (room) => {
    if (!currentUser) {
      navigate(
        `/login?redirect=${encodeURIComponent(
          window.location.pathname + window.location.search
        )}`
      );
      return;
    }
    if (!checkIn || !checkOut) {
      alert("Please search with check-in and check-out dates to book.");
      return;
    }
    navigate(
      `/booking/${hotelId}/${room._id}?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&rooms=${roomsRequested}`
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="state-screen">
          <p className="eyebrow">Loading</p>
          <h2>Fetching this stay&rsquo;s details&hellip;</h2>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="state-screen state-screen--error">
          <p className="eyebrow">Something went wrong</p>
          <h2>{error}</h2>
        </div>
        <Footer />
      </>
    );
  }

  const images = hotel.images && hotel.images.length > 0 ? hotel.images : [];
  const addressLine = [
    hotel.address?.buildingNo,
    hotel.address?.road,
    hotel.address?.city,
    hotel.address?.state,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <Navbar />

      <div className="hotel-detail">
        {/* ---------- Gallery ---------- */}
        <section className="hotel-gallery">
          <div className="main-image">
            {images.length > 0 ? (
              <img src={images[selectedImage]} alt={hotel.name} />
            ) : (
              <div className="image-placeholder">
                <span>No photos available yet</span>
              </div>
            )}
            {hotel.propertyType && (
              <span className="property-type-chip">{hotel.propertyType}</span>
            )}
          </div>

          {images.length > 1 && (
            <div className="thumbnail-strip">
              {images.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  className={
                    selectedImage === index
                      ? "thumbnail thumbnail--active"
                      : "thumbnail"
                  }
                  onClick={() => setSelectedImage(index)}
                  aria-label={`View photo ${index + 1}`}
                >
                  <img src={image} alt="" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ---------- Header / boarding-pass stay summary ---------- */}
        <section className="hotel-info">
          <div className="hotel-info__top">
            <div className="hotel-info__heading">
              <h1 className="hotel-name">{hotel.name}</h1>
              {addressLine && (
                <p className="hotel-location">
                  <span className="pin-dot" aria-hidden="true" />
                  {addressLine}
                </p>
              )}
            </div>

            <button
              type="button"
              className={wishlisted ? "wishlist-btn wishlist-btn--active" : "wishlist-btn"}
              onClick={() => setWishlisted(!wishlisted)}
              aria-pressed={wishlisted}
            >
              <span className="wishlist-btn__mark">&#9825;</span>
              {wishlisted ? "Saved" : "Save"}
            </button>
          </div>

          <div className="hotel-info__meta">
            {hotel.rating != null && (
              <div className="rating-badge">
                <span className="rating-badge__score">{hotel.rating}</span>
                <span className="rating-badge__label">
                  {hotel.ratingCount ? `${hotel.ratingCount} ratings` : "New listing"}
                </span>
              </div>
            )}

            <div className="hotel-price">
              <span className="current-price">₹{formatPrice(hotel.price)}</span>
              {hotel.originalPrice && (
                <span className="original-price">₹{formatPrice(hotel.originalPrice)}</span>
              )}
              <span className="price-suffix">/ night</span>
            </div>

            {hotel.tag && <span className="hotel-tag">{hotel.tag}</span>}
          </div>

          <div className="stay-ticket">
            <div className="stay-ticket__row">
              <div className="stay-ticket__item">
                <label className="eyebrow" htmlFor="checkIn">Check-in</label>
                <input
                  id="checkIn"
                  type="date"
                  className="stay-ticket__input"
                  value={checkIn}
                  min={todayStr}
                  onChange={handleCheckInChange}
                />
              </div>
              <div className="stay-ticket__item">
                <label className="eyebrow" htmlFor="checkOut">Check-out</label>
                <input
                  id="checkOut"
                  type="date"
                  className="stay-ticket__input"
                  value={checkOut}
                  min={checkIn || todayStr}
                  onChange={handleCheckOutChange}
                  disabled={!checkIn}
                />
              </div>
              <div className="stay-ticket__item">
                <label className="eyebrow" htmlFor="adults">Guests</label>
                <select
                  id="adults"
                  className="stay-ticket__input"
                  value={adults}
                  onChange={handleAdultsChange}
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} adult{n !== 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="stay-ticket__item">
                <label className="eyebrow" htmlFor="rooms">Rooms</label>
                <select
                  id="rooms"
                  className="stay-ticket__input"
                  value={roomsRequested}
                  onChange={handleRoomsChange}
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="stay-ticket__perforation" aria-hidden="true">
              {Array.from({ length: 28 }).map((_, i) => (
                <span key={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Rooms ---------- */}
        <section className="room-section">
          <p className="eyebrow">Choose your room</p>
          <h2 className="section-title">Available Rooms</h2>

          <div className="room-container">
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <article className="room-card" key={room._id}>
                  <div className="room-card__image">
                    {room.images && room.images.length > 0 ? (
                      <img src={room.images[0]} alt={room.roomTypeName} />
                    ) : (
                      <div className="image-placeholder image-placeholder--small">
                        <span>No photo</span>
                      </div>
                    )}
                  </div>

                  <div className="room-info">
                    <div>
                      <h3 className="room-name">{room.roomTypeName}</h3>
                      <p className="room-capacity">
                        Sleeps {room.maxOccupancy} guest{room.maxOccupancy !== 1 ? "s" : ""}
                      </p>

                      {room.roomAmenities && room.roomAmenities.length > 0 && (
                        <ul className="room-amenities">
                          {room.roomAmenities.slice(0, 4).map((amenity, index) => (
                            <li key={index}>{amenity}</li>
                          ))}
                          {room.roomAmenities.length > 4 && (
                            <li className="room-amenities__more">
                              +{room.roomAmenities.length - 4} more
                            </li>
                          )}
                        </ul>
                      )}
                    </div>

                    <div className="room-card__footer">
                      <div>
                        <div className="room-price">
                          <span className="room-price__value">
                            ₹{formatPrice(room.pricePerNight)}
                          </span>
                          {room.originalPrice && (
                            <span className="room-original-price">
                              ₹{formatPrice(room.originalPrice)}
                            </span>
                          )}
                          <span className="price-suffix">/ night</span>
                        </div>
                        <p className="room-availability">
                          {room.totalRoomsOfThisType} room
                          {room.totalRoomsOfThisType !== 1 ? "s" : ""} left
                        </p>
                      </div>

                      <button
                        type="button"
                        className="book-room-btn"
                        onClick={() => handleBookNow(room)}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="empty-state">
                No room types have been added for this property yet.
              </p>
            )}
          </div>
        </section>

        {/* ---------- Facilities ---------- */}
        <section className="facilities-section">
          <p className="eyebrow">What&rsquo;s included</p>
          <h2 className="section-title">Facilities</h2>
          <div className="facilities-container">
            {hotel.amenities && hotel.amenities.length > 0 ? (
              hotel.amenities.map((facility, index) => (
                <div className="facility-item" key={index}>
                  <span className="facility-item__check">✓</span>
                  {facility}
                </div>
              ))
            ) : (
              <p className="empty-state">No facilities listed yet.</p>
            )}
          </div>
        </section>

        {/* ---------- Description ---------- */}
        <section className="description-section">
          <p className="eyebrow">About this stay</p>
          <h2 className="section-title">Description</h2>
          <p className="hotel-description">
            {hotel.description || "No description available."}
          </p>
        </section>

        {/* ---------- Reviews ---------- */}
        <section className="reviews-section">
          <p className="eyebrow">Guest feedback</p>
          <h2 className="section-title">Reviews</h2>

          {eligibility?.eligible && !reviewSubmitted && (
            <form className="review-form" onSubmit={handleReviewSubmit}>
              <p className="review-form__label">Rate your stay</p>
              <div className="review-form__stars">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    className={n <= reviewRating ? "star-btn star-btn--active" : "star-btn"}
                    onClick={() => setReviewRating(n)}
                    aria-label={`${n} star${n !== 1 ? "s" : ""}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Share a few words about your stay (optional)"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
                className="review-form__textarea"
              />
              {reviewError && <p className="review-form__error">{reviewError}</p>}
              <button
                type="submit"
                className="review-form__submit"
                disabled={submittingReview}
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}

          {reviewSubmitted && (
            <p className="review-form__success">
              Thanks — your review has been posted.
            </p>
          )}

          {eligibility?.reason === "already_reviewed" && !reviewSubmitted && (
            <p className="empty-state">You&rsquo;ve already reviewed this stay.</p>
          )}

          {reviewsLoading ? (
            <p className="empty-state">Loading reviews...</p>
          ) : reviews.length > 0 ? (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div className="review-card" key={review._id}>
                  <div className="review-card__top">
                    <span className="review-card__stars">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </span>
                    <span className="review-card__date">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="review-card__comment">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">
              Reviews will appear here once guests start checking out.
            </p>
          )}
        </section>

        {/* ---------- Map ---------- */}
        <section className="map-section">
          <p className="eyebrow">Getting there</p>
          <h2 className="section-title">Location</h2>
          <div className="map-container">
            {hotel.address?.latitude && hotel.address?.longitude ? (
              <iframe
                title="Hotel Location"
                width="100%"
                height="400"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps?q=${hotel.address.latitude},${hotel.address.longitude}&output=embed`}
              ></iframe>
            ) : (
              <p className="empty-state">
                Location map is not available for this hotel.
              </p>
            )}
          </div>
        </section>

        {/* ---------- Similar hotels ---------- */}
        {similarHotels.length > 0 && (
          <section className="similar-hotels">
            <p className="eyebrow">Nearby options</p>
            <h2 className="section-title">You Might Also Like</h2>
            <div className="similar-hotels__grid">
              {similarHotels.map((similarHotel) => (
                <HotelListCard
                  key={similarHotel._id}
                  hotel={similarHotel}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  adults={adults}
                  rooms={roomsRequested}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </>
  );
}