import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "@config/env.config.js";
import { logger } from "@config/logger.config.js";

interface TokenPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Middleware to verify JWT access token
 * Protects routes that require authentication
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Access token is required",
      });
      return;
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7);

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access token is required",
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.access.secret) as TokenPayload;

    // Attach user info to request object
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    logger.debug(`User authenticated: ${decoded.email}`);

    // Continue to next middleware/controller
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: "Access token expired",
        error: "TOKEN_EXPIRED",
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: "Invalid access token",
        error: "INVALID_TOKEN",
      });
      return;
    }

    logger.error("Authentication error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for routes that work differently for authenticated users
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // No token provided, continue without user info
      next();
      return;
    }

    const token = authHeader.substring(7);

    if (!token) {
      next();
      return;
    }

    const decoded = jwt.verify(token, config.jwt.access.secret) as TokenPayload;

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    // Token is invalid, but we don't fail - just continue without user
    logger.debug("Optional auth failed, continuing without user");
    next();
  }
};
