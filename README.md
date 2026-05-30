# Vivah

Vivah is a vanilla HTML, CSS, and JavaScript wedding operating system for a traditional Bihari wedding hosted in Vadodara, Gujarat.

## Phase 1 Scope

- Responsive navigation framework
- Executive dashboard with countdown, budget, guest, vendor, and event metrics
- Guest management with side, city, RSVP, accommodation, and pickup tracking
- Vendor management with payment and status tracking
- Finance module with budget categories, utilization, paid amount, remaining amount, and expenses
- Wedding function timeline and task Kanban starter
- JSON-backed module data under `data/`

## Phase 2 Scope

- Accommodation planner with property inventory and room allocation views
- Travel management with transport, PNR, pickup, vehicle, coordinator, and status fields
- Ritual planner for Bihari wedding ceremony preparation
- Family responsibility matrix with owner, backup, deadline, priority, and status tracking
- Empty production-ready JSON stores with dummy records removed

## Project Structure

```text
assets/
  css/styles.css
  js/app.js
data/
  accommodation/room-allocations.json
  events/events.json
  finance/budget.json
  finance/expenses.json
  guests/bride-guests.json
  guests/groom-guests.json
  hotels/hotels.json
  responsibilities/responsibilities.json
  rituals/rituals.json
  tasks/tasks.json
  travel/travel.json
  vendors/vendors.json
pages/
  dashboard/
  guests/
  vendors/
  finance/
  ...
index.html
```

## Run Locally

Because the app loads JSON with `fetch`, serve the folder with a local web server:

```powershell
node dev-server.mjs
```

Then open:

```text
http://localhost:8080
```

## Data Policy

The repository currently contains empty JSON arrays instead of fictional dummy records. Add real planning data directly to the relevant files under `data/`.

## Next Phase

Phase 3 should add reports, the wedding command center, alerts and notifications, QR check-in, and WhatsApp message workflows.
