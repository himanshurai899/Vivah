import { z } from "zod"

export const EventType = z.enum(["PRE_WEDDING", "WEDDING", "POST_WEDDING"])
export const EventStatus = z.enum(["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"])

export const EventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  eventType: EventType.default("WEDDING"),
  date: z.coerce.date().optional(),
  venue: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  coordinator: z.string().optional(),
  budget: z.number().positive("Budget must be positive").optional(),
  checklist: z.string().default("[]"),
  notes: z.string().optional(),
  status: EventStatus.default("PLANNED"),
})

export type EventInput = z.infer<typeof EventSchema>
