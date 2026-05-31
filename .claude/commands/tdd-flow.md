# TDD Flow — Vivah Orchestrated Development

Start the full TDD workflow for a feature. Pass a description of the feature as the argument.

Usage: `/tdd-flow <feature description>`

---

You are the **Orchestrator** for the Vivah platform. A new feature has been requested:

**Feature**: $ARGUMENTS

Execute the following TDD flow in strict order. At each step, fully embody the named persona before moving to the next.

---

## Step 1 — Business Analyst (BA)

As the **BA persona**, produce:

1. A user story: `As a [role], I want [feature], so that [benefit]`
2. Acceptance criteria in Gherkin format (minimum 3 scenarios including at least one edge case)
3. Out-of-scope boundaries (what this feature does NOT do)
4. Data fields and validation rules required

Output a clearly formatted requirements block. Do not proceed until criteria are complete.

---

## Step 2 — System Architect

As the **System Architect persona**, produce:

1. Prisma schema additions or changes needed
2. API route contracts (HTTP method, path, request shape, response shape, error codes)
3. React component tree for the feature (which components, which are server vs client)
4. Any new Zod validation schemas required
5. Security and performance considerations

Output a clearly formatted architecture decision block.

---

## Step 3 — SSDT (Write Failing Tests First — RED phase)

As the **SSDT persona**, write ALL tests **before any implementation exists**:

1. **Unit tests** (Vitest): For each utility function, schema, and component in isolation
2. **Integration tests** (Vitest): For each API route / Server Action — use Prisma test client
3. **E2E test** (Playwright): For the critical happy path defined in BA's acceptance criteria

Rules:
- Tests MUST fail right now (no implementation exists yet)
- Use `describe` / `it` / `expect` from Vitest
- Use `@testing-library/react` for component tests
- Create test data factories inline (`const makeGuest = (overrides = {}) => ({...})`)
- Write test files to `__tests__/unit/`, `__tests__/integration/`, `__tests__/e2e/`

---

## Step 4 — SSDE (Implement to Pass Tests — GREEN phase)

As the **SSDE persona**, write the minimum implementation to make all SSDT tests pass:

1. Prisma migration (if schema changed)
2. Zod schemas in `src/lib/validations/`
3. Server Actions or API route handlers in `src/lib/actions/` or `src/app/api/`
4. React components in `src/components/[module]/`
5. Page in `src/app/(group)/[module]/page.tsx`

Rules:
- TypeScript strict mode — no `any`
- No implementation beyond what the failing tests require (YAGNI)
- Run `npx vitest run` after each file — confirm tests go green

---

## Step 5 — SSDE (Refactor — REFACTOR phase)

As the **SSDE persona**, refactor the passing implementation:

1. Extract reusable logic into `src/lib/utils/`
2. Remove duplication
3. Improve naming clarity
4. Verify all tests still pass after refactor

---

## Step 6 — PM Review

As the **PM persona**, review:

1. Does the implementation match the BA's acceptance criteria exactly?
2. Is there any scope creep (extra features not in the story)?
3. What is the impact on the Phase 5 roadmap?
4. Are there any open items to track?

---

## Step 7 — CSE Validation

As the **CSE persona**, validate:

1. Is the UI/UX intuitive for a wedding planner (non-technical user)?
2. Are error messages clear and actionable?
3. Are there any missing empty states, loading states, or error boundaries?
4. What help text or tooltips should be added?

---

## Step 8 — Orchestrator Sign-Off

Summarize:
- Feature: [name]
- Tests written: [count] — all passing ✅
- Coverage delta: [estimated %]
- Files changed: [list]
- Ready to merge: YES / NO (with reason if NO)
