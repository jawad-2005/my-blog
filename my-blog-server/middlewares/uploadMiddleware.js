//  this file is for uploading images to the server, it uses multer to handle file uploads and stores them in memory. The fileFilter function ensures that only certain image types are allowed, and the limits option restricts the maximum file size to 5 MB.

import multer from "multer";

const storage = multer.memoryStorage();

const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const videoTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];

// For featured/cover image only
const imageFileFilter = (req, file, cb) => {
  if (imageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed"), false);
  }
};

const editorMediaFileFilter = (req, file, cb) => {
  if ([...imageTypes, ...videoTypes].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image and video files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB for cover image
});

export const editorMediaUpload = multer({
  storage,
  fileFilter: editorMediaFileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB for editor videos/images
});

export default upload;

