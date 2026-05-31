import { prisma } from "@/lib/db/prisma"
import { ok, err, serverErr, getWeddingId } from "@/lib/api"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const side = searchParams.get("side") ?? undefined
    const rsvp = searchParams.get("rsvp") ?? undefined
    const city = searchParams.get("city") ?? undefined

    const guests = await prisma.guest.findMany({
      where: {
        weddingId: getWeddingId(),
        ...(side && { side }),
        ...(rsvp && { rsvpStatus: rsvp }),
        ...(city && { city }),
      },
      orderBy: [{ side: "asc" }, { familyName: "asc" }, { name: "asc" }],
    })
    return ok(guests)
  } catch (e) {
    return serverErr(e)
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body.name || !body.familyName || !body.side) return err("name, familyName and side are required")
    if (!["GROOM", "BRIDE"].includes(body.side)) return err("side must be GROOM or BRIDE")
    if (body.guestCount < 1) return err("guestCount must be at least 1")

    const guest = await prisma.guest.create({
      data: {
        weddingId: getWeddingId(),
        name: body.name,
        familyName: body.familyName,
        side: body.side,
        mobile: body.mobile,
        city: body.city,
        state: body.state,
        relationship: body.relationship,
        guestCount: body.guestCount ?? 1,
        accommodationNeeded: body.accommodationNeeded ?? false,
        pickupNeeded: body.pickupNeeded ?? false,
        invitationSent: body.invitationSent ?? false,
        rsvpStatus: body.rsvpStatus ?? "PENDING",
        giftReceived: body.giftReceived ?? false,
        notes: body.notes,
      },
    })
    return ok(guest, 201)
  } catch (e) {
    return serverErr(e)
  }
}
