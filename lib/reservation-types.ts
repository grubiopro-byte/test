/**
 * Types pour le flow de réservation Livrizi
 */

export type VehicleType = 6 | 11 | 20;
export type MoversCount = 1 | 2;
export type HandlingOption = "express" | "prolongee" | "prolongee_plus" | "prolongee_max";

export interface BookingState {
  // Étape 1 : Adresses
  pickupAddress: string;
  dropoffAddress: string;

  // Étape 2 : Véhicule et livrizeurs
  vehicle: VehicleType;
  movers: MoversCount;

  // Étape 3 : Créneau
  selectedDate: string; // Format YYYY-MM-DD
  selectedTime: string; // Format "HH:MM-HH:MM"

  // Étape 4 : Détails
  itemsDescription: string;
  photos: File[];
  pickupFloor: number;
  pickupElevator: boolean;
  dropoffFloor: number;
  dropoffElevator: boolean;
  handlingOption: HandlingOption;

  // Étape 5 : Contact
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Données calculées (pour le pricing)
  routeMinutes: number; // Mock pour l'instant, sera calculé avec Google Maps
}

export const DEFAULT_BOOKING_STATE: BookingState = {
  pickupAddress: "",
  dropoffAddress: "",
  vehicle: 11,
  movers: 2,
  selectedDate: "",
  selectedTime: "",
  itemsDescription: "",
  photos: [],
  pickupFloor: 0,
  pickupElevator: false,
  dropoffFloor: 0,
  dropoffElevator: false,
  handlingOption: "express",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  routeMinutes: 30, // Mock par défaut
};

export interface PriceBreakdown {
  baseHT: number;
  handlingExtra: number;
  totalHT: number;
  tva: number;
  totalTTC: number;
}
