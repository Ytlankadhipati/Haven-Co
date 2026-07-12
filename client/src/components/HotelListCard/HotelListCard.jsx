import React, { useState } from "react";
import "./HotelListCard.css";

const HotelListCard = ({ hotel }) => {
  const { name, location, price, originalPrice, rating, ratingCount, images, amenities, tag } = hotel;
  const [mainIndex, setMainIndex] = useState(0);

  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;

  return (
    <article className="hlcard">
      <div className="hlcard__gallery">
        <div className="hlcard__main-image">
          <img src={images[mainIndex]} alt={name} />
          {tag && <span className="hlcard__tag">{tag}</span>}
        </div>
        <div className="hlcard__thumbs">
          {images.slice(0, 4).map((img, i) => (
            <button
              key={i}
              className={`hlcard__thumb ${i === mainIndex ? "hlcard__thumb--active" : ""}`}
              onClick={() => setMainIndex(i)}
            >
              <img src={img} alt={`${name} thumbnail ${i + 1}`} />
            </button>
          ))}
        </div>
      </div>

      <div className="hlcard__details">
        <div>
          <h3 className="hlcard__name">{name}</h3>
          <p className="hlcard__location">{location}</p>

          <div className="hlcard__rating-row">
            <span className="hlcard__rating">{rating} ★</span>
            <span className="hlcard__rating-count">({ratingCount} Ratings)</span>
          </div>

          {amenities?.length > 0 && (
            <div className="hlcard__amenities">
              {amenities.slice(0, 3).map((a) => (
                <span key={a} className="hlcard__amenity">{a}</span>
              ))}
              {amenities.length > 3 && (
                <span className="hlcard__amenity-more">+{amenities.length - 3} more</span>
              )}
            </div>
          )}
        </div>

        <div className="hlcard__footer">
          <div className="hlcard__price-block">
            <div className="hlcard__price-row">
              <span className="hlcard__price">₹{price}</span>
              {originalPrice && <span className="hlcard__original-price">₹{originalPrice}</span>}
              {discount && <span className="hlcard__discount">{discount}% off</span>}
            </div>
            <p className="hlcard__price-note">+ taxes & fees · per room per night</p>
          </div>

          <div className="hlcard__actions">
            <button className="hlcard__view-btn">View Details</button>
            <button className="hlcard__book-btn">Book Now</button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default HotelListCard;