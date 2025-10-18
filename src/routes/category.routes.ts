import { categoryController } from "@/controllers/category.controller.js";
import { authenticate } from "@/middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router();

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Private (requires authentication)
 */
router.get(
  "/",
  authenticate,
  categoryController.getAllCategories.bind(categoryController)
);

/**
 * @route   GET /api/categories/:id
 * @desc    Get category by ID
 * @access  Private
 */
router.get(
  "/:id",
  authenticate,
  categoryController.getCategoryById.bind(categoryController)
);

export default router;
