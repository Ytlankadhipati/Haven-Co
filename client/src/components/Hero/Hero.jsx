import React from "react";
import SearchBar from "../SearchBar/SearchBar";
import "./Hero.css";
import { API_BASE_URL } from "../../config/api";

const Hero = () => {
  return (
    <section className="hero" id="top">
      <div className="hero__inner">
        <div className="hero__logo-wrap">
          <div className="hero__logo">
            <span className="hero__logo-mark">H</span>
          </div>
          <span className="hero__logo-name">Haven &amp; Co.</span>
        </div>

        <p className="hero__tagline">
          Pack light. <em>We'll handle the rest.</em>
        </p>

        <p className="eyebrow hero__eyebrow">Boarding pass to 12,000+ stays</p>

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