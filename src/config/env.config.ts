import dotenv from "dotenv";
import { z } from "zod";

// Load env variables
dotenv.config();

// Define schema for env variables with sensible defaults
const envSchema = z
  .object({
    // Server
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    PORT: z.coerce.number().positive().max(65535).default(3000),

    // Database
    DATABASE_URL: z
      .string()
      .min(1, "DATABASE_URL is required")
      .refine((val) => val.startsWith("postgresql://"), {
        message: "DATABASE_URL must be a valid PostgreSQL connection string",
      }),

    // Database Pool Configuration (with recommended defaults)
    DB_POOL_MAX: z.coerce.number().positive().max(100).default(20),
    DB_POOL_MIN: z.coerce.number().min(0).default(2),
    DB_POOL_IDLE_TIMEOUT: z.coerce.number().positive().default(30000),
    DB_POOL_CONNECTION_TIMEOUT: z.coerce.number().positive().default(2000),
    DB_SSL: z
      .string()
      .default("false")
      .transform((val) => val === "true"),

    // JWT - with validation that secrets are different
    JWT_ACCESS_SECRET: z
      .string()
      .min(32, "JWT_ACCESS_SECRET must be at least 32 characters for security"),
    JWT_REFRESH_SECRET: z
      .string()
      .min(
        32,
        "JWT_REFRESH_SECRET must be at least 32 characters for security"
      ),
    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

    // Logging
    LOG_LEVEL: z
      .enum(["error", "warn", "info", "http", "debug"])
      .default("debug"),
  })
  .refine((data) => data.JWT_ACCESS_SECRET !== data.JWT_REFRESH_SECRET, {
    message: "JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different",
    path: ["JWT_REFRESH_SECRET"],
  });

// Validate and parse with better error handling
const parseEnv = () => {
  try {
    const parsed = envSchema.parse(process.env);
    console.log("✅ Environment variables validated successfully");
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment validation failed:");
      console.error(z.prettifyError(error));
      console.error(
        "\n💡 Please check your .env file and ensure all required variables are set correctly"
      );
      process.exit(1);
    }
    throw error;
  }
};

const env = parseEnv();

// Export config with better naming and organization
export const config = {
  app: {
    name: "Expense Tracker API",
    env: env.NODE_ENV,
    port: env.PORT,
  },
  database: {
    url: env.DATABASE_URL,
    pool: {
      max: env.DB_POOL_MAX,
      min: env.DB_POOL_MIN,
      idleTimeoutMillis: env.DB_POOL_IDLE_TIMEOUT,
      connectionTimeoutMillis: env.DB_POOL_CONNECTION_TIMEOUT,
    },
    ssl: env.DB_SSL,
  },
  jwt: {
    access: {
      secret: env.JWT_ACCESS_SECRET!,
      expiresIn: env.JWT_ACCESS_EXPIRES_IN!,
    },
    refresh: {
      secret: env.JWT_REFRESH_SECRET,
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    },
  },
  logging: {
    level: env.LOG_LEVEL,
  },
} as const;

// Type export for TypeScript
export type Config = typeof config;

// Helper functions
export const isProduction = config.app.env === "production";
export const isDevelopment = config.app.env === "development";
export const isTest = config.app.env === "test";
