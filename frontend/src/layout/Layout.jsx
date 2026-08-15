import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plane, LayoutDashboard, Map, MessageCircle, Shield, Users, Hotel, Train, Ticket } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        // User not logged in
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const navItems = [
    { name: "Dashboard", path: createPageUrl("Dashboard"), icon: LayoutDashboard },
    { name: "Trip Planner", path: createPageUrl("TripPlanner"), icon: Map },
    { name: "AI Assistant", path: createPageUrl("AIChat"), icon: MessageCircle },
    { name: "Hotels", path: createPageUrl("Hotels"), icon: Hotel },
    { name: "Flights", path: createPageUrl("Flights"), icon: Plane },
    { name: "Trains", path: createPageUrl("Trains"), icon: Train },
    { name: "Bookings", path: createPageUrl("MyBookings"), icon: Ticket },
    { name: "Connect", path: createPageUrl("Connect"), icon: Users },
    { name: "Safety", path: createPageUrl("Safety"), icon: Shield },
    { name: "Community", path: createPageUrl("Community"), icon: Users },
  ];

  // Public pages that don't need the navbar
  const publicPages = ["Home", "Auth"];
  const isPublicPage = publicPages.includes(currentPageName);

  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-amber-50">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-amber-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Poppins', sans-serif;
        }
        
        .nav-link {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .nav-link:hover {
          transform: translateY(-2px);
        }
      `}</style>
      
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-sky-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-teal-400 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-teal-500 bg-clip-text text-transparent">
                Travel Companion
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`nav-link flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-sky-500 to-teal-400 text-white shadow-lg"
                        : "text-gray-600 hover:bg-sky-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            {user && (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-gray-800">{user.full_name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-xl hover:shadow-lg transition-all duration-300 text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-sky-100 bg-white/60 backdrop-blur">
          <div className="flex justify-around py-2">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg ${
                    isActive ? "text-sky-600" : "text-gray-500"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.name.split(" ")[0]}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
}