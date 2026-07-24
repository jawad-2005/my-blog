import express from "express";
import multer from "multer";

import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  register,
  login,
  verifyOTP,
  resendOTP,
  updateAvatar,
  logoutUser,
  getMe,
  getBookmarks,
  getFollowingAuthors,
  updateProfile,
  getNotifications,
  markNotificationsRead,
  deleteNotification,
} from "../controllers/user.controller.js";
import { submitAuthorApplication } from "../controllers/admin.controller.js";

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max per file
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed"), false);
    }
  },
});

// --- Routes ---

// Public Routes
router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", login);
router.get("/logout", logoutUser);
router.get("/me", protect, getMe);
router.get("/bookmarks", protect, getBookmarks);
router.get("/following", protect, getFollowingAuthors);
router.post("/apply-author", protect, submitAuthorApplication);

// Protected Routes
// Standalone avatar upload
router.put("/avatar", protect, upload.single("avatar"), updateAvatar);

// Full profile update (text fields + avatar + coverPhoto)
router.put(
  "/profile",
  protect,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverPhoto", maxCount: 1 },
  ]),
  updateProfile,
);

// Admin Only Route Example
router.get("/admin-dashboard", protect, authorize("admin"), (req, res) => {
  res.send("Hello Admin");
});

// Notifications
router.get("/notifications", protect, getNotifications);
router.put("/notifications/read", protect, markNotificationsRead);
router.delete("/notifications/:notificationId", protect, deleteNotification);

export default router;
