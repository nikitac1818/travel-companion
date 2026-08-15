import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, DollarSign, MapPin, Sparkles, Loader2, Heart, Save, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import TripItinerary from "@/components/trip/TripItinerary";

export default function TripPlanner() {
  const [formData, setFormData] = useState({
    destination: "",
    start_date: "",
    end_date: "",
    budget: "",
    interests: [],
    trip_type: "adventure"
  });
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const interestOptions = ["Adventure", "Culture", "Nature", "Food", "Shopping", "History", "Beach", "Mountains"];
  const tripTypes = [
    { value: "adventure", label: "🏔️ Adventure Seeker", color: "from-orange-400 to-red-500" },
    { value: "cultural", label: "🏛️ Cultural Explorer", color: "from-purple-400 to-pink-500" },
    { value: "relaxed", label: "🏖️ Relaxed Vacation", color: "from-blue-400 to-cyan-500" },
    { value: "romantic", label: "💑 Romantic Getaway", color: "from-pink-400 to-rose-500" },
    { value: "family", label: "👨‍👩‍👧‍👦 Family Fun", color: "from-green-400 to-teal-500" }
  ];

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const generateItineraries = async () => {
    if (!formData.destination || !formData.start_date || !formData.end_date) return;

    setLoading(true);
    try {
      const days = Math.ceil((new Date(formData.end_date) - new Date(formData.start_date)) / (1000 * 60 * 60 * 24)) + 1;
      
      // Generate multiple itinerary options
      const prompt = `Create 3 different ${days}-day travel itineraries for ${formData.destination} with these preferences:
        - Budget: ₹${formData.budget} INR
        - Interests: ${formData.interests.join(", ")}
        - Trip Type: ${formData.trip_type}
        
        For each itinerary, provide:
        1. A catchy title (e.g., "Cultural Heritage Trail")
        2. Daily breakdown with 3-4 activities per day
        3. Restaurant recommendations for each day
        4. Estimated daily budget in INR
        5. Must-visit attractions
        
        Make them diverse - one adventure-focused, one culture-focused, one balanced.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            itineraries: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  daily_plan: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        day: { type: "number" },
                        activities: { type: "array", items: { type: "string" } },
                        restaurants: { type: "array", items: { type: "string" } },
                        estimated_cost: { type: "number" }
                      }
                    }
                  },
                  total_estimated_cost: { type: "number" },
                  highlights: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setItineraries(response.itineraries || []);
    } catch (error) {
      console.error("Error generating itinerary:", error);
    }
    setLoading(false);
  };

  const saveTrip = async (itinerary) => {
    try {
      await base44.entities.Trip.create({
        ...formData,
        budget: parseFloat(formData.budget),
        itinerary: itinerary
      });
      alert("Trip saved successfully!");
    } catch (error) {
      console.error("Error saving trip:", error);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">AI Trip Planner</h1>
          </div>
          <p className="text-gray-600">Let AI create the perfect itinerary for your adventure</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Planning Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-sky-100 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Trip Details</h2>
              
              <div className="space-y-5">
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-sky-600" />
                    Destination
                  </Label>
                  <Input
                    placeholder="e.g., Paris, France"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="rounded-xl border-sky-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-sky-600" />
                      Start Date
                    </Label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="rounded-xl border-sky-200"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-sky-600" />
                      End Date
                    </Label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="rounded-xl border-sky-200"
                    />
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-sky-600" />
                    Budget (INR)
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g., 50000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="rounded-xl border-sky-200"
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Trip Type</Label>
                  <Select
                    value={formData.trip_type}
                    onValueChange={(value) => setFormData({ ...formData, trip_type: value })}
                  >
                    <SelectTrigger className="rounded-xl border-sky-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tripTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block">Interests</Label>
                  <div className="flex flex-wrap gap-2">
                    {interestOptions.map(interest => (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          formData.interests.includes(interest)
                            ? "bg-gradient-to-r from-sky-500 to-teal-400 text-white shadow-md"
                            : "bg-sky-50 text-gray-600 hover:bg-sky-100"
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={generateItineraries}
                  disabled={loading || !formData.destination}
                  className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-xl rounded-xl text-white font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating Magic...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Itineraries
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Generated Itineraries */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600 font-medium">AI is crafting your perfect itinerary...</p>
                </motion.div>
              )}

              {!loading && itineraries.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-sky-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-10 h-10 text-sky-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to Plan?</h3>
                  <p className="text-gray-600">Fill in your trip details and let AI create amazing itineraries</p>
                </motion.div>
              )}

              {!loading && itineraries.length > 0 && (
                <div className="space-y-6">
                  {itineraries.slice(0, showMore ? itineraries.length : 2).map((itinerary, index) => (
                    <TripItinerary
                      key={index}
                      itinerary={itinerary}
                      index={index}
                      formData={formData}
                      onSave={saveTrip}
                    />
                  ))}

                  {itineraries.length > 2 && !showMore && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center"
                    >
                      <Button
                        onClick={() => setShowMore(true)}
                        variant="outline"
                        className="rounded-xl border-sky-300 hover:bg-sky-50"
                      >
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Show More Options
                      </Button>
                    </motion.div>
                  )}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}