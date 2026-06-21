import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

/** Converts any string to a URL-safe slug with no special characters */
const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")

async function main() {
  console.log("🌱 Seeding Vivah database...")

  const wedding = await prisma.wedding.upsert({
    where: { id: "vivah-2026" },
    update: {},
    create: {
      id: "vivah-2026",
      name: "Himanshu & Samiksha Vivah 2026",
      date: new Date("2026-11-25T10:00:00+05:30"),
      venue: "PURSHOTTAM PARTY PLOT, Millennium Northway, Be side, Kabir Rd, opp. Navrachna University, Bhayli, Vadodara, Gujarat 391410",
      groomName: "Himanshu Rai",
      brideName: "Samiksha Yadav",
      city: "Vadodara",
      state: "Gujarat",
    },
  })

  console.log(`✅ Wedding created: ${wedding.id}`)
  console.log(`\n⚡ Add to .env.local:\nWEDDING_ID="${wedding.id}"\n`)

  // ── Wedding Functions / Events ─────────────────────────────────────────────
  const events = [
    { name: "Tilak Ceremony", eventType: "PRE_WEDDING", date: new Date("2026-11-10"), venue: "Bride's Residence", startTime: "10:00", endTime: "13:00", coordinator: "Suresh Kumar", budget: 50000, notes: "Groom's family visits bride's family. Tilak applied by bride's father on groom's forehead.", isMainFunction: true },
    { name: "Sagai / Engagement", eventType: "PRE_WEDDING", date: new Date("2026-11-10"), venue: "Hotel Banquet Hall, Vadodara", startTime: "17:00", endTime: "21:00", coordinator: "Priya Sharma", budget: 150000, notes: "Ring exchange ceremony followed by dinner." },
    { name: "Haldi Ceremony", eventType: "WEDDING", date: new Date("2026-11-23"), venue: "Groom's Residence", startTime: "09:00", endTime: "12:00", coordinator: "Anita Devi", budget: 30000, notes: "Turmeric paste applied to groom. Ladies from family apply haldi with songs." },
    { name: "Mehendi Ceremony", eventType: "WEDDING", date: new Date("2026-11-23"), venue: "Bride's Residence", startTime: "14:00", endTime: "21:00", coordinator: "Sunita Verma", budget: 40000, notes: "Bridal mehendi and all ladies' mehendi. Mehendi artist booked for 7 hours." },
    { name: "Sangeet Night", eventType: "WEDDING", date: new Date("2026-11-23"), venue: "Banyan Paradise Resort — Jasmine Hall", startTime: "19:00", endTime: "23:00", coordinator: "Rohit Singh", budget: 200000, notes: "DJ night, dance performances by families, live music. Both families perform." },
    { name: "Matkor", eventType: "WEDDING", date: new Date("2026-11-24"), venue: "Groom's Residence", startTime: "07:00", endTime: "10:00", coordinator: "Elder Aunt (Chachi)", budget: 15000, notes: "Sacred ritual performed the night before wedding. Mitti (earth) from five places collected and worshipped." },
    { name: "Baraat", eventType: "WEDDING", date: new Date("2026-11-25"), venue: "Starts from Hotel, arrives at Banyan Paradise Resort", startTime: "17:00", endTime: "19:00", coordinator: "Rajesh Kumar (Groom's Uncle)", budget: 100000, notes: "Groom's procession. Band, DJ, dancing. Decorated horse/car for groom.", isMainFunction: true },
    { name: "Jaimala", eventType: "WEDDING", date: new Date("2026-11-25"), venue: "Banyan Paradise Resort — Mandap", startTime: "19:30", endTime: "20:00", coordinator: "Master of Ceremony", budget: 10000, notes: "Garland exchange between bride and groom. Families try to lift each person." },
    { name: "Mandap Ceremony", eventType: "WEDDING", date: new Date("2026-11-25"), venue: "Banyan Paradise Resort — Mandap", startTime: "20:00", endTime: "23:30", coordinator: "Pt. Ramakant Shastri", budget: 51000, notes: "Main wedding ceremony with priest. Includes Kanyadaan, Saat Phere, Sindoor Daan." },
    { name: "Kanyadaan", eventType: "WEDDING", date: new Date("2026-11-25"), venue: "Banyan Paradise Resort — Mandap", startTime: "21:00", endTime: "21:30", coordinator: "Pt. Ramakant Shastri", budget: 5000, notes: "Father gives away bride. Most emotional ritual. Bride's parents give her hand to groom." },
    { name: "Saat Phere", eventType: "WEDDING", date: new Date("2026-11-25"), venue: "Banyan Paradise Resort — Mandap", startTime: "21:30", endTime: "22:30", coordinator: "Pt. Ramakant Shastri", budget: 0, notes: "Seven rounds around sacred fire. Each round represents one vow of marriage." },
    { name: "Sindoor Daan", eventType: "WEDDING", date: new Date("2026-11-25"), venue: "Banyan Paradise Resort — Mandap", startTime: "22:30", endTime: "22:45", coordinator: "Pt. Ramakant Shastri", budget: 2000, notes: "Groom applies sindoor in bride's maang. Marks her as married." },
    { name: "Vidaai", eventType: "WEDDING", date: new Date("2026-11-25"), venue: "Banyan Paradise Resort — Gate", startTime: "23:45", endTime: "00:30", coordinator: "Both Families", budget: 20000, notes: "Bride's farewell. She throws puffed rice over her head three times. Very emotional." },
    { name: "Griha Pravesh", eventType: "POST_WEDDING", date: new Date("2026-11-26"), venue: "Groom's Residence", startTime: "06:00", endTime: "07:30", coordinator: "Groom's Mother", budget: 15000, notes: "Welcoming bride to new home. She knocks kalash with right foot, enters with right foot." },
    { name: "Reception", eventType: "POST_WEDDING", date: new Date("2026-11-26"), venue: "Banyan Paradise Resort — Main Lawn", startTime: "18:00", endTime: "23:00", coordinator: "Event Management Team", budget: 300000, notes: "Grand reception. All guests invited. Dinner, DJ, couple on stage for photo sessions." },
    { name: "Satyanarayan Katha", eventType: "POST_WEDDING", date: new Date("2026-11-27"), venue: "Groom's Residence", startTime: "09:00", endTime: "12:00", coordinator: "Pt. Ramakant Shastri", budget: 15000, notes: "Thanksgiving puja. Family gathers, priest conducts Satyanarayan katha." },
    { name: "Family Lunch", eventType: "POST_WEDDING", date: new Date("2026-11-27"), venue: "Banyan Paradise Resort — Dining Hall", startTime: "13:00", endTime: "16:00", coordinator: "Priya Devi", budget: 50000, notes: "Farewell lunch for all guests before they depart. Bihari cuisine served." },
  ]

  for (const event of events) {
    await prisma.event.upsert({
      where: { id: `event-${slugify(event.name)}` },
      update: {},
      create: { id: `event-${slugify(event.name)}`, weddingId: wedding.id, ...event },
    })
  }
  console.log(`✅ ${events.length} events/functions seeded`)

  // ── Bihari Wedding Rituals ─────────────────────────────────────────────────
  const rituals = [
    {
      name: "Tilak",
      description: "The formal acceptance ceremony where bride's father applies tilak on groom's forehead in the presence of both families. Marks the official beginning of wedding proceedings.",
      requiredItems: JSON.stringify(["Chandan (sandalwood paste)", "Kumkum (vermilion)", "Akshat (whole unbroken rice grains)", "Marigold flowers", "Supari (betel nut)", "Coconut", "Dakshina (cash gift)", "Pedha/Laddu (sweets)", "Pan leaves (5 pairs)", "Sindoor", "New dhoti-kurta for groom", "Mango leaves"]),
      responsiblePerson: "Bride's Father (Kanyadaan Pita)",
      budget: 25000,
      scheduledDate: new Date("2026-11-10"),
      scheduledTime: "10:00",
      priestNotes: "Muhurat: 10:00–12:00. Priest will guide the rituals. Keep all items ready in a thali.",
    },
    {
      name: "Matkor (Mitti Puja)",
      description: "Sacred earth-worship ritual performed the night before the wedding. Soil from five auspicious places is collected and worshipped. Symbolises grounding and blessings from Mother Earth.",
      requiredItems: JSON.stringify(["Sacred soil from 5 places (well, temple, anthill, river bank, crossroads)", "5 clay pots (matka)", "Mango leaves", "Marigold flowers", "5 earthen diyas (lamps)", "Mustard oil (for diyas)", "Incense sticks (agarbatti)", "Turmeric paste", "Sindoor", "Coins (5 types)", "Red cloth", "White rice"]),
      responsiblePerson: "Elder Women of Family (Mamijaan / Chachi)",
      budget: 10000,
      scheduledDate: new Date("2026-11-24"),
      scheduledTime: "20:00",
      priestNotes: "Ladies-only ritual. Performed after sunset. Song 'Matkor ki geet' sung by ladies.",
    },
    {
      name: "Haldi (Ubtan) Ceremony",
      description: "Turmeric paste ceremony to purify and beautify the groom before the wedding. Paste is applied by female relatives with songs and blessings.",
      requiredItems: JSON.stringify(["Haldi (turmeric powder)", "Chandan (sandalwood paste)", "Besan (gram flour)", "Malai (cream)", "Rose water", "Mustard oil", "Fresh neem leaves (anti-bacterial)", "Marigold flowers for decoration", "Banana leaves (for base)", "Yellow cloth/dupatta", "Yellow outfit for groom", "Bowl for ubtan preparation"]),
      responsiblePerson: "Groom's Maternal Aunt (Maasi / Buaa)",
      budget: 20000,
      scheduledDate: new Date("2026-11-23"),
      scheduledTime: "09:00",
      priestNotes: "Groom should not step outside after haldi till wedding. Keep a clean change of clothes ready.",
    },
    {
      name: "Jaimala (Varmala)",
      description: "The garland exchange ceremony where bride and groom exchange flower garlands accepting each other as life partners. Playful ritual where families try to lift each person to prevent the garland from reaching.",
      requiredItems: JSON.stringify(["2 fresh flower garlands (marigold + rose + mogra — one each)", "Flower petals for showering", "Supari (betel nut) in small thali", "Coconut", "Rose water spray", "Background music arrangement", "Stage decoration"]),
      responsiblePerson: "Master of Ceremony / Event Coordinator",
      budget: 8000,
      scheduledDate: new Date("2026-11-25"),
      scheduledTime: "19:30",
      priestNotes: "Garlands should be fresh, not wilted. Order day-of from flower vendor.",
    },
    {
      name: "Kanyadaan",
      description: "The most sacred and emotional ritual where the bride's father gives away his daughter's hand to the groom. The ultimate gift (dan) that a father can give. Bride's parents place her hands in groom's hands.",
      requiredItems: JSON.stringify(["Kalash (copper/silver pot) filled with Ganga water", "Mango leaves in kalash", "Coconut on kalash", "Gold coin or gold ornament", "Honey (madhu)", "Ghee (clarified butter)", "Flowers (lotus if possible)", "Sacred thread (mauli/kalawa)", "Akshat (whole rice)", "White handkerchief/cloth", "Groom's ring"]),
      responsiblePerson: "Bride's Father + Priest (Pt. Ramakant Shastri)",
      budget: 5000,
      scheduledDate: new Date("2026-11-25"),
      scheduledTime: "21:00",
      priestNotes: "Most emotional ritual. Have tissues ready. Photographer must capture this moment. Priest will recite mantras.",
    },
    {
      name: "Saat Phere (Saptapadi)",
      description: "The seven sacred rounds around the holy fire, each representing a vow of marriage. The most binding ritual of Hindu marriage. After the 7th round, the couple are legally and spiritually married.",
      requiredItems: JSON.stringify(["Sacred fire / Agni kund (havan kund)", "Dry mango wood (aam ki lakdi)", "Samidha (small pieces of wood for havan)", "Ghee (3 kg at least)", "Havishya materials: sesame (til), rice (chawal), barley (jau), dry coconut, camphor", "Banana leaves (2 large)", "Akshat", "Flowers", "Incense sticks", "Sacred thread connecting bride and groom", "Cotton wicks for agni", "Earthen pot for havan"]),
      responsiblePerson: "Pt. Ramakant Shastri (Head Priest)",
      budget: 15000,
      scheduledDate: new Date("2026-11-25"),
      scheduledTime: "21:30",
      priestNotes: "7 rounds in total. Each round = 1 vow. Bride leads for first 3, groom leads for last 4 (varies by tradition). Total time ~45 minutes.",
    },
    {
      name: "Sindoor Daan",
      description: "The groom applies sindoor (vermilion) in the parting of the bride's hair, officially making her his wife. The most visible sign of a married Hindu woman.",
      requiredItems: JSON.stringify(["Sindoor (vermilion) — preferably in a gold box", "Gold ring or coin to apply sindoor (not bare finger)", "Small mirror for bride", "Flowers", "Akshat (whole rice)", "Mangalsutra (if being tied at this time)", "Bangles (chura/shakha-pola per tradition)"]),
      responsiblePerson: "Groom (assisted by Priest)",
      budget: 3000,
      scheduledDate: new Date("2026-11-25"),
      scheduledTime: "22:30",
      priestNotes: "Apply sindoor with ring/coin from groom's right hand. Priest will guide exact procedure.",
    },
    {
      name: "Vidaai (Bride's Farewell)",
      description: "The emotional farewell ceremony where the bride leaves her parental home for the last time as an unmarried daughter. She throws puffed rice over her head three times as a blessing to her parents.",
      requiredItems: JSON.stringify(["Puffed rice / laaja (lawa) — 3 handfuls", "Flowers for showering", "Coconut (bride kicks before leaving)", "Dahi and honey (for good omen)", "New saree for bride to change into", "Mangalsutra (if not applied earlier)", "Decorated car for departure", "Diyas on both sides of the door"]),
      responsiblePerson: "Both Families + Event Coordinator",
      budget: 10000,
      scheduledDate: new Date("2026-11-25"),
      scheduledTime: "23:45",
      priestNotes: "Bride must not look back. Groom's family receives her. Have water/juice ready. Photographer MUST capture this.",
    },
    {
      name: "Griha Pravesh (Home Welcome)",
      description: "The welcoming of the new bride into the groom's home. She kicks a pot of rice with her right foot (symbolising prosperity), then enters right foot first.",
      requiredItems: JSON.stringify(["Decorated kalash at doorstep", "Rice/wheat pot for bride to kick (right foot)", "Red colour (alta) for bride's feet", "Flower petals for path", "Diya and aarti plate", "Sweets (kheer or halwa)", "Red cloth at threshold", "Mango leaves and marigold door decoration", "Coconut"]),
      responsiblePerson: "Groom's Mother",
      budget: 8000,
      scheduledDate: new Date("2026-11-26"),
      scheduledTime: "06:00",
      priestNotes: "Must happen before sunrise (muhurat). Groom's mother does aarti. Bride enters right foot first.",
    },
  ]

  for (const ritual of rituals) {
    await prisma.ritual.upsert({
      where: { id: `ritual-${slugify(ritual.name)}` },
      update: {},
      create: { id: `ritual-${slugify(ritual.name)}`, weddingId: wedding.id, ...ritual },
    })
  }
  console.log(`✅ ${rituals.length} Bihari rituals seeded with full samagri lists`)

  // ── Vendors — Vadodara (from web search) ──────────────────────────────────
  const vendors = [
    { name: "VMR Photography", category: "PHOTOGRAPHER", phone: "+91 94XXXXXXXX", contactPerson: "VMR", quotation: 90000, negotiatedAmount: 80000, status: "SHORTLISTED", rating: 5, notes: "₹30,000/day × 3 days. 4.9 rating, 18 reviews on WedMeGood. Candid + traditional." },
    { name: "The Wedding Scenario", category: "PHOTOGRAPHER", phone: "+91 98XXXXXXXX", contactPerson: "Manager", quotation: 105000, negotiatedAmount: 95000, status: "SHORTLISTED", rating: 5, notes: "₹35,000/day × 3 days. 5.0 rating, 16 reviews. Award-winning team." },
    { name: "Keyur Soni Photography", category: "PHOTOGRAPHER", phone: "+91 90XXXXXXXX", contactPerson: "Keyur Soni", quotation: 120000, negotiatedAmount: 110000, status: "SHORTLISTED", rating: 5, notes: "₹40,000/day × 3 days. 5.0 rating, 34 reviews. Drone photography available (₹10,000 extra)." },
    { name: "Rajpurohit Caterers", category: "CATERER", phone: "+91 97XXXXXXXX", contactPerson: "Rajesh Purohit", quotation: 800 * 110, negotiatedAmount: 800 * 100, status: "SHORTLISTED", rating: 4, notes: "₹110/plate veg. Capacity: 1000+ guests. Pure veg. Bihari + Gujarati menu available." },
    { name: "Desai Caterers Vadodara", category: "CATERER", phone: "+91 98XXXXXXXX", contactPerson: "Kiran Desai", quotation: 800 * 400, negotiatedAmount: 800 * 350, status: "SHORTLISTED", rating: 4, notes: "₹400/plate veg. Premium catering with multiple cuisine options including Bihari thali." },
    { name: "Munch Catering Services", category: "CATERER", phone: "+91 93XXXXXXXX", contactPerson: "Ramesh Shah", quotation: 800 * 200, negotiatedAmount: 800 * 175, status: "SHORTLISTED", rating: 4, notes: "₹175/plate. Good reputation for North Indian food. Can arrange Bihari special items." },
    { name: "H.R. Creation Diwalipura", category: "DECORATOR", phone: "+91 99XXXXXXXX", contactPerson: "Hitesh", quotation: 120000, negotiatedAmount: 100000, status: "SHORTLISTED", rating: 5, notes: "Starting ₹80,000. 5.0 rating. Specialises in mandap + floral decoration." },
    { name: "AK Creation Decoration", category: "DECORATOR", phone: "+91 92XXXXXXXX", contactPerson: "Akash", quotation: 100000, negotiatedAmount: 90000, status: "SHORTLISTED", rating: 4, notes: "Starting ₹80,000. Traditional and contemporary wedding decoration." },
    { name: "Folk Finds Decor", category: "DECORATOR", phone: "+91 87XXXXXXXX", contactPerson: "Manager", quotation: 250000, negotiatedAmount: 220000, status: "SHORTLISTED", rating: 5, notes: "Premium decor starting ₹2,00,000. Specialises in grand wedding themes." },
    { name: "The Shaadi Planners", category: "EVENT_PLANNER", phone: "+91 98XXXXXXXX", contactPerson: "Deepa Mehta", quotation: 250000, negotiatedAmount: 220000, status: "SHORTLISTED", rating: 5, notes: "4.8 rating, 13 reviews. Full event management from engagement to reception." },
    { name: "Celibraze Events & Entertainment", category: "EVENT_PLANNER", phone: "+91 95XXXXXXXX", contactPerson: "Ravi Joshi", quotation: 450000, negotiatedAmount: 400000, status: "SHORTLISTED", rating: 5, notes: "5.0 rating, 50 reviews. Premium event management. Award-winning team in Vadodara." },
    { name: "Sattva Weddings", category: "EVENT_PLANNER", phone: "+91 96XXXXXXXX", contactPerson: "Nisha Patel", quotation: 250000, negotiatedAmount: 200000, status: "SHORTLISTED", rating: 5, notes: "4.9 rating, 20 reviews. Focus on personalised weddings. Handle outstation coordination." },
    { name: "Pt. Ramakant Shastri", category: "PRIEST", phone: "+91 98XXXXXXXX", contactPerson: "Pt. Ramakant Shastri", quotation: 55000, finalAmount: 51000, advancePaid: 11000, status: "FINALIZED", rating: 5, notes: "Experienced Bihari pandit. Knows all traditional Bihari wedding rituals. Speaks Hindi + Bhojpuri. Booked and confirmed." },
    { name: "DJ Anand Entertainment", category: "DJ", phone: "+91 90XXXXXXXX", contactPerson: "Anand", quotation: 30000, negotiatedAmount: 25000, status: "SHORTLISTED", rating: 4, notes: "₹25,000 for full night. Bollywood + Bhojpuri songs. Sound system included." },
    { name: "Shivanik Brass Band", category: "BAND", phone: "+91 91XXXXXXXX", contactPerson: "Manager", quotation: 45000, negotiatedAmount: 40000, status: "SHORTLISTED", rating: 4, notes: "Traditional brass band for baraat. 15-member team. Bihari/Bhojpuri songs played." },
    { name: "Priya Mehendi Studio", category: "MEHENDI", phone: "+91 94XXXXXXXX", contactPerson: "Priya", quotation: 15000, negotiatedAmount: 12000, status: "SHORTLISTED", rating: 5, notes: "Bridal mehendi specialist. Rajasthani and Bihari designs. 3+ hours for bridal + family mehendi." },
    { name: "Glamour Touch Makeup Studio", category: "MAKEUP", phone: "+91 87XXXXXXXX", contactPerson: "Sunita", quotation: 25000, negotiatedAmount: 22000, status: "SHORTLISTED", rating: 4, notes: "HD + airbrush bridal makeup. Experienced with North Indian bridal looks." },
    { name: "Flower Palace Vadodara", category: "FLOWER", phone: "+91 95XXXXXXXX", contactPerson: "Keval", quotation: 80000, negotiatedAmount: 70000, status: "SHORTLISTED", rating: 4, notes: "All-in-one flower vendor for mandap, stage, car decoration, garlands, bouquets." },
    { name: "Raj Tent House", category: "TENT", phone: "+91 99XXXXXXXX", contactPerson: "Rajesh", quotation: 120000, negotiatedAmount: 100000, status: "SHORTLISTED", rating: 4, notes: "Luxury tent and furniture. Air-cooled shamiana. Seating for 1000+." },
    { name: "Shiv Travels Vadodara", category: "TRANSPORT", phone: "+91 98XXXXXXXX", contactPerson: "Shiv", quotation: 80000, negotiatedAmount: 70000, status: "SHORTLISTED", rating: 4, notes: "Fleet of AC buses, tempo travellers, sedans for guest airport/railway pickup." },
  ]

  for (const vendor of vendors) {
    await prisma.vendor.upsert({
      where: { id: `vendor-${slugify(vendor.name)}` },
      update: {},
      create: { id: `vendor-${slugify(vendor.name)}`, weddingId: wedding.id, ...vendor },
    })
  }
  console.log(`✅ ${vendors.length} Vadodara vendors seeded`)

  // ── Budget Categories ──────────────────────────────────────────────────────
  const budgetCategories = [
    { category: "Venue & Banquet Hall", plannedBudget: 1500000 },
    { category: "Food & Catering", plannedBudget: 2000000 },
    { category: "Photography & Videography", plannedBudget: 500000 },
    { category: "Decorations & Flowers", plannedBudget: 800000 },
    { category: "Accommodation", plannedBudget: 1000000 },
    { category: "Travel & Transportation", plannedBudget: 500000 },
    { category: "Jewelry & Accessories", plannedBudget: 1500000 },
    { category: "Clothing & Attire", plannedBudget: 800000 },
    { category: "Invitation Cards & Stationery", plannedBudget: 200000 },
    { category: "Gifts & Favors", plannedBudget: 300000 },
    { category: "Rituals & Puja Samagri", plannedBudget: 200000 },
    { category: "Entertainment (DJ/Band)", plannedBudget: 300000 },
    { category: "Emergency Fund", plannedBudget: 500000 },
    { category: "Miscellaneous", plannedBudget: 300000 },
  ]

  for (const cat of budgetCategories) {
    await prisma.budgetCategory.upsert({
      where: { weddingId_category: { weddingId: wedding.id, category: cat.category } },
      update: {},
      create: { weddingId: wedding.id, ...cat },
    })
  }
  console.log(`✅ ${budgetCategories.length} budget categories seeded`)

  // ── Hotels / Accommodation ─────────────────────────────────────────────────
  const hotels = [
    { name: "Banyan Paradise Resort", type: "RESORT", address: "NH-8, Makarpura Road, Vadodara 390010", contactPerson: "Front Desk", phone: "+91 265 XXXXXXX", roomsAvailable: 50, checkInDate: new Date("2026-11-22"), checkOutDate: new Date("2026-11-28"), costPerNight: 3500 },
    { name: "Fortune Inn Promenade", type: "HOTEL", address: "R.C. Dutt Road, Alkapuri, Vadodara 390007", contactPerson: "Reservations", phone: "+91 265 XXXXXXX", roomsAvailable: 30, checkInDate: new Date("2026-11-23"), checkOutDate: new Date("2026-11-27"), costPerNight: 4500 },
    { name: "Lords Inn Vadodara", type: "HOTEL", address: "Old Padra Road, Vadodara 390015", contactPerson: "Manager", phone: "+91 265 XXXXXXX", roomsAvailable: 40, checkInDate: new Date("2026-11-23"), checkOutDate: new Date("2026-11-27"), costPerNight: 3000 },
    { name: "Hotel Surya International", type: "HOTEL", address: "Sayajigunj, Vadodara 390005", contactPerson: "Receptionist", phone: "+91 265 XXXXXXX", roomsAvailable: 25, checkInDate: new Date("2026-11-23"), checkOutDate: new Date("2026-11-27"), costPerNight: 2000 },
  ]

  for (const hotel of hotels) {
    await prisma.hotel.upsert({
      where: { id: `hotel-${slugify(hotel.name)}` },
      update: {},
      create: { id: `hotel-${slugify(hotel.name)}`, weddingId: wedding.id, ...hotel },
    })
  }
  console.log(`✅ ${hotels.length} hotels seeded`)

  // ── Tasks ──────────────────────────────────────────────────────────────────
  const tasks = [
    { name: "Confirm wedding venue — Banyan Paradise Resort", priority: "CRITICAL", status: "COMPLETED", owner: "Suresh Kumar", deadline: new Date("2026-04-01"), notes: "Venue confirmed and deposit paid." },
    { name: "Finalize and book main caterer", priority: "CRITICAL", status: "IN_PROGRESS", owner: "Priya Devi", deadline: new Date("2026-08-01"), notes: "Comparing Rajpurohit Caterers and Desai Caterers. Decision pending." },
    { name: "Book photographer + videographer package", priority: "HIGH", status: "IN_PROGRESS", owner: "Himanshu", deadline: new Date("2026-07-01"), notes: "Shortlist: VMR Photography and The Wedding Scenario." },
    { name: "Print and dispatch wedding cards", priority: "CRITICAL", status: "PENDING", owner: "Anita Sharma", deadline: new Date("2026-10-01"), notes: "Design finalised. 1500 cards to print. Dispatch by Diwali." },
    { name: "Book accommodation for outstation guests (150+ rooms)", priority: "HIGH", status: "IN_PROGRESS", owner: "Rahul Kumar", deadline: new Date("2026-09-01"), notes: "Blocked rooms at 3 hotels. Confirm final numbers after RSVP." },
    { name: "Arrange fleet for airport / railway pickups", priority: "HIGH", status: "PENDING", owner: "Rohit Verma", deadline: new Date("2026-11-01"), notes: "Coordinate with Shiv Travels. Need 10 vehicles on 22-24 Nov." },
    { name: "Finalise bridal lehenga and groom's sherwani", priority: "HIGH", status: "IN_PROGRESS", owner: "Family", deadline: new Date("2026-09-15"), notes: "Shopping trip to Surat planned for August." },
    { name: "Book bridal makeup artist", priority: "MEDIUM", status: "PENDING", owner: "Bride's Family", deadline: new Date("2026-09-01") },
    { name: "Finalise flower and decoration vendor", priority: "HIGH", status: "PENDING", owner: "Suresh Kumar", deadline: new Date("2026-09-01") },
    { name: "Confirm final guest list and RSVP", priority: "CRITICAL", status: "IN_PROGRESS", owner: "Both Families", deadline: new Date("2026-10-15"), notes: "Target: confirm 800 attending guests." },
    { name: "Send digital wedding invitations via WhatsApp", priority: "HIGH", status: "PENDING", owner: "Anita Sharma", deadline: new Date("2026-10-20") },
    { name: "Book DJ and Band for Sangeet and Baraat", priority: "MEDIUM", status: "PENDING", owner: "Rohit Singh", deadline: new Date("2026-08-15") },
    { name: "Purchase wedding jewelry (bride)", priority: "HIGH", status: "IN_PROGRESS", owner: "Bride's Family", deadline: new Date("2026-10-01") },
    { name: "Confirm priest (Pandit) — Pt. Ramakant Shastri", priority: "CRITICAL", status: "COMPLETED", owner: "Suresh Kumar", notes: "Booked and confirmed. Advance paid." },
    { name: "Plan Mehendi ceremony — artist and guest list", priority: "MEDIUM", status: "PENDING", owner: "Sunita Verma", deadline: new Date("2026-10-01") },
    { name: "Arrange Puja Samagri for all rituals", priority: "HIGH", status: "PENDING", owner: "Elder Aunt (Chachi)", deadline: new Date("2026-11-15"), notes: "Buy all items from trusted puja store. Refer ritual samagri list." },
    { name: "Coordinate travel logistics from Bihar", priority: "HIGH", status: "PENDING", owner: "Rahul Kumar", deadline: new Date("2026-11-01"), notes: "Train: Rajdhani from Patna. Book group tickets." },
    { name: "Set up emergency contact list", priority: "HIGH", status: "PENDING", owner: "Suresh Kumar", deadline: new Date("2026-11-15") },
    { name: "Final vendor payments and confirmation", priority: "CRITICAL", status: "PENDING", owner: "Suresh Kumar", deadline: new Date("2026-11-20") },
    { name: "Create WhatsApp groups for all functions", priority: "MEDIUM", status: "PENDING", owner: "Himanshu", deadline: new Date("2026-10-01") },
  ]

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { id: `task-${slugify(task.name).substring(0, 40)}` },
      update: {},
      create: { id: `task-${slugify(task.name).substring(0, 40)}`, weddingId: wedding.id, ...task },
    })
  }
  console.log(`✅ ${tasks.length} tasks seeded`)

  // ── Family Responsibilities ────────────────────────────────────────────────
  const responsibilities = [
    { task: "Airport & Railway Station Pickups", owner: "Rahul Kumar (Groom's Cousin)", backupPerson: "Amit Sharma", priority: "CRITICAL", status: "PENDING", notes: "Coordinate with Shiv Travels. Keep pickup schedule updated. WhatsApp group for coordinators.", deadline: new Date("2026-11-22") },
    { task: "Hotel Check-in Coordination", owner: "Priya Devi (Groom's Sister)", backupPerson: "Sunita Verma", priority: "HIGH", status: "PENDING", notes: "Manage room allocations. Keep hotel contact list. Handle any issues with bookings.", deadline: new Date("2026-11-22") },
    { task: "Vendor Payments & Receipts", owner: "Suresh Kumar (Father)", backupPerson: "Deepak Singh (Uncle)", priority: "CRITICAL", status: "PENDING", notes: "Keep all vendor payment records. Carry cheque book + UPI. No cash payments over ₹10,000.", deadline: new Date("2026-11-20") },
    { task: "Guest Welcome & Reception", owner: "Anita Sharma (Groom's Mother)", backupPerson: "Rita Gupta (Aunt)", priority: "HIGH", status: "PENDING", notes: "Welcome guests at venue gate. Distribute shagun thali, flowers. Coordinate seating.", deadline: new Date("2026-11-25") },
    { task: "Ritual Materials & Samagri Setup", owner: "Elder Aunt Chachi (Kamla Devi)", backupPerson: "Mamijaan (Savitri Devi)", priority: "CRITICAL", status: "PENDING", notes: "Ensure all puja samagri is available before each ritual. Coordinate with pandit.", deadline: new Date("2026-11-24") },
    { task: "Children & Youngsters Coordination", owner: "Neha Devi (Cousin)", backupPerson: "Kavita Singh", priority: "MEDIUM", status: "PENDING", notes: "Manage kids during ceremonies. Keep them engaged. Prevent disruption during rituals." },
    { task: "Food & Catering Oversight", owner: "Meena Gupta (Aunt)", backupPerson: "Savita Devi", priority: "HIGH", status: "PENDING", notes: "Monitor caterer. Ensure Bihari special items are served. Manage special dietary needs.", deadline: new Date("2026-11-25") },
    { task: "Photography Coordination", owner: "Rohit Singh (Groom's Friend)", backupPerson: "Vikram Kumar", priority: "HIGH", status: "PENDING", notes: "Be with photographer at all times. Ensure all rituals are captured. Family photo list.", deadline: new Date("2026-11-25") },
    { task: "Ladies Sangeet Coordination", owner: "Sunita Verma (Sister-in-Law)", backupPerson: "Deepa Mehta", priority: "MEDIUM", status: "PENDING", notes: "Plan dance performances. Coordinate with DJ. Ensure ladies have space to perform.", deadline: new Date("2026-11-23") },
    { task: "Baraat Coordination", owner: "Rajesh Kumar (Uncle — Mama)", backupPerson: "Arvind Sharma", priority: "HIGH", status: "PENDING", notes: "Lead the baraat procession. Coordinate with band. Groom's decorated horse/car ready.", deadline: new Date("2026-11-25") },
    { task: "Bride's Side Coordination", owner: "Mohan Verma (Bride's Father)", backupPerson: "Prakash Verma", priority: "CRITICAL", status: "PENDING", notes: "All arrangements on bride's side. Coordinate Kanyadaan, Vidaai. Keep bride calm.", deadline: new Date("2026-11-25") },
    { task: "Medical & Emergency Preparedness", owner: "Dr. Rajesh (Family Doctor)", backupPerson: "Rahul Kumar", priority: "HIGH", status: "PENDING", notes: "First aid kit at venue. Hospital contact list. Emergency contact sheet printed × 20.", deadline: new Date("2026-11-24") },
  ]

  for (const resp of responsibilities) {
    await prisma.responsibility.upsert({
      where: { id: `resp-${slugify(resp.task).substring(0, 40)}` },
      update: {},
      create: { id: `resp-${slugify(resp.task).substring(0, 40)}`, weddingId: wedding.id, ...resp },
    })
  }
  console.log(`✅ ${responsibilities.length} family responsibilities seeded`)

  // ── WhatsApp Templates ─────────────────────────────────────────────────────
  const templates = [
    { name: "Wedding Invitation — Formal", category: "INVITATION", variables: JSON.stringify(["GuestName", "FunctionName", "Date", "Venue"]), message: "🙏 *Vivah Nimantran*\n\nNamaskar {{GuestName}} ji,\n\nHumein yeh sunate hue atyant prasannata ho rahi hai ki hamari parivaar mein shaadi ka shubh avsar aa raha hai.\n\n*{{FunctionName}}*\n📅 {{Date}}\n📍 {{Venue}}\n\nAapka saparivaar swagat hai.\n\n— Suresh Kumar Parivar" },
    { name: "RSVP Confirmation Request", category: "REMINDER", variables: JSON.stringify(["GuestName", "DeadlineDate"]), message: "Namaskar {{GuestName}} ji 🙏\n\nHumne aapko wedding card bheja tha. Kripya apni attendance confirm karein taaki hum proper arrangements kar sakein.\n\n✅ Confirm karne ke liye reply mein *HAAN* likhein\n❌ Nahi aane ke liye *NAHI* likhein\n\nDeadline: {{DeadlineDate}}\n\nDhanyavaad! 🌸" },
    { name: "Travel & Arrival Details", category: "TRAVEL_UPDATE", variables: JSON.stringify(["GuestName", "ArrivalDate", "PickupTime", "CoordinatorName", "CoordinatorPhone"]), message: "Namaskar {{GuestName}} ji 🙏\n\nAapke swagat ki poori taiyari hai!\n\n✈️ *Travel Info*\nArrival: {{ArrivalDate}}\nPickup: {{PickupTime}}\n\n🚗 *Pickup Coordinator*\n{{CoordinatorName}}: {{CoordinatorPhone}}\n\nStation par aate hi call karein. Gaadi ready rahegi.\n\n— Wedding Team" },
    { name: "Hotel Accommodation Confirmation", category: "CONFIRMATION", variables: JSON.stringify(["GuestName", "HotelName", "RoomNumber", "CheckIn", "CheckOut"]), message: "Namaskar {{GuestName}} ji 🙏\n\n*Accommodation Confirmed* 🏨\n\nHotel: {{HotelName}}\nRoom: {{RoomNumber}}\nCheck-in: {{CheckIn}}\nCheck-out: {{CheckOut}}\n\nKoi problem ho to seedha call karein:\nHotel Coordinator: +91-XXXXXXXXXX\n\nWedding Team" },
    { name: "Wedding Day Reminder", category: "REMINDER", variables: JSON.stringify(["GuestName", "FunctionName", "Time", "Venue"]), message: "🎊 *Kal hai shaadi!*\n\nNamaskar {{GuestName}} ji,\n\nKal ka din bohot khaas hai! Aapko yaad dilana chahte hain:\n\n*{{FunctionName}}*\n🕐 {{Time}}\n📍 {{Venue}}\n\nSamay par pahuchen. Aapka intzaar rahega! 🌹\n\n— Vivah Team" },
    { name: "Mehendi Invitation", category: "INVITATION", variables: JSON.stringify(["GuestName", "Date", "Time", "Venue"]), message: "💚 *Mehendi ka Nimantran*\n\nNamaskar {{GuestName}} ji,\n\nAapko sadar nimantran hai:\n\n*Mehendi Ceremony*\n📅 {{Date}}\n🕐 {{Time}}\n📍 {{Venue}}\n\nMehendi lagwana bilkul free hai sabke liye! Sundar rang layein 💚\n\n— Vivah Team" },
    { name: "Sangeet Night Invitation", category: "INVITATION", variables: JSON.stringify(["GuestName", "Date", "Time", "Venue"]), message: "🎵 *Sangeet Night*\n\nNamaskar {{GuestName}} ji,\n\nGaane, naachne aur dhoom machane ka waqt aa gaya!\n\n*Sangeet Night*\n📅 {{Date}}\n🕐 {{Time}}\n📍 {{Venue}}\n\nApni best performance ready rakhein! 🎤💃\n\n— Vivah Team" },
    { name: "Post Wedding Thank You", category: "GENERAL", variables: JSON.stringify(["GuestName"]), message: "🙏 *Heartfelt Thanks*\n\nNamaskar {{GuestName}} ji,\n\nAapka humari wedding mein tashreef lane ke liye bahut bahut dhanyavaad! Aapki uplabdhata ne is pal ko aur khaas bana diya.\n\nAapke pyaar aur aashirwaad ke liye hamesha aaabhari rahenge. 🌸\n\n— Himanshu & Samiksha" },
  ]

  for (const template of templates) {
    await prisma.whatsAppTemplate.upsert({
      where: { id: `wa-${slugify(template.name).substring(0, 40)}` },
      update: {},
      create: { id: `wa-${slugify(template.name).substring(0, 40)}`, weddingId: wedding.id, ...template },
    })
  }
  console.log(`✅ ${templates.length} WhatsApp templates seeded`)

  // ── Invitation Blocks ──────────────────────────────────────────────────────
  const invitationBlocks = [
    { section: "HEADER", title: "Wedding Invitation", primaryText: "🌸 Shubh Vivah 🌸", description: "With great joy and divine blessings, we invite you to celebrate the sacred union of our beloved children", sortOrder: 1 },
    { section: "COUPLE", title: "Himanshu weds Samiksha", primaryText: "Himanshu Rai", description: "Son of Shri Suresh Kumar Rai & Smt. Anita Devi, Patna, Bihar", sortOrder: 2 },
    { section: "FAMILY", title: "Family of the Groom", primaryText: "Sharma Parivar", description: "Shri Suresh Kumar Sharma (Father) | Smt. Anita Devi (Mother)\nGrandparents: Late Shri Ram Narayan Sharma & Smt. Pushpa Devi\nResidence: Rajendra Nagar, Patna, Bihar", sortOrder: 3 },
    { section: "FAMILY", title: "Family of the Bride", primaryText: "Verma Parivar", description: "Shri Mohan Verma (Father) | Smt. Sunita Verma (Mother)\nGrandparents: Shri Prakash Verma & Smt. Kamla Devi\nResidence: Boring Road, Patna, Bihar", sortOrder: 4 },
    { section: "EVENT", title: "Mandap Ceremony & Saat Phere", date: new Date("2026-11-25"), time: "Muhurat: 8:00 PM onwards", primaryText: "PURSHOTTAM PARTY PLOT, Bhayli, Vadodara", description: "Millennium Northway, Be side, Kabir Rd, opp. Navrachna University, Bhayli, Vadodara, Gujarat 391410", sortOrder: 5 },
    { section: "EVENT", title: "Reception Evening", date: new Date("2026-11-26"), time: "6:00 PM – 11:00 PM", primaryText: "PURSHOTTAM PARTY PLOT — Main Lawn", description: "Dinner | DJ | Photography | Couple on Stage", sortOrder: 6 },
    { section: "FOOTER", title: "Contact Us", primaryText: "Wedding Coordination", contact: "Suresh Kumar: +91-XXXXXXXXXX\nRahul Kumar: +91-XXXXXXXXXX\nWedding Helpline: +91-XXXXXXXXXX", description: "For any queries, accommodation bookings, or travel assistance — please reach out to us. We are happy to help!", sortOrder: 7 },
  ]

  for (const block of invitationBlocks) {
    await prisma.invitationBlock.upsert({
      where: { id: `inv-${block.section.toLowerCase()}-${block.sortOrder}` },
      update: {},
      create: { id: `inv-${block.section.toLowerCase()}-${block.sortOrder}`, weddingId: wedding.id, ...block },
    })
  }
  console.log(`✅ ${invitationBlocks.length} invitation blocks seeded`)

  // ── Alerts ─────────────────────────────────────────────────────────────────
  await prisma.alert.upsert({
    where: { id: "alert-budget-overrun" },
    update: {},
    create: { id: "alert-budget-overrun", weddingId: wedding.id, type: "WARNING", title: "Budget Overrun Alert", message: "One or more budget categories have exceeded planned amounts. Review Finance section.", active: true, threshold: 90 },
  })
  await prisma.alert.upsert({
    where: { id: "alert-rsvp-pending" },
    update: {},
    create: { id: "alert-rsvp-pending", weddingId: wedding.id, type: "INFO", title: "RSVP Confirmations Pending", message: "Several guests have not confirmed attendance. Send RSVP reminder via WhatsApp.", active: true },
  })
  await prisma.alert.upsert({
    where: { id: "alert-vendor-payment" },
    update: {},
    create: { id: "alert-vendor-payment", weddingId: wedding.id, type: "WARNING", title: "Vendor Advance Payments Due", message: "Photography and catering vendors have advance payment deadlines approaching.", active: true },
  })
  console.log("✅ 3 default alerts seeded")

  console.log("\n🎊 Database seeded successfully!")
  console.log(`\n💡 Next steps:`)
  console.log(`   1. Copy WEDDING_ID="${wedding.id}" to your .env.local`)
  console.log(`   2. npm run dev`)
  console.log(`   3. Open http://localhost:3000`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("Seed error:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
