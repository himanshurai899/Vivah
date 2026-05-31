import { prisma } from "@/lib/db/prisma"
import { ok, serverErr, getWeddingId } from "@/lib/api"

export async function GET() {
  try {
    const alerts = await prisma.alert.findMany({
      where: { weddingId: getWeddingId(), active: true },
      orderBy: { createdAt: "desc" },
    })
    return ok(alerts)
  } catch (e) {
    return serverErr(e)
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const alert = await prisma.alert.create({
      data: {
        weddingId: getWeddingId(),
        type: body.type ?? "INFO",
        title: body.title,
        message: body.message,
        active: body.active ?? true,
        threshold: body.threshold ? Number(body.threshold) : null,
      },
    })
    return ok(alert, 201)
  } catch (e) {
    return serverErr(e)
  }
}
