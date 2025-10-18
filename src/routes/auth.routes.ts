import { authController } from "@/controllers/auth.controller.js";
import { validate } from "@/middlewares/validate.middleware.js";
import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
} from "@/validations/auth.validation.js";
import { Router } from "express";

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post(
  "/register",
  validate(registerSchema),
  authController.register.bind(authController)
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  "/login",
  validate(loginSchema),
  authController.login.bind(authController)
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token from cookie
 * @access  Public
 */
router.post(
  "/refresh",
  validate(refreshTokenSchema),
  authController.refreshToken.bind(authController)
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (clear refresh token cookie)
 * @access  Public
 */
router.post("/logout", authController.logout.bind(authController));

export default router;
