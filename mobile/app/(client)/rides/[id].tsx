import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/pricing';
import { STATUS_LABELS, STATUS_COLORS, VEHICLE_LABELS, MANUTENTION_LABELS } from '@/lib/types';
import type { Course, CourseStatus } from '@/lib/types';

const STATUS_STEPS: CourseStatus[] = ['en_attente', 'acceptee', 'en_route', 'sur_place', 'en_livraison', 'terminee'];

const STATUS_ICONS: Record<CourseStatus, string> = {
  en_attente: '⏳',
  acceptee: '✅',
  en_route: '🚗',
  sur_place: '📍',
  en_livraison: '🚛',
  terminee: '🎉',
  annulee: '❌',
};

export default function RideDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRating, setShowRating] = useState(false);
  const [stars, setStars] = useState(5);
  const [tip, setTip] = useState(0);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (id) {
      loadCourse();
      subscribeToUpdates();
    }
  }, [id]);

  async function loadCourse() {
    // MODE DEMO
    const { DEMO_COURSES } = await import('@/lib/demo-data');
    const found = DEMO_COURSES.find(c => c.id === id) || DEMO_COURSES[0];
    setCourse(found as any);
    setLoading(false);
  }

  function subscribeToUpdates() {
    // MODE DEMO : pas de realtime
    return () => {};
  }

  async function handleComplete() {
    Alert.alert('Confirmer', 'Course terminée (mode démo)', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Confirmer', onPress: () => setShowRating(true) },
    ]);
  }

  async function handleCancel() {
    Alert.alert('Annuler', 'Course annulée (mode démo)', [
      { text: 'Non', style: 'cancel' },
      { text: 'Oui', style: 'destructive', onPress: () => router.back() },
    ]);
  }

  async function submitRating() {
    setShowRating(false);
    router.replace('/(client)/rides');
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#1e40af" />
      </SafeAreaView>
    );
  }

  if (!course) return null;

  const currentStepIndex = STATUS_STEPS.indexOf(course.status);
  const isActive = !['terminee', 'annulee'].includes(course.status);
  const canComplete = course.status === 'en_livraison';
  const canCancel = ['en_attente', 'acceptee'].includes(course.status);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 pt-12 pb-4 border-b border-gray-100 flex-row items-center gap-x-3">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-gray-900 text-xl font-bold">Suivi de course</Text>
          <View className="flex-row items-center gap-x-2 mt-0.5">
            <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[course.status] }} />
            <Text className="text-gray-500 text-sm">{STATUS_LABELS[course.status]}</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Map */}
        {isActive && (
          <View className="h-52">
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              className="flex-1"
              initialRegion={{
                latitude: course.pickup_lat,
                longitude: course.pickup_lng,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              }}
            >
              <Marker
                coordinate={{ latitude: course.pickup_lat, longitude: course.pickup_lng }}
                title="Départ"
                pinColor="#3b82f6"
              />
              <Marker
                coordinate={{ latitude: course.dropoff_lat, longitude: course.dropoff_lng }}
                title="Arrivée"
                pinColor="#ef4444"
              />
            </MapView>
          </View>
        )}

        <View className="px-5 pt-5">
          {/* Status timeline */}
          {course.status !== 'annulee' && (
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
              <Text className="text-gray-900 font-bold mb-4">Progression</Text>
              {STATUS_STEPS.map((status, i) => {
                const isDone = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                return (
                  <View key={status} className="flex-row items-start gap-x-3 mb-3">
                    <View className="items-center">
                      <View
                        className={`w-8 h-8 rounded-full items-center justify-center ${
                          isDone ? 'bg-primary-600' : 'bg-gray-100'
                        }`}
                      >
                        <Text className="text-sm">{STATUS_ICONS[status]}</Text>
                      </View>
                      {i < STATUS_STEPS.length - 1 && (
                        <View
                          className={`w-0.5 h-4 mt-1 ${isDone && i < currentStepIndex ? 'bg-primary-400' : 'bg-gray-200'}`}
                        />
                      )}
                    </View>
                    <View className="flex-1 pt-1">
                      <Text className={`font-semibold text-sm ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                        {STATUS_LABELS[status]}
                      </Text>
                      {isCurrent && (
                        <Text className="text-primary-600 text-xs mt-0.5">En cours...</Text>
                      )}
                    </View>
                    {isCurrent && (
                      <View className="w-2 h-2 rounded-full bg-primary-500 mt-3" />
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Livrizeur info */}
          {course.livrizeur && (
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 flex-row items-center gap-x-4">
              <View className="w-14 h-14 bg-primary-100 rounded-full items-center justify-center">
                <Text className="text-2xl">🚛</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-xs">Votre livrizeur</Text>
                <Text className="text-gray-900 font-bold">
                  {(course.livrizeur as any)?.user?.first_name} {(course.livrizeur as any)?.user?.last_name}
                </Text>
                <View className="flex-row items-center gap-x-1 mt-0.5">
                  <Text className="text-amber-400 text-sm">★</Text>
                  <Text className="text-gray-600 text-sm font-semibold">
                    {(course.livrizeur as any)?.average_rating?.toFixed(1)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity className="w-12 h-12 bg-green-100 rounded-full items-center justify-center">
                <Ionicons name="call" size={22} color="#16a34a" />
              </TouchableOpacity>
            </View>
          )}

          {/* Course details */}
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
            <Text className="text-gray-900 font-bold mb-4">Détails</Text>
            {[
              { icon: '📍', label: 'Départ', value: course.pickup_address },
              { icon: '🏁', label: 'Arrivée', value: course.dropoff_address },
              { icon: '🚛', label: 'Véhicule', value: VEHICLE_LABELS[course.vehicle_type] },
              { icon: '📅', label: 'Créneau', value: `${course.scheduled_date} · ${course.scheduled_slot}` },
              { icon: '⏱', label: 'Manutention', value: MANUTENTION_LABELS[course.manutention] },
            ].map(({ icon, label, value }) => (
              <View key={label} className="flex-row gap-x-3 mb-3">
                <Text className="text-lg w-7">{icon}</Text>
                <View className="flex-1">
                  <Text className="text-gray-400 text-xs">{label}</Text>
                  <Text className="text-gray-900 text-sm" numberOfLines={2}>{value}</Text>
                </View>
              </View>
            ))}
            <View className="border-t border-gray-100 mt-2 pt-3 flex-row justify-between">
              <Text className="text-gray-700 font-semibold">Total</Text>
              <Text className="text-primary-700 font-bold text-lg">{formatPrice(course.price_total)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action buttons */}
      {(canComplete || canCancel) && (
        <View className="px-5 pb-8 pt-4 gap-y-3">
          {canComplete && (
            <TouchableOpacity
              onPress={handleComplete}
              className="bg-green-600 py-4 rounded-2xl items-center"
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-lg">✅ Confirmer la fin de course</Text>
            </TouchableOpacity>
          )}
          {canCancel && (
            <TouchableOpacity
              onPress={handleCancel}
              className="border-2 border-red-200 py-3 rounded-2xl items-center"
              activeOpacity={0.8}
            >
              <Text className="text-red-500 font-semibold">Annuler la course</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Rating Modal */}
      <Modal visible={showRating} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10">
            <Text className="text-gray-900 text-2xl font-bold text-center mb-1">
              Course terminée 🎉
            </Text>
            <Text className="text-gray-500 text-center mb-6">
              Comment s'est passée votre course ?
            </Text>

            {/* Stars */}
            <View className="flex-row justify-center gap-x-3 mb-6">
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setStars(s)}>
                  <Text className={`text-4xl ${s <= stars ? 'opacity-100' : 'opacity-30'}`}>⭐</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tip */}
            <Text className="text-gray-700 font-semibold mb-3 text-center">Laisser un pourboire ?</Text>
            <View className="flex-row gap-x-2 mb-6">
              {[0, 5, 10, 15, 20].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  onPress={() => setTip(amount)}
                  className={`flex-1 border-2 rounded-xl py-3 items-center ${
                    tip === amount ? 'border-primary-600 bg-primary-50' : 'border-gray-200'
                  }`}
                >
                  <Text className={`font-bold text-sm ${tip === amount ? 'text-primary-700' : 'text-gray-700'}`}>
                    {amount === 0 ? 'Non' : `${amount}€`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={submitRating}
              className="bg-primary-700 py-4 rounded-2xl items-center"
            >
              <Text className="text-white font-bold text-lg">Envoyer mon avis</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
