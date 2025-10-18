import { database } from "@/config/db.config.js";
import { logger } from "@/config/logger.config.js";

export interface Category {
  id: number;
  name: string;
  description: string;
  create_at: Date;
}

class CategoryRepository {
  /**
   * Check if category exists
   */
  async findAll(): Promise<Category[]> {
    const query = `SELECT * FROM categories ORDER BY name ASC`;
    const result = await database.query<Category>(query);

    logger.debug(`Found ${result.rows.length} categories`);
    return result.rows;
  }

  /**
   * Check if category exists
   */
  async findById(id: number): Promise<Category | null> {
    const query = `SELECT * FROM categories WHERE id = $1`;
    const result = await database.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Check if category exists
   */
  async exists(id: number): Promise<boolean> {
    const query = `SELECT EXISTS (SELECT 1 FROM categories WHERE id = $1) as exists`;
    const result = await database.query(query, [id]);
    return result.rows[0].exists;
  }
}

export const categoryRepository = new CategoryRepository();
