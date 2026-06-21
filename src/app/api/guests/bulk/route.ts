import { prisma } from "@/lib/db/prisma"
import { ok, err, serverErr, getWeddingId } from "@/lib/api"

interface BulkGuestInput {
  name: string
  familyName: string
  mobile?: string
  side: "GROOM" | "BRIDE"
  notes?: string
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const contacts: BulkGuestInput[] = body.contacts
    if (!Array.isArray(contacts) || !contacts.length) return err("contacts array required")

    const weddingId = getWeddingId()

    // Fetch existing mobiles to skip true duplicates
    const existing = await prisma.guest.findMany({
      where: { weddingId },
      select: { mobile: true },
    })
    const existingMobiles = new Set(existing.map(g => g.mobile).filter(Boolean))

    const toCreate = contacts.filter(c => {
      if (!c.name || !c.familyName || !c.side) return false
      if (!["GROOM", "BRIDE"].includes(c.side)) return false
      // Skip if phone already exists in guest list
      if (c.mobile && existingMobiles.has(c.mobile)) return false
      return true
    })

    if (!toCreate.length) {
      return ok({ created: 0, skipped: contacts.length, message: "All contacts already exist in guest list" })
    }

    await prisma.guest.createMany({
      data: toCreate.map(c => ({
        weddingId,
        name: c.name,
        familyName: c.familyName,
        mobile: c.mobile || undefined,
        side: c.side,
        notes: c.notes || undefined,
        guestCount: 1,
        rsvpStatus: "PENDING",
        accommodationNeeded: false,
        pickupNeeded: false,
        invitationSent: false,
        giftReceived: false,
      })),
    })

    return ok({
      created: toCreate.length,
      skipped: contacts.length - toCreate.length,
      message: `Added ${toCreate.length} guest${toCreate.length !== 1 ? "s" : ""} to your list`,
    }, 201)
  } catch (e) {
    return serverErr(e)
  }
}
