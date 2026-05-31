# Vivah Deployment Plan

**Document Type**: Deployment Strategy & Implementation Plan  
**Created**: 2026-05-31  
**Status**: Ready for Review  
**Target Deployment Date**: 2026-09-01 (3 months before wedding)  
**Responsibility**: `/devops` agent with `/ssde` support

---

## Phase Overview

```
┌─────────────────────────────────────────────────────────────┐
│  PHASE 1: PREPARATION       │  PHASE 2: STAGING  │  PHASE 3: GO-LIVE  │
│  (Jun 1 – Jun 30)           │  (Jul 1 – Aug 31)  │  (Sep 1 – Nov 25)  │
├─────────────────────────────────────────────────────────────┤
│ ✓ Environment setup         │ ✓ Staging deploy   │ ✓ Monitoring       │
│ ✓ Database design final     │ ✓ Load testing     │ ✓ On-call setup    │
│ ✓ Secret management         │ ✓ User acceptance  │ ✓ Incident response│
│ ✓ CI/CD pipeline            │ ✓ Security audit   │ ✓ Wedding day ops  │
│ ✓ Backup strategy           │ ✓ Disaster recovery│ ✓ Post-mortem      │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Preparation (June 1 – June 30)

### 1.1 Infrastructure Setup

**Task**: Provision production infrastructure on free tier

**Subtasks**:
- [ ] Create Neon PostgreSQL database (production)
- [ ] Create Vercel project linked to GitHub
- [ ] Verify database connection from local dev environment
- [ ] Test connection timeout handling
- [ ] Document connection strings in secure vault (GitHub Secrets)

**Owner**: `/devops`  
**Duration**: 1 day  
**Blockers**: GitHub repo must be public or have Vercel app installed

**Evidence**:
```
✅ Neon project active at https://console.neon.tech
✅ Vercel project created at https://vercel.com/vivah-production
✅ DATABASE_URL stored in GitHub Secrets
✅ Local `.env.local` connects to production DB successfully
```

---

### 1.2 Environment Variables & Secrets

**Task**: Define all environment variables and store in Vercel

**Subtasks**:
- [ ] Generate `NEXTAUTH_SECRET` using `openssl rand -base64 32`
- [ ] Set `NEXTAUTH_URL` to staging domain
- [ ] Create `.env.example` in repo (no secrets, for reference)
- [ ] Add all vars to Vercel dashboard
- [ ] Add all vars to Neon project settings
- [ ] Test that local dev can override with `.env.local`
- [ ] Verify no secrets in git history: `git log -p | grep -i "secret|key|password" | head`

**Owner**: `/devops`  
**Duration**: 2 hours  
**Checklist**:
- [ ] NEXTAUTH_SECRET: ✅ (32+ chars)
- [ ] NEXTAUTH_URL: ✅ (https://vivah-staging.vercel.app)
- [ ] DATABASE_URL: ✅ (postgresql://...)
- [ ] SMTP vars (if email enabled): ✅ or ⭕ (deferred)
- [ ] Analytics ID: ✅ (from Vercel)

---

### 1.3 Database Schema Finalization

**Task**: Ensure Prisma schema is production-ready

**Subtasks**:
- [ ] Audit `prisma/schema.prisma` for missing indices
- [ ] Add indices on frequently-queried fields (e.g., `weddingId`, `status`)
- [ ] Verify `onDelete: Cascade` relationships are correct
- [ ] Test migration on staging database: `npx prisma migrate deploy`
- [ ] Review Prisma docs for PostgreSQL-specific gotchas
- [ ] Change `provider = "sqlite"` to `provider = "postgresql"` for production mode

**Owner**: `/system-architect` + `/ssde`  
**Duration**: 4 hours  
**Decision Point**: Schema freeze — no breaking changes after this

**Current schema issues to fix**:
- ✅ Schema looks solid (no immediate red flags)
- ⚠️ JSON fields (`checklist`, `requiredItems`, `assignedGuests`) should be validated with Zod
- ⚠️ No soft-delete pattern (deleted records are removed, not marked as deleted)

---

### 1.4 CI/CD Pipeline Setup

**Task**: Configure GitHub Actions for automated deploy-on-push

**Subtasks**:
- [ ] Create `.github/workflows/deploy.yml`
  - Trigger: `on: [push to main, pull_request]`
  - Jobs: lint, type-check, test, build
  - Only deploy on `main` branch
  - Report status to pull requests
- [ ] Run `npm run build` in workflow to catch build errors early
- [ ] Configure Vercel integration to auto-deploy on push to `main`
- [ ] Add GitHub branch protection rule: require CI to pass before merge
- [ ] Test full pipeline: commit → push → CI runs → Vercel deploys

**Owner**: `/devops`  
**Duration**: 3 hours  
**Success Criteria**:
```yaml
✅ GitHub Actions workflow created
✅ All checks pass locally (lint, type-check, test, build)
✅ Vercel auto-deploys staging on `feature/code-gen-claude` push
✅ Vercel auto-deploys production on `main` push
✅ PR requires all checks to pass before merge
```

---

### 1.5 Backup & Recovery Strategy

**Task**: Define backup policy and test recovery

**Subtasks**:
- [ ] Document backup sources:
  - GitHub repo (code) — automatic, public
  - Neon automatic backups (daily in paid, weekly in free)
  - Manual Neon snapshots before major changes
- [ ] Create runbook: "Restore from database backup"
  - Scenario: database corruption
  - Steps: create new Neon branch, restore from snapshot, test migration
  - Time estimate: 30 min
- [ ] Create runbook: "Rollback deployment"
  - Scenario: buggy deploy
  - Steps: revert commit, push, Vercel auto-redeploys
  - Time estimate: 5 min
- [ ] Test both runbooks end-to-end on staging

**Owner**: `/devops`  
**Duration**: 4 hours  
**Output**: Two runbooks stored in `docs/runbooks/`

---

## Phase 2: Staging (July 1 – August 31)

### 2.1 Staging Deployment

**Task**: Deploy to staging environment for user acceptance testing

**Subtasks**:
- [ ] Create staging branch: `git checkout -b staging && git push origin staging`
- [ ] Configure Vercel preview deployments for `staging` branch
- [ ] Set `NEXTAUTH_URL=https://vivah-staging.vercel.app`
- [ ] Deploy to staging: `git push origin staging`
- [ ] Seed staging database with test data: `npx prisma db seed --environment staging`
- [ ] Create test wedding record with sample guests/vendors/events
- [ ] Share staging URL with `/ba` and `/cse` for UAT

