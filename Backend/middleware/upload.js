import multer from "multer";
import pkg from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const { CloudinaryStorage } = pkg;

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isPdf =
      file.mimetype === "application/pdf" ||
      file.originalname.toLowerCase().endsWith(".pdf");
    const isDoc = file.fieldname === "document";

    if (isPdf) {
      return {
        folder: isDoc ? "havenco/kyc" : "havenco/documents",
        resource_type: "raw",
        format: "pdf",
      };
    }

    return {
      folder: isDoc ? "havenco/kyc" : "havenco/hotels",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 1200, height: 800, crop: "limit" }],
    };
  },
});

export default multer({ storage });