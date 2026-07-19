import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_CENTER = { lat: 22.9734, lng: 78.6569 };

function ClickHandler({ onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function RecenterOnChange({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], map.getZoom());
    }
  }, [center, map]);
  return null;
}

const LocationPicker = ({ initialCenter, onLocationConfirm }) => {
  const [position, setPosition] = useState(initialCenter || DEFAULT_CENTER);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState("");
  const markerRef = useRef(null);

  useEffect(() => {
    if (initialCenter) {
      setPosition(initialCenter);
    }
  }, [initialCenter]);

  const handlePositionChange = (newPos) => {
    setPosition(newPos);
    onLocationConfirm(newPos);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocateError("Your browser doesn't support location access.");
      return;
    }
    setLocating(true);
    setLocateError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        handlePositionChange(newPos);
        setLocating(false);
      },
      (err) => {
        setLocateError("Couldn't get your location. Please pin it manually on the map.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker) {
        const { lat, lng } = marker.getLatLng();
        handlePositionChange({ lat, lng });
      }
    },
  };

  return (
    <div className="location-picker-wrapper">
      <div className="location-picker-header">
        <p className="wizard-subheading">Pin your exact location</p>
        <button
          type="button"
          className="wizard-back-btn"
          onClick={handleUseMyLocation}
          disabled={locating}
        >
          {locating ? "Locating..." : "📍 Use my current location"}
        </button>
      </div>

      {locateError && <p className="wizard-error">{locateError}</p>}

      <div style={{ height: "350px", borderRadius: "8px", overflow: "hidden" }}>
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={[position.lat, position.lng]}
            draggable={true}
            eventHandlers={eventHandlers}
            ref={markerRef}
          />
          <ClickHandler onPositionChange={handlePositionChange} />
          <RecenterOnChange center={initialCenter} />
        </MapContainer>
      </div>

      <p className="wizard-hint" style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>
        Click anywhere on the map, or drag the pin, to set your property's exact location.
      </p>
    </div>
  );
};

export default LocationPicker;