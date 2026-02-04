"use client";

import { useState } from "react";

interface Step3DateTimeProps {
  selectedDay: string;
  selectedSlot: string;
  onDayChange: (day: string) => void;
  onSlotChange: (slot: string) => void;
}

// Générer les 4 prochains jours
function generateNext4Days() {
  const days = [];
  const today = new Date();
  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  
  for (let i = 0; i < 4; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const label = i === 0 ? "Auj." : dayNames[date.getDay()];
    days.push({
      label,
      date: date.getDate(),
      fullDate: date.toISOString().split("T")[0],
    });
  }
  
  return days;
}

// Générer 30 jours
function generateAllDays() {
  const days = [];
  const today = new Date();
  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const label = i === 0 ? "Auj." : dayNames[date.getDay()];
    days.push({
      label,
      date: date.getDate(),
      fullDate: date.toISOString().split("T")[0],
    });
  }
  
  return days;
}

const timeSlots = [
  "8h - 9h",
  "9h - 10h",
  "10h - 11h",
  "11h - 12h",
  "12h - 13h",
  "13h - 14h",
  "14h - 15h",
  "15h - 16h",
  "16h - 17h",
  "17h - 18h",
];

export default function Step3DateTime({
  selectedDay,
  selectedSlot,
  onDayChange,
  onSlotChange,
}: Step3DateTimeProps) {
  const [showMore, setShowMore] = useState(false);
  const allDays = generateAllDays();
  
  // Calcul des 4 jours affichés dans la première ligne
  const getVisibleDays = () => {
    const defaultDays = allDays.slice(0, 4);
    const selectedIndex = allDays.findIndex((d) => d.fullDate === selectedDay);
    
    // Si le jour sélectionné est dans les 4 premiers, pas de changement
    if (selectedIndex < 4) return defaultDays;
    
    // Sinon, décaler pour que le jour sélectionné soit en 2e position
    const startIndex = Math.max(0, selectedIndex - 1);
    const endIndex = Math.min(allDays.length, startIndex + 4);
    return allDays.slice(startIndex, endIndex);
  };

  const visibleDays = getVisibleDays();
  
  // Grille étendue = tous les jours SAUF ceux déjà visibles dans la première ligne
  const moreDays = allDays.filter((d) => !visibleDays.find((v) => v.fullDate === d.fullDate));

  return (
    <div className="space-y-10">
      {/* Section sélection jour */}
      <div>
        <label className="block font-bold text-base text-gray-900 mb-4">
          Choisir le jour
        </label>

        {/* Ligne principale — toujours visible */}
        <div className="flex gap-2">
          {visibleDays.map((day) => (
            <button
              key={day.fullDate}
              type="button"
              onClick={() => onDayChange(day.fullDate)}
              className={`flex-1 flex flex-col items-center py-3 rounded-xl border transition ${
                selectedDay === day.fullDate
                  ? "bg-[#3D4BA3] text-white border-[#3D4BA3]"
                  : "border-gray-200 hover:border-gray-300 text-black"
              }`}
            >
              <span className="text-xs font-medium">{day.label}</span>
              <span className="text-xl font-bold">{day.date}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="flex-1 flex flex-col items-center justify-center py-3 rounded-xl border border-gray-200 hover:border-gray-300 text-black"
          >
            <span className="text-xs font-medium">{showMore ? "Moins" : "Plus"}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`w-5 h-5 transition-transform ${showMore ? "rotate-180" : ""}`}
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Grille étendue — commence au 5e jour */}
        {showMore && (
          <div className="grid grid-cols-5 gap-2 mt-3">
            {moreDays.map((day) => (
              <button
                key={day.fullDate}
                type="button"
                onClick={() => {
                  onDayChange(day.fullDate);
                  setShowMore(false);
                }}
                className={`flex flex-col items-center py-3 rounded-xl border transition ${
                  selectedDay === day.fullDate
                    ? "bg-[#3D4BA3] text-white border-[#3D4BA3]"
                    : "border-gray-200 hover:border-gray-300 text-black"
                }`}
              >
                <span className="text-xs">{day.label}</span>
                <span className="text-lg font-bold">{day.date}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Section sélection créneau */}
      <div>
        <label className="block font-bold text-base text-gray-900 mb-4">
          Choisir le créneau
        </label>

        <div className="grid grid-cols-2 gap-3">
          {timeSlots.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => onSlotChange(slot)}
              className={`py-3 rounded-xl border text-sm font-medium transition ${
                selectedSlot === slot
                  ? "bg-[#3D4BA3] text-white border-[#3D4BA3]"
                  : "border-gray-200 hover:border-gray-300 text-black"
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
