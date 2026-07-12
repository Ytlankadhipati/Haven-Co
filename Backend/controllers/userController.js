import User from "../models/User.js";

// Called right after Google/Phone login — creates a new user
// if this firebaseUid hasn't been seen before, otherwise just
// returns the existing one.
export const syncUser = async (req, res) => {
  try {
    const { firebaseUid, fullName, email, phone } = req.body;

    if (!firebaseUid) {
      return res.status(400).json({ message: "firebaseUid is required" });
    }

    let user = await User.findOne({ firebaseUid });

    if (!user) {
      user = await User.create({
        firebaseUid,
        fullName: fullName || "",
        email: email || "",
        phone: phone || "",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Called from the "Complete your profile" form
export const updateProfile = async (req, res) => {
  try {
    const { firebaseUid, fullName, dob, gender, maritalStatus } = req.body;

    if (!firebaseUid) {
      return res.status(400).json({ message: "firebaseUid is required" });
    }

    const user = await User.findOneAndUpdate(
      { firebaseUid },
      { fullName, dob, gender, maritalStatus, profileCompleted: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Fetch a user's saved data by their Firebase UID
export const getUser = async (req, res) => {
  try {
    const { firebaseUid } = req.params;

    const user = await User.findOne({ firebaseUid });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};