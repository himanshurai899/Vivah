import { z } from "zod"

export const CheckInStatus = z.enum(["PENDING", "CHECKED_IN", "ABSENT"])

export const CheckInCreateSchema = z.object({
  guestName: z.string().min(2, "Guest name must be at least 2 characters"),
  familyName: z.string().optional(),
  guestId: z.string().optional(),
  eventId: z.string().optional(),
  eventName: z.string().min(1, "Event name is required"),
  status: CheckInStatus.default("PENDING"),
  arrivalTime: z.string().datetime().optional(),
  qrCode: z.string().optional(),
  notes: z.string().optional(),
})

export const CheckInUpdateSchema = z.object({
  status: CheckInStatus,
  notes: z.string().optional(),
})

export type CheckInCreate = z.infer<typeof CheckInCreateSchema>
export type CheckInUpdate = z.infer<typeof CheckInUpdateSchema>
