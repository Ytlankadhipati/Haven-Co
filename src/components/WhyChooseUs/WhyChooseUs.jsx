import React from "react";
import "./WhyChooseUs.css";

const ITEMS = [
  {
    code: "PRICE",
    title: "No surprise fees",
    copy: "The price you see at search is the price you pay at checkout. Always.",
  },
  {
    code: "VERIFY",
    title: "Verified stays only",
    copy: "Every property is inspected by our team before it's listed — not just photographed well.",
  },
  {
    code: "FLEX",
    title: "Free cancellation",
    copy: "Plans change. Cancel most bookings up to 48 hours out at no cost.",
  },
  {
    code: "HELP",
    title: "Real humans, 24/7",
    copy: "A support line staffed by people who've actually stayed at these places.",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="why" id="why-us">
      <div className="why__inner">
        <p className="eyebrow" style={{ color: "var(--gold-500)" }}>
          Terms & conditions, but nice
        </p>
        <h2 className="why__title">Why travelers rebook with us</h2>

        <div className="why__grid">
          {ITEMS.map((item) => (
            <div className="why__item" key={item.code}>
              <span className="why__code">{item.code}</span>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
