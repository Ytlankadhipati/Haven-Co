import React, { useState } from "react";
import "./Newsletter.css";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <section className="news">
      <div className="news__card">
        <div className="news__copy">
          <p className="eyebrow" style={{ color: "var(--gold-400)" }}>
            Deals worth boarding for
          </p>
          <h2>Get fare drops before they sell out</h2>
          <p className="news__sub">One email a week. Unsubscribe anytime.</p>
        </div>

        {submitted ? (
          <p className="news__success">You're on the list — first email lands Friday.</p>
        ) : (
          <form className="news__form" onSubmit={handleSubmit}>
            <input
              type="email"
              required
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit">Subscribe</button>
          </form>
        )}
      </div>
    </section>
  );
};

export default Newsletter;
