import Hotel from "../models/Hotel.js";

// POST /api/hotels — manager creates a new hotel with image uploads
export const createHotel = async (req, res) => {
  try {
    const { name, propertyType, location, address, totalRooms, price, originalPrice, facilities, description } = req.body;

    if (!name || !propertyType || !location || !price || !totalRooms) {
      return res.status(400).json({ message: "name, propertyType, location, price, and totalRooms are required" });
    }

    // managerId comes from the verified JWT token (managerAuth middleware), NEVER from req.body
    const managerId = req.manager.managerId;

    const imageUrls = req.files ? req.files.map((file) => file.path) : [];

    const hotel = await Hotel.create({
      name,
      propertyType,
      location,
      address: JSON.parse(address), // sent as JSON string from FormData
      totalRooms,
      price,
      originalPrice,
      facilities: facilities ? JSON.parse(facilities) : [],
      description,
      managerId,
      images: imageUrls,
    });

    res.status(201).json(hotel);
  } catch (error) {
    console.error("Create hotel error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/hotels — public listing, supports query filters
export const getHotels = async (req, res) => {
  try {
    const { city, minPrice, maxPrice, minRating } = req.query;
    const query = { status: "approved" };

    if (city) query.location = { $regex: city, $options: "i" };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (minRating) query.rating = { $gte: Number(minRating) };

    const hotels = await Hotel.find(query).sort({ createdAt: -1 });
    res.status(200).json(hotels);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/hotels/manager/:managerId — a manager's own hotels (any status)
export const getHotelsByManager = async (req, res) => {
  try {
    const hotels = await Hotel.find({ managerId: req.params.managerId }).sort({ createdAt: -1 });
    res.status(200).json(hotels);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/hotels/:id — single hotel detail
export const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    res.status(200).json(hotel);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// PUT /api/hotels/:id — manager updates their own hotel
export const updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    if (hotel.managerId !== req.manager.managerId) {
      return res.status(403).json({ message: "You are not authorized to edit this hotel" });
    }

    const { name, propertyType, location, address, totalRooms, price, originalPrice, facilities, description } = req.body;

    if (name) hotel.name = name;
    if (propertyType) hotel.propertyType = propertyType;
    if (location) hotel.location = location;
    if (address) hotel.address = JSON.parse(address);
    if (totalRooms) hotel.totalRooms = totalRooms;
    if (price) hotel.price = price;
    if (originalPrice) hotel.originalPrice = originalPrice;
    if (facilities) hotel.facilities = JSON.parse(facilities);
    if (description) hotel.description = description;

    if (req.files && req.files.length > 0) {
      hotel.images = req.files.map((file) => file.path);
    }

    await hotel.save();
    res.status(200).json(hotel);
  } catch (error) {
    console.error("Update hotel error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/hotels/:id — manager deletes their own hotel
export const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    if (hotel.managerId !== req.manager.managerId) {
      return res.status(403).json({ message: "You are not authorized to delete this hotel" });
    }

    await hotel.deleteOne();
    res.status(200).json({ message: "Hotel deleted successfully" });
  } catch (error) {
    console.error("Delete hotel error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};