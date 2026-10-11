import React, { useState, useEffect } from "react";
import HotelCard from "../HotelCard/HotelCard";
import { API_BASE_URL } from "../../config/api";
import "./FeaturedHotels.css";

const FALLBACK_HOTELS = [
  {
    name: "The Ledger House",
    location: "Jaipur, Rajasthan",
    price: 14200,
    rating: "4.9",
    tag: "Editor's pick",
    images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80"],
  },
  {
    name: "Kilo & Pine",
    location: "Munnar, Kerala",
    price: 16800,
    rating: "4.8",
    tag: "New",
    images: ["https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&q=80"],
  },
  {
    name: "Salt & Cedar",
    location: "Goa",
    price: 21000,
    rating: "5.0",
    images: ["https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80"],
  },
  {
    name: "Rue Marchand",
    location: "Udaipur, Rajasthan",
    price: 12900,
    rating: "4.7",
    images: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80"],
  },
];

const FeaturedHotels = () => {
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/hotels`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setHotels(data.slice(0, 4));
        } else {
          setHotels(FALLBACK_HOTELS);
        }
      })
      .catch(() => setHotels(FALLBACK_HOTELS));
  }, []);

  const displayHotels = hotels.length > 0 ? hotels : FALLBACK_HOTELS;

  return (
    <section className="featured" id="featured">
      <div className="featured__header">
        <p className="eyebrow" style={{ color: "var(--teal-700)" }}>
          Currently boarding
        </p>
        <h2 className="featured__title">Stays worth the detour</h2>
        <p className="featured__subtitle">
          Hand-checked by our team for character, comfort, and honest reviews.
        </p>
      </div>

      <div className="featured__grid">
        {displayHotels.map((hotel, index) => (
          <HotelCard key={hotel._id || hotel.name || index} hotel={hotel} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedHotels;