import React from "react";
import { motion } from "framer-motion";
import { Star, MapPin, Wifi, Coffee, Car, Waves, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HotelCard({ hotel, index, destination }) {
  const amenityIcons = {
    wifi: Wifi,
    breakfast: Coffee,
    parking: Car,
    pool: Waves,
    default: Star
  };

  const getAmenityIcon = (amenity) => {
    const lower = amenity.toLowerCase();
    if (lower.includes("wifi") || lower.includes("internet")) return Wifi;
    if (lower.includes("breakfast") || lower.includes("food")) return Coffee;
    if (lower.includes("parking") || lower.includes("car")) return Car;
    if (lower.includes("pool") || lower.includes("swim")) return Waves;
    return Star;
  };

  // Create booking URLs for multiple providers
  const bookingUrls = {
    makemytrip: `https://www.makemytrip.com/hotels/hotel-listing/?city=${encodeURIComponent(destination)}`,
    agoda: `https://www.agoda.com/search?city=${encodeURIComponent(destination)}`,
    booking: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}`
  };

  const handleBooking = (provider) => {
    const url = bookingUrls[provider];
    const callbackUrl = encodeURIComponent(window.location.origin + '/booking-callback');
    window.open(`${url}&callback=${callbackUrl}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-sky-100 overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-300"
    >
      {/* Image Placeholder */}
      <div className="h-48 bg-gradient-to-br from-amber-400 via-orange-400 to-red-400 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all"></div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1 flex items-center gap-1">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="font-bold text-gray-800">{hotel.rating}</span>
        </div>
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1">
          <p className="text-2xl font-bold text-gray-800">
            &#8377;{hotel.price_per_night?.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-gray-600">per night</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-amber-600 transition-colors">
          {hotel.name}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4 text-amber-500" />
          <span>{hotel.locality}</span>
          {hotel.distance_from_center && (
            <span className="text-gray-400">• {hotel.distance_from_center}</span>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {hotel.description}
        </p>

        {/* Amenities */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {hotel.amenities.slice(0, 4).map((amenity, idx) => {
              const Icon = getAmenityIcon(amenity);
              return (
                <div
                  key={idx}
                  className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-lg text-xs text-amber-700 border border-amber-100"
                >
                  <Icon className="w-3 h-3" />
                  <span>{amenity}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => handleBooking('makemytrip')}
              variant="outline"
              className="text-xs px-2 py-1 h-8 rounded-lg border-amber-200 hover:bg-amber-50"
            >
              MMT
            </Button>
            <Button
              onClick={() => handleBooking('agoda')}
              variant="outline"
              className="text-xs px-2 py-1 h-8 rounded-lg border-amber-200 hover:bg-amber-50"
            >
              Agoda
            </Button>
            <Button
              onClick={() => handleBooking('booking')}
              variant="outline"
              className="text-xs px-2 py-1 h-8 rounded-lg border-amber-200 hover:bg-amber-50"
            >
              Booking
            </Button>
          </div>
          <Button
            onClick={() => handleBooking('makemytrip')}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-lg rounded-xl h-10"
          >
            Book Now
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}