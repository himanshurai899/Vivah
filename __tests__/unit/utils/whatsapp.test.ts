import { describe, it, expect } from "vitest"
import { substituteVars, normalizePhone, isPersonalVar, filterGuestsForBatch } from "@/lib/utils/whatsapp"

const makeGuest = (overrides = {}) => ({
  id: "g-001",
  name: "Anita Sharma",
  familyName: "Sharma",
  side: "BRIDE" as const,
  rsvpStatus: "PENDING",
  mobile: "+91 98765 43210",
  ...overrides,
})

// ── substituteVars ──────────────────────────────────────────────────────────

describe("substituteVars", () => {
  it("replaces all known variables", () => {
    const result = substituteVars(
      "Hello {{GuestName}}, join us on {{Date}} at {{Venue}}",
      { GuestName: "Anita", Date: "25 Nov", Venue: "Vadodara" }
    )
    expect(result).toBe("Hello Anita, join us on 25 Nov at Vadodara")
  })

  it("leaves missing variables as [VarName] marker", () => {
    const result = substituteVars(
      "Hello {{GuestName}}, venue: {{Venue}}",
      { GuestName: "Anita" }
    )
    expect(result).toBe("Hello Anita, venue: [Venue]")
  })

  it("returns message unchanged when no variables present", () => {
    const msg = "Dear guest, please join us."
    expect(substituteVars(msg, {})).toBe(msg)
  })

  it("handles empty variable value (replaces with empty string)", () => {
    const result = substituteVars("Hello {{GuestName}}", { GuestName: "" })
    expect(result).toBe("Hello ")
  })

  it("replaces same variable used multiple times", () => {
    const result = substituteVars(
      "{{GuestName}} is invited. Confirm, {{GuestName}}.",
      { GuestName: "Raj" }
    )
    expect(result).toBe("Raj is invited. Confirm, Raj.")
  })

  it("handles multi-line messages", () => {
    const msg = "Hello {{GuestName}},\nDate: {{Date}}\nVenue: {{Venue}}"
    const result = substituteVars(msg, { GuestName: "Priya", Date: "25 Nov", Venue: "Baroda" })
    expect(result).toBe("Hello Priya,\nDate: 25 Nov\nVenue: Baroda")
  })
})

// ── normalizePhone ──────────────────────────────────────────────────────────

describe("normalizePhone", () => {
  it("strips spaces and hyphens from Indian mobile number", () => {
    expect(normalizePhone("+91 98765 43210")).toBe("919876543210")
  })

  it("strips leading zero and prepends 91", () => {
    expect(normalizePhone("09876543210")).toBe("919876543210")
  })

  it("leaves already-clean 10-digit number with country code intact", () => {
    expect(normalizePhone("919876543210")).toBe("919876543210")
  })

  it("handles number with dashes", () => {
    expect(normalizePhone("98765-43210")).toBe("919876543210")
  })

  it("handles number with parentheses", () => {
    expect(normalizePhone("+91 (98765) 43210")).toBe("919876543210")
  })
})

// ── isPersonalVar ───────────────────────────────────────────────────────────

describe("isPersonalVar", () => {
  it("identifies GuestName as personal", () => {
    expect(isPersonalVar("GuestName")).toBe(true)
  })

  it("identifies Name as personal", () => {
    expect(isPersonalVar("Name")).toBe(true)
  })

  it("identifies guestName (camelCase) as personal", () => {
    expect(isPersonalVar("guestName")).toBe(true)
  })

  it("identifies name (lowercase) as personal", () => {
    expect(isPersonalVar("name")).toBe(true)
  })

  it("identifies Date as non-personal (shared)", () => {
    expect(isPersonalVar("Date")).toBe(false)
  })

  it("identifies Venue as non-personal", () => {
    expect(isPersonalVar("Venue")).toBe(false)
  })
})

// ── filterGuestsForBatch ────────────────────────────────────────────────────

describe("filterGuestsForBatch", () => {
  const guests = [
    makeGuest({ id: "g-1", side: "GROOM", rsvpStatus: "PENDING", mobile: "9876543210" }),
    makeGuest({ id: "g-2", side: "BRIDE", rsvpStatus: "CONFIRMED", mobile: "9876543211" }),
    makeGuest({ id: "g-3", side: "GROOM", rsvpStatus: "PENDING", mobile: undefined }),
    makeGuest({ id: "g-4", side: "BRIDE", rsvpStatus: "PENDING", mobile: "9876543212" }),
    makeGuest({ id: "g-5", side: "GROOM", rsvpStatus: "CONFIRMED", mobile: "9876543213" }),
  ]

  it("ALL returns only guests with mobile numbers", () => {
    const result = filterGuestsForBatch(guests, "ALL")
    expect(result).toHaveLength(4)
    expect(result.every(g => g.mobile)).toBe(true)
  })

  it("GROOM returns only groom-side guests with mobile", () => {
    const result = filterGuestsForBatch(guests, "GROOM")
    expect(result).toHaveLength(2)
    expect(result.every(g => g.side === "GROOM")).toBe(true)
  })

  it("BRIDE returns only bride-side guests with mobile", () => {
    const result = filterGuestsForBatch(guests, "BRIDE")
    expect(result).toHaveLength(2)
    expect(result.every(g => g.side === "BRIDE")).toBe(true)
  })

  it("PENDING_RSVP returns only PENDING guests with mobile", () => {
    const result = filterGuestsForBatch(guests, "PENDING_RSVP")
    expect(result).toHaveLength(2)
    expect(result.every(g => g.rsvpStatus === "PENDING")).toBe(true)
  })

  it("excludes guests without mobile in all filter modes", () => {
    const noMobileGuest = makeGuest({ id: "g-6", side: "GROOM", rsvpStatus: "PENDING", mobile: undefined })
    const result = filterGuestsForBatch([noMobileGuest], "ALL")
    expect(result).toHaveLength(0)
  })
})
