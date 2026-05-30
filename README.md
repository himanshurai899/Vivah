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
- Invitation builder with section-based content and full CRUD route support
- Top navigation replaces the left sidebar and supports grouped category navigation
- Improved animated nav item styling and hover interactions
- Traditional Bihari wedding starter data for functions, rituals, budget, vendors, travel, accommodation, alerts, and messages
- All pages now support CRUD operations through the shared app framework

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

The repository includes starter data for a traditional Bihari wedding. CRUD operations save back to the matching JSON files under `data/` when the app is served through `node dev-server.mjs`.

Guest records are split by side:

- Groom side records save to `data/guests/groom-guests.json`
- Bride side records save to `data/guests/bride-guests.json`

## Next Phase

Phase 3 development has started. The next work items are:

- Reports and print-friendly report layouts for budget, guest, vendor, accommodation, and travel data
- Wedding command center with live event progress, vendor arrival status, guest arrival tracking, and unresolved action items
- Alerts and reminders for budget overruns, vendor payments, room shortages, pickups, overdue rituals, and open responsibilities
- QR check-in workflow with guest attendance tracking and exportable logs
- WhatsApp message workflows for invitations, RSVP follow-ups, hotel details, pickup reminders, and schedule notifications
