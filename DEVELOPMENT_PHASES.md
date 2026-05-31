# Vivah — Development Phases Tracker

> Last updated: 2026-05-31 (17:45 UTC) | Active branch: `feature/code-gen-claude` | Sprint: 5.2 (UI Enhancements & Deployment Planning)

---

## Overview

| Phase | Description | Stack | Status | Completion |
|-------|-------------|-------|--------|------------|
| Phase 1 | Core foundation (Dashboard, Guests, Vendors, Finance, Functions, Tasks) | Vanilla JS | ✅ Complete | 100% |
| Phase 2 | Operations (Accommodation, Travel, Rituals, Responsibilities, Invitation) | Vanilla JS | ✅ Complete | 100% |
| Phase 3 | Execution (Reports, Command Center, Alerts, Check-In, WhatsApp) | Vanilla JS | 🔄 Migrating | 40% (Next.js) |
| Phase 4 | Auth + PWA + Analytics | Vanilla JS → Next.js | ✅ Complete | 100% |
| Phase 5 | Full Next.js 15 + TypeScript + PostgreSQL migration (TDD-first) | Next.js 15 | 🔄 In Progress | 75% |
| Phase 5.2 | UI Enhancements + Deployment Planning | Next.js 15 | 🔄 In Progress | 50% |
| Phase 6 | Multi-tenant SaaS platform for wedding organizers | Next.js 15 + RLS | 🏗️ Planning | 5% |

---

## Phase 5 — Next.js Migration (Active)

### Infrastructure ✅ Complete
- [x] Next.js 15 App Router setup with TypeScript strict mode
- [x] Tailwind CSS 4 + shadcn/ui design system
- [x] Cormorant Garamond + DM Sans font pair (Agni-Jal Editorial)
- [x] CSS design tokens (`--ink`, `--purple`, `--gold`, `--ivory`)
- [x] **Dark mode support** with theme toggle (added May 31)
- [x] Prisma schema — all 14 entities modelled
- [x] SQLite (dev) / PostgreSQL (prod) dual config
- [x] Database seed script with full sample data
- [x] Root layout with Navbar, footer, toast provider, navigation progress
- [x] API routes for all entities (CRUD)
- [x] Shared UI components (Button, Badge, Modal, Input, Select, ConfirmDialog, Spinner, Toast)
- [x] Utility libraries (currency INR, date helpers, cn, api client)
- [x] Hooks (useCrud, useDelete, useToast)
- [x] Zod schemas (guest, vendor, event, task, expense)

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

### Phase 5 Remaining — Priority Feature Gaps (Ranked by Revenue + Wedding Date)

| Feature | Priority | Status | Sprint | Target | Why |
|---------|----------|--------|--------|--------|-----|
| **Google Contacts import** | 🔴 Critical | Planning | 5.2 | Jun 15 | Phase 6 differentiator; couple retention |
| **Task delegation** (family/team) | 🔴 Critical | Planning | 5.2 | Jun 20 | Nov 25 retention + planner mode foundation |
| **Playbook save/clone** | 🔴 Critical | Planning | 5.2–5.3 | Jul 15 | Enables couple→planner graduation path |
| QR code generation (check-in) | 🔴 Critical | Scaffold exists | 5.3 | Jun 30 | Phase 3 carryover; Nov 25 critical |
| WhatsApp variable substitution | 🔴 Critical | Template CRUD done | 5.3 | Jun 30 | Phase 3 carryover; Nov 25 critical |
| **Planner mode toggle** | 🟠 High | Planning | 5.3 | Jul 31 | Revenue unlock (invoicing + team mgmt) |
| Reports PDF/Excel export | 🟠 High | Scaffold exists | 5.4 | Jul 15 | Couple + planner reporting |
| Unit + E2E tests (≥80% coverage) | 🟠 High | Partial | 5.2–5.4 | Jul 31 | Quality gate for staging |
| Staging deployment + UAT | 🟠 High | Planned | 5.5 | Aug 31 | Pre-Nov 25 validation |
| Advanced report filters | 🟡 Medium | Planned | 5.4 | Jul 31 | Planner reporting nicety |
| Gallery — photo upload | 🟡 Medium | Stub only | 5.6+ | Sep 15 | Post-wedding value-add |
| Command Center live refresh | 🟡 Medium | Scaffold only | 5.6+ | Sep 15 | Wedding day ops (deferred) |
| Settings — theme/backup | 🟡 Medium | Partial | 5.5 | Aug 31 | Data portability for SaaS |
| Emergency contacts CRUD | 🟡 Medium | Page exists | 5.2 | Jun 30 | Wedding day safety net |

### DevOps & Infrastructure (Phase 5.2 — Ongoing) 📋 Planned

