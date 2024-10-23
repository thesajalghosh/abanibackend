const cloudinary = require("cloudinary").v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadingImage = async (path) => {
  try {
    console.log(path);
    const result = await cloudinary.uploader.upload(path, {
      folder: "theabani", // Optional: Specify a folder in Cloudinary
      use_filename: true,
      unique_filename: false
    });

    console.log(result);

    return result;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

module.exports = { uploadingImage };
