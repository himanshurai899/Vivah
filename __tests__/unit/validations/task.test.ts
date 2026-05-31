import { describe, it, expect } from "vitest"
import { TaskSchema, TaskPriority, TaskStatus } from "@/lib/validations/task.schema"

describe("TaskSchema", () => {
  const validTask = {
    name: "Book caterer",
    priority: "HIGH",
    status: "PENDING",
  }

  it("accepts a valid task record", () => {
    expect(() => TaskSchema.parse(validTask)).not.toThrow()
  })

  it("requires name", () => {
    expect(() => TaskSchema.parse({ ...validTask, name: "" })).toThrow()
  })

  it("rejects invalid priority", () => {
    expect(() => TaskSchema.parse({ ...validTask, priority: "URGENT" })).toThrow()
  })

  it("rejects invalid status", () => {
    expect(() => TaskSchema.parse({ ...validTask, status: "DONE" })).toThrow()
  })

  it("defaults priority to MEDIUM when omitted", () => {
    const { priority: _, ...without } = validTask
    const result = TaskSchema.parse(without)
    expect(result.priority).toBe("MEDIUM")
  })

  it("defaults status to PENDING when omitted", () => {
    const { status: _, ...without } = validTask
    const result = TaskSchema.parse(without)
    expect(result.status).toBe("PENDING")
  })

  it("accepts all valid priorities", () => {
    for (const p of TaskPriority.options) {
      expect(() => TaskSchema.parse({ ...validTask, priority: p })).not.toThrow()
    }
  })

  it("accepts all valid statuses", () => {
    for (const s of TaskStatus.options) {
      expect(() => TaskSchema.parse({ ...validTask, status: s })).not.toThrow()
    }
  })

  it("accepts optional owner and notes", () => {
    expect(() =>
      TaskSchema.parse({ ...validTask, owner: "Himanshu", notes: "Call before booking" })
    ).not.toThrow()
  })
})

describe("TaskPriority enum", () => {
  it("includes LOW, MEDIUM, HIGH, CRITICAL", () => {
    expect(TaskPriority.enum.LOW).toBe("LOW")
    expect(TaskPriority.enum.MEDIUM).toBe("MEDIUM")
    expect(TaskPriority.enum.HIGH).toBe("HIGH")
    expect(TaskPriority.enum.CRITICAL).toBe("CRITICAL")
  })
})

describe("TaskStatus enum", () => {
  it("includes PENDING, IN_PROGRESS, COMPLETED, BLOCKED", () => {
    expect(TaskStatus.enum.PENDING).toBe("PENDING")
    expect(TaskStatus.enum.IN_PROGRESS).toBe("IN_PROGRESS")
    expect(TaskStatus.enum.COMPLETED).toBe("COMPLETED")
    expect(TaskStatus.enum.BLOCKED).toBe("BLOCKED")
  })
})
