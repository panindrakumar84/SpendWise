import { z } from "zod";

// Create expense schema
export const createExpenseSchema = z.object({
  body: z.object({
    category_id: z
      .number()
      .int()
      .positive("Category ID must be a positive integer"),
    amount: z.number().positive("Amount must be greater than 0"),
    description: z
      .string()
      .max(500, "Description must be less than 500 characters")
      .optional(),
    expense_date: z.iso.date("Invalid date format (YYYY-MM-DD)"),
  }),
});

// Update expense schema
export const updateExpenseSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Invalid expense ID").transform(Number),
  }),
  body: z.object({
    category_id: z.number().int().positive().optional(),
    amount: z.number().positive().optional(),
    description: z.string().max(500).optional(),
    expense_date: z.iso.date().optional(),
  }),
});

// Get expenses query schema
export const getExpensesQuerySchema = z.object({
  query: z.object({
    category_id: z.string().regex(/^\d+$/).transform(Number).optional(),
    start_date: z.iso.date().optional(),
    end_date: z.iso.date().optional(),
    min_amount: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/)
      .transform(Number)
      .optional(),
    max_amount: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/)
      .transform(Number)
      .optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

// Get single expense schema
export const getExpenseByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Invalid expense ID").transform(Number),
  }),
});

// Type exports
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>["body"];
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>["body"];
export type GetExpensesQuery = z.infer<typeof getExpensesQuerySchema>["query"];
