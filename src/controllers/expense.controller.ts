import { Request, Response, NextFunction } from "express";
import { expenseService } from "@services/expense.service.js";
import {
  CreateExpenseInput,
  UpdateExpenseInput,
  GetExpensesQuery,
} from "@validations/expense.validation.js";

class ExpenseController {
  /**
   * Create new expense
   * POST /api/expenses
   */
  async createExpense(
    req: Request<{}, {}, CreateExpenseInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const expense = await expenseService.createExpense(userId, req.body);

      res.status(201).json({
        success: true,
        message: "Expense created successfully",
        data: { expense },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all expenses with filters
   * GET /api/expenses
   */
  async getExpenses(
    req: Request<{}, {}, {}, GetExpensesQuery>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await expenseService.getExpenses(userId, req.query);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get expense by ID
   * GET /api/expenses/:id
   */
  async getExpenseById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const expenseId = parseInt(req.params["id"]!, 10);

      if (isNaN(expenseId)) {
        res.status(400).json({
          success: false,
          message: "Invalid expense ID",
        });
        return;
      }

      const expense = await expenseService.getExpenseById(expenseId, userId);

      res.status(200).json({
        success: true,
        data: { expense },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update expense
   * PATCH /api/expenses/:id
   */
  async updateExpense(
    req: Request<{ id: string }, {}, UpdateExpenseInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const expenseId = parseInt(req.params.id, 10);

      if (isNaN(expenseId)) {
        res.status(400).json({
          success: false,
          message: "Invalid expense ID",
        });
        return;
      }

      const expense = await expenseService.updateExpense(
        expenseId,
        userId,
        req.body
      );

      res.status(200).json({
        success: true,
        message: "Expense updated successfully",
        data: { expense },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete expense
   * DELETE /api/expenses/:id
   */
  async deleteExpense(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const expenseId = parseInt(req.params["id"]!, 10);

      if (isNaN(expenseId)) {
        res.status(400).json({
          success: false,
          message: "Invalid expense ID",
        });
        return;
      }

      await expenseService.deleteExpense(expenseId, userId);

      res.status(200).json({
        success: true,
        message: "Expense deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
export const expenseController = new ExpenseController();
