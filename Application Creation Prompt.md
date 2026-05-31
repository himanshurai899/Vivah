# Application Creation Prompt

## Role

Act as a combination of:

* Senior Wedding Planner with 15+ years of experience managing large Indian weddings.
* Senior Full-Stack Software Architect.
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
- **Status**: Production ready
- **Deliverables**: Core foundation with dashboard, guest management, vendor management, finance tracking, functions/events, tasks Kanban, and full CRUD operations.

### Phase 2 ✅ COMPLETED
- **Status**: Production ready
- **Deliverables**: Accommodation planner, travel management, ritual planner, family responsibility matrix, invitation builder, and top navigation UI overhaul.

### Phase 3 🔄 IN PROGRESS (40% Complete)
- **Status**: Reports and command center scaffolding built; alerts and check-in systems foundation set.
- **Completed**: Reports module summary view, command center overview, alerts and check-in data structures.
- **Remaining**: Advanced features like wedding-day live tracking, QR check-in workflow, WhatsApp integration, and reporting exports.

### Phase 4 📋 PLANNED (Future)
- **Status**: Not started
- **Planned**: User authentication, multi-user collaboration, AI wedding assistant, forecasting & analytics, PWA support.

---

# Background

A wedding is planned for **25 November** in **Vadodara, Gujarat, India**.

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

# ARCHITECTURE IMPLEMENTED

## Technology Stack (As Built)

### Frontend
- **HTML5**: Semantic markup for all pages
- **CSS3**: Responsive design with theme variations (mehendi, reception themes)
- **Vanilla JavaScript**: No frameworks; single-page app (SPA) architecture with hash-based routing
- **SVG/Icons**: Monogram logo with bride/groom initials (S/H)

### Backend/Storage
- **JSON Files**: All data stored in `/data` folder with modular organization
- **Local Dev Server**: Node.js HTTP server (`dev-server.mjs`) for CORS-compliant local development
- **localStorage API**: Client-side caching for offline support

### Deployment
- **Netlify**: Configured for free static hosting with deployment scripts

---

## PROJECT STRUCTURE (Current)

```
Vivah/
├── index.html                          # Single-page app shell
├── dev-server.mjs                      # Local dev server with API endpoint
├── assets/
│   ├── css/styles.css                  # All styling (responsive, themes, components)
│   ├── js/app.js                       # Complete app logic (8000+ lines)
│   ├── images/
│   │   └── vivah-logo.svg             # Gold monogram logo
│   ├── fonts/
│   └── icons/
│       ├── favicon.ico
│       ├── favicon.svg
│       └── apple-touch-icon.png
├── data/                               # JSON data storage (all CRUD operations)
│   ├── guests/
│   │   ├── groom-guests.json
│   │   └── bride-guests.json
│   ├── vendors/vendors.json
│   ├── finance/
│   │   ├── budget.json
│   │   └── expenses.json
│   ├── events/events.json
│   ├── tasks/tasks.json
│   ├── hotels/hotels.json
│   ├── accommodation/room-allocations.json
│   ├── travel/travel.json
│   ├── rituals/rituals.json
│   ├── responsibilities/responsibilities.json
│   ├── invitations/invitations.json
│   ├── reports/report-config.json
│   ├── command-center/live-status.json
│   ├── alerts/alerts.json
│   ├── checkin/guest-checkins.json
│   └── messages/whatsapp-templates.json
├── pages/                              # Navigation stubs (optional documentation)
├── scripts/
│   ├── deploy-netlify.sh
│   └── deploy-netlify.cmd
├── site.webmanifest                    # PWA manifest
├── netlify.toml                        # Netlify config
├── README.md                           # Project documentation
└── DEVELOPMENT_PHASES.md               # Development roadmap
```

---

## FEATURES BUILT (Phase 1 & 2)

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
- Page context showing data relationships and dependencies

---

### 2. Wedding Functions (Timeline) ✅ COMPLETE
**Route**: `#functions` | **Data**: `data/events/events.json`

Full CRUD Implementation:
- **Fields**: Name, Date, Venue, Start Time, End Time, Coordinator, Budget, Checklist Items, Notes
- **Display**: Table with function name, date, venue, time window, coordinator, budget
- **Statistics**: Event count badge
- **Predefined functions**: 
  - Pre-Wedding: Ring Ceremony, Engagement, Tilak
  - Wedding: Haldi, Mehendi, Sangeet, Matkor, Mandap, Baraat, Jaimala, Kanyadaan, Saat Phere, Vidaai
  - Post-Wedding: Reception, Satyanarayan Katha, Family Lunch
