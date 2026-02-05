"use client";

import Image from "next/image";

interface Step2VehicleProps {
  vehicle: string;
  movers: 1 | 2;
  onVehicleChange: (vehicleId: string) => void;
  onMoversChange: (movers: 1 | 2) => void;
  routeMinutes?: number;
}

const vehicles = [
  {
    id: "6m3",
    label: "6m³",
    description: "Idéal pour quelques meubles ou cartons.",
    soloRate: 0.9775,
    duoRate: 1.365,
    imageSolo: "/images/vehicles/6m3-solo.png",
    imageDuo: "/images/vehicles/6m3-duo.png",
  },
  {
    id: "11m3",
    label: "11m³",
    description: "Idéal pour un studio ou une pièce complète.",
    soloRate: 1.15,
    duoRate: 1.5375,
    imageSolo: "/images/vehicles/11m3-solo.png",
    imageDuo: "/images/vehicles/11m3-duo.png",
  },
  {
    id: "20m3",
    label: "20m³",
    description: "Idéal pour un appartement T2 ou plus.",
    soloRate: 1.38,
    duoRate: 1.7675,
    imageSolo: "/images/vehicles/20m3-solo.png",
    imageDuo: "/images/vehicles/20m3-duo.png",
  },
];

export default function Step2Vehicle({
  vehicle,
  movers,
  onVehicleChange,
  onMoversChange,
  routeMinutes = 30,
}: Step2VehicleProps) {
  const selectedVehicle = vehicles.find((v) => v.id === vehicle) || vehicles[1];
  const rate = movers === 1 ? selectedVehicle.soloRate : selectedVehicle.duoRate;
  const M = routeMinutes + 30; // 30 min manutention incluses
  const basePrice = rate * M;

  return (
    <div className="space-y-10">
      {/* Section sélection véhicule */}
      <div>
        {/* Cartes véhicules */}
        <div className="flex gap-3 mt-8">
          {vehicles.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => onVehicleChange(v.id)}
              className={`flex-1 flex flex-col items-center gap-3 border rounded-xl p-5 transition cursor-pointer overflow-hidden ${
                vehicle === v.id
                  ? "border-[#3D4BA3] border-2"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="w-full h-20 flex items-center justify-center overflow-hidden">
                <Image
                  src={movers === 1 ? v.imageSolo : v.imageDuo}
                  alt={`Fourgon ${v.label}`}
                  width={160}
                  height={80}
                  className="h-[72px] w-auto object-contain"
                />
              </div>
              <span className="font-medium text-sm">{v.label}</span>
            </button>
          ))}
        </div>

        {/* Toggle livrizeur */}
        <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-5 mt-4">
          <div>
            <p className="font-bold text-base">Ajouter 1 livrizeur</p>
            <p className="text-sm text-gray-600 mt-1">
              Un 2e livrizeur pour vous aider. Recommandé pour les objets lourds.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={movers === 2 ? "true" : "false"}
            aria-label="Ajouter un deuxième livrizeur"
            onClick={() => onMoversChange(movers === 1 ? 2 : 1)}
            className={`relative shrink-0 w-12 h-7 rounded-full transition ${
              movers === 2 ? "bg-[#3D4BA3]" : "bg-gray-300"
            }`}
          >
            <div
              className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-all ${
                movers === 2 ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Illustration véhicule sélectionné */}
      <div className="w-full h-48 rounded-2xl bg-gray-50 flex items-center justify-center mt-8 overflow-hidden">
        <Image
          src={movers === 1 ? selectedVehicle.imageSolo : selectedVehicle.imageDuo}
          alt={`Fourgon ${selectedVehicle.label}`}
          width={400}
          height={200}
          className="h-40 w-auto object-contain"
        />
      </div>

      {/* Récapitulatif sélection */}
      <div className="mt-6">
        {/* Nom + badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-semibold text-gray-900">
            Fourgon {selectedVehicle.label}
          </span>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            {movers} Livrizeur{movers > 1 ? "s" : ""}
          </span>
        </div>

        {/* Prix */}
        <div className="flex items-center gap-2 mt-2">
          <p>
            <span className="text-2xl font-bold">
              {basePrice.toFixed(2).replace(".", ",")} €
            </span>
            <span className="text-base font-bold">
              {" "}
              + {rate.toFixed(2).replace(".", ",")} €
            </span>
            <span className="text-base text-gray-600"> /min manutention</span>
          </p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 text-[rgb(36,50,138)]"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Description */}
        <p className="text-base text-gray-600 mt-2">{selectedVehicle.description}</p>
      </div>
    </div>
  );
}