**Owner**: `/devops` + `/ssde`  
**Duration**: 4 hours  
**Success Criteria**:
```
✅ https://vivah-staging.vercel.app is live and responsive
✅ Database has 100+ test records (guests, vendors, events)
✅ Sample wedding (Himanshu & Priyanka, Nov 25, Vadodara) is fully populated
✅ All users can log in with test credentials
```

---

### 2.2 Load Testing

**Task**: Verify performance under expected load

**Subtasks**:
- [ ] Estimate peak load:
  - Expected guests: 1000
  - Concurrent users during event: ~50
  - API requests per user session: ~100
  - Target response time: < 1 sec
  
- [ ] Use k6 or Apache JMeter:
  ```
  Virtual users: 50
  Ramp up: 2 minutes
  Duration: 10 minutes
  Endpoints: GET /api/guests, POST /api/check-in, GET /dashboard
  ```

- [ ] Run from 3 geographic locations:
  - India (simulate local)
  - US (baseline)
  - EU (faraway)

- [ ] Measure:
  - 95th percentile response time
  - Error rate (target: < 0.1%)
  - Database connection pool saturation
  - Neon query lag

- [ ] Document results in `docs/load-test-results/`

**Owner**: `/devops` + `/system-architect`  
**Duration**: 1 day  
**Success Criteria**:
```
✅ 50 concurrent users: response time < 2 sec
✅ Error rate < 0.1%
✅ Database CPU < 80%
✅ No connection pool exhaustion
```