- **Edit/Delete operations** with confirmation
- **Page context** linking to tasks, rituals, vendors

---

### 3. Guest Management ✅ COMPLETE
**Route**: `#guests` | **Data**: `data/guests/groom-guests.json` + `data/guests/bride-guests.json`

Full CRUD Implementation:
- **Dual database**: Separate records for groom-side and bride-side guests (auto-separated on save)
- **Fields**: Name, Family Name, Mobile Number, City, State, Relationship, Side (Groom/Bride), Guest Count, Accommodation Required, Pickup Required, Invitation Sent, RSVP Status (Pending/Confirmed/Declined), Gift Received, Special Notes
- **Filters**: 
  - Text search (name or family name)
  - City dropdown filter
  - RSVP status filter
- **Statistics cards**: Households, Total Guests, Accommodation Needs, Pickup Requirements
- **Table columns**: Name with mobile, family, city/state, side, guest count, needs matrix, RSVP badge
- **Mobile responsive**: Stacked layout on mobile devices
- **Page context**: Links to accommodation, travel, check-in modules

---

### 4. Vendor Management ✅ COMPLETE
**Route**: `#vendors` | **Data**: `data/vendors/vendors.json`

Full CRUD Implementation:
- **Fields**: Vendor Name, Category, Contact Person, Phone, Email, Quotation, Negotiated Amount, Final Amount, Advance Paid, Balance Due, Contract Copy (notes), Status, Rating, Notes
- **Status options**: Shortlisted, Negotiating, Finalized, Rejected
- **Vendor categories**: Photographer, Videographer, Caterer, Decorator, DJ, Band, Makeup Artist, Tent Vendor, Flower Vendor, Priest, Mehendi Artist, Transportation Vendor (+ custom)
- **Filters**: Status-based filtering
- **Statistics cards**: Total Vendors, Finalized Count, Total Advance Paid, Total Balance Due
- **Table display**: Vendor name, status, quotation, final amount, advance paid, balance due
- **Payment tracking**: Balance due calculations and payment follow-up alerts
- **Page context**: Links to finance module and command center

---

### 5. Finance Management ✅ COMPLETE
**Route**: `#finance` | **Data**: `data/finance/budget.json` + `data/finance/expenses.json`

Full CRUD Implementation for Budget Categories:
- **Fields**: Category, Planned Budget, Actual Cost, Paid Amount (auto-calc Remaining)
- **12 Budget Categories**: Venue, Food, Photography, Decorations, Accommodation, Travel, Jewelry, Clothing, Invitation Cards, Gifts, Emergency, Miscellaneous

Full CRUD Implementation for Expenses:
- **Fields**: Date, Category, Description, Paid To, Amount, Payment Mode (Cash/UPI/Card/Bank Transfer/Cheque)
- **Two-panel layout**: Budget Categories + Recent Expenses

**Features**:
- **Statistics cards**: Planned Budget, Actual Cost, Paid Amount, Remaining Balance with utilization %
- **Budget calculations**: Planned total, Actual total, Paid total, Remaining (actual - paid)
- **Overrun detection**: Categories > planned budget highlighted
- **Currency formatting**: INR locale with proper separators
- **Utilization alerts**: Triggered when actual ≥ 85% of planned
- **Page context**: Links to vendors and reports

---

### 6. Task Management (Kanban) ✅ COMPLETE
**Route**: `#tasks` | **Data**: `data/tasks/tasks.json`

Full CRUD Implementation:
- **Fields**: Task Name, Owner, Deadline (date), Priority (Low/Medium/High/Critical), Status (Pending/In Progress/Completed/Blocked), Notes
- **Status filtering**: View by status
- **Statistics cards**: Total Tasks, Open Tasks, Blocked Tasks (need escalation), Assigned Owner Count
- **Badges**: Color-coded status badges (pending, in-progress, completed, blocked)
- **Page context**: Links to functions, responsibilities, command center

---

### 7. Accommodation Planning ✅ COMPLETE
**Route**: `#accommodation` | **Data**: `data/hotels/hotels.json` + `data/accommodation/room-allocations.json`

**Properties (Hotels) CRUD**:
- **Fields**: Property Name, Property Type (Hotel/Guest House/Relative Home), Address, Contact Person, Phone, Rooms Available, Rooms Allocated, Check-In Date, Check-Out Date, Cost
- **Type filtering**: View by property type
- **Data file**: `data/hotels/hotels.json`

