import User from "../models/user.model.js";
import Post from "../models/post.model.js";

import { authorApplicationSchema } from "../../Shared/validation.js";

// @desc    Submit application to become an author
// @route   POST /api/users/apply-author
// @access  Private
export const submitAuthorApplication = async (req, res) => {
  try {
    const validation = authorApplicationSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid application data",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { portfolio, reason, sampleTitle } = validation.data;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.role === "author" || user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "You are already an author or admin",
      });
    }

    if (user.authorApplication?.status === "pending") {
      return res.status(400).json({
        success: false,
        message: "Your author application is already pending",
      });
    }

    if (!reason?.trim() || !sampleTitle?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide both a reason and a sample article title.",
      });
    }

    user.authorApplication = {
      portfolio: portfolio?.trim() || "",
      reason: reason.trim(),
      sampleTitle: sampleTitle.trim(),
      status: "pending",
    };

    await user.save();

    const admins = await User.find({ role: "admin" });
    const notificationMessage = `${user.name} has applied to become an author.`;

    await Promise.all(
      admins.map(async (admin) => {
        admin.notifications.push({
          author: user._id,
          message: notificationMessage,
          read: false,
          createdAt: Date.now(),
        });
        return admin.save();
      }),
    );

    res.status(200).json({
      success: true,
      message: "Application submitted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get all pending author applications
// @route   GET /api/admin/author-requests
// @access  Private/Admin
export const getPendingAuthors = async (req, res) => {
  try {
    const requests = await User.find({
      "authorApplication.status": "pending",
    }).select("name email avatar authorApplication createdAt");
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Approve or reject author application
// @route   PUT /api/admin/author-requests/:userId
// @access  Private/Admin
export const handleAuthorApplication = async (req, res) => {
  try {
    const { status } = req.body; // "approved" or "rejected"
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (status === "approved") {
      user.role = "author";
      user.authorApplication.status = "approved";

      // Notify the user
      user.notifications.push({
        type: "author_acceptance",
        message: "Your application to become an author has been approved!",
        read: false,
        createdAt: Date.now(),
      });
    } else if (status === "rejected") {
      user.authorApplication.status = "rejected";

      // Notify the user
      user.notifications.push({
        type: "author_acceptance",
        message: "Your application to become an author has been declined.",
        read: false,
        createdAt: Date.now(),
      });
    }

    await user.save();
    res
      .status(200)
      .json({ success: true, message: `Application ${status}`, user });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Get all authors and their posts
// @route   GET /api/admin/authors
// @access  Private/Admin
export const getAuthorsAndPosts = async (req, res) => {
  try {
    const authors = await User.find({ role: "author" }).select(
      "name email avatar",
    );

    const authorsWithPosts = await Promise.all(
      authors.map(async (author) => {
        const posts = await Post.find({ author: author._id }).select(
          "_id title status createdAt",
        );
        return {
          ...author.toObject(),
          posts,
        };
      }),
    );

    res.status(200).json({ success: true, authors: authorsWithPosts });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Get all registered users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsersAdmin = async (req, res) => {
  try {
    const users = await User.find()
      .select("name email role avatar createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, users });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Delete a user account
// @route   DELETE /api/admin/users/:userId
// @access  Private/Admin
export const deleteUserAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.role === "admin" || user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete this account",
      });
    }

    await Post.deleteMany({ author: user._id });
    await user.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Delete a post (Admin override)
// @route   DELETE /api/admin/posts/:postId
// @access  Private/Admin
export const deletePostAdmin = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const author = await User.findById(post.author);
    if (author) {
      author.notifications.push({
        post: post._id,
        message: `Your article "${post.title}" was removed by an admin.`,
        read: false,
        createdAt: Date.now(),
      });
      await author.save();
    }

    await post.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Get site statistics (total views and top articles)
// @route   GET /api/admin/site-stats
// @access  Private/Admin
export const getSiteStats = async (req, res) => {
  try {
    // Get total views across all posts
    const posts = await Post.find({}).select("title views author");

    const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);

    // Get top 5 most viewed articles with author info
    const topArticles = await Post.find({})
      .select("title views author createdAt")
      .populate("author", "name avatar email")
      .sort({ views: -1 })
      .limit(5);

    // Get total number of posts
    const totalPosts = posts.length;

    // Get total number of authors
    const totalAuthors = await User.countDocuments({ role: "author" });

    // Get total number of users
    const totalUsers = await User.countDocuments({});

    res.status(200).json({
      success: true,
      stats: {
        totalViews,
        totalPosts,
        totalAuthors,
        totalUsers,
        topArticles: topArticles.map((post) => ({
          _id: post._id,
          title: post.title,
          views: post.views || 0,
          author: post.author,
          createdAt: post.createdAt,
        })),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};
