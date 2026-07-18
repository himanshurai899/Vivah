export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { prisma } = await import("./lib/db/prisma")
    const existing = await prisma.wedding.findFirst().catch(() => null)
    if (!existing) {
      const { seedDatabase } = await import("./lib/db/seed-runner")
      await seedDatabase().catch(console.error)
    }
  }
}
