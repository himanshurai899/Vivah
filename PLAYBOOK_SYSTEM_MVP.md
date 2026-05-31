# Playbook System MVP — Complete Specification

**Phase**: 5.2  
**Feature**: Playbook System (Google Contacts Import + Task Delegation + Save as Playbook + Share)  
**Timeline**: Jun 1–30, 2026  
**Owner**: `/orchestrator` (coordination) → `/system-architect` (schema) → `/ssdt` (tests) → `/ssde` (implementation)  
**Status**: ✅ BA Complete → 🔄 System Architect Next

---

## Overview

**Playbook System MVP** is the Phase 6 revenue differentiator that turns couples into planners.

**Problem**: Himanshu plans Nov 25 wedding manually. After it's successful, his friends want to know "how did you organize 1000 guests across 3 states?"

**Solution**: Save Himanshu's entire wedding (guests, vendors, tasks, rituals, accommodation, travel, finance) as a shareable playbook that others can clone.

**Revenue Model**: 
- Couples use it free (single wedding)
- Couples share playbooks with friends
- Friends who charge for planning become "planners" on our platform (Phase 6)
- We take 15–20% commission on planner services

---

## Success Criteria (User-Facing)

1. ✅ Himanshu invites 50 guests from Google Contacts in 2 clicks
2. ✅ Delegate tasks to multiple family members (Mom, Dad, Sister all see same task)
3. ✅ Save Nov 25 wedding snapshot as reusable playbook ("Himanshu & Priyanka's Bihari Winter Wedding")
4. ✅ Share playbook with best friend by email; friend clones it for his wedding

---

## Story 1: Google Contacts Import

### User Story
```
As a couple planning my wedding,
I want to import my Google Contacts and invite guests in 2 clicks,
So that I don't manually type 500 emails and phone numbers.
```

### Acceptance Criteria

#### Scenario: Import 50 contacts and bulk-invite 40 of them
```gherkin
Given I am on the Guests page
When I click "Import from Google Contacts"
Then I see the Google OAuth consent screen
And I grant permission to read contacts
Then I see a list of my 50 contacts with name + email + phone
When I select 40 contacts
And I click "Invite Selected"
Then the 40 guests are added to my wedding
And each guest has email + phone pre-filled
And a WhatsApp invitation is queued for sending
```

#### Scenario: Import handles duplicate emails gracefully
```gherkin
Given I have imported 20 contacts
And 5 of them are duplicates of existing guests
When I import again
Then duplicate emails are highlighted in yellow
And I can choose: "Skip", "Update existing", or "Add as new"
And clicking "Auto-resolve duplicates" keeps existing, skips new
```

#### Scenario: Import with contacts missing emails or phones
```gherkin
Given I import 50 contacts
And 10 contacts have no email
And 5 contacts have no phone
When import completes
Then guests without email show a warning icon
And I can manually enter email before inviting
And phone is optional (not required for invitation)
```

#### Scenario: Empty Google Contacts or revoke permission
```gherkin
Given I click "Import from Google Contacts"
And my Google Contacts list is empty
Then I see "You have no contacts in Google Contacts yet"
And I can manually add guests instead
When I later revoke Google permission in Settings
Then the import button still works (prompts re-auth)
```

#### Scenario: Page typography meets $10K standard
```gherkin
Given I load the Guests import modal
Then the title "Import from Google Contacts" is Cormorant Garamond, 24px, bold
And the body text is DM Sans, 16px, #0F0612
And all buttons use DM Sans, 14px, uppercase
```

#### Scenario: Mobile usability — import on 375px screen
```gherkin
Given I view the import modal on a phone (375px wide)
Then the contact list scrolls vertically without horizontal scroll
And the "Invite Selected" button is 44×44px minimum
And the checkboxes are 44×44px minimum touch targets
```

