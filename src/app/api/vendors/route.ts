import { prisma } from "@/lib/db/prisma"
import { ok, err, serverErr, getWeddingId } from "@/lib/api"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category") ?? undefined
    const status = searchParams.get("status") ?? undefined

    const vendors = await prisma.vendor.findMany({
      where: { weddingId: getWeddingId(), ...(category && { category }), ...(status && { status }) },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    })
    return ok(vendors)
  } catch (e) {
    return serverErr(e)
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body.name || !body.category) return err("name and category are required")
    const vendor = await prisma.vendor.create({
      data: {
        weddingId: getWeddingId(),
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
        status: body.status ?? "SHORTLISTED",
        rating: body.rating ? Number(body.rating) : null,
        notes: body.notes,
      },
    })
    return ok(vendor, 201)
  } catch (e) {
    return serverErr(e)
  }
}
