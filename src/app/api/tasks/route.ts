import { prisma } from "@/lib/db/prisma"
import { ok, serverErr, getWeddingId } from "@/lib/api"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") ?? undefined
    const tasks = await prisma.task.findMany({
      where: { weddingId: getWeddingId(), ...(status && { status }) },
      orderBy: [{ priority: "desc" }, { deadline: "asc" }],
    })
    return ok(tasks)
  } catch (e) {
    return serverErr(e)
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const task = await prisma.task.create({
      data: {
        weddingId: getWeddingId(),
        name: body.name,
        owner: body.owner,
        deadline: body.deadline ? new Date(body.deadline) : null,
        priority: body.priority ?? "MEDIUM",
        status: body.status ?? "PENDING",
        notes: body.notes,
      },
    })
    return ok(task, 201)
  } catch (e) {
    return serverErr(e)
  }
}