**If test fails**:
- Identify bottleneck (DB, API, or frontend)
- Optimize query or add caching
- Re-run test
- Escalate to `/ssde` if code optimization needed

---

### 2.3 User Acceptance Testing (UAT)

**Task**: Validate features with stakeholders

**Subtasks**:
- [ ] Provide staging URL + test credentials to `/ba` and `/cse`
- [ ] `/cse` creates test plan:
  - Create a wedding
  - Add 50+ guests
  - Create events and check-ins
  - Export reports
  - Invite users and validate permissions
- [ ] `/ba` confirms acceptance criteria are met
- [ ] Document any bugs found → prioritize for Phase 1 bugfix
- [ ] Gather feedback on UX/performance/reliability

**Owner**: `/cse` + `/ba`  
**Duration**: 1 week (async, can happen during staging)  
**Output**: UAT sign-off email from `/ba`

---

### 2.4 Security Audit

**Task**: Perform security review before production

**Subtasks**:
- [ ] Code review for OWASP Top 10:
  - [ ] SQL injection (Prisma ORM prevents, but audit)
  - [ ] XSS (review Zod validation + React escaping)
  - [ ] CSRF (NextAuth provides protection)
  - [ ] Auth bypass (review NextAuth config)
  - [ ] Sensitive data exposure (no PII in logs)
  - [ ] Insecure dependencies: `npm audit`
- [ ] Environment security:
  - [ ] No secrets in code: `git log -p | grep -i secret`
  - [ ] GitHub branch protection enabled
  - [ ] Vercel OAuth scopes reviewed
  - [ ] Neon credentials rotated (if shared)
- [ ] Infrastructure:
  - [ ] HTTPS everywhere (Vercel/Neon enforce)
  - [ ] Database encryption at rest (Neon includes)
  - [ ] Firewall rules: only Vercel IPs can reach Neon (if possible)

**Owner**: `/devops` + SSDE  
**Duration**: 4 hours  
**Output**: Security checklist signed off

---

### 2.5 Disaster Recovery Drill

**Task**: Simulate failure and test recovery procedures

**Subtasks**:
- [ ] **Drill 1: Database down**
  - Disconnect Neon
  - Verify Vercel shows error page
  - Re-connect Neon
  - Verify app recovers in < 1 min
  - Time taken: record

- [ ] **Drill 2: Deployment failure**
  - Push a broken build to staging
  - Verify CI blocks merge
  - Fix code, push again
  - Verify re-deploy succeeds
  - Time taken: record

- [ ] **Drill 3: Credential leak**
  - Simulate accidental commit of DATABASE_URL
  - Rotate Neon password
  - Verify old connection fails
  - Update Vercel env vars
  - Verify app still works
  - Time taken: record

**Owner**: `/devops`  
**Duration**: 2 hours  
**Output**: DR drill report with timings

---

## Phase 3: Production (Sep 1 – Nov 25)

### 3.1 Production Deployment

**Task**: Deploy to production

**Subtasks**:
- [ ] Final pre-deployment checklist:
  - [ ] All tests passing: `npm run test:coverage`
  - [ ] Build succeeds: `npm run build`
  - [ ] No console errors: check Vercel build logs
  - [ ] Security audit passed
  - [ ] UAT sign-off received
  - [ ] `/pm` confirms feature freeze
  
- [ ] Merge `feature/code-gen-claude` → `main`
  ```bash
  git checkout main
  git pull origin main
  git merge feature/code-gen-claude
  git push origin main
  ```

- [ ] Vercel auto-deploys (watch Deployments tab)

- [ ] Run migrations on production:
  ```bash
  npx prisma migrate deploy
  ```