**Room Allocations CRUD**:
- **Fields**: Property Name, Room Number, Assigned Guests (list), Check-In Date, Check-Out Date, Status (Pending/Confirmed/Completed)
- **Guest mapping**: Lists assigned guests per room
- **Data file**: `data/accommodation/room-allocations.json`

**Features**:
- **Statistics cards**: Properties count, Rooms Available, Rooms Allocated, Guests Assigned
- **Occupancy tracking**: Rooms used vs. total rooms
- **Shortage alerts**: When guest accommodation needs exceed available rooms
- **Page context**: Links to guests, travel, check-in

---

### 8. Travel Management ✅ COMPLETE
**Route**: `#travel` | **Data**: `data/travel/travel.json`

Full CRUD Implementation:
- **Fields**: Guest Name, Arrival Date, Arrival Time, Transport Type (Flight/Train/Bus/Cab/Private Vehicle), PNR/Booking ID, Pickup Required (checkbox), Pickup Coordinator, Vehicle Number, Status (Pending/Confirmed/Delayed/Completed)
- **Status filtering**: View by Pending, Confirmed, Delayed, Completed
- **Statistics cards**: Total Travel Records, Pickups Needed, Confirmed Records, Pending Records

**Features**:
- **Multi-transport support**: 5 transport types for diverse guest origins
- **Pickup coordination**: Coordinator and vehicle tracking
- **Arrival tracking**: Date/time with delay status
- **Page context**: Links to accommodation, guests, WhatsApp (for reminders)

---

### 9. Ritual Planning ✅ COMPLETE
**Route**: `#rituals` | **Data**: `data/rituals/rituals.json`

Full CRUD Implementation:
- **Fields**: Ritual Name, Description, Required Items (Samagri - comma-separated list), Responsible Person, Budget, Status (Pending/In Progress/Completed), Priest Notes
- **Status filtering**: View by status
- **Statistics cards**: Ritual Count, Completed Rituals, In-Progress Rituals, Planned Ritual Budget

**Bihari Wedding Rituals**:
- Tilak, Matkor, Haldi, Mandap, Jaimala, Kanyadaan, Saat Phere, Sindoor Daan, Vidaai

**Features**:
- **Samagri tracking**: Required items per ritual
- **Owner assignment**: Responsible person tracking
- **Budget allocation**: Ritual-specific budget with total rollup
- **Page context**: Links to functions and responsibilities

---

### 10. Family Responsibility Matrix ✅ COMPLETE
**Route**: `#responsibilities` | **Data**: `data/responsibilities/responsibilities.json`

Full CRUD Implementation:
- **Fields**: Task, Owner, Backup Person, Deadline (date), Priority (Low/Medium/High/Critical), Status (Pending/In Progress/Completed/Blocked)
- **Status filtering**: View by status
- **Statistics cards**: Total Responsibilities, Open Items, Blocked Items (need escalation), Assigned Owner Count

**Features**:
- **Ownership tracking**: Primary owner + backup person
- **Deadline management**: Date-based tracking
- **Priority levels**: Low to Critical urgency marking
- **Escalation visibility**: Blocked items highlight
- **Page context**: Links to tasks and command center

---

### 11. Invitation Builder ✅ COMPLETE
**Route**: `#invitation` | **Data**: `data/invitations/invitations.json`

Full CRUD Implementation:
- **Fields**: Section (Couple/Schedule/Venue/RSVP/Blessing), Title, Primary Text, Description, Date, Time, Contact Information
- **Section-based organization**: 5 invitation sections for structured content
- **Statistics cards**: Total Invitation Items, Couple Details Count, Schedule Sections, Venue Items

**Features**:
- **Section templates**: Pre-defined sections for multi-part invitations
- **Content management**: Title, text, description per block
- **Contact info**: Phone/email per invitation block
- **Event linking**: Date/time references for schedule sections
- **Page context**: Links to functions and WhatsApp templates

---

### 12. Reports Module (Phase 3 - Partial) ✅ SCAFFOLD
**Route**: `#reports` | **Data**: `data/reports/report-config.json`

**Features Implemented**:
- Summary statistics dashboard: Confirmed guests, budget health, vendors finalized, travel records
- Budget health chart by category (shows actual spend per category)
- Vendor status distribution chart
- Phase 3 roadmap display

**Planned Reports** (Phase 3 remaining):
- Budget Report (detailed breakdown)
- Guest Report (family-wise summary)
- RSVP Report (confirmed/pending/declined)
- Vendor Report (payment status)
- Accommodation Report (room utilization)
- Travel Report (transport modes, arrivals)
- PDF export functionality
- Print-friendly layouts

---

### 13. Alerts System (Phase 3 - Partial) ✅ FOUNDATION
**Route**: `#alerts` | **Data**: `data/alerts/alerts.json`

