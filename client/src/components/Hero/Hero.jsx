import React from "react";
import SearchBar from "../SearchBar/SearchBar";
import "./Hero.css";

const Hero = () => {
  return (
    <section className="hero" id="top">
      <div className="hero__inner">
        <p className="eyebrow hero__eyebrow">Boarding pass to 12,000+ stays</p>
        <h1 className="hero__title">
          Pack light.
          <br />
          <em>We'll handle the rest.</em>
        </h1>
        <p className="hero__subtitle">
          Search, compare, and book hotels the way travel should feel —
          straightforward, honest pricing, no surprises at the front desk.
        </p>
      </div>

      <div className="hero__search-wrap">
        <SearchBar />
      </div>
    </section>
  );
};

export default Hero;