### Out-of-Scope
- ❌ Import from other wedding apps (WeddingWire, etc.) — Phase 5.3
- ❌ Two-way sync (changes in Google Contacts don't auto-update Vivah) — Phase 6
- ❌ Contact deduplication AI — Phase 5.3

### Data Contract — Guest with Import Metadata

```typescript
interface Guest {
  id: string                      // UUID
  weddingId: string              // FK to Wedding
  name: string                   // Required, 1-100 chars
  email: string                  // Required, valid email
  phone: string                  // Optional, 10-15 digits, stripped formatting
  side: "GROOM" | "BRIDE"        // Required
  rsvpStatus: "PENDING" | "YES" | "NO" | "MAYBE"  // Default: PENDING
  importedFrom: "GOOGLE_CONTACTS" | "MANUAL" | "CSV" | "WHATSAPP"  // Metadata
  importedAt: DateTime           // When they were imported
  // ... existing fields
}
```

### UI/UX Notes
- Modal-based flow (don't leave Guests page)
- Show Google OAuth consent once, cache token for 30 days
- Display contact count: "Loading 247 contacts..."
- Bulk select: "Select all (50)" checkbox at top
- Show phone number prominently (it's the differentiator vs. spreadsheets)
- Invite button changes to "Inviting 40 guests..." during submission

---

## Story 2: Task Delegation (Multiple Assignees)

### User Story
```
As a bride's family coordinator,
I want to assign tasks to multiple family members and see who's doing what,
So that we don't drop balls and everyone knows their role.
```

### Acceptance Criteria

#### Scenario: Create task and assign to 2 family members
```gherkin
Given I am on the Tasks page
When I create a new task "Confirm venue with caterer"
And I set priority to "High"
And I set due date to "2026-06-15"
Then I see an "Assign to" field
When I click "Assign to"
Then I see a list of wedding team members (guests marked as family)
When I select "Mom" and "Dad"
Then both are shown as assignees
And the task shows: "Assigned to Mom, Dad"
And both Mom and Dad see this task in their inbox
```

#### Scenario: Multiple assignees can mark task complete independently
```gherkin
Given a task is assigned to Mom and Dad
When Mom marks the task "Done"
Then the task shows "Mom: ✅ Complete"
And the task is still in "In Progress" status (not fully complete)
When Dad marks it "Done"
Then the task shows "Mom: ✅ Complete, Dad: ✅ Complete"
And the task moves to "Completed" status
And both get a ✅ checkmark in their Responsibilities view
```

#### Scenario: Unassign all members (task becomes unowned)
```gherkin
Given a task is assigned to Mom and Dad
When I click the X on Mom's name
And I click the X on Dad's name
Then the task shows "Unassigned"
And a notification says "Who will do this? Assign to someone"
And neither Mom nor Dad see it in their inbox
```

#### Scenario: Can't assign to non-existent user
```gherkin
Given I start typing a name in "Assign to"
When I type "Grandma" and no match exists
Then the field shows "No match found"
And I can optionally invite "Grandma" to the wedding
And after invite, I can assign to her
```

#### Scenario: Kanban board shows multiple assignees
```gherkin
Given a task is assigned to 3 people
When I view the Kanban board
Then the task card shows "👥 3 assigned" with small avatars
And hovering shows names: "Mom, Dad, Sister"
```

#### Scenario: Page typography meets $10K standard
```gherkin
Given I load the Tasks page assignment UI
Then task titles are Cormorant Garamond, 18px
And assignee names are DM Sans, 14px
And status badges use consistent font weights
```

#### Scenario: Mobile usability — assign on 375px screen
```gherkin
Given I view task assignment on a phone
Then the assignee field is tappable (44×44px minimum)
And the list of team members scrolls vertically
And selected assignees show as removable chips (not a small list)
```

### Out-of-Scope
- ❌ Assign to vendors (only guests/family) — Phase 5.3
- ❌ Recurring tasks with different assignees per occurrence — Phase 5.4
- ❌ Task dependencies ("Can't start until other task is done") — Phase 6

### Data Contract — Task Assignment

```typescript
interface Task {
  id: string
  weddingId: string
  title: string                  // Required
  description: string            // Optional
  priority: "LOW" | "MEDIUM" | "HIGH"  // Default: MEDIUM
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED"
  dueDate: DateTime              // Required
  
  // NEW: Multiple assignees
  assignees: TaskAssignee[]      // Array of assigned guests
  isFullyComplete: boolean       // True only if ALL assignees marked done
  
  createdAt: DateTime
  createdBy: string              // User ID who created it
}

interface TaskAssignee {
  id: string
  taskId: string
  guestId: string               // FK to Guest
  status: "PENDING" | "IN_PROGRESS" | "DONE"  // Individual completion
  completedAt: DateTime         // When this assignee marked done
  completedBy: string           // Guest ID
}
```

### UI/UX Notes
- When assigning, show only wedding team members (guests + family, filtered)
- Assignee chips show initials or avatar
- Kanban card shows "👥 3 assigned" with avatar stack
- Click card to see full assignee list with individual completion status
- Notification sent to assignee: "You've been assigned: Confirm venue"

---

## Story 3: Save Wedding as Playbook

### User Story
```
As someone who just planned a successful wedding,
I want to save my entire wedding setup (guests, vendors, tasks, configs) as a reusable template,
So that my friends or my planner friends can clone it for their weddings.
```

### Acceptance Criteria

#### Scenario: Save complete wedding as playbook with one click
```gherkin
Given I have a complete wedding setup:
  - 250 guests with phone numbers and sides
  - 15 vendors with payment status
  - 20 tasks assigned to family
  - 9 rituals with samagri tracking
  - Accommodation blocks in 3 hotels
  - Travel arrangements for 100 guests
  - Finance budget with categories and expenses
  - Settings (date, location, couple names)
When I go to Settings → "Save as Playbook"
And I enter a name: "Himanshu & Priyanka's Bihari Winter Wedding"
And I click "Save Playbook"
Then the entire wedding is snapshotted as a new Playbook record
And I see: "✅ Playbook saved! You can now share it with others"
And the playbook is owned by me (can edit/delete/share)
```

#### Scenario: Playbook snapshot does NOT include sensitive data
```gherkin
Given I save a playbook
And my wedding has:
  - Vendor payment receipts (confidential)
  - Guest phone numbers (personal)
  - Finance ledger with family contributions
When the playbook is saved
Then it includes: guests names, emails (not phones), vendors, tasks, rituals
And it excludes: payment receipts, financial amounts, family notes
And phone numbers are stored separately (optional for import)
And I can choose: "Include guest phones in playbook? YES/NO"
```

#### Scenario: Partial wedding can be saved (not all vendors)
```gherkin
Given my wedding is missing some vendors or rituals
When I save the playbook
Then the system includes only what exists
And warns: "Your playbook is 70% complete. You can add missing vendors when sharing."
And the playbook still saves successfully
```

#### Scenario: Can't save empty wedding (no guests)
```gherkin
Given my wedding has 0 guests
When I try to save as playbook
Then I see: "Add at least 10 guests before saving as playbook"
And the save button is disabled
```

#### Scenario: Playbook is versioned (save multiple times)
```gherkin
Given I saved "Himanshu's Wedding v1" with 200 guests
And I then added 50 more guests
When I save again as "Himanshu's Wedding v2"
Then both v1 and v2 exist
And I can switch between versions
And v2 has the latest data
```

#### Scenario: Page typography meets $10K standard
```gherkin
Given I view the "Save as Playbook" dialog
Then the title is Cormorant Garamond, 24px, bold
And input labels are DM Sans, 14px, #0F0612
And helper text is DM Sans, 12px, #666
```

#### Scenario: Mobile usability — save on 375px screen
```gherkin
Given I view the save dialog on a phone
Then the input field is 44px tall minimum
And the "Save Playbook" button is 44×44px minimum
And the dialog doesn't require horizontal scroll
```

### Out-of-Scope
- ❌ Auto-save drafts (only manual save) — Phase 5.3
- ❌ Version history / rollback — Phase 6
- ❌ Playbook comparison (side-by-side with another) — Phase 6

### Data Contract — Playbook

```typescript
interface Playbook {
  id: string                     // UUID
  ownerId: string               // User ID (wedding creator)
  weddingId: string             // FK to original Wedding
  
  name: string                  // "Himanshu & Priyanka's Bihari Winter Wedding"
  description: string           // Optional user notes
  
  // Snapshot data
  snapshotData: {
    guests: Guest[]             // Full guest list (emails only, no phones by default)
    vendors: Vendor[]
    tasks: Task[]
    rituals: Ritual[]
    accommodation: Accommodation[]
    travel: Travel[]
    events: Event[]
    finance: {
      categories: Category[]
      budget: number            // Total budget amount (NOT expenses)
    }
    settings: {
      weddingDate: DateTime
      location: string
      groomName: string
      brideName: string
    }
  }
  
  includePhoneNumbers: boolean  // User choice: include guest phones
  completionPercentage: number  // 70, 85, 100 etc
  createdAt: DateTime
  updatedAt: DateTime
  
  // Sharing
  shareWith: PlaybookShare[]    // List of people who can access this
}

interface PlaybookShare {
  id: string
  playbookId: string
  sharedWithEmail: string       // Invited email
  role: "VIEWER" | "EDITOR"     // VIEWER: can clone; EDITOR: can edit & share
  sharedAt: DateTime
  acceptedAt: DateTime          // Null if pending invite
}
```

### UI/UX Notes
- "Save as Playbook" button appears in Settings page
- Dialog asks for name (pre-filled: "Your Wedding Name")
- Checkbox: "Include guest phone numbers? Recommended for team planning"
- Shows completion bar: "Your wedding is 85% complete"
- After save, show "Share with others" CTA (leads to Story 4)

---

## Story 4: Share Playbook (Invite-Based)

### User Story
```
As someone with a complete, beautiful wedding playbook,
I want to share it with other couples or planner friends,
So that they can clone it for their wedding and I can help guide them.
```

### Acceptance Criteria

#### Scenario: Share playbook by email invite
```gherkin
Given I have a saved playbook "Himanshu's Wedding"
When I click "Share Playbook"
Then I see a "Share with others" dialog
When I enter 3 email addresses:
  - priyanka@email.com
  - best-friend@email.com
  - planner@weddings.com
And I select role "VIEWER" (they can clone, not edit)
And I click "Send Invites"
Then 3 invitation emails are sent
And the dialog shows: "✅ Invites sent to 3 people"
And my playbook is marked "Shared with 3 people"
```

#### Scenario: Invite to non-existent account (they register later)
```gherkin
Given I share with "future-guest@example.com"
And they don't have a Vivah account yet
When they receive the invite email
Then it says: "You've been invited to clone a wedding playbook. Sign up to access it."
When they click the link and sign up
Then they see the playbook automatically in their inbox
And can clone it immediately
```

#### Scenario: VIEWER role can clone but not edit
```gherkin
Given my playbook is shared with Mom as "VIEWER"
When Mom clicks "Clone this playbook"
Then she creates a new wedding from the template
But she cannot edit the original playbook
And I can still edit my original
```

#### Scenario: EDITOR role can edit and re-share
```gherkin
Given I share my playbook with my co-planner as "EDITOR"
When she clones it and starts customizing
She can also share it with her team
But I still own the original (I can revoke her access anytime)
```

#### Scenario: Revoke access to shared playbook
```gherkin
Given I shared my playbook with 3 people
When I click "Manage sharing"
Then I see a list: "priyanka@email.com (VIEWER), friend@email.com (VIEWER)"
When I click the X next to priyanka's email
Then she loses access immediately
And she sees a message: "Access revoked: You can no longer access this playbook"
```

#### Scenario: Public vs. Private playbook (future)
```gherkin
Given I have a beautiful playbook I'm proud of
When I click "Share Settings"
Then I see an option: "Make this public? (Anyone can find and clone)"
But for MVP, this is disabled
And only email invites work
```

#### Scenario: Page typography meets $10K standard
```gherkin
Given I view the "Share Playbook" dialog
Then all text uses Cormorant Garamond (title) + DM Sans (body)
And email input is DM Sans, 14px
And role radio buttons use DM Sans, 14px
```

#### Scenario: Mobile usability — share on 375px screen
```gherkin
Given I view the share dialog on a phone
Then the email input field is 44px tall
And "Send Invites" button is 44×44px minimum
And the role selector doesn't compress
```

### Out-of-Scope
- ❌ Public playbook marketplace (Phase 6)
- ❌ Playbook ratings/reviews (Phase 6)
- ❌ Clone + auto-map to different wedding date (Phase 5.3)
- ❌ Bulk clone (planner creating 10 weddings at once) — Phase 6

### Data Contract

See `PlaybookShare` interface above (in Story 3).

### UI/UX Notes
- Share button appears next to playbook name in Settings
- Dialog shows current sharing status: "Shared with 3 people"
- Invite email template: "Hi! I'm sharing my wedding playbook with you so you can clone it for your wedding. [Link]"
- After cloning, the cloner gets a new, independent wedding they own (original is read-only to them)

---

## Summary: 4 Stories, 1 Feature

| Story | Scope | Why It Matters | Est. Effort |
|-------|-------|----------------|------------|
| Google Contacts Import | 2-click invite 50 guests | Removes spreadsheet friction | 3–4 days |
| Task Delegation | Assign to multiple family | Operationalizes Nov 25 coordination | 3–4 days |
| Save as Playbook | Snapshot full wedding config | Makes Himanshu's wedding reusable | 4–5 days |
| Share Playbook | Invite-based sharing + clone | Unlocks Phase 6 revenue (couples→planners) | 3–4 days |

**Total Estimate**: 13–17 days (3 weeks of development)

---

## Next Steps (After This Document)

1. ✅ **BA Complete** (this document)
2. 🔄 **System Architect** → Schema design + API routes + database migrations
3. 🔄 **SSDT** → Write failing tests (Vitest + Playwright)
4. 🔄 **SSDE** → Implementation (React components + API + Prisma)
5. 🔄 **CSE** → Documentation + user help text
6. ✅ **Orchestrator** → Merge approval

---

## How to Use This Document Next Time

When you're ready to execute (skip BA phase):

1. Save this file to `/docs/features/PLAYBOOK_SYSTEM_MVP.md`
2. Next time, run `/orchestrator` with reference: **"See PLAYBOOK_SYSTEM_MVP.md for full spec"**
3. Hand off directly to `/system-architect` with the 4 data contracts above
4. SSDT uses the Gherkin scenarios to write failing tests
5. SSDE implements to pass tests

This saves 2–3 hours of re-negotiation and keeps scope locked.

---

**Created**: 2026-05-31  
**Author**: Business Analyst (BA) Agent  
**Status**: Ready for System Architect Review
