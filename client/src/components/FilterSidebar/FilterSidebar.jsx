import React from "react";
import "./FilterSidebar.css";

const LOCATIONS = ["Gomti Nagar", "Charbagh", "Hazratganj", "Indira Nagar", "Aliganj"];
const AMENITIES = ["Free WiFi", "AC Rooms", "Parking", "Breakfast Included", "Couple Friendly"];

const FilterSidebar = ({ filters, onChange }) => {
  const handlePriceChange = (field) => (e) => {
    onChange({ ...filters, [field]: Number(e.target.value) });
  };

  const toggleLocation = (loc) => {
    const exists = filters.locations.includes(loc);
    const updated = exists
      ? filters.locations.filter((l) => l !== loc)
      : [...filters.locations, loc];
    onChange({ ...filters, locations: updated });
  };

  const toggleAmenity = (amenity) => {
    const exists = filters.amenities.includes(amenity);
    const updated = exists
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];
    onChange({ ...filters, amenities: updated });
  };

  return (
    <aside className="filters">
      <h3 className="filters__title">Filters</h3>

      <div className="filters__section">
        <p className="filters__label">Popular locations</p>
        <div className="filters__chips">
          {LOCATIONS.map((loc) => (
            <button
              key={loc}
              type="button"
              className={`filters__chip ${filters.locations.includes(loc) ? "filters__chip--active" : ""}`}
              onClick={() => toggleLocation(loc)}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      <div className="filters__section">
        <p className="filters__label">Price per night</p>
        <div className="filters__price-inputs">
          <div className="filters__price-field">
            <span className="eyebrow">Min</span>
            <input
              type="number"
              value={filters.minPrice}
              onChange={handlePriceChange("minPrice")}
              min={0}
            />
          </div>
          <div className="filters__price-field">
            <span className="eyebrow">Max</span>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={handlePriceChange("maxPrice")}
              min={0}
            />
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={10000}
          step={100}
          value={filters.maxPrice}
          onChange={handlePriceChange("maxPrice")}
          className="filters__slider"
        />
      </div>

      <div className="filters__section">
        <p className="filters__label">Amenities</p>
        <div className="filters__checks">
          {AMENITIES.map((amenity) => (
            <label key={amenity} className="filters__check">
              <input
                type="checkbox"
                checked={filters.amenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
              />
              {amenity}
            </label>
          ))}
        </div>
      </div>

      <div className="filters__section">
        <p className="filters__label">Minimum rating</p>
        <div className="filters__chips">
          {[3, 3.5, 4, 4.5].map((r) => (
            <button
              key={r}
              type="button"
              className={`filters__chip ${filters.minRating === r ? "filters__chip--active" : ""}`}
              onClick={() => onChange({ ...filters, minRating: filters.minRating === r ? 0 : r })}
            >
              {r}+ ★
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;