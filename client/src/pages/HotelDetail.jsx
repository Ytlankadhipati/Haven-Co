import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import HotelListCard from "../components/HotelListCard/HotelListCard";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import "./HotelDetail.css";

export default function HotelDetail() {
  // Step 1: Read hotel ID from URL
  const { hotelId } = useParams();
  const [searchParams] = useSearchParams();
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const adults = searchParams.get("adults") || 2;
  const roomsRequested = searchParams.get("rooms") || 1;

  // Step 2: Create state
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [similarHotels, setSimilarHotels] = useState([]);

  // Step 3: Fetch hotel details
  useEffect(() => {
  const fetchHotelData = async () => {
    try {
      // Fetch hotel details
      const hotelResponse = await fetch(
        `http://localhost:5001/api/hotels/${hotelId}`
      );

      if (!hotelResponse.ok) {
        throw new Error("Failed to fetch hotel details");
      }

      const hotelData = await hotelResponse.json();
      setHotel(hotelData);

      // Fetch room types
      const roomResponse = await fetch(
        `http://localhost:5001/api/rooms/hotel/${hotelId}`
      );

      if (!roomResponse.ok) {
        throw new Error("Failed to fetch room types");
      }

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
        `http://localhost:5001/api/hotels?city=${encodeURIComponent(hotel.location)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch similar hotels");
      }

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

  // Loading
  if (loading) {
    return <h2>Loading...</h2>;
  }

  // Error
  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <>
      <Navbar />

      <div className="hotel-detail">
        <div className="hotel-gallery">
        <div className="main-image">
            <img
                src={hotel.images[selectedImage]}
                alt={hotel.name}
            />
        </div>
        <div className="thumbnail-container">
            {hotel.images.map((image, index) => (
                <img
                    key={index}
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className={
                        selectedImage === index
                            ? "thumbnail active"
                            : "thumbnail"
                    }
                    onClick={() => setSelectedImage(index)}
                />
            ))}
        </div>
        </div>
        <div className="hotel-info">
    <h1 className="hotel-name">
        {hotel.name}
    </h1>
    {hotel.propertyType && (
  <span className="hotel-property-type">
    {hotel.propertyType}
  </span>
    )}
    <div className="wishlist-container">
    <button
        className={
            wishlisted
                ? "wishlist-btn active"
                : "wishlist-btn"
        }
        onClick={() => setWishlisted(!wishlisted)}
    >
        {wishlisted ? "❤️ Wishlisted" : "🤍 Add to Wishlist"}
    </button>
</div>
    <div className="hotel-rating">
        <span className="rating">
            ⭐ {hotel.rating}
        </span>
        <span className="rating-count">
            ({hotel.ratingCount} Ratings)
        </span>
    </div>
    <p className="hotel-location">
  📍{" "}
  {[
    hotel.address?.buildingNo,
    hotel.address?.road,
    hotel.address?.city,
    hotel.address?.state,
  ]
    .filter(Boolean)
    .join(", ")}
    </p>
    <div className="hotel-price">
        <span className="current-price">
            ₹{hotel.price}
        </span>
        {hotel.originalPrice && (
            <span className="original-price">
                ₹{hotel.originalPrice}
            </span>
        )}
    </div>
    {hotel.tag && (
        <span className="hotel-tag">
            {hotel.tag}
        </span>
    )}
        </div>
        <div className="room-section">
  <h2>Available Rooms</h2>
        <div className="room-container">
  {rooms.length > 0 ? (
    rooms.map((room) => (
      <div className="room-card" key={room._id}>

        {/* Room Image */}
        {room.images && room.images.length > 0 && (
          <img
            src={room.images[0]}
            alt={room.roomTypeName}
            className="room-image"
          />
        )}

        {/* Room Information */}
        <div className="room-info">
          <h3>{room.roomTypeName}</h3>

          <div className="room-price">
            <span>₹{room.pricePerNight} / night</span>

            {room.originalPrice && (
              <span className="room-original-price">
                ₹{room.originalPrice}
              </span>
            )}
          </div>

          <p>
            Capacity: {room.maxOccupancy} Guests
          </p>

          {/* Room Amenities */}
          {room.roomAmenities && room.roomAmenities.length > 0 && (
            <div className="room-amenities">
              {room.roomAmenities.map((amenity, index) => (
                <span key={index}>
                  {amenity}
                </span>
              ))}
            </div>
          )}

          {/* Availability */}
          <p className="room-availability">
            {room.totalRoomsOfThisType} room
            {room.totalRoomsOfThisType !== 1 ? "s" : ""} available
          </p>

          <button className="book-room-btn">
            Book Now
          </button>
        </div>

      </div>
    ))
  ) : (
    <p>No room types available.</p>
  )}
        </div>
        </div>
        <div className="facilities-section">
    <h2>Facilities</h2>
    <div className="facilities-container">
        {hotel.amenities && hotel.amenities.length > 0 ? (
            hotel.amenities.map((facility, index) => (
                <div className="facility-item" key={index}>
                    ✔ {facility}
                </div>
            ))
        ) : (
            <p>No facilities available.</p>
        )}
    </div>
        </div>
        <div className="description-section">
    <h2>Description</h2>
    <p className="hotel-description">
        {hotel.description
            ? hotel.description
            : "No description available."}
    </p>
        </div>
        <div className="reviews-section">
        <h2>Reviews</h2>
        <p className="reviews-placeholder">
        Reviews coming soon.
        </p>
</div>
        <div className="map-section">
        <h2>Location</h2>
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
          <p>Location map is not available for this hotel.</p>
          )}
        </div>
        </div>
        {similarHotels.length > 0 && (
  <section className="similar-hotels">
    <h2>You Might Also Like</h2>

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