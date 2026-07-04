import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
      maxlength: [500, "Title cannot be more than 500 characters"],
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [1000, "Excerpt cannot be more than 1000 characters"],
    },
    content: {
      type: String,
      required: [true, "Please add content"],
    },
    image: {
      type: String,
      default: "",
    },
    cover: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: [true, "Please select a category"],
      enum: [
        "ai",
        "technology",
        "programming",
        "education",
        "review",
        "introduction",
      ],
      default: "technology",
    },
    hashtags: {
      type: [String],
      default: [],
      validate: [arrayLimit, "{PATH} exceeds the limit of 10"],
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    isSpecial: {
      type: Boolean,
      default: false,
    },
    likes: {
      type: Number,
      default: 0,
    },
    readTime: {
      type: String,
      default: "1 min read",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        user: mongoose.Schema.ObjectId,
        name: String,
        avatar: { type: String, default: "" },
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
        // Allow nested replies on each comment
        replies: [
          {
            user: mongoose.Schema.ObjectId,
            name: String,
            avatar: { type: String, default: "" },
            comment: String,
            createdAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
      },
    ],
  },
  { timestamps: true },
);

function arrayLimit(val) {
  return val.length <= 10;
}

// Indexes for better query performance
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ author: 1 });
postSchema.index({ isFeatured: 1 });
postSchema.index({ isSpecial: 1 });
postSchema.index({ hashtags: 1 });

export default mongoose.model("Post", postSchema);
