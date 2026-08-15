import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, Calendar, MapPin, Clock, AlertCircle, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const user = await base44.auth.me();
      const userBookings = await base44.entities.Booking.filter(
        { created_by: user.email },
        "-created_date",
        50
      );
      setBookings(userBookings);
    } catch (error) {
      navigate(createPageUrl("Auth"));
    }
    setLoading(false);
  };

  const cancelBooking = async (id) => {
    setCancelingId(id);
    try {
      await base44.entities.Booking.update(id, { status: "cancelled" });
      loadBookings();
    } catch (error) {
      console.error("Error canceling booking:", error);
    }
    setCancelingId(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-700 border-green-200";
      case "cancelled": return "bg-red-100 text-red-700 border-red-200";
      case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">My Bookings</h1>
          </div>
          <p className="text-gray-600">Manage your flight and train bookings</p>
        </motion.div>

        {/* Bookings List */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">Loading bookings...</p>
            </motion.div>
          ) : bookings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-sky-100 text-center"
            >
              <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Bookings Yet</h3>
              <p className="text-gray-600 mb-6">Start your journey by booking a flight or train</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => navigate(createPageUrl("Flights"))}
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:shadow-lg rounded-xl"
                >
                  Book a Flight
                </Button>
                <Button
                  onClick={() => navigate(createPageUrl("Trains"))}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg rounded-xl"
                >
                  Book a Train
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-sky-100 overflow-hidden"
                >
                  <div className="p-4 sm:p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">{booking.service_name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{booking.service_number}</p>
                      </div>
                      
                      <div className="text-left sm:text-right">
                        <p className="text-sm text-gray-500">PNR</p>
                        <p className="text-lg font-bold text-gray-800">{booking.pnr}</p>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Route</p>
                          <p className="text-sm font-semibold text-gray-800">{booking.route}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Date</p>
                          <p className="text-sm font-semibold text-gray-800">
                            {format(new Date(booking.date), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Ticket className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Seats</p>
                          <p className="text-sm font-semibold text-gray-800">{booking.seats}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Total Fare</p>
                          <p className="text-sm font-semibold text-gray-800">
                            &#8377;{booking.total_price?.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {booking.status === "confirmed" && (
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-sky-100">
                        <Button
                          onClick={() => cancelBooking(booking.id)}
                          disabled={cancelingId === booking.id}
                          variant="outline"
                          className="flex-1 sm:flex-initial rounded-xl border-red-300 text-red-600 hover:bg-red-50"
                        >
                          {cancelingId === booking.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                              Canceling...
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4 mr-2" />
                              Cancel Booking
                            </>
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          className="flex-1 sm:flex-initial rounded-xl border-sky-300 hover:bg-sky-50"
                        >
                          Download Ticket
                        </Button>
                      </div>
                    )}

                    {booking.status === "cancelled" && (
                      <div className="flex items-center gap-2 text-red-600 pt-4 border-t border-sky-100">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">This booking has been cancelled</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}