Full CRUD Implementation:
- **Fields**: Alert Type, Message, Active (toggle), Threshold Value
- **Alert Types**: Budget Overrun, Vendor Payment, Room Shortage, Pickup Reminder, Overdue Task
- **Statistics cards**: Total Alert Rules, Active Alerts, Category breakdowns

**Implemented Triggers** (Dashboard-level):
- Budget utilization ≥ 85%
- Category budget overruns (actual > planned)
- Vendor balance due on finalized vendors
- Room shortage (guest accommodation needs > available rooms)
- Overdue task detection ready (infrastructure)

**Features**:
- **Dashboard integration**: Alert strip displays active alerts
- **Configurable thresholds**: User-defined threshold values
- **Active toggle**: Enable/disable alert rules

---

### 14. Guest Check-In (Phase 3 - Partial) ✅ FOUNDATION
**Route**: `#checkin` | **Data**: `data/checkin/guest-checkins.json`

Full CRUD Implementation:
- **Fields**: Guest Name, Family Name, Function/Event Name, Check-In Status (Pending/Checked In/Absent), Arrival Time, Notes
- **Status filtering**: View by status
- **Statistics cards**: Total Check-Ins, Checked In Count, Pending Count, Absent Count

**Features**:
- **Event-based check-in**: Track arrivals by function
- **Arrival time recording**: Capture actual arrival time
- **Absence tracking**: Mark no-shows
- **QR check-in ready**: Data structure supports mobile QR scanning (Phase 4)
- **Page context**: Links to guests, travel, functions

---

### 15. WhatsApp Templates (Phase 3 - Partial) ✅ FOUNDATION
**Route**: `#whatsapp` | **Data**: `data/messages/whatsapp-templates.json`

Full CRUD Implementation:
- **Fields**: Template Name, Category (Invitation/RSVP Reminder/Hotel Info/Pickup Reminder/Schedule Update), Message Text, Active (toggle)
- **Category-based organization**: 5 message categories
- **Statistics cards**: Total Templates, Active Templates, Category breakdown

**Features**:
- **Message drafting**: Store pre-written templates
- **Active toggle**: Enable/disable templates
- **Message preview**: Show truncated text in table view
- **Planned** (Phase 4): Click-to-send WhatsApp links via WhatsApp Business API

---

### 16. Wedding Command Center (Phase 3 - Partial) ✅ SCAFFOLD
**Route**: `#commandCenter` | **Data**: `data/command-center/live-status.json`

**Features Implemented**:
- Live operations dashboard:
  - Open tasks counter (tasks not completed)
  - Pending rituals counter (rituals not completed)
  - Available rooms counter (rooms not allocated)
  - Active vendors counter (vendors not finalized)
- Action required section: Unresolved work items
- Accommodation status section: Room availability by property type (chart)
- Quick actions list: Phase 3 build items (vendor tracking, pickup dashboard, emergency contacts)

**Planned** (Phase 3 full implementation):
- Real-time vendor arrival tracking
- Guest pickup status dashboard
- Emergency contact prioritization
- Function-wise readiness checklist
- Wedding-day progress timeline

---

## CORE APPLICATION FRAMEWORK

### Navigation System ✅ COMPLETE
- **Top navigation bar**: Grouped module categories
- **Categories**: 
  - Planning (Dashboard, Functions, Guests, Vendors)
  - Operations (Accommodation, Travel, Rituals, Responsibilities)
  - Management (Finance, Tasks, Reports, Invitation)
  - Execution (Command Center, Alerts, Check-In, WhatsApp)
  - Settings (Theme Toggle)
- **Hash-based routing**: `#dashboard`, `#guests`, etc.
- **Active link highlighting**: Current route indicated
- **Mobile responsive**: Collapsible/sticky navigation

### Theme Support ✅ COMPLETE
- **Default Theme**: Standard wedding colors
- **Mehendi Theme** (class: `theme-mehendi`): Green and gold accents
- **Reception Theme** (class: `theme-reception`): Royal blue and silver accents
- **Theme toggle button**: Top-right corner cycles through themes
- **Persistent across navigation**: Theme choice maintained

### CRUD Framework ✅ COMPLETE
- **Unified system**: Single configuration-driven approach for all 18 collections
- **18 Collections supported**: guests, vendors, budget, expenses, events, tasks, hotels, roomAllocations, travel, rituals, responsibilities, invitations, alerts, guestCheckins, whatsappTemplates, reports, liveStatus, and more
- **Dynamic form generation**:
  - Text fields (single-line)
  - Number fields (integers/decimals)
  - Date fields (date picker)
  - Time fields (time picker)
  - Select dropdowns (predefined options)
  - Checkboxes (boolean)
  - Textarea fields (multi-line notes)
  - List fields (comma-separated items)
