import { prisma } from "@/lib/db/prisma"
import { ok, err, serverErr, getWeddingId } from "@/lib/api"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const result = await prisma.event.updateMany({
      where: { id, weddingId: getWeddingId() },
      data: {
        name: body.name,
        eventType: body.eventType,
        date: body.date ? new Date(body.date) : null,
        venue: body.venue,
        startTime: body.startTime,
        endTime: body.endTime,
        coordinator: body.coordinator,
        budget: body.budget ? Number(body.budget) : null,
        checklist: body.checklist ?? [],
        notes: body.notes,
        isMainFunction: body.isMainFunction ?? false,
        status: body.status,
      },
    })
    if (result.count === 0) return err("Event not found", 404)
    return ok({ success: true })
  } catch (e) {
    return serverErr(e)
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.event.deleteMany({ where: { id, weddingId: getWeddingId() } })
    return ok({ success: true })
  } catch (e) {
    return serverErr(e)
  }
}
