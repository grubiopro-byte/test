import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/pricing';
import { VEHICLE_LABELS, MANUTENTION_LABELS } from '@/lib/types';
import type { Course } from '@/lib/types';

export default function Confirmation() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadCourse();
  }, [id]);

  async function loadCourse() {
    // MODE DEMO
    const { DEMO_COURSES } = await import('@/lib/demo-data');
    const found = DEMO_COURSES.find(c => c.id === id) || DEMO_COURSES[0];
    setCourse(found as any);
    setLoading(false);
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#1e40af" />
      </SafeAreaView>
    );
  }

  if (!course) return null;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Success header */}
        <LinearGradient colors={['#16a34a', '#22c55e']} className="px-6 pt-16 pb-10 items-center">
          <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-4 shadow-lg">
            <Ionicons name="checkmark" size={40} color="#16a34a" />
          </View>
          <Text className="text-white text-2xl font-bold mb-2">Réservation confirmée !</Text>
          <Text className="text-green-100 text-center text-sm">
            Votre demande a été envoyée. Un livrizeur va vous être assigné rapidement.
          </Text>
        </LinearGradient>

        <View className="px-6 pt-6">
          {/* Course ID */}
          <View className="bg-gray-50 rounded-2xl p-4 mb-4">
            <Text className="text-gray-500 text-xs uppercase tracking-wide">Référence</Text>
            <Text className="text-gray-900 font-mono text-sm mt-1" numberOfLines={1}>
              {course.id}
            </Text>
          </View>

          {/* Details */}
          <View className="bg-white border border-gray-100 rounded-2xl p-5 mb-4 shadow-sm">
            <Text className="text-gray-900 font-bold text-base mb-4">Détails de votre transport</Text>

            {[
              { icon: '📍', label: 'Départ', value: course.pickup_address },
              { icon: '🏁', label: 'Arrivée', value: course.dropoff_address },
              { icon: '🚛', label: 'Véhicule', value: `${VEHICLE_LABELS[course.vehicle_type]} · ${course.movers} livrizeur${course.movers > 1 ? 's' : ''}` },
              { icon: '📅', label: 'Créneau', value: `${course.scheduled_date} · ${course.scheduled_slot}` },
              { icon: '⏱', label: 'Manutention', value: MANUTENTION_LABELS[course.manutention] },
            ].map(({ icon, label, value }) => (
              <View key={label} className="flex-row gap-x-3 mb-3">
                <Text className="text-lg w-7">{icon}</Text>
                <View className="flex-1">
                  <Text className="text-gray-400 text-xs">{label}</Text>
                  <Text className="text-gray-900 text-sm font-medium" numberOfLines={2}>{value}</Text>
                </View>
              </View>
            ))}

            <View className="border-t border-gray-100 mt-2 pt-4 flex-row justify-between items-center">
              <Text className="text-gray-700 font-semibold">Montant estimé</Text>
              <Text className="text-primary-800 font-bold text-xl">{formatPrice(course.price_total)}</Text>
            </View>
            <Text className="text-gray-400 text-xs mt-1 text-right">
              Débité uniquement à la fin de la course
            </Text>
          </View>

          {/* Status */}
          <View className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center gap-x-2 mb-2">
              <View className="w-3 h-3 rounded-full bg-amber-400" />
              <Text className="text-amber-700 font-semibold">En attente d'un livrizeur</Text>
            </View>
            <Text className="text-amber-600 text-sm">
              Tous les livrizeurs disponibles dans votre zone ont été notifiés. Vous recevrez une confirmation par email dès qu'un livrizeur accepte.
            </Text>
          </View>

          {/* Info */}
          <View className="gap-y-3 mb-8">
            {[
              { icon: '📧', text: 'Email de confirmation envoyé' },
              { icon: '📱', text: 'Suivi de course dans "Mes courses"' },
              { icon: '💳', text: 'Aucun débit avant la fin de la course' },
              { icon: '✅', text: 'Annulation gratuite jusqu\'à 24h avant' },
            ].map(({ icon, text }) => (
              <View key={text} className="flex-row items-center gap-x-3">
                <Text className="text-xl">{icon}</Text>
                <Text className="text-gray-600 text-sm flex-1">{text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* CTAs */}
      <View className="px-6 pb-8 pt-4 gap-y-3">
        <TouchableOpacity
          onPress={() => router.push(`/(client)/rides/${course.id}`)}
          className="bg-primary-700 py-4 rounded-2xl items-center"
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-lg">Suivre ma course</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.replace('/(client)')}
          className="border-2 border-gray-200 py-4 rounded-2xl items-center"
          activeOpacity={0.8}
        >
          <Text className="text-gray-700 font-semibold">Retour à l'accueil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
