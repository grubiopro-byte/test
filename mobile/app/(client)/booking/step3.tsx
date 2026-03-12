import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useBookingStore } from '@/lib/bookingStore';
import { BookingHeader } from '@/components/ui/BookingHeader';
import { PriceSummary } from '@/components/ui/PriceSummary';

const SLOTS = [
  '8h-9h', '9h-10h', '10h-11h', '11h-12h',
  '13h-14h', '14h-15h', '15h-16h', '16h-17h',
  '17h-18h', '18h-19h',
];

function getDayOptions() {
  const days = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const label = i === 0 ? "Aujourd'hui" : i === 1 ? 'Demain' : d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
    const value = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    days.push({ label, value });
  }
  return days;
}

export default function Step3() {
  const router = useRouter();
  const store = useBookingStore();
  const [selectedDate, setSelectedDate] = useState(store.scheduledDate);
  const [selectedSlot, setSelectedSlot] = useState(store.scheduledSlot);

  const days = getDayOptions();

  function handleContinue() {
    store.setStep3({ scheduledDate: selectedDate, scheduledSlot: selectedSlot });
    router.push('/(client)/booking/step4');
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <BookingHeader
        step={3}
        title="Date & créneau"
        subtitle="Quand souhaitez-vous être livré ?"
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-5">
          {/* Day selection */}
          <Text className="text-gray-700 font-bold text-base mb-3">Choisissez un jour</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
            <View className="flex-row gap-x-3 pr-5">
              {days.map(({ label, value }) => (
                <TouchableOpacity
                  key={value}
                  onPress={() => setSelectedDate(value)}
                  className={`border-2 rounded-2xl px-4 py-3 items-center min-w-[80px] ${
                    selectedDate === value
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 bg-white'
                  }`}
                  activeOpacity={0.8}
                >
                  <Text className={`text-xs font-semibold ${selectedDate === value ? 'text-primary-600' : 'text-gray-500'}`}>
                    {label.split(' ')[0]}
                  </Text>
                  <Text className={`font-bold text-base mt-0.5 ${selectedDate === value ? 'text-primary-800' : 'text-gray-900'}`}>
                    {label.includes(' ') ? label.split(' ').slice(1).join(' ') : ''}
                  </Text>
                  {selectedDate === value && (
                    <View className="w-2 h-2 rounded-full bg-primary-600 mt-1" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Slot selection */}
          <Text className="text-gray-700 font-bold text-base mb-3">Créneau d'arrivée souhaité</Text>
          <View className="flex-row flex-wrap gap-3 mb-6">
            {SLOTS.map((slot) => (
              <TouchableOpacity
                key={slot}
                onPress={() => setSelectedSlot(slot)}
                className={`border-2 rounded-xl px-4 py-3 ${
                  selectedSlot === slot
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 bg-white'
                }`}
                style={{ minWidth: '28%' }}
                activeOpacity={0.8}
              >
                <Text className={`font-semibold text-center text-sm ${
                  selectedSlot === slot ? 'text-primary-700' : 'text-gray-700'
                }`}>
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Info */}
          {selectedDate && selectedSlot && (
            <View className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
              <Text className="text-green-700 font-semibold">✅ Sélection confirmée</Text>
              <Text className="text-green-600 text-sm mt-1">
                Le {selectedDate} entre {selectedSlot}
              </Text>
              <Text className="text-green-500 text-xs mt-1">
                Le livrizeur arrivera dans ce créneau d'1 heure.
              </Text>
            </View>
          )}

          <PriceSummary />
        </View>
      </ScrollView>

      <View className="px-5 pb-8 pt-4">
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!selectedDate || !selectedSlot}
          className={`py-4 rounded-2xl items-center ${
            selectedDate && selectedSlot ? 'bg-primary-700' : 'bg-gray-200'
          }`}
          activeOpacity={0.8}
        >
          <Text className={`font-bold text-lg ${selectedDate && selectedSlot ? 'text-white' : 'text-gray-400'}`}>
            Continuer
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
