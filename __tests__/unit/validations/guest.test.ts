import { describe, it, expect } from "vitest"
import { GuestSchema, GuestSide, RsvpStatus } from "@/lib/validations/guest.schema"

describe("GuestSchema", () => {
  const validGuest = {
    name: "Rajesh Kumar",
    familyName: "Kumar",
    side: "GROOM",
    guestCount: 2,
    rsvpStatus: "PENDING",
    accommodationNeeded: false,
    pickupNeeded: false,
    invitationSent: false,
    giftReceived: false,
  }

  it("accepts a valid guest record", () => {
    expect(() => GuestSchema.parse(validGuest)).not.toThrow()
  })

  it("rejects guest count of 0", () => {
    expect(() => GuestSchema.parse({ ...validGuest, guestCount: 0 })).toThrow()
  })

  it("rejects negative guest count", () => {
    expect(() => GuestSchema.parse({ ...validGuest, guestCount: -1 })).toThrow()
  })

  it("rejects invalid side value", () => {
    expect(() => GuestSchema.parse({ ...validGuest, side: "COUSIN" })).toThrow()
  })

  it("rejects invalid rsvpStatus", () => {
    expect(() => GuestSchema.parse({ ...validGuest, rsvpStatus: "MAYBE" })).toThrow()
  })

  it("requires name", () => {
    expect(() => GuestSchema.parse({ ...validGuest, name: "" })).toThrow()
  })

  it("requires familyName", () => {
    expect(() => GuestSchema.parse({ ...validGuest, familyName: "" })).toThrow()
  })
})

describe("GuestSide enum", () => {
  it("includes GROOM and BRIDE", () => {
    expect(GuestSide.enum.GROOM).toBe("GROOM")
    expect(GuestSide.enum.BRIDE).toBe("BRIDE")
  })
})

describe("RsvpStatus enum", () => {
  it("includes PENDING, CONFIRMED, DECLINED", () => {
    expect(RsvpStatus.enum.PENDING).toBe("PENDING")
    expect(RsvpStatus.enum.CONFIRMED).toBe("CONFIRMED")
    expect(RsvpStatus.enum.DECLINED).toBe("DECLINED")
  })
})
