import React, { useState, useRef, useEffect } from "react";
import "./GuestSelector.css";

const GuestSelector = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const update = (field, delta) => {
    const next = { ...value, [field]: Math.max(field === "rooms" ? 1 : 1, value[field] + delta) };
    onChange(next);
  };

  return (
    <div className="guest-selector" ref={ref}>
      <button type="button" className="guest-selector__trigger" onClick={() => setOpen((o) => !o)}>
        {value.adults} Adults · {value.rooms} Room{value.rooms > 1 ? "s" : ""}
      </button>

      {open && (
        <div className="guest-selector__panel">
          <div className="guest-selector__row">
            <span>Adults</span>
            <div className="guest-selector__counter">
              <button type="button" onClick={() => update("adults", -1)}>−</button>
              <span>{value.adults}</span>
              <button type="button" onClick={() => update("adults", 1)}>+</button>
            </div>
          </div>

          <div className="guest-selector__row">
            <span>Rooms</span>
            <div className="guest-selector__counter">
              <button type="button" onClick={() => update("rooms", -1)}>−</button>
              <span>{value.rooms}</span>
              <button type="button" onClick={() => update("rooms", 1)}>+</button>
            </div>
          </div>

          <button type="button" className="guest-selector__done" onClick={() => setOpen(false)}>
            Done
          </button>
        </div>
      )}
    </div>
  );
};

export default GuestSelector;