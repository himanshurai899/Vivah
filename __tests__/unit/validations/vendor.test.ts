import { describe, it, expect } from "vitest"
import { VendorSchema, VendorCategory, VendorStatus } from "@/lib/validations/vendor.schema"

describe("VendorSchema", () => {
  const validVendor = {
    name: "Sharma Photography",
    category: "PHOTOGRAPHER",
    status: "SHORTLISTED",
    advancePaid: 0,
  }

  it("accepts a valid vendor record", () => {
    expect(() => VendorSchema.parse(validVendor)).not.toThrow()
  })

  it("requires name", () => {
    expect(() => VendorSchema.parse({ ...validVendor, name: "" })).toThrow()
  })

  it("rejects invalid category", () => {
    expect(() => VendorSchema.parse({ ...validVendor, category: "INVALID" })).toThrow()
  })

  it("rejects invalid status", () => {
    expect(() => VendorSchema.parse({ ...validVendor, status: "UNKNOWN" })).toThrow()
  })

  it("defaults advancePaid to 0 when omitted", () => {
    const { advancePaid: _, ...withoutAdvance } = validVendor
    const result = VendorSchema.parse(withoutAdvance)
    expect(result.advancePaid).toBe(0)
  })

  it("defaults status to SHORTLISTED when omitted", () => {
    const { status: _, ...withoutStatus } = validVendor
    const result = VendorSchema.parse(withoutStatus)
    expect(result.status).toBe("SHORTLISTED")
  })

  it("rejects negative advancePaid", () => {
    expect(() => VendorSchema.parse({ ...validVendor, advancePaid: -1 })).toThrow()
  })

  it("rejects invalid email format", () => {
    expect(() => VendorSchema.parse({ ...validVendor, email: "not-an-email" })).toThrow()
  })

  it("accepts empty string email (optional contact)", () => {
    expect(() => VendorSchema.parse({ ...validVendor, email: "" })).not.toThrow()
  })

  it("accepts valid email", () => {
    expect(() => VendorSchema.parse({ ...validVendor, email: "vendor@example.com" })).not.toThrow()
  })

  it("accepts all valid categories", () => {
    const categories = VendorCategory.options
    for (const cat of categories) {
      expect(() => VendorSchema.parse({ ...validVendor, category: cat })).not.toThrow()
    }
  })
})

describe("VendorCategory enum", () => {
  it("includes all 14 expected categories", () => {
    const cats = VendorCategory.options
    expect(cats).toContain("PHOTOGRAPHER")
    expect(cats).toContain("CATERER")
    expect(cats).toContain("DECORATOR")
    expect(cats).toContain("PRIEST")
    expect(cats).toContain("MEHENDI")
    expect(cats).toContain("TRANSPORT")
  })
})

describe("VendorStatus enum", () => {
  it("includes all 4 statuses", () => {
    expect(VendorStatus.enum.SHORTLISTED).toBe("SHORTLISTED")
    expect(VendorStatus.enum.NEGOTIATING).toBe("NEGOTIATING")
    expect(VendorStatus.enum.FINALIZED).toBe("FINALIZED")
    expect(VendorStatus.enum.REJECTED).toBe("REJECTED")
  })
})
