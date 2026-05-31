import { prisma } from "@/lib/db/prisma"
import { ok, serverErr, getWeddingId } from "@/lib/api"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get("eventId") ?? undefined
    const status = searchParams.get("status") ?? undefined

    const checkIns = await prisma.checkIn.findMany({
      where: { weddingId: getWeddingId(), ...(eventId && { eventId }), ...(status && { status }) },
      orderBy: [{ eventName: "asc" }, { guestName: "asc" }],
    })
    return ok(checkIns)
  } catch (e) {
    return serverErr(e)
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const checkIn = await prisma.checkIn.create({
      data: {
        weddingId: getWeddingId(),
        guestId: body.guestId ?? null,
        guestName: body.guestName,
        familyName: body.familyName,
        eventId: body.eventId ?? null,
        eventName: body.eventName,
        status: body.status ?? "PENDING",
        arrivalTime: body.arrivalTime ? new Date(body.arrivalTime) : null,
        qrCode: body.qrCode,
        notes: body.notes,
      },
    })
    return ok(checkIn, 201)
  } catch (e) {
    return serverErr(e)
  }
}
