import React, { useState } from "react";
import "./SearchBar.css";

const SearchBar = () => {
  const [form, setForm] = useState({
    destination: "",
    checkIn: "",
    checkOut: "",
    guests: "2 guests",
  });

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Search submitted:", form);
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
        </div>

        <div className="pass__field">
          <label className="eyebrow" htmlFor="guests">
            Guests
          </label>
          <select id="guests" value={form.guests} onChange={handleChange("guests")}>
            <option>1 guest</option>
            <option>2 guests</option>
            <option>3 guests</option>
            <option>4+ guests</option>
          </select>
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
