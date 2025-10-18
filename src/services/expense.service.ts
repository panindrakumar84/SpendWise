import {
  expenseRepository,
  Expense,
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseFilters,
} from "@repositories/expense.repository.js";
import { categoryService } from "@services/category.service.js";
import { logger } from "@config/logger.config.js";
import { CreateExpenseInput as ValidatedInput } from "@validations/expense.validation.js";

interface PaginatedExpenses {
  expenses: Expense[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

type ServiceExpenseFilters = Omit<
  ExpenseFilters,
  "user_id" | "start_date" | "end_date" | "offset"
> & {
  start_date?: string | undefined;
  end_date?: string | undefined;
  page?: number | undefined;
};

type ServiceUpdateExpenseInput = Omit<UpdateExpenseInput, "expense_date"> & {
  expense_date?: string | undefined;
};

class ExpenseService {
  /**
   * Create a new expense
   */
  async createExpense(
    userId: number,
    expenseData: ValidatedInput
  ): Promise<Expense> {
    // Validate category exists
    await categoryService.validateCategoryExists(expenseData.category_id);

    const createData: CreateExpenseInput = {
      user_id: userId,
      category_id: expenseData.category_id,
      amount: expenseData.amount,
      description: expenseData.description,
      expense_date: new Date(expenseData.expense_date),
    };

    const expense = await expenseRepository.create(createData);

    logger.info(`Expense created for user ${userId}: $${expense.amount}`);
    return expense;
  }

  /**
   * Get expense by ID
   */
  async getExpenseById(expenseId: number, userId: number): Promise<Expense> {
    const expense = await expenseRepository.findById(expenseId, userId);

    if (!expense) {
      throw new Error("Expense not found");
    }

    return expense;
  }

  /**
   * Get all expenses with filters and pagination
   */
  async getExpenses(
    userId: number,
    filters: ServiceExpenseFilters
  ): Promise<PaginatedExpenses> {
    const limit = filters.limit || 50;
    const page = filters.page || 1;
    const offset = (page - 1) * limit;

    const expenseFilters: ExpenseFilters = {
      user_id: userId,
      category_id: filters.category_id,
      start_date: filters.start_date ? new Date(filters.start_date) : undefined,
      end_date: filters.end_date ? new Date(filters.end_date) : undefined,
      min_amount: filters.min_amount,
      max_amount: filters.max_amount,
      limit,
      offset,
    };

    const [expenses, total] = await Promise.all([
      expenseRepository.findAll(expenseFilters),
      expenseRepository.count(expenseFilters),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      expenses,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  /**
   * Update expense
   */
  async updateExpense(
    expenseId: number,
    userId: number,
    updateData: ServiceUpdateExpenseInput
  ): Promise<Expense> {
    // Check if expense exists and belongs to user
    await this.getExpenseById(expenseId, userId);

    // Validate category if being updated
    if (updateData.category_id) {
      await categoryService.validateCategoryExists(updateData.category_id);
    }

    const updatePayload: UpdateExpenseInput = {
      ...updateData,
      expense_date: updateData.expense_date
        ? new Date(updateData.expense_date)
        : undefined,
    };

    const updatedExpense = await expenseRepository.update(
      expenseId,
      userId,
      updatePayload
    );

    if (!updatedExpense) {
      throw new Error("Failed to update expense");
    }

    logger.info(`Expense ${expenseId} updated by user ${userId}`);
    return updatedExpense;
  }

  /**
   * Delete expense
   */
  async deleteExpense(expenseId: number, userId: number): Promise<void> {
    // Check if expense exists and belongs to user
    await this.getExpenseById(expenseId, userId);

    const deleted = await expenseRepository.delete(expenseId, userId);

    if (!deleted) {
      throw new Error("Failed to delete expense");
    }

    logger.info(`Expense ${expenseId} deleted by user ${userId}`);
  }
}

// Export singleton instance
export const expenseService = new ExpenseService();
