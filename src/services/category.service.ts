import { logger } from "@/config/logger.config.js";
import {
  Category,
  categoryRepository,
} from "@/repositories/category.repository.js";

class CategoryService {
  /**
   * Get all categories
   */
  async getAllCategories(): Promise<Category[]> {
    const categories = await categoryRepository.findAll();
    logger.info(`Retrieved ${categories.length} categories`);
    return categories;
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: number): Promise<Category> {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new Error("Category not found");
    }
    return category;
  }

  /**
   * Validate if category exists
   */
  async validateCategoryExists(id: number): Promise<boolean> {
    const exists = await categoryRepository.exists(id);
    if (!exists) {
      throw new Error(`Category with ID ${id} does not exist`);
    }
    return true;
  }
}

export const categoryService = new CategoryService();
