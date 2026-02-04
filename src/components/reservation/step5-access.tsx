"use client";

import { useState, useRef, useEffect } from "react";

interface Step5AccessProps {
  pickupAccess: string;
  pickupFloors: number;
  dropoffAccess: string;
  dropoffFloors: number;
  manutention: string;
  onPickupAccessChange: (access: string) => void;
  onPickupFloorsChange: (floors: number) => void;
  onDropoffAccessChange: (access: string) => void;
  onDropoffFloorsChange: (floors: number) => void;
  onManutentionChange: (manutention: string) => void;
  // Props pour calcul prix
  vehicle: string;
  movers: 1 | 2;
  routeMinutes: number;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
    surcharge?: string;
  }>;
}

const CustomSelect = ({ value, onChange, options }: CustomSelectProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fermer si clic en dehors
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between border border-gray-400 rounded-xl px-4 py-3 text-base bg-white hover:border-black transition text-left"
      >
        <span>{selected?.label}</span>
        <svg
          className={`w-5 h-5 text-gray-400 transition ${open ? "rotate-180" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-3 text-sm transition flex items-center justify-between ${
                value === opt.value
                  ? "bg-[rgba(61,75,163,0.06)] text-[#3D4BA3] font-medium"
                  : "hover:bg-gray-50"
              }`}
            >
              <span>{opt.label}</span>
              {opt.surcharge && (
                <span className="text-xs font-medium text-[#E8891D]">{opt.surcharge}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const manutentionOptions = [
  {
    id: "express",
    label: "Express",
    time: "30 min",
    extraMin: 0,
    extraPercent: 0,
  },
  {
    id: "prolongee",
    label: "+1h",
    time: "1h30",
    extraMin: 60,
    extraPercent: 0.15,
  },
  {
    id: "prolongee_plus",
    label: "+2h",
    time: "2h30",
    extraMin: 120,
    extraPercent: 0.15,
  },
  {
    id: "prolongee_max",
    label: "+3h",
    time: "3h30",
    extraMin: 180,
    extraPercent: 0.1,
  },
];

export default function Step5Access({
  pickupAccess,
  pickupFloors,
  dropoffAccess,
  dropoffFloors,
  manutention,
  onPickupAccessChange,
  onPickupFloorsChange,
  onDropoffAccessChange,
  onDropoffFloorsChange,
  onManutentionChange,
  vehicle,
  movers,
  routeMinutes,
}: Step5AccessProps) {
  // Calcul du prix pour chaque option
  const vehicleRates: Record<string, { solo: number; duo: number }> = {
    "6m3": { solo: 0.9775, duo: 1.365 },
    "11m3": { solo: 1.15, duo: 1.5375 },
    "20m3": { solo: 1.38, duo: 1.7675 },
  };

  const rate = movers === 1 ? vehicleRates[vehicle].solo : vehicleRates[vehicle].duo;
  const M = routeMinutes + 30;
  const P_base = rate * M;

  const getPrice = (option: typeof manutentionOptions[0]) => {
    const P_extra = rate * option.extraMin * (1 + option.extraPercent);
    const stairsSurcharge =
      (pickupAccess === "etages_sans_ascenseur" ? 5 : 0) +
      (dropoffAccess === "etages_sans_ascenseur" ? 5 : 0);
    return P_base + P_extra + stairsSurcharge;
  };

  return (
    <div>
      {/* Section Accès - Vertical */}
      <div className="space-y-6">
        {/* A · Départ */}
        <div>
          <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-full bg-[#3D4BA3] text-white text-xs flex items-center justify-center font-bold">
              A
            </span>
            Départ
          </label>
          <CustomSelect
            value={pickupAccess}
            onChange={onPickupAccessChange}
            options={[
              { value: "pied_camion", label: "Pied du camion" },
              { value: "etages_sans_ascenseur", label: "Étages sans ascenseur", surcharge: "+5,00 €" },
              { value: "etages_avec_ascenseur", label: "Étages avec ascenseur" },
            ]}
          />
          {pickupAccess !== "pied_camion" && (
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => onPickupFloorsChange(Math.max(1, pickupFloors - 1))}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-sm"
              >
                −
              </button>
              <span className="text-sm font-medium w-6 text-center">{pickupFloors}</span>
              <button
                type="button"
                onClick={() => onPickupFloorsChange(Math.min(10, pickupFloors + 1))}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-sm"
              >
                +
              </button>
              <span className="text-xs text-gray-500">étage(s)</span>
            </div>
          )}
        </div>

        {/* B · Arrivée */}
        <div>
          <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-full bg-[#3D4BA3] text-white text-xs flex items-center justify-center font-bold">
              B
            </span>
            Arrivée
          </label>
          <CustomSelect
            value={dropoffAccess}
            onChange={onDropoffAccessChange}
            options={[
              { value: "pied_camion", label: "Pied du camion" },
              { value: "etages_sans_ascenseur", label: "Étages sans ascenseur", surcharge: "+5,00 €" },
              { value: "etages_avec_ascenseur", label: "Étages avec ascenseur" },
            ]}
          />
          {dropoffAccess !== "pied_camion" && (
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => onDropoffFloorsChange(Math.max(1, dropoffFloors - 1))}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-sm"
              >
                −
              </button>
              <span className="text-sm font-medium w-6 text-center">{dropoffFloors}</span>
              <button
                type="button"
                onClick={() => onDropoffFloorsChange(Math.min(10, dropoffFloors + 1))}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-sm"
              >
                +
              </button>
              <span className="text-xs text-gray-500">étage(s)</span>
            </div>
          )}
        </div>
      </div>

      {/* Section Durée de manutention */}
      <div className="mt-10">
        <label className="font-bold text-base block">Durée de manutention</label>
        <div className="grid grid-cols-4 gap-2 mt-3">
          {manutentionOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onManutentionChange(opt.id)}
              className={`flex flex-col items-center py-4 rounded-xl border transition text-center ${
                manutention === opt.id
                  ? "border-[#3D4BA3] border-2"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="font-bold text-sm">{opt.label}</span>
              <span className="text-xs text-gray-500 mt-1">{opt.time}</span>
              <span className="text-xs font-bold mt-2">
                {getPrice(opt).toFixed(2).replace(".", ",")} €
              </span>
            </button>
          ))}
        </div>

        {/* Info box minimaliste */}
        <div className="flex items-start gap-2 mt-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 text-[#3D4BA3] shrink-0 mt-0.5"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-xs text-gray-500">
            Choisissez une durée adaptée à vos objets et aux conditions d'accès.
          </p>
        </div>
      </div>
    </div>
  );
}
