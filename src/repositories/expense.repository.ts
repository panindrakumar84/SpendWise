import { database } from "@/config/db.config.js";
import { logger } from "@/config/logger.config.js";

export interface Expense {
  id: number;
  user_id: number;
  category_id: number;
  amount: number;
  description: string | null;
  expense_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateExpenseInput {
  user_id: number;
  category_id: number;
  amount: number;
  description?: string | undefined;
  expense_date: Date;
}

export interface UpdateExpenseInput {
  category_id?: number | undefined;
  amount?: number | undefined;
  description?: string | undefined;
  expense_date?: Date | undefined;
}

export interface ExpenseFilters {
  user_id: number;
  category_id?: number | undefined;
  start_date?: Date | undefined;
  end_date?: Date | undefined;
  min_amount?: number | undefined;
  max_amount?: number | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

class ExpenseRepository {
  /**
   * Create a new expense
   */
  async create(expenseData: CreateExpenseInput): Promise<Expense> {
    const query = `
      INSERT INTO expenses (user_id, category_id, amount, description, expense_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      expenseData.user_id,
      expenseData.category_id,
      expenseData.amount,
      expenseData.description || null,
      expenseData.expense_date,
    ];

    const result = await database.query<Expense>(query, values);

    logger.info(`Created expense with ID: ${result.rows[0]!.id}`);
    return result.rows[0]!;
  }

  /**
   * Find expense by ID
   */
  async findById(id: number, user_id: number): Promise<Expense | null> {
    const query = `
      SELECT e.*, c.name as category_name
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.id = $1 AND e.user_id = $2
    `;

    const result = await database.query<Expense>(query, [id, user_id]);

    return result.rows[0] || null;
  }

  async findAll(filters: ExpenseFilters): Promise<Expense[]> {
    const conditions: string[] = [`user_id = $1`];
    const values: any[] = [filters.user_id];
    let paramCount = 1;

    // category filter
    if (filters.category_id) {
      paramCount++;
      conditions.push(`category_id = $${paramCount}`);
      values.push(filters.category_id);
    }

    // Date range filter
    if (filters.start_date) {
      paramCount++;
      conditions.push(`expense_date >= $${paramCount}`);
      values.push(filters.start_date);
    }

    if (filters.end_date) {
      paramCount++;
      conditions.push(`expense_date <= $${paramCount}`);
      values.push(filters.end_date);
    }

    // Amount range filter
    if (filters.min_amount !== undefined) {
      paramCount++;
      conditions.push(`amount >= $${paramCount}`);
      values.push(filters.min_amount);
    }

    if (filters.max_amount !== undefined) {
      paramCount++;
      conditions.push(`amount <= $${paramCount}`);
      values.push(filters.max_amount);
    }

    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    const query = `
        SELECT e.*, c.name as category_name
        FROM expenses e
        JOIN categories c ON e.category_id = c.id
        WHERE ${conditions.join(" AND ")}
        ORDER BY e.expense_date DESC, e.created_at DESC
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;

    values.push(limit, offset);

    const result = await database.query<Expense>(query, values);

    logger.debug(
      `Found ${result.rows.length} expenses for user ${filters.user_id}`
    );
    return result.rows;
  }
  /**
   * Update expense
   */
  async update(
    id: number,
    user_id: number,
    updateData: UpdateExpenseInput
  ): Promise<Expense | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 0;

    if (updateData.category_id !== undefined) {
      paramCount++;
      fields.push(`category_id = $${paramCount}`);
      values.push(updateData.category_id);
    }

    if (updateData.amount !== undefined) {
      paramCount++;
      fields.push(`amount = $${paramCount}`);
      values.push(updateData.amount);
    }

    if (updateData.description !== undefined) {
      paramCount++;
      fields.push(`description = $${paramCount}`);
      values.push(updateData.description);
    }

    if (updateData.expense_date !== undefined) {
      paramCount++;
      fields.push(`expense_date = $${paramCount}`);
      values.push(updateData.expense_date);
    }

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    const query = `
      UPDATE expenses
      SET ${fields.join(", ")}
      WHERE id = $${paramCount + 1} AND user_id = $${paramCount + 2}
      RETURNING *
    `;

    values.push(id, user_id);

    const result = await database.query<Expense>(query, values);

    if (result.rows[0]) {
      logger.info(`Updated expense with ID: ${id}`);
    }

    return result.rows[0] || null;
  }

  /**
   * Delete expense
   */
  async delete(id: number, user_id: number): Promise<boolean> {
    const query = `
      DELETE FROM expenses
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;

    const result = await database.query(query, [id, user_id]);

    if (result.rows[0]) {
      logger.info(`Deleted expense with ID: ${id}`);
      return true;
    }

    return false;
  }

  /**
   * Get total count for pagination
   */
  async count(filters: ExpenseFilters): Promise<number> {
    const conditions: string[] = ["user_id = $1"];
    const values: any[] = [filters.user_id];
    let paramCount = 1;

    if (filters.category_id) {
      paramCount++;
      conditions.push(`category_id = $${paramCount}`);
      values.push(filters.category_id);
    }

    if (filters.start_date) {
      paramCount++;
      conditions.push(`expense_date >= $${paramCount}`);
      values.push(filters.start_date);
    }

    if (filters.end_date) {
      paramCount++;
      conditions.push(`expense_date <= $${paramCount}`);
      values.push(filters.end_date);
    }

    const query = `
      SELECT COUNT(*) as count
      FROM expenses
      WHERE ${conditions.join(" AND ")}
    `;

    const result = await database.query<{ count: string }>(query, values);

    return parseInt(result.rows[0]!.count, 10);
  }
}

export const expenseRepository = new ExpenseRepository();
