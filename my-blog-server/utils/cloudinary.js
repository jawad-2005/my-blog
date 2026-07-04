import { v2 as cloudinary } from "cloudinary";
import cloudinaryConfig from "../config/cloudinary.js";

/**
 * Upload a file BUFFER to Cloudinary using a stream.
 * Works with multer memoryStorage (req.file.buffer / req.files[].buffer),
 * so you never need temp files on disk.
 *
 * @param {Buffer} buffer - file buffer from multer
 * @param {string} folder - Cloudinary folder, e.g. "blog/avatars"
 * @returns {Promise<object>} upload result (contains secure_url, public_id, ...)
 */
export const streamUpload = (buffer, folder = "blog") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinaryConfig.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    stream.end(buffer);
  });
};

/**
 * Delete an asset from Cloudinary by its URL.
 * Safely does nothing if the URL is empty or not a Cloudinary URL.
 *
 * @param {string} imageUrl - the stored Cloudinary secure_url
 */
export const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes("cloudinary.com")) return;

  try {
    // Extract public_id from the URL (strip folder path + extension)
    // e.g. .../upload/v123/blog/avatars/abc.jpg -> blog/avatars/abc
    const parts = imageUrl.split("/");
    const fileName = parts[parts.length - 1]; // abc.jpg
    const folderPath = parts.slice(parts.indexOf("upload") + 2, -1).join("/");
    const publicId = folderPath
      ? `${folderPath}/${fileName.split(".")[0]}`
      : fileName.split(".")[0];

    await cloudinaryConfig.uploader.destroy(publicId, {
      resource_type: "image",
    });
  } catch (error) {
    console.error("Cloudinary delete error:", error.message);
  }
};

export default cloudinary;

// this file centralizes Cloudinary interactions, providing a clean interface for uploading and deleting images. The streamUpload function allows us to upload image buffers directly to Cloudinary, while deleteFromCloudinary handles the deletion of images based on their URL. This abstraction keeps our controllers clean
