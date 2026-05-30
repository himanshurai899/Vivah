const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const STORAGE_PREFIX = "vivah:";

const appState = {
  route: "dashboard",
  edit: null,
  data: {
    guests: [],
    vendors: [],
    budget: [],
    expenses: [],
    invitations: [],
    events: [],
    tasks: [],
    hotels: [],
    roomAllocations: [],
    travel: [],
    rituals: [],
    responsibilities: []
  },
  filters: {
    guestSearch: "",
    guestCity: "all",
    guestRsvp: "all",
    vendorStatus: "all",
    travelStatus: "all",
    ritualStatus: "all",
    responsibilityStatus: "all"
  }
};

const dataSources = {
  groomGuests: "data/guests/groom-guests.json",
  brideGuests: "data/guests/bride-guests.json",
  vendors: "data/vendors/vendors.json",
  budget: "data/finance/budget.json",
  expenses: "data/finance/expenses.json",
  invitations: "data/invitations/invitations.json",
  events: "data/events/events.json",
  tasks: "data/tasks/tasks.json",
  hotels: "data/hotels/hotels.json",
  roomAllocations: "data/accommodation/room-allocations.json",
  travel: "data/travel/travel.json",
  rituals: "data/rituals/rituals.json",
  responsibilities: "data/responsibilities/responsibilities.json"
};

const pageTitles = {
  dashboard: "Dashboard",
  functions: "Functions",
  guests: "Guests",
  invitation: "Invitation",
  vendors: "Vendors",
  accommodation: "Accommodation",
  travel: "Travel",
  rituals: "Rituals",
  responsibilities: "Responsibilities",
  finance: "Finance"
};

const routes = {
  dashboard: renderDashboard,
  functions: renderFunctions,
  guests: renderGuests,
  invitation: renderInvitation,
  vendors: renderVendors,
  accommodation: renderAccommodation,
  travel: renderTravel,
  rituals: renderRituals,
  responsibilities: renderResponsibilities,
  finance: renderFinance
};

