import React, { useState } from "react";
import "./HotelListCard.css";
import { Link, useNavigate } from "react-router-dom";

const HotelListCard = ({ hotel, checkIn, checkOut, adults, rooms }) => {
  const {
    name,
    location,
    price,
    originalPrice,
    rating,
    ratingCount,
    images,
    amenities,
    tag,
  } = hotel;

  const [mainIndex, setMainIndex] = useState(0);
  const navigate = useNavigate();

  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;

  const detailUrl = `/hotels/${hotel._id}?checkIn=${checkIn || ""}&checkOut=${
    checkOut || ""
  }&adults=${adults || 2}&rooms=${rooms || 1}`;

  // Listing stage has no room chosen yet — Book Now sends them to
  // the detail page's room list, same destination as View Details.
  const handleBookNow = () => navigate(detailUrl);

  return (
    <article className="hlcard">
      <div className="hlcard__gallery">
        <div className="hlcard__main-image">
          <img
            src={
              images?.[mainIndex] ||
              "https://via.placeholder.com/500x300?text=No+Image"
            }
            alt={name}
          />
          {tag && <span className="hlcard__tag">{tag}</span>}
        </div>

        {images?.length > 1 && (
          <div className="hlcard__thumbs">
            {images.slice(0, 4).map((img, i) => (
              <button
                key={i}
                type="button"
                className={`hlcard__thumb ${
                  i === mainIndex ? "hlcard__thumb--active" : ""
                }`}
                onClick={() => setMainIndex(i)}
                aria-label={`View photo ${i + 1}`}
              >
                <img src={img} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="hlcard__details">
        <div className="hlcard__top">
          <div className="hlcard__heading">
            <h3 className="hlcard__name">{name}</h3>
            <p className="hlcard__location">
              <span className="hlcard__pin" aria-hidden="true" />
              {location}
            </p>
          </div>

          <div className="hlcard__rating-row">
            <span className="hlcard__rating">
              {rating > 0 ? rating.toFixed(1) : "New"}
              <span className="hlcard__rating-star">★</span>
            </span>
            <span className="hlcard__rating-count">
              {ratingCount > 0 ? `${ratingCount} Ratings` : "New listing"}
            </span>
          </div>

          {amenities?.length > 0 && (
            <div className="hlcard__amenities">
              {amenities.slice(0, 3).map((a) => (
                <span key={a} className="hlcard__amenity">
                  {a}
                </span>
              ))}
              {amenities.length > 3 && (
                <span className="hlcard__amenity-more">
                  +{amenities.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        <div className="hlcard__footer">
          <div className="hlcard__price-block">
            <div className="hlcard__price-row">
              <span className="hlcard__price">₹{price?.toLocaleString("en-IN")}</span>
              {originalPrice && (
                <span className="hlcard__original-price">
                  ₹{originalPrice.toLocaleString("en-IN")}
                </span>
              )}
              {discount > 0 && (
                <span className="hlcard__discount">{discount}% off</span>
              )}
            </div>
            <p className="hlcard__price-note">+ taxes &amp; fees · per room per night</p>
          </div>

          <div className="hlcard__actions">
            <Link to={detailUrl} className="hlcard__view-link">
              <button type="button" className="hlcard__view-btn">
                View Details
              </button>
            </Link>
            <button type="button" className="hlcard__book-btn" onClick={handleBookNow}>
              Book Now
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default HotelListCard;