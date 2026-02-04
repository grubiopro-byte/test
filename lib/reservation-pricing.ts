import { BookingState, PriceBreakdown, HandlingOption } from "./reservation-types";

/**
 * Configuration des options de manutention
 */
const HANDLING_CONFIG: Record<
  HandlingOption,
  { extraMinutes: number; extraPercent: number; label: string }
> = {
  express: {
    extraMinutes: 0,
    extraPercent: 0,
    label: "Express",
  },
  prolongee: {
    extraMinutes: 60,
    extraPercent: 0.15,
    label: "Prolongée (+1h)",
  },
  prolongee_plus: {
    extraMinutes: 120,
    extraPercent: 0.15,
    label: "Prolongée Plus (+2h)",
  },
  prolongee_max: {
    extraMinutes: 180,
    extraPercent: 0.1,
    label: "Prolongée Max (+3h)",
  },
};

/**
 * Calcule le prix d'une réservation
 * Formule Livrizi :
 * - M_base = routeMinutes + 30
 * - Prix véhicule : p6 = 0.98€/min, p11 = 1.15€/min, p20 = 1.38€/min
 * - Supplément 2 livrizeurs : +0.3647€/min
 * - Base = p × M_base
 * - Extra manutention = p × extraMin × (1 + extraPercent)
 * - Total HT = Base + Extra
 */
export function computePrice(state: BookingState): PriceBreakdown {
  const routeMinutes = state.routeMinutes || 30;
  const mBase = routeMinutes + 30;

  // Prix par type de véhicule (€/min)
  const vehiclePrices = {
    6: 0.98,
    11: 1.15,
    20: 1.38,
  };

  let pricePerMinute = vehiclePrices[state.vehicle];

  // Supplément si 2 livrizeurs
  if (state.movers === 2) {
    pricePerMinute += 0.3647;
  }

  // Prix de base
  const baseHT = pricePerMinute * mBase;

  // Supplément manutention
  const handlingConfig = HANDLING_CONFIG[state.handlingOption];
  const handlingExtra =
    pricePerMinute *
    handlingConfig.extraMinutes *
    (1 + handlingConfig.extraPercent);

  const totalHT = baseHT + handlingExtra;
  const tva = totalHT * 0.2; // 20% TVA
  const totalTTC = totalHT + tva;

  return {
    baseHT: Math.round(baseHT * 100) / 100,
    handlingExtra: Math.round(handlingExtra * 100) / 100,
    totalHT: Math.round(totalHT * 100) / 100,
    tva: Math.round(tva * 100) / 100,
    totalTTC: Math.round(totalTTC * 100) / 100,
  };
}

/**
 * Formate un prix en euros
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

/**
 * Retourne le label d'une option de manutention
 */
export function getHandlingLabel(option: HandlingOption): string {
  return HANDLING_CONFIG[option].label;
}