const crudConfigs = {
  guests: {
    title: "Guest",
    empty: "No guests match the current filters.",
    fields: [
      textField("name", "Name", true),
      textField("familyName", "Family Name"),
      textField("mobile", "Mobile Number"),
      textField("city", "City"),
      textField("state", "State"),
      textField("relationship", "Relationship"),
      selectField("side", "Side", ["Groom", "Bride"], true),
      numberField("count", "Number of Guests", true),
      checkboxField("accommodationRequired", "Accommodation Required"),
      checkboxField("pickupRequired", "Pickup Required"),
      checkboxField("invitationSent", "Invitation Sent"),
      selectField("rsvpStatus", "RSVP Status", ["Pending", "Confirmed", "Declined"], true),
      checkboxField("giftReceived", "Gift Received"),
      textAreaField("specialNotes", "Special Notes")
    ],
    columns: [
      column("name", "Name", (item) => `${escapeHtml(item.name)}<br><small>${escapeHtml(item.mobile || "")}</small>`),
      column("familyName", "Family"),
      column("city", "City", (item) => `${escapeHtml(item.city || "-")}, ${escapeHtml(item.state || "-")}`),
      column("side", "Side"),
      column("count", "Guests"),
      column("needs", "Needs", (item) => `${item.accommodationRequired ? "Accommodation" : "No room"} / ${item.pickupRequired ? "Pickup" : "No pickup"}`),
      column("rsvpStatus", "RSVP", (item) => badge(item.rsvpStatus))
    ]
  },
  events: {
    title: "Function",
    empty: "No functions have been added yet.",
    fields: [
      textField("name", "Event Name", true),
      dateField("date", "Date"),
      textField("venue", "Venue"),
      timeField("startTime", "Start Time"),
      timeField("endTime", "End Time"),
      textField("coordinator", "Coordinator"),
      numberField("budget", "Budget"),
      listField("checklist", "Checklist Items"),
      textAreaField("notes", "Notes")
    ],
    columns: [
      column("name", "Function", (item) => `${escapeHtml(item.name)}<br><small>${escapeHtml(item.venue || "")}</small>`),
      column("date", "Date", (item) => formatOptionalDate(item.date)),
      column("time", "Time", (item) => `${escapeHtml(item.startTime || "-")} - ${escapeHtml(item.endTime || "-")}`),
      column("coordinator", "Coordinator"),
      column("budget", "Budget", (item) => INR.format(item.budget || 0)),
      column("checklist", "Checklist", (item) => listPreview(item.checklist))
    ]
  },
  tasks: {
    title: "Task",
    empty: "No tasks have been added yet.",
    fields: [
      textField("task", "Task", true),
      textField("owner", "Owner"),
      textField("backupPerson", "Backup Person"),
      dateField("deadline", "Deadline"),
      selectField("status", "Status", ["Pending", "In Progress", "Completed", "Blocked"], true),
      selectField("priority", "Priority", ["Low", "Medium", "High", "Critical"]),
      textAreaField("comments", "Comments")
    ],
    columns: [
      column("task", "Task"),
      column("owner", "Owner"),
      column("backupPerson", "Backup"),
      column("deadline", "Deadline", (item) => formatOptionalDate(item.deadline)),
      column("priority", "Priority"),
      column("status", "Status", (item) => badge(item.status))
    ]
  },
  vendors: {
    title: "Vendor",
    empty: "No vendors match the current filters.",
    fields: [
      textField("name", "Vendor Name", true),
      selectField("category", "Category", ["Photographer", "Videographer", "Caterer", "Decorator", "DJ", "Band", "Makeup Artist", "Tent Vendor", "Flower Vendor", "Priest", "Mehendi Artist", "Transportation Vendor"], true),
      textField("contactPerson", "Contact Person"),
      textField("phone", "Phone"),
      textField("email", "Email"),
      numberField("quotation", "Quotation"),
      numberField("negotiatedAmount", "Negotiated Amount"),
      numberField("finalAmount", "Final Amount"),
      numberField("advancePaid", "Advance Paid"),
      numberField("balanceDue", "Balance Due"),
      textField("contractCopy", "Contract Copy"),
      selectField("status", "Status", ["Shortlisted", "Negotiating", "Finalized", "Rejected"], true),
      numberField("rating", "Rating"),
      textAreaField("notes", "Notes")
    ],
    columns: [
      column("name", "Vendor", (item) => `${escapeHtml(item.name)}<br><small>${escapeHtml(item.notes || "")}</small>`),
      column("category", "Category"),
      column("contactPerson", "Contact", (item) => `${escapeHtml(item.contactPerson || "-")}<br><small>${escapeHtml(item.phone || "")}</small>`),
      column("finalAmount", "Final", (item) => INR.format(item.finalAmount || 0)),
      column("advancePaid", "Advance", (item) => INR.format(item.advancePaid || 0)),
      column("balanceDue", "Balance", (item) => INR.format(item.balanceDue || 0)),
      column("status", "Status", (item) => badge(item.status))
    ]
  },
  budget: {
    title: "Budget Category",
    empty: "No budget categories have been added yet.",
    fields: [
      textField("category", "Category", true),
      numberField("planned", "Planned Budget"),
      numberField("actual", "Actual Cost"),
      numberField("paid", "Paid Amount")
    ],
    columns: [
      column("category", "Category"),
      column("planned", "Planned", (item) => INR.format(item.planned || 0)),
      column("actual", "Actual", (item) => INR.format(item.actual || 0)),
      column("paid", "Paid", (item) => INR.format(item.paid || 0)),
      column("remaining", "Remaining", (item) => INR.format(Math.max((item.actual || 0) - (item.paid || 0), 0)))
    ]
  },
  expenses: {
    title: "Expense",
    empty: "No expenses have been recorded yet.",
    fields: [
      dateField("date", "Date"),
      textField("category", "Category", true),
      textField("description", "Description"),
      textField("paidTo", "Paid To"),
      numberField("amount", "Amount"),
      selectField("mode", "Payment Mode", ["Cash", "UPI", "Card", "Bank Transfer", "Cheque"])
    ],
    columns: [
      column("date", "Date", (item) => formatOptionalDate(item.date)),
      column("category", "Category"),
      column("description", "Description"),
      column("paidTo", "Paid To"),
      column("amount", "Amount", (item) => INR.format(item.amount || 0)),
      column("mode", "Mode")
    ]
  },
  invitations: {
    title: "Invitation Detail",
    empty: "No invitation details have been added yet.",
    fields: [
      selectField("section", "Section", ["Couple", "Schedule", "Venue", "RSVP", "Blessing"], true),
      textField("title", "Title", true),
      textField("primaryText", "Primary Text"),
      textAreaField("description", "Description"),
      dateField("date", "Date"),
      timeField("time", "Time"),
      textField("contact", "Contact")
    ],
    columns: [
      column("section", "Section"),
      column("title", "Title"),
      column("primaryText", "Primary Text"),
      column("date", "Date", (item) => formatOptionalDate(item.date)),
      column("time", "Time"),
      column("contact", "Contact")
    ]
  },
  hotels: {
    title: "Accommodation Property",
    empty: "No accommodation properties have been added yet.",
    fields: [
      textField("propertyName", "Property Name", true),
      selectField("propertyType", "Property Type", ["Hotel", "Guest House", "Relative Home"], true),
      textField("address", "Address"),
      textField("contactPerson", "Contact Person"),
      textField("phone", "Phone"),
      numberField("roomsAvailable", "Rooms Available"),
      numberField("roomsAllocated", "Rooms Allocated"),
      dateField("checkInDate", "Check-In Date"),
      dateField("checkOutDate", "Check-Out Date"),
      numberField("cost", "Cost")
    ],
    columns: [
      column("propertyName", "Property", (item) => `${escapeHtml(item.propertyName)}<br><small>${escapeHtml(item.propertyType || "")}</small>`),
      column("address", "Address"),
      column("contactPerson", "Contact", (item) => `${escapeHtml(item.contactPerson || "-")}<br><small>${escapeHtml(item.phone || "")}</small>`),
      column("rooms", "Rooms", (item) => `${item.roomsAllocated || 0} / ${item.roomsAvailable || 0}`),
      column("dates", "Stay Window", (item) => dateRange(item.checkInDate, item.checkOutDate)),
      column("cost", "Cost", (item) => INR.format(item.cost || 0))
    ]
  },
  roomAllocations: {
    title: "Room Allocation",
    empty: "No guest room allocations have been added yet.",
    fields: [
      textField("propertyName", "Property Name", true),
      textField("roomNumber", "Room Number"),
      listField("assignedGuests", "Assigned Guests"),
      dateField("checkInDate", "Check-In Date"),
      dateField("checkOutDate", "Check-Out Date"),
      selectField("status", "Status", ["Pending", "Confirmed", "Completed"], true)
    ],
    columns: [
      column("propertyName", "Property"),
      column("roomNumber", "Room"),
      column("assignedGuests", "Guests", (item) => listPreview(item.assignedGuests)),
      column("checkInDate", "Check-in", (item) => formatOptionalDate(item.checkInDate)),
      column("checkOutDate", "Check-out", (item) => formatOptionalDate(item.checkOutDate)),
      column("status", "Status", (item) => badge(item.status))
    ]
  },
  travel: {
    title: "Travel Record",
    empty: "No travel records match the current filters.",
    fields: [
      textField("guestName", "Guest Name", true),
      dateField("arrivalDate", "Arrival Date"),
      timeField("arrivalTime", "Arrival Time"),
      selectField("transportType", "Transport Type", ["Flight", "Train", "Bus", "Cab", "Private Vehicle"], true),
      textField("pnr", "PNR / Booking ID"),
      checkboxField("pickupRequired", "Pickup Required"),
      textField("pickupCoordinator", "Pickup Coordinator"),
      textField("vehicleNumber", "Vehicle Number"),
      selectField("status", "Status", ["Pending", "Confirmed", "Delayed", "Completed"], true)
    ],
    columns: [
      column("guestName", "Guest"),
      column("arrival", "Arrival", (item) => `${formatOptionalDate(item.arrivalDate)}<br><small>${escapeHtml(item.arrivalTime || "")}</small>`),
      column("transportType", "Transport"),
      column("pnr", "PNR"),
      column("pickup", "Pickup", (item) => `${escapeHtml(item.pickupCoordinator || "-")}<br><small>${item.pickupRequired ? "Required" : "Not required"}</small>`),
      column("vehicleNumber", "Vehicle"),
      column("status", "Status", (item) => badge(item.status))
    ]
  },
  rituals: {
    title: "Ritual",
    empty: "No rituals have been added yet.",
    fields: [
      textField("name", "Ritual Name", true),
      textAreaField("description", "Description"),
      listField("requiredItems", "Required Items"),
      textField("responsiblePerson", "Responsible Person"),
      numberField("budget", "Budget"),
      selectField("status", "Status", ["Pending", "In Progress", "Completed"], true),
      textAreaField("notes", "Priest Notes")
    ],
    columns: [
      column("name", "Ritual", (item) => `${escapeHtml(item.name)}<br><small>${escapeHtml(item.description || "")}</small>`),
      column("requiredItems", "Items", (item) => listPreview(item.requiredItems)),
      column("responsiblePerson", "Responsible"),
      column("budget", "Budget", (item) => INR.format(item.budget || 0)),
      column("status", "Status", (item) => badge(item.status))
    ]
  },
  responsibilities: {
    title: "Responsibility",
    empty: "No family responsibilities match the current filters.",
    fields: [
      textField("task", "Task", true),
      textField("owner", "Owner"),
      textField("backupPerson", "Backup Person"),
      dateField("deadline", "Deadline"),
      selectField("priority", "Priority", ["Low", "Medium", "High", "Critical"]),
      selectField("status", "Status", ["Pending", "In Progress", "Completed", "Blocked"], true)
    ],
    columns: [
      column("task", "Task"),
      column("owner", "Owner"),
      column("backupPerson", "Backup"),
      column("deadline", "Deadline", (item) => formatOptionalDate(item.deadline)),
      column("priority", "Priority"),
      column("status", "Status", (item) => badge(item.status))
    ]
  }
};

