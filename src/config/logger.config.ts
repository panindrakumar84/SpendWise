import winston from "winston";
import { config } from "@config/env.config.js";

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`
      : `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

// Create logger instance
export const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports: [
    // Console output (colored for development)
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
    }),
    // File output for errors
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    // File output for all logs
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
  ],
});