- [ ] Seed production data (one-time):
  ```bash
  npx prisma db seed
  ```

- [ ] Smoke test in browser:
  - [ ] Login works
  - [ ] Create wedding
  - [ ] Add guests
  - [ ] View dashboard
  - [ ] Export data

**Owner**: `/devops`  
**Duration**: 2 hours  
**Success Criteria**:
```
✅ https://vivah.vercel.app is live
✅ Database migrations applied
✅ Smoke tests pass
✅ Error rate 0% (first hour)
```

---

### 3.2 Monitoring & Alerts

**Task**: Set up observability

**Subtasks**:
- [ ] Vercel Analytics:
  - Enable Core Web Vitals tracking
  - Set up alerts for response time > 2 sec
  - Monitor bandwidth usage
  
- [ ] Neon Monitoring:
  - Set alert for storage > 400 MB
  - Set alert for active connections > 20
  - Check query performance dashboard daily

- [ ] Error Tracking (Sentry):
  - Create Sentry project
  - Add Sentry SDK to Next.js
  - Set up email alerts for errors
  - Create on-call rotation
  
- [ ] Uptime Monitoring (UptimeRobot):
  - Monitor https://vivah.vercel.app (every 5 min)
  - Alert on downtime
  - Create public status page

- [ ] Create dashboard:
  - Vercel Analytics
  - Neon monitoring
  - Sentry errors
  - UptimeRobot status

**Owner**: `/devops`  
**Duration**: 4 hours  
**Output**: Monitoring dashboard link + on-call runbook

---

### 3.3 Wedding Day Operations (Nov 25)

**Task**: Ensure system availability during wedding

**Subtasks**:
- [ ] On-call rotation established
  - 24/7 coverage Nov 25–26
  - Two people per shift
  - Contact numbers documented
  
- [ ] Incident response plan:
  - [ ] Runbook for common issues (cached below)
  - [ ] Escalation chain
  - [ ] Communication plan (Slack, email, SMS)
  
- [ ] Pre-wedding checklist (Nov 24 evening):
  - [ ] Database fully backed up
  - [ ] All migrations tested
  - [ ] Monitoring alerts active
  - [ ] On-call team briefed
  - [ ] Customer support template responses ready

- [ ] Post-mortem (Nov 26):
  - [ ] Document any incidents
  - [ ] Root cause analysis
  - [ ] Improvements for Phase 6 (SaaS)

**Owner**: `/devops` + `/cse`  
**Duration**: Continuous (Nov 25–26)

---

## Common Issues & Runbooks

### Issue: Database Connection Timeout

**Symptoms**: "Error: getaddrinfo ENOTFOUND ep-xxx.us-east-1.neon.tech"

**Resolution** (5 min):
1. Verify Neon project status: https://console.neon.tech
2. Check Vercel deployment logs for `DATABASE_URL` variable
3. If var missing: add to Vercel dashboard → redeploy
4. If Neon down: switch to staging database temporarily
5. Notify `/devops`

---

### Issue: Build Failure

**Symptoms**: "Build failed" in Vercel Deployments tab

**Resolution** (10 min):
1. Click build log → scroll to error message
2. Common causes:
   - TypeScript error: `npm run type-check` locally, fix, commit
   - Missing env var: add to Vercel dashboard
   - Dependency conflict: run `npm install` locally, commit lock file
3. Fix locally, commit, push to `main`
4. Vercel auto-retries (should succeed)

---

### Issue: Slow Page Load (> 3 sec)

**Symptoms**: Users report delays; Vercel shows high response time

**Resolution** (15 min):
1. Check Vercel Analytics → identify slow endpoint
2. Check Neon monitoring → is DB slow?
3. If DB slow:
   - Check active connections (max 20 in free tier)
   - Look for slow queries in Neon dashboard
   - Optimize query or add index
   - Test: `EXPLAIN ANALYZE <query>` in Neon SQL editor