- **Field validation**: Required field enforcement
- **Edit mode**: Populate form from existing record
- **Delete operations**: With confirmation
- **ID generation**: Auto-generated with `${collection}-${timestamp}` format

### Data Persistence ✅ COMPLETE
- **Server-side persistence**: POST to `/api/data/{collection}` endpoint
- **Client-side fallback**: localStorage with `vivah:data:` prefix
- **Auto-sync on init**: All 18 collections loaded on app startup
- **Merge strategy**: Groom guests + Bride guests automatically combined into single dataset
- **Error handling**: User-friendly error messages for write failures
- **Graceful degradation**: Falls back to localStorage if server not available

### Export Functionality ✅ COMPLETE
- **CSV export**: Button on all module pages
- **Format**: Standard CSV with proper escaping
- **Content**: All visible columns + all data rows
- **Headers**: Column labels as CSV header row
- **File naming**: Automatic with module name

### Filter System ✅ COMPLETE
- **Guest filters**: 
  - Text search (name/family name)
  - City dropdown filter
  - RSVP status filter
- **Vendor filters**: Status filter
- **Travel filters**: Status filter
- **Ritual filters**: Status filter
- **Responsibility filters**: Status filter
- **Real-time updates**: Filters update table immediately on change
- **Filter state**: Persisted in appState.filters

### Responsive Design ✅ COMPLETE
- **Mobile-first approach**: Single column on mobile
- **Tablet layout**: Two-column grids for charts/stats
- **Desktop layout**: Multi-column with charts and sidebars
- **Touch-friendly**: Large tap targets for buttons/form controls
- **Flexible typography**: Responsive font sizes (clamp-based)
- **Viewport optimization**: Meta viewport tag configured

### Utility Functions ✅ COMPLETE
- **Currency formatting**: INR Intl.NumberFormat with locale
- **Date handling**: `formatOptionalDate()`, `dateRange()`, `daysRemaining()`
- **HTML/attribute escaping**: XSS prevention with `escapeHtml()`, `escapeAttribute()`
- **Aggregation**: `sum()`, `unique()`, `groupBy()`, `percent()`
- **Collection helpers**: List preview, chart list, chart rows rendering

---

# Technology Requirements

## Frontend

Use:

* HTML5
* CSS3
* Vanilla JavaScript

No frontend frameworks.

Follow:

* Responsive Design
* Mobile-first UI
* Progressive Enhancement
* Component-based architecture

---

# Storage

Use JSON files stored under:

```plaintext
/data
```

Example:

```plaintext
data/

guests/
    groom-guests.json
    bride-guests.json

vendors/
    photographers.json
    caterers.json
    decorators.json

finance/
    budget.json
    expenses.json

events/
    events.json

hotels/
    hotels.json

travel/
    travel.json
```

---

# Folder Structure

```plaintext
Vivah/

├── index.html
│
├── assets/
│   ├── css/
│   ├── js/
│   ├── images/
│   ├── fonts/
│   └── icons/
│
├── pages/
│   ├── dashboard/
│   ├── guests/
│   ├── vendors/
│   ├── finance/
│   ├── accommodation/
│   ├── travel/
│   ├── functions/
│   ├── rituals/
│   ├── tasks/
│   ├── contacts/
│   ├── reports/
│   ├── emergency/
│   ├── gallery/
│   └── settings/
│
├── data/
│
└── README.md
```

---

# UI / UX Requirements

Design inspiration:

* Royal Indian Weddings
* Mithila Art
* Madhubani Patterns
* Marigold Decorations
* Traditional Bihari Culture

---

## Theme Variations

### Haldi Theme

* Yellow
* Orange
* White

### Mehendi Theme

* Green
* Gold

### Wedding Theme

* Maroon
* Gold
* Ivory

### Reception Theme

* Royal Blue
* Silver
* White

---

# Navigation

Top Navigation Bar:

```plaintext
Dashboard
Functions
Guests
Vendors
Accommodation
Travel
Finance
Tasks
Reports
Contacts
Settings
```

---

# Core Modules

## 1. Dashboard

Display:

* Days Remaining
* Total Budget
* Budget Utilized
* Total Guests
* Confirmed Guests
* Pending Guests
* Vendors Finalized
* Upcoming Functions

Charts:

* Budget Distribution
* Guest City Distribution
* Vendor Status

