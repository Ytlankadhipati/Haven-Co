import React, { useState } from "react";
import "./HotelCard.css";

const HotelCard = ({ hotel }) => {
  const { name, location, price, rating, images, amenities, tag } = hotel;
  const [imgIndex, setImgIndex] = useState(0);

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImgIndex((i) => (i + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImgIndex((i) => (i - 1 + images.length) % images.length);
  };

  return (
    <article className="hcard">
      <div className="hcard__image-wrap">
        <img src={images[imgIndex]} alt={`${name} photo ${imgIndex + 1}`} className="hcard__image" />

        {images.length > 1 && (
          <>
            <button className="hcard__arrow hcard__arrow--left" onClick={prevImage} aria-label="Previous photo">
              ‹
            </button>
            <button className="hcard__arrow hcard__arrow--right" onClick={nextImage} aria-label="Next photo">
              ›
            </button>
            <div className="hcard__dots">
              {images.map((_, i) => (
                <span key={i} className={`hcard__dot ${i === imgIndex ? "hcard__dot--active" : ""}`} />
              ))}
            </div>
          </>
        )}

        {tag && <span className="hcard__tag">{tag}</span>}
        <span className="hcard__stamp">
          <span className="hcard__stamp-value">{rating}</span>
          <span className="hcard__stamp-label">rated</span>
        </span>
      </div>

      <div className="hcard__body">
        <div className="hcard__heading">
          <h3>{name}</h3>
          <p className="hcard__city">{location}</p>
        </div>
        <div className="hcard__price">
          <span className="hcard__price-value">₹{price}</span>
          <span className="hcard__price-unit">/ night</span>
        </div>
      </div>

      {amenities?.length > 0 && (
        <div className="hcard__amenities">
          {amenities.map((a) => (
            <span key={a} className="hcard__amenity">{a}</span>
          ))}
        </div>
      )}

      <button className="hcard__cta">View stay</button>
    </article>
  );
};

export default HotelCard;