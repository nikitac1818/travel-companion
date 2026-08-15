// Maps a page name (e.g. "TripPlanner") to its route path (e.g. "/trip-planner").
// Keeps the same createPageUrl(pageName) calling convention used throughout
// the original Base44-exported pages, so page components didn't need rewriting.

const PAGE_ROUTES = {
  Home: "/",
  Auth: "/auth",
  Dashboard: "/dashboard",
  TripPlanner: "/trip-planner",
  AIChat: "/ai-chat",
  Hotels: "/hotels",
  Safety: "/safety",
  Community: "/community",
  Flights: "/flights",
  Trains: "/trains",
  SeatSelection: "/seat-selection",
  MyBookings: "/my-bookings",
  BookingCallback: "/booking-callback",
  Connect: "/connect",
};

export function createPageUrl(pageName) {
  return PAGE_ROUTES[pageName] || "/";
}
