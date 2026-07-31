import React from "react";
import Navbar from "../components/Navbar/Navbar";
import Hero from "../components/Hero/Hero";
import FeaturedHotels from "../components/FeaturedHotels/FeaturedHotels";
import WhyChooseUs from "../components/WhyChooseUs/WhyChooseUs";
import PopularDestinations from "../components/PopularDestinations/PopularDestinations";
import Testimonials from "../components/Testimonials/Testimonials";
import Newsletter from "../components/Newsletter/Newsletter";
import Footer from "../components/Footer/Footer";
import { API_BASE_URL } from "../config/api";

const Home = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <FeaturedHotels />
      <WhyChooseUs />
      <PopularDestinations />
      <Testimonials />
      <Newsletter />
      <Footer />
    </>
  );
};

export default Home;