const app = document.querySelector("#app");
const pageTitle = document.querySelector("#pageTitle");
const alertStrip = document.querySelector("#alertStrip");
const exportButton = document.querySelector("#exportButton");
const weddingCardLoader = document.querySelector("#weddingCardLoader");

window.vivahOpeningCardPlayed = window.vivahOpeningCardPlayed || false;
document.addEventListener("DOMContentLoaded", init);

async function init() {
  await loadData();
  bindNavigation();
  bindThemeToggle();
  bindCrudEvents();
  render();
  playOpeningCardOnce();
}

async function loadData() {
  const loaded = await Promise.all(
    Object.entries(dataSources).map(async ([key, url]) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Unable to load ${url}`);
      }
      return [key, await response.json()];
    })
  );

  const sourceMap = Object.fromEntries(loaded);
  appState.data.guests = loadCollection("guests", [...sourceMap.groomGuests, ...sourceMap.brideGuests]);
  appState.data.vendors = loadCollection("vendors", sourceMap.vendors);
  appState.data.budget = loadCollection("budget", sourceMap.budget);
  appState.data.expenses = loadCollection("expenses", sourceMap.expenses);
  appState.data.invitations = loadCollection("invitations", sourceMap.invitations);
  appState.data.events = loadCollection("events", sourceMap.events);
  appState.data.tasks = loadCollection("tasks", sourceMap.tasks);
  appState.data.hotels = loadCollection("hotels", sourceMap.hotels);
  appState.data.roomAllocations = loadCollection("roomAllocations", sourceMap.roomAllocations);
  appState.data.travel = loadCollection("travel", sourceMap.travel);
  appState.data.rituals = loadCollection("rituals", sourceMap.rituals);
  appState.data.responsibilities = loadCollection("responsibilities", sourceMap.responsibilities);
}

function bindNavigation() {
  window.addEventListener("hashchange", () => {
    appState.route = getRouteFromHash();
    appState.edit = null;
    render();
  });

  appState.route = getRouteFromHash();
}

function bindThemeToggle() {
  const themes = ["", "theme-mehendi", "theme-reception"];
  let themeIndex = 0;
  document.querySelector("#themeToggle").addEventListener("click", () => {
    document.body.classList.remove(...themes.filter(Boolean));
    themeIndex = (themeIndex + 1) % themes.length;
    if (themes[themeIndex]) {
      document.body.classList.add(themes[themeIndex]);
    }
  });

  exportButton.addEventListener("click", exportCurrentView);
}

function bindCrudEvents() {
  app.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-crud-form]");
    if (!form) {
      return;
    }
    event.preventDefault();
    saveCrudForm(form.dataset.collection, form);
  });

  app.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]");
    if (!action) {
      return;
    }

    const { collection, id } = action.dataset;
    if (action.dataset.action === "edit") {
      appState.edit = { collection, id };
      render();
    }
    if (action.dataset.action === "delete") {
      deleteRecord(collection, id);
    }
    if (action.dataset.action === "cancel-edit") {
      appState.edit = null;
      render();
    }
  });
}

function getRouteFromHash() {
  const route = window.location.hash.replace("#", "");
  return routes[route] ? route : "dashboard";
}

function render() {
  document.querySelectorAll("[data-route]").forEach((link) => {
    link.classList.toggle("active", link.dataset.route === appState.route);
  });

  pageTitle.textContent = pageTitles[appState.route] || titleCase(appState.route);
  renderAlerts();
  routes[appState.route]();
}

function playOpeningCardOnce() {
  if (window.vivahOpeningCardPlayed || !weddingCardLoader) {
    return;
  }

  window.vivahOpeningCardPlayed = true;
  document.body.classList.add("opening-card-active");
  weddingCardLoader.classList.add("is-playing");

  weddingCardLoader.addEventListener("animationend", (event) => {
    if (event.animationName !== "loaderFade") {
      return;
    }
    weddingCardLoader.classList.remove("is-playing");
    document.body.classList.remove("opening-card-active");
  }, { once: true });
}

function renderAlerts() {
  const spend = totals();
  const overBudgetCategories = appState.data.budget
    .filter((item) => item.actual > item.planned)
    .map((item) => item.category);
  const pendingBalances = appState.data.vendors
    .filter((vendor) => vendor.status === "Finalized" && vendor.balanceDue > 0)
    .slice(0, 2);
  const roomShortage = Math.max(neededRooms() - sum(appState.data.hotels, "roomsAvailable"), 0);

  const alerts = [];
  if (spend.planned && spend.actual > spend.planned * 0.85) {
    alerts.push(`Budget utilization is at ${percent(spend.actual, spend.planned)}. Review remaining approvals.`);
  }
  if (overBudgetCategories.length) {
    alerts.push(`Overrun watch: ${overBudgetCategories.join(", ")}.`);
  }
  if (pendingBalances.length) {
    alerts.push(`Payment follow-up: ${pendingBalances.map((vendor) => vendor.name).join(", ")} have open balances.`);
  }
  if (roomShortage > 0) {
    alerts.push(`Accommodation shortage: ${roomShortage} more room${roomShortage === 1 ? "" : "s"} required.`);
  }

  alertStrip.innerHTML = alerts.map((alert) => `<div class="alert">${escapeHtml(alert)}</div>`).join("");
}

function renderDashboard() {
  const { guests, vendors, events } = appState.data;
  const spend = totals();
  const confirmedGuests = guests.filter((guest) => guest.rsvpStatus === "Confirmed").reduce((total, guest) => total + Number(guest.count || 0), 0);
  const totalGuests = guests.reduce((total, guest) => total + Number(guest.count || 0), 0);
  const stats = [
    ["Days Remaining", daysRemaining("2026-11-25"), "Until wedding day"],
    ["Total Budget", INR.format(spend.planned), `${percent(spend.actual, spend.planned)} utilized`],
    ["Total Guests", totalGuests, `${confirmedGuests} confirmed`],
    ["Vendors Finalized", vendors.filter((vendor) => vendor.status === "Finalized").length, `${vendors.length} tracked vendors`]
  ];

  app.innerHTML = `
    <section class="stats-grid">${stats.map(statCard).join("")}</section>
    <section class="two-column">
      ${chartPanel("Budget Distribution", appState.data.budget.map((item) => [item.category, item.planned]), spend.planned)}
      ${chartPanel("Guest City Distribution", groupGuestsByCity(), totalGuests)}
    </section>
    <section class="two-column">
      <article class="panel">
        <div class="panel-header"><h2>Upcoming Functions</h2><span class="badge pending">${events.length} planned</span></div>
        ${simpleList(events.slice(0, 5), "No functions have been added yet.", (event) => `
          <strong>${escapeHtml(event.name)}</strong>
          <small>${dateRange(event.date, event.date)} | ${escapeHtml(event.venue || "-")}</small>
          <small>Coordinator: ${escapeHtml(event.coordinator || "-")} | Budget: ${INR.format(event.budget || 0)}</small>
        `)}
      </article>
      <article class="panel">
        <div class="panel-header"><h2>Vendor Status</h2><span class="badge finalized">${vendors.length} vendors</span></div>
        ${chartList(groupBy(vendors, "status"), vendors.length)}
      </article>
    </section>
  `;
}

function renderFunctions() {
  app.innerHTML = `
    <section class="panel">
      <div class="panel-header"><h2>Wedding Timeline Planner</h2><span class="badge pending">${appState.data.events.length} functions</span></div>
      ${crudSection("events", visibleItems("events"))}
    </section>
    <section class="panel">
      <div class="panel-header"><h2>Operations Checklist</h2><span class="badge">${appState.data.tasks.length} tasks</span></div>
      ${crudSection("tasks", visibleItems("tasks"))}
    </section>
  `;
}

function renderGuests() {
  const guests = visibleItems("guests");
  const cities = unique(appState.data.guests.map((guest) => guest.city).filter(Boolean));
  app.innerHTML = `
    <section class="stats-grid">
      ${statCard(["Households", guests.length, "Filtered guest families"])}
      ${statCard(["Guest Count", guests.reduce((sumValue, guest) => sumValue + Number(guest.count || 0), 0), "Total people"])}
      ${statCard(["Accommodation", guests.filter((guest) => guest.accommodationRequired).length, "Families needing rooms"])}
      ${statCard(["Pickup Required", guests.filter((guest) => guest.pickupRequired).length, "Families needing transport"])}
    </section>
    <section class="panel">
      <div class="panel-header"><h2>Guest Management</h2><span class="badge">${guests.length} records</span></div>
      <div class="filters">
        <input id="guestSearch" type="search" placeholder="Search guest or family" value="${escapeAttribute(appState.filters.guestSearch)}">
        <select id="guestCity">${optionList(["all", ...cities], appState.filters.guestCity, "All cities")}</select>
        <select id="guestRsvp">${optionList(["all", "Confirmed", "Pending", "Declined"], appState.filters.guestRsvp, "All RSVP")}</select>
      </div>
      ${crudSection("guests", guests)}
    </section>
  `;
  bindFilter("#guestSearch", "guestSearch", "input", renderGuests);
  bindFilter("#guestCity", "guestCity", "change", renderGuests);
  bindFilter("#guestRsvp", "guestRsvp", "change", renderGuests);
}

function renderVendors() {
  const vendors = visibleItems("vendors");
  app.innerHTML = `
    <section class="stats-grid">
      ${statCard(["Total Vendors", appState.data.vendors.length, "Across all categories"])}
      ${statCard(["Finalized", appState.data.vendors.filter((vendor) => vendor.status === "Finalized").length, "Ready for execution"])}
      ${statCard(["Advance Paid", INR.format(sum(appState.data.vendors, "advancePaid")), "Across vendors"])}
      ${statCard(["Balance Due", INR.format(sum(appState.data.vendors, "balanceDue")), "Payment schedule"])}
    </section>
    <section class="panel">
      <div class="panel-header"><h2>Vendor Management</h2><span class="badge">${vendors.length} shown</span></div>
      <div class="filters">
        <select id="vendorStatus">${optionList(["all", "Shortlisted", "Negotiating", "Finalized", "Rejected"], appState.filters.vendorStatus, "All statuses")}</select>
      </div>
      ${crudSection("vendors", vendors)}
    </section>
  `;
  bindFilter("#vendorStatus", "vendorStatus", "change", renderVendors);
}

function renderAccommodation() {
  const roomsAvailable = sum(appState.data.hotels, "roomsAvailable");
  const roomsAllocated = sum(appState.data.hotels, "roomsAllocated");
  const guestsAssigned = appState.data.roomAllocations.reduce((total, allocation) => total + (allocation.assignedGuests || []).length, 0);

  app.innerHTML = `
    <section class="stats-grid">
      ${statCard(["Properties", appState.data.hotels.length, "Hotels, guest houses, homes"])}
      ${statCard(["Rooms Available", roomsAvailable, "Total inventory"])}
      ${statCard(["Rooms Allocated", roomsAllocated, `${Math.max(roomsAvailable - roomsAllocated, 0)} still open`])}
      ${statCard(["Guests Assigned", guestsAssigned, "Mapped to rooms"])}
    </section>
    <section class="panel">
      <div class="panel-header"><h2>Accommodation Properties</h2><span class="badge">${appState.data.hotels.length} properties</span></div>
      ${crudSection("hotels", visibleItems("hotels"))}
    </section>
    <section class="panel">
      <div class="panel-header"><h2>Room Allocations</h2><span class="badge">${appState.data.roomAllocations.length} allocations</span></div>
      ${crudSection("roomAllocations", visibleItems("roomAllocations"))}
    </section>
  `;
}

function renderTravel() {
  const travel = visibleItems("travel");
  const pickupCount = appState.data.travel.filter((entry) => entry.pickupRequired).length;
  app.innerHTML = `
    <section class="stats-grid">
      ${statCard(["Travel Records", appState.data.travel.length, "Arrivals and departures"])}
      ${statCard(["Pickups", pickupCount, "Coordinator needed"])}
      ${statCard(["Confirmed", appState.data.travel.filter((entry) => entry.status === "Confirmed").length, "Ready for manifest"])}
      ${statCard(["Pending", appState.data.travel.filter((entry) => entry.status === "Pending").length, "Need follow-up"])}
    </section>
    <section class="panel">
      <div class="panel-header"><h2>Travel Management</h2><span class="badge">${travel.length} shown</span></div>
      <div class="filters">
        <select id="travelStatus">${optionList(["all", "Pending", "Confirmed", "Delayed", "Completed"], appState.filters.travelStatus, "All statuses")}</select>
      </div>
      ${crudSection("travel", travel)}
    </section>
  `;
  bindFilter("#travelStatus", "travelStatus", "change", renderTravel);
}

function renderRituals() {
  const rituals = visibleItems("rituals");
  app.innerHTML = `
    <section class="stats-grid">
      ${statCard(["Rituals", appState.data.rituals.length, "Traditional sequence"])}
      ${statCard(["Completed", appState.data.rituals.filter((ritual) => ritual.status === "Completed").length, "Checklist done"])}
      ${statCard(["In Progress", appState.data.rituals.filter((ritual) => ritual.status === "In Progress").length, "Being prepared"])}
      ${statCard(["Planned Budget", INR.format(sum(appState.data.rituals, "budget")), "Ritual-specific budget"])}
    </section>
    <section class="panel">
      <div class="panel-header"><h2>Ritual Planner</h2><span class="badge">${rituals.length} shown</span></div>
      <div class="filters">
        <select id="ritualStatus">${optionList(["all", "Pending", "In Progress", "Completed"], appState.filters.ritualStatus, "All statuses")}</select>
      </div>
      ${crudSection("rituals", rituals)}
    </section>
  `;
  bindFilter("#ritualStatus", "ritualStatus", "change", renderRituals);
}

function renderResponsibilities() {
  const responsibilities = visibleItems("responsibilities");
  app.innerHTML = `
    <section class="stats-grid">
      ${statCard(["Responsibilities", appState.data.responsibilities.length, "Family-owned work"])}
      ${statCard(["Open", appState.data.responsibilities.filter((item) => item.status !== "Completed").length, "Still active"])}
      ${statCard(["Blocked", appState.data.responsibilities.filter((item) => item.status === "Blocked").length, "Need escalation"])}
      ${statCard(["Owners", unique(appState.data.responsibilities.map((item) => item.owner).filter(Boolean)).length, "Assigned people"])}
    </section>
    <section class="panel">
      <div class="panel-header"><h2>Family Responsibility Matrix</h2><span class="badge">${responsibilities.length} shown</span></div>
      <div class="filters">
        <select id="responsibilityStatus">${optionList(["all", "Pending", "In Progress", "Completed", "Blocked"], appState.filters.responsibilityStatus, "All statuses")}</select>
      </div>
      ${crudSection("responsibilities", responsibilities)}
    </section>
  `;
  bindFilter("#responsibilityStatus", "responsibilityStatus", "change", renderResponsibilities);
}

function renderFinance() {
  const spend = totals();
  app.innerHTML = `
    <section class="stats-grid">
      ${statCard(["Planned Budget", INR.format(spend.planned), "Approved envelope"])}
      ${statCard(["Actual Cost", INR.format(spend.actual), `${percent(spend.actual, spend.planned)} utilized`])}
      ${statCard(["Paid Amount", INR.format(spend.paid), "Cash already released"])}
      ${statCard(["Remaining", INR.format(spend.actual - spend.paid), "Against known actuals"])}
    </section>
    <section class="panel">
      <div class="panel-header"><h2>Budget Categories</h2><span class="badge">${appState.data.budget.length} categories</span></div>
      ${crudSection("budget", visibleItems("budget"))}
    </section>
    <section class="panel">
      <div class="panel-header"><h2>Recent Expenses</h2><span class="badge paid">${INR.format(sum(appState.data.expenses, "amount"))}</span></div>
      ${crudSection("expenses", visibleItems("expenses"))}
    </section>
  `;
}

function crudSection(collection, items) {
  const config = crudConfigs[collection];
  const editing = appState.edit?.collection === collection
    ? appState.data[collection].find((item) => item.id === appState.edit.id)
    : null;

  return `
    ${crudForm(collection, config, editing)}
    ${crudTable(collection, config, items)}
  `;
}

function crudForm(collection, config, editing) {
  return `
    <form class="crud-form" data-crud-form data-collection="${collection}">
      <input type="hidden" name="id" value="${escapeAttribute(editing?.id || "")}">
      <div class="form-header">
        <h3>${editing ? `Edit ${config.title}` : `Add ${config.title}`}</h3>
        ${editing ? `<button class="secondary-button" type="button" data-action="cancel-edit">Cancel</button>` : ""}
      </div>
      <div class="form-grid">
        ${config.fields.map((field) => renderField(field, editing)).join("")}
      </div>
      <div class="form-actions">
        <button class="primary-button" type="submit">${editing ? "Update" : "Add"} ${config.title}</button>
      </div>
    </form>
  `;
}

function renderField(field, item = {}) {
  const value = item?.[field.name] ?? field.defaultValue ?? "";
  const id = `${field.name}-${item?.id || "new"}`;
  const required = field.required ? "required" : "";

  if (field.type === "select") {
    return `
      <label class="field" for="${id}">
        <span>${field.label}</span>
        <select id="${id}" name="${field.name}" ${required}>
          ${field.options.map((option) => `<option value="${escapeAttribute(option)}" ${option === value ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
        </select>
      </label>
    `;
  }

  if (field.type === "checkbox") {
    return `
      <label class="field checkbox-field" for="${id}">
        <input id="${id}" type="checkbox" name="${field.name}" ${value ? "checked" : ""}>
        <span>${field.label}</span>
      </label>
    `;
  }

  if (field.type === "textarea" || field.type === "list") {
    return `
      <label class="field field-wide" for="${id}">
        <span>${field.label}</span>
        <textarea id="${id}" name="${field.name}" rows="3" ${required}>${escapeHtml(Array.isArray(value) ? value.join(", ") : value)}</textarea>
      </label>
    `;
  }

  return `
    <label class="field" for="${id}">
      <span>${field.label}</span>
      <input id="${id}" type="${field.type}" name="${field.name}" value="${escapeAttribute(value)}" ${required}>
    </label>
  `;
}

function crudTable(collection, config, items) {
  if (!items.length) {
    return `<div class="empty-state">${config.empty}</div>`;
  }

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            ${config.columns.map((item) => `<th>${escapeHtml(item.label)}</th>`).join("")}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item) => `
            <tr>
              ${config.columns.map((itemColumn) => `<td>${itemColumn.render ? itemColumn.render(item) : escapeHtml(item[itemColumn.key] ?? "-")}</td>`).join("")}
              <td>
                <div class="row-actions">
                  <button class="secondary-button" type="button" data-action="edit" data-collection="${collection}" data-id="${escapeAttribute(item.id)}">Edit</button>
                  <button class="danger-button" type="button" data-action="delete" data-collection="${collection}" data-id="${escapeAttribute(item.id)}">Delete</button>
                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function saveCrudForm(collection, form) {
  const config = crudConfigs[collection];
  const formData = new FormData(form);
  const record = {};

  config.fields.forEach((field) => {
    if (field.type === "checkbox") {
      record[field.name] = formData.has(field.name);
      return;
    }
    if (field.type === "number") {
      record[field.name] = Number(formData.get(field.name) || 0);
      return;
    }
    if (field.type === "list") {
      record[field.name] = String(formData.get(field.name) || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      return;
    }
    record[field.name] = String(formData.get(field.name) || "").trim();
  });

  const existingId = formData.get("id");
  if (existingId) {
    record.id = existingId;
    appState.data[collection] = appState.data[collection].map((item) => item.id === existingId ? record : item);
  } else {
    record.id = `${collection}-${Date.now()}`;
    appState.data[collection] = [record, ...appState.data[collection]];
  }

  persistCollection(collection);
  appState.edit = null;
  render();
}

function deleteRecord(collection, id) {
  appState.data[collection] = appState.data[collection].filter((item) => item.id !== id);
  persistCollection(collection);
  if (appState.edit?.collection === collection && appState.edit.id === id) {
    appState.edit = null;
  }
  render();
}

function visibleItems(collection) {
  if (collection === "guests") {
    return filteredGuests();
  }
  if (collection === "vendors") {
    return filteredVendors();
  }
  if (collection === "travel") {
    return filteredTravel();
  }
  if (collection === "rituals") {
    return filteredRituals();
  }
  if (collection === "responsibilities") {
    return filteredResponsibilities();
  }
  return appState.data[collection];
}

function filteredGuests() {
  const search = appState.filters.guestSearch.trim().toLowerCase();
  return appState.data.guests.filter((guest) => {
    const matchesSearch = !search || `${guest.name} ${guest.familyName}`.toLowerCase().includes(search);
    const matchesCity = appState.filters.guestCity === "all" || guest.city === appState.filters.guestCity;
    const matchesRsvp = appState.filters.guestRsvp === "all" || guest.rsvpStatus === appState.filters.guestRsvp;
    return matchesSearch && matchesCity && matchesRsvp;
  });
}

function filteredVendors() {
  return appState.data.vendors.filter((vendor) => appState.filters.vendorStatus === "all" || vendor.status === appState.filters.vendorStatus);
}

function filteredTravel() {
  return appState.data.travel.filter((entry) => appState.filters.travelStatus === "all" || entry.status === appState.filters.travelStatus);
}

function filteredRituals() {
  return appState.data.rituals.filter((ritual) => appState.filters.ritualStatus === "all" || ritual.status === appState.filters.ritualStatus);
}

function filteredResponsibilities() {
  return appState.data.responsibilities.filter((item) => appState.filters.responsibilityStatus === "all" || item.status === appState.filters.responsibilityStatus);
}

function loadCollection(collection, fallback) {
  const stored = localStorage.getItem(`${STORAGE_PREFIX}${collection}`);
  if (!stored) {
    return ensureIds(fallback, collection);
  }

  try {
    return ensureIds(JSON.parse(stored), collection);
  } catch {
    return ensureIds(fallback, collection);
  }
}

function persistCollection(collection) {
  localStorage.setItem(`${STORAGE_PREFIX}${collection}`, JSON.stringify(appState.data[collection]));
}

function ensureIds(items, collection) {
  return (Array.isArray(items) ? items : []).map((item, index) => ({
    id: item.id || `${collection}-${index + 1}`,
    ...item
  }));
}

function bindFilter(selector, key, eventName, callback) {
  const element = document.querySelector(selector);
  element?.addEventListener(eventName, (event) => {
    appState.filters[key] = event.target.value;
    appState.edit = null;
    callback();
  });
}

function statCard([label, value, context]) {
  return `
    <article class="stat-card">
      <span class="stat-label">${escapeHtml(label)}</span>
      <strong class="stat-value">${escapeHtml(value)}</strong>
      <small class="stat-context">${escapeHtml(context)}</small>
    </article>
  `;
}

function chartPanel(title, rows, total) {
  return `
    <article class="panel">
      <div class="panel-header"><h2>${escapeHtml(title)}</h2></div>
      ${chartRows(rows, total)}
    </article>
  `;
}

function chartRows(rows, total) {
  if (!rows.length) {
    return `<div class="empty-state">No data available yet.</div>`;
  }
  return `<div class="chart-list">${rows.map(([label, value]) => barRow(label, value, total)).join("")}</div>`;
}

function chartList(counts, total) {
  return chartRows(Object.entries(counts), total);
}

function barRow(label, value, total) {
  return `
    <div class="bar-row">
      <strong>${escapeHtml(label || "Unassigned")}</strong>
      <span class="bar-track"><span class="bar-fill" style="width: ${percent(value, total)}"></span></span>
      <small>${escapeHtml(value)}</small>
    </div>
  `;
}

function simpleList(items, emptyText, renderItem) {
  if (!items.length) {
    return `<div class="empty-state">${escapeHtml(emptyText)}</div>`;
  }
  return `<ul class="event-list">${items.map((item) => `<li>${renderItem(item)}</li>`).join("")}</ul>`;
}

function badge(status = "-") {
  return `<span class="badge ${statusClass(status)}">${escapeHtml(status || "-")}</span>`;
}

function listPreview(value) {
  const items = Array.isArray(value) ? value : [];
  return escapeHtml(items.join(", ") || "-");
}

function groupGuestsByCity() {
  const grouped = {};
  appState.data.guests.forEach((guest) => {
    if (!guest.city) {
      return;
    }
    grouped[guest.city] = (grouped[guest.city] || 0) + Number(guest.count || 0);
  });
  return Object.entries(grouped).sort((a, b) => b[1] - a[1]);
}

function groupBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || "Unassigned";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function totals() {
  return {
    planned: sum(appState.data.budget, "planned"),
    actual: sum(appState.data.budget, "actual"),
    paid: sum(appState.data.budget, "paid")
  };
}

function neededRooms() {
  return appState.data.guests.filter((guest) => guest.accommodationRequired).length;
}

function sum(items, key) {
  return items.reduce((total, item) => total + Number(item[key] || 0), 0);
}

function percent(value, total) {
  if (!total) {
    return "0%";
  }
  return `${Math.min(Math.round((value / total) * 100), 100)}%`;
}

function unique(values) {
  return [...new Set(values)].sort();
}

function optionList(values, current, allLabel) {
  return values.map((value) => {
    const label = value === "all" ? allLabel : value;
    return `<option value="${escapeAttribute(value)}" ${value === current ? "selected" : ""}>${escapeHtml(label)}</option>`;
  }).join("");
}

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date));
}

function formatOptionalDate(date) {
  return date ? formatDate(date) : "-";
}

function dateRange(start, end) {
  return `${formatOptionalDate(start)} - ${formatOptionalDate(end)}`;
}

function statusClass(status = "") {
  return String(status).toLowerCase().replaceAll(" ", "-");
}

function daysRemaining(date) {
  const target = new Date(`${date}T00:00:00+05:30`);
  const today = new Date();
  const diff = target - today;
  return Math.max(Math.ceil(diff / 86400000), 0);
}

function exportCurrentView() {
  const exportMap = {
    guests: filteredGuests,
    vendors: filteredVendors,
    finance: () => [...appState.data.budget, ...appState.data.expenses],
    accommodation: () => [...appState.data.hotels, ...appState.data.roomAllocations],
    travel: filteredTravel,
    rituals: filteredRituals,
    responsibilities: filteredResponsibilities,
    functions: () => [...appState.data.events, ...appState.data.tasks],
    dashboard: () => appState.data.events
  };
  const rows = (exportMap[appState.route] || exportMap.dashboard)();
  const csv = toCsv(rows);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `vivah-${appState.route}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function toCsv(rows) {
  if (!rows.length) {
    return "";
  }
  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const body = rows.map((row) => headers.map((header) => `"${String(row[header] ?? "").replaceAll('"', '""')}"`).join(","));
  return [headers.join(","), ...body].join("\n");
}

function textField(name, label, required = false) {
  return { name, label, type: "text", required };
}

function numberField(name, label, required = false) {
  return { name, label, type: "number", required, defaultValue: 0 };
}

function dateField(name, label, required = false) {
  return { name, label, type: "date", required };
}

function timeField(name, label, required = false) {
  return { name, label, type: "time", required };
}

function textAreaField(name, label, required = false) {
  return { name, label, type: "textarea", required };
}

function listField(name, label, required = false) {
  return { name, label, type: "list", required };
}

function checkboxField(name, label) {
  return { name, label, type: "checkbox" };
}

function selectField(name, label, options, required = false) {
  return { name, label, type: "select", options, required, defaultValue: options[0] };
}

function column(key, label, render = null) {
  return { key, label, render };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
