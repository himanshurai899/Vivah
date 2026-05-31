# Vivah — Development Phases Tracker

> Last updated: 2026-05-31 | Active branch: `feature/code-gen-claude`

---

## Overview

| Phase | Description | Stack | Status |
|-------|-------------|-------|--------|
| Phase 1 | Core foundation (Dashboard, Guests, Vendors, Finance, Functions, Tasks) | Vanilla JS | ✅ Complete |
| Phase 2 | Operations (Accommodation, Travel, Rituals, Responsibilities, Invitation) | Vanilla JS | ✅ Complete |
| Phase 3 | Execution (Reports, Command Center, Alerts, Check-In, WhatsApp) | Vanilla JS | 🔄 40% Complete |
| Phase 4 | Auth + AI + Analytics + PWA | Vanilla JS → Next.js | 📋 Planned (merged into Phase 5) |
| Phase 5 | Full Next.js 15 + TypeScript + PostgreSQL migration (TDD-first) | Next.js 15 | 🔄 In Progress |
| Phase 6 | Multi-tenant SaaS platform for wedding organizers | Next.js 15 + RLS | 🏗️ Architecture |

---

## Phase 5 — Next.js Migration (Active)

### Infrastructure ✅ Complete
- [x] Next.js 15 App Router setup with TypeScript strict mode
- [x] Tailwind CSS 4 + shadcn/ui design system
- [x] Cormorant Garamond + DM Sans font pair (Agni-Jal Editorial)
- [x] CSS design tokens (`--ink`, `--purple`, `--gold`, `--ivory`)
- [x] Prisma schema — all 14 entities modelled
- [x] SQLite (dev) / PostgreSQL (prod) dual config
- [x] Database seed script with full sample data
- [x] Root layout with Navbar, footer, toast provider, navigation progress
- [x] API routes for all entities (CRUD)
- [x] Shared UI components (Button, Badge, Modal, Input, Select, ConfirmDialog, Spinner, Toast)
- [x] Utility libraries (currency INR, date helpers, cn, api client)
- [x] Hooks (useCrud, useDelete, useToast)
- [x] Zod schemas (guest, vendor)

### Core Pages ✅ Complete
- [x] Dashboard — countdown, budget stats, guest stats, vendor stats, charts
- [x] Guests — full CRUD, filters (side/RSVP/city), guest count, accommodation/pickup flags
- [x] Vendors — full CRUD, payment tracking, status management
- [x] Functions/Events — full CRUD, Bihari wedding rituals timeline
- [x] Tasks — Kanban board (Pending/In Progress/Completed/Blocked)
- [x] Finance — budget categories + expense ledger, overrun detection, INR formatting
- [x] Accommodation — hotel CRUD, room allocation grid
- [x] Travel — arrival tracking, pickup coordination, transport types
- [x] Rituals — 9 Bihari rituals with samagri tracking
- [x] Responsibilities — family responsibility matrix with owner/backup
- [x] Invitation — invitation block builder (5 section types)
- [x] Alerts — alert feed with read/unread, type badges
- [x] Check-In — event-based check-in tracking
- [x] WhatsApp Templates — template CRUD, category management
- [x] Reports — summary stats and charts
- [x] Command Center — operations dashboard
- [x] Settings — wedding configuration
- [x] Gallery — photo management scaffold
- [x] Emergency — emergency contacts

### Zod Schemas ✅ Complete (Sprint 5.1)
- [x] `guest.schema.ts` — GuestSchema, GuestSide, RsvpStatus
- [x] `vendor.schema.ts` — VendorSchema, VendorCategory, VendorStatus
- [x] `event.schema.ts` — EventSchema, EventType, EventStatus *(new)*
- [x] `task.schema.ts` — TaskSchema, TaskPriority, TaskStatus *(new)*
- [x] `expense.schema.ts` — ExpenseSchema, PaymentMode *(new)*

### Phase 3 Features Shipped (Sprint 5.1)
- [x] QR check-in — QR code generation per guest, print single label, Print All QRs batch view
- [x] WhatsApp batch send — variable substitution, per-guest send, filter by side/RSVP, sent tracking
- [x] Reports PDF export — Budget PDF, Guest List PDF (landscape), Vendor Payment PDF; CSV export
- [x] Reports tabs — Budget / Guests / Vendors with advanced filters and full data tables
- [x] Emergency contacts — full DB-backed CRUD with categories, edit/delete, Load Defaults seeder
- [x] Settings — already complete (wedding config save to DB, seed, wipe)

