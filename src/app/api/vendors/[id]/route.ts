import { prisma } from "@/lib/db/prisma"
import { ok, err, serverErr, getWeddingId } from "@/lib/api"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const result = await prisma.vendor.updateMany({
      where: { id, weddingId: getWeddingId() },
      data: {
        name: body.name,
        category: body.category,
        contactPerson: body.contactPerson,
        phone: body.phone,
        email: body.email,
        quotation: body.quotation ? Number(body.quotation) : null,
        negotiatedAmount: body.negotiatedAmount ? Number(body.negotiatedAmount) : null,
        finalAmount: body.finalAmount ? Number(body.finalAmount) : null,
        advancePaid: Number(body.advancePaid ?? 0),
        contractNotes: body.contractNotes,
        status: body.status,
        rating: body.rating ? Number(body.rating) : null,
        notes: body.notes,
      },
    })
    if (result.count === 0) return err("Vendor not found", 404)
    return ok({ success: true })
  } catch (e) {
    return serverErr(e)
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.vendor.deleteMany({ where: { id, weddingId: getWeddingId() } })
    return ok({ success: true })
  } catch (e) {
    return serverErr(e)
  }
}
