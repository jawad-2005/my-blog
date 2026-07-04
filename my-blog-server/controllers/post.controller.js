import Post from "../models/post.model.js"; // Adjust path as needed
import User from "../models/user.model.js";
import { streamUpload } from "../utils/cloudinary.js";

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Get all posts with filtering and pagination
// @route   GET /api/posts
// @access  Public
// ══════════════════════════════════════════════════════════════════════════════
export const getPosts = async (req, res) => {
  try {
    const {
      category,
      author,
      search,
      q,
      page = 1,
      limit = 10,
      sort = "-createdAt",
    } = req.query;

    const searchTerm = search || q;

    // Build query
    const query = {};

    if (category && category !== "all") {
      query.category = new RegExp(`^${category}$`, "i"); // Case-insensitive exact match
    }

    if (author) {
      query.author = author;
    }

    if (searchTerm) {
      query.$or = [
        { title: new RegExp(searchTerm, "i") },
        { content: new RegExp(searchTerm, "i") },
        { excerpt: new RegExp(searchTerm, "i") },
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const posts = await Post.find(query)
      .populate("author", "name avatar email")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await Post.countDocuments(query);

    res.status(200).json({
      success: true,
      posts,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      hasMore: skip + posts.length < total,
    });
  } catch (error) {
    console.error("Get Posts Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
// ══════════════════════════════════════════════════════════════════════════════
export const getPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id).populate(
      "author",
      "name avatar email bio coverPhoto",
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("Get Post Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Get all unique categories
// @route   GET /api/posts/categories
// @access  Public
// ══════════════════════════════════════════════════════════════════════════════
export const getCategories = async (req, res) => {
  try {
    const categories = await Post.distinct("category");

    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Post.countDocuments({ category: cat });
        return { name: cat, count };
      }),
    );

    res.status(200).json({
      success: true,
      categories: categoriesWithCount.sort((a, b) => b.count - a.count),
    });
  } catch (error) {
    console.error("Get Categories Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Get featured post
// @route   GET /api/posts/featured
// @access  Public
// ══════════════════════════════════════════════════════════════════════════════
export const getFeaturedPost = async (req, res) => {
  try {
    let post = await Post.findOne({ isFeatured: true })
      .populate("author", "name avatar email")
      .sort("-createdAt");

    // If no explicitly featured post, fall back to a special post
    if (!post) {
      post = await Post.findOne({ isSpecial: true })
        .populate("author", "name avatar email")
        .sort("-createdAt");
    }

    // If still none, get the latest post
    if (!post) {
      post = await Post.findOne()
        .populate("author", "name avatar email")
        .sort("-createdAt");
    }

    res.status(200).json({
      success: true,
      data: post,
      post,
    });
  } catch (error) {
    console.error("Get Featured Post Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Get posts by category
// @route   GET /api/posts/category/:category
// @access  Public
// ══════════════════════════════════════════════════════════════════════════════
export const getPostsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 9 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const posts = await Post.find({
      category: new RegExp(`^${category}$`, "i"),
    })
      .populate("author", "name avatar email")
      .sort("-createdAt")
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments({
      category: new RegExp(`^${category}$`, "i"),
    });

    res.status(200).json({
      success: true,
      posts,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      category,
    });
  } catch (error) {
    console.error("Get Posts By Category Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Create new post
// @route   POST /api/posts
// @access  Private (Author/Admin)
// ══════════════════════════════════════════════════════════════════════════════

export const createPost = async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      category,
      isSpecial,
      isFeatured: featuredFlag,
      hashtags,
    } = req.body;
    let imageUrl = "";
    let coverUrl = "";

    // Upload image to Cloudinary if provided
    if (req.file) {
      try {
        if (process.env.CLOUDINARY_API_KEY) {
          const result = await streamUpload(req.file.buffer, "blog/posts");
          imageUrl = result.secure_url;
          coverUrl = result.secure_url;
        } else {
          console.warn("Cloudinary not configured; skipping image upload.");
        }
      } catch (uploadErr) {
        console.error("Image upload error:", uploadErr);
        return res.status(500).json({
          success: false,
          message: uploadErr.message || "Image upload failed",
        });
      }
    }

    // Calculate read time
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    // Parse hashtags
    let parsedHashtags = [];
    const rawHashtags = hashtags || req.body["hashtags[]"];

    if (rawHashtags) {
      try {
        if (Array.isArray(rawHashtags)) {
          parsedHashtags = rawHashtags;
        } else if (typeof rawHashtags === "string") {
          try {
            parsedHashtags = JSON.parse(rawHashtags);
          } catch (parseError) {
            parsedHashtags = [rawHashtags];
          }
        }

        parsedHashtags = parsedHashtags
          .filter((tag) => typeof tag === "string" && tag.trim())
          .map((tag) => tag.trim().replace(/^#/, ""));
      } catch (e) {
        parsedHashtags = [];
      }
    }

    // If this post is marked special, make it the featured post
    const isFeatured =
      featuredFlag === "true" ||
      featuredFlag === true ||
      isSpecial === "true" ||
      isSpecial === true;
    if (isFeatured) {
      await Post.updateMany({}, { isFeatured: false });
    }

    // Create post
    const newPost = await Post.create({
      title,
      content,
      excerpt: excerpt || "",
      category,
      hashtags: parsedHashtags,
      image: imageUrl,
      cover: coverUrl,
      author: req.user.id,
      isSpecial: isFeatured,
      isFeatured,
      readTime: `${readTime} min read`,
    });

    await newPost.populate("author", "name avatar email");

    // Notify followers on new post
    const author = await User.findById(req.user.id).select("followers name");
    if (author) {
      await User.updateMany(
        { _id: { $in: author.followers } },
        {
          $push: {
            notifications: {
              type: "new_post",
              author: author._id,
              post: newPost._id,
              message: `${author.name} published a new article: ${newPost.title}`,
            },
          },
        },
      );
    }

    res.status(201).json({
      success: true,
      data: newPost,
      message: "Post created successfully",
    });
  } catch (error) {
    console.error("Create Post Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private (Author/Admin)
// ══════════════════════════════════════════════════════════════════════════════
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, category } = req.body;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check authorization
    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this post",
      });
    }

    // Handle new image upload
    let imageUrl = post.image;
    let coverUrl = post.cover;

    if (req.file) {
      try {
        if (process.env.CLOUDINARY_API_KEY) {
          const result = await streamUpload(req.file.buffer, "blog/posts");
          imageUrl = result.secure_url;
          coverUrl = result.secure_url;
        }
      } catch (uploadErr) {
        console.error("Image upload error:", uploadErr);
        return res.status(500).json({
          success: false,
          message: uploadErr.message || "Image upload failed",
        });
      }
    }

    // Recalculate read time
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    // Update post
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        title,
        content,
        excerpt,
        category,
        image: imageUrl,
        cover: coverUrl,
        readTime: `${readTime} min read`,
      },
      { new: true, runValidators: true },
    ).populate("author", "name avatar email");

    res.status(200).json({
      success: true,
      data: updatedPost,
      message: "Post updated successfully",
    });
  } catch (error) {
    console.error("Update Post Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private (Author/Admin)
// ══════════════════════════════════════════════════════════════════════════════
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check authorization
    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this post",
      });
    }

    await Post.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete Post Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Toggle featured status
// @route   PATCH /api/posts/:id/featured
// @access  Private (Admin only)
// ══════════════════════════════════════════════════════════════════════════════
export const toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // If featuring this post, unfeature all others
    if (!post.isFeatured) {
      await Post.updateMany({}, { isFeatured: false });
    }

    post.isFeatured = !post.isFeatured;
    await post.save();

    res.status(200).json({
      success: true,
      data: post,
      message: `Post ${post.isFeatured ? "featured" : "unfeatured"} successfully`,
    });
  } catch (error) {
    console.error("Toggle Featured Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Bookmark / Unbookmark post for current user
// @route   POST /api/posts/:id/bookmark
// @access  Private
// ══════════════════════════════════════════════════════════════════════
export const bookmarkPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const alreadyBookmarked = user.bookmarks.some(
      (bookmark) => bookmark.toString() === id,
    );

    if (alreadyBookmarked) {
      user.bookmarks = user.bookmarks.filter(
        (bookmark) => bookmark.toString() !== id,
      );
    } else {
      user.bookmarks.push(post._id);
    }

    await user.save();

    res.status(200).json({
      success: true,
      bookmarked: !alreadyBookmarked,
    });
  } catch (error) {
    console.error("Bookmark Post Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
// ══════════════════════════════════════════════════════════════════════════════
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, parentId } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = {
      user: req.user._id,
      name: req.user.name,
      avatar: req.user.avatar || "",
      comment: text.trim(),
    };

    // If parentId is provided, treat this as a reply to an existing comment
    if (parentId) {
      const parentComment = post.comments.id(parentId);
      if (!parentComment) {
        return res
          .status(404)
          .json({ success: false, message: "Parent comment not found" });
      }

      parentComment.replies = parentComment.replies || [];
      parentComment.replies.unshift(comment);
      await post.save();

      // Return the newly added reply
      return res.status(201).json({
        success: true,
        reply: parentComment.replies[0],
        parentId,
      });
    }

    // Otherwise add a top-level comment
    post.comments.unshift(comment);
    await post.save();

    res.status(201).json({
      success: true,
      comment: post.comments[0],
    });
  } catch (error) {
    console.error("Add Comment Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Like/Unlike post
// @route   PATCH /api/posts/:id/like
// @access  Private
// ══════════════════════════════════════════════════════════════════════
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const alreadyLiked = user.likedPosts.some(
      (likedPost) => likedPost.toString() === id,
    );

    if (alreadyLiked) {
      user.likedPosts = user.likedPosts.filter(
        (likedPost) => likedPost.toString() !== id,
      );
      post.likes = Math.max(0, post.likes - 1);
    } else {
      user.likedPosts.push(post._id);
      post.likes += 1;
    }

    await Promise.all([user.save(), post.save()]);

    res.status(200).json({
      success: true,
      liked: !alreadyLiked,
      likes: post.likes,
    });
  } catch (error) {
    console.error("Like Post Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Get top 5 most viewed articles
// @route   GET /api/posts/top/viewed
// @access  Public
// ══════════════════════════════════════════════════════════════════════════════
export const getTopViewedArticles = async (req, res) => {
  try {
    const topArticles = await Post.find({})
      .select("title cover image views author createdAt category")
      .populate("author", "name avatar")
      .sort({ views: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: topArticles,
    });
  } catch (error) {
    console.error("Get Top Viewed Articles Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
