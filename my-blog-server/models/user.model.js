import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Please add a name"] },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: 6,
      select: false,
    },
    role: { type: String, enum: ["user", "author", "admin"], default: "user" },
    authorApplication: {
      portfolio: { type: String },
      reason: { type: String },
      sampleTitle: { type: String },
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: null,
      },
    },
    avatar: { type: String, default: "" },
    coverPhoto: { type: String, default: "" },
    bio: { type: String, default: "" },
    followers: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    likedPosts: [{ type: mongoose.Schema.ObjectId, ref: "Post" }],
    bookmarks: [{ type: mongoose.Schema.ObjectId, ref: "Post" }],
    notifications: [
      {
        type: {
          type: String,
          enum: ["follow", "new_post", "author_acceptance"],
          default: "follow",
        },
        author: { type: mongoose.Schema.ObjectId, ref: "User" },
        post: { type: mongoose.Schema.ObjectId, ref: "Post" },
        message: { type: String, default: "" },
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isVerified: { type: Boolean, default: false },
    otp: { code: String, expiresAt: Date },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true },
);

// --- Middleware & Methods ---

// 1. Encrypt password
userSchema.pre("save", async function () {
  // Only run this if password was actually changed
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 2. Compare Password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 3. Generate OTP
userSchema.methods.generateOTP = function () {
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Assign the whole object to ensure Mongoose detects the change
  this.otp = {
    code: code,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
  };

  console.log(`DEBUG: OTP Generated for ${this.email}: ${code}`);
  return code;
};

// 4. Generate Reset Password Token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

// 5. Generate JWT Token
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const User = mongoose.model("User", userSchema);

export default User;
