import { describe, it, expect } from "vitest"
import { EventSchema, EventType, EventStatus } from "@/lib/validations/event.schema"

describe("EventSchema", () => {
  const validEvent = {
    name: "Haldi",
    eventType: "WEDDING",
    status: "PLANNED",
  }

  it("accepts a valid event record", () => {
    expect(() => EventSchema.parse(validEvent)).not.toThrow()
  })

  it("requires name", () => {
    expect(() => EventSchema.parse({ ...validEvent, name: "" })).toThrow()
  })

  it("rejects invalid eventType", () => {
    expect(() => EventSchema.parse({ ...validEvent, eventType: "UNKNOWN" })).toThrow()
  })

  it("rejects invalid status", () => {
    expect(() => EventSchema.parse({ ...validEvent, status: "INVALID" })).toThrow()
  })

  it("defaults eventType to WEDDING when omitted", () => {
    const { eventType: _, ...without } = validEvent
    const result = EventSchema.parse(without)
    expect(result.eventType).toBe("WEDDING")
  })

  it("defaults status to PLANNED when omitted", () => {
    const { status: _, ...without } = validEvent
    const result = EventSchema.parse(without)
    expect(result.status).toBe("PLANNED")
  })

  it("accepts all valid eventTypes", () => {
    for (const type of EventType.options) {
      expect(() => EventSchema.parse({ ...validEvent, eventType: type })).not.toThrow()
    }
  })

  it("accepts all valid statuses", () => {
    for (const s of EventStatus.options) {
      expect(() => EventSchema.parse({ ...validEvent, status: s })).not.toThrow()
    }
  })

  it("accepts optional venue and coordinator", () => {
    expect(() =>
      EventSchema.parse({ ...validEvent, venue: "Vadodara Hall", coordinator: "Ramesh" })
    ).not.toThrow()
  })

  it("accepts optional budget as positive number", () => {
    expect(() => EventSchema.parse({ ...validEvent, budget: 50000 })).not.toThrow()
  })

  it("rejects negative budget", () => {
    expect(() => EventSchema.parse({ ...validEvent, budget: -1 })).toThrow()
  })
})

describe("EventType enum", () => {
  it("includes PRE_WEDDING, WEDDING, POST_WEDDING", () => {
    expect(EventType.enum.PRE_WEDDING).toBe("PRE_WEDDING")
    expect(EventType.enum.WEDDING).toBe("WEDDING")
    expect(EventType.enum.POST_WEDDING).toBe("POST_WEDDING")
  })
})

describe("EventStatus enum", () => {
  it("includes PLANNED, IN_PROGRESS, COMPLETED, CANCELLED", () => {
    expect(EventStatus.enum.PLANNED).toBe("PLANNED")
    expect(EventStatus.enum.IN_PROGRESS).toBe("IN_PROGRESS")
    expect(EventStatus.enum.COMPLETED).toBe("COMPLETED")
    expect(EventStatus.enum.CANCELLED).toBe("CANCELLED")
  })
})
