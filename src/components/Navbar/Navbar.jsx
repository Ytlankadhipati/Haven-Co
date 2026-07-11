import React, { useState } from "react";
import "./Navbar.css";

const NAV_LINKS = [
  { label: "Hotels", href: "#featured" },
  { label: "Destinations", href: "#destinations" },
  { label: "Why Haven & Co.", href: "#why-us" },
  { label: "Reviews", href: "#testimonials" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <a href="#top" className="navbar__brand">
          <span className="navbar__brand-mark">H</span>
          <span className="navbar__brand-name">HAVEN</span>
        </a>

        <nav className={`navbar__links ${open ? "navbar__links--open" : ""}`}>
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
          <div className="navbar__auth">
            <a href="/login" className="navbar__login">
              Log in
            </a>
            <a href="/signup" className="navbar__signup">
              Sign up
            </a>
          </div>
        </nav>

        <button
          className="navbar__toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
