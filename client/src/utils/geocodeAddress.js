const geocodeAddress = async ({ road, city, state, pincode }) => {
    try {
      const query = encodeURIComponent(
        `${road || ""}, ${city}, ${state}, ${pincode || ""}, India`
      );
  
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
  
      if (!response.ok) {
        console.error("Geocoding request failed:", response.status);
        return null;
      }
  
      const results = await response.json();
  
      if (!results || results.length === 0) {
        console.warn("No geocoding match found for this address");
        return null;
      }
  
      return {
        latitude: parseFloat(results[0].lat),
        longitude: parseFloat(results[0].lon),
      };
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };
  
  export default geocodeAddress;