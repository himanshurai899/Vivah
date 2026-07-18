import { seedDatabase } from "../src/lib/db/seed-runner"
import { prisma } from "../src/lib/db/prisma"

console.log("🌱 Seeding Vivah database...")

seedDatabase()
  .then(() => {
    console.log("🎊 Database seeded successfully!")
    console.log('\n💡 Add WEDDING_ID="vivah-2026" to your .env.local')
  })
  .catch(async (e) => {
    console.error("Seed error:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
