import { prisma } from "@/lib/db/prisma"
import { ok, serverErr, getWeddingId } from "@/lib/api"

export async function GET() {
  try {
    const count = await prisma.guest.count({ where: { weddingId: getWeddingId() } })
    return ok({ count })
  } catch (e) {
    return serverErr(e)
  }
}
