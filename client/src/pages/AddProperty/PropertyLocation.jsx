import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LocationPicker from "../../components/LocationPicker"; // adjust path if needed
import geocodeAddress from "../../utils/geocodeAddress"; // adjust path if needed

const PropertyLocation = ({ addressData, onNext }) => {
  const [initialCenter, setInitialCenter] = useState(null);
  const [finalPosition, setFinalPosition] = useState(null);
  const [loadingGeocode, setLoadingGeocode] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const runInitialGeocode = async () => {
      setLoadingGeocode(true);
      const coords = await geocodeAddress(addressData);
      if (coords) {
        const center = { lat: coords.latitude, lng: coords.longitude };
        setInitialCenter(center);
        setFinalPosition(center);
      }
      setLoadingGeocode(false);
    };
    runInitialGeocode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirmLocation = () => {
    if (!finalPosition) {
      return;
    }
    onNext({
      latitude: finalPosition.lat,
      longitude: finalPosition.lng,
    });
  };

  return (
    <div className="wizard-page">
      <div className="wizard-card">
        <p className="wizard-eyebrow">HAVENCO · LIST YOUR PROPERTY</p>
        <h1 className="wizard-heading">Confirm your property's location</h1>

        {loadingGeocode ? (
          <p>Finding your address on the map...</p>
        ) : (
          <LocationPicker
            initialCenter={initialCenter}
            onLocationConfirm={(pos) => setFinalPosition(pos)}
          />
        )}

        <div className="wizard-actions">
          <button type="button" className="wizard-back-btn" onClick={() => navigate(-1)}>
            Back
          </button>
          <button
            type="button"
            className="wizard-next-btn"
            onClick={handleConfirmLocation}
            disabled={loadingGeocode}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyLocation;