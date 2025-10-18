import { categoryService } from "@/services/category.service.js";
import { NextFunction, Request, Response } from "express";

class CategoryController {
  /**
   * Get all categories
   * GET /api/categories
   */
  async getAllCategories(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const categories = await categoryService.getAllCategories();

      res.status(200).json({
        success: true,
        data: {
          categories,
          count: categories.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single category
   * GET /api/categories/:id
   */
  async getCategoryById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = parseInt(req.params["id"]!, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
        return;
      }

      const category = await categoryService.getCategoryById(id);

      res.status(200).json({
        success: true,
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
