import express from "express";
import { uploadEditorMedia } from "../controllers/upload.controller.js";
import { editorMediaUpload } from "../middlewares/uploadMiddleware.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/editor",
  protect,
  editorMediaUpload.single("file"),
  uploadEditorMedia,
);

export default router;
