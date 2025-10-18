import express, { Application, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { config } from "@/config/env.config.js";
import { logger } from "@/config/logger.config.js";
import cookieParser from "cookie-parser";
import authRoutes from "@routes/auth.routes.js";
import categoryRoutes from "@routes/category.routes.js";
import expenseRoutes from "@routes/expense.routes.js";
const app: Application = express();

// security middlewares
app.use(helmet());
app.use(
  cors({
    origin: config.app.env === "development" ? "*" : "http://localhost:3000",
    credentials: true,
  })
);

// cookie parser
app.use(cookieParser());

// body parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// http request logging with morgan + winston
const morganFormat = config.app.env === "development" ? "dev" : "combined";

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message: string) => {
        logger.http(message.trim());
      },
    },
  })
);

// health check route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: config.app.env,
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/expenses", expenseRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(400).json({
    error: "Not Found",
    message: `Request ${req.method} ${req.path} not found`,
  });
});

// global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error("Unhandled error:", err);

  res.status(500).json({
    error: "Internal Server Error",
    message:
      config.app.env === "development" ? err.message : "Something went wrong",
  });
});

export default app;
