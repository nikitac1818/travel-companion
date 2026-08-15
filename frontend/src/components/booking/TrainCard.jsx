import React from "react";
import { motion } from "framer-motion";
import { Train, Clock, Calendar, IndianRupee, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TrainCard({ train, index, searchData, onSelect }) {
  const handleExternalBooking = (provider) => {
    const urls = {
      irctc: `https://www.irctc.co.in/nget/train-search`,
      redbus: `https://www.redbus.in/railways/${searchData.from}/${searchData.to}`,
      makemytrip: `https://railways.makemytrip.com/railways/search?from=${searchData.from}&to=${searchData.to}`
    };
    const callbackUrl = encodeURIComponent(window.location.origin + '/booking-callback');
    window.open(`${urls[provider]}&callback=${callbackUrl}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-sky-100 p-4 sm:p-6 hover:shadow-2xl transition-all"
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
        {/* Train Info */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-2">
            <Train className="w-8 h-8 text-white" />
          </div>
          <p className="text-sm font-semibold text-gray-800">{train.train_name}</p>
          <p className="text-xs text-gray-500">#{train.train_number}</p>
        </div>

        {/* Train Times */}
        <div className="flex-1 grid grid-cols-3 gap-2 sm:gap-4 items-center">
          <div className="text-center sm:text-left">
            <p className="text-2xl sm:text-3xl font-bold text-gray-800">{train.departure_time}</p>
            <p className="text-sm text-gray-600">{searchData.from}</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="h-px flex-1 bg-gray-300"></div>
              <Clock className="w-4 h-4 text-gray-400" />
              <div className="h-px flex-1 bg-gray-300"></div>
            </div>
            <p className="text-xs font-medium text-gray-600">{train.duration}</p>
            <p className="text-xs text-gray-500">{train.days_running}</p>
          </div>

          <div className="text-center sm:text-right">
            <p className="text-2xl sm:text-3xl font-bold text-gray-800">{train.arrival_time}</p>
            <p className="text-sm text-gray-600">{searchData.to}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px h-20 bg-gray-200"></div>

        {/* Price & Book */}
        <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 lg:gap-2 flex-shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0">
          <div className="text-left lg:text-right">
            <div className="flex items-center gap-1 text-gray-500 mb-1">
              <Calendar className="w-3 h-3" />
              <span className="text-xs">{train.available_berths} berths</span>
            </div>
            <div className="flex items-baseline gap-1">
              <IndianRupee className="w-4 h-4 text-gray-600" />
              <span className="text-2xl sm:text-3xl font-bold text-gray-800">
                {train.fare.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-xs text-gray-500 capitalize">{searchData.class} class</p>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={() => onSelect(train)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg rounded-xl px-6 h-10 whitespace-nowrap"
            >
              Smart Berth Select
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <div className="flex gap-1">
              <button
                onClick={() => handleExternalBooking('irctc')}
                className="text-xs px-2 py-1 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 border border-purple-200 transition-colors"
              >
                IRCTC
              </button>
              <button
                onClick={() => handleExternalBooking('redbus')}
                className="text-xs px-2 py-1 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 border border-purple-200 transition-colors"
              >
                RedBus
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}