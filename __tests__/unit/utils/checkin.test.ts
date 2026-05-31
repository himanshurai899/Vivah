import { describe, it, expect } from "vitest"
import { buildQrPayload, calculateCheckInStats } from "@/lib/utils/checkin"

const makeRecord = (overrides = {}) => ({
  id: "ci-001",
  guestName: "Ravi Kumar",
  familyName: "Kumar",
  eventName: "Haldi",
  status: "PENDING" as const,
  ...overrides,
})

describe("buildQrPayload", () => {
  it("encodes id, guest, and event as JSON string", () => {
    const record = makeRecord()
    const payload = buildQrPayload(record)
    expect(payload).toBe(JSON.stringify({ id: "ci-001", guest: "Ravi Kumar", event: "Haldi" }))
  })

  it("produces parseable JSON", () => {
    const payload = buildQrPayload(makeRecord())
    expect(() => JSON.parse(payload)).not.toThrow()
  })

  it("parsed payload contains correct fields", () => {
    const record = makeRecord({ id: "ci-999", guestName: "Priya Sharma", eventName: "Mandap" })
    const parsed = JSON.parse(buildQrPayload(record))
    expect(parsed).toEqual({ id: "ci-999", guest: "Priya Sharma", event: "Mandap" })
  })

  it("handles special characters in guest name", () => {
    const record = makeRecord({ guestName: "O'Brien & Sons", eventName: "Vidaai" })
    const payload = buildQrPayload(record)
    const parsed = JSON.parse(payload)
    expect(parsed.guest).toBe("O'Brien & Sons")
  })
})

describe("calculateCheckInStats", () => {
  it("counts all statuses correctly", () => {
    const records = [
      makeRecord({ status: "CHECKED_IN" }),
      makeRecord({ status: "CHECKED_IN" }),
      makeRecord({ status: "CHECKED_IN" }),
      makeRecord({ status: "PENDING" }),
      makeRecord({ status: "PENDING" }),
      makeRecord({ status: "ABSENT" }),
    ]
    const stats = calculateCheckInStats(records)
    expect(stats.total).toBe(6)
    expect(stats.checkedIn).toBe(3)
    expect(stats.pending).toBe(2)
    expect(stats.absent).toBe(1)
  })

  it("calculates progress percentage correctly", () => {
    const records = [
      makeRecord({ status: "CHECKED_IN" }),
      makeRecord({ status: "CHECKED_IN" }),
      makeRecord({ status: "PENDING" }),
      makeRecord({ status: "PENDING" }),
    ]
    const stats = calculateCheckInStats(records)
    expect(stats.progressPct).toBe(50)
  })

  it("returns 0 progressPct when no records", () => {
    const stats = calculateCheckInStats([])
    expect(stats.total).toBe(0)
    expect(stats.progressPct).toBe(0)
  })

  it("rounds progress percentage to nearest integer", () => {
    const records = [
      makeRecord({ status: "CHECKED_IN" }),
      makeRecord({ status: "PENDING" }),
      makeRecord({ status: "PENDING" }),
    ]
    const stats = calculateCheckInStats(records)
    expect(Number.isInteger(stats.progressPct)).toBe(true)
    expect(stats.progressPct).toBe(33)
  })

  it("progressPct is 100 when all checked in", () => {
    const records = [
      makeRecord({ status: "CHECKED_IN" }),
      makeRecord({ status: "CHECKED_IN" }),
    ]
    const stats = calculateCheckInStats(records)
    expect(stats.progressPct).toBe(100)
  })
})
