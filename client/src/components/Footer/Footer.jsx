import React from "react";
import "./Footer.css";

const COLUMNS = [
  {
    title: "Explore",
    links: ["Hotels", "Destinations", "Deals", "Gift cards"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Press", "Partner with us"],
  },
  {
    title: "Support",
    links: ["Help center", "Cancellations", "Safety", "Contact"],
  },
];

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <div className="footer__brand-row">
            <span className="footer__mark">W</span>
            <span className="footer__name">Haven & Co.</span>
          </div>
          <p className="footer__tag">
            Straightforward hotel booking for people who'd rather be traveling
            than reading fine print.
          </p>
        </div>

        <div className="footer__columns">
          {COLUMNS.map((col) => (
            <div className="footer__column" key={col.title}>
              <p className="eyebrow" style={{ color: "var(--gold-400)" }}>
                {col.title}
              </p>
              <ul>
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="footer__bottom">
        <span>© {new Date().getFullYear()} Haven & Co.. All rights reserved.</span>
        <span className="footer__code">WYF · EST. 2024</span>
      </div>
    </footer>
  );
};

export default Footer;
