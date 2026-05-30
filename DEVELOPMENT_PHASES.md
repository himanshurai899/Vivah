# Vivah Development Phases

The prompt describes a wedding operating system large enough to be developed in focused phases. Phase 1 is implemented as the current foundation, while later phases build dedicated operating modules on top of the same vanilla HTML, CSS, JavaScript, and JSON data architecture.

## Phase 1 - Core Foundation

Status: Completed

Completed deliverables:

- Responsive application shell with sidebar navigation and top action bar.
- Dashboard with wedding countdown, budget totals, guest totals, finalized vendor count, alerts, and visual distribution bars.
- Guest Management module with groom-side and bride-side JSON data, RSVP tracking, city filtering, search, accommodation needs, and pickup needs.
- Vendor Management module with vendor status filtering, quotations, final amounts, advance paid, balance due, contacts, and notes.
- Finance Module with planned budget, actual cost, paid amount, remaining amount, category utilization, and recent expense tracking.
- Wedding Functions starter view with event timeline, coordinators, venues, budgets, and checklists.
- Task Kanban starter for pending, in-progress, completed, and blocked work.
- CSV export for the active module.
- Theme toggle for wedding visual variations.
- Node-based static development server for local preview.
- JSON data stores for guests, vendors, finance, expenses, events, and tasks. Dummy records have been removed.
- README updated with project structure and run instructions.

Current Phase 1 files:

- `index.html`
- `assets/css/styles.css`
- `assets/js/app.js`
- `dev-server.mjs`
- `data/guests/groom-guests.json`
- `data/guests/bride-guests.json`
- `data/vendors/vendors.json`
- `data/finance/budget.json`
- `data/finance/expenses.json`
- `data/events/events.json`
- `data/tasks/tasks.json`

## Phase 2 - Wedding Operations

Status: Completed foundation

Goal: Add day-to-day wedding operations modules that help the family manage guest movement, stay arrangements, rituals, and ownership.

Completed deliverables:

- Accommodation Planner
  - Navigation route added.
  - Property inventory view added for hotels, guest houses, and relative homes.
  - Room allocation view added.
  - Summary cards added for properties, rooms available, rooms allocated, and guests assigned.
  - Empty states added for production data entry.

- Travel Management
  - Navigation route added.
  - Travel table added for flight, train, bus, and cab records.
  - PNR, arrival time, pickup coordinator, vehicle number, pickup requirement, and status fields supported.
  - Status filtering added.
  - Summary cards added for travel records, pickups, confirmed records, and pending records.

- Ritual Planner
  - Navigation route added.
  - Ritual list view added for Bihari wedding ceremony planning.
  - Required items, responsible person, budget, description, and status fields supported.
  - Status filtering added.
  - Summary cards added for ritual count, completed rituals, in-progress rituals, and ritual budget.

- Family Responsibility Matrix
  - Navigation route added.
  - Responsibility matrix table added.
  - Task, owner, backup person, deadline, priority, and status fields supported.
  - Status filtering added.
  - Summary cards added for total responsibilities, open items, blocked items, and owner count.

Completed data files:

- `data/hotels/hotels.json`
- `data/accommodation/room-allocations.json`
- `data/travel/travel.json`
- `data/rituals/rituals.json`
- `data/responsibilities/responsibilities.json`

Remaining enhancements:

- Add create/edit/delete forms for accommodation, travel, rituals, and responsibilities.
- Add room shortage and over-allocation alerts.
- Add pickup manifest grouped by date, arrival point, and coordinator.
- Add ritual sequence and priest-notes view.
- Add owner-grouped and overdue responsibility views.

## Phase 3 - Advanced Features

Status: Planned

Goal: Add reporting, wedding-day control, live alerts, and guest-facing operational flows.

Planned modules:

- Reports
  - Budget report, guest report, RSVP report, vendor report, accommodation report, and travel report.
  - CSV export improvements for every module.
  - Print-friendly report layouts.
  - Summary cards with filters by side, city, function, vendor category, and payment status.

- Wedding Command Center
  - Live wedding-day dashboard for event progress.
  - Vendor arrival status.
  - Guest arrival and pickup status.
  - Emergency contacts and unresolved action items.
  - Function-wise readiness checklist.

- Alerts & Notifications
  - Budget overrun alerts.
  - Vendor payment reminders.
  - Room shortage alerts.
  - Pickup reminders.
  - Overdue task and ritual checklist alerts.

- QR Check-in
  - QR-ready guest IDs.
  - Check-in status per guest family.
  - Function-wise attendance tracking.
  - Exportable attendance log.

- WhatsApp Integration
  - Message templates for invitations, RSVP follow-ups, hotel details, pickup reminders, and function schedules.
  - Click-to-send WhatsApp links.
  - Future-ready structure for official WhatsApp Business API integration.

Suggested data files:

- `data/reports/report-config.json`
- `data/command-center/live-status.json`
- `data/alerts/alerts.json`
- `data/checkin/guest-checkins.json`
- `data/messages/whatsapp-templates.json`

## Phase 4 - Enterprise Features

Status: Future

Goal: Convert Vivah from a local planning app into a scalable collaborative wedding operations platform.

Planned modules:

- Authentication
  - User login and role-based access.
  - Family-side roles such as admin, planner, finance, hospitality, travel, and viewer.
  - Protected routes and permission-aware UI.

- Multi-user Collaboration
  - Shared updates across family members and planners.
  - Assignment comments and activity history.
  - Change tracking for finance, vendors, guests, and tasks.

- AI Wedding Assistant
  - Planning assistant for checklist suggestions, budget review, vendor comparison, and risk detection.
  - Natural-language search across guests, vendors, events, and responsibilities.
  - Draft WhatsApp messages and reminders.

- Forecasting & Analytics
  - Budget variance forecasting.
  - Expected attendance prediction from RSVP patterns.
  - Accommodation and transport demand forecasting.
  - Vendor payment cash-flow projection.

- PWA Support
  - Installable mobile app experience.
  - Offline shell and cached reference data.
  - Mobile-first wedding-day command center.
  - Push-notification-ready architecture.

Future architecture notes:

- Replace local JSON files with an API-backed database when multi-user editing is required.
- Add a schema validation layer before allowing user-generated records.
- Keep module boundaries aligned with the current data folders so Phase 1 and Phase 2 can migrate cleanly.


All the pages should have CRUD funcationality. Logos should have Bride and groom intials in logos.