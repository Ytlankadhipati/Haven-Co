import Hotel from "../models/Hotel.js";

// POST /api/hotels — manager creates a new hotel with image uploads
export const createHotel = async (req, res) => {
  try {
    const { name, location, price, originalPrice, amenities, description, managerId } = req.body;

    if (!name || !location || !price || !managerId) {
      return res.status(400).json({ message: "name, location, price, and managerId are required" });
    }

    // req.files comes from multer — each file has a .path (the Cloudinary URL)
    const imageUrls = req.files ? req.files.map((file) => file.path) : [];

    const hotel = await Hotel.create({
      name,
      location,
      price,
      originalPrice,
      amenities: amenities ? JSON.parse(amenities) : [],
      description,
      managerId,
      images: imageUrls,
    });

    res.status(201).json(hotel);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/hotels — public listing, supports query filters
export const getHotels = async (req, res) => {
  try {
    const { city, minPrice, maxPrice, minRating } = req.query;

    const query = { status: "approved" };

    if (city) {
      query.location = { $regex: city, $options: "i" };
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

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