---

## 2. Wedding Timeline Planner

### Suggested Functions

#### Pre-Wedding

* Ring Ceremony
* Engagement
* Tilak Ceremony

#### Wedding Functions

* Haldi
* Mehendi
* Sangeet
* Matkor
* Mandap Ceremony
* Baraat
* Jaimala
* Kanyadaan
* Saat Phere
* Vidaai

#### Post-Wedding

* Reception
* Satyanarayan Katha
* Family Lunch

Each event should contain:

* Event Name
* Date
* Venue
* Start Time
* End Time
* Coordinator
* Budget
* Checklist
* Notes

---

## 3. Guest Management

Separate databases for:

* Groom Side
* Bride Side

Guest Fields:

* Name
* Family Name
* Mobile Number
* City
* State
* Relationship
* Side
* Number of Guests
* Accommodation Required
* Pickup Required
* Invitation Sent
* RSVP Status
* Gift Received
* Special Notes

Filters:

* City
* State
* RSVP Status
* Family

---

## 4. Accommodation Planner

Manage:

* Hotels
* Guest Houses
* Relative Homes

Fields:

* Property Name
* Address
* Contact Person
* Phone
* Rooms Available
* Rooms Allocated
* Check-In Date
* Check-Out Date
* Assigned Guests
* Cost

---

## 5. Travel Management

Track:

* Flights
* Trains
* Buses
* Cab Assignments

Fields:

* Guest Name
* Arrival Date
* Arrival Time
* Transport Type
* PNR
* Pickup Coordinator
* Vehicle Number
* Status

---

## 6. Vendor Management

Categories:

* Photographer
* Videographer
* Caterer
* Decorator
* DJ
* Band
* Makeup Artist
* Tent Vendor
* Flower Vendor
* Priest
* Mehendi Artist
* Transportation Vendor

Fields:

* Vendor Name
* Category
* Contact Person
* Phone
* Email
* Quotation
* Negotiated Amount
* Final Amount
* Advance Paid
* Balance Due
* Contract Copy
* Status
* Rating
* Notes

Statuses:

* Shortlisted
* Negotiating
* Finalized
* Rejected

---

## 7. Finance Management

Budget Categories:

* Venue
* Food
* Photography
* Decorations
* Accommodation
* Travel
* Jewelry
* Clothing
* Invitation Cards
* Gifts
* Emergency
* Miscellaneous

Features:

* Planned Budget
* Actual Cost
* Paid Amount
* Remaining Amount

Reports:

* Expense Summary
* Cost Breakdown
* Vendor Payment Schedule

---

## 8. Family Responsibility Matrix

Fields:

* Task
* Owner
* Backup Person
* Deadline
* Status

Examples:

* Airport Pickups
* Hotel Coordination
* Vendor Payments
* Ritual Arrangements
* Guest Welcome

---

## 9. Ritual Planning (Traditional Bihari Wedding)

Dedicated sections for:

* Tilak
* Matkor
* Haldi
* Mandap
* Jaimala
* Kanyadaan
* Saat Phere
* Sindoor Daan
* Vidaai

Each ritual should include:

* Description
* Required Items
* Responsible Person
* Budget
* Checklist

---

## 10. Wedding Shopping Tracker

### Groom

* Sherwani
* Reception Suit
* Shoes
* Accessories

### Bride

* Wedding Lehenga
* Jewelry
* Makeup

### Family Shopping

Fields:

* Item
* Assigned To
* Purchased
* Cost
* Vendor
* Status

---

## 11. Contacts Directory

Store:

* Family Contacts
* Vendor Contacts
* Hotels
* Hospitals
* Police
* Emergency Services

Searchable and filterable.

---

## 12. Task Management System

Kanban Board:

* Pending
* In Progress
* Completed
* Blocked

Task Fields:

* Priority
* Due Date
* Owner
* Comments

---

## 13. Reports Module

Generate:

* Budget Report
* Guest Report
* RSVP Report
* Vendor Report
* Accommodation Report

Export Formats:

* PDF
* Excel
* CSV

---

## 14. Wedding Day Command Center

Live dashboard displaying:

* Event Status
* Vendor Arrival Status
* Guest Arrival Status
* Emergency Contacts
* Pending Activities

---

## 15. Emergency Module

Important Contacts:

* Hospitals
* Ambulance
* Police
* Fire Department
* Electrician
* Plumber
* Generator Vendor

---

# Smart Features

Implement:

* Wedding Countdown
* Budget Overrun Alerts
* Vendor Payment Alerts
* Room Allocation Suggestions
* Guest Pickup Reminders
* Daily Planning Checklist
* Risk Register

