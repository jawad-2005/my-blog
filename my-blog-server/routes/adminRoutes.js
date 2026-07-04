import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  getPendingAuthors,
  handleAuthorApplication,
  getAuthorsAndPosts,
  getAllUsersAdmin,
  deleteUserAdmin,
  deletePostAdmin,
  getSiteStats,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.get("/author-requests", getPendingAuthors);
router.put("/author-requests/:userId", handleAuthorApplication);
router.get("/authors", getAuthorsAndPosts);
router.get("/users", getAllUsersAdmin);
router.get("/site-stats", getSiteStats);
router.delete("/users/:userId", deleteUserAdmin);
router.delete("/posts/:postId", deletePostAdmin);

export default router;
