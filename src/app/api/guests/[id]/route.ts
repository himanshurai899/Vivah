import { prisma } from "@/lib/db/prisma"
import { ok, err, serverErr, getWeddingId } from "@/lib/api"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const guest = await prisma.guest.findFirst({ where: { id, weddingId: getWeddingId() } })
    if (!guest) return err("Guest not found", 404)
    return ok(guest)
  } catch (e) {
    return serverErr(e)
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const guest = await prisma.guest.updateMany({
      where: { id, weddingId: getWeddingId() },
      data: {
        name: body.name,
        familyName: body.familyName,
        side: body.side,
        mobile: body.mobile,
        city: body.city,
        state: body.state,
        relationship: body.relationship,
        guestCount: body.guestCount,
        accommodationNeeded: body.accommodationNeeded,
        pickupNeeded: body.pickupNeeded,
        invitationSent: body.invitationSent,
        rsvpStatus: body.rsvpStatus,
        giftReceived: body.giftReceived,
        notes: body.notes,
      },
    })
    if (guest.count === 0) return err("Guest not found", 404)
    return ok({ success: true })
  } catch (e) {
    return serverErr(e)
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.guest.deleteMany({ where: { id, weddingId: getWeddingId() } })
    return ok({ success: true })
  } catch (e) {
    return serverErr(e)
  }
}
