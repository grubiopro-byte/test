import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useBookingStore } from '@/lib/bookingStore';
import { BookingHeader } from '@/components/ui/BookingHeader';
import { calculatePrice, formatPrice } from '@/lib/pricing';
import type { AccessType, ManutentionOption } from '@/lib/types';
import { MANUTENTION_LABELS } from '@/lib/types';

const ACCESS_OPTIONS: { type: AccessType; label: string; icon: string }[] = [
  { type: 'pied_camion', label: 'Pied du camion', icon: '🏁' },
  { type: 'etages_sans_ascenseur', label: 'Étage(s) sans ascenseur', icon: '🪜' },
  { type: 'etages_avec_ascenseur', label: 'Étage(s) avec ascenseur', icon: '🛗' },
];

const MANUTENTION: { type: ManutentionOption; label: string; extra: string; icon: string }[] = [
  { type: 'express', label: 'Express', extra: '30 min incluses', icon: '⚡' },
  { type: 'prolongee', label: 'Prolongée -1H', extra: '+60 min (+15%)', icon: '🕐' },
  { type: 'prolongee_plus', label: 'Prolongée+ -2H', extra: '+120 min (+15%)', icon: '🕑' },
  { type: 'prolongee_max', label: 'Prolongée Max -3H', extra: '+180 min (+10%)', icon: '🕒' },
];

function AccessSection({
  title,
  access,
  floors,
  onAccessChange,
  onFloorsChange,
}: {
  title: string;
  access: AccessType;
  floors: number;
  onAccessChange: (t: AccessType) => void;
  onFloorsChange: (n: number) => void;
}) {
  return (
    <View className="mb-6">
      <Text className="text-gray-700 font-bold text-base mb-3">{title}</Text>
      <View className="gap-y-2">
        {ACCESS_OPTIONS.map(({ type, label, icon }) => (
          <TouchableOpacity
            key={type}
            onPress={() => onAccessChange(type)}
            className={`flex-row items-center border-2 rounded-xl px-4 py-3 gap-x-3 ${
              access === type ? 'border-primary-600 bg-primary-50' : 'border-gray-200 bg-white'
            }`}
            activeOpacity={0.8}
          >
            <Text className="text-xl">{icon}</Text>
            <Text className={`flex-1 font-semibold ${access === type ? 'text-primary-800' : 'text-gray-700'}`}>
              {label}
            </Text>
            <View
              className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                access === type ? 'border-primary-600 bg-primary-600' : 'border-gray-300'
              }`}
            >
              {access === type && <View className="w-2 h-2 rounded-full bg-white" />}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {(access === 'etages_sans_ascenseur' || access === 'etages_avec_ascenseur') && (
        <View className="mt-3 flex-row items-center gap-x-3">
          <Text className="text-gray-600 text-sm">Nombre d'étages :</Text>
          <View className="flex-row items-center border-2 border-gray-200 rounded-xl overflow-hidden">
            <TouchableOpacity
              onPress={() => onFloorsChange(Math.max(1, floors - 1))}
              className="w-10 h-10 items-center justify-center bg-gray-50"
            >
              <Text className="text-gray-700 text-xl font-bold">-</Text>
            </TouchableOpacity>
            <Text className="w-12 text-center font-bold text-gray-900">{floors}</Text>
            <TouchableOpacity
              onPress={() => onFloorsChange(floors + 1)}
              className="w-10 h-10 items-center justify-center bg-gray-50"
            >
              <Text className="text-gray-700 text-xl font-bold">+</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

export default function Step5() {
  const router = useRouter();
  const store = useBookingStore();

  const [pickupAccess, setPickupAccess] = useState<AccessType>(store.pickupAccess);
  const [pickupFloors, setPickupFloors] = useState(store.pickupFloors || 1);
  const [dropoffAccess, setDropoffAccess] = useState<AccessType>(store.dropoffAccess);
  const [dropoffFloors, setDropoffFloors] = useState(store.dropoffFloors || 1);
  const [manutention, setManutention] = useState<ManutentionOption>(store.manutention);

  const pricing = calculatePrice(store.vehicleType, store.movers, store.routeMinutes, manutention);

  function handleContinue() {
    store.setStep5({ pickupAccess, pickupFloors, dropoffAccess, dropoffFloors, manutention });
    router.push('/(client)/booking/step6');
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <BookingHeader
        step={5}
        title="Accès & manutention"
        subtitle="Aidez le livrizeur à préparer son intervention"
      />

      <ScrollView className="flex-1 px-5 pt-5" showsVerticalScrollIndicator={false}>
        <AccessSection
          title="🚛 Accès au point de départ"
          access={pickupAccess}
          floors={pickupFloors}
          onAccessChange={setPickupAccess}
          onFloorsChange={setPickupFloors}
        />

        <View className="h-px bg-gray-100 mb-6" />

        <AccessSection
          title="🏁 Accès au point d'arrivée"
          access={dropoffAccess}
          floors={dropoffFloors}
          onAccessChange={setDropoffAccess}
          onFloorsChange={setDropoffFloors}
        />

        <View className="h-px bg-gray-100 mb-6" />

        {/* Manutention */}
        <Text className="text-gray-700 font-bold text-base mb-3">⏱ Option de manutention</Text>
        <View className="gap-y-3 mb-4">
          {MANUTENTION.map(({ type, label, extra, icon }) => {
            const p = calculatePrice(store.vehicleType, store.movers, store.routeMinutes, type);
            return (
              <TouchableOpacity
                key={type}
                onPress={() => setManutention(type)}
                className={`border-2 rounded-2xl p-4 ${
                  manutention === type ? 'border-primary-600 bg-primary-50' : 'border-gray-200 bg-white'
                }`}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center gap-x-3">
                  <Text className="text-2xl">{icon}</Text>
                  <View className="flex-1">
                    <Text className={`font-bold text-base ${manutention === type ? 'text-primary-800' : 'text-gray-900'}`}>
                      {label}
                    </Text>
                    <Text className="text-gray-500 text-xs">{extra}</Text>
                  </View>
                  <Text className={`font-bold text-base ${manutention === type ? 'text-primary-700' : 'text-gray-700'}`}>
                    {formatPrice(p.pTotal)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Total */}
        <View className="bg-primary-800 rounded-2xl p-5 mb-8">
          <Text className="text-blue-200 text-sm mb-1">Prix total estimé</Text>
          <Text className="text-white text-4xl font-bold">{formatPrice(pricing.pTotal)}</Text>
          <Text className="text-blue-300 text-xs mt-2">
            Débité uniquement à la fin de la course
          </Text>
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
