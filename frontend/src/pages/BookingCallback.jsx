import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

export default function BookingCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    // Parse URL parameters for booking callback
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('booking_id');
    const statusParam = params.get('status');
    const pnr = params.get('pnr');
    
    if (statusParam && bookingId) {
      syncBooking(bookingId, statusParam, pnr);
    } else {
      setStatus("error");
    }
  }, []);

  const syncBooking = async (bookingId, statusParam, pnr) => {
    try {
      // Update booking status in database
      await base44.entities.Booking.update(bookingId, {
        status: statusParam,
        pnr: pnr || "N/A",
        synced_at: new Date().toISOString()
      });

      setBookingData({ bookingId, status: statusParam, pnr });
      setStatus("success");

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate(createPageUrl("MyBookings"));
      }, 3000);
    } catch (error) {
      console.error("Error syncing booking:", error);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-sky-100 text-center">
          {status === "processing" && (
            <>
              <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing Booking</h2>
              <p className="text-gray-600">Syncing your booking details...</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
              <p className="text-gray-600 mb-4">Your booking has been successfully synced</p>
              {bookingData?.pnr && (
                <div className="bg-gradient-to-r from-sky-50 to-teal-50 rounded-2xl p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-1">PNR Number</p>
                  <p className="text-2xl font-bold text-gray-800">{bookingData.pnr}</p>
                </div>
              )}
              <p className="text-sm text-gray-500">Redirecting to My Bookings...</p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Failed</h2>
              <p className="text-gray-600 mb-6">Unable to sync booking details. Please try again.</p>
              <Button
                onClick={() => navigate(createPageUrl("Dashboard"))}
                className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:shadow-lg rounded-xl"
              >
                Go to Dashboard
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}