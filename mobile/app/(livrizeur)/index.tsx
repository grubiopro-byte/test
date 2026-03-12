import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/pricing';
import { VEHICLE_LABELS, MANUTENTION_LABELS, STATUS_LABELS } from '@/lib/types';
import type { Course } from '@/lib/types';

function MissionCard({
  course,
  onAccept,
}: {
  course: Course;
  onAccept: () => void;
}) {
  return (
    <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
      {/* Header */}
      <View className="flex-row items-start justify-between mb-4">
        <View className="flex-row items-center gap-x-2">
          <View className="w-10 h-10 bg-primary-50 rounded-xl items-center justify-center">
            <Text className="text-xl">🚛</Text>
          </View>
          <View>
            <Text className="text-gray-900 font-bold">{VEHICLE_LABELS[course.vehicle_type]}</Text>
            <Text className="text-gray-500 text-xs">
              {course.movers} livrizeur{course.movers > 1 ? 's' : ''} · {course.scheduled_slot}
            </Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-primary-700 text-xl font-bold">{formatPrice(course.livrizeur_amount)}</Text>
          <Text className="text-gray-400 text-xs">vos gains</Text>
        </View>
      </View>

      {/* Route */}
      <View className="bg-gray-50 rounded-xl p-3 mb-4">
        <View className="flex-row gap-x-3 mb-2">
          <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center flex-shrink-0 mt-0.5">
            <Text className="text-blue-700 text-xs font-bold">A</Text>
          </View>
          <Text className="text-gray-700 text-sm flex-1" numberOfLines={2}>{course.pickup_address}</Text>
        </View>
        <View className="ml-3 w-px h-3 bg-gray-300 mb-2" />
        <View className="flex-row gap-x-3">
          <View className="w-6 h-6 bg-red-100 rounded-full items-center justify-center flex-shrink-0 mt-0.5">
            <Text className="text-red-500 text-xs font-bold">B</Text>
          </View>
          <Text className="text-gray-700 text-sm flex-1" numberOfLines={2}>{course.dropoff_address}</Text>
        </View>
      </View>

      {/* Details */}
      <View className="flex-row flex-wrap gap-2 mb-4">
        {[
          { icon: '📅', label: course.scheduled_date },
          { icon: '⏱', label: MANUTENTION_LABELS[course.manutention] },
          { icon: '🕐', label: `${course.route_minutes + 30} min estimées` },
        ].map(({ icon, label }) => (
          <View key={label} className="flex-row items-center gap-x-1 bg-gray-100 rounded-full px-3 py-1.5">
            <Text className="text-sm">{icon}</Text>
            <Text className="text-gray-600 text-xs font-medium">{label}</Text>
          </View>
        ))}
      </View>

      {/* Description */}
      {course.items_description && (
        <View className="border-t border-gray-100 pt-3 mb-4">
          <Text className="text-gray-500 text-xs mb-1">Objets à transporter :</Text>
          <Text className="text-gray-700 text-sm" numberOfLines={2}>{course.items_description}</Text>
        </View>
      )}

      {/* CTA */}
      <TouchableOpacity
        onPress={onAccept}
        className="bg-primary-700 py-4 rounded-2xl items-center"
        activeOpacity={0.8}
      >
        <Text className="text-white font-bold text-base">
          ✅ Accepter cette mission — {formatPrice(course.livrizeur_amount)}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function AvailableMissions() {
  const [missions, setMissions] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [livrizeurId, setLivrizeurId] = useState<string | null>(null);

  useEffect(() => {
    loadLivrizeur();
  }, []);

  async function loadLivrizeur() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from('livrizeurs')
      .select('id, vehicle_type, radius_km, latitude, longitude, status')
      .eq('user_id', session.user.id)
      .single();

    if (data) {
      setLivrizeurId(data.id);
      if (data.status === 'active') {
        await loadMissions(data);
      }
    }
    setLoading(false);
  }

  async function loadMissions(livrizeur: any) {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('status', 'en_attente')
      .eq('vehicle_type', livrizeur.vehicle_type)
      .order('created_at', { ascending: false });

    setMissions(data as Course[] || []);
    setRefreshing(false);
  }

  async function acceptMission(course: Course) {
    if (!livrizeurId) return;

    Alert.alert(
      'Accepter la mission ?',
      `Transport du ${course.scheduled_date} · Gains estimés : ${formatPrice(course.livrizeur_amount)}`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Accepter',
          onPress: async () => {
            const { error } = await supabase
              .from('courses')
              .update({
                status: 'acceptee',
                livrizeur_id: livrizeurId,
                accepted_at: new Date().toISOString(),
              })
              .eq('id', course.id)
              .eq('status', 'en_attente'); // Prevent race condition

            if (error) {
              Alert.alert('Erreur', 'Cette mission a déjà été acceptée par un autre livrizeur');
            } else {
              Alert.alert('Mission acceptée ! 🎉', 'Le client a été notifié. Bonne course !');
              setMissions((prev) => prev.filter((m) => m.id !== course.id));
            }
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-100">
        <Text className="text-gray-900 text-2xl font-bold">Missions disponibles</Text>
        <Text className="text-gray-500 text-sm mt-1">Dans votre zone d'action</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1e40af" />
        </View>
      ) : missions.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">🔍</Text>
          <Text className="text-gray-700 font-bold text-lg mb-2">Aucune mission pour l'instant</Text>
          <Text className="text-gray-400 text-center text-sm">
            Les nouvelles missions apparaîtront ici en temps réel. Restez disponible !
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-4"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadLivrizeur(); }}
              tintColor="#1e40af"
            />
          }
        >
          <Text className="text-gray-500 text-sm mb-3">
            {missions.length} mission{missions.length > 1 ? 's' : ''} disponible{missions.length > 1 ? 's' : ''}
          </Text>
          {missions.map((mission) => (
            <MissionCard
              key={mission.id}
              course={mission}
              onAccept={() => acceptMission(mission)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
