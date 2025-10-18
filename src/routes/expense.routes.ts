import { Router } from "express";
import { expenseController } from "@controllers/expense.controller.js";
import { authenticate } from "@middlewares/auth.middleware.js";
import { validate } from "@middlewares/validate.middleware.js";
import {
  createExpenseSchema,
  updateExpenseSchema,
  getExpensesQuerySchema,
  getExpenseByIdSchema,
} from "@validations/expense.validation.js";

const router = Router();

// All expense routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/expenses
 * @desc    Create a new expense
 * @access  Private
 */
router.post(
  "/",
  validate(createExpenseSchema),
  expenseController.createExpense.bind(expenseController)
);

/**
 * @route   GET /api/expenses
 * @desc    Get all expenses with filters and pagination
 * @access  Private
 */
router.get(
  "/",
  validate(getExpensesQuerySchema),
  expenseController.getExpenses.bind(expenseController)
);

/**
 * @route   GET /api/expenses/:id
 * @desc    Get single expense by ID
 * @access  Private
 */
router.get(
  "/:id",
  validate(getExpenseByIdSchema),
  expenseController.getExpenseById.bind(expenseController)
);

/**
 * @route   PATCH /api/expenses/:id
 * @desc    Update expense
 * @access  Private
 */
router.patch(
  "/:id",
  validate(updateExpenseSchema),
  expenseController.updateExpense.bind(expenseController)
);

/**
 * @route   DELETE /api/expenses/:id
 * @desc    Delete expense
 * @access  Private
 */
router.delete(
  "/:id",
  validate(getExpenseByIdSchema),
  expenseController.deleteExpense.bind(expenseController)
);

export default router;
