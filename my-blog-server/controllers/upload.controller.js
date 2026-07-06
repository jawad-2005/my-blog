import { streamUpload } from "../utils/cloudinary.js";

export const uploadEditorMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    if (!process.env.CLOUDINARY_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary is not configured",
      });
    }

    const isVideo = req.file.mimetype.startsWith("video/");
    const folder = isVideo ? "blog/editor/videos" : "blog/editor/images";
    const resourceType = isVideo ? "video" : "image";

    const result = await streamUpload(req.file.buffer, folder, resourceType);

    res.status(201).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    });
  } catch (error) {
    console.error("Editor media upload error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Editor media upload failed",
    });
  }
};
