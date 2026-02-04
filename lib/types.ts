/**
 * Brouillon de réservation de livraison
 * Contient toutes les informations nécessaires pour créer une nouvelle réservation
 */
export type BookingDraft = {
  // Adresses
  /** Adresse de départ (enlèvement) */
  from: string;
  /** Adresse de destination (livraison) */
  to: string;

  // Véhicule et main d'œuvre
  /** Type de véhicule (en m³) : 6m³, 11m³ ou 20m³ */
  vehicule: 6 | 11 | 20;
  /** Nombre de déménageurs : 1 ou 2 */
  movers: 1 | 2;
  /** Durée estimée du trajet en minutes */
  routeMin: number;

  // Planning
  /** Date d'arrivée souhaitée au format ISO ou string */
  arrivalDate: string;
  /** Créneau horaire (ex: "09:00-12:00") */
  timeWindow: string;

  // Contenu de la livraison
  /** Description textuelle des objets à transporter */
  itemsText: string;
  /** Photo optionnelle du contenu */
  photo: File | null;

  // Détails logistiques - Enlèvement
  /** Étage d'enlèvement (0 = rez-de-chaussée) */
  pickupFloor: number;
  /** Présence d'un ascenseur à l'enlèvement */
  pickupElevator: boolean;

  // Détails logistiques - Livraison
  /** Étage de livraison (0 = rez-de-chaussée) */
  dropoffFloor: number;
  /** Présence d'un ascenseur à la livraison */
  dropoffElevator: boolean;

  // Option de manutention
  /** Type de prestation de manutention */
  handlingOption: "express" | "prolongee" | "prolongee_plus" | "prolongee_max";

  // Informations client
  /** Nom complet du client */
  name: string;
  /** Adresse email du client */
  email: string;
  /** Numéro de téléphone du client */
  phone: string;
};
