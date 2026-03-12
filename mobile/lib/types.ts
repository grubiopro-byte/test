export type UserRole = 'client' | 'livrizeur' | 'helper' | 'admin';
export type VehicleType = '6m3' | '11m3' | '20m3';
export type MoversCount = 1 | 2;
export type ManutentionOption = 'express' | 'prolongee' | 'prolongee_plus' | 'prolongee_max';
export type AccessType = 'pied_camion' | 'etages_sans_ascenseur' | 'etages_avec_ascenseur';
export type CourseStatus =
  | 'en_attente'
  | 'acceptee'
  | 'en_route'
  | 'sur_place'
  | 'en_livraison'
  | 'terminee'
  | 'annulee';
export type LivrizeurStatus = 'pending' | 'active' | 'suspended';

export interface User {
  id: string;
  email: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Livrizeur {
  id: string;
  user_id: string;
  address: string;
  latitude: number;
  longitude: number;
  radius_km: number;
  vehicle_type: VehicleType;
  vehicle_photo_url?: string;
  license_photo_url?: string;
  id_card_photo_url?: string;
  siret: string;
  insurance_url?: string;
  helper_id?: string;
  status: LivrizeurStatus;
  average_rating: number;
  total_ratings: number;
  stripe_account_id?: string;
  created_at: string;
  user?: User;
}

export interface Course {
  id: string;
  client_id: string;
  livrizeur_id?: string;
  helper_id?: string;
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_address: string;
  dropoff_lat: number;
  dropoff_lng: number;
  vehicle_type: VehicleType;
  movers: MoversCount;
  route_minutes: number;
  manutention: ManutentionOption;
  pickup_access: AccessType;
  pickup_floors: number;
  dropoff_access: AccessType;
  dropoff_floors: number;
  items_description?: string;
  items_photos?: string[];
  additional_contact?: string;
  scheduled_date: string;
  scheduled_slot: string;
  price_per_min: number;
  price_total: number;
  commission_amount: number;
  livrizeur_amount: number;
  helper_amount: number;
  stripe_payment_id?: string;
  payment_status: 'pending' | 'captured' | 'refunded' | 'partial_refund';
  status: CourseStatus;
  tip_amount: number;
  created_at: string;
  accepted_at?: string;
  started_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancelled_by?: 'client' | 'livrizeur' | 'admin';
  livrizeur?: Livrizeur;
  client?: User;
}

export interface Rating {
  id: string;
  course_id: string;
  client_id: string;
  livrizeur_id: string;
  stars: number;
  comment?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  data?: Record<string, unknown>;
  created_at: string;
}

// Booking state
export interface BookingState {
  step: number;
  // Step 1
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  routeMinutes: number;
  // Step 2
  vehicleType: VehicleType;
  movers: MoversCount;
  // Step 3
  scheduledDate: string;
  scheduledSlot: string;
  // Step 4
  itemsDescription: string;
  itemsPhotos: string[];
  additionalContact: string;
  // Step 5
  pickupAccess: AccessType;
  pickupFloors: number;
  dropoffAccess: AccessType;
  dropoffFloors: number;
  manutention: ManutentionOption;
  // Step 6
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export const VEHICLE_LABELS: Record<VehicleType, string> = {
  '6m3': 'Fourgon 6m³',
  '11m3': 'Fourgon 11m³',
  '20m3': 'Fourgon 20m³',
};

export const MANUTENTION_LABELS: Record<ManutentionOption, string> = {
  express: 'Express',
  prolongee: 'Prolongée -1H',
  prolongee_plus: 'Prolongée+ -2H',
  prolongee_max: 'Prolongée Max -3H',
};

export const STATUS_LABELS: Record<CourseStatus, string> = {
  en_attente: 'En attente',
  acceptee: 'Acceptée',
  en_route: 'En route',
  sur_place: 'Sur place',
  en_livraison: 'En livraison',
  terminee: 'Terminée',
  annulee: 'Annulée',
};

export const STATUS_COLORS: Record<CourseStatus, string> = {
  en_attente: '#f59e0b',
  acceptee: '#3b82f6',
  en_route: '#8b5cf6',
  sur_place: '#06b6d4',
  en_livraison: '#10b981',
  terminee: '#22c55e',
  annulee: '#ef4444',
};
