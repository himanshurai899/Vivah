# Application Creation Prompt

## Role

Act as a combination of:

* Senior Wedding Planner with 15+ years of experience managing large Indian weddings.
* Senior Full-Stack Software Architect (React / Next.js / PostgreSQL).
* Senior UI/UX Designer.
* Event Operations Manager.
* Budget & Finance Planner.
* Local Wedding Consultant with deep knowledge of Vadodara, Gujarat, India, including wedding venues, transportation logistics, hotels, caterers, decorators, photographers, and local vendor ecosystems.

---

# Project Name

**Vivah**

### Tagline

**One Platform to Plan the Entire Wedding Journey**

---

# PROJECT STATUS (As of May 31, 2026)

## Current Completion: Phase 2 Complete | Phase 3 In Progress (40%)

### Phase 1 ✅ COMPLETED
- **Status**: Production ready (Vanilla JS build)
- **Deliverables**: Core foundation with dashboard, guest management, vendor management, finance tracking, functions/events, tasks Kanban, and full CRUD operations.

### Phase 2 ✅ COMPLETED
- **Status**: Production ready (Vanilla JS build)
- **Deliverables**: Accommodation planner, travel management, ritual planner, family responsibility matrix, invitation builder, and top navigation UI overhaul.

### Phase 3 🔄 IN PROGRESS (40% Complete)
- **Status**: Reports and command center scaffolding built; alerts and check-in systems foundation set.
- **Completed**: Reports module summary view, command center overview, alerts and check-in data structures.
- **Remaining**: Advanced features like wedding-day live tracking, QR check-in workflow, WhatsApp integration, and reporting exports.

### Phase 4 📋 PLANNED
- **Status**: Not started
- **Planned**: User authentication, multi-user collaboration, AI wedding assistant, forecasting & analytics, PWA support.

### Phase 5 🚀 TECH MIGRATION PLANNED
- **Status**: Not started — supersedes Phases 1–4 deliverables
- **Planned**: Full rewrite to **React 19 + Next.js 15 (App Router) + TypeScript + PostgreSQL + Prisma ORM**.
- All existing features to be migrated and enhanced with the new stack.
- TDD-first approach orchestrated by the multi-agent system (see Agent Orchestration section).

