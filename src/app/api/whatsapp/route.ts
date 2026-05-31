import { prisma } from "@/lib/db/prisma"
import { ok, serverErr, getWeddingId } from "@/lib/api"

export async function GET() {
  try {
    const templates = await prisma.whatsAppTemplate.findMany({
      where: { weddingId: getWeddingId() },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    })
    return ok(templates.map(t => ({ ...t, variables: JSON.parse(t.variables) })))
  } catch (e) {
    return serverErr(e)
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const template = await prisma.whatsAppTemplate.create({
      data: {
        weddingId: getWeddingId(),
        name: body.name,
        category: body.category ?? "GENERAL",
        message: body.message,
        variables: JSON.stringify(body.variables ?? []),
        active: body.active ?? true,
      },
    })
    return ok({ ...template, variables: body.variables ?? [] }, 201)
  } catch (e) {
    return serverErr(e)
  }
}
