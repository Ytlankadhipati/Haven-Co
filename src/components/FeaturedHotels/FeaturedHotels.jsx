import React from "react";
import HotelCard from "../HotelCard/HotelCard";
import "./FeaturedHotels.css";

const HOTELS = [
  {
    name: "The Ledger House",
    city: "Lisbon, Portugal",
    price: 142,
    rating: "4.9",
    tag: "Editor's pick",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
  },
  {
    name: "Kilo & Pine",
    city: "Kyoto, Japan",
    price: 168,
    rating: "4.8",
    tag: "New",
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&q=80",
  },
  {
    name: "Salt & Cedar",
    city: "Big Sur, USA",
    price: 210,
    rating: "5.0",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80",
  },
  {
    name: "Rue Marchand",
    city: "Lyon, France",
    price: 129,
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80",
  },
];

const FeaturedHotels = () => {
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
        {HOTELS.map((hotel) => (
          <HotelCard key={hotel.name} hotel={hotel} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedHotels;