### Phase 4 Features Shipped (Sprint 5.1)
- [x] NextAuth.js v5 — credentials provider, JWT session, role (PLANNER/VIEWER/ADMIN)
- [x] Login page — `/login` with Agni-Jal design, callbackUrl redirect
- [x] Auth middleware — route protection, public paths: `/login`, `/api/auth`
- [x] User registration API — `/api/auth/register` with ADMIN_SECRET gate
- [x] PWA — `@ducanh2912/next-pwa`, `manifest.json`, shortcuts (Dashboard, Guests, Vendors, Check-In)

### Testing ⚠️ Partial (Sprint 5.1 delivered schemas; component + API tests pending)
- [x] Unit: `currency.test.ts` — formatINR utility
- [x] Unit: `date.test.ts` — daysUntil, formatDate
- [x] Unit: `guest.test.ts` — Zod schema validation
- [ ] Unit: Component tests (Button, Badge, Modal, Input, Select)
- [ ] Unit: Vendor schema validation
- [ ] Integration: Guest API route tests
- [ ] Integration: Vendor API route tests
- [ ] Integration: Finance API route tests
- [ ] Integration: All remaining API route tests
- [ ] E2E: Guest management flow (Playwright)
- [ ] E2E: Vendor management flow
- [ ] E2E: Finance management flow
- [ ] E2E: Dashboard rendering

### Phase 5 Remaining — Feature Gaps
- [ ] QR code generation for guest check-in (Phase 3 carryover)
- [ ] WhatsApp click-to-send links with variable substitution
- [ ] Reports PDF/Excel export
- [ ] Advanced report filters (family-wise, RSVP breakdown, city breakdown)
- [ ] Command Center live refresh / real-time mode
- [ ] Gallery — photo upload with Cloudinary/Vercel Blob
- [ ] Settings — theme toggle, export/import backup
- [ ] Emergency contacts — full CRUD (currently static)
- [ ] Authentication (NextAuth.js v5) — multi-user collaboration
- [ ] Zod schemas for all remaining entities (events, tasks, finance, rituals, etc.)

---

## Phase 3 — Vanilla JS Remaining (Deferred to Phase 5)

The following Phase 3 Vanilla JS features are deferred; they will be implemented directly in Next.js (Phase 5) with full TDD coverage:

| Feature | Vanilla JS % | Next.js Status |
|---------|-------------|----------------|
| Reports Enhancement | 60% | Scaffold exists, export missing |
| Wedding Day Command Center | 30% | Scaffold exists, live data missing |
| Alerts Enhancement | 50% | Basic list exists, thresholds missing |
| QR Check-In | 20% | Data model exists, QR generation missing |
| WhatsApp Integration | 30% | Templates CRUD done, send links missing |
| Gallery Module | 0% | Stub page exists, upload missing |
| Settings Module | 0% | Stub page exists, config save missing |
| Emergency Module | 0% | Page exists, CRUD missing |

---

## Sprint Planning — Phase 5 Next Sprint

**Goal**: Achieve TDD compliance (≥ 80% test coverage) + complete Phase 3 carryover features.

### Sprint 5.1 — Test Foundation (Current Priority)
1. `/ssdt` — Write failing tests for all existing API routes (guests, vendors, finance)
2. `/ssdt` — Write failing E2E tests for 3 critical user flows
3. `/ssde` — Fix any regressions surfaced by tests
4. `/ssde` — Add Zod validation to all remaining API routes

### Sprint 5.2 — QR Check-In & WhatsApp
1. `/ba` — Acceptance criteria for QR check-in flow
2. `/system-architect` — QR code data structure and generation approach
3. `/ssdt` — Failing tests for QR generation and check-in workflow
4. `/ssde` — QR check-in implementation
5. `/ssde` — WhatsApp click-to-send with variable substitution

### Sprint 5.3 — Reports & Export
1. `/ba` — Acceptance criteria for PDF/Excel export
2. `/ssdt` — Failing tests for report generation
3. `/ssde` — PDF export (react-pdf or server-side)
4. `/ssde` — Excel export (xlsx library)

### Sprint 5.4 — Authentication
1. `/system-architect` — NextAuth.js v5 RBAC design
2. `/ssdt` — Auth flow tests
3. `/ssde` — NextAuth integration, login/logout, role-based route guards

---

## Phase 6 — SaaS Platform (Planned)

Architecture and scope documented in [Application Creation Prompt.md](./Application%20Creation%20Prompt.md#platform-vision-phase-6).

Key additions: Row-Level Security (RLS), Stripe billing, multi-tenant data isolation, React Native mobile app.
