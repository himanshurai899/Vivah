import { z } from "zod"

export const PaymentMode = z.enum(["CASH", "UPI", "CARD", "BANK_TRANSFER", "CHEQUE"])

export const ExpenseSchema = z
  .object({
    category: z.string().min(1, "Category is required"),
    description: z.string().min(1, "Description is required"),
    amount: z.number().positive("Amount must be greater than zero"),
    paidAmount: z.number().min(0).default(0),
    paidTo: z.string().optional(),
    paymentMode: PaymentMode.default("CASH"),
    receipt: z.string().optional(),
    date: z.coerce.date().optional(),
    budgetCategoryId: z.string().optional(),
  })
  .refine((d) => d.paidAmount <= d.amount, {
    message: "Paid amount cannot exceed total amount",
    path: ["paidAmount"],
  })

export type ExpenseInput = z.infer<typeof ExpenseSchema>
