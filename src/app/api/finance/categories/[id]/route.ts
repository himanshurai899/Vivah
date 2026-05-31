import { prisma } from "@/lib/db/prisma"
import { ok, err, serverErr, getWeddingId } from "@/lib/api"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const result = await prisma.budgetCategory.updateMany({
      where: { id, weddingId: getWeddingId() },
      data: {
        plannedBudget: Number(body.plannedBudget ?? 0),
        actualCost: Number(body.actualCost ?? 0),
        paidAmount: Number(body.paidAmount ?? 0),
      },
    })
    if (result.count === 0) return err("Category not found", 404)
    return ok({ success: true })
  } catch (e) {
    return serverErr(e)
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.budgetCategory.deleteMany({ where: { id, weddingId: getWeddingId() } })
    return ok({ success: true })
  } catch (e) {
    return serverErr(e)
  }
}
