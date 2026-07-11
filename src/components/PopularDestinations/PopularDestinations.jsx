import React from "react";
import "./PopularDestinations.css";

const DESTINATIONS = [
  { city: "Lisbon", count: "312 stays", image: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=500&q=80" },
  { city: "Kyoto", count: "204 stays", image: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=500&q=80" },
  { city: "Marrakech", count: "168 stays", image: "https://images.unsplash.com/photo-1597212720158-f7d8c39a6d43?w=500&q=80" },
  { city: "Big Sur", count: "97 stays", image: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=500&q=80" },
  { city: "Lyon", count: "143 stays", image: "https://images.unsplash.com/photo-1524396309943-e03f5249f002?w=500&q=80" },
  { city: "Cape Town", count: "121 stays", image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=500&q=80" },
];

const PopularDestinations = () => {
  return (
    <section className="dest" id="destinations">
      <div className="dest__header">
        <p className="eyebrow" style={{ color: "var(--teal-700)" }}>
          Well-stamped passports
        </p>
        <h2 className="dest__title">Where travelers are headed</h2>
      </div>

      <div className="dest__grid">
        {DESTINATIONS.map((d) => (
          <a href="#" className="dest__stamp" key={d.city}>
            <div className="dest__stamp-frame">
              <img src={d.image} alt={d.city} />
            </div>
            <p className="dest__city">{d.city}</p>
            <p className="dest__count">{d.count}</p>
          </a>
        ))}
      </div>
    </section>
  );
};

export default PopularDestinations;
