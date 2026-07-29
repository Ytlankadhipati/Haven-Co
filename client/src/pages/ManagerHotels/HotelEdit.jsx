import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useManagerAuth } from "../../context/ManagerAuthContext";

const AVAILABLE_AMENITIES = [
  "Free WiFi",
  "AC Rooms",
  "Parking",
  "Breakfast Included",
  "TV",
  "Couple Friendly",
  "Swimming Pool",
  "Gym",
];

const HotelEdit = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const { managerToken } = useManagerAuth();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    tag: "",
  });
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/hotels/${hotelId}`);
        const data = await res.json();
        setFormData({
          name: data.name || "",
          price: data.price || "",
          description: data.description || "",
          tag: data.tag || "",
        });
        setAmenities(data.amenities || []);
      } catch (error) {
        console.error("Failed to load hotel:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [hotelId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleAmenity = (item) => {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("price", formData.price);
      form.append("description", formData.description);
      form.append("tag", formData.tag);
      form.append("facilities", JSON.stringify(amenities)); // backend expects "facilities" key

      const res = await fetch(`http://localhost:5001/api/hotels/${hotelId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${managerToken}` },
        body: form,
      });

      if (res.ok) {
        alert("Hotel updated successfully!");
        navigate("/manager/hotels");
      } else {
        const err = await res.json();
        alert("Update failed: " + err.message);
      }
    } catch (error) {
      console.error("Update failed:", error);
      alert("Something went wrong while updating.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ padding: "20px" }}>Loading hotel details...</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <h1>Edit Hotel</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <div>
          <label>Hotel Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <div>
          <label>Price per night (₹)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <div>
          <label>Tag (optional — e.g. "New", "Editor's pick")</label>
          <input
            type="text"
            name="tag"
            value={formData.tag}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <div>
          <label>Facilities</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "8px" }}>
            {AVAILABLE_AMENITIES.map((item) => (
              <label
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  border: "1px solid #ccc",
                  borderRadius: "999px",
                  cursor: "pointer",
                  background: amenities.includes(item) ? "#0f5257" : "white",
                  color: amenities.includes(item) ? "white" : "black",
                }}
              >
                <input
                  type="checkbox"
                  checked={amenities.includes(item)}
                  onChange={() => toggleAmenity(item)}
                  style={{ display: "none" }}
                />
                {item}
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={() => navigate("/manager/hotels")}
            style={{ padding: "10px 20px", border: "1px solid #ccc", background: "white", borderRadius: "6px", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{ padding: "10px 20px", border: "none", background: "#0f5257", color: "white", borderRadius: "6px", cursor: "pointer" }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HotelEdit;