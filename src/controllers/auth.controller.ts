import { config } from "@/config/env.config.js";
import { authService } from "@/services/auth.service.js";
import { LoginInput, RegisterInput } from "@/validations/auth.validation.js";
import { NextFunction, Request, Response } from "express";

class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(
    req: Request<{}, {}, RegisterInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await authService.register(req.body);

      // set refresh token in HttpOnly cookie
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: config.app.env === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(
    req: Request<{}, {}, LoginInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await authService.login(req.body);

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: config.app.env === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: "Login successful",
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  async refreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: "Refresh token not found",
        });
        return;
      }
      const result = await authService.refreshAccessToken(refreshToken);

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: {
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   * POST /api/auth/logout
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "strict",
        secure: config.app.env === "production",
      });

      res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
