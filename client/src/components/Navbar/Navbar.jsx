import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";
import { API_BASE_URL } from "../../config/api";
const NAV_LINKS = [
  { label: "Hotels", href: "/hotels" },
  { label: "Why Wayfare", href: "#why-us" },
];

const BuildingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 21h18M5 21V5a1 1 0 0 1 1-1h5v17M18 21V10a1 1 0 0 0-1-1h-4v12" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 7h1M9 11h1M9 15h1M15 13h1M15 17h1" strokeLinecap="round" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 5c0 9.4 7.6 17 17 17l3-4-6-4-2 2c-2.4-1.2-4.8-3.6-6-6l2-2-4-6-4 3z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { currentUser, profile, logout } = useAuth();

  const displayName =
    profile?.fullName || currentUser?.displayName || currentUser?.phoneNumber || "there";

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          <span className="navbar__brand-mark">H</span>
          <span className="navbar__brand-name">Haven & Co.</span>
        </Link>

        <div className="navbar__util-group">
          <Link to="/manager/auth" className="navbar__util-item navbar__util-item--highlight">
            <BuildingIcon />
            <span>
              List your hotel
              <small>Start earning today</small>
            </span>
          </Link>

          <a href="tel:+911234567890" className="navbar__util-item">
            <PhoneIcon />
            <span>
              +91 123 456 7890
              <small>Call to book</small>
            </span>
          </a>
        </div>

        <nav className={`navbar__links ${open ? "navbar__links--open" : ""}`}>
          {NAV_LINKS.map((link) =>
            link.href.startsWith("/") ? (
              <Link key={link.label} to={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ) : (
              <a key={link.label} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            )
          )}

          {currentUser && (
            <Link to="/my-bookings" onClick={() => setOpen(false)}>
              My Bookings
            </Link>
          )}

          <Link
            to="/manager/auth"
            className="navbar__mobile-only navbar__list-hotel-mobile"
            onClick={() => setOpen(false)}
          >
            List your hotel
          </Link>

          {currentUser ? (
            <div className="navbar__auth navbar__auth--pill">
              <Link to="/profile" className="navbar__welcome">
                <span className="navbar__avatar">{displayName.charAt(0).toUpperCase()}</span>
                {displayName}
              </Link>
              <button className="navbar__logout" onClick={logout}>
                Log out
              </button>
            </div>
          ) : (
            <div className="navbar__auth">
              <Link to="/login" className="navbar__login">
                Log in
              </Link>
              <Link to="/signup" className="navbar__signup">
                Sign up
              </Link>
            </div>
          )}
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