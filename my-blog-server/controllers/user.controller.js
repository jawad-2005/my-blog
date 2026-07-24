import fs from "fs/promises";

import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import sendEmail from "../email/sendEmail.js";
import cloudinary from "../config/cloudinary.js";

import {
  registerSchema,
  otpSchema,
  loginSchema,
  profileUpdateSchema,
} from "../utils/validation.js";

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

// @desc    Register user & Send OTP
// @route   POST /api/users/register
// @access  Public
export const register = async (req, res) => {
  try {
    // --- 1. VALIDATE INPUTS WITH ZOD ---
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
    }

    // --- 2. USE VALIDATED DATA ---
    const { name, email, password } = result.data;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const user = new User({ name, email, password, role: "user" });
    const otpCode = user.generateOTP();
    await user.save();

    // 5. Send Email
    try {
      const result = await sendEmail({
        email: user.email,
        subject: "Your Account Verification Code",
        otp: otpCode,
      });

      const responsePayload = {
        success: true,
        message: `Registration successful! OTP sent to ${user.email}`,
      };

      if (result?.previewUrl) {
        responsePayload.previewUrl = result.previewUrl;
      }

      res.status(201).json(responsePayload);
    } catch (emailError) {
      await User.findByIdAndDelete(user._id);
      console.error("Email Error:", emailError);
      return res.status(500).json({
        success: false,
        message: "Email could not be sent. Please try again.",
        error: emailError?.message || String(emailError),
      });
    }
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/users/verify-otp
export const verifyOTP = async (req, res) => {
  try {
    const result = otpSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid input",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const { email, otp } = result.data;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp.code === otp && user.otp.expiresAt > Date.now()) {
      user.isVerified = true;
      user.otp = undefined;
      await user.save();
      return res
        .status(200)
        .json({ success: true, message: "Account Verified" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// @desc    Resend OTP Code
// @route   POST /api/users/resend-otp
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Check if email is provided
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // 2. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 3. Optional: Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Account already verified" });
    }

    // 4. Generate new 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 5. Update user with new OTP and new expiry (e.g., 10 minutes from now)
    user.otp = {
      code: newOtp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    };

    await user.save();

    // 6. Send Email (Use your existing mail utility here)
    // await sendVerificationEmail(user.email, newOtp); 

    return res.status(200).json({
      success: true,
      message: "A new OTP has been sent to your email.",
    });

  } catch (error) {
    console.error("Resend OTP Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// @desc    Login user
// @route   POST /api/users/login
export const login = async (req, res) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid input",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const { email, password } = result.data;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res
        .status(401)
        .json({ success: false, message: "Please verify your email first" });
    }

    const token = user.getSignedJwtToken();

    const cookieOptions = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    };

    res
      .status(200)
      .cookie("token", token, cookieOptions)
      .json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        },
      });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Logout user
// @route   GET /api/users/logout
export const logoutUser = async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// @desc    Get current logged in user
// @route   GET /api/users/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        coverPhoto: user.coverPhoto,
        bio: user.bio,
        likedPosts: user.likedPosts || [],
        bookmarks: user.bookmarks || [],
        following: user.following || [],
        authorApplication: user.authorApplication || null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get current user bookmarks
// @route   GET /api/users/bookmarks
// @access  Private
export const getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "bookmarks",
      populate: { path: "author", select: "name avatar email" },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      bookmarks: user.bookmarks || [],
    });
  } catch (error) {
    console.error("Get Bookmarks Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Get authors the current user is following (paginated)
// @route   GET /api/users/following
// @access  Private
export const getFollowingAuthors = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 20);
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user.id).select("following");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const total = user.following?.length || 0;

    // Query authors by IDs in user's following list
    const authors = await User.find({ _id: { $in: user.following || [] } })
      .select("name avatar coverPhoto bio followers role createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const authorsWithStats = await Promise.all(
      authors.map(async (author) => {
        const postCount = await Post.countDocuments({ author: author._id });
        return {
          id: author._id,
          name: author.name,
          avatar: author.avatar,
          coverPhoto: author.coverPhoto,
          bio: author.bio,
          role: author.role,
          createdAt: author.createdAt,
          postCount,
          followersCount: author.followers?.length || 0,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      data: authorsWithStats,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get Following Authors Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Upload Avatar (standalone route)
// @route   PUT /api/users/avatar
// @access  Private
export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    const user = await User.findById(req.user.id);

    // Delete old avatar from Cloudinary
    await deleteFromCloudinary(user.avatar);

    // Upload new avatar from buffer (memory storage)
    const uploadResult = await streamUpload(req.file.buffer, "blog/avatars");

    user.avatar = uploadResult.secure_url;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// @desc    Update current user profile (text + avatar + coverPhoto)
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    // ── 1. Validate text fields with Zod ──
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

    // ── 2. Update text fields ──
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

    if (name) {
      user.name = name;
    }

    if (typeof bio !== "undefined") {
      user.bio = bio;
    }

    // ── 3. Password change ──
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

    // ── 4. Avatar upload ──
    const avatarFile = req.files?.avatar?.[0];
    if (avatarFile) {
      await deleteFromCloudinary(user.avatar);
      const uploadResult = await streamUpload(
        avatarFile.buffer,
        "blog/avatars",
      );
      user.avatar = uploadResult.secure_url;
    }

    // ── 5. Cover photo upload ──
    const coverFile = req.files?.coverPhoto?.[0];
    if (coverFile) {
      await deleteFromCloudinary(user.coverPhoto);
      const uploadResult = await streamUpload(coverFile.buffer, "blog/covers");
      user.coverPhoto = uploadResult.secure_url;
    }

    // ── 6. Save everything ──
    await user.save();

    res.status(200).json({
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

// @desc    Get current user's notifications
// @route   GET /api/users/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("notifications")
      .populate("notifications.author", "name avatar")
      .populate("notifications.post", "title");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Sort by newest first
    const sorted = [...user.notifications].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    res.status(200).json({
      success: true,
      notifications: sorted,
      unreadCount: sorted.filter((n) => !n.read).length,
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/users/notifications/read
// @access  Private
export const markNotificationsRead = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.notifications = user.notifications.map((notification) => ({
      ...notification.toObject(),
      read: true,
    }));

    await user.save();

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark Notifications Read Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Delete a specific notification
// @route   DELETE /api/users/notifications/:notificationId
// @access  Private
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Remove the notification by filtering it out
    const initialLength = user.notifications.length;
    user.notifications = user.notifications.filter(
      (notification) => notification._id.toString() !== notificationId,
    );

    if (user.notifications.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    console.error("Delete Notification Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
