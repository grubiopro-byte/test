import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBookingStore } from '@/lib/bookingStore';
import { BookingHeader } from '@/components/ui/BookingHeader';
import { PriceSummary } from '@/components/ui/PriceSummary';
import { calculatePrice, formatPrice, getVehicleDescription, getVehicleDimensions } from '@/lib/pricing';
import type { VehicleType, MoversCount } from '@/lib/types';

const VEHICLES: { type: VehicleType; label: string; icon: string; capacity: string }[] = [
  { type: '6m3', label: 'Fourgon 6m³', icon: '🚐', capacity: 'Studio, quelques meubles' },
  { type: '11m3', label: 'Fourgon 11m³', icon: '🚛', capacity: 'T1-T2, déménagement moyen' },
  { type: '20m3', label: 'Fourgon 20m³', icon: '🚚', capacity: 'T3+, grand déménagement' },
];

export default function Step2() {
  const router = useRouter();
  const store = useBookingStore();
  const [vehicleType, setVehicleType] = useState<VehicleType>(store.vehicleType);
  const [movers, setMovers] = useState<MoversCount>(store.movers);

  const pricing = calculatePrice(vehicleType, movers, store.routeMinutes, store.manutention);

  function handleContinue() {
    store.setStep2({ vehicleType, movers });
    router.push('/(client)/booking/step3');
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <BookingHeader
        step={2}
        title="Véhicule & livrizeurs"
        subtitle="Choisissez le bon véhicule pour votre besoin"
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-5">
          {/* Vehicle selection */}
          <Text className="text-gray-700 font-bold text-base mb-3">Type de véhicule</Text>
          <View className="gap-y-3 mb-6">
            {VEHICLES.map(({ type, label, icon, capacity }) => {
              const isSelected = vehicleType === type;
              const p = calculatePrice(type, movers, store.routeMinutes, 'express');
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => setVehicleType(type)}
                  className={`border-2 rounded-2xl p-4 ${isSelected ? 'border-primary-600 bg-primary-50' : 'border-gray-200 bg-white'}`}
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center gap-x-3">
                    <Text className="text-4xl">{icon}</Text>
                    <View className="flex-1">
                      <Text className={`font-bold text-base ${isSelected ? 'text-primary-800' : 'text-gray-900'}`}>
                        {label}
                      </Text>
                      <Text className="text-gray-500 text-sm">{capacity}</Text>
                      <Text className="text-xs text-gray-400 mt-0.5">{getVehicleDimensions(type)}</Text>
                    </View>
                    <View className="items-end">
                      <Text className={`font-bold text-base ${isSelected ? 'text-primary-700' : 'text-gray-700'}`}>
                        {formatPrice(p.pricePerMin)}/min
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={22} color="#1e40af" className="mt-1" />
                      )}
                    </View>
                  </View>

                  {isSelected && (
                    <Text className="text-gray-500 text-xs mt-2 leading-4">
                      {getVehicleDescription(type)}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Movers toggle */}
          <Text className="text-gray-700 font-bold text-base mb-3">Nombre de livrizeurs</Text>
          <View className="flex-row gap-x-3 mb-6">
            {([1, 2] as MoversCount[]).map((count) => (
              <TouchableOpacity
                key={count}
                onPress={() => setMovers(count)}
                className={`flex-1 border-2 rounded-2xl p-4 items-center ${
                  movers === count ? 'border-primary-600 bg-primary-50' : 'border-gray-200 bg-white'
                }`}
                activeOpacity={0.8}
              >
                <Text className="text-3xl mb-1">{count === 1 ? '👤' : '👥'}</Text>
                <Text className={`font-bold text-base ${movers === count ? 'text-primary-800' : 'text-gray-900'}`}>
                  {count} livrizeur{count > 1 ? 's' : ''}
                </Text>
                <Text className="text-gray-500 text-xs mt-0.5">
                  {count === 1 ? 'Conduite seule' : 'Avec aide au transport'}
                </Text>
                {count === 2 && (
                  <View className="bg-green-100 rounded-full px-2 py-0.5 mt-2">
                    <Text className="text-green-700 text-xs font-semibold">Recommandé meubles lourds</Text>
                  </View>
                )}
                {movers === count && (
                  <Ionicons name="checkmark-circle" size={18} color="#1e40af" style={{ marginTop: 4 }} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Price preview */}
          <View className="bg-gray-50 rounded-2xl p-4 mb-4">
            <Text className="text-gray-700 font-semibold mb-2">Estimation pour votre trajet</Text>
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-500 text-sm">Durée estimée</Text>
              <Text className="text-gray-700 text-sm font-semibold">{store.routeMinutes + 30} min</Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-500 text-sm">Tarif/min</Text>
              <Text className="text-gray-700 text-sm font-semibold">{formatPrice(pricing.pricePerMin)}</Text>
            </View>
            <View className="flex-row justify-between border-t border-gray-200 mt-2 pt-2">
              <Text className="text-gray-900 font-bold">Total estimé</Text>
              <Text className="text-primary-700 font-bold text-lg">{formatPrice(pricing.pTotal)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="px-5 pb-8 pt-4">
        <TouchableOpacity
          onPress={handleContinue}
          className="bg-primary-700 py-4 rounded-2xl items-center"
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-lg">Continuer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
