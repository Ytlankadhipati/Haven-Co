import { useState } from "react";
import "./PropertyType.css";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry",
];

const PropertyAddress = ({ onNext, onBack, initialValue }) => {
  const [address, setAddress] = useState(
    initialValue || {
      buildingNo: "",
      near: "",
      road: "",
      city: "",
      state: "",
      country: "India",
      zipCode: "",
    }
  );
  const [error, setError] = useState("");
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeNote, setPincodeNote] = useState("");

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  // called when zip code field loses focus
  const handleZipBlur = async () => {
    const zip = address.zipCode.trim();

    // Indian pincodes are always 6 digits
    if (!/^\d{6}$/.test(zip)) return;

    setPincodeLoading(true);
    setPincodeNote("");

    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${zip}`);
      const data = await res.json();

      if (data[0]?.Status === "Success" && data[0].PostOffice?.length > 0) {
        const postOffice = data[0].PostOffice[0];
        setAddress((prev) => ({
          ...prev,
          city: postOffice.District,
          state: postOffice.State,
        }));
        setPincodeNote("City and state auto-filled — please verify.");
      } else {
        setPincodeNote("Couldn't find this zip code — please fill city/state manually.");
      }
    } catch (err) {
      console.error("Pincode lookup failed:", err);
      setPincodeNote("Couldn't look up this zip code — please fill city/state manually.");
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleNext = () => {
    if (!address.city || !address.state || !address.zipCode) {
      setError("City, state, and zip code are required.");
      return;
    }
    setError("");
    onNext({ address, location: address.city });
  };

  return (
    <div className="wizard-page">
      <div className="wizard-card">
        <p className="wizard-eyebrow">HAVENCO · LIST YOUR PROPERTY</p>
        <h1 className="wizard-heading">Where is your property located?</h1>

        <div className="wizard-form">
          <div className="wizard-form-row">
            <div className="wizard-field">
              <label>Building No.</label>
              <input
                type="text"
                name="buildingNo"
                value={address.buildingNo}
                onChange={handleChange}
                placeholder="e.g. 24/B"
              />
            </div>
            <div className="wizard-field">
              <label>Near (Landmark)</label>
              <input
                type="text"
                name="near"
                value={address.near}
                onChange={handleChange}
                placeholder="e.g. Hazratganj Market"
              />
            </div>
          </div>

          <div className="wizard-field">
            <label>Road / Street</label>
            <input
              type="text"
              name="road"
              value={address.road}
              onChange={handleChange}
              placeholder="e.g. MG Road"
            />
          </div>

          {/* Zip code moved above city/state so auto-fill feels natural */}
          <div className="wizard-field">
            <label>Zip Code *</label>
            <input
              type="text"
              name="zipCode"
              value={address.zipCode}
              onChange={handleChange}
              onBlur={handleZipBlur}
              placeholder="e.g. 226001"
              maxLength={6}
            />
            {pincodeLoading && <p className="wizard-hint">Looking up city/state...</p>}
            {!pincodeLoading && pincodeNote && <p className="wizard-hint">{pincodeNote}</p>}
          </div>

          <div className="wizard-form-row">
            <div className="wizard-field">
              <label>City *</label>
              <input
                type="text"
                name="city"
                value={address.city}
                onChange={handleChange}
                placeholder="e.g. Lucknow"
              />
            </div>
            <div className="wizard-field">
              <label>State *</label>
              <select name="state" value={address.state} onChange={handleChange}>
                <option value="">Select state</option>
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="wizard-field">
            <label>Country</label>
            <input
              type="text"
              name="country"
              value={address.country}
              onChange={handleChange}
            />
          </div>

          {error && <p className="wizard-error">{error}</p>}
        </div>

        <div className="wizard-actions">
          <button type="button" className="wizard-back-btn" onClick={onBack}>
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

export default PropertyAddress;