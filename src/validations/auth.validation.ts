import { z } from "zod";

// registration schema
export const registerSchema = z.object({
  body: z.object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username must be less than 50 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
    email: z.email("Invalid email format").toLowerCase(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password must be less than 100 characters"),
  }),
});

// login schema
export const loginSchema = z.object({
  body: z.object({
    email: z.email("Invalid email format").toLowerCase(),
    password: z.string().min(1, "Password is required"),
  }),
});

// Refresh token schema
export const refreshTokenSchema = z.object({
  cookies: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