Risk Register Fields:

* Risk
* Probability
* Impact
* Mitigation Plan

---

# Future Enhancements

Architecture should support:

* User Authentication
* Multi-user Collaboration
* WhatsApp Invitation Integration
* Google Maps Integration
* QR Guest Check-In
* E-Invitation Generator
* AI Wedding Assistant
* Expense Forecasting
* Wedding Gallery
* Vendor Ratings
* Voice Notes
* Progressive Web App (PWA)

---

# Deliverables

Generate:

1. Complete folder structure
2. HTML pages
3. CSS stylesheets
4. JavaScript modules
5. JSON schemas
6. Sample JSON data
7. Navigation system
8. Dashboard widgets
9. Responsive UI
10. README.md
11. Deployment guide
12. Future scaling architecture

---

# REMAINING WORK (Phase 3 & 4)

## Phase 3 - Advanced Features (40% Complete, In Progress)

### Remaining Phase 3 Tasks (Priority Order)

#### 1. Reports Module Enhancement - 60% Complete
**Current State**: Summary dashboard with basic charts
**Remaining Work**:
- Budget Report: Detailed breakdown by category with variance analysis
- Guest Report: Family-wise summary with RSVP counts and demographics
- RSVP Report: Confirmed/Pending/Declined breakdown by side
- Vendor Report: Payment status, balance tracking, category breakdown
- Accommodation Report: Room utilization, available rooms, guest assignments
- Travel Report: Transport mode distribution, pickup needs, delayed arrivals
- **Export formats**: PDF generation, Excel export with formulas
- **Print layouts**: Print-friendly CSS for report views
- **Filters**: By side, city, function, vendor category, payment status
- **Estimated effort**: 16-20 hours

#### 2. Wedding Day Command Center - 30% Complete
**Current State**: Operations overview with task/ritual/room/vendor counters
**Remaining Work**:
- **Vendor arrival tracking**: Real-time status updates for arriving vendors
- **Guest pickup dashboard**: Live view of pending pickups, arrival confirmations
- **Emergency contact priorities**: Quick-dial emergency services with priority levels
- **Function-wise readiness**: Pre-function checklist validation
- **Live timeline**: Wedding-day event progression with time-remaining countdown
- **Quick status updates**: One-click status toggle for common actions
- **Mobile optimization**: Touch-optimized command center for wedding-day operations
- **Estimated effort**: 12-16 hours

#### 3. Alerts System Enhancement - 50% Complete
**Current State**: Alert rules CRUD, basic triggers on dashboard
**Remaining Work**:
- **Refined triggers**: Implement all 5 alert types with configurable thresholds
- **Email notifications**: Send alerts to family members (requires backend)
- **SMS notifications**: WhatsApp/SMS integration (Phase 4)
- **Escalation workflow**: Automatic escalation if alert unresolved >2 hours
- **Alert history**: Log of all triggered alerts with timestamps
- **Snooze functionality**: Temporarily suppress alerts for 1/4/24 hours
- **Custom alert rules**: Allow user-defined triggers beyond the 5 types
- **Estimated effort**: 8-12 hours

#### 4. QR Check-In System - 20% Complete
**Current State**: Check-in data structure and CRUD
**Remaining Work**:
- **QR generation**: Generate QR codes for each guest (linked to guest ID)
- **Mobile scanner**: QR scanner interface in check-in module
- **Attendance reporting**: Generate attendance report by function
- **Late arrival tracking**: Flag guests arriving after event start
- **Family grouping**: Check-in by family unit (not individual)
- **Offline support**: Queue check-ins when offline, sync on reconnect
- **Print QR codes**: Batch print QR labels for guest check-in stations
- **Estimated effort**: 14-18 hours

#### 5. WhatsApp Integration - 30% Complete
**Current State**: Message template storage and CRUD
**Remaining Work**:
- **Click-to-send links**: Generate WhatsApp links with pre-filled messages
- **Variable substitution**: Replace {guestName}, {hotelName}, {time}, etc. in templates
- **Batch messaging**: Send to multiple guests with single click
- **Message history**: Log of all sent messages with timestamps
- **Delivery status**: Show delivery and read status (requires API)
- **Conditional messages**: Send different messages based on guest attributes
- **Business API integration**: Hook up official WhatsApp Business API (Phase 4)
- **Estimated effort**: 10-14 hours

#### 6. Gallery Module (NEW) - 0% Complete
**Planned features**:
- Photo upload and organize by function
- View and manage wedding day photos
- Share photos with family members
- Simple modal view for browsing
- Basic metadata (date taken, function association)
- **Estimated effort**: 6-8 hours

