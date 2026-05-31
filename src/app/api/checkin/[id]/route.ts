import { prisma } from "@/lib/db/prisma"
import { ok, err, serverErr, getWeddingId } from "@/lib/api"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const result = await prisma.checkIn.updateMany({
      where: { id, weddingId: getWeddingId() },
      data: {
        status: body.status,
        arrivalTime: body.status === "CHECKED_IN" ? new Date() : null,
        notes: body.notes,
      },
    })
    if (result.count === 0) return err("Check-in record not found", 404)
    return ok({ success: true })
  } catch (e) {
    return serverErr(e)
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.checkIn.deleteMany({ where: { id, weddingId: getWeddingId() } })
    return ok({ success: true })
  } catch (e) {
    return serverErr(e)
  }
}
