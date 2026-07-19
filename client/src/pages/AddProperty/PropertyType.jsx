import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PropertyType.css";

const PropertyType = ({ onNext, initialValue, initialName }) => {
  const [selected, setSelected] = useState(initialValue || "");
  const [name, setName] = useState(initialName || "");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleNext = () => {
    if (!name.trim()) {
      setError("Please enter your property name.");
      return;
    }
    if (!selected) {
      setError("Please select a property type.");
      return;
    }
    setError("");
    onNext({ name: name.trim(), propertyType: selected });
  };

  return (
    <div className="wizard-page">
      <div className="wizard-card">
        <p className="wizard-eyebrow">HAVENCO · LIST YOUR PROPERTY</p>
        <h1 className="wizard-heading">Let's start with the basics</h1>

        <div className="wizard-field" style={{ marginBottom: "1.5rem" }}>
          <label>Property Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. The Fraunces Inn"
          />
        </div>

        <p className="wizard-subheading">What type of property is it?</p>

        <div className="property-type-options">
          <button
            type="button"
            className={`property-type-option ${selected === "Hotel" ? "selected" : ""}`}
            onClick={() => setSelected("Hotel")}
          >
            <span className="option-icon">🏨</span>
            <span className="option-title">Hotel</span>
            <span className="option-desc">
              A business that allows guests to book private rooms or suites
            </span>
          </button>

          <button
            type="button"
            className={`property-type-option ${selected === "Home" ? "selected" : ""}`}
            onClick={() => setSelected("Home")}
          >
            <span className="option-icon">🏠</span>
            <span className="option-title">Home</span>
            <span className="option-desc">
              A residential home where guests may book one or more rooms, or the entire property
            </span>
          </button>

          <button
            type="button"
            className={`property-type-option ${selected === "Dormitory" ? "selected" : ""}`}
            onClick={() => setSelected("Dormitory")}
          >
            <span className="option-icon">🛏️</span>
            <span className="option-title">Dormitory</span>
            <span className="option-desc">
              A shared space where guests book individual beds rather than a private room
            </span>
          </button>
        </div>

        {error && <p className="wizard-error">{error}</p>}

        <div className="wizard-actions">
          <button
            type="button"
            className="wizard-back-btn"
            onClick={() => navigate("/manager/dashboard")}
          >
            Back
          </button>
          <button type="button" className="wizard-next-btn" onClick={handleNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyType;