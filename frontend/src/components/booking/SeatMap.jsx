import React from "react";
import { motion } from "framer-motion";
import { UserCheck, X } from "lucide-react";

export default function SeatMap({ type, selectedSeats, passengers, onSeatSelect, onSeatDeselect }) {
  // Generate seat layout
  const rows = type === "train" ? 12 : 20;
  const seatsPerRow = type === "train" ? 8 : 6;
  
  const seatLayout = [];
  const femalePassengers = passengers.filter(p => p.isWomen);
  const femaleCount = femalePassengers.length;
  
  // Female priority zones (first few rows for safety)
  const femalePriorityRows = [1, 2, 3, 4];
  
  for (let row = 1; row <= rows; row++) {
    const rowSeats = [];
    const isFemalePriorityRow = femalePriorityRows.includes(row);
    
    for (let col = 0; col < seatsPerRow; col++) {
      const seatLetter = String.fromCharCode(65 + col); // A, B, C, D...
      const seatNumber = `${row}${seatLetter}`;
      
      // Less occupied seats in female priority zones
      const occupationRate = isFemalePriorityRow ? 0.5 : 0.7;
      const isOccupied = Math.random() > occupationRate;
      const isSelected = selectedSeats.includes(seatNumber);
      
      // Check if this seat is for a female passenger
      const seatIndex = selectedSeats.indexOf(seatNumber);
      const isFemaleSeat = seatIndex >= 0 && passengers[seatIndex]?.isWomen;
      
      // Mark as female priority zone
      const isFemalePriority = isFemalePriorityRow && !isOccupied && !isSelected;
      
      rowSeats.push({
        number: seatNumber,
        isOccupied,
        isSelected,
        isFemaleSeat,
        isFemalePriority
      });
    }
    seatLayout.push(rowSeats);
  }

  const handleSeatClick = (seat) => {
    if (seat.isOccupied) return;
    
    if (seat.isSelected) {
      onSeatDeselect(seat.number);
    } else {
      onSeatSelect(seat.number);
    }
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center sm:justify-start text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-200 rounded-lg"></div>
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded-lg"></div>
          <span className="text-gray-600">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-pink-500 rounded-lg"></div>
          <span className="text-gray-600">Female Seat</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-pink-100 border-2 border-pink-300 rounded-lg"></div>
          <span className="text-gray-600">Female Zone</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-400 rounded-lg relative">
            <X className="w-4 h-4 text-white absolute inset-0 m-auto" />
          </div>
          <span className="text-gray-600">Occupied</span>
        </div>
      </div>

      {/* Seat Grid */}
      <div className="bg-gradient-to-b from-sky-50 to-white rounded-2xl p-4 sm:p-6 border border-sky-100 overflow-x-auto">
        <div className="min-w-max">
          {type === "flight" && (
            <div className="text-center mb-4">
              <div className="inline-block bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-6 py-2 rounded-t-3xl text-sm font-semibold">
                Front of Aircraft
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            {seatLayout.map((row, rowIndex) => (
              <div key={rowIndex} className="flex items-center gap-2 justify-center">
                <span className="text-xs font-semibold text-gray-500 w-6 text-right">
                  {rowIndex + 1}
                </span>
                
                <div className="flex gap-1">
                  {row.slice(0, Math.ceil(seatsPerRow / 2)).map((seat, seatIndex) => (
                    <SeatButton
                      key={seat.number}
                      seat={seat}
                      onClick={() => handleSeatClick(seat)}
                    />
                  ))}
                </div>

                {/* Aisle */}
                <div className="w-6 sm:w-8"></div>

                <div className="flex gap-1">
                  {row.slice(Math.ceil(seatsPerRow / 2)).map((seat, seatIndex) => (
                    <SeatButton
                      key={seat.number}
                      seat={seat}
                      onClick={() => handleSeatClick(seat)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {type === "train" && (
            <div className="text-center mt-4">
              <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-b-3xl text-sm font-semibold">
                End of Coach
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selection Summary */}
      {selectedSeats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-sky-50 to-teal-50 rounded-2xl p-4 border border-sky-100"
        >
          <p className="text-sm font-semibold text-gray-800 mb-2">Selected Seats</p>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map((seat, idx) => (
              <div
                key={seat}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  passengers[idx]?.isWomen
                    ? "bg-pink-100 text-pink-700 border border-pink-200"
                    : "bg-blue-100 text-blue-700 border border-blue-200"
                }`}
              >
                {seat}
                {passengers[idx]?.isWomen && (
                  <UserCheck className="w-3 h-3 inline ml-1" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function SeatButton({ seat, onClick }) {
  let bgClass = "bg-gray-200 hover:bg-gray-300";
  let cursorClass = "cursor-pointer";
  let borderClass = "";
  
  if (seat.isOccupied) {
    bgClass = "bg-gray-400";
    cursorClass = "cursor-not-allowed";
  } else if (seat.isFemaleSeat) {
    bgClass = "bg-pink-500 hover:bg-pink-600";
  } else if (seat.isSelected) {
    bgClass = "bg-blue-500 hover:bg-blue-600";
  } else if (seat.isFemalePriority) {
    bgClass = "bg-pink-100 hover:bg-pink-200";
    borderClass = "border-2 border-pink-300";
  }

  return (
    <motion.button
      whileHover={{ scale: seat.isOccupied ? 1 : 1.1 }}
      whileTap={{ scale: seat.isOccupied ? 1 : 0.95 }}
      onClick={onClick}
      disabled={seat.isOccupied}
      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${bgClass} ${borderClass} ${cursorClass} transition-all relative flex items-center justify-center text-xs font-semibold ${seat.isFemalePriority ? 'text-pink-700' : 'text-white'}`}
      title={seat.isFemalePriority ? "Female Priority Seat" : ""}
    >
      {seat.isOccupied && <X className="w-4 h-4" />}
      {seat.isFemaleSeat && <UserCheck className="w-4 h-4" />}
    </motion.button>
  );
}