### Phase 6 🌐 WEDDING ORGANIZER PLATFORM (Future SaaS)
- **Status**: Architectural design phase
- **Planned**: Open registration for wedding organizers to use Vivah as an E2E platform for managing any wedding (not just the founder's wedding). Multi-tenant SaaS model.
- See [Platform Vision](#platform-vision-phase-6) section for details.

---

# Background

A wedding is planned for **25 November 2026** in **Vadodara, Gujarat, India**.

The wedding follows **Traditional Bihari Wedding Customs**.

Guests will be arriving from:

* Bihar
* Gujarat
* Maharashtra
* Delhi NCR
* Other Indian cities

The system must help plan and manage the wedding end-to-end, including:

* Budgeting
* Guest management
* Travel management
* Accommodation management
* Vendor management
* Function planning
* Task tracking
* Family coordination
* Logistics
* Documentation
* Emergency contacts

The solution must be designed as a scalable web application and not merely a collection of static pages.

---

# Objective

Build a complete wedding planning platform called **Vivah** that enables the groom's family and bride's family to collaboratively manage every aspect of the wedding.

The application should act as a centralized source of truth for:

* Wedding finances
* Guest information
* Accommodation
* Vendor contracts
* Event schedules
* Family responsibilities
* Travel logistics
* Ritual planning
* Wedding checklist management

---

# TECHNOLOGY STACK (Target — Phase 5 Migration)

## Frontend
- **Framework**: React 19 with Next.js 15 (App Router)
- **Language**: TypeScript 5.x (strict mode)
- **Styling**: Tailwind CSS 4.x + shadcn/ui component library
- **State Management**: Zustand (global) + React Query / TanStack Query (server state)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts or Tremor
- **Icons**: Lucide React

## Backend (Next.js API Routes / Server Actions)
- **Runtime**: Node.js via Next.js Server Actions and Route Handlers
- **ORM**: Prisma 6.x
- **Database**: PostgreSQL 16
- **Auth**: NextAuth.js v5 (Auth.js) with role-based access control
- **Validation**: Zod (shared between client and server)
- **File Storage**: Cloudinary or Vercel Blob (for gallery, documents)

## Infrastructure
- **Hosting**: Vercel (frontend + API routes)
- **Database**: Neon or Supabase (serverless PostgreSQL)
- **CI/CD**: GitHub Actions with TDD enforcement hooks
- **Monitoring**: Sentry

## Testing Stack (TDD — mandatory)
- **Unit Tests**: Vitest + React Testing Library
- **Integration Tests**: Vitest + Prisma mock / test DB
- **E2E Tests**: Playwright
- **Coverage**: Istanbul (target ≥ 80% coverage)
- **TDD Workflow**: Red → Green → Refactor enforced by pre-commit hooks

---

# BRAND & LOGO

## Visual Identity

The Vivah brand is inspired by the union of **fire (Agni) and water (Jal)** — two opposing yet complementary forces central to every Indian wedding ceremony.

### Logo Concept
- **Shape**: A stylized monogram or icon combining a flame (fire) silhouette with a flowing water droplet shape — united as one form
- **Color Palette**:
  - **Primary**: Deep Purple (`#6B21A8` / `#7C3AED`) — royalty, spirituality, transformation
  - **Accent**: Pure White (`#FFFFFF`) — purity, clarity
  - **Shadow / Depth**: Rich Black (`#0A0A0A`) with subtle drop shadows — strength, elegance
  - **Gradient hint**: Purple-to-indigo for digital glow effect
- **Style**: Modern, minimal, high-contrast; suitable for dark and light backgrounds
- **Usage**: SVG primary logo + favicon variants (16, 32, 180, 512 px)

### Design Principles
- Fire represented as upward-pointing triangular flame in purple
- Water represented as soft, downward-flowing curve in white/translucent
- Combined into a single icon where both coexist (Yin-Yang inspired structure)
- "Vivah" wordmark in clean serif or geometric sans-serif alongside the icon
- Drop shadow uses black at 20% opacity to give depth without heaviness

---

# ARCHITECTURE (Target — Next.js App Router)

## PROJECT STRUCTURE (Target)

```
Vivah/
├── .claude/                            # Claude Code configuration
│   ├── settings.json                   # Hooks, permissions, environment
│   └── commands/                       # Custom slash commands
│       ├── tdd-flow.md                 # TDD orchestration workflow command
│       └── agents/                     # Agent persona commands
│           ├── orchestrator.md
│           ├── system-architect.md
│           ├── ba.md
│           ├── ssde.md
│           ├── ssdt.md
│           ├── pm.md
│           └── cse.md
│
├── CLAUDE.md                           # Claude Code project context
│
├── src/
│   ├── app/                            # Next.js App Router
│   │   ├── layout.tsx                  # Root layout (fonts, providers, nav)
│   │   ├── page.tsx                    # Root redirect → /dashboard
│   │   ├── globals.css                 # Tailwind base styles
│   │   │
│   │   ├── (dashboard)/
│   │   │   └── dashboard/
│   │   │       ├── page.tsx
│   │   │       └── loading.tsx
│   │   │
│   │   ├── (planning)/
│   │   │   ├── functions/page.tsx
│   │   │   ├── guests/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   └── vendors/
│   │   │       ├── page.tsx
│   │   │       └── [id]/page.tsx
│   │   │
│   │   ├── (operations)/
│   │   │   ├── accommodation/page.tsx
│   │   │   ├── travel/page.tsx
│   │   │   ├── rituals/page.tsx
│   │   │   └── responsibilities/page.tsx
│   │   │
│   │   ├── (management)/
│   │   │   ├── finance/page.tsx
│   │   │   ├── tasks/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   └── invitation/page.tsx
│   │   │
│   │   ├── (execution)/
│   │   │   ├── command-center/page.tsx
│   │   │   ├── alerts/page.tsx
│   │   │   ├── checkin/page.tsx
│   │   │   └── whatsapp/page.tsx
│   │   │
│   │   ├── (settings)/
│   │   │   ├── settings/page.tsx
│   │   │   ├── emergency/page.tsx
│   │   │   └── gallery/page.tsx
│   │   │
│   │   └── api/
│   │       ├── guests/route.ts
│   │       ├── vendors/route.ts
│   │       ├── finance/route.ts
│   │       ├── events/route.ts
│   │       ├── tasks/route.ts
│   │       ├── accommodation/route.ts
│   │       ├── travel/route.ts
│   │       ├── rituals/route.ts
│   │       └── [...]
│   │
│   ├── components/
│   │   ├── ui/                         # shadcn/ui base components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   ├── form.tsx
│   │   │   └── [...]
│   │   │
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── ThemeProvider.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── BudgetCard.tsx
│   │   │   ├── GuestStats.tsx
│   │   │   ├── CountdownTimer.tsx
│   │   │   ├── VendorStatusChart.tsx
│   │   │   └── AlertStrip.tsx
│   │   │
│   │   ├── guests/
│   │   │   ├── GuestTable.tsx
│   │   │   ├── GuestForm.tsx
│   │   │   └── GuestFilters.tsx
│   │   │
│   │   ├── vendors/
│   │   ├── finance/
│   │   ├── tasks/
│   │   └── [module-name]/              # One folder per module
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   └── prisma.ts               # Prisma client singleton
│   │   ├── utils/
│   │   │   ├── currency.ts             # INR formatting
│   │   │   ├── date.ts                 # Date helpers
│   │   │   └── cn.ts                   # Tailwind class merge
│   │   ├── validations/
│   │   │   ├── guest.schema.ts         # Zod schemas per entity
│   │   │   ├── vendor.schema.ts
│   │   │   └── [...]
│   │   └── actions/
│   │       ├── guest.actions.ts        # Server Actions
│   │       ├── vendor.actions.ts
│   │       └── [...]
│   │
│   └── types/
│       ├── index.ts                    # Shared type exports
│       ├── guest.types.ts
│       └── [...]
│
├── prisma/
│   ├── schema.prisma                   # Database schema
│   └── migrations/                     # Auto-generated migrations
│
├── __tests__/
│   ├── unit/
│   │   ├── components/
│   │   └── lib/
│   ├── integration/
│   │   └── api/
│   └── e2e/
│       └── playwright/
│
├── public/
│   ├── icons/
│   │   ├── favicon.ico
│   │   ├── favicon.svg
│   │   ├── vivah-logo.svg              # New fire+water purple logo
│   │   └── apple-touch-icon.png
│   └── images/
│
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── .env.local                          # Local env vars (gitignored)
├── .env.example                        # Env var template
├── netlify.toml                        # Legacy (superseded by Vercel)
├── README.md
└── DEVELOPMENT_PHASES.md
```

---

# TDD AGENT ORCHESTRATION SYSTEM

## Philosophy

All new development on Vivah (Phase 5+) follows **Test-Driven Development** orchestrated by a single **Orchestrator** that coordinates multiple specialized agent personas. Each persona represents a senior member of a cross-functional product team.

The Orchestrator maintains the flow, resolves conflicts, enforces the TDD cycle (Red → Green → Refactor), and ensures every change is:
1. Specified (BA acceptance criteria)
2. Architecturally sound (System Architect approval)
3. Covered by tests before implementation (SSDT writes tests first)
4. Implemented to pass tests (SSDE codes)
5. Reviewed and production-ready (all agents sign off)

---

## Orchestrator

**Slash command**: `/orchestrator`

**Persona**: The Engineering Director / Scrum Master hybrid. Coordinates all agents, creates the sprint flow, resolves blockers, and keeps the TDD cycle intact.

**Responsibilities**:
- Break incoming feature requests into a structured TDD workflow
- Assign tasks to agent personas in the correct order
- Enforce the Red → Green → Refactor cycle
- Track what is done, in progress, and blocked
- Escalate risks to PM
- Ensure SSDE never writes code before SSDT writes a failing test

**Flow**:
```
User Story → BA (acceptance criteria)
          → System Architect (design decision)
          → SSDT (failing tests written)
          → SSDE (implementation to pass tests)
          → SSDE (refactor)
          → Code Review (SSDE peer + System Architect)
          → PM (scope/timeline check)
          → CSE (UX/support validation)
          → Orchestrator (merge approval)
```

---

## Agent Personas

### 1. Business Analyst (BA)
**Slash command**: `/ba`

**Focus**: Translate feature requests into precise, testable acceptance criteria using Given/When/Then (Gherkin-style).

**Outputs**:
- User stories in standard format: `As a [role], I want [feature], so that [benefit]`
- Acceptance criteria in Gherkin: `Given / When / Then`
- Edge cases and out-of-scope boundaries
- Data requirements and field validations

---

### 2. System Architect
**Slash command**: `/system-architect`

**Focus**: Database schema design, API contract definition, component architecture, and technology decisions.

**Outputs**:
- Prisma schema additions/changes
- API route contracts (request/response types)
- Component tree and data flow diagrams
- Technology choice rationale
- Performance and security considerations

---

### 3. Senior Software Development Engineer (SSDE)
**Slash command**: `/ssde`

**Focus**: Write production-quality TypeScript/React/Next.js code that passes the tests written by SSDT. **Never writes code before SSDT delivers failing tests.**

**Outputs**:
- React components (typed, tested, accessible)
- Next.js Server Actions and Route Handlers
- Prisma queries and database mutations
- Refactored, clean code after tests go green

---

### 4. Senior Software Development Engineer in Test (SSDT)
**Slash command**: `/ssdt`

**Focus**: Write failing tests **before** any implementation exists. The Red phase. Covers unit, integration, and E2E scenarios as defined by BA's acceptance criteria.

**Outputs**:
- Vitest unit tests for components and utilities
- Vitest integration tests for API routes and Server Actions
- Playwright E2E tests for critical user flows
- Test data factories and fixtures
- Coverage reports and gaps analysis

---

### 5. Program / Product Manager (PM)
**Slash command**: `/pm`

**Focus**: Scope, timelines, roadmap alignment, and stakeholder communication. Ensures the team doesn't over-engineer or drift from the wedding planning domain.

**Outputs**:
- Sprint plan updates
- Scope risk flags (scope creep, gold-plating)
- Timeline estimates based on SSDE complexity ratings
- Roadmap impact assessment for architectural decisions
- Release notes and changelog entries

---

### 6. Client Support Engineer (CSE)
**Slash command**: `/cse`

**Focus**: The user's advocate. Validates that the feature makes sense from a wedding planner's perspective, catches UX gaps, and writes user-facing documentation.

**Outputs**:
- Usability feedback on proposed UI flows
- Error message quality review (are they actionable?)
- FAQ and help text for new features
- Regression test suggestions from real-world wedding scenarios
- Support runbook for common issues

---

### 7. DevOps / Infrastructure Engineer
**Slash command**: `/devops`

**Focus**: CI/CD pipelines, database migrations, environment configuration, monitoring, and deployment safety.

**Outputs**:
- GitHub Actions workflow changes
- Prisma migration safety review
- Environment variable checklist
- Deployment rollback plan
- Performance and load considerations

---

## Claude Code Hooks

Hooks are configured in `.claude/settings.json` and enforce TDD and code quality automatically.

### Hook: `PostToolUse` — Run Tests After Code Edit

Triggers after any `Edit` or `Write` tool call on source files. Runs the affected Vitest tests to immediately surface regressions.

```json
{
  "matcher": "Edit|Write",
  "hooks": [{
    "type": "command",
    "command": "npx vitest run --reporter=verbose 2>&1 | tail -30"
  }]
}
```

### Hook: `PostToolUse` — TypeScript Type Check After Edit

After any edit to `.ts` / `.tsx` files, runs `tsc --noEmit` to catch type errors immediately.

```json
{
  "matcher": "Edit|Write",
  "hooks": [{
    "type": "command",
    "command": "npx tsc --noEmit 2>&1 | head -30"
  }]
}
```

### Hook: `PostToolUse` — Lint After Edit

After edits, runs ESLint to enforce code style and catch common bugs.

```json
{
  "matcher": "Edit|Write",
  "hooks": [{
    "type": "command",
    "command": "npx eslint --max-warnings=0 $(git diff --name-only HEAD | grep -E '\\.(ts|tsx)$') 2>&1 | tail -20"
  }]
}
```

### Hook: `Stop` — Session Summary

When Claude Code stops a session, prints a summary of what changed and what tests need to be written next.

```json
{
  "hooks": [{
    "type": "command",
    "command": "echo '=== Session Complete ===' && git diff --stat HEAD && echo '' && echo 'Run: npx vitest run --coverage'"
  }]
}
```

### Hook: `PreToolUse` — Block Code Without Tests (TDD Guard)

If SSDE attempts to write implementation code when no test file exists for the feature, the hook warns.

```json
{
  "matcher": "Write",
  "hooks": [{
    "type": "command",
    "command": "echo '[TDD Guard] Confirm a failing test exists before implementing. Run /ssdt if not done yet.'"
  }]
}
```

---

# ARCHITECTURE IMPLEMENTED (Vanilla JS — Legacy)

## Technology Stack (As Built — Phase 1-3)

### Frontend (Legacy)
- **HTML5**: Semantic markup for all pages
- **CSS3**: Responsive design with theme variations (mehendi, reception themes)
- **Vanilla JavaScript**: No frameworks; single-page app (SPA) architecture with hash-based routing
- **SVG/Icons**: Monogram logo with bride/groom initials (S/H) — **to be replaced with fire+water logo**

### Backend/Storage (Legacy)
- **JSON Files**: All data stored in `/data` folder with modular organization
- **Local Dev Server**: Node.js HTTP server (`dev-server.mjs`) for CORS-compliant local development
- **localStorage API**: Client-side caching for offline support

### Deployment (Legacy)
- **Netlify**: Configured for free static hosting

---

## FEATURES BUILT (Phase 1 & 2 — Vanilla JS)

### 1. Dashboard ✅ COMPLETE
**Route**: `#dashboard` | **Data**: Events, Budget, Expenses, Guests, Vendors, Alerts

Displays:
- Days remaining countdown to 25 Nov 2026
- Budget overview: Planned, Actual, Paid, Remaining with utilization %
- Guest statistics: Total count, confirmed, pending by RSVP status
- Vendor finalization status and distribution
- Budget distribution chart by category (12 categories)
- Guest city distribution chart
- Upcoming functions timeline (next 5 events)
- Vendor status breakdown chart
- Dynamic alert strip: Budget overrun, vendor payments, room shortage, pickup reminders

---

### 2. Wedding Functions (Timeline) ✅ COMPLETE
**Route**: `#functions` | **Data**: `data/events/events.json`

Full CRUD — Predefined Bihari wedding functions:
- Pre-Wedding: Ring Ceremony, Engagement, Tilak
- Wedding: Haldi, Mehendi, Sangeet, Matkor, Mandap, Baraat, Jaimala, Kanyadaan, Saat Phere, Vidaai
- Post-Wedding: Reception, Satyanarayan Katha, Family Lunch

---

### 3. Guest Management ✅ COMPLETE
**Route**: `#guests`
- Dual database: Groom-side + Bride-side
- Full CRUD with filters (city, RSVP, side)
- 14 fields per guest including RSVP, accommodation, pickup needs

---

### 4. Vendor Management ✅ COMPLETE
**Route**: `#vendors`
- 12 vendor categories, full CRUD
- Payment tracking: quotation → negotiated → final → advance paid → balance due

---

### 5. Finance Management ✅ COMPLETE
**Route**: `#finance`
- Budget categories + expense ledger
- 12 categories, overrun detection, INR formatting

---

### 6. Task Management (Kanban) ✅ COMPLETE
**Route**: `#tasks`
- Kanban: Pending / In Progress / Completed / Blocked
- Priority levels, owner assignment, deadline tracking

---

### 7. Accommodation Planning ✅ COMPLETE
**Route**: `#accommodation`
- Hotels, guest houses, relative homes
- Room allocation grid with guest assignments

---

### 8. Travel Management ✅ COMPLETE
**Route**: `#travel`
- 5 transport types, pickup coordination, arrival tracking

---

### 9. Ritual Planning ✅ COMPLETE
**Route**: `#rituals`
- 9 Bihari wedding rituals with samagri (items) tracking

---

### 10. Family Responsibility Matrix ✅ COMPLETE
**Route**: `#responsibilities`
- Owner + backup person, deadlines, priority, escalation visibility

---

### 11. Invitation Builder ✅ COMPLETE
**Route**: `#invitation`
- 5 section types, content management, contact info

---

### 12. Reports Module (Phase 3 - Partial) ✅ SCAFFOLD
**Route**: `#reports`
- Summary dashboard with basic charts

---

### 13. Alerts System (Phase 3 - Partial) ✅ FOUNDATION
**Route**: `#alerts`
- 5 alert types with configurable thresholds

---

### 14. Guest Check-In (Phase 3 - Partial) ✅ FOUNDATION
**Route**: `#checkin`
- Event-based check-in, QR-ready data structure

---

### 15. WhatsApp Templates (Phase 3 - Partial) ✅ FOUNDATION
**Route**: `#whatsapp`
- 5 message categories, template CRUD

---

### 16. Wedding Command Center (Phase 3 - Partial) ✅ SCAFFOLD
**Route**: `#commandCenter`
- Live operations dashboard with task/ritual/room/vendor counters

---

# REMAINING WORK (Phase 3 — Vanilla JS)

## Phase 3 Remaining Tasks

### 1. Reports Module Enhancement — 60% Complete
- Detailed budget breakdown, guest family-wise summary, RSVP breakdown
- PDF/Excel export, print layouts, advanced filters
- **Estimated effort**: 16–20 hours

### 2. Wedding Day Command Center — 30% Complete
- Vendor arrival tracking, guest pickup dashboard, emergency contact priorities
- Function-wise readiness checklist, live wedding-day timeline
- **Estimated effort**: 12–16 hours

### 3. Alerts System Enhancement — 50% Complete
- All 5 alert types with thresholds, email notifications
- Escalation workflow, alert history, snooze functionality
- **Estimated effort**: 8–12 hours

### 4. QR Check-In System — 20% Complete
- QR code generation, mobile scanner, attendance reporting
- Family grouping, offline support, print QR labels
- **Estimated effort**: 14–18 hours

### 5. WhatsApp Integration — 30% Complete
- Click-to-send links, variable substitution, batch messaging
- **Estimated effort**: 10–14 hours

### 6. Gallery Module — 0% Complete
- Photo upload by function, modal browsing
- **Estimated effort**: 6–8 hours

### 7. Settings Module — 0% Complete
- Configurable wedding date, categories, themes, export/import backup
- **Estimated effort**: 6–8 hours

### 8. Emergency Module — 0% Complete
- Hospital, police, fire, electrician, generator contacts
- **Estimated effort**: 4–6 hours

---

# Phase 5 — Next.js Migration Plan

## Migration Strategy

Use **Strangler Fig pattern**: Build Next.js pages alongside the legacy app. Each module is migrated independently and feature-flagged. Legacy Vanilla JS app remains functional until all modules are migrated and tested.

## Migration Order (Priority)
1. Database schema design (Prisma) + seed legacy data
2. Authentication system (NextAuth.js)
3. Dashboard + Finance (read-heavy, good start)
4. Guest Management (core module)
5. Vendor Management
6. All remaining modules in parallel (sprints)
7. Remove legacy Vanilla JS app

## Database Schema Entities (Prisma)
```prisma
model Wedding {
  id          String   @id @default(cuid())
  name        String
  date        DateTime
  venue       String
  createdAt   DateTime @default(now())
  guests      Guest[]
  vendors     Vendor[]
  events      Event[]
  // ... all relations
}

model Guest { ... }
model Vendor { ... }
model Event { ... }
model Task { ... }
model Accommodation { ... }
model Room { ... }
model TravelRecord { ... }
model Ritual { ... }
model Responsibility { ... }
model BudgetCategory { ... }
model Expense { ... }
model Alert { ... }
model CheckIn { ... }
model WhatsAppTemplate { ... }
model InvitationBlock { ... }
```

---

# Platform Vision (Phase 6)

## Wedding Organizer E2E Platform

Vivah evolves into a **multi-tenant SaaS platform** where professional wedding organizers, families, and event companies can register and manage any number of weddings.

### Key Platform Features
- **Organizer Registration**: Self-signup for wedding planners and agencies
- **Multi-Wedding Dashboard**: Manage multiple active weddings simultaneously
- **Client Portal**: Bride/groom families get their own view with limited access
- **Vendor Network**: Platform-wide vendor directory with ratings and reviews
- **Template Library**: Reusable checklists, budget templates, vendor lists
- **White-label Option**: Organizers can brand the platform as their own
- **Subscription Tiers**: Free (1 wedding), Professional (5 weddings), Enterprise (unlimited)
- **Analytics Dashboard**: Cross-wedding insights for organizers
- **Mobile App**: React Native companion app

### Multi-Tenancy Architecture
```
Platform
  └── Organizer Account (tenant)
        ├── Wedding 1 (e.g., Priya & Raj — Nov 2026)
        ├── Wedding 2 (e.g., Ananya & Karan — Dec 2026)
        └── Wedding 3 (...)
```

### Phase 6 Tech Additions
- Row-Level Security (RLS) in PostgreSQL via Prisma
- Stripe for subscription billing
- SendGrid/Resend for transactional emails
- Redis for real-time features (check-in, command center)
- React Native (Expo) for mobile app

---

# UI / UX Requirements

## Design System

Based on the new brand identity (purple + white + black shadow):

- **Primary Color**: Deep Purple (`#7C3AED`)
- **Surface**: White (`#FFFFFF`) with card shadows
- **Text**: Near-black (`#0A0A0A`) and gray shades
- **Accent gradients**: Purple → Indigo (`#7C3AED` → `#4F46E5`)
- **Error**: Red (`#EF4444`)
- **Success**: Green (`#10B981`)

## Theme Variations (Maintained)

### Haldi Theme
- Yellow (`#FEF08A`), Orange (`#F97316`), White

### Mehendi Theme
- Green (`#16A34A`), Gold (`#D97706`)

### Wedding Theme
- Maroon (`#9F1239`), Gold (`#D97706`), Ivory (`#FFFBEB`)

### Reception Theme
- Royal Blue (`#1D4ED8`), Silver (`#9CA3AF`), White

---

# Navigation

Top Navigation Bar (grouped):

```
Planning:    Dashboard | Functions | Guests | Vendors
Operations:  Accommodation | Travel | Rituals | Responsibilities
Management:  Finance | Tasks | Reports | Invitation
Execution:   Command Center | Alerts | Check-In | WhatsApp
Settings:    Gallery | Emergency | Settings | Theme Toggle
```

---

# Core Modules

## 1. Dashboard

Displays:

* Days Remaining Countdown
* Budget: Planned / Actual / Paid / Remaining
* Guest: Total / Confirmed / Pending / Declined
* Vendor: Finalized / Pending count
* Upcoming Functions (next 5)

Charts:

* Budget Distribution by Category
* Guest City Distribution
* Vendor Status Breakdown
* Expense Trend Over Time (Phase 5+)

---

## 2. Wedding Functions (Timeline)

### Pre-Wedding
* Ring Ceremony, Engagement, Tilak Ceremony

### Wedding Functions
* Haldi, Mehendi, Sangeet, Matkor, Mandap Ceremony, Baraat, Jaimala, Kanyadaan, Saat Phere, Vidaai

### Post-Wedding
* Reception, Satyanarayan Katha, Family Lunch

Each event contains: Name, Date, Venue, Start Time, End Time, Coordinator, Budget, Checklist, Notes

---

## 3. Guest Management

Separate databases for Groom Side and Bride Side.

**Fields**: Name, Family Name, Mobile, City, State, Relationship, Side, Guest Count, Accommodation Required, Pickup Required, Invitation Sent, RSVP Status, Gift Received, Special Notes

**Filters**: City, State, RSVP Status, Family Name, Side

---

## 4. Accommodation Planner

Manage: Hotels, Guest Houses, Relative Homes

**Fields**: Property Name, Type, Address, Contact, Rooms Available/Allocated, Check-In/Out Dates, Cost

**Room Allocations**: Room Number, Assigned Guests, Status

---

## 5. Travel Management

Track: Flights, Trains, Buses, Cab Assignments

**Fields**: Guest Name, Arrival Date/Time, Transport Type, PNR, Pickup Required, Coordinator, Vehicle Number, Status

---

## 6. Vendor Management

**Categories**: Photographer, Videographer, Caterer, Decorator, DJ, Band, Makeup Artist, Tent Vendor, Flower Vendor, Priest, Mehendi Artist, Transportation Vendor

**Fields**: Name, Category, Contact, Phone, Email, Quotation, Negotiated, Final Amount, Advance Paid, Balance Due, Contract Notes, Status, Rating, Notes

**Statuses**: Shortlisted, Negotiating, Finalized, Rejected

---

## 7. Finance Management

**Budget Categories**: Venue, Food, Photography, Decorations, Accommodation, Travel, Jewelry, Clothing, Invitation Cards, Gifts, Emergency, Miscellaneous

**Features**: Planned/Actual/Paid/Remaining, overrun detection, INR formatting, expense ledger

**Reports**: Expense Summary, Cost Breakdown, Vendor Payment Schedule

---

## 8. Family Responsibility Matrix

**Fields**: Task, Owner, Backup Person, Deadline, Priority, Status

**Examples**: Airport Pickups, Hotel Coordination, Vendor Payments, Ritual Arrangements, Guest Welcome

---

## 9. Ritual Planning (Traditional Bihari Wedding)

**Rituals**: Tilak, Matkor, Haldi, Mandap, Jaimala, Kanyadaan, Saat Phere, Sindoor Daan, Vidaai

**Each ritual includes**: Description, Required Items (Samagri), Responsible Person, Budget, Priest Notes

---

## 10. Wedding Shopping Tracker

**Groom**: Sherwani, Reception Suit, Shoes, Accessories

**Bride**: Wedding Lehenga, Jewelry, Makeup

**Fields**: Item, Assigned To, Purchased, Cost, Vendor, Status

---

## 11. Contacts Directory

Store: Family Contacts, Vendor Contacts, Hotels, Hospitals, Police, Emergency Services

Searchable and filterable.

---

## 12. Task Management System

**Kanban Board**: Pending | In Progress | Completed | Blocked

**Fields**: Task Name, Priority, Due Date, Owner, Notes

---

## 13. Reports Module

**Generate**: Budget Report, Guest Report, RSVP Report, Vendor Report, Accommodation Report, Travel Report

**Export**: PDF, Excel, CSV

---

## 14. Wedding Day Command Center

**Live Dashboard**: Event Status, Vendor Arrival, Guest Arrival, Emergency Contacts, Pending Activities

---

## 15. Emergency Module

**Contacts**: Hospitals, Ambulance, Police, Fire, Electrician, Plumber, Generator Vendor

---

# Smart Features

* Wedding Countdown
* Budget Overrun Alerts
* Vendor Payment Alerts
* Room Allocation Suggestions
* Guest Pickup Reminders
* Daily Planning Checklist
* Risk Register (Risk / Probability / Impact / Mitigation Plan)

---

# Future Enhancements

Architecture must support:

* ✅ User Authentication (Phase 5)
* ✅ Multi-user Collaboration (Phase 5)
* ✅ PostgreSQL database (Phase 5)
* ✅ Wedding Organizer E2E Platform (Phase 6)
* WhatsApp Business API Integration
* Google Maps Integration
* QR Guest Check-In (Phase 3/5)
* E-Invitation Generator
* AI Wedding Assistant (Phase 4/5)
* Expense Forecasting
* Wedding Gallery (Phase 3/5)
* Vendor Ratings
* Voice Notes
* Progressive Web App (PWA)
* React Native Mobile App (Phase 6)

---

# Quality Expectations

The final solution must be:

* Production-ready
* Test-Driven (TDD-first, ≥ 80% coverage)
* Type-safe (TypeScript strict mode)
* Modular and maintainable
* Scalable (multi-tenant ready by Phase 6)
* Mobile Responsive
* Accessible (WCAG AA)
* Modern UI/UX
* Optimized for 500–1500 guests
* Suitable for a traditional Bihari wedding hosted in Vadodara, Gujarat

The application should function as a complete **wedding operating system** — and eventually as a platform that any wedding organizer in India can adopt.
