import { prisma } from "@/lib/db/prisma"
import { ok, serverErr, getWeddingId } from "@/lib/api"

export async function GET() {
  try {
    const items = await prisma.responsibility.findMany({
      where: { weddingId: getWeddingId() },
      orderBy: [{ priority: "desc" }, { task: "asc" }],
    })
    return ok(items)
  } catch (e) {
    return serverErr(e)
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const item = await prisma.responsibility.create({
      data: {
        weddingId: getWeddingId(),
        task: body.task,
        owner: body.owner,
        backupPerson: body.backupPerson,
        deadline: body.deadline ? new Date(body.deadline) : null,
        priority: body.priority ?? "MEDIUM",
        status: body.status ?? "PENDING",
        notes: body.notes,
      },
    })
    return ok(item, 201)
  } catch (e) {
    return serverErr(e)
  }
}
