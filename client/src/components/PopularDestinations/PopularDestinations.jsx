import React from "react";
import "./PopularDestinations.css";
import { API_BASE_URL } from "../../config/api";

const DESTINATIONS = [
  { city: "Jaipur", count: "312 stays", image: "https://images.unsplash.com/photo-1524229648276-e66561fe45a9?w=500&q=80" },
  { city: "Goa", count: "204 stays", image: "https://images.unsplash.com/photo-1656155318073-5bdd6098e321?w=500&q=80" },
  { city: "Udaipur", count: "168 stays", image: "https://images.unsplash.com/photo-1655106606416-f65f790cff66?w=500&q=80" },
  { city: "Varanasi", count: "143 stays", image: "https://images.unsplash.com/photo-1557841595-f8d620ddf0e0?w=500&q=80" },
  { city: "Munnar", count: "121 stays", image: "https://images.unsplash.com/photo-1646818978594-880ef94bde44?w=500&q=80" },
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