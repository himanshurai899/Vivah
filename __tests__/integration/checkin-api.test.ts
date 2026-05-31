import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"

// Mock Prisma and API helpers before importing route handlers
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    checkIn: {
      findMany: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}))

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api")
  return { ...actual, getWeddingId: () => "wedding-test-id" }
})

import { prisma } from "@/lib/db/prisma"
import { GET, POST } from "@/app/api/checkin/route"
import { PUT, DELETE } from "@/app/api/checkin/[id]/route"

const makeCheckIn = (overrides = {}) => ({
  id: "ci-001",
  weddingId: "wedding-test-id",
  guestName: "Ravi Kumar",
  familyName: "Kumar",
  eventId: "ev-001",
  eventName: "Haldi",
  status: "PENDING",
  arrivalTime: null,
  qrCode: null,
  notes: null,
  ...overrides,
})

function makeRequest(url: string, body?: unknown, method = "GET"): Request {
  return new Request(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  })
}

describe("GET /api/checkin", () => {
  beforeEach(() => {
    vi.mocked(prisma.checkIn.findMany).mockResolvedValue([makeCheckIn()] as never)
  })
  afterEach(() => vi.clearAllMocks())

  it("returns an array of check-in records", async () => {
    const res = await GET(makeRequest("http://localhost/api/checkin"))
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
    expect(data[0].guestName).toBe("Ravi Kumar")
  })

  it("passes eventId filter to prisma query", async () => {
    await GET(makeRequest("http://localhost/api/checkin?eventId=ev-001"))
    expect(prisma.checkIn.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ eventId: "ev-001" }) })
    )
  })

  it("passes status filter to prisma query", async () => {
    await GET(makeRequest("http://localhost/api/checkin?status=CHECKED_IN"))
    expect(prisma.checkIn.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: "CHECKED_IN" }) })
    )
  })

  it("omits filters when query params are absent", async () => {
    await GET(makeRequest("http://localhost/api/checkin"))
    const call = vi.mocked(prisma.checkIn.findMany).mock.calls[0][0] as { where: Record<string, unknown> }
    expect(call.where.eventId).toBeUndefined()
    expect(call.where.status).toBeUndefined()
  })
})

describe("POST /api/checkin", () => {
  afterEach(() => vi.clearAllMocks())

  it("creates a check-in record and returns 201", async () => {
    const created = makeCheckIn({ id: "ci-new" })
    vi.mocked(prisma.checkIn.create).mockResolvedValue(created as never)

    const req = makeRequest(
      "http://localhost/api/checkin",
      { guestName: "Ravi Kumar", eventName: "Haldi", status: "PENDING" },
      "POST"
    )
    const res = await POST(req)
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.id).toBe("ci-new")
  })

  it("sets weddingId from getWeddingId()", async () => {
    vi.mocked(prisma.checkIn.create).mockResolvedValue(makeCheckIn() as never)
    const req = makeRequest(
      "http://localhost/api/checkin",
      { guestName: "Test", eventName: "Tilak" },
      "POST"
    )
    await POST(req)
    expect(prisma.checkIn.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ weddingId: "wedding-test-id" }) })
    )
  })

  it("defaults status to PENDING when not provided", async () => {
    vi.mocked(prisma.checkIn.create).mockResolvedValue(makeCheckIn() as never)
    const req = makeRequest(
      "http://localhost/api/checkin",
      { guestName: "Test", eventName: "Matkor" },
      "POST"
    )
    await POST(req)
    expect(prisma.checkIn.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "PENDING" }) })
    )
  })
})

describe("PUT /api/checkin/:id", () => {
  afterEach(() => vi.clearAllMocks())

  it("updates status and returns 200", async () => {
    vi.mocked(prisma.checkIn.updateMany).mockResolvedValue({ count: 1 } as never)
    const req = makeRequest(
      "http://localhost/api/checkin/ci-001",
      { status: "CHECKED_IN" },
      "PUT"
    )
    const res = await PUT(req, { params: Promise.resolve({ id: "ci-001" }) })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
  })

  it("returns 404 when record not found", async () => {
    vi.mocked(prisma.checkIn.updateMany).mockResolvedValue({ count: 0 } as never)
    const req = makeRequest(
      "http://localhost/api/checkin/ci-ghost",
      { status: "CHECKED_IN" },
      "PUT"
    )
    const res = await PUT(req, { params: Promise.resolve({ id: "ci-ghost" }) })
    expect(res.status).toBe(404)
  })

  it("sets arrivalTime when status is CHECKED_IN", async () => {
    vi.mocked(prisma.checkIn.updateMany).mockResolvedValue({ count: 1 } as never)
    const req = makeRequest(
      "http://localhost/api/checkin/ci-001",
      { status: "CHECKED_IN" },
      "PUT"
    )
    await PUT(req, { params: Promise.resolve({ id: "ci-001" }) })
    expect(prisma.checkIn.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ arrivalTime: expect.any(Date) }) })
    )
  })
})

describe("DELETE /api/checkin/:id", () => {
  afterEach(() => vi.clearAllMocks())

  it("deletes record and returns 200", async () => {
    vi.mocked(prisma.checkIn.deleteMany).mockResolvedValue({ count: 1 } as never)
    const req = makeRequest("http://localhost/api/checkin/ci-001", undefined, "DELETE")
    const res = await DELETE(req, { params: Promise.resolve({ id: "ci-001" }) })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
  })

  it("scopes delete to weddingId", async () => {
    vi.mocked(prisma.checkIn.deleteMany).mockResolvedValue({ count: 1 } as never)
    const req = makeRequest("http://localhost/api/checkin/ci-001", undefined, "DELETE")
    await DELETE(req, { params: Promise.resolve({ id: "ci-001" }) })
    expect(prisma.checkIn.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ weddingId: "wedding-test-id" }) })
    )
  })
})
