"use client";

import Image from "next/image";
import { useState } from "react";

interface Step2VehicleProps {
  movers: 1 | 2;
  onMoversChange: (movers: 1 | 2) => void;
  routeMinutes?: number;
}

const VEHICLE = {
  id: "11m3",
  label: "11m³",
  description: "Idéal pour un studio ou une pièce complète.",
  soloRate: 1.15,
  duoRate: 1.5375,
  imageSolo: "/images/vehicles/11m3-solo.png",
  imageDuo: "/images/vehicles/11m3-duo.png",
};

export default function Step2Vehicle({
  movers,
  onMoversChange,
  routeMinutes = 30,
}: Step2VehicleProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const rate = movers === 1 ? VEHICLE.soloRate : VEHICLE.duoRate;
  const M = routeMinutes + 30;
  const basePrice = rate * M;

  // Détail du prix
  const prixBrut = rate / 1.2; // tarif hors frais Livrizi
  const fraisLivrizi = basePrice - prixBrut * M;
  const prixRoute = prixBrut * routeMinutes;
  const prixManutention = prixBrut * 30;

  return (
    <div className="space-y-6">

      {/* Illustration véhicule */}
      <div className="w-full h-48 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden">
        <Image
          src={movers === 1 ? VEHICLE.imageSolo : VEHICLE.imageDuo}
          alt={`Fourgon ${VEHICLE.label}`}
          width={400}
          height={200}
          className="h-40 w-auto object-contain"
        />
      </div>

      {/* Nom + prix */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg font-semibold text-gray-900">
            Fourgon {VEHICLE.label}
          </span>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            {movers} Livrizeur{movers > 1 ? "s" : ""}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-3">{VEHICLE.description}</p>

        <div className="flex items-center gap-2">
          <p>
            <span className="text-2xl font-bold">
              {basePrice.toFixed(2).replace(".", ",")} €
            </span>
          </p>

          {/* Infobulle */}
          <div className="relative">
            <button
              type="button"
              aria-label="Détail du prix"
              onClick={() => setTooltipOpen((v) => !v)}
              onMouseEnter={() => setTooltipOpen(true)}
              onMouseLeave={() => setTooltipOpen(false)}
              className="flex items-center justify-center"
            >
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
            </button>

            {tooltipOpen && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-xl p-4 shadow-xl z-50">
                {/* Flèche */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />

                <p className="font-semibold text-sm mb-3 text-white">Détail du prix estimé</p>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Trajet ({routeMinutes} min)</span>
                    <span className="font-medium">{prixRoute.toFixed(2).replace(".", ",")} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Manutention (30 min incluses)</span>
                    <span className="font-medium">{prixManutention.toFixed(2).replace(".", ",")} €</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-700 pt-2">
                    <span className="text-gray-300">Frais Livrizi (20%)</span>
                    <span className="font-medium">{fraisLivrizi.toFixed(2).replace(".", ",")} €</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-600 pt-2">
                    <span className="font-semibold text-white">Total estimé</span>
                    <span className="font-bold text-white">{basePrice.toFixed(2).replace(".", ",")} €</span>
                  </div>
                </div>

                <p className="text-gray-400 mt-3 text-[11px] leading-tight">
                  Prix basé sur la durée de trajet estimée. Le montant final dépend de la durée réelle.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toggle livrizeur */}
      <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-5">
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
  );
}
