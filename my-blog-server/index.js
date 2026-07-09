import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import cookieParser from "cookie-parser";

// Import configurations and routes
import connectDB from "./config/db.js";
import "./config/cloudinary.js";
import userRoutes from "./routes/userRoutes.js";
import authorRoutes from "./routes/authorRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

// 1. Load environment variables
dotenv.config();

// 2. Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "/uploads");
try {
  await fs.mkdir(uploadsDir, { recursive: true });
} catch (error) {
  console.error("Failed to create uploads directory:", error);
}

// ══════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE
// ══════════════════════════════════════════════════════════════════════════════
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// ══════════════════════════════════════════════════════════════════════════════
// ROUTES
// ══════════════════════════════════════════════════════════════════════════════
app.use("/api/users", userRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/uploads", uploadRoutes);

//  for fist time check server is run or not you don't need always 
/* app.get("/", (req, res) => {
  res.json({
    message: "🚀 Blog API is running!",
    endpoints: {
      users: "/api/users",
      authors: "/api/authors",
      posts: "/api/posts",
    },
  });
}); */

// SERVE FRONTEND (FOR PRODUCTION)
// ══════════════════════════════════════════════════════════════════════════════
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend-blog/dist");

  app.use(express.static(frontendPath));

  app.get("{*path}", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
} 

// ══════════════════════════════════════════════════════════════════════════════
// ERROR HANDLING
// ══════════════════════════════════════════════════════════════════════════════
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// START SERVER
// ══════════════════════════════════════════════════════════════════════════════
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  // console.log(`📚 API Documentation: http://localhost:${PORT}/`);
});
