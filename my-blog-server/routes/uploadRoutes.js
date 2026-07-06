import express from "express";
import { uploadEditorMedia } from "../controllers/upload.controller.js";
import { editorMediaUpload } from "../middleware/upload.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/editor",
  protect,
  editorMediaUpload.single("file"),
  uploadEditorMedia,
);

export default router;
