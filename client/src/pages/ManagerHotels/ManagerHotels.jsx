import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useManagerAuth } from "../../context/ManagerAuthContext";

const statusStyles = {
  pending: { background: "#fff3cd", color: "#856404", label: "Under Review" },
  approved: { background: "#d4edda", color: "#155724", label: "Live" },
  rejected: { background: "#f8d7da", color: "#721c24", label: "Rejected" },
};

const ManagerHotels = () => {
  const navigate = useNavigate();
  const { managerToken, managerProfile, loading } = useManagerAuth();
  const [hotels, setHotels] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(true);

  const fetchHotels = async () => {
    if (!managerProfile) return;
    try {
      const res = await fetch(
        `http://localhost:5001/api/hotels/manager/${managerProfile._id}`,
        {
          headers: { Authorization: `Bearer ${managerToken}` },
        }
      );
      const data = await res.json();
      setHotels(data);
    } catch (error) {
      console.error("Failed to load hotels:", error);
    } finally {
      setLoadingHotels(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [managerProfile, managerToken]);

  const handleDelete = async (hotelId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this listing?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5001/api/hotels/${hotelId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${managerToken}` },
      });
      if (res.ok) {
        setHotels((prev) => prev.filter((h) => h._id !== hotelId));
      } else {
        alert("Failed to delete hotel.");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Something went wrong while deleting.");
    }
  };

  if (loading || loadingHotels) {
    return <p style={{ padding: "20px" }}>Loading your hotels...</p>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "20px" }}>My Hotels</h1>

      {hotels.length === 0 ? (
        <p>No hotels submitted yet.</p>
      ) : (
        hotels.map((hotel) => {
          const status = statusStyles[hotel.status] || statusStyles.pending;
          return (
            <div
              key={hotel._id}
              style={{
                display: "flex",
                gap: "15px",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "15px",
                alignItems: "center",
              }}
            >
              <img
                src={hotel.images?.[0] || "https://via.placeholder.com/100"}
                alt={hotel.name}
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  borderRadius: "6px",
                }}
              />

              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 5px 0" }}>{hotel.name}</h3>
                <p style={{ margin: "0 0 5px 0", color: "#555" }}>
                  ₹{hotel.price} / night
                </p>
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "13px",
                    fontWeight: "600",
                    background: status.background,
                    color: status.color,
                  }}
                >
                  {status.label}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <button
                  onClick={() => navigate(`/manager/hotels/edit/${hotel._id}`)}
                  style={{
                    padding: "6px 14px",
                    border: "1px solid #0f5257",
                    background: "white",
                    color: "#0f5257",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(hotel._id)}
                  style={{
                    padding: "6px 14px",
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
          );
        })
      )}
    </div>
  );
};

export default ManagerHotels;