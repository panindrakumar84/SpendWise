import { logger } from "@/config/logger.config.js";
import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

export const validate = (schema: z.ZodSchema) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        logger.warn("Validation failed", { errors: errorMessages });

        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errorMessages,
        });
        return;
      }
      next(error);
    }
  };
};
