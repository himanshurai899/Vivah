import { z } from "zod"

export const GuestSide = z.enum(["GROOM", "BRIDE"])
export const RsvpStatus = z.enum(["PENDING", "CONFIRMED", "DECLINED"])

export const GuestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  familyName: z.string().min(1, "Family name is required"),
  side: GuestSide,
  guestCount: z.number().int().min(1, "Guest count must be at least 1"),
  mobile: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  relationship: z.string().optional(),
  accommodationNeeded: z.boolean().default(false),
  pickupNeeded: z.boolean().default(false),
  invitationSent: z.boolean().default(false),
  rsvpStatus: RsvpStatus.default("PENDING"),
  giftReceived: z.boolean().default(false),
  notes: z.string().optional(),
})

export type GuestInput = z.infer<typeof GuestSchema>
