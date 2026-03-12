import { create } from 'zustand';
import type { BookingState, VehicleType, MoversCount, ManutentionOption, AccessType } from './types';

interface BookingStore extends BookingState {
  reset: () => void;
  setStep1: (data: {
    pickupAddress: string;
    pickupLat: number;
    pickupLng: number;
    dropoffAddress: string;
    dropoffLat: number;
    dropoffLng: number;
    routeMinutes: number;
  }) => void;
  setStep2: (data: { vehicleType: VehicleType; movers: MoversCount }) => void;
  setStep3: (data: { scheduledDate: string; scheduledSlot: string }) => void;
  setStep4: (data: { itemsDescription: string; itemsPhotos: string[]; additionalContact: string }) => void;
  setStep5: (data: {
    pickupAccess: AccessType;
    pickupFloors: number;
    dropoffAccess: AccessType;
    dropoffFloors: number;
    manutention: ManutentionOption;
  }) => void;
  setStep6: (data: { firstName: string; lastName: string; email: string; phone: string }) => void;
}

const INITIAL_STATE: BookingState = {
  step: 1,
  pickupAddress: '',
  pickupLat: 0,
  pickupLng: 0,
  dropoffAddress: '',
  dropoffLat: 0,
  dropoffLng: 0,
  routeMinutes: 30,
  vehicleType: '11m3',
  movers: 1,
  scheduledDate: '',
  scheduledSlot: '',
  itemsDescription: '',
  itemsPhotos: [],
  additionalContact: '',
  pickupAccess: 'pied_camion',
  pickupFloors: 0,
  dropoffAccess: 'pied_camion',
  dropoffFloors: 0,
  manutention: 'express',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
};

export const useBookingStore = create<BookingStore>((set) => ({
  ...INITIAL_STATE,
  reset: () => set(INITIAL_STATE),
  setStep1: (data) => set({ ...data, step: 2 }),
  setStep2: (data) => set({ ...data, step: 3 }),
  setStep3: (data) => set({ ...data, step: 4 }),
  setStep4: (data) => set({ ...data, step: 5 }),
  setStep5: (data) => set({ ...data, step: 6 }),
  setStep6: (data) => set({ ...data }),
}));
