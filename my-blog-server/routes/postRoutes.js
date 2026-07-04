import express from "express";
import {
  getPosts,
  getPost,
  getCategories,
  getFeaturedPost,
  getPostsByCategory,
  createPost,
  updatePost,
  deletePost,
  toggleFeatured,
  likePost,
  bookmarkPost,
  addComment,
  getTopViewedArticles,
} from "../controllers/post.controller.js";
import upload from "../middlewares/uploadMiddleware.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { streamUpload } from "../utils/cloudinary.js"; // ← Add this import

const router = express.Router();

// ══════════════════════════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ══════════════════════════════════════════════════════════════════════════════

// Get all posts (with filtering & pagination)
router.get("/", getPosts);

// Search posts by query
router.get("/search", getPosts);

// Get featured post
router.get("/featured", getFeaturedPost);

// Get all categories
router.get("/categories", getCategories);

// Get top viewed articles
router.get("/top/viewed", getTopViewedArticles);

// Get posts by category
router.get("/category/:category", getPostsByCategory);

// ══════════════════════════════════════════════════════════════════════════════
// PROTECTED ROUTES
// ══════════════════════════════════════════════════════════════════════════════

// Upload image for CKEditor (MUST be before /:id route)
router.post(
  "/editor-image",
  protect,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        });
      }

      const result = await streamUpload(req.file.buffer, "blog/editor");

      res.status(200).json({
        success: true,
        url: result.secure_url,
      });
    } catch (error) {
      console.error("Editor Image Upload Error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);

// Create post (Author/Admin)
router.post(
  "/",
  protect,
  authorize("author", "admin"),
  upload.single("image"),
  createPost,
);

// Update post (Author/Admin)
router.put(
  "/:id",
  protect,
  authorize("author", "admin"),
  upload.single("image"),
  updatePost,
);

// Delete post (Author/Admin)
router.delete("/:id", protect, authorize("author", "admin"), deletePost);

// Toggle featured (Admin only)
router.patch("/:id/featured", protect, authorize("admin"), toggleFeatured);

// Like post (Any authenticated user)
router.patch("/:id/like", protect, likePost);
router.post("/:id/like", protect, likePost);
router.post("/:id/bookmark", protect, bookmarkPost);
router.post("/:id/comments", protect, addComment);

// Get single post (MUST be last among GET routes with /:id pattern)
router.get("/:id", getPost);

export default router; // ← Keep only one export
