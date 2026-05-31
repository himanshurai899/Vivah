# Vivah Deployment Guide — Free Alternatives

**Project**: Vivah (Next.js 15 + React 19 + PostgreSQL + Prisma)  
**Target Date**: November 25, 2026  
**Status**: Phase 5 (active development on `feature/code-gen-claude`)

---

## Executive Summary

**Recommended Stack** (Best Value + Reliability):
- **Frontend**: Vercel (creators of Next.js, serverless, unlimited free projects)
- **Database**: Neon (PostgreSQL serverless, free tier 512 MB storage)
- **Auth**: NextAuth.js v5 (built-in, free, self-hosted)
- **Analytics**: Vercel Analytics (free tier included)
- **CDN**: Vercel Edge Functions (free)
- **Backups**: GitHub (automatic, free)

**Estimated Monthly Cost at Scale**: ₹0–500 (stays free for ~500 monthly active users)

---

## Option 1: Vercel + Neon (⭐ Recommended)

### Why This Stack?

| Criterion | Vercel + Neon | Why |
|-----------|---------------|-----|
| **Setup Time** | 5 min | Both have one-click GitHub integration |
| **Performance** | Excellent | Vercel is optimized for Next.js; Neon is auto-scaling PostgreSQL |
| **Free Tier** | Very generous | Vercel: unlimited projects + edge functions; Neon: 512 MB storage + 3 branches |
| **Scaling** | Seamless | Auto-scales without intervention |
| **India Latency** | ~200–300ms | US-based, but global CDN helps |
| **Support** | Good docs | Best Next.js documentation; active community |
| **Authentication** | NextAuth.js native | Works perfectly with Vercel |

### Free Tier Limits

**Vercel Free**:
- ✅ Unlimited projects
- ✅ Unlimited serverless functions
- ✅ 100 GB bandwidth/month
- ✅ 5 GB blob storage
- ✅ Unlimited edge functions
- ❌ No SLA (best effort)
- ❌ 1 concurrent build

**Neon Free**:
- ✅ 512 MB storage
- ✅ Shared compute (auto-suspend after 5 min inactivity)
- ✅ 3 branch environments (main + 2 feature branches)
- ✅ 100 GB egress/month
- ❌ 1 read replica
- ❌ No auto-backup (but GitHub is your backup)

### Deployment Steps

#### 1. Prepare the Repository

```bash
# Ensure all changes are committed
git status
git add .
git commit -m "Ready for production deployment"

# Create a production branch
git checkout -b main
git push -u origin main
```

#### 2. Create Neon Database

