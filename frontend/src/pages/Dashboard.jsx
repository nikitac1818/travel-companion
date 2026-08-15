import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Map, MessageCircle, Shield, Users, Hotel, Cloud, Sun, CloudRain, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import WeatherWidget from "@/components/dashboard/WeatherWidget";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        const userTrips = await base44.entities.Trip.filter(
          { created_by: currentUser.email },
          "-created_date",
          5
        );
        setTrips(userTrips);
      } catch (error) {
        navigate(createPageUrl("Auth"));
      }
    };
    loadData();
  }, [navigate]);

  const dashboardCards = [
    {
      title: "AI Trip Planner",
      description: "Create personalized itineraries with AI",
      icon: Map,
      color: "from-purple-400 to-pink-400",
      path: "TripPlanner"
    },
    {
      title: "AI Travel Assistant",
      description: "Chat with AI for instant travel guidance",
      icon: MessageCircle,
      color: "from-blue-400 to-cyan-400",
      path: "AIChat"
    },
    {
      title: "Hotels & Booking",
      description: "Find and book perfect accommodations",
      icon: Hotel,
      color: "from-amber-400 to-orange-400",
      path: "Hotels"
    },
    {
      title: "Safety & SOS",
      description: "Emergency tools and location sharing",
      icon: Shield,
      color: "from-red-400 to-pink-500",
      path: "Safety"
    },
    {
      title: "Community",
      description: "Share experiences and discover stories",
      icon: Users,
      color: "from-green-400 to-emerald-400",
      path: "Community"
    }
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{backgroundImage: "url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80')"}}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-sky-900/80 via-purple-900/70 to-pink-900/80 backdrop-blur-sm" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/50" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-2xl">
                Welcome back, {user.full_name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-white/90 drop-shadow-lg">Ready to plan your next adventure?</p>
            </div>
            <WeatherWidget user={user} />
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500 rounded-2xl p-4 text-white shadow-2xl neon-blue"
            >
              <p className="text-sm opacity-90">Total Trips</p>
              <p className="text-3xl font-bold">{trips.length}</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-teal-400 to-green-500 rounded-2xl p-4 text-white shadow-lg"
            >
              <p className="text-sm opacity-90">Countries</p>
              <p className="text-3xl font-bold">{new Set(trips.map(t => t.destination)).size}</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl p-4 text-white shadow-lg"
            >
              <p className="text-sm opacity-90">Upcoming</p>
              <p className="text-3xl font-bold">
                {trips.filter(t => new Date(t.start_date) > new Date()).length}
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-4 text-white shadow-lg"
            >
              <p className="text-sm opacity-90">Saved ₹</p>
              <p className="text-3xl font-bold">
                {trips.reduce((sum, t) => sum + (t.budget || 0), 0).toLocaleString('en-IN')}
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Dashboard Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {dashboardCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                onClick={() => navigate(createPageUrl(card.path))}
                className="glass-strong rounded-3xl p-6 shadow-2xl border border-white/30 cursor-pointer hover:shadow-cyan-500/50 hover:neon-blue transition-all duration-300 group"
                >
                <div className={`w-14 h-14 bg-gradient-to-br ${card.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-sky-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-gray-600 text-sm">{card.description}</p>
                <div className="mt-4 flex items-center text-sky-600 font-medium text-sm group-hover:translate-x-2 transition-transform">
                  Explore →
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Recent Trips */}
        {trips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-sky-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-2xl font-bold text-gray-800">Your Recent Trips</h2>
            </div>
            <div className="space-y-3">
              {trips.slice(0, 3).map((trip, index) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-sky-50 to-teal-50 rounded-2xl hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate(createPageUrl("TripPlanner"))}
                >
                  <div>
                    <p className="font-semibold text-gray-800">{trip.destination}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(trip.start_date).toLocaleDateString('en-IN')} - {new Date(trip.end_date).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sky-600">₹{trip.budget?.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-500 capitalize">{trip.trip_type}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}