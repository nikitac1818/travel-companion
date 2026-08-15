import React from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, DollarSign, Star, Save, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TripItinerary({ itinerary, index, formData, onSave }) {
  const gradients = [
    "from-purple-400 to-pink-500",
    "from-blue-400 to-cyan-500",
    "from-green-400 to-teal-500",
    "from-orange-400 to-red-500"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-sky-100 overflow-hidden"
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${gradients[index % gradients.length]} p-6 text-white`}>
        <h3 className="text-2xl font-bold mb-2">{itinerary.title}</h3>
        <p className="text-white/90">{itinerary.description}</p>
        <div className="flex items-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{itinerary.daily_plan?.length || 0} Days</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            <span>₹{itinerary.total_estimated_cost?.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Highlights */}
      {itinerary.highlights && itinerary.highlights.length > 0 && (
        <div className="p-6 border-b border-sky-100">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            Trip Highlights
          </h4>
          <div className="flex flex-wrap gap-2">
            {itinerary.highlights.map((highlight, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-gradient-to-r from-sky-50 to-teal-50 rounded-full text-sm text-gray-700 border border-sky-100"
              >
                {highlight}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Daily Plan */}
      <div className="p-6">
        <h4 className="font-semibold text-gray-800 mb-4">Daily Itinerary</h4>
        <div className="space-y-4">
          {itinerary.daily_plan?.map((day, dayIdx) => (
            <div key={dayIdx} className="border-l-4 border-sky-400 pl-4 py-2">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-bold text-gray-800">Day {day.day}</h5>
                <span className="text-sm font-semibold text-sky-600">
                  ₹{day.estimated_cost?.toLocaleString('en-IN')}
                </span>
              </div>
              
              {day.activities && day.activities.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-medium text-gray-500 mb-1">Activities:</p>
                  <ul className="space-y-1">
                    {day.activities.map((activity, actIdx) => (
                      <li key={actIdx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-sky-500 mt-1">•</span>
                        <span>{activity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {day.restaurants && day.restaurants.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Dining:</p>
                  <div className="flex flex-wrap gap-2">
                    {day.restaurants.map((restaurant, restIdx) => (
                      <span
                        key={restIdx}
                        className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-100"
                      >
                        🍴 {restaurant}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 bg-gradient-to-r from-sky-50 to-teal-50 flex gap-3">
        <Button
          onClick={() => onSave(itinerary)}
          className="flex-1 bg-gradient-to-r from-sky-500 to-teal-400 hover:shadow-lg rounded-xl"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Trip
        </Button>
        <Button
          variant="outline"
          className="rounded-xl border-sky-300 hover:bg-white"
        >
          <Heart className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}