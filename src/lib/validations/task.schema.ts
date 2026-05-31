import { z } from "zod"

export const TaskPriority = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
export const TaskStatus = z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "BLOCKED"])

export const TaskSchema = z.object({
  name: z.string().min(1, "Task name is required"),
  owner: z.string().optional(),
  deadline: z.coerce.date().optional(),
  priority: TaskPriority.default("MEDIUM"),
  status: TaskStatus.default("PENDING"),
  notes: z.string().optional(),
})

export type TaskInput = z.infer<typeof TaskSchema>
