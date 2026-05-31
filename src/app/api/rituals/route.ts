import { prisma } from "@/lib/db/prisma"
import { ok, serverErr, getWeddingId } from "@/lib/api"

export async function GET() {
  try {
    const rituals = await prisma.ritual.findMany({
      where: { weddingId: getWeddingId() },
      orderBy: { scheduledDate: "asc" },
    })
    return ok(rituals.map(r => ({ ...r, requiredItems: JSON.parse(r.requiredItems) })))
  } catch (e) {
    return serverErr(e)
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const ritual = await prisma.ritual.create({
      data: {
        weddingId: getWeddingId(),
        name: body.name,
        description: body.description,
        requiredItems: JSON.stringify(body.requiredItems ?? []),
        responsiblePerson: body.responsiblePerson,
        budget: body.budget ? Number(body.budget) : null,
        status: body.status ?? "PENDING",
        scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null,
        scheduledTime: body.scheduledTime,
        priestNotes: body.priestNotes,
      },
    })
    return ok({ ...ritual, requiredItems: body.requiredItems ?? [] }, 201)
  } catch (e) {
    return serverErr(e)
  }
}
