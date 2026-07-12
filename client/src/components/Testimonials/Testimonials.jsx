import React from "react";
import "./Testimonials.css";

const REVIEWS = [
  {
    quote:
      "Booked a place in Kyoto in four minutes flat. It looked exactly like the photos — first time that's happened in years.",
    name: "Priya N.",
    trip: "Kyoto, Japan",
  },
  {
    quote:
      "Cancelled a night last-minute with zero hassle. The support line actually picked up.",
    name: "Marcus T.",
    trip: "Lisbon, Portugal",
  },
  {
    quote:
      "The 'editor's pick' tag isn't fluff — that hotel in Big Sur was the best stay we've had.",
    name: "Elena R.",
    trip: "Big Sur, USA",
  },
];

const Testimonials = () => {
  return (
    <section className="reviews" id="testimonials">
      <div className="reviews__header">
        <p className="eyebrow" style={{ color: "var(--gold-500)" }}>
          Postcards home
        </p>
        <h2 className="reviews__title">What guests are writing back</h2>
      </div>

      <div className="reviews__grid">
        {REVIEWS.map((r) => (
          <figure className="reviews__card" key={r.name}>
            <span className="reviews__mark">&ldquo;</span>
            <blockquote>{r.quote}</blockquote>
            <figcaption>
              <span className="reviews__name">{r.name}</span>
              <span className="reviews__trip">{r.trip}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
