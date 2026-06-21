import { prisma } from "@/lib/db/prisma"
import { ok, serverErr, getWeddingId } from "@/lib/api"

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: { weddingId: getWeddingId() },
      orderBy: [{ date: "asc" }, { name: "asc" }],
    })
    return ok(events)
  } catch (e) {
    return serverErr(e)
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const event = await prisma.event.create({
      data: {
        weddingId: getWeddingId(),
        name: body.name,
        eventType: body.eventType ?? "WEDDING",
        date: body.date ? new Date(body.date) : null,
        venue: body.venue,
        startTime: body.startTime,
        endTime: body.endTime,
        coordinator: body.coordinator,
        budget: body.budget ? Number(body.budget) : null,
        checklist: body.checklist ?? [],
        notes: body.notes,
        isMainFunction: body.isMainFunction ?? false,
        status: body.status ?? "PLANNED",
      },
    })
    return ok(event, 201)
  } catch (e) {
    return serverErr(e)
  }
}
