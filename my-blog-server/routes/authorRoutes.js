import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  getAuthorProfile,
  getAllAuthors,
  updateProfile,
  updateAvatar,
  toggleFollowAuthor,
  getProlificAuthors,
} from "../controllers/author.controller.js";

const router = express.Router();

// Public Routes
router.get("/", getAllAuthors);
router.get("/top/prolific", getProlificAuthors);
// Follow / Unfollow
router.put("/follow/:authorId", protect, toggleFollowAuthor);

router.get("/:authorId", getAuthorProfile);

// Protected Routes
router.put("/avatar", protect, upload.single("avatar"), updateAvatar);
router.put(
  "/profile",
  protect,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverPhoto", maxCount: 1 },
  ]),
  updateProfile,
);

export default router;
