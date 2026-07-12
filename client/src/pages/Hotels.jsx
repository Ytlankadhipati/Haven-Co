import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import FilterSidebar from "../components/FilterSidebar/FilterSidebar";
import HotelListCard from "../components/HotelListCard/HotelListCard";
import "./Hotels.css";

// Dummy data for now — this will later come from your backend
// (GET /api/hotels), once managers can add real listings.
const DUMMY_HOTELS = [
  {
    id: 1,
    name: "The Ledger House",
    location: "Gomti Nagar, Lucknow",
    price: 1299,
    originalPrice: 2599,
    rating: 4.6,
    ratingCount: 128,
    tag: "Editor's pick",
    amenities: ["Free WiFi", "AC Rooms", "Parking", "Breakfast Included"],
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&q=80",
    ],
  },
  {
    id: 2,
    name: "Kilo & Pine",
    location: "Hazratganj, Lucknow",
    price: 899,
    originalPrice: 1799,
    rating: 4.8,
    ratingCount: 342,
    tag: "New",
    amenities: ["Free WiFi", "AC Rooms", "Couple Friendly"],
    images: [
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80",
    ],
  },
  {
    id: 3,
    name: "Salt & Cedar",
    location: "Charbagh, Lucknow",
    price: 1599,
    originalPrice: 2199,
    rating: 4.3,
    ratingCount: 96,
    amenities: ["Free WiFi", "Parking", "Breakfast Included"],
    images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&q=80",
    ],
  },
];

const Hotels = () => {
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    locations: [],
    minPrice: 0,
    maxPrice: 10000,
    amenities: [],
    minRating: 0,
    searchText: "",
  });

  // Pick up ?city=... from the URL (set by the home page search bar)
  useEffect(() => {
    const city = searchParams.get("city");
    if (city) {
      setFilters((f) => ({ ...f, searchText: city }));
    }
  }, [searchParams]);

  const filteredHotels = useMemo(() => {
    return DUMMY_HOTELS.filter((hotel) => {
      if (
        filters.searchText &&
        !hotel.location.toLowerCase().includes(filters.searchText.toLowerCase())
      ) {
        return false;
      }
      if (
        filters.locations.length > 0 &&
        !filters.locations.some((loc) => hotel.location.includes(loc))
      ) {
        return false;
      }
      if (hotel.price < filters.minPrice || hotel.price > filters.maxPrice) {
        return false;
      }
      if (
        filters.amenities.length > 0 &&
        !filters.amenities.every((a) => hotel.amenities.includes(a))
      ) {
        return false;
      }
      if (filters.minRating && hotel.rating < filters.minRating) {
        return false;
      }
      return true;
    });
  }, [filters]);

  return (
    <>
      <Navbar />
      <div className="hotels-page">
        <div className="hotels-page__inner">
          <FilterSidebar filters={filters} onChange={setFilters} />

          <div className="hotels-page__results">
            <h2 className="hotels-page__heading">
              {filters.searchText
                ? `${filteredHotels.length} stays found for "${filters.searchText}"`
                : `${filteredHotels.length} stays found`}
            </h2>

            <div className="hotels-page__list">
              {filteredHotels.map((hotel) => (
                <HotelListCard key={hotel.id} hotel={hotel} />
              ))}

              {filteredHotels.length === 0 && (
                <p className="hotels-page__empty">
                  No stays match "{filters.searchText}". Try a different city or widen your filters.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Hotels;