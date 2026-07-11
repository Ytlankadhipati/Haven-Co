import React from "react";
import "./HotelCard.css";

const HotelCard = ({ hotel }) => {
  const { name, city, price, rating, image, tag } = hotel;

  return (
    <article className="hcard">
      <div className="hcard__image-wrap">
        <img src={image} alt={name} className="hcard__image" />
        <span className="hcard__punch" aria-hidden="true" />
        {tag && <span className="hcard__tag">{tag}</span>}
        <span className="hcard__stamp">
          <span className="hcard__stamp-value">{rating}</span>
          <span className="hcard__stamp-label">rated</span>
        </span>
      </div>

      <div className="hcard__body">
        <div className="hcard__heading">
          <h3>{name}</h3>
          <p className="hcard__city">{city}</p>
        </div>
        <div className="hcard__price">
          <span className="hcard__price-value">${price}</span>
          <span className="hcard__price-unit">/ night</span>
        </div>
      </div>

      <button className="hcard__cta">View stay</button>
    </article>
  );
};

export default HotelCard;
