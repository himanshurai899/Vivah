import { z } from "zod"

export const VendorCategory = z.enum([
  "PHOTOGRAPHER", "VIDEOGRAPHER", "CATERER", "DECORATOR",
  "DJ", "BAND", "MAKEUP", "TENT", "FLOWER", "PRIEST",
  "MEHENDI", "TRANSPORT", "EVENT_PLANNER", "OTHER",
])

export const VendorStatus = z.enum(["SHORTLISTED", "NEGOTIATING", "FINALIZED", "REJECTED"])

export const VendorSchema = z.object({
  name: z.string().min(1, "Vendor name is required"),
  category: VendorCategory,
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  quotation: z.number().positive().optional(),
  negotiatedAmount: z.number().positive().optional(),
  finalAmount: z.number().positive().optional(),
  advancePaid: z.number().min(0).default(0),
  contractNotes: z.string().optional(),
  status: VendorStatus.default("SHORTLISTED"),
  rating: z.number().int().min(1).max(5).optional(),
  notes: z.string().optional(),
})

export type VendorInput = z.infer<typeof VendorSchema>