**Owner**: `/devops` agent  
**Status**: Planning phase (DEPLOYMENT.md + DEPLOYMENT_PLAN.md created)

**Key Deliverables**:
- [ ] **Phase 1 — Preparation** (Jun 1–30)
  - [ ] Neon PostgreSQL prod setup
  - [ ] Vercel project + auto-deploy from GitHub
  - [ ] Environment variables & secrets management
  - [ ] Schema validation for production
  - [ ] GitHub Actions CI/CD pipeline
  - [ ] Backup & recovery runbooks

- [ ] **Phase 2 — Staging** (Jul 1–Aug 31)
  - [ ] Staging deployment with preview builds
  - [ ] Load testing (50 concurrent users)
  - [ ] User acceptance testing (UAT sign-off)
  - [ ] Security audit (OWASP Top 10)
  - [ ] Disaster recovery drill

- [ ] **Phase 3 — Production** (Sep 1–Nov 25)
  - [ ] Production deployment to https://vivah.vercel.app
  - [ ] Monitoring (Vercel Analytics + Sentry)
  - [ ] Wedding day operations (Nov 25–26, 24/7 on-call)
  - [ ] Post-mortem + Phase 6 learnings

**Estimated Effort**: 120 hours across 5 months  
**Budget**: Free tier (Vercel + Neon) = ₹0–500/mo

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

## Sprint Planning — Phase 5 Active Sprint

**Current Sprint: 5.2 — UI Enhancements & Deployment Planning**  
**Status**: In Progress  
**Target Completion**: 2026-06-15

### ✅ Completed (Sprint 5.1–5.2)
- [x] Dark mode support + Tailwind dark mode config
- [x] Slug generation refactored with slugify function
- [x] Page UI updates: Dashboard, Guests, Rituals, Layout refinements
- [x] Modal component accessibility improvements
- [x] Zod schemas for all core entities (guest, vendor, event, task, expense)
- [x] All API routes (CRUD) for Phases 1–3 complete
- [x] NextAuth.js v5 — credentials provider, JWT, role-based access
- [x] PWA manifest and shortcuts configured

### 🔄 In Progress (Sprint 5.2)
- [ ] **Deployment Planning** — DEPLOYMENT.md + DEPLOYMENT_PLAN.md created (ready for `/devops` review)
  - Infrastructure: Vercel + Neon PostgreSQL (free tier strategy)
  - CI/CD: GitHub Actions pipeline setup
  - Monitoring: Vercel Analytics + Sentry integration
  - Phase timeline: Prep (Jun 1–30), Staging (Jul 1–Aug 31), Go-live (Sep 1)
- [x] **Playbook System — BA Complete** (NEW — Phase 6 revenue differentiator) 🚀
  - ✅ [PLAYBOOK_SYSTEM_MVP.md](PLAYBOOK_SYSTEM_MVP.md) — Full spec with 4 user stories + Gherkin scenarios
  - 🔄 System Architect: Schema design + API routes (next)
  - 🔄 SSDT: Failing tests
  - 🔄 SSDE: Implementation
  - Sprint 5.2 Phase 1: Google Contacts import + Task delegation + Save as template
  - Sprint 5.3 Phase 2: Playbook browser + Planner mode + Customization
  - Phase 6: Marketplace + Planner profiles + Commission system
  - **Rationale**: Turns couples into planners, creates network effects, 15–20% commission revenue
- [ ] Test coverage — Unit + E2E tests for critical paths
- [ ] QR code check-in generation
- [ ] WhatsApp template variable substitution

### 📋 Upcoming (Sprint 5.3–5.4)
1. **Sprint 5.3 — QR Check-In & WhatsApp** (Jun 16–30)
   - `/ssdt` — QR generation + check-in workflow tests
   - `/ssde` — QR endpoint + template variable substitution
   
2. **Sprint 5.4 — Reports & Export** (Jul 1–15)
   - `/ssdt` — Report generation tests
   - `/ssde` — PDF/Excel export implementation

3. **Sprint 5.5 — Staging & UAT** (Jul 16–Aug 31)
   - `/devops` — Deploy to staging environment
   - `/ba` + `/cse` — User acceptance testing
   - Load testing & security audit

4. **Sprint 5.6 — Production Launch** (Sep 1 onwards)
   - `/devops` — Production deployment
   - 24/7 monitoring & on-call setup
   - Wedding day operations (Nov 25–26)

---

## Phase 6 — SaaS Platform (Planned)

Architecture and scope documented in [Application Creation Prompt.md](./Application%20Creation%20Prompt.md#platform-vision-phase-6).

Key additions: Row-Level Security (RLS), Stripe billing, multi-tenant data isolation, React Native mobile app.
