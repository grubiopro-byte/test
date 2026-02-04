import { BookingDraft } from "./types";

/**
 * Configuration des options de manutention
 */
const HANDLING_OPTIONS = {
  express: {
    extraMin: 0,
    extraPercent: 0,
  },
  prolongee: {
    extraMin: 60,
    extraPercent: 0.15,
  },
  prolongee_plus: {
    extraMin: 120,
    extraPercent: 0.15,
  },
  prolongee_max: {
    extraMin: 180,
    extraPercent: 0.10,
  },
} as const;

/**
 * Résultat du calcul de prix
 */
export type PriceResult = {
  /** Prix de base (trajet standard) */
  base: number;
  /** Prix supplémentaire (option de manutention) */
  extra: number;
  /** Prix total */
  total: number;
  /** Prix unitaire par minute */
  p: number;
  /** Durée de base en minutes (routeMin + 30) */
  mBase: number;
};

/**
 * Calcule le prix d'une réservation selon les règles de tarification
 * @param draft - Brouillon de réservation
 * @returns Détail du calcul de prix
 */
export function calculatePrice(draft: BookingDraft): PriceResult {
  // Durée de trajet avec fallback à 30 minutes
  const routeMin = draft.routeMin || 30;

  // Durée de base = temps de trajet + 30 minutes
  const mBase = routeMin + 30;

  // Prix de base par type de véhicule (€/min)
  const p11 = 1.15;
  const p6 = p11 * 0.85;
  const p20 = p11 * 1.2;

  // Sélection du prix selon le véhicule
  let pVehicle: number;
  switch (draft.vehicule) {
    case 6:
      pVehicle = p6;
      break;
    case 11:
      pVehicle = p11;
      break;
    case 20:
      pVehicle = p20;
      break;
    default:
      pVehicle = p11; // Fallback
  }

  // Ajout du supplément si 2 déménageurs
  const p = draft.movers === 2 ? pVehicle + 0.3647 : pVehicle;

  // Calcul du prix de base
  const base = p * mBase;

  // Récupération des paramètres de l'option de manutention
  const handlingConfig = HANDLING_OPTIONS[draft.handlingOption] || HANDLING_OPTIONS.express;
  const { extraMin, extraPercent } = handlingConfig;

  // Calcul du supplément (le pourcentage s'applique uniquement sur la partie ajoutée)
  const extra = p * extraMin * (1 + extraPercent);

  // Prix total
  const total = base + extra;

  // Arrondir à 2 décimales
  return {
    base: Math.round(base * 100) / 100,
    extra: Math.round(extra * 100) / 100,
    total: Math.round(total * 100) / 100,
    p: Math.round(p * 100) / 100,
    mBase,
  };
}

/**
 * Formate un montant en euros avec la locale française
 * @param amount - Montant à formater
 * @returns Montant formaté (ex: "123,45 €")
 */
export function formatEUR(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}
