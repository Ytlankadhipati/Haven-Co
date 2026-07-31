import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useManagerAuth } from "../../context/ManagerAuthContext";
import { API_BASE_URL } from "../../config/api";

const emptyForm = {
  roomTypeName: "",
  roomCategory: "Private",
  isAC: false,
  bedsPerUnit: "",
  bathroomType: "Private",
  pricePerNight: "",
  originalPrice: "",
  maxOccupancy: 2,
  totalRoomsOfThisType: "",
};

const RoomTypes = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const { managerToken } = useManagerAuth();

  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [occupancy, setOccupancy] = useState({});
  const [loadingOccupancy, setLoadingOccupancy] = useState(true);

  // --- walk-in booking form state ---
  const [walkInOpenFor, setWalkInOpenFor] = useState(null); // roomTypeId whose form is open
  const [walkInForm, setWalkInForm] = useState({
    guestName: "",
    guestPhone: "",
    checkIn: "",
    checkOut: "",
    numberOfGuests: 1,
    unitsBooked: 1,
  });
  const [walkInSaving, setWalkInSaving] = useState(false);
  const [walkInError, setWalkInError] = useState("");

  const fetchRoomTypes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/rooms/hotel/${hotelId}`);
      const data = await res.json();
      setRoomTypes(data);
    } catch (err) {
      console.error("Failed to load room types:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOccupancy = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/bookings/hotel/${hotelId}/occupancy`,
        { headers: { Authorization: `Bearer ${managerToken}` } }
      );
      const data = await res.json();
      if (res.ok) {
        const map = {};
        data.forEach((item) => {
          map[item.roomTypeId] = item;
        });
        setOccupancy(map);
      }
    } catch (err) {
      console.error("Failed to load occupancy:", err);
    } finally {
      setLoadingOccupancy(false);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
    if (managerToken) {
      fetchOccupancy();
    }
  }, [hotelId, managerToken]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setImages([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.roomCategory === "Dormitory" && (!form.bedsPerUnit || Number(form.bedsPerUnit) < 1)) {
      setError("Please enter how many beds this dormitory room has.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("hotelId", hotelId);
      formData.append("roomTypeName", form.roomTypeName);
      formData.append("roomCategory", form.roomCategory);
      formData.append("isAC", form.isAC);
      formData.append("bathroomType", form.bathroomType);
      formData.append("pricePerNight", form.pricePerNight);
      if (form.originalPrice) formData.append("originalPrice", form.originalPrice);
      formData.append("maxOccupancy", form.maxOccupancy);
      formData.append("totalRoomsOfThisType", form.totalRoomsOfThisType);
      if (form.roomCategory === "Dormitory") {
        formData.append("bedsPerUnit", form.bedsPerUnit);
      }
      formData.append("roomAmenities", JSON.stringify([]));
      images.forEach((file) => formData.append("images", file));

      const res = await fetch(`${API_BASE_URL}/api/rooms`, {
        method: "POST",
        headers: { Authorization: `Bearer ${managerToken}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to add room type");
        setSaving(false);
        return;
      }

      resetForm();
      fetchRoomTypes();
      fetchOccupancy();
    } catch (err) {
      console.error("Failed to add room type:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (roomTypeId) => {
    const confirmDelete = window.confirm("Delete this room type?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/rooms/${roomTypeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${managerToken}` },
      });
      if (res.ok) {
        setRoomTypes((prev) => prev.filter((r) => r._id !== roomTypeId));
      } else {
        alert("Failed to delete room type.");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // --- walk-in form handlers ---
  const handleWalkInChange = (e) => {
    const { name, value } = e.target;
    setWalkInForm((prev) => ({ ...prev, [name]: value }));
  };

  const openWalkInForm = (roomTypeId) => {
    setWalkInOpenFor(roomTypeId);
    setWalkInError("");
    setWalkInForm({
      guestName: "",
      guestPhone: "",
      checkIn: "",
      checkOut: "",
      numberOfGuests: 1,
      unitsBooked: 1,
    });
  };

  const handleWalkInSubmit = async (roomTypeId, currentHotelId) => {
    setWalkInError("");

    if (!walkInForm.guestName || !walkInForm.checkIn || !walkInForm.checkOut) {
      setWalkInError("Guest name, check-in, and check-out are required.");
      return;
    }

    setWalkInSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/offline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${managerToken}`,
        },
        body: JSON.stringify({
          hotelId: currentHotelId,
          roomTypeId,
          checkIn: walkInForm.checkIn,
          checkOut: walkInForm.checkOut,
          numberOfGuests: Number(walkInForm.numberOfGuests),
          unitsBooked: Number(walkInForm.unitsBooked),
          guestName: walkInForm.guestName,
          guestPhone: walkInForm.guestPhone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setWalkInError(data.message || "Failed to add booking");
        setWalkInSaving(false);
        return;
      }

      setWalkInOpenFor(null);
      fetchOccupancy();
    } catch (err) {
      console.error("Walk-in booking failed:", err);
      setWalkInError("Something went wrong. Please try again.");
    } finally {
      setWalkInSaving(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "0 auto" }}>
      <button
        onClick={() => navigate("/manager/hotels")}
        style={{ marginBottom: "15px", border: "none", background: "none", color: "#0f5257", cursor: "pointer" }}
      >
        ← Back to My Hotels
      </button>

      <h1 style={{ marginBottom: "20px" }}>Manage Room Types</h1>

      {loading ? (
        <p>Loading room types...</p>
      ) : (
        <div style={{ marginBottom: "30px" }}>
          {roomTypes.length === 0 ? (
            <p>No room types added yet.</p>
          ) : (
            roomTypes.map((rt) => {
              const occ = occupancy[rt._id];

              return (
                <div
                  key={rt._id}
                  style={{
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    padding: "12px 15px",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong>{rt.roomTypeName}</strong>{" "}
                      <span style={{ color: "#777", fontSize: "13px" }}>
                        ({rt.roomCategory}
                        {rt.isAC ? ", AC" : ", Non-AC"}
                        {rt.roomCategory === "Dormitory" ? `, ${rt.bedsPerUnit} beds/room` : ""}
                        , {rt.bathroomType} bathroom)
                      </span>
                      <p style={{ margin: "5px 0 0 0", color: "#555" }}>
                        ₹{rt.pricePerNight} / night · {rt.totalRoomsOfThisType} unit(s) available
                      </p>

                      {loadingOccupancy ? (
                        <p style={{ margin: "5px 0 0 0", color: "#999", fontSize: "13px" }}>
                          Loading occupancy...
                        </p>
                      ) : occ ? (
                        <p style={{ margin: "5px 0 0 0", fontSize: "13px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "2px 8px",
                              borderRadius: "10px",
                              background: occ.occupiedUnits > 0 ? "#fff3cd" : "#d4edda",
                              color: occ.occupiedUnits > 0 ? "#856404" : "#155724",
                              fontWeight: "600",
                              marginRight: "8px",
                            }}
                          >
                            {occ.occupiedUnits} occupied
                          </span>
                          <span style={{ color: "#155724", fontWeight: "600" }}>
                            {occ.vacantUnits} vacant
                          </span>
                          <span style={{ color: "#999" }}> (of {occ.totalUnits} total)</span>
                        </p>
                      ) : null}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <button
                        onClick={() =>
                          walkInOpenFor === rt._id ? setWalkInOpenFor(null) : openWalkInForm(rt._id)
                        }
                        style={{
                          padding: "6px 12px",
                          border: "1px solid #0f5257",
                          background: walkInOpenFor === rt._id ? "#0f5257" : "white",
                          color: walkInOpenFor === rt._id ? "white" : "#0f5257",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        {walkInOpenFor === rt._id ? "Cancel" : "+ Add Walk-in Booking"}
                      </button>
                      <button
                        onClick={() => handleDelete(rt._id)}
                        style={{
                          padding: "6px 12px",
                          border: "1px solid #c0392b",
                          background: "white",
                          color: "#c0392b",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {walkInOpenFor === rt._id && (
                    <div
                      style={{
                        marginTop: "12px",
                        paddingTop: "12px",
                        borderTop: "1px dashed #ccc",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <div style={{ display: "flex", gap: "10px" }}>
                        <input
                          type="text"
                          name="guestName"
                          placeholder="Guest name"
                          value={walkInForm.guestName}
                          onChange={handleWalkInChange}
                          style={{ flex: 1, padding: "6px" }}
                        />
                        <input
                          type="text"
                          name="guestPhone"
                          placeholder="Phone (optional)"
                          value={walkInForm.guestPhone}
                          onChange={handleWalkInChange}
                          style={{ flex: 1, padding: "6px" }}
                        />
                      </div>

                      <div style={{ display: "flex", gap: "10px" }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: "12px", color: "#777" }}>Check-in</label>
                          <input
                            type="date"
                            name="checkIn"
                            value={walkInForm.checkIn}
                            onChange={handleWalkInChange}
                            style={{ width: "100%", padding: "6px" }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: "12px", color: "#777" }}>Check-out</label>
                          <input
                            type="date"
                            name="checkOut"
                            value={walkInForm.checkOut}
                            onChange={handleWalkInChange}
                            style={{ width: "100%", padding: "6px" }}
                          />
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "10px" }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: "12px", color: "#777" }}>Guests</label>
                          <input
                            type="number"
                            name="numberOfGuests"
                            min="1"
                            value={walkInForm.numberOfGuests}
                            onChange={handleWalkInChange}
                            style={{ width: "100%", padding: "6px" }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: "12px", color: "#777" }}>Units to book</label>
                          <input
                            type="number"
                            name="unitsBooked"
                            min="1"
                            value={walkInForm.unitsBooked}
                            onChange={handleWalkInChange}
                            style={{ width: "100%", padding: "6px" }}
                          />
                        </div>
                      </div>

                      {walkInError && <p style={{ color: "#c0392b", fontSize: "13px" }}>{walkInError}</p>}

                      <button
                        onClick={() => handleWalkInSubmit(rt._id, hotelId)}
                        disabled={walkInSaving}
                        style={{
                          padding: "8px 14px",
                          border: "none",
                          background: "#0f5257",
                          color: "white",
                          borderRadius: "6px",
                          cursor: "pointer",
                          alignSelf: "flex-start",
                        }}
                      >
                        {walkInSaving ? "Saving..." : "Confirm Booking"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      <h2 style={{ marginBottom: "15px" }}>Add a Room Type</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <div>
          <label>Room Type Name</label>
          <input
            type="text"
            name="roomTypeName"
            value={form.roomTypeName}
            onChange={handleChange}
            placeholder="e.g. Deluxe Room, Suite, Standard Dorm"
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <div>
          <label>Category</label>
          <select
            name="roomCategory"
            value={form.roomCategory}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          >
            <option value="Private">Private Room (Standard / Deluxe / Suite etc.)</option>
            <option value="Dormitory">Dormitory (booked bed-by-bed)</option>
            <option value="EntirePlace">Entire Place (whole homestay/home)</option>
          </select>
        </div>

        {form.roomCategory === "Dormitory" && (
          <div>
            <label>Beds per Dormitory Room</label>
            <input
              type="number"
              name="bedsPerUnit"
              value={form.bedsPerUnit}
              onChange={handleChange}
              min="1"
              placeholder="e.g. 6"
              required
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            />
          </div>
        )}

        <div style={{ display: "flex", gap: "20px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="checkbox"
              name="isAC"
              checked={form.isAC}
              onChange={handleChange}
            />
            Air Conditioned (AC)
          </label>

          <div style={{ flex: 1 }}>
            <label>Bathroom</label>
            <select
              name="bathroomType"
              value={form.bathroomType}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            >
              <option value="Private">Private</option>
              <option value="Shared">Shared</option>
            </select>
          </div>
        </div>

        <div>
          <label>Price per night (₹)</label>
          <input
            type="number"
            name="pricePerNight"
            value={form.pricePerNight}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <div>
          <label>Original Price (optional, for showing a discount)</label>
          <input
            type="number"
            name="originalPrice"
            value={form.originalPrice}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <div>
          <label>Max Occupancy</label>
          <input
            type="number"
            name="maxOccupancy"
            value={form.maxOccupancy}
            onChange={handleChange}
            min="1"
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <div>
          <label>
            {form.roomCategory === "Dormitory" ? "Total Dormitory Rooms of this Type" : "Total Rooms of this Type"}
          </label>
          <input
            type="number"
            name="totalRoomsOfThisType"
            value={form.totalRoomsOfThisType}
            onChange={handleChange}
            min="1"
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <div>
          <label>Photos</label>
          <input type="file" multiple accept="image/*" onChange={handleImageChange} style={{ marginTop: "5px" }} />
        </div>

        {error && <p style={{ color: "#c0392b" }}>{error}</p>}

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "10px 20px",
            border: "none",
            background: "#0f5257",
            color: "white",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {saving ? "Adding..." : "Add Room Type"}
        </button>
      </form>
    </div>
  );
};

export default RoomTypes;