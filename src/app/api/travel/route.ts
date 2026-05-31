import { prisma } from "@/lib/db/prisma"
import { ok, serverErr, getWeddingId } from "@/lib/api"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") ?? undefined
    const records = await prisma.travelRecord.findMany({
      where: { weddingId: getWeddingId(), ...(status && { status }) },
      orderBy: [{ arrivalDate: "asc" }, { guestName: "asc" }],
    })
    return ok(records)
  } catch (e) {
    return serverErr(e)
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const record = await prisma.travelRecord.create({
      data: {
        weddingId: getWeddingId(),
        guestName: body.guestName,
        guestId: body.guestId ?? null,
        arrivalDate: body.arrivalDate ? new Date(body.arrivalDate) : null,
        arrivalTime: body.arrivalTime,
        transportType: body.transportType ?? "TRAIN",
        pnrBookingId: body.pnrBookingId,
        pickupNeeded: body.pickupNeeded ?? false,
        pickupCoordinator: body.pickupCoordinator,
        vehicleNumber: body.vehicleNumber,
        status: body.status ?? "PENDING",
      },
    })
    return ok(record, 201)
  } catch (e) {
    return serverErr(e)
  }
}
