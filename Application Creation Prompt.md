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
