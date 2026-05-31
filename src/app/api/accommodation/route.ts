import { prisma } from "@/lib/db/prisma"
import { ok, serverErr, getWeddingId } from "@/lib/api"

export async function GET() {
  try {
    const hotels = await prisma.hotel.findMany({
      where: { weddingId: getWeddingId() },
      include: { roomAllocations: true },
      orderBy: { name: "asc" },
    })
    return ok(hotels)
  } catch (e) {
    return serverErr(e)
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const hotel = await prisma.hotel.create({
      data: {
        weddingId: getWeddingId(),
        name: body.name,
        type: body.type ?? "HOTEL",
        address: body.address,
        contactPerson: body.contactPerson,
        phone: body.phone,
        roomsAvailable: Number(body.roomsAvailable ?? 0),
        roomsAllocated: Number(body.roomsAllocated ?? 0),
        checkInDate: body.checkInDate ? new Date(body.checkInDate) : null,
        checkOutDate: body.checkOutDate ? new Date(body.checkOutDate) : null,
        costPerNight: body.costPerNight ? Number(body.costPerNight) : null,
      },
    })
    return ok(hotel, 201)
  } catch (e) {
    return serverErr(e)
  }
}
