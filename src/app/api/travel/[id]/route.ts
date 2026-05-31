import { prisma } from "@/lib/db/prisma"
import { ok, err, serverErr, getWeddingId } from "@/lib/api"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const result = await prisma.travelRecord.updateMany({
      where: { id, weddingId: getWeddingId() },
      data: {
        guestName: body.guestName,
        arrivalDate: body.arrivalDate ? new Date(body.arrivalDate) : null,
        arrivalTime: body.arrivalTime,
        transportType: body.transportType,
        pnrBookingId: body.pnrBookingId,
        pickupNeeded: body.pickupNeeded,
        pickupCoordinator: body.pickupCoordinator,
        vehicleNumber: body.vehicleNumber,
        status: body.status,
      },
    })
    if (result.count === 0) return err("Travel record not found", 404)
    return ok({ success: true })
  } catch (e) {
    return serverErr(e)
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.travelRecord.deleteMany({ where: { id, weddingId: getWeddingId() } })
    return ok({ success: true })
  } catch (e) {
    return serverErr(e)
  }
}
