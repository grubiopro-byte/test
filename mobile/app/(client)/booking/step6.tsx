import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBookingStore } from '@/lib/bookingStore';
import { BookingHeader } from '@/components/ui/BookingHeader';
import { PriceSummary } from '@/components/ui/PriceSummary';
import { calculatePrice, formatPrice } from '@/lib/pricing';
import { supabase } from '@/lib/supabase';

export default function Step6() {
  const router = useRouter();
  const store = useBookingStore();

  const [firstName, setFirstName] = useState(store.firstName);
  const [lastName, setLastName] = useState(store.lastName);
  const [email, setEmail] = useState(store.email);
  const [phone, setPhone] = useState(store.phone);
  const [loading, setLoading] = useState(false);

  const pricing = calculatePrice(store.vehicleType, store.movers, store.routeMinutes, store.manutention);

  const isValid = firstName && lastName && email && phone;

  async function handleBook() {
    if (!isValid) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    // MODE DEMO : simule une réservation
    store.reset();
    router.replace('/(client)/booking/confirmation?id=course-demo');
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <SafeAreaView className="flex-1">
        <BookingHeader
          step={6}
          title="Vos coordonnées"
          subtitle="Dernière étape avant votre réservation !"
        />

        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          <View className="px-5 pt-5">
            {/* Price recap */}
            <View className="bg-primary-800 rounded-2xl p-5 mb-6">
              <Text className="text-blue-200 text-sm">Total à régler en fin de course</Text>
              <Text className="text-white text-4xl font-bold mt-1">{formatPrice(pricing.pTotal)}</Text>
              <Text className="text-blue-300 text-xs mt-2">
                💳 Empreinte bancaire uniquement — débit après la course
              </Text>
            </View>

            {/* Form */}
            <View className="flex-row gap-x-3 mb-4">
              <View className="flex-1">
                <Text className="text-gray-700 font-semibold mb-2">Prénom *</Text>
                <TextInput
                  className="border-2 border-gray-200 rounded-xl px-4 py-4 text-gray-900"
                  placeholder="Jean"
                  placeholderTextColor="#9ca3af"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 font-semibold mb-2">Nom *</Text>
                <TextInput
                  className="border-2 border-gray-200 rounded-xl px-4 py-4 text-gray-900"
                  placeholder="Dupont"
                  placeholderTextColor="#9ca3af"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Email *</Text>
              <View className="flex-row items-center border-2 border-gray-200 rounded-xl px-4">
                <Ionicons name="mail-outline" size={20} color="#9ca3af" />
                <TextInput
                  className="flex-1 ml-3 py-4 text-gray-900"
                  placeholder="jean@email.fr"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-2">Téléphone *</Text>
              <View className="flex-row items-center border-2 border-gray-200 rounded-xl px-4">
                <Ionicons name="call-outline" size={20} color="#9ca3af" />
                <TextInput
                  className="flex-1 ml-3 py-4 text-gray-900"
                  placeholder="06 12 34 56 78"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            {/* Stripe placeholder */}
            <View className="border-2 border-gray-200 rounded-2xl p-4 mb-4">
              <View className="flex-row items-center gap-x-2 mb-3">
                <Ionicons name="card-outline" size={20} color="#374151" />
                <Text className="text-gray-700 font-semibold">Carte bancaire</Text>
                <View className="flex-1" />
                <Text className="text-xs text-gray-400">🔒 Sécurisé Stripe</Text>
              </View>
              <TextInput
                className="border border-gray-200 rounded-xl px-4 py-3 text-gray-500 mb-3"
                placeholder="1234 5678 9012 3456"
                placeholderTextColor="#9ca3af"
                keyboardType="number-pad"
                editable={false}
              />
              <View className="flex-row gap-x-3">
                <TextInput
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-gray-500"
                  placeholder="MM/AA"
                  placeholderTextColor="#9ca3af"
                  editable={false}
                />
                <TextInput
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-gray-500"
                  placeholder="CVV"
                  placeholderTextColor="#9ca3af"
                  editable={false}
                />
              </View>
              <Text className="text-blue-600 text-xs text-center mt-3">
                Intégration Stripe Connect requise — empreinte uniquement
              </Text>
            </View>

            <Text className="text-gray-400 text-xs text-center mb-6">
              En réservant, vous acceptez les{' '}
              <Text className="text-primary-600">conditions générales</Text> et la{' '}
              <Text className="text-primary-600">politique d'annulation</Text> de Livrizi.
            </Text>
          </View>
        </ScrollView>

        <View className="px-5 pb-8 pt-4">
          <TouchableOpacity
            onPress={handleBook}
            disabled={!isValid || loading}
            className={`py-4 rounded-2xl items-center ${isValid && !loading ? 'bg-primary-700' : 'bg-gray-200'}`}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className={`font-bold text-lg ${isValid ? 'text-white' : 'text-gray-400'}`}>
                🚛 Réserver mon transport
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
