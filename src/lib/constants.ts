export const WEDDING_ID = process.env.WEDDING_ID ?? process.env.NEXT_PUBLIC_WEDDING_ID ?? "vivah-2026"

export const VENDOR_CATEGORIES: Record<string, string> = {
  PHOTOGRAPHER: "Photographer",
  VIDEOGRAPHER: "Videographer",
  CATERER: "Caterer",
  DECORATOR: "Decorator",
  DJ: "DJ",
  BAND: "Band",
  MAKEUP: "Makeup Artist",
  TENT: "Tent Vendor",
  FLOWER: "Flower Vendor",
  PRIEST: "Priest / Pandit",
  MEHENDI: "Mehendi Artist",
  TRANSPORT: "Transport",
  EVENT_PLANNER: "Event Planner",
  OTHER: "Other",
}

export const EVENT_TYPES: Record<string, string> = {
  PRE_WEDDING: "Pre-Wedding",
  WEDDING: "Wedding",
  POST_WEDDING: "Post-Wedding",
}

export const RSVP_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  DECLINED: "Declined",
}

export const VENDOR_STATUS_LABELS: Record<string, string> = {
  SHORTLISTED: "Shortlisted",
  NEGOTIATING: "Negotiating",
  FINALIZED: "Finalized",
  REJECTED: "Rejected",
}

export const TASK_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  BLOCKED: "Blocked",
}

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
}

export const TRANSPORT_TYPES: Record<string, string> = {
  FLIGHT: "Flight",
  TRAIN: "Train",
  BUS: "Bus",
  CAB: "Cab",
  PRIVATE_VEHICLE: "Private Vehicle",
}

export const BUDGET_CATEGORIES = [
  "Venue & Banquet Hall",
  "Food & Catering",
  "Photography & Videography",
  "Decorations & Flowers",
  "Accommodation",
  "Travel & Transportation",
  "Jewelry & Accessories",
  "Clothing & Attire",
  "Invitation Cards & Stationery",
  "Gifts & Favors",
  "Rituals & Puja Samagri",
  "Entertainment (DJ/Band)",
  "Emergency Fund",
  "Miscellaneous",
]
