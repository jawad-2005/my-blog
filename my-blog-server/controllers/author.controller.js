import jwt from "jsonwebtoken";
import mongoose from "mongoose"; // ✅ ADD THIS IMPORT

import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import cloudinary from "../config/cloudinary.js"; // ✅ ADD THIS
import { profileUpdateSchema } from "../../Shared/validation.js";

// ─── Cloudinary Helpers (were missing!) ──────────────────────────────────────
const streamUpload = (buffer, folder = "blog") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    stream.end(buffer);
  });
};

const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl) return;
  try {
    const urlParts = imageUrl.split("/upload/");
    if (urlParts.length < 2) return;
    const withoutVersion = urlParts[1].replace(/^v\d+\//, "");
    const publicId = withoutVersion.replace(/\.[^/.]+$/, "");
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn("Failed to delete old Cloudinary image:", err.message);
  }
};

// ─── Helper: Extract userId from cookie or Bearer token ──────────────────────
const getUserIdFromRequest = (req) => {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith("Bearer")
      ? req.headers.authorization.split(" ")[1]
      : undefined);

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // ✅ Always return as plain string
    return decoded.id?.toString() ?? null;
  } catch {
    return null;
  }
};

// ─── Helper: Safe ObjectId validation ────────────────────────────────────────
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Get author profile with their posts
// @route   GET /api/authors/:authorId
// @access  Public
// ══════════════════════════════════════════════════════════════════════════════
export const getAuthorProfile = async (req, res) => {
  try {
    const { authorId } = req.params;

    // ✅ Validate authorId is a valid MongoDB ObjectId before querying
    if (!isValidObjectId(authorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid author ID format",
      });
    }

    const author = await User.findById(authorId).select(
      "name email avatar coverPhoto bio role createdAt followers",
    );

    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Author not found",
      });
    }

    const currentUserId = getUserIdFromRequest(req); // string or null

    // ✅ Convert author._id to string for reliable comparison
    const authorIdStr = author._id.toString();

    console.log("🔍 isOwnProfile Check:", {
      currentUserId, // e.g. "676abc123def456"
      authorIdStr, // e.g. "676abc123def456"
      authorIdFromParam: authorId, // e.g. "676abc123def456"
      isOwnProfile: currentUserId === authorIdStr,
    });

    const isFollowing = currentUserId
      ? author.followers.some((id) => id.toString() === currentUserId)
      : false;

    // ✅ KEY FIX: Compare currentUserId with author._id.toString()
    // NOT with authorId from req.params (they should be equal but
    // using author._id is the canonical source of truth)
    const isOwnProfile = currentUserId ? currentUserId === authorIdStr : false;

    const posts = await Post.find({ author: authorId })
      .populate("author", "name avatar email")
      .sort({ createdAt: -1 });

    const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
    const articlesCount = posts.length;
    const followersCount = author.followers?.length || 0;

    return res.status(200).json({
      success: true,
      data: {
        author: {
          id: author._id,
          name: author.name,
          email: author.email,
          avatar: author.avatar,
          coverPhoto: author.coverPhoto,
          bio: author.bio,
          role: author.role,
          joinDate: author.createdAt,
        },
        stats: {
          articlesCount,
          totalLikes,
          followersCount,
        },
        posts,
        isFollowing,
        isOwnProfile, // ✅ false for other users, true only for own profile
      },
    });
  } catch (error) {
    console.error("Get Author Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Get all authors
// @route   GET /api/authors
// @access  Public
// ══════════════════════════════════════════════════════════════════════════════
export const getAllAuthors = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 9);
    const skip = (page - 1) * limit;

    const query = { role: "author" };
    const totalAuthors = await User.countDocuments(query);
    const totalPages = Math.ceil(totalAuthors / limit);

    const authors = await User.find(query)
      .select("name email avatar coverPhoto bio role createdAt followers")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const authorsWithStats = await Promise.all(
      authors.map(async (author) => {
        const postCount = await Post.countDocuments({ author: author._id });
        return {
          ...author.toObject(),
          postCount,
          followersCount: author.followers?.length || 0,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      data: authorsWithStats,
      meta: {
        total: totalAuthors,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get All Authors Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Follow / Unfollow an author
// @route   PUT /api/authors/follow/:authorId
// @access  Private
// ══════════════════════════════════════════════════════════════════════════════
export const toggleFollowAuthor = async (req, res) => {
  try {
    const { authorId } = req.params;
    const currentUserId = req.user.id.toString(); // ✅ ensure string

    // ✅ Validate ObjectId
    if (!isValidObjectId(authorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid author ID format",
      });
    }

    // ✅ Prevent self-follow using string comparison
    if (authorId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const [author, currentUser] = await Promise.all([
      User.findById(authorId),
      User.findById(currentUserId),
    ]);

    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Author not found",
      });
    }

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isAlreadyFollowing = currentUser.following.some(
      (id) => id.toString() === authorId,
    );

    if (isAlreadyFollowing) {
      // ── UNFOLLOW ──
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== authorId,
      );
      author.followers = author.followers.filter(
        (id) => id.toString() !== currentUserId,
      );

      await Promise.all([currentUser.save(), author.save()]);

      return res.status(200).json({
        success: true,
        isFollowing: false,
        message: `You unfollowed ${author.name}`,
        followersCount: author.followers.length,
      });
    } else {
      // ── FOLLOW ──
      currentUser.following.push(authorId);
      author.followers.push(currentUserId);

      author.notifications.push({
        type: "follow",
        author: currentUserId,
        message: `${currentUser.name} started following you`,
        read: false,
        createdAt: new Date(),
      });

      await Promise.all([currentUser.save(), author.save()]);

      return res.status(200).json({
        success: true,
        isFollowing: true,
        message: `You are now following ${author.name}`,
        followersCount: author.followers.length,
      });
    }
  } catch (error) {
    console.error("Toggle Follow Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Upload Avatar
// @route   PUT /api/authors/avatar
// @access  Private
// ══════════════════════════════════════════════════════════════════════════════
export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await deleteFromCloudinary(user.avatar);
    const uploadResult = await streamUpload(req.file.buffer, "blog/avatars");
    user.avatar = uploadResult.secure_url;
    await user.save();

    return res.status(200).json({
      success: true,
      data: { avatar: user.avatar },
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Update author profile
// @route   PUT /api/authors/profile
// @access  Private
// ══════════════════════════════════════════════════════════════════════════════
export const updateProfile = async (req, res) => {
  try {
    const result = profileUpdateSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const { name, email, bio, currentPassword, newPassword } = result.data;

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (typeof bio !== "undefined") user.bio = bio;

    if (newPassword) {
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }
      user.password = newPassword;
    }

    const avatarFile = req.files?.avatar?.[0];
    if (avatarFile) {
      await deleteFromCloudinary(user.avatar);
      const uploadResult = await streamUpload(
        avatarFile.buffer,
        "blog/avatars",
      );
      user.avatar = uploadResult.secure_url;
    }

    const coverFile = req.files?.coverPhoto?.[0];
    if (coverFile) {
      await deleteFromCloudinary(user.coverPhoto);
      const uploadResult = await streamUpload(coverFile.buffer, "blog/covers");
      user.coverPhoto = uploadResult.secure_url;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        coverPhoto: user.coverPhoto,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
// ══════════════════════════════════════════════════════════════════════════════
// @desc    Get top 10 prolific authors (most active)
// @route   GET /api/authors/top/prolific
// @access  Public
// ══════════════════════════════════════════════════════════════════════════════
export const getProlificAuthors = async (req, res) => {
  try {
    // Get all authors and count their posts
    const authors = await User.find({
      role: { $in: ["author", "admin"] },
    }).select("name email avatar bio role followers createdAt");

    const authorsWithPostCount = await Promise.all(
      authors.map(async (author) => {
        const postCount = await Post.countDocuments({ author: author._id });
        return {
          ...author.toObject(),
          postCount,
          followersCount: author.followers?.length || 0,
        };
      }),
    );

    // Filter authors with at least 1 article, sort by post count (descending) and take top 10
    const topAuthors = authorsWithPostCount
      .filter((author) => author.postCount > 0) // Only include authors with articles
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      data: topAuthors,
    });
  } catch (error) {
    console.error("Get Prolific Authors Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
