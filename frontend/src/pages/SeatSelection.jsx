import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import SeatMap from "@/components/booking/SeatMap";

export default function SeatSelection() {
  const location = useLocation();
  const navigate = useNavigate();
  const { type, booking } = location.state || {};

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [confirming, setConfirming] = useState(false);

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center">
        <div>
          <p className="text-gray-600 mb-4">No booking selected. Start a search first.</p>
          <Button onClick={() => navigate(createPageUrl("Flights"))}>Back to Flights</Button>
        </div>
      </div>
    );
  }

  const passengerCount = booking.passengers || 1;
  const passengers = Array.from({ length: passengerCount }, (_, i) => ({
    name: `Passenger ${i + 1}`,
    isWomen: false,
  }));

  const handleSeatSelect = (seatNumber) => {
    if (selectedSeats.length >= passengerCount) return;
    setSelectedSeats((prev) => [...prev, seatNumber]);
  };

  const handleSeatDeselect = (seatNumber) => {
    setSelectedSeats((prev) => prev.filter((s) => s !== seatNumber));
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await base44.entities.Booking.create({
        type,
        service_name: booking.airline || booking.train_name || "N/A",
        service_number: booking.flight_number || booking.train_number || "N/A",
        route: booking.route,
        date: booking.date,
        passengers: passengerCount,
        seats: selectedSeats.join(", "),
        total_price: booking.price || 0,
        status: "confirmed",
      });
      navigate(createPageUrl("MyBookings"));
    } catch (error) {
      console.error("Error confirming booking:", error);
    }
    setConfirming(false);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Select Your Seats</h1>
          <p className="text-gray-600">
            {booking.route} · {booking.date} · {passengerCount} passenger{passengerCount > 1 ? "s" : ""}
          </p>
        </motion.div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-4 sm:p-6 shadow-xl border border-sky-100 mb-6">
          <SeatMap
            type={type}
            selectedSeats={selectedSeats}
            passengers={passengers}
            onSeatSelect={handleSeatSelect}
            onSeatDeselect={handleSeatDeselect}
          />
        </div>

        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-sky-100">
          <div>
            <p className="text-sm text-gray-500">Total Price</p>
            <p className="text-2xl font-bold text-sky-600 flex items-center">
              <IndianRupee className="w-5 h-5" />
              {(booking.price || 0).toLocaleString("en-IN")}
            </p>
          </div>
          <Button
            disabled={selectedSeats.length !== passengerCount || confirming}
            onClick={handleConfirm}
            className="bg-gradient-to-r from-blue-500 to-cyan-400"
          >
            {confirming ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Booking"}
          </Button>
        </div>
      </div>
    </div>
  );
}
