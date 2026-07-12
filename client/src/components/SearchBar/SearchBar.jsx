import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GuestSelector from "./GuestSelector";
import "./SearchBar.css";

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

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (form.destination) params.set("city", form.destination);
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
        </div>

        <div className="pass__field">
          <label className="eyebrow" htmlFor="checkIn">
            Check-in
          </label>
          <input
            id="checkIn"
            type="date"
            value={form.checkIn}
            onChange={handleChange("checkIn")}
          />
          {form.checkIn && <span className="pass__day-name">{getDayName(form.checkIn)}</span>}
        </div>

        <div className="pass__field">
          <label className="eyebrow" htmlFor="checkOut">
            Check-out
          </label>
          <input
            id="checkOut"
            type="date"
            value={form.checkOut}
            onChange={handleChange("checkOut")}
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