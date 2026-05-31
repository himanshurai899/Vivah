import { prisma } from "@/lib/db/prisma"
import { ok, err, serverErr, getWeddingId } from "@/lib/api"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const result = await prisma.responsibility.updateMany({
      where: { id, weddingId: getWeddingId() },
      data: {
        task: body.task,
        owner: body.owner,
        backupPerson: body.backupPerson,
        deadline: body.deadline ? new Date(body.deadline) : null,
        priority: body.priority,
        status: body.status,
        notes: body.notes,
      },
    })
    if (result.count === 0) return err("Responsibility not found", 404)
    return ok({ success: true })
  } catch (e) {
    return serverErr(e)
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.responsibility.deleteMany({ where: { id, weddingId: getWeddingId() } })
    return ok({ success: true })
  } catch (e) {
    return serverErr(e)
  }
}
