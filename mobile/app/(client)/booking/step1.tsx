import { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useBookingStore } from '@/lib/bookingStore';
import { BookingHeader } from '@/components/ui/BookingHeader';

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`
    );
    const data = await res.json();
    if (data.results?.[0]) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    }
  } catch {}
  return null;
}

async function getRouteMinutes(
  pickupLat: number,
  pickupLng: number,
  dropoffLat: number,
  dropoffLng: number
): Promise<number> {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${pickupLat},${pickupLng}&destination=${dropoffLat},${dropoffLng}&key=${GOOGLE_API_KEY}`
    );
    const data = await res.json();
    if (data.routes?.[0]?.legs?.[0]?.duration?.value) {
      return Math.ceil(data.routes[0].legs[0].duration.value / 60);
    }
  } catch {}
  return 30;
}

export default function Step1() {
  const router = useRouter();
  const { setStep1, pickupAddress: savedPickup, dropoffAddress: savedDropoff } = useBookingStore();

  const [pickup, setPickup] = useState(savedPickup);
  const [dropoff, setDropoff] = useState(savedDropoff);
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeField, setActiveField] = useState<'pickup' | 'dropoff' | null>(null);

  const mapRef = useRef<MapView>(null);

  async function handleContinue() {
    if (!pickup || !dropoff) {
      Alert.alert('Erreur', 'Veuillez saisir les deux adresses');
      return;
    }

    setLoading(true);

    let pCoords = pickupCoords;
    let dCoords = dropoffCoords;

    if (!pCoords) pCoords = await geocodeAddress(pickup);
    if (!dCoords) dCoords = await geocodeAddress(dropoff);

    if (!pCoords || !dCoords) {
      setLoading(false);
      Alert.alert('Erreur', 'Adresse introuvable. Vérifiez les adresses saisies.');
      return;
    }

    const routeMinutes = await getRouteMinutes(pCoords.lat, pCoords.lng, dCoords.lat, dCoords.lng);

    setLoading(false);

    setStep1({
      pickupAddress: pickup,
      pickupLat: pCoords.lat,
      pickupLng: pCoords.lng,
      dropoffAddress: dropoff,
      dropoffLat: dCoords.lat,
      dropoffLng: dCoords.lng,
      routeMinutes,
    });

    router.push('/(client)/booking/step2');
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <BookingHeader
        step={1}
        title="Adresses"
        subtitle="Où doit-on venir vous chercher ?"
      />

      {/* Map */}
      <View className="h-56 mx-0">
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          className="flex-1"
          initialRegion={{
            latitude: pickupCoords?.lat ?? 48.8566,
            longitude: pickupCoords?.lng ?? 2.3522,
            latitudeDelta: 0.15,
            longitudeDelta: 0.15,
          }}
        >
          {pickupCoords && (
            <Marker
              coordinate={{ latitude: pickupCoords.lat, longitude: pickupCoords.lng }}
              title="Départ"
              pinColor="#3b82f6"
            />
          )}
          {dropoffCoords && (
            <Marker
              coordinate={{ latitude: dropoffCoords.lat, longitude: dropoffCoords.lng }}
              title="Arrivée"
              pinColor="#ef4444"
            />
          )}
        </MapView>
      </View>

      <ScrollView className="flex-1 px-5 pt-5" keyboardShouldPersistTaps="handled">
        {/* Pickup */}
        <View className="mb-4">
          <Text className="text-gray-700 font-semibold mb-2">
            📍 Adresse de départ
          </Text>
          <View
            className={`flex-row items-center border-2 rounded-xl px-4 ${
              activeField === 'pickup' ? 'border-primary-500' : 'border-gray-200'
            }`}
          >
            <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
              <Text className="text-primary-700 font-bold text-sm">A</Text>
            </View>
            <TextInput
              className="flex-1 py-4 text-gray-900 text-base"
              placeholder="12 rue de la Paix, Paris..."
              placeholderTextColor="#9ca3af"
              value={pickup}
              onChangeText={setPickup}
              onFocus={() => setActiveField('pickup')}
              onBlur={() => setActiveField(null)}
              returnKeyType="next"
            />
            {pickup ? (
              <TouchableOpacity onPress={() => { setPickup(''); setPickupCoords(null); }}>
                <Ionicons name="close-circle" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Connector line */}
        <View className="items-center -mt-2 -mb-2 ml-10">
          <View className="w-px h-6 bg-gray-200" />
        </View>

        {/* Dropoff */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-2">
            🏁 Adresse d'arrivée
          </Text>
          <View
            className={`flex-row items-center border-2 rounded-xl px-4 ${
              activeField === 'dropoff' ? 'border-red-400' : 'border-gray-200'
            }`}
          >
            <View className="w-8 h-8 bg-red-100 rounded-full items-center justify-center mr-3">
              <Text className="text-red-500 font-bold text-sm">B</Text>
            </View>
            <TextInput
              className="flex-1 py-4 text-gray-900 text-base"
              placeholder="5 avenue des Fleurs, Lyon..."
              placeholderTextColor="#9ca3af"
              value={dropoff}
              onChangeText={setDropoff}
              onFocus={() => setActiveField('dropoff')}
              onBlur={() => setActiveField(null)}
              returnKeyType="done"
            />
            {dropoff ? (
              <TouchableOpacity onPress={() => { setDropoff(''); setDropoffCoords(null); }}>
                <Ionicons name="close-circle" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Info */}
        <View className="bg-blue-50 rounded-xl p-3 mb-6 flex-row gap-x-3">
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
          <Text className="text-blue-700 text-sm flex-1">
            Le temps de route est calculé automatiquement via Google Maps et sert au calcul du prix.
          </Text>
        </View>
      </ScrollView>

      {/* CTA */}
      <View className="px-5 pb-8 pt-4">
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!pickup || !dropoff || loading}
          className={`py-4 rounded-2xl items-center ${
            pickup && dropoff && !loading ? 'bg-primary-700' : 'bg-gray-200'
          }`}
          activeOpacity={0.8}
        >
          <Text className={`font-bold text-lg ${pickup && dropoff ? 'text-white' : 'text-gray-400'}`}>
            {loading ? 'Calcul en cours...' : 'Continuer'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
