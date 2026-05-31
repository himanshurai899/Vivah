import { prisma } from "@/lib/db/prisma"
import { ok, err, serverErr, getWeddingId } from "@/lib/api"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const result = await prisma.expense.updateMany({
      where: { id, weddingId: getWeddingId() },
      data: {
        category: body.category,
        description: body.description,
        paidTo: body.paidTo,
        amount: Number(body.amount),
        paidAmount: Number(body.paidAmount ?? 0),
        paymentMode: body.paymentMode,
        date: body.date ? new Date(body.date) : undefined,
      },
    })
    if (result.count === 0) return err("Expense not found", 404)
    return ok({ success: true })
  } catch (e) {
    return serverErr(e)
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.expense.deleteMany({ where: { id, weddingId: getWeddingId() } })
    return ok({ success: true })
  } catch (e) {
    return serverErr(e)
  }
}
