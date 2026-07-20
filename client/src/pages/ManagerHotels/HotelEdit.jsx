import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useManagerAuth } from "../../context/ManagerAuthContext";

const HotelEdit = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const { managerToken } = useManagerAuth();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
  });
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
        });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("price", formData.price);
      form.append("description", formData.description);

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