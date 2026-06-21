---
name: run-local
description: "Deploy or redeploy the Vivah app locally. Checks if already running, stops it (node process OR Docker containers), then rebuilds and restarts. Two modes: dev (npm run dev + SQLite, fast) or docker (docker compose --build + PostgreSQL, production-like). Triggers: 'host locally', 'run locally', 'start dev server', 'restart dev server', 'rehost', 'start the app', 'run the app', 'deploy', 'redeploy'."
---
# Run Local — Vivah Deploy / Redeploy

Smart deploy skill: checks what is running, tears it down, then rebuilds and starts fresh.

## When to Use

Triggers on any of:
- "host locally" / "host the project"
- "run locally" / "run the app" / "start the app"
- "start dev server" / "restart dev server"
- "rehost" / "rehost the project"
- "deploy" / "redeploy"

---

## Step 0 — Determine Mode

Ask the user (or infer from context) which mode they want:

| Mode | Command | DB | Speed | Use when |
|------|---------|-----|-------|----------|
| **dev** | `npm run dev` | SQLite (`prisma/dev.db`) | Fast (~6s) | Active development, hot-reload needed |
| **docker** | `docker compose up --build` | PostgreSQL 16 | Slower (~60-120s build) | Production-like testing, full stack |

If the user says "dev server" or "development" → **dev mode**.
If the user says "Docker", "container", "rebuild image", or "production" → **docker mode**.
Default when ambiguous → **dev mode**.

---

## Step 1 — Detect and Tear Down What Is Running

Run both checks in parallel, then tear down what is found.

### 1a. Check port 3000

```powershell
$portInUse = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($portInUse) { "Port 3000 is occupied" } else { "Port 3000 is free" }
```

### 1b. Check for running Docker containers

```powershell
$dockerRunning = docker compose -f "c:\Himanshu\Projects\Vivah\docker-compose.yml" ps --services --filter "status=running" 2>$null
if ($dockerRunning) { "Docker containers running: $dockerRunning" } else { "No Docker containers running" }
```

### 1c. Tear down based on findings

**If Docker containers are running:**
```powershell
docker compose -f "c:\Himanshu\Projects\Vivah\docker-compose.yml" down
```

**If node process is running (dev server):**
```powershell
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
```

**If port still occupied after above (orphan process):**
```powershell
$pid = (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue).OwningProcess | Select-Object -First 1
if ($pid) { Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue }
Start-Sleep -Seconds 2
```

---

## Step 2 — Build and Deploy

### Dev Mode

```powershell
$nodeExe = "C:\Program Files\nodejs\node.exe"
$npmCli  = "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js"

Start-Process `
  -FilePath $nodeExe `
  -ArgumentList "`"$npmCli`"", "run", "dev" `
  -WorkingDirectory "c:\Himanshu\Projects\Vivah" `
  -RedirectStandardOutput "$env:TEMP\vivah-dev-out.txt" `
  -RedirectStandardError  "$env:TEMP\vivah-dev-err.txt" `
  -WindowStyle Hidden

Start-Sleep -Seconds 15
Get-Content "$env:TEMP\vivah-dev-out.txt"
Get-Content "$env:TEMP\vivah-dev-err.txt" -ErrorAction SilentlyContinue
```

Look for `✓ Ready in` in output. Ready in ~6s.

### Docker Mode

```powershell
Set-Location "c:\Himanshu\Projects\Vivah"

# Rebuild image and start all services (app + postgres + pgadmin) detached
docker compose up --build -d

# Stream logs until app is healthy
docker compose logs -f app
```

Wait until you see `✓ Ready` or the health check passes (`healthy` status):

```powershell
# Poll until app container is healthy (max 3 min)
$deadline = (Get-Date).AddMinutes(3)
do {
  Start-Sleep -Seconds 5
  $status = docker inspect --format "{{.State.Health.Status}}" vivah-app 2>$null
  Write-Host "vivah-app health: $status"
} while ($status -ne "healthy" -and (Get-Date) -lt $deadline)
```

---

## Step 3 — Verify and Open

```powershell
try {
  $r = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -ErrorAction Stop
  "HTTP $($r.StatusCode) — app is up"
} catch {
  "WARNING: Could not reach localhost:3000 — check logs"
}

Start-Process "http://localhost:3000"
```

---

## Step 4 — Report to User

**Dev mode success:**
> Dev server restarted — **http://localhost:3000** is live (SQLite, hot-reload active).

**Docker mode success:**
> Docker deploy complete:
> - App: http://localhost:3000
> - pgAdmin: http://localhost:5050 (admin@vivah.local / admin)
> - DB: PostgreSQL 16 (`vivah-postgres`)

If unhealthy, show the last 20 lines of `docker compose logs app`.

---

## Reference

| Item | Value |
|------|-------|
| Working dir | `c:\Himanshu\Projects\Vivah` |
| Port | 3000 |
| Dev DB | SQLite — `prisma/dev.db` |
| Docker DB | PostgreSQL 16 — `vivah-postgres:5432` |
| Compose file | `docker-compose.yml` |
| Container name | `vivah-app` |
| pgAdmin | http://localhost:5050 |
| Node exe | `C:\Program Files\nodejs\node.exe` |
| npm-cli | `C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js` |
| Dev log out | `%TEMP%\vivah-dev-out.txt` |
| Dev log err | `%TEMP%\vivah-dev-err.txt` |

## Why node.exe directly (not npm)

On this machine `npm` resolves to `npm.ps1` (PowerShell script) which cannot
be backgrounded via `Start-Process -FilePath`. Always call `node.exe` with the
npm-cli path instead. Docker mode uses the `docker` CLI which has no such issue.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Port 3000 still in use after kill | Run Step 1c orphan-kill block |
| Docker build fails | Check `docker compose logs app`; ensure Docker Desktop is running |
| `MODULE_NOT_FOUND` (dev) | Ensure `$npmCli` path is backtick-quoted in ArgumentList |
| Prisma DB errors (dev) | Run `node "$npmCli" run db:push` in working dir |
| Prisma DB errors (docker) | `docker compose exec app npx prisma migrate deploy` |
| pgAdmin blank (docker) | Wait 30s after postgres becomes healthy before accessing :5050 |
