import { z } from "zod";

// Schema for Registration
export const registerSchema = z.object({
  name: z.string().min(4, "Name must be at least 4 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Schema for OTP Verification
export const otpSchema = z.object({
  email: z.string().email("Invalid email format"),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

// Schema for login
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Schema for updating profile fields
export const profileUpdateSchema = z
  .object({
    name: z.string().min(4, "Name must be at least 4 characters").optional(),
    email: z.string().email("Invalid email format").optional(),
    bio: z.string().max(160, "Bio must be 160 characters or less").optional(),
    currentPassword: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z
        .string()
        .min(8, "Current password must be at least 8 characters")
        .optional(),
    ),
    newPassword: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z
        .string()
        .min(8, "New password must be at least 8 characters")
        .optional(),
    ),
  })
  .refine((data) => !(data.newPassword && !data.currentPassword), {
    message: "Current password is required to change password",
    path: ["currentPassword"],
  });

export const authorApplicationSchema = z.object({
  portfolio: z.string().optional(),
  reason: z.string().trim().min(1, "Please enter your reason"),
  sampleTitle: z.string().trim().min(1, "Please enter your sample title"),
});