4. If API slow:
   - Check Vercel function logs for bottleneck
   - Add caching headers for static responses
   - Use edge functions for geo-optimization
5. Report to `/ssde` for code optimization

---

### Issue: Data Loss / Corruption

**Symptoms**: Missing records; inconsistent data

**Resolution** (Immediate):
1. **STOP**: Do not run any mutations (POST/PUT/DELETE)
2. Check Neon snapshot history
3. Choose most recent healthy snapshot
4. Create new branch from snapshot
5. Test query to confirm data integrity
6. If OK: point `DATABASE_URL` to new branch
7. Vercel redeploy automatically
8. Communicate to users about data state

---

## Success Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Uptime | 99.5% | TBD | ⏳ |
| Page load time (p95) | < 2 sec | TBD | ⏳ |
| Error rate | < 0.1% | TBD | ⏳ |
| Database response time (p95) | < 100 ms | TBD | ⏳ |
| User capacity | 1000 concurrent | TBD | ⏳ |
| Cost | ₹0–500/mo | TBD | ⏳ |

---

## Dependencies & Blockers

| Blocker | Severity | Status | Resolution |
|---------|----------|--------|------------|
| Schema freeze from `/system-architect` | High | ⏳ Pending | SSDT delivers final schema |
| Security audit sign-off | High | ⏳ Pending | `/devops` completes audit |
| UAT sign-off from `/ba` | High | ⏳ Pending | Staging live, users test |
| Vercel domain setup | Medium | ⏳ Pending | After Sep 1 |
| Load test results | Medium | ⏳ Pending | Jul 15 |

---

## Communication Plan

### Stakeholders

| Role | Notification | Channel | Frequency |
|------|--------------|---------|-----------|
| `/pm` | Weekly status | Slack | Every Mon |
| `/ba` | UAT results | Email | When complete |
| `/devops` | Incidents | PagerDuty | As needed |
| Wedding party | Go-live announce | Email + WhatsApp | Nov 24 |

### Status Reports

- **Weekly** (Mon 10 AM): Sprint update with metrics
- **Pre-deployment** (Sep 1): Readiness sign-off
- **Post-go-live** (Nov 26): Incident report + learnings

---

## Sign-Offs

| Role | Sign-off | Date | Notes |
|------|----------|------|-------|
| `/devops` | Infrastructure ready | TBD | |
| `/system-architect` | Schema frozen | TBD | |
| `/ssde` | Code ready for prod | TBD | |
| `/ba` | UAT passed | TBD | |
| `/pm` | Go-live approved | TBD | |

---

## Appendix: Cost Breakdown

### Phase 1–2 (Jun–Aug): $0

- Vercel: Free tier
- Neon: Free tier (512 MB storage)
- GitHub: Free tier
- Total: **₹0**

### Phase 3 (Sep–Nov): $0–500

- Estimated MAU: 100–500 (family & friends)
- Vercel bandwidth: < 5 GB/mo (free)
- Neon storage: < 512 MB (free)
- If upgrade needed: Neon $19/mo
- Total: **₹0–1200**

### Post-Wedding (SaaS Phase): $50–500/mo

- Vercel Pro: $20/mo
- Neon Standard: $19/mo
- Domain + email: $10–20/mo
- Sentry: $29/mo
- Total: **₹2000–5000/mo for 100K users**

---

## References

- [DEPLOYMENT.md](./DEPLOYMENT.md) — Detailed technical guide
- [Vercel Docs](https://vercel.com/docs)
- [Neon Docs](https://neon.tech/docs)
- [Prisma Deployment](https://www.prisma.io/docs/orm/deployment/deployment)
- [Next.js Production Checklist](https://nextjs.org/docs/production-checklist)

---

**Plan Owner**: `/devops` agent  
**Last Updated**: 2026-05-31  
**Next Review**: 2026-06-15 (phase kickoff)
