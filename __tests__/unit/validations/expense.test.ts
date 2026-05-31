import { describe, it, expect } from "vitest"
import { ExpenseSchema, PaymentMode } from "@/lib/validations/expense.schema"

describe("ExpenseSchema", () => {
  const validExpense = {
    category: "FOOD",
    description: "Caterer advance payment",
    amount: 75000,
  }

  it("accepts a valid expense record", () => {
    expect(() => ExpenseSchema.parse(validExpense)).not.toThrow()
  })

  it("requires category", () => {
    expect(() => ExpenseSchema.parse({ ...validExpense, category: "" })).toThrow()
  })

  it("requires description", () => {
    expect(() => ExpenseSchema.parse({ ...validExpense, description: "" })).toThrow()
  })

  it("rejects amount of zero", () => {
    expect(() => ExpenseSchema.parse({ ...validExpense, amount: 0 })).toThrow()
  })

  it("rejects negative amount", () => {
    expect(() => ExpenseSchema.parse({ ...validExpense, amount: -500 })).toThrow()
  })

  it("defaults paymentMode to CASH when omitted", () => {
    const result = ExpenseSchema.parse(validExpense)
    expect(result.paymentMode).toBe("CASH")
  })

  it("defaults paidAmount to 0 when omitted", () => {
    const result = ExpenseSchema.parse(validExpense)
    expect(result.paidAmount).toBe(0)
  })

  it("accepts all valid paymentModes", () => {
    for (const mode of PaymentMode.options) {
      expect(() => ExpenseSchema.parse({ ...validExpense, paymentMode: mode })).not.toThrow()
    }
  })

  it("rejects invalid paymentMode", () => {
    expect(() => ExpenseSchema.parse({ ...validExpense, paymentMode: "CRYPTO" })).toThrow()
  })

  it("accepts optional paidTo and receipt", () => {
    expect(() =>
      ExpenseSchema.parse({ ...validExpense, paidTo: "Sharma Caterers", receipt: "REC-001" })
    ).not.toThrow()
  })

  it("accepts paidAmount up to the amount", () => {
    expect(() =>
      ExpenseSchema.parse({ ...validExpense, amount: 50000, paidAmount: 50000 })
    ).not.toThrow()
  })

  it("rejects paidAmount greater than amount", () => {
    expect(() =>
      ExpenseSchema.parse({ ...validExpense, amount: 50000, paidAmount: 60000 })
    ).toThrow()
  })
})

describe("PaymentMode enum", () => {
  it("includes CASH, UPI, CARD, BANK_TRANSFER, CHEQUE", () => {
    expect(PaymentMode.enum.CASH).toBe("CASH")
    expect(PaymentMode.enum.UPI).toBe("UPI")
    expect(PaymentMode.enum.CARD).toBe("CARD")
    expect(PaymentMode.enum.BANK_TRANSFER).toBe("BANK_TRANSFER")
    expect(PaymentMode.enum.CHEQUE).toBe("CHEQUE")
  })
})
