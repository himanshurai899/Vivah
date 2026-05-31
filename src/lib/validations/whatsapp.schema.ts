import { z } from "zod"

export const WhatsAppCategory = z.enum([
  "INVITATION",
  "REMINDER",
  "CONFIRMATION",
  "TRAVEL_UPDATE",
  "GENERAL",
])

export const WhatsAppTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  category: WhatsAppCategory.default("GENERAL"),
  message: z.string().min(1, "Message body is required"),
  variables: z.array(z.string()).default([]),
  active: z.boolean().default(true),
})

export const WhatsAppTemplateUpdateSchema = WhatsAppTemplateSchema.partial()

export type WhatsAppTemplateCreate = z.infer<typeof WhatsAppTemplateSchema>
export type WhatsAppTemplateUpdate = z.infer<typeof WhatsAppTemplateUpdateSchema>
