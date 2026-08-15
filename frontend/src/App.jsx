import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Layout from "@/layout/Layout";

import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import TripPlanner from "@/pages/TripPlanner";
import AIChat from "@/pages/AIChat";
import Hotels from "@/pages/Hotels";
import Safety from "@/pages/Safety";
import Community from "@/pages/Community";
import Flights from "@/pages/Flights";
import Trains from "@/pages/Trains";
import SeatSelection from "@/pages/SeatSelection";
import MyBookings from "@/pages/MyBookings";
import BookingCallback from "@/pages/BookingCallback";
import Connect from "@/pages/Connect";

const ROUTES = [
  { path: "/", element: <Home />, name: "Home" },
  { path: "/auth", element: <Auth />, name: "Auth" },
  { path: "/dashboard", element: <Dashboard />, name: "Dashboard" },
  { path: "/trip-planner", element: <TripPlanner />, name: "TripPlanner" },
  { path: "/ai-chat", element: <AIChat />, name: "AIChat" },
  { path: "/hotels", element: <Hotels />, name: "Hotels" },
  { path: "/safety", element: <Safety />, name: "Safety" },
  { path: "/community", element: <Community />, name: "Community" },
  { path: "/flights", element: <Flights />, name: "Flights" },
  { path: "/trains", element: <Trains />, name: "Trains" },
  { path: "/seat-selection", element: <SeatSelection />, name: "SeatSelection" },
  { path: "/my-bookings", element: <MyBookings />, name: "MyBookings" },
  { path: "/booking-callback", element: <BookingCallback />, name: "BookingCallback" },
  { path: "/connect", element: <Connect />, name: "Connect" },
];

function AppRoutes() {
  const location = useLocation();
  const current = ROUTES.find((r) => r.path === location.pathname);

  return (
    <Layout currentPageName={current?.name}>
      <Routes>
        {ROUTES.map((r) => (
          <Route key={r.path} path={r.path} element={r.element} />
        ))}
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
