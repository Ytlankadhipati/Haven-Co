import { useState } from "react";
import "./PropertyType.css";

const FACILITY_OPTIONS = [
  "Free WiFi", "Parking", "Breakfast Included", "Air Conditioning",
  "Swimming Pool", "Room Service", "TV", "Geyser / Hot Water",
  "Power Backup", "Elevator", "CCTV Security", "Pet Friendly",
];

const PropertyDetails = ({ onBack, onSubmit, submitting }) => {
  const [totalRooms, setTotalRooms] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [facilities, setFacilities] = useState([]);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState("");

  const toggleFacility = (facility) => {
    setFacilities((prev) =>
      prev.includes(facility) ? prev.filter((f) => f !== facility) : [...prev, facility]
    );
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 10);
    setImages(files);
    setPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = () => {
    if (!totalRooms || !price) {
      setError("Total rooms and price are required.");
      return;
    }
    if (images.length === 0) {
      setError("Please upload at least one photo.");
      return;
    }
    setError("");
    onSubmit({ totalRooms, price, originalPrice, facilities, description, images });
  };

  return (
    <div className="wizard-page">
      <div className="wizard-card">
        <p className="wizard-eyebrow">HAVENCO · LIST YOUR PROPERTY</p>
        <h1 className="wizard-heading">Tell us more about your property</h1>

        <div className="wizard-form">
          <div className="wizard-form-row">
            <div className="wizard-field">
              <label>Total Rooms *</label>
              <input
                type="number"
                min="1"
                value={totalRooms}
                onChange={(e) => setTotalRooms(e.target.value)}
                placeholder="e.g. 12"
              />
            </div>
            <div className="wizard-field">
              <label>Price per Night (₹) *</label>
              <input
                type="number"
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 2500"
              />
            </div>
          </div>

          <div className="wizard-field">
            <label>Original Price (optional, for showing discount)</label>
            <input
              type="number"
              min="1"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder="e.g. 3500"
            />
          </div>

          <div className="wizard-field">
            <label>Facilities</label>
            <div className="facility-grid">
              {FACILITY_OPTIONS.map((facility) => (
                <label key={facility} className="facility-checkbox">
                  <input
                    type="checkbox"
                    checked={facilities.includes(facility)}
                    onChange={() => toggleFacility(facility)}
                  />
                  {facility}
                </label>
              ))}
            </div>
          </div>

          <div className="wizard-field">
            <label>Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell guests what makes your property special..."
            />
          </div>

          <div className="wizard-field">
            <label>Photos * (up to 10)</label>
            <input type="file" accept="image/*" multiple onChange={handleImageChange} />
            {previews.length > 0 && (
              <div className="photo-preview-grid">
                {previews.map((src, i) => (
                  <img key={i} src={src} alt={`preview-${i}`} className="photo-preview" />
                ))}
              </div>
            )}
          </div>

          {error && <p className="wizard-error">{error}</p>}
        </div>

        <div className="wizard-actions">
          <button type="button" className="wizard-back-btn" onClick={onBack} disabled={submitting}>
            Back
          </button>
          <button type="button" className="wizard-next-btn" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit for Approval"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;