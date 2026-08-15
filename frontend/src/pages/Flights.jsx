import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Search, Calendar, Users, Loader2, ArrowRight, Clock, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import FlightCard from "@/components/booking/FlightCard";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Flights() {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    from: "",
    to: "",
    date: "",
    passengers: "1",
    class: "economy"
  });
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchFlights = async () => {
    if (!searchData.from || !searchData.to || !searchData.date) return;

    setLoading(true);
    try {
      const prompt = `Find 6 available flights from ${searchData.from} to ${searchData.to} on ${searchData.date}.
      For each flight provide:
      - Airline name
      - Flight number
      - Departure time (HH:MM format)
      - Arrival time (HH:MM format)
      - Duration (e.g., "2h 30m")
      - Price in INR for ${searchData.class} class
      - Available seats
      - Stops (0 for direct, 1 for one stop)
      
      Include both budget and premium airlines. Make prices realistic for Indian domestic/international routes.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            flights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  airline: { type: "string" },
                  flight_number: { type: "string" },
                  departure_time: { type: "string" },
                  arrival_time: { type: "string" },
                  duration: { type: "string" },
                  price: { type: "number" },
                  available_seats: { type: "number" },
                  stops: { type: "number" }
                }
              }
            }
          }
        }
      });

      setFlights(response.flights || []);
    } catch (error) {
      console.error("Error searching flights:", error);
    }
    setLoading(false);
  };

  const handleFlightSelect = (flight) => {
    navigate(createPageUrl("SeatSelection"), {
      state: {
        type: "flight",
        booking: {
          ...flight,
          route: `${searchData.from} to ${searchData.to}`,
          date: searchData.date,
          passengers: parseInt(searchData.passengers),
          class: searchData.class
        }
      }
    });
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Book Flights</h1>
          </div>
          <p className="text-gray-600">Search and book flights with real-time pricing</p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-sky-100 mb-8"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div>
              <Label className="mb-2 block">From</Label>
              <Input
                placeholder="Delhi, Mumbai..."
                value={searchData.from}
                onChange={(e) => setSearchData({ ...searchData, from: e.target.value })}
                className="rounded-xl border-sky-200"
              />
            </div>

            <div>
              <Label className="mb-2 block">To</Label>
              <Input
                placeholder="Goa, Bangalore..."
                value={searchData.to}
                onChange={(e) => setSearchData({ ...searchData, to: e.target.value })}
                className="rounded-xl border-sky-200"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                Date
              </Label>
              <Input
                type="date"
                value={searchData.date}
                onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
                className="rounded-xl border-sky-200"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4" />
                Passengers
              </Label>
              <Select value={searchData.passengers} onValueChange={(val) => setSearchData({ ...searchData, passengers: val })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">Class</Label>
              <Select value={searchData.class} onValueChange={(val) => setSearchData({ ...searchData, class: val })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="economy">Economy</SelectItem>
                  <SelectItem value="premium_economy">Premium Economy</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="first">First Class</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={searchFlights}
            disabled={loading || !searchData.from || !searchData.to || !searchData.date}
            className="w-full h-12 bg-gradient-to-r from-blue-500 to-cyan-400 hover:shadow-xl rounded-xl text-lg font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Searching Flights...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Search Flights
              </>
            )}
          </Button>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">Finding best flight options...</p>
            </motion.div>
          )}

          {!loading && flights.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plane className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to Fly?</h3>
              <p className="text-gray-600">Enter your travel details to find available flights</p>
            </motion.div>
          )}

          {!loading && flights.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-800">{flights.length}</span> flights found
                </p>
              </div>

              {flights.map((flight, index) => (
                <FlightCard
                  key={index}
                  flight={flight}
                  index={index}
                  searchData={searchData}
                  onSelect={handleFlightSelect}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}