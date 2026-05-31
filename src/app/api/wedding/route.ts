import { prisma } from "@/lib/db/prisma"
import { ok, err, serverErr, getWeddingId } from "@/lib/api"

export async function GET() {
  try {
    const wedding = await prisma.wedding.findUnique({ where: { id: getWeddingId() } })
    if (!wedding) return err("Wedding not found. Run: npm run db:seed", 404)
    return ok(wedding)
  } catch (e) {
    return serverErr(e)
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const wedding = await prisma.wedding.update({
      where: { id: getWeddingId() },
      data: {
        name: body.name,
        venue: body.venue,
        groomName: body.groomName,
        brideName: body.brideName,
        city: body.city,
        state: body.state,
        date: body.date ? new Date(body.date) : undefined,
      },
    })
    return ok(wedding)
  } catch (e) {
    return serverErr(e)
  }
}