#### 7. Settings Module (NEW) - 0% Complete
**Planned features**:
- Rename wedding (currently hardcoded Nov 25, 2026)
- Customize budget categories
- Configure alert thresholds
- Theme preferences
- Export all data as JSON backup
- Import data from backup
- **Estimated effort**: 6-8 hours

#### 8. Emergency Module (NEW) - 0% Complete
**Planned features**:
- Hospital contacts
- Ambulance service
- Police station
- Fire department
- Electrician, plumber, mechanic on-call
- Generator vendor contact
- Customizable emergency contacts
- Quick-dial functionality
- **Estimated effort**: 4-6 hours

---

## Phase 4 - Enterprise Features (0% - Future)

### 1. User Authentication & Authorization
**Scope**: Role-based access control
- Admin: Full access to all modules
- Planner: Planning and vendor management
- Finance: Finance and vendor payment tracking
- Hospitality: Guest, accommodation, travel management
- Viewer: Read-only access to key modules
**Estimated effort**: 24-32 hours (requires backend API)

### 2. Multi-user Collaboration
**Scope**: Real-time updates across users
- User login with family side (groom/bride)
- Shared updates notification
- Activity audit trail
- Change history tracking
- @mention comments on records
- Email notifications for assignments
**Estimated effort**: 32-40 hours (requires backend + WebSocket)

### 3. AI Wedding Assistant (Conversational AI)
**Scope**: Natural language planning help
- Planning checklist suggestions based on date/function count
- Vendor comparison and recommendation
- Budget anomaly detection and suggestions
- Risk identification and mitigation plans
- Guest list analysis (missing key guests, balanced sides)
- Natural language search across all data
- Draft WhatsApp messages from templates
**Estimated effort**: 28-36 hours (requires AI/LLM API integration)

### 4. Forecasting & Analytics
**Scope**: Predictive insights
- Budget variance forecasting (expected vs. actual)
- Expected attendance prediction from RSVP patterns
- Accommodation demand forecasting
- Transport demand forecasting
- Vendor payment cash-flow projection
- Timeline risk analysis
**Estimated effort**: 20-24 hours

### 5. PWA Support (Progressive Web App)
**Scope**: Offline + installable app
- Service worker for offline shell
- Offline-first data sync strategy
- Home screen installation
- Splash screens
- Push notifications (when online)
- Native app-like experience on mobile
**Estimated effort**: 16-20 hours

### 6. Vendor Portal (NEW)
**Scope**: Vendor self-service
- Vendor login and dashboard
- View contract and payment schedule
- Submit invoices and payment requests
- Communication thread with planner
- Attendance confirmation for functions
**Estimated effort**: 20-24 hours (requires backend)

### 7. Guest Portal (NEW)
**Scope**: Guest self-service
- Guest login with invitation link
- RSVP submission
- Accommodation preferences
- Dietary requirements
- Gift registry integration
- View event schedule and details
**Estimated effort**: 20-24 hours (requires backend)

---

## Technical Debt & Optimizations

### High Priority
- Extract reusable component functions from app.js (currently 2000+ lines)
- Add input validation beyond required fields
- Add transaction logging for data mutations
- Improve error messages with actionable suggestions
- Add loading states for API calls

### Medium Priority
- Implement proper state management (currently appState object)
- Add client-side data caching strategy
- Optimize chart rendering for large datasets
- Add keyboard shortcuts for power users
- Implement undo/redo for accidental deletions

### Low Priority
- Accessibility improvements (WCAG AA compliance)
- Performance monitoring and analytics
- SEO optimization (if public website)
- Internationalization (multi-language support)
- Dark mode theme (additional to existing themes)

---

## Current Technical Metrics

- **Total lines of code**: ~5,000 (app.js ~2,000, styles.css ~2,000, HTML 150)
- **Data collections**: 18 active collections
- **CRUD operations**: Full support across all 16 modules
- **Functions**: 50+ utility functions, 16 render functions
- **Routes**: 16 hash-based routes
- **Browser compatibility**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Mobile support**: Responsive design, touch-friendly
- **Offline support**: localStorage fallback for data persistence

---

# Quality Expectations

The final solution must be:

* Production-ready
* Modular
* Maintainable
* Scalable
* Mobile Responsive
* Accessible
* Modern UI/UX
* Optimized for 500–1500 guests
* Suitable for a traditional Bihari wedding hosted in Vadodara, Gujarat

The application should function as a complete wedding operating system rather than a simple wedding planner.
