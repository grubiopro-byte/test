"use client";

import { useState } from "react";

type DeliveryStatus =
  | "pending_match"
  | "offered"
  | "assigned"
  | "en_route"
  | "loading"
  | "unloading"
  | "completed"
  | "canceled";

type StatusConfig = {
  id: DeliveryStatus;
  label: string;
  description: string;
  icon: string;
};

const STATUS_CONFIGS: StatusConfig[] = [
  {
    id: "pending_match",
    label: "En attente",
    description: "Recherche d'un livrizeur disponible",
    icon: "⏳",
  },
  {
    id: "offered",
    label: "Proposition envoyée",
    description: "Un livrizeur a été contacté",
    icon: "📤",
  },
  {
    id: "assigned",
    label: "Livrizeur assigné",
    description: "Un livrizeur a accepté la mission",
    icon: "✅",
  },
  {
    id: "en_route",
    label: "En route",
    description: "Le livrizeur se dirige vers le point de départ",
    icon: "🚚",
  },
  {
    id: "loading",
    label: "Chargement",
    description: "Chargement des objets en cours",
    icon: "📦",
  },
  {
    id: "unloading",
    label: "Déchargement",
    description: "Livraison et déchargement en cours",
    icon: "📭",
  },
  {
    id: "completed",
    label: "Terminé",
    description: "Livraison effectuée avec succès",
    icon: "🎉",
  },
  {
    id: "canceled",
    label: "Annulé",
    description: "Cette livraison a été annulée",
    icon: "❌",
  },
];

export default function TrackPage({ params }: { params: { rid: string } }) {
  // Mock : statut actuel de la livraison
  const [currentStatus] = useState<DeliveryStatus>("pending_match");

  // Mock : données de la réservation
  const mockBooking = {
    from: "10 rue de la Paix, 75002 Paris",
    to: "25 avenue des Champs-Élysées, 75008 Paris",
    vehicule: 11,
    movers: 2,
    arrivalDate: "2026-02-10",
    timeWindow: "10:00-12:00",
    total: 245.67,
    name: "Jean Dupont",
    phone: "06 12 34 56 78",
  };

  // Trouver l'index du statut actuel
  const currentIndex = STATUS_CONFIGS.findIndex((s) => s.id === currentStatus);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">Suivi de livraison</h1>
              <p className="text-gray-600">
                Référence :{" "}
                <span className="font-mono font-semibold text-black">
                  {params.rid}
                </span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                disabled
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                disabled
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed"
              >
                Déplacer
              </button>
              <button
                disabled
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed"
              >
                Modifier manutention
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6">État de la livraison</h2>

              <div className="space-y-0">
                {STATUS_CONFIGS.map((status, index) => {
                  const isActive = index === currentIndex;
                  const isPast = index < currentIndex;
                  const isFuture = index > currentIndex;
                  const isCanceled = status.id === "canceled";

                  // Ne pas afficher "canceled" sauf si c'est le statut actuel
                  if (isCanceled && !isActive) return null;

                  return (
                    <div key={status.id} className="flex gap-4 relative">
                      {/* Ligne verticale */}
                      {index < STATUS_CONFIGS.length - 1 && !isCanceled && (
                        <div
                          className={`absolute left-6 top-12 w-0.5 h-full ${
                            isPast ? "bg-green-500" : "bg-gray-200"
                          }`}
                        />
                      )}

                      {/* Icône */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 relative z-10 ${
                          isActive
                            ? "bg-blue-500 text-white ring-4 ring-blue-100"
                            : isPast
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        {status.icon}
                      </div>

                      {/* Contenu */}
                      <div className="pb-8 flex-1">
                        <div
                          className={`font-semibold mb-1 ${
                            isActive
                              ? "text-blue-600"
                              : isPast
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          {status.label}
                        </div>
                        <div
                          className={`text-sm ${
                            isFuture ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {status.description}
                        </div>
                        {isActive && (
                          <div className="mt-2 inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                            En cours
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Résumé de la réservation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-4">Détails</h2>

              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Départ
                  </div>
                  <div className="text-sm">{mockBooking.from}</div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Arrivée
                  </div>
                  <div className="text-sm">{mockBooking.to}</div>
                </div>

                <div className="border-t pt-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Service
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Véhicule :</span>
                      <span className="font-medium ml-1">
                        {mockBooking.vehicule}m³
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Livrizeurs :</span>
                      <span className="font-medium ml-1">{mockBooking.movers}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Rendez-vous
                  </div>
                  <div className="text-sm">
                    <div className="mb-1">
                      <span className="text-gray-600">Date :</span>
                      <span className="font-medium ml-1">
                        {new Date(mockBooking.arrivalDate).toLocaleDateString(
                          "fr-FR",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Créneau :</span>
                      <span className="font-medium ml-1">
                        {mockBooking.timeWindow}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Contact
                  </div>
                  <div className="text-sm">
                    <div className="mb-1 font-medium">{mockBooking.name}</div>
                    <div className="text-gray-600">{mockBooking.phone}</div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase">
                      Total
                    </span>
                    <span className="text-2xl font-bold">
                      {mockBooking.total.toFixed(2).replace(".", ",")} €
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
