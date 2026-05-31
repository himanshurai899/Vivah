import { prisma } from "@/lib/db/prisma"
import { ok, serverErr, getWeddingId } from "@/lib/api"

export async function GET() {
  try {
    const blocks = await prisma.invitationBlock.findMany({
      where: { weddingId: getWeddingId() },
      orderBy: { sortOrder: "asc" },
    })
    return ok(blocks)
  } catch (e) {
    return serverErr(e)
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const block = await prisma.invitationBlock.create({
      data: {
        weddingId: getWeddingId(),
        section: body.section,
        title: body.title,
        primaryText: body.primaryText,
        description: body.description,
        date: body.date ? new Date(body.date) : null,
        time: body.time,
        contact: body.contact,
        sortOrder: body.sortOrder ?? 0,
      },
    })
    return ok(block, 201)
  } catch (e) {
    return serverErr(e)
  }
}
