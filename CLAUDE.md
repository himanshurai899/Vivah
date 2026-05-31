# Vivah — Claude Code Project Context

## What This Project Is

**Vivah** is a wedding planning platform built for a traditional Bihari wedding in Vadodara, Gujarat (25 Nov 2026). It is evolving into a multi-tenant SaaS product for professional wedding organizers across India.

## Current Tech State

- **Legacy (Phases 1–3)**: Vanilla JS SPA + JSON file storage, deployed on Netlify. Lives in `assets/` and `data/`.
- **Target (Phase 5)**: Next.js 15 (App Router) + React 19 + TypeScript + PostgreSQL + Prisma. Source lives in `src/`.
- **Branch `feature/code-gen-claude`**: Active development branch — all new work goes here.

## Development Methodology

**TDD is mandatory.** Every new feature follows this exact order:
1. `/ba` writes acceptance criteria (Given/When/Then)
2. `/system-architect` designs schema/API contract
3. `/ssdt` writes failing tests (Vitest + Playwright)
4. `/ssde` writes code to pass tests
5. `/ssde` refactors
6. `/orchestrator` reviews and approves

Use `/orchestrator` to start any feature flow. Never write implementation before a failing test exists.

## Agent Commands

| Command | Role |
|---|---|
| `/orchestrator` | Coordinates the TDD flow end-to-end |
| `/ba` | Acceptance criteria, user stories |
| `/system-architect` | Schema design, API contracts |
| `/ssde` | Implementation (React/Next.js/Prisma) |
| `/ssdt` | Tests (Vitest + Playwright) |
| `/pm` | Scope, timelines, roadmap |
| `/cse` | UX validation, user documentation |
| `/devops` | CI/CD, migrations, deployment |

## Key Domain Facts

- Wedding date: **25 November 2026**, Vadodara, Gujarat
- Wedding style: **Traditional Bihari customs** (Tilak, Matkor, Haldi, Mandap, Saat Phere, Vidaai, etc.)
- Guests: 500–1500, arriving from Bihar, Gujarat, Maharashtra, Delhi NCR
- Currency: **INR** — always format with `Intl.NumberFormat('en-IN')`
- Two guest sides: **Groom** and **Bride** (always tracked separately)

## Design System — "Agni-Jal Editorial" ($10K Standard)

This project targets the **Metics Media $10K Checklist**. All 8 criteria are non-negotiable:

| # | Criterion | Implementation |
|---|-----------|---------------|
| 01 | **Point of view** | "Agni-Jal Editorial" — warm ivory + deep purple-black + gold. Chosen, not defaulted. |
| 02 | **Typography** | `Cormorant Garamond` (display/titles) + `DM Sans` (body/UI). **Never Inter. Never Roboto.** |
| 03 | **Restrained color** | 4 tokens only: `--ink, --purple, --gold, --ivory`. No rainbow, no additions without PM approval. |
| 04 | **Hierarchy breathes** | `page-title` class for h1, generous padding, clear primary/secondary/tertiary on every screen. |
| 05 | **Imagery with intent** | Lucide icons only (consistent weight 1.5/2). No placeholder assets in production. |
| 06 | **Motion whispers** | All transitions use `var(--ease)` + `var(--duration-fast)`. Card hover = `translateY(-2px)`. No AOS. |
| 07 | **Mobile designed** | Bottom nav bar (not hamburger drawer). 44px touch targets. Cards stack intentionally. |
| 08 | **Invisible stuff** | WCAG AA contrast, `type="button"` on all buttons, no inline `style={{}}`, semantic HTML, focus rings. |

### Font Loading

```tsx
import { Cormorant_Garamond, DM_Sans } from "next/font/google"
// variables: --font-cormorant, --font-dm-sans
```

### CSS Design Tokens

```css
--ink:     #0F0612;   /* primary text */
--purple:  #7C3AED;   /* brand, CTAs */
--gold:    #C9A84C;   /* hierarchy marker, fire accent */
--ivory:   #FAFAF8;   /* page background */
```

### Key CSS Classes

- `.page-title` — Cormorant Garamond h1 with right sizing
- `.card` — white rounded card with hover lift micro-interaction
- `.stat-number` — Cormorant Garamond bold for data/stats
- `.vivah-gradient` — purple→indigo brand gradient
- `.progress-bar` — GPU-composited scaleX animation
- `.skeleton` — shimmer loading state
- `.mobile-bottom-nav` — fixed bottom nav (< 1024px only)

## Testing

```bash
npx vitest run          # Run all unit/integration tests
npx vitest              # Watch mode
npx playwright test     # E2E tests
npx vitest --coverage   # Coverage report (target ≥ 80%)
```

## Database

```bash
npx prisma studio       # Browse data
npx prisma migrate dev  # Apply migrations in dev
npx prisma db seed      # Seed with sample wedding data
```

## Common Commands

```bash
npm run dev             # Start Next.js dev server (port 3000)
npm run build           # Production build
npm run lint            # ESLint
npm run type-check      # tsc --noEmit
```

## File Conventions

- Components: PascalCase (`GuestTable.tsx`)
- Utilities: camelCase (`formatCurrency.ts`)
- Schemas: `[entity].schema.ts` (Zod)
- Actions: `[entity].actions.ts` (Next.js Server Actions)
- Tests: co-located `[file].test.ts` for unit, `__tests__/` for integration/E2E

## Plugin Requirement (Always Active)

**Every prompt in this project must use both the engineering plugin AND the design plugin together.** Never use one without the other.

## What NOT to Do

- Do not write implementation code before SSDT delivers failing tests
- Do not use `any` type in TypeScript — use proper types or `unknown`
- Do not hardcode the wedding date — read from `Wedding` model in DB
- Do not skip Zod validation on any API route input
- Do not add features beyond the current sprint scope — flag to `/pm`
