import { config } from "@/config/env.config.js";
import { logger } from "@/config/logger.config.js";
import { User, userRepository } from "@/repositories/user.repository.js";
import { LoginInput, RegisterInput } from "@/validations/auth.validation.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { StringValue } from "ms";

interface TokenPayload {
  userId: number;
  email: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse {
  user: Omit<User, "password_hash">;
  accessToken: string;
  refreshToken: string;
}

interface RefreshTokenResponse {
  accessToken: string;
}

class AuthService {
  /**
   * Register a new user
   */
  async register(userData: RegisterInput): Promise<AuthResponse> {
    // check user already exists
    const emailExists = await userRepository.emailExists(userData.email);
    if (emailExists) {
      throw new Error("Email already registered");
    }

    const usernameExists = await userRepository.usernameExists(
      userData.username
    );
    if (usernameExists) {
      throw new Error("Username already taken");
    }

    // hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(userData.password, saltRounds);

    // create user
    const newUser = await userRepository.create({
      username: userData.username,
      email: userData.email,
      password_hash,
    });

    logger.info(`New user registered: ${newUser.email}`);

    // generate tokens
    const tokens = this.generateTokens({
      userId: newUser.id,
      email: newUser.email,
    });

    // return user data (without password) and tokens
    const { password_hash: _, ...userWithoutPassword } = newUser;
    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  /**
   * login user
   */
  async login(loginData: LoginInput): Promise<AuthResponse> {
    // find user by email
    const user = await userRepository.findByEmail(loginData.email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // verify password
    const isPassword = await bcrypt.compare(
      loginData.password,
      user.password_hash
    );

    if (!isPassword) {
      throw new Error("Invalid email or password");
    }

    logger.info(`User logged in: ${user.email}`);

    // generate tokens
    const tokens = this.generateTokens({ userId: user.id, email: user.email });

    // Return user data (without password) and tokens
    const { password_hash: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  /**
   * refresh access token
   */
  async refreshAccessToken(
    refreshToken: string
  ): Promise<RefreshTokenResponse> {
    try {
      // verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        config.jwt.refresh.secret
      ) as TokenPayload;

      // generate new access token
      const accessToken = this.generateAccessToken({
        userId: decoded.userId,
        email: decoded.email,
      });

      return { accessToken };
    } catch (error) {
      logger.warn("Invalid refresh token");
      throw new Error("Invalid refresh token");
    }
  }

  /**
   * Generate access and fresh tokens
   */
  private generateTokens(payload: TokenPayload): AuthTokens {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return { accessToken, refreshToken };
  }

  /**
   * generate access token (15 min)
   */
  private generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.access.secret, {
      expiresIn: config.jwt.access.expiresIn as StringValue,
    });
  }

  /**
   * generate refresh token
   */
  private generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.refresh.secret, {
      expiresIn: config.jwt.refresh.expiresIn as StringValue,
    });
  }
}

export const authService = new AuthService();
