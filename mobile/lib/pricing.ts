import type { VehicleType, MoversCount, ManutentionOption } from './types';

// Base price per minute (HT)
const P11 = 1.15;

const VEHICLE_PRICE: Record<VehicleType, number> = {
  '6m3': P11 * 0.85,   // 0.9775
  '11m3': P11,          // 1.15
  '20m3': P11 * 1.20,  // 1.38
};

const MANUTENTION_OPTIONS: Record<
  ManutentionOption,
  { extraMin: number; extraPercent: number }
> = {
  express:        { extraMin: 0,   extraPercent: 0 },
  prolongee:      { extraMin: 60,  extraPercent: 0.15 },
  prolongee_plus: { extraMin: 120, extraPercent: 0.15 },
  prolongee_max:  { extraMin: 180, extraPercent: 0.10 },
};

export function getPricePerMin(
  vehicleType: VehicleType,
  movers: MoversCount
): number {
  const basePrice = VEHICLE_PRICE[vehicleType];
  if (movers === 2) {
    // p_duo = p + (0.31 / 0.80) ≈ p + 0.3875
    return basePrice + 0.31 / 0.80;
  }
  return basePrice;
}

export function calculatePrice(
  vehicleType: VehicleType,
  movers: MoversCount,
  routeMinutes: number,
  manutention: ManutentionOption
): {
  pricePerMin: number;
  mBase: number;
  pBase: number;
  pExtra: number;
  pTotal: number;
  livrizeurAmount: number;
  helperAmount: number;
  commissionAmount: number;
} {
  const p = getPricePerMin(vehicleType, movers);
  const mBase = routeMinutes + 30; // route + 30min manutention incluse
  const { extraMin, extraPercent } = MANUTENTION_OPTIONS[manutention];

  const pBase = p * mBase;
  const pExtra = p * extraMin * (1 + extraPercent);
  const pTotal = pBase + pExtra;
  const mTotal = mBase + extraMin;

  const commissionAmount = pTotal * 0.20;

  let livrizeurAmount: number;
  let helperAmount: number;

  if (movers === 2) {
    const p_vehicle = VEHICLE_PRICE[vehicleType];
    livrizeurAmount = 0.80 * p_vehicle * mTotal;
    helperAmount = 0.31 * mTotal;
  } else {
    livrizeurAmount = pTotal * 0.80;
    helperAmount = 0;
  }

  return {
    pricePerMin: p,
    mBase,
    pBase,
    pExtra,
    pTotal,
    livrizeurAmount,
    helperAmount,
    commissionAmount,
  };
}

export function formatPrice(amount: number): string {
  return `${amount.toFixed(2)} €`;
}

export function getVehicleDescription(type: VehicleType): string {
  const descriptions: Record<VehicleType, string> = {
    '6m3': 'Idéal pour quelques meubles ou cartons. Parfait pour les petits déménagements.',
    '11m3': 'Pour un studio ou un T2. Le plus populaire, convient à la majorité des déménagements.',
    '20m3': 'Pour un grand appartement ou une maison. Capacité maximale.',
  };
  return descriptions[type];
}

export function getVehicleDimensions(type: VehicleType): string {
  const dims: Record<VehicleType, string> = {
    '6m3': '3,5m × 1,8m × 1,85m',
    '11m3': '4,5m × 2,05m × 2,15m',
    '20m3': '6m × 2,2m × 2,5m',
  };
  return dims[type];
}
