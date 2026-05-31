import { prisma } from "@/lib/db/prisma"
import { ok, serverErr, getWeddingId } from "@/lib/api"

export async function GET() {
  try {
    const cats = await prisma.budgetCategory.findMany({
      where: { weddingId: getWeddingId() },
      orderBy: { category: "asc" },
    })
    return ok(cats)
  } catch (e) {
    return serverErr(e)
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const cat = await prisma.budgetCategory.create({
      data: {
        weddingId: getWeddingId(),
        category: body.category,
        plannedBudget: Number(body.plannedBudget ?? 0),
        actualCost: Number(body.actualCost ?? 0),
        paidAmount: Number(body.paidAmount ?? 0),
      },
    })
    return ok(cat, 201)
  } catch (e) {
    return serverErr(e)
  }
}
