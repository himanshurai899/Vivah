import { prisma } from "@/lib/db/prisma"
import { ok, err, serverErr, getWeddingId } from "@/lib/api"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const result = await prisma.invitationBlock.updateMany({
      where: { id, weddingId: getWeddingId() },
      data: { title: body.title, primaryText: body.primaryText, description: body.description, date: body.date ? new Date(body.date) : null, time: body.time, contact: body.contact, sortOrder: body.sortOrder },
    })
    if (result.count === 0) return err("Block not found", 404)
    return ok({ success: true })
  } catch (e) {
    return serverErr(e)
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.invitationBlock.deleteMany({ where: { id, weddingId: getWeddingId() } })
    return ok({ success: true })
  } catch (e) {
    return serverErr(e)
  }
}
