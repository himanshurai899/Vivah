import { describe, it, expect } from "vitest"
import { formatINR, parseINR, calcOverrunPct } from "@/lib/utils/currency"

describe("formatINR", () => {
  it("formats a whole number in Indian style", () => {
    expect(formatINR(100000)).toBe("₹1,00,000")
  })

  it("formats zero as ₹0", () => {
    expect(formatINR(0)).toBe("₹0")
  })

  it("handles null/undefined gracefully", () => {
    expect(formatINR(null)).toBe("₹0")
    expect(formatINR(undefined)).toBe("₹0")
  })

  it("handles string input", () => {
    expect(formatINR("50000")).toBe("₹50,000")
  })

  it("rounds decimals — no paise shown", () => {
    expect(formatINR(1234.99)).toBe("₹1,235")
  })
})

describe("parseINR", () => {
  it("parses ₹ symbol and commas", () => {
    expect(parseINR("₹1,00,000")).toBe(100000)
  })

  it("parses plain number string", () => {
    expect(parseINR("50000")).toBe(50000)
  })

  it("returns 0 for empty string", () => {
    expect(parseINR("")).toBe(0)
  })
})

describe("calcOverrunPct", () => {
  it("returns 0 when actual is under planned", () => {
    expect(calcOverrunPct(80000, 100000)).toBe(0)
  })

  it("returns positive % when over budget", () => {
    expect(calcOverrunPct(120000, 100000)).toBe(20)
  })

  it("returns 0 when planned is 0", () => {
    expect(calcOverrunPct(5000, 0)).toBe(0)
  })
})
