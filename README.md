# Vivah — Wedding Planning Platform

> **One platform to plan the entire wedding journey.**
> Himanshu & Savitri · 25 November 2026 · Vadodara, Gujarat · Traditional Bihari Wedding

---

## Overview

Vivah is a full-featured wedding planning web application covering every aspect of a large Indian wedding — guests, vendors, finance, rituals, accommodation, travel, invitations, and wedding-day command center — in a single, fast, mobile-first platform.

**Design direction:** Agni-Jal Editorial — Cormorant Garamond + DM Sans, 4-token color system, mobile bottom navigation, GPU-composited micro-interactions. Built to the [Metics Media $10K Checklist](https://metics.media).

---

## Tech Stack

| Layer | Technology |
| ----- | ---------- |
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 strict |
| UI | React 19 + Tailwind CSS 3 |
| Fonts | Cormorant Garamond (display) + DM Sans (body) |
| Icons | Lucide React |
| Charts | Recharts |
| ORM | Prisma 5 |
| DB (local) | SQLite — zero setup |
| DB (prod) | PostgreSQL 16 |
| Validation | Zod |
| Testing | Vitest + Playwright |
| Container | Docker + Docker Compose |

---

## Modules

| Module | Route | Status |
| ------ | ----- | ------ |
| Dashboard | `/dashboard` | Phase 1 ✅ |
| Wedding Functions | `/functions` | Phase 1 ✅ |
| Guest Management | `/guests` | Phase 1 ✅ |
| Vendor Management | `/vendors` | Phase 1 ✅ |
| Finance & Budget | `/finance` | Phase 1 ✅ |
| Task Kanban | `/tasks` | Phase 1 ✅ |
| Accommodation | `/accommodation` | Phase 2 ✅ |
| Travel Management | `/travel` | Phase 2 ✅ |
| Ritual Planner | `/rituals` | Phase 2 ✅ |
| Family Responsibilities | `/responsibilities` | Phase 2 ✅ |
| Invitation Builder | `/invitation` | Phase 2 ✅ |
| Reports & Analytics | `/reports` | Phase 3 ✅ |
| Command Center | `/command-center` | Phase 3 ✅ |
| Alerts System | `/alerts` | Phase 3 ✅ |
| Guest Check-In | `/checkin` | Phase 3 ✅ |
| WhatsApp Templates | `/whatsapp` | Phase 3 ✅ |
| Emergency Contacts | `/emergency` | Phase 3 ✅ |
| Gallery | `/gallery` | Phase 3 🔄 |
| Settings | `/settings` | Phase 3 ✅ |

---

## Prerequisites

| Tool | Version | Notes |
| ---- | ------- | ----- |
| Node.js | ≥ 20 LTS | [nodejs.org](https://nodejs.org) |
| npm | ≥ 10 | Bundled with Node.js |
| Docker | ≥ 24 | [docker.com](https://docker.com) — optional, for Postgres setup |
| Docker Compose | ≥ 2.20 | Bundled with Docker Desktop |

---

## Quick Start — Local SQLite (zero setup)

```bash
# 1. Clone and install
git clone <repo-url> vivah
cd vivah
npm install --legacy-peer-deps

# 2. Configure environment
cp .env.example .env.local
# .env.local already defaults to SQLite + WEDDING_ID="vivah-2026"

# 3. Create the database schema
DATABASE_URL="file:./dev.db" npx prisma db push

# 4. Seed all default data (rituals, vendors, budget, functions, tasks...)
DATABASE_URL="file:./dev.db" npx tsx prisma/seed.ts

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the dashboard loads with all pre-seeded data.

---

## Environment Variables

Copy `.env.example` to `.env.local` and edit:

```env
# Database — SQLite (no server needed, default for local dev):
DATABASE_URL="file:./dev.db"

# Database — PostgreSQL (Docker Compose or production):
# DATABASE_URL="postgresql://vivah:vivah@localhost:5432/vivah"

# Wedding record ID — printed by the seed script
WEDDING_ID="vivah-2026"

# Production secrets (not needed for local dev):
# NEXTAUTH_SECRET="run: openssl rand -base64 32"
# NEXTAUTH_URL="https://your-domain.com"
# SENTRY_DSN=""
# CLOUDINARY_CLOUD_NAME=""
# CLOUDINARY_API_KEY=""
# CLOUDINARY_API_SECRET=""
```

---

## Scripts

### Development

```bash
npm run dev          # Start Next.js dev server — http://localhost:3000
npm run build        # Production build (outputs to .next/)
npm run start        # Start production server (requires build first)
```

### Code Quality

```bash
npm run lint         # ESLint — check for issues
npm run type-check   # TypeScript type check (no emitted files)
```

### Testing

```bash
npm test                  # Run all Vitest tests once
npm run test:watch        # Watch mode — re-runs on file change
npm run test:coverage     # Tests + coverage report (target ≥ 80%)
npm run test:e2e          # Playwright end-to-end tests
```

Coverage report is written to `coverage/` — open `coverage/index.html` in a browser.

### Database

```bash
# Push schema to database (development — no migration file created)
npm run db:push

# Seed all default wedding data
npm run db:seed

# Open Prisma Studio GUI on http://localhost:5555
npm run db:studio

# Hard reset — drops all data and re-seeds (destructive!)
npm run db:reset
```

#### Direct Prisma commands

```bash
# Apply pending migrations (CI / production PostgreSQL)
npx prisma migrate deploy

# Create a new migration after changing schema.prisma
npx prisma migrate dev --name add_gallery_table

# Check migration status
npx prisma migrate status

# Re-generate Prisma Client after schema changes
npx prisma generate
```

---

## Docker

### Option A — SQLite in Docker (simplest)

Single container, SQLite database persisted in a named volume.

```bash
# Build the image
docker build -t vivah:latest .

# Run
docker run -p 3000:3000 \
  -e DATABASE_URL="file:./prisma/dev.db" \
  -e WEDDING_ID="vivah-2026" \
  -e NODE_ENV="production" \
  -v vivah-db:/app/prisma \
  vivah:latest

# First run — seed the database
docker exec vivah-app npx tsx prisma/seed.ts
```

### Option B — Full Stack with PostgreSQL (recommended)

Uses Docker Compose: app + PostgreSQL 16 + pgAdmin.

```bash
# Start all services (builds the image on first run)
docker compose up --build

# First-time only — apply migrations and seed
docker compose exec app npx prisma migrate deploy
docker compose exec app npx tsx prisma/seed.ts
```

| URL | Service |
| --- | ------- |
| [http://localhost:3000](http://localhost:3000) | Vivah app |
| [http://localhost:5050](http://localhost:5050) | pgAdmin GUI |
| `localhost:5432` | PostgreSQL (internal) |

pgAdmin login: `admin@vivah.local` / `admin` — the Vivah database is auto-connected.

#### Useful Compose commands

```bash
# View logs
docker compose logs -f app
docker compose logs -f postgres

# Shell into running containers
docker compose exec app sh
docker compose exec postgres psql -U vivah -d vivah

# Restart just the app after a code change
docker compose restart app

# Rebuild from scratch (clears cached layers)
docker compose build --no-cache

# Stop and remove containers (data preserved in volumes)
docker compose down

# Stop and delete all data
docker compose down -v
```

### Switching Database Provider

| Setting | SQLite | PostgreSQL |
| ------- | ------ | ---------- |
| `DATABASE_URL` | `file:./dev.db` | `postgresql://user:pass@host:5432/db` |
| `schema.prisma` provider | `sqlite` | `postgresql` |
| Schema sync | `npx prisma db push` | `npx prisma migrate deploy` |
| Requires Docker | No | Only for local Postgres |

To switch to PostgreSQL, edit `prisma/schema.prisma`:

```diff
datasource db {
-  provider = "sqlite"
+  provider = "postgresql"
   url      = env("DATABASE_URL")
}
```

Then run `npx prisma migrate dev`.

---

## Project Structure

```text
vivah/
├── .claude/
│   ├── settings.json              # Hooks: type-check, TDD guard, plugin reminder
│   └── commands/agents/           # TDD agent persona slash commands
│       ├── orchestrator.md        # /orchestrator — coordinates flow + merge gate
│       ├── ba.md                  # /ba — acceptance criteria + Gherkin
│       ├── system-architect.md    # /system-architect — schema, API, component tree
│       ├── ssde.md                # /ssde — GREEN + REFACTOR phases
│       ├── ssdt.md                # /ssdt — RED phase (failing tests first)
│       ├── pm.md                  # /pm — scope, roadmap, timelines
│       ├── cse.md                 # /cse — UX + $10K checklist validation
│       └── devops.md              # /devops — migrations, deployment, CI/CD
│
├── docker/
│   └── pgadmin-servers.json       # Auto-connects pgAdmin to Postgres
│
├── prisma/
│   ├── schema.prisma              # SQLite (dev) / PostgreSQL (prod)
│   └── seed.ts                    # Full seed: rituals, vendors, functions, tasks
│
├── src/
│   ├── app/                       # Next.js App Router pages + API routes
│   │   ├── layout.tsx             # Root layout — fonts, metadata, skip nav
│   │   ├── globals.css            # Design tokens, typography, animations
│   │   ├── dashboard/             # Live stats, charts, countdown
│   │   ├── guests/                # Full CRUD with CSV export
│   │   ├── vendors/               # 20 Vadodara vendors pre-loaded
│   │   ├── finance/               # Budget categories + expense ledger
│   │   ├── tasks/                 # Kanban board (Pending/In Progress/Done/Blocked)
│   │   ├── functions/             # 17 wedding functions grouped by type
│   │   ├── accommodation/         # 4 hotels, room allocation tracking
│   │   ├── travel/                # Pickup coordination, transport types
│   │   ├── rituals/               # 9 Bihari rituals with full samagri lists
│   │   ├── responsibilities/      # Family responsibility matrix
│   │   ├── invitation/            # Sectioned invitation builder + preview
│   │   ├── reports/               # Charts, budget breakdown, city distribution
│   │   ├── command-center/        # Live wedding-day ops dashboard
│   │   ├── alerts/                # Alert system with read/dismiss
│   │   ├── checkin/               # Event check-in with progress tracker
│   │   ├── whatsapp/              # Template library with variable substitution
│   │   ├── emergency/             # Vadodara emergency contacts
│   │   ├── settings/              # Wedding details editor + re-seed
│   │   └── api/                   # REST handlers for all modules
│   │
│   ├── components/
│   │   ├── layout/Navbar.tsx      # Desktop dropdown nav + mobile bottom nav
│   │   └── ui/                    # Button, Input, Select, Badge, Modal, Spinner
│   │
│   └── lib/
│       ├── api.ts                 # ok(), err(), serverErr() helpers
│       ├── constants.ts           # WEDDING_ID, category labels, enums
│       ├── db/prisma.ts           # Prisma singleton
│       ├── utils/currency.ts      # formatINR, parseINR, calcOverrunPct
│       ├── utils/date.ts          # daysUntil, formatDate, isOverdue
│       ├── utils/cn.ts            # Tailwind class merge
│       └── validations/           # Zod schemas (guest, vendor, finance...)
│
├── __tests__/unit/                # Vitest unit tests (27 tests, all passing)
├── Dockerfile                     # Multi-stage production image
├── docker-compose.yml             # App + PostgreSQL + pgAdmin
├── .dockerignore
├── .env.example                   # Template — copy to .env.local
├── CLAUDE.md                      # Claude Code context + $10K design standards
├── next.config.ts                 # output: "standalone" for Docker
├── tailwind.config.ts             # Design tokens mapped to CSS variables
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

---

## Seed Data

Running `npm run db:seed` loads the following defaults:

**Wedding Functions (17)** — pre-wedding through post-wedding:
Tilak, Sagai, Haldi, Mehendi, Sangeet, Matkor, Baraat, Jaimala, Mandap Ceremony, Kanyadaan, Saat Phere, Sindoor Daan, Vidaai, Griha Pravesh, Reception, Satyanarayan Katha, Family Lunch

**Bihari Rituals (9)** — with full samagri (items) lists in Hindi and English:
Tilak, Matkor (Mitti Puja), Haldi, Jaimala, Kanyadaan, Saat Phere, Sindoor Daan, Vidaai, Griha Pravesh

**Vendors (20)** — sourced from Vadodara web search:

- Photographers: VMR Photography ₹30K/day, The Wedding Scenario ₹35K/day, Keyur Soni ₹40K/day
- Caterers: Rajpurohit ₹110/plate, Munch ₹175/plate, Desai ₹400/plate
- Decorators: H.R. Creation ₹80K, AK Creation ₹80K, Folk Finds ₹2L
- Event Planners: The Shaadi Planners, Celibraze Events, Sattva Weddings
- Plus: Priest (booked ✅), DJ, Band, Mehendi, Makeup, Flowers, Tent, Transport

**Budget Categories (14)** — ₹1.1 Cr total planned
**Hotels (4)** — 145 rooms total across Banyan Paradise, Fortune Inn, Lords Inn, Surya
**Tasks (20)**, **Family Responsibilities (12)**, **WhatsApp Templates (8)**, **Alerts (3)**

---

## Development Methodology

All features follow strict **TDD with agent orchestration**:

```text
/orchestrator <feature description>
  └── /ba             → acceptance criteria (Given/When/Then)
      └── /system-architect → schema + API contract + component tree
          └── /ssdt   → failing tests — RED phase
              └── /ssde → implementation — GREEN + REFACTOR
                  └── /cse → UX + $10K checklist (all 8 criteria)
                      └── /orchestrator → merge gate approval
```

The orchestrator's merge gate blocks any PR that fails TypeScript, coverage < 80%, or any of the 8 $10K checklist criteria.

---

## Testing

```bash
npm test                  # All tests once
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
```

Current suite (27 tests, all passing):

- `currency.test.ts` — `formatINR`, `parseINR`, `calcOverrunPct` (11 tests)
- `date.test.ts` — `daysUntil`, `formatDate`, `isOverdue` (7 tests)
- `guest.test.ts` — Zod schema validation, enum values (9 tests)

---

## Roadmap

| Phase | Status | Scope |
| ----- | ------ | ----- |
| Phase 1 | ✅ Complete | Dashboard, Guests, Vendors, Finance, Tasks, Functions |
| Phase 2 | ✅ Complete | Accommodation, Travel, Rituals, Responsibilities, Invitation |
| Phase 3 | ✅ Complete | Reports, Command Center, Alerts, Check-In, WhatsApp |
| Phase 4 | 📋 Planned | Authentication, multi-user collaboration, AI assistant |
| Phase 5 | 🔄 Active | Next.js 15 migration (this branch) |
| Phase 6 | 🌐 Future | Multi-tenant SaaS — open to all Indian wedding organizers |

---

## Deployment

### Vercel (recommended for Next.js)

```bash
npm i -g vercel
vercel
```

Set these environment variables in the Vercel dashboard:

- `DATABASE_URL` — Neon or Supabase PostgreSQL connection string
- `WEDDING_ID` — `vivah-2026`

### Docker to VPS / Cloud

```bash
# Build and tag
docker build -t vivah:latest .
docker tag vivah:latest ghcr.io/your-org/vivah:latest
docker push ghcr.io/your-org/vivah:latest

# On the server — start with PostgreSQL
docker compose up -d
docker compose exec app npx prisma migrate deploy
docker compose exec app npx tsx prisma/seed.ts
```

---

## License

Private — personal wedding planning project for Himanshu & Savitri, 25 November 2026, Vadodara.
Phase 6 will open as a SaaS platform for professional Indian wedding organizers.
