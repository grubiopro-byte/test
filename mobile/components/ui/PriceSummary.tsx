import { View, Text } from 'react-native';
import { calculatePrice, formatPrice } from '@/lib/pricing';
import { useBookingStore } from '@/lib/bookingStore';
import { VEHICLE_LABELS, MANUTENTION_LABELS } from '@/lib/types';

export function PriceSummary() {
  const { vehicleType, movers, routeMinutes, manutention, scheduledDate, scheduledSlot, pickupAddress, dropoffAddress } = useBookingStore();

  if (!vehicleType) return null;

  const { pTotal, pricePerMin, mBase } = calculatePrice(vehicleType, movers, routeMinutes, manutention);

  return (
    <View className="bg-primary-50 border border-primary-100 rounded-2xl p-4 mx-5 mb-4">
      <Text className="text-primary-800 font-bold text-sm mb-3">📋 Votre Livrizi</Text>

      {pickupAddress ? (
        <View className="mb-2">
          <View className="flex-row gap-x-2 mb-1">
            <Text className="text-primary-600 text-xs">A</Text>
            <Text className="text-gray-700 text-xs flex-1" numberOfLines={1}>{pickupAddress}</Text>
          </View>
          {dropoffAddress && (
            <View className="flex-row gap-x-2">
              <Text className="text-red-500 text-xs">B</Text>
              <Text className="text-gray-700 text-xs flex-1" numberOfLines={1}>{dropoffAddress}</Text>
            </View>
          )}
        </View>
      ) : null}

      {vehicleType && (
        <View className="flex-row justify-between mt-1">
          <Text className="text-gray-600 text-xs">{VEHICLE_LABELS[vehicleType]} · {movers} livrizeur{movers > 1 ? 's' : ''}</Text>
          <Text className="text-primary-700 text-xs font-semibold">{formatPrice(pricePerMin)}/min</Text>
        </View>
      )}

      {scheduledDate && (
        <Text className="text-gray-600 text-xs mt-1">📅 {scheduledDate} · {scheduledSlot}</Text>
      )}

      {manutention && (
        <Text className="text-gray-600 text-xs mt-1">⏱ {MANUTENTION_LABELS[manutention]}</Text>
      )}

      <View className="border-t border-primary-200 mt-3 pt-3 flex-row justify-between items-center">
        <Text className="text-gray-700 text-sm font-semibold">Estimation totale</Text>
        <Text className="text-primary-800 text-lg font-bold">{formatPrice(pTotal)}</Text>
      </View>

      <Text className="text-gray-400 text-xs mt-1">
        * Basé sur {routeMinutes} min de route + 30 min manutention incluses
      </Text>
    </View>
  );
}
