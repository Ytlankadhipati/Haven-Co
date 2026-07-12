import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

const NAV_LINKS = [
  { label: "Hotels", href: "#featured" },
  { label: "Destinations", href: "#destinations" },
  { label: "Why Haven & Co.", href: "#why-us" },
  { label: "Reviews", href: "#testimonials" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { currentUser, logout } = useAuth();

  // Prefer Google display name; fall back to phone number for phone sign-ins
  const displayName =
    currentUser?.displayName || currentUser?.phoneNumber || "there";

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <a href="#top" className="navbar__brand">
          <span className="navbar__brand-mark">W</span>
          <span className="navbar__brand-name">Haven & Co.</span>
        </a>

        <nav className={`navbar__links ${open ? "navbar__links--open" : ""}`}>
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}

          {currentUser ? (
            <div className="navbar__auth">
              <Link to="/profile" className="navbar__welcome">
                Welcome, {displayName}
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
