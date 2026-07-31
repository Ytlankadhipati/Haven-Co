import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import GuestSelector from "./GuestSelector";
import "./SearchBar.css";
import { API_BASE_URL } from "../../config/api";
const getDayName = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { weekday: "long" });
};

const SearchBar = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    destination: "",
    checkIn: "",
    checkOut: "",
  });
  const [guests, setGuests] = useState({ adults: 2, rooms: 1 });
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [coords, setCoords] = useState(null); // { lat, lng } once user opts in

  const checkInRef = useRef(null);
  const checkOutRef = useRef(null);

  const openPicker = (ref) => () => {
    if (!ref.current) return;
    if (typeof ref.current.showPicker === "function") {
      ref.current.showPicker();
    } else {
      ref.current.focus();
    }
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (field === "destination" && coords) {
      // typing a manual destination cancels the "near me" mode
      setCoords(null);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Location isn't supported on this browser.");
      return;
    }
    setLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setForm((f) => ({ ...f, destination: "Near me" }));
        setLocating(false);
      },
      () => {
        setLocationError("Couldn't access your location. Please allow location access.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (coords) {
      params.set("lat", coords.lat);
      params.set("lng", coords.lng);
      params.set("nearby", "true");
    } else if (form.destination) {
      params.set("city", form.destination);
    }
    if (form.checkIn) params.set("checkIn", form.checkIn);
    if (form.checkOut) params.set("checkOut", form.checkOut);
    params.set("adults", guests.adults);
    params.set("rooms", guests.rooms);

    navigate(`/hotels?${params.toString()}`);
  };

  return (
    <form className="pass" onSubmit={handleSubmit}>
      <div className="pass__main">
        <div className="pass__field pass__field--destination">
          <label className="eyebrow" htmlFor="destination">
            Destination
          </label>
          <input
            id="destination"
            type="text"
            placeholder="Where to?"
            value={form.destination}
            onChange={handleChange("destination")}
          />
          <button
            type="button"
            className="pass__nearby-btn"
            onClick={handleUseMyLocation}
            disabled={locating}
          >
            {locating ? "Locating…" : "📍 Search nearby"}
          </button>
          {locationError && <span className="pass__location-error">{locationError}</span>}
        </div>

        <div
          className="pass__field pass__field--date"
          onClick={openPicker(checkInRef)}
        >
          <label className="eyebrow" htmlFor="checkIn">
            Check-in
          </label>
          <input
            id="checkIn"
            type="date"
            ref={checkInRef}
            value={form.checkIn}
            onChange={handleChange("checkIn")}
            onClick={(e) => e.stopPropagation()}
          />
          {form.checkIn && <span className="pass__day-name">{getDayName(form.checkIn)}</span>}
        </div>

        <div
          className="pass__field pass__field--date"
          onClick={openPicker(checkOutRef)}
        >
          <label className="eyebrow" htmlFor="checkOut">
            Check-out
          </label>
          <input
            id="checkOut"
            type="date"
            ref={checkOutRef}
            value={form.checkOut}
            onChange={handleChange("checkOut")}
            onClick={(e) => e.stopPropagation()}
          />
          {form.checkOut && <span className="pass__day-name">{getDayName(form.checkOut)}</span>}
        </div>

        <div className="pass__field">
          <label className="eyebrow">Guests</label>
          <GuestSelector value={guests} onChange={setGuests} />
        </div>
      </div>

      <div className="pass__perforation" aria-hidden="true">
        {Array.from({ length: 22 }).map((_, i) => (
          <span key={i} />
        ))}
      </div>

      <button type="submit" className="pass__stub">
        <span className="pass__stub-label">Search</span>
        <span className="pass__stub-code">WYF · 001</span>
      </button>
    </form>
  );
};

export default SearchBar;