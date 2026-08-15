import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Star, MapPin, DollarSign, Hotel as HotelIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import HotelCard from "@/components/hotel/HotelCard";

export default function Hotels() {
  const [destination, setDestination] = useState("");
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: "all",
    rating: "all",
    sortBy: "relevance"
  });

  const searchHotels = async () => {
    if (!destination.trim()) return;

    setLoading(true);
    try {
      const prompt = `Find 8 popular hotels in ${destination} with the following details for each:
        - Hotel name
        - Approximate price per night in INR
        - Star rating (1-5)
        - Brief description
        - Key amenities (list 3-4)
        - Distance from city center
        - Address area/locality
        
        Provide a mix of budget, mid-range, and luxury options.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            hotels: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  price_per_night: { type: "number" },
                  rating: { type: "number" },
                  description: { type: "string" },
                  amenities: { type: "array", items: { type: "string" } },
                  distance_from_center: { type: "string" },
                  locality: { type: "string" }
                }
              }
            }
          }
        }
      });

      setHotels(response.hotels || []);
    } catch (error) {
      console.error("Error searching hotels:", error);
    }
    setLoading(false);
  };

  const filteredHotels = hotels.filter(hotel => {
    if (filters.priceRange !== "all") {
      const price = hotel.price_per_night;
      if (filters.priceRange === "budget" && price > 3000) return false;
      if (filters.priceRange === "mid" && (price < 3000 || price > 8000)) return false;
      if (filters.priceRange === "luxury" && price < 8000) return false;
    }
    if (filters.rating !== "all") {
      const minRating = parseFloat(filters.rating);
      if (hotel.rating < minRating) return false;
    }
    return true;
  });

  const sortedHotels = [...filteredHotels].sort((a, b) => {
    if (filters.sortBy === "price_low") return a.price_per_night - b.price_per_night;
    if (filters.sortBy === "price_high") return b.price_per_night - a.price_per_night;
    if (filters.sortBy === "rating") return b.rating - a.rating;
    return 0;
  });

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
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
              <HotelIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Find Hotels</h1>
          </div>
          <p className="text-gray-600">Discover and book the perfect stay for your journey</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-sky-100 mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Enter destination (e.g., Mumbai, Goa, Paris)..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchHotels()}
                className="pl-12 h-14 rounded-2xl border-sky-200 text-lg"
              />
            </div>
            <Button
              onClick={searchHotels}
              disabled={loading || !destination.trim()}
              className="h-14 px-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-xl rounded-2xl text-lg font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Search Hotels
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        {hotels.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-sky-100 mb-6"
          >
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Filters:</span>
              </div>

              <Select value={filters.priceRange} onValueChange={(val) => setFilters({ ...filters, priceRange: val })}>
                <SelectTrigger className="w-40 rounded-xl">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="budget">Budget (&lt; 3000)</SelectItem>
                  <SelectItem value="mid">Mid-Range (3000-8000)</SelectItem>
                  <SelectItem value="luxury">Luxury (&gt; 8000)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.rating} onValueChange={(val) => setFilters({ ...filters, rating: val })}>
                <SelectTrigger className="w-40 rounded-xl">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                  <SelectItem value="2">2+ Stars</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.sortBy} onValueChange={(val) => setFilters({ ...filters, sortBy: val })}>
                <SelectTrigger className="w-40 rounded-xl">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>

              <span className="text-sm text-gray-500 ml-auto">
                {sortedHotels.length} hotels found
              </span>
            </div>
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">Finding the best hotels for you...</p>
            </motion.div>
          )}

          {!loading && hotels.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HotelIcon className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Search for Hotels</h3>
              <p className="text-gray-600">Enter a destination to discover amazing places to stay</p>
            </motion.div>
          )}

          {!loading && sortedHotels.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedHotels.map((hotel, index) => (
                <HotelCard key={index} hotel={hotel} index={index} destination={destination} />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}