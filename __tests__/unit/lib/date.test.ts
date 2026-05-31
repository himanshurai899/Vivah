import { describe, it, expect, vi, afterEach } from "vitest"
import { daysUntil, formatDate, formatShortDate, isOverdue } from "@/lib/utils/date"

afterEach(() => vi.useRealTimers())

describe("daysUntil", () => {
  it("returns correct days until a future date", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-01-01"))
    expect(daysUntil(new Date("2026-11-25"))).toBe(328)
  })

  it("returns 0 on the same day", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-11-25"))
    expect(daysUntil(new Date("2026-11-25"))).toBe(0)
  })

  it("returns negative when date is in the past", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2027-01-01"))
    expect(daysUntil(new Date("2026-11-25"))).toBeLessThan(0)
  })
})

describe("formatDate", () => {
  it("formats date to dd MMM yyyy", () => {
    expect(formatDate(new Date("2026-11-25"))).toBe("25 Nov 2026")
  })
})

describe("formatShortDate", () => {
  it("formats to dd/MM/yyyy", () => {
    expect(formatShortDate(new Date("2026-11-25"))).toBe("25/11/2026")
  })
})

describe("isOverdue", () => {
  it("returns true when deadline is in the past", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-06-01"))
    expect(isOverdue(new Date("2026-05-01"))).toBe(true)
  })

  it("returns false for future deadline", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-01-01"))
    expect(isOverdue(new Date("2026-06-01"))).toBe(false)
  })
})
