"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { BookingDraft } from "@/lib/types";

/**
 * Valeurs par défaut pour un nouveau brouillon de réservation
 */
const DEFAULT_DRAFT: BookingDraft = {
  // Adresses
  from: "",
  to: "",

  // Véhicule et main d'œuvre
  vehicule: 11,
  movers: 2,
  routeMin: 30,

  // Planning
  arrivalDate: "",
  timeWindow: "",

  // Contenu
  itemsText: "",
  photo: null,

  // Logistique enlèvement
  pickupFloor: 0,
  pickupElevator: false,

  // Logistique livraison
  dropoffFloor: 0,
  dropoffElevator: false,

  // Option de manutention
  handlingOption: "express",

  // Informations client
  name: "",
  email: "",
  phone: "",
};

/**
 * Type du contexte de réservation
 */
type BookingContextType = {
  /** Brouillon actuel de la réservation */
  draft: BookingDraft;
  /** Mettre à jour partiellement le brouillon */
  updateDraft: (partial: Partial<BookingDraft>) => void;
  /** Réinitialiser le brouillon aux valeurs par défaut */
  resetDraft: () => void;
};

/**
 * Contexte de réservation
 */
const BookingContext = createContext<BookingContextType | undefined>(undefined);

/**
 * Props du provider
 */
type BookingProviderProps = {
  children: ReactNode;
};

/**
 * Provider du contexte de réservation
 * À placer au niveau racine de l'application ou de la section concernée
 */
export function BookingProvider({ children }: BookingProviderProps) {
  const [draft, setDraft] = useState<BookingDraft>(DEFAULT_DRAFT);

  /**
   * Met à jour partiellement le brouillon en fusionnant les nouvelles valeurs
   */
  const updateDraft = (partial: Partial<BookingDraft>) => {
    setDraft((prev) => ({
      ...prev,
      ...partial,
    }));
  };

  /**
   * Réinitialise le brouillon aux valeurs par défaut
   */
  const resetDraft = () => {
    setDraft(DEFAULT_DRAFT);
  };

  return (
    <BookingContext.Provider value={{ draft, updateDraft, resetDraft }}>
      {children}
    </BookingContext.Provider>
  );
}

/**
 * Hook pour accéder au contexte de réservation
 * @throws Error si utilisé en dehors du BookingProvider
 * @returns Le contexte de réservation avec draft, updateDraft et resetDraft
 */
export function useBooking(): BookingContextType {
  const context = useContext(BookingContext);
  
  if (context === undefined) {
    throw new Error("useBooking doit être utilisé à l'intérieur d'un BookingProvider");
  }
  
  return context;
}
