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
| **dev** | `npm run dev` + postgres container | PostgreSQL 16 (Docker container) | Fast hot-reload | Active development, hot-reload needed |
| **docker** | `docker compose up --build` | PostgreSQL 16 | Slower (~60-120s build) | Production-like testing, full stack |

If the user says "dev server" or "development" → **dev mode**.
If the user says "Docker", "container", "rebuild image", or "production" → **docker mode**.
Default when ambiguous → **dev mode**.

---

## Step 1 — Ensure Docker Desktop is Running

Both dev and docker modes require Docker. Check and start Docker Desktop if needed.

```powershell
$dockerReady = docker info 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Docker Desktop not running — starting it..."
  Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" -ErrorAction SilentlyContinue
  $deadline = (Get-Date).AddSeconds(90)
  do {
    Start-Sleep -Seconds 5
    docker info 2>$null | Out-Null
    Write-Host "Waiting for Docker daemon... $((Get-Date).ToString('HH:mm:ss'))"
  } while ($LASTEXITCODE -ne 0 -and (Get-Date) -lt $deadline)
  if ($LASTEXITCODE -ne 0) { throw "Docker Desktop did not start in time — please start it manually." }
  Write-Host "Docker is ready."
}
```

---

## Step 2 — Detect and Tear Down What Is Running

Run both checks in parallel, then tear down what is found.

### 2a. Check port 3000

```powershell
$portInUse = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($portInUse) { "Port 3000 is occupied" } else { "Port 3000 is free" }
```

### 2b. Check for running Docker containers

```powershell
$dockerRunning = docker compose -f "c:\Himanshu\Projects\Vivah\docker-compose.yml" ps --services --filter "status=running" 2>$null
if ($dockerRunning) { "Docker containers running: $dockerRunning" } else { "No Docker containers running" }
```

### 2c. Tear down based on findings

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

### 2d. Prune unused Docker images to reclaim disk space

After tearing down containers (or if nothing was running), prune dangling images:

```powershell
Write-Host "Pruning dangling Docker images..."
docker image prune -f
```

For a deeper clean (removes ALL unused images, not just dangling), use:

```powershell
# Use only when doing a full rebuild or explicitly asked to free disk space
docker image prune -a -f
```

---

## Step 3 — Build and Deploy

### Dev Mode

Dev mode uses the `npm run dev` hot-reload server + the **postgres Docker container** (the app container is not started). The Prisma schema uses the `postgresql` provider — SQLite is not used.

**3a. Start the postgres container (if not already healthy):**

```powershell
$pgStatus = docker inspect --format "{{.State.Health.Status}}" vivah-postgres 2>$null
if ($pgStatus -ne "healthy") {
  docker compose -f "c:\Himanshu\Projects\Vivah\docker-compose.yml" up -d postgres
  $deadline = (Get-Date).AddSeconds(30)
  do {
    Start-Sleep -Seconds 3
    $pgStatus = docker inspect --format "{{.State.Health.Status}}" vivah-postgres 2>$null
    Write-Host "vivah-postgres: $pgStatus"
  } while ($pgStatus -ne "healthy" -and (Get-Date) -lt $deadline)
}
```

**3b. Sync Prisma schema (if needed):**

```powershell
$nodeExe = "C:\Program Files\nodejs\node.exe"
$npmCli  = "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js"
& $nodeExe $npmCli run db:push 2>&1
```

**3c. Start the Next.js dev server:**

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

Look for `✓ Ready in` in output. Ready in ~6–15s.

After "Ready", confirm the app is serving by tailing the log for a first `GET / 200` entry rather than using `Invoke-WebRequest` (which can time out on first compile).

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

## Step 4 — Verify and Open

For dev mode, confirm the app is up by tailing the log for a first successful request rather than using `Invoke-WebRequest` (which times out on the first cold compile):

```powershell
# Wait for first successful page request in dev logs (up to 60s)
$deadline = (Get-Date).AddSeconds(60)
do {
  Start-Sleep -Seconds 3
  $log = Get-Content "$env:TEMP\vivah-dev-out.txt" -ErrorAction SilentlyContinue
  $ok  = $log | Where-Object { $_ -match "GET / 200" }
} while (-not $ok -and (Get-Date) -lt $deadline)

if ($ok) { "App is up — GET / 200 confirmed" }
else      { "WARNING: No 200 response seen yet — check $env:TEMP\vivah-dev-out.txt" }

Start-Process "http://localhost:3000"
```

For Docker mode, use `Invoke-WebRequest` after the health-check passes:

```powershell
try {
  $r = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 10 -ErrorAction Stop
  "HTTP $($r.StatusCode) — app is up"
} catch {
  "WARNING: Could not reach localhost:3000 — check logs"
}
Start-Process "http://localhost:3000"
```

---

## Step 5 — Report to User

**Dev mode success:**
> Dev server restarted — **http://localhost:3000** is live (PostgreSQL via Docker, hot-reload active).

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
| Dev DB | PostgreSQL 16 via Docker — `vivah-postgres:5432` |
| Docker DB | PostgreSQL 16 — `vivah-postgres:5432` |
| Compose file | `docker-compose.yml` |
| App container | `vivah-app` |
| DB container | `vivah-postgres` |
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
| Port 3000 still in use after kill | Run Step 2c orphan-kill block |
| Docker build fails | Check `docker compose logs app`; ensure Docker Desktop is running |
| Docker Desktop not running | Step 1 starts it automatically; or launch manually from Start Menu |
| `MODULE_NOT_FOUND` (dev) | Ensure `$npmCli` path is backtick-quoted in ArgumentList |
| Prisma DB errors (dev) | Run `node "$npmCli" run db:push` in working dir |
| Prisma DB errors (docker) | `docker compose exec app npx prisma migrate deploy` |
| pgAdmin blank (docker) | Wait 30s after postgres becomes healthy before accessing :5050 |
| Disk space low | Run `docker image prune -a -f` to remove all unused images |
| First `GET /` times out in dev | Normal — Next.js cold-compiles on first request; wait for `GET / 200` in log |
