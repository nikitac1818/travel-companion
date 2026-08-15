import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Train, Search, Calendar, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import TrainCard from "@/components/booking/TrainCard";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Trains() {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    from: "",
    to: "",
    date: "",
    passengers: "1",
    class: "sleeper"
  });
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchTrains = async () => {
    if (!searchData.from || !searchData.to || !searchData.date) return;

    setLoading(true);
    try {
      const prompt = `Find 5 available Indian trains from ${searchData.from} to ${searchData.to} on ${searchData.date}.
      For each train provide:
      - Train name (e.g., "Rajdhani Express")
      - Train number (5 digits)
      - Departure time (HH:MM format)
      - Arrival time (HH:MM format)
      - Duration (e.g., "8h 30m")
      - ${searchData.class} class fare in INR
      - Available berths in ${searchData.class} class
      - Days running (e.g., "Daily" or "Mon, Wed, Fri")
      
      Include popular trains like Rajdhani, Shatabdi, Duronto, Express trains.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            trains: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  train_name: { type: "string" },
                  train_number: { type: "string" },
                  departure_time: { type: "string" },
                  arrival_time: { type: "string" },
                  duration: { type: "string" },
                  fare: { type: "number" },
                  available_berths: { type: "number" },
                  days_running: { type: "string" }
                }
              }
            }
          }
        }
      });

      setTrains(response.trains || []);
    } catch (error) {
      console.error("Error searching trains:", error);
    }
    setLoading(false);
  };

  const handleTrainSelect = (train) => {
    navigate(createPageUrl("SeatSelection"), {
      state: {
        type: "train",
        booking: {
          ...train,
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
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <Train className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Book Train Tickets</h1>
          </div>
          <p className="text-gray-600">Search trains with smart berth allocation & PNR tracking</p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-sky-100 mb-8"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div>
              <Label className="mb-2 block">From Station</Label>
              <Input
                placeholder="Mumbai, Delhi..."
                value={searchData.from}
                onChange={(e) => setSearchData({ ...searchData, from: e.target.value })}
                className="rounded-xl border-sky-200"
              />
            </div>

            <div>
              <Label className="mb-2 block">To Station</Label>
              <Input
                placeholder="Bangalore, Kolkata..."
                value={searchData.to}
                onChange={(e) => setSearchData({ ...searchData, to: e.target.value })}
                className="rounded-xl border-sky-200"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                Journey Date
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
                  <SelectItem value="sleeper">Sleeper (SL)</SelectItem>
                  <SelectItem value="3ac">3-Tier AC (3A)</SelectItem>
                  <SelectItem value="2ac">2-Tier AC (2A)</SelectItem>
                  <SelectItem value="1ac">First AC (1A)</SelectItem>
                  <SelectItem value="chair_car">Chair Car (CC)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={searchTrains}
            disabled={loading || !searchData.from || !searchData.to || !searchData.date}
            className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-xl rounded-xl text-lg font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Searching Trains...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Search Trains
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
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">Finding available trains...</p>
            </motion.div>
          )}

          {!loading && trains.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Train className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Search Trains</h3>
              <p className="text-gray-600">Enter journey details to find available trains</p>
            </motion.div>
          )}

          {!loading && trains.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-800">{trains.length}</span> trains found
                </p>
              </div>

              {trains.map((train, index) => (
                <TrainCard
                  key={index}
                  train={train}
                  index={index}
                  searchData={searchData}
                  onSelect={handleTrainSelect}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}