1. Go to [neon.tech](https://neon.tech) → Sign up with GitHub
2. Create a new project (name: `vivah-production`)
3. Save the connection string:
   ```
   postgresql://user:password@ep-xxx.us-east-1.neon.tech/vivah?sslmode=require
   ```
4. Copy this string — you'll need it for Vercel

#### 3. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → Sign up/Login with GitHub
2. Click **Add New → Project**
3. Select the `vivah` repository
4. In **Environment Variables**, add:
   ```
   DATABASE_URL=postgresql://user:password@ep-xxx.us-east-1.neon.tech/vivah?sslmode=require
   NEXTAUTH_SECRET=<generate-a-random-32-char-string>
   NEXTAUTH_URL=https://vivah-production.vercel.app
   ```
5. Click **Deploy**

#### 4. Run Prisma Migrations on Production

After the first deploy, run migrations:

```bash
# Option A: Use Vercel CLI
npm install -g vercel
vercel env pull  # Downloads .env.local from Vercel

# Run migration in local environment with production DB
npx prisma migrate deploy

# Option B: Use Vercel Dashboard
# Go to Deployments → View Logs
# If migrations fail, you'll see errors here
```

#### 5. Seed Initial Data (One-time)

```bash
npx prisma db seed
# Or use server-side seeding if you add a /api/seed endpoint
```

#### 6. Configure Custom Domain (Optional)

1. In Vercel Dashboard → **Domains** → **Add Domain**
2. Add your custom domain (e.g., `vivah.example.com`)
3. Update DNS records per Vercel instructions
4. Update `NEXTAUTH_URL` in Vercel env vars

### Monitoring & Maintenance

- **Logs**: Vercel Dashboard → Deployments → Logs
- **Database**: Neon Dashboard → Monitoring tab (CPU, connections, storage)
- **Errors**: Vercel → Function Logs (serverless errors)
- **Analytics**: Vercel Analytics tab (free tier shows page views + response times)

### When to Upgrade

| Metric | Free Tier | Pro Tier (₹500/mo) | Signal to Upgrade |
|--------|-----------|-------------------|-------------------|
| Storage | 512 MB | 1 TB (Neon Pro) | When you hit 400 MB |
| Concurrent Functions | 1 | 12 | When you get timeout errors |
| Bandwidth | 100 GB/mo | Unlimited | After 80 GB/mo usage |
| Compute | Shared | Dedicated | If pages feel slow after 6 months |

---

## Option 2: Railway (Alternative All-in-One)

### Why Railway?

**Pros**:
- All-in-one: app + database + Redis on one dashboard
- ₹5 credit/month free tier (roughly 400 hours)
- Better India ping time (~150ms) than US-based providers
- Built-in GitHub auto-deploy
- Easy database snapshots

**Cons**:
- Credit expires monthly (you need to stay under ₹400/mo to stay free)
- Not optimized for Next.js (slightly slower cold starts)
- Smaller ecosystem than Vercel

### Deployment

1. Go to [railway.app](https://railway.app) → GitHub sign-up
2. **New Project** → **Deploy from GitHub**
3. Select `vivah` repo
4. Click **Add PostgreSQL** service
5. Set environment variables:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   NEXTAUTH_SECRET=<random-32-char-string>
   NEXTAUTH_URL=https://<railway-domain>.up.railway.app
   ```
6. Deploy → Logs will show build progress
7. After deploy: `npx prisma migrate deploy`

### Cost Tracking

Railway shows resource usage in real-time. **Alert at 90% of ₹5 credit.**

---

## Option 3: Render (Free Tier with Limitations)

### Why Render?

**Pros**:
- Genuinely free (for first 5 services)
- Auto-deploy from GitHub
- SSL included
- Postgres 16 included

**Cons**:
- ⚠️ **Spins down after 15 min inactivity** (slow first request)
- ⚠️ Limited to 5 free services total
- Smaller free compute (0.5 vCPU)

### Deployment

1. [render.com](https://render.com) → GitHub sign-up
2. **New → Web Service** → Select repo
3. Publish branch: `main`
4. Build: `npm run build`
5. Start: `npm run start`
6. Add environment variables (same as above)
7. **New → PostgreSQL** → Name: `vivah-db`
8. Connect the database
9. Deploy

### Note on Spin-Down

Every request after 15 minutes inactivity will take 10–15 seconds to respond (service wakes up). Not suitable for critical paths.

---

## Option 4: Fly.io (For Distributed Performance)

### Why Fly.io?

**Pros**:
- Distributed globally (including Mumbai & Delhi regions)
- Fast India latency (~50ms)
- Generous free tier (3 shared-cpu-1x-256MB VMs)
- Built for microservices

**Cons**:
- PostgreSQL requires paid tier (expensive)
- Steeper learning curve
- CLI-first deployment model

### Deployment

Use Neon database with Fly.io app:

```bash
# Install Fly CLI
brew install flyctl  # or curl https://fly.io/install.sh | sh

# Login and create app
flyctl auth login
flyctl launch --name vivah-prod

# Configure Fly.toml
# Set DATABASE_URL=<neon-connection-string>

# Deploy
flyctl deploy

# View logs
flyctl logs
```

### Choose Mumbai Region for Low Latency

```bash
flyctl regions set maa  # Mumbai
flyctl deploy
```

---

## Option 5: Heroku (Not Recommended — Free Tier Removed)

⚠️ **Heroku discontinued free dynos in November 2022.** Minimum cost is $7/month. Skip this option.

---

## Comparison Matrix

| Provider | App | DB | Cost | Setup | Latency (India) | Best For |
|----------|-----|----|----|-------|-----------------|----------|
| **Vercel + Neon** ⭐ | ✅ Free | ✅ Free | ₹0–200 | 10 min | 200ms | Production, reliability, scale |
| **Railway** | ✅ Free | ✅ Free | ₹0–500 | 8 min | 150ms | All-in-one, simple ops |
| **Render** | ✅ Free | ✅ Free | ₹0 | 10 min | 200ms | Testing, non-critical |
| **Fly.io + Neon** | ✅ Free | ✅ Free | ₹0–300 | 15 min | 50ms ⚡ | Ultra-low latency (future) |

---

## Pre-Deployment Checklist

- [ ] All code committed and pushed to `main` branch
- [ ] Environment variables documented in `.env.example`
- [ ] Database schema finalized (no pending migrations)
- [ ] Tests passing: `npm run test:coverage`
- [ ] Build succeeds locally: `npm run build`
- [ ] `.env.local` is in `.gitignore` (never commit secrets)
- [ ] `DATABASE_URL` provider changed from SQLite to PostgreSQL in `prisma/schema.prisma`
- [ ] NEXTAUTH_SECRET generated (use `openssl rand -base64 32`)
- [ ] NEXTAUTH callbacks reviewed for production
- [ ] CORS headers configured if API exposed externally

---

## Post-Deployment Steps

### 1. Database Setup

```bash
# After deployment, run in local terminal with production DATABASE_URL
npx prisma migrate deploy

# Seed production database (do this ONCE)
npx prisma db seed

# Verify schema synced
npx prisma db validate
```

### 2. Enable HTTPS Everywhere

- Vercel: Automatic (always on)
- Railway: Automatic (always on)
- Render: Automatic (always on)
- Fly.io: Automatic (always on)

### 3. Set Up Monitoring

**Vercel**:
- Go to **Settings → Observability**
- Enable Web Vitals (free)
- Enable Error Reporting (free)

**Neon**:
- Go to **Monitoring**
- Set up email alerts for storage > 400 MB

### 4. Configure Automated Backups

**GitHub** (free, built-in):
```bash
git push origin main  # Every deployment backed up
```

**Neon Snapshots** (free):
- Dashboard → **Snapshots** → Create snapshot before major changes

---

## Scaling Path (When You Exceed Free Tier)

### At ₹500/month (estimated 2000 MAU):

**Upgrade Strategy**:
1. **Neon**: $19/mo (dedicated compute + 10 GB storage)
2. **Vercel**: Stay free (handles unlimited projects)
3. **NextAuth**: Still free (self-hosted)

**Total**: ₹1500/month for 2000 MAU

### At ₹2000+/month (10K+ MAU):

Consider professional tier:
- **Neon**: $19/mo
- **Vercel**: $20/mo (Pro) for better builds
- **Custom domain + email**: ₹500/mo
- **Analytics**: ₹300/mo

---

## Disaster Recovery Plan

### Database Loss Scenario

**If Neon goes down:**
1. GitHub has full code backup
2. Neon auto-backups daily (in paid plan) / weekly (free)
3. Switch to Railway PostgreSQL (15 min, new URL)
4. Update `DATABASE_URL` in Vercel
5. Redeploy

### Application Down Scenario

**If Vercel build fails:**
1. Logs show error in Deployments tab
2. Fix code locally, push to `main`
3. Vercel auto-redeploys
4. Rollback to previous commit if urgent: `git revert HEAD && git push`

---

## Environment Variables Template

Create `.env.example` in repo:

```bash
# Database (Neon)
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-1.neon.tech/vivah?sslmode=require

# NextAuth
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=https://vivah-production.vercel.app

# Email (optional, for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=app-specific-password

# Analytics (optional)
VERCEL_ANALYTICS_ID=<from-vercel-dashboard>

# Feature Flags (optional)
NEXT_PUBLIC_FEATURE_PHONE_OTP=true
NEXT_PUBLIC_FEATURE_WHATSAPP_INTEGRATION=false
```

---

## Recommended Monitoring Tools (Free)

| Tool | Purpose | Free Tier | Setup |
|------|---------|-----------|-------|
| **Vercel Analytics** | Page performance | ✅ Included | Built-in |
| **UptimeRobot** | Uptime monitoring | ✅ 50 monitors | uptimerobot.com |
| **Sentry** | Error tracking | ✅ 5K errors/mo | sentry.io |
| **LogRocket** | Session replay (optional) | ✅ 1K sessions/mo | logrocket.com |

---

## Estimated Timeline

| Task | Effort | Duration |
|------|--------|----------|
| Set up Neon | 5 min | Now |
| Deploy to Vercel | 5 min | Now |
| Run migrations | 2 min | Now |
| Test in prod | 30 min | Now |
| Configure custom domain | 15 min | By Nov 15 |
| Set up monitoring | 10 min | By Nov 15 |
| Load testing | 1 hour | By Nov 20 |
| **Total** | **~2 hours** | **Ready by Nov 24** |

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Neon Docs**: https://neon.tech/docs
- **Prisma + Neon**: https://www.prisma.io/docs/orm/reference/connection-urls#postgresql
- **NextAuth.js**: https://next-auth.js.org
- **Next.js Deployment**: https://nextjs.org/docs/deployment

---

## Contact & Questions

- For deployment issues: Tag `@devops` agent
- For database schema issues: Tag `@system-architect` agent
- For performance issues: Use `/verify` to test in browser

---

**Last Updated**: 2026-05-31  
**Next Review**: 2026-09-01 (3 months before wedding)
