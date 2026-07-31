import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import FilterSidebar from "../components/FilterSidebar/FilterSidebar";
import HotelListCard from "../components/HotelListCard/HotelListCard";
import "./Hotels.css";
import { API_BASE_URL } from "../config/api";

// Dummy data for now — this will later come from your backend
// (GET /api/hotels), once managers can add real listings.
// const DUMMY_HOTELS = [
//   {
//     id: 1,
//     name: "The Ledger House",
//     location: "Gomti Nagar, Lucknow",
//     price: 1299,
//     originalPrice: 2599,
//     rating: 4.6,
//     ratingCount: 128,
//     tag: "Editor's pick",
//     amenities: ["Free WiFi", "AC Rooms", "Parking", "Breakfast Included"],
//     images: [
//       "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80",
//       "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500&q=80",
//       "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&q=80",
//       "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&q=80",
//     ],
//   },
//   {
//     id: 2,
//     name: "Kilo & Pine",
//     location: "Hazratganj, Lucknow",
//     price: 899,
//     originalPrice: 1799,
//     rating: 4.8,
//     ratingCount: 342,
//     tag: "New",
//     amenities: ["Free WiFi", "AC Rooms", "Couple Friendly"],
//     images: [
//       "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500&q=80",
//       "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500&q=80",
//       "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80",
//     ],
//   },
//   {
//     id: 3,
//     name: "Salt & Cedar",
//     location: "Charbagh, Lucknow",
//     price: 1599,
//     originalPrice: 2199,
//     rating: 4.3,
//     ratingCount: 96,
//     amenities: ["Free WiFi", "Parking", "Breakfast Included"],
//     images: [
//       "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&q=80",
//       "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&q=80",
//     ],
//   },
// ];

const Hotels = () => {
  const [searchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const [sortOption, setSortOption] = useState("");
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

  useEffect(() => {
  const fetchHotels = async () => {
    try {
      const lat = searchParams.get("lat");
      const lng = searchParams.get("lng");
      const nearby = searchParams.get("nearby");

      const params = new URLSearchParams();
      if (nearby === "true" && lat && lng) {
        params.set("lat", lat);
        params.set("lng", lng);
        params.set("nearby", "true");
      }

      const url = params.toString()
        ? `${API_BASE_URL}/api/hotels?${params.toString()}`
        : `${API_BASE_URL}/api/hotels`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch hotels");
      }

      const data = await response.json();

      setHotels(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchHotels();
}, [searchParams]);

  const filteredHotels = useMemo(() => {
  const result = hotels.filter((hotel) => {
    if (
      filters.searchText &&
      !hotel.location
        .toLowerCase()
        .includes(filters.searchText.toLowerCase())
    ) {
      return false;
    }

    if (
      filters.locations.length > 0 &&
      !filters.locations.some((loc) =>
        hotel.location.includes(loc)
      )
    ) {
      return false;
    }

    if (
      hotel.price < filters.minPrice ||
      hotel.price > filters.maxPrice
    ) {
      return false;
    }

    if (
      filters.amenities.length > 0 &&
      !filters.amenities.every((a) =>
        hotel.amenities.includes(a)
      )
    ) {
      return false;
    }

    if (
      filters.minRating &&
      hotel.rating < filters.minRating
    ) {
      return false;
    }

    return true;
  });

  // Apply sorting
  if (sortOption === "price-low-high") {
    result.sort((a, b) => a.price - b.price);
  }

  if (sortOption === "price-high-low") {
    result.sort((a, b) => b.price - a.price);
  }

  if (sortOption === "rating-high-low") {
    result.sort((a, b) => b.rating - a.rating);
  }

  return result;
}, [hotels, filters, sortOption]);

  const isNearbySearch = searchParams.get("nearby") === "true";

  if (loading) {
  return <h2>Loading hotels...</h2>;
}

 if (error) {
  return <h2>{error}</h2>;
}

  return (
    <>
      <Navbar />
      <div className="hotels-page">
        <div className="hotels-page__inner">
          <FilterSidebar filters={filters} onChange={setFilters} />

          <div className="hotels-page__results">
            <h2 className="hotels-page__heading">
              {isNearbySearch
                ? `${filteredHotels.length} stays found near you`
                : filters.searchText
                ? `${filteredHotels.length} stays found for "${filters.searchText}"`
                : `${filteredHotels.length} stays found`}
            </h2>
            <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="hotels-sort"
            >
              <option value="">Sort By</option>
              <option value="price-low-high">Price: Low → High</option>
              <option value="price-high-low">Price: High → Low</option>
              <option value="rating-high-low">Rating: High → Low</option>
            </select>

            <div className="hotels-page__list">
              {filteredHotels.map((hotel) => (
               <HotelListCard
               key={hotel._id}
               hotel={hotel}
               checkIn={searchParams.get("checkIn")}
               checkOut={searchParams.get("checkOut")}
               adults={searchParams.get("adults")}
               rooms={searchParams.get("rooms")}
               distanceKm={isNearbySearch ? hotel.distanceKm : null}
               />
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