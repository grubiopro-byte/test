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
import { STATUS_LABELS, STATUS_COLORS, VEHICLE_LABELS } from '@/lib/types';
import type { Course } from '@/lib/types';

export default function MyMissions() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    loadMissions();
  }, []);

  async function loadMissions() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: livrizeur } = await supabase
      .from('livrizeurs')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (!livrizeur) { setLoading(false); return; }

    const { data } = await supabase
      .from('courses')
      .select('*, client:users!client_id(*)')
      .eq('livrizeur_id', livrizeur.id)
      .order('scheduled_date', { ascending: false });

    setCourses(data as Course[] || []);
    setLoading(false);
    setRefreshing(false);
  }

  const ACTIVE = ['acceptee', 'en_route', 'sur_place', 'en_livraison'];
  const upcoming = courses.filter((c) => ACTIVE.includes(c.status) || (c.status === 'en_attente'));
  const past = courses.filter((c) => ['terminee', 'annulee'].includes(c.status));
  const displayed = tab === 'upcoming' ? upcoming : past;

  async function updateStatus(courseId: string, newStatus: string) {
    await supabase
      .from('courses')
      .update({ status: newStatus })
      .eq('id', courseId);
    loadMissions();
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-100">
        <Text className="text-gray-900 text-2xl font-bold">Mes missions</Text>

        <View className="flex-row bg-gray-100 rounded-xl p-1 mt-4">
          {[
            { key: 'upcoming', label: `À venir (${upcoming.length})` },
            { key: 'past', label: `Passées (${past.length})` },
          ].map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              onPress={() => setTab(key as 'upcoming' | 'past')}
              className={`flex-1 py-2 rounded-lg items-center ${tab === key ? 'bg-white shadow-sm' : ''}`}
            >
              <Text className={`font-semibold text-sm ${tab === key ? 'text-gray-900' : 'text-gray-500'}`}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1e40af" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-4"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadMissions(); }}
              tintColor="#1e40af"
            />
          }
        >
          {displayed.length === 0 ? (
            <View className="items-center pt-16">
              <Text className="text-5xl mb-4">📋</Text>
              <Text className="text-gray-700 font-bold text-lg">Aucune mission</Text>
            </View>
          ) : (
            displayed.map((course) => (
              <View key={course.id} className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
                {/* Status */}
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-x-2">
                    <View className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[course.status] }} />
                    <Text className="text-gray-900 font-semibold">{STATUS_LABELS[course.status]}</Text>
                  </View>
                  <Text className="text-primary-700 font-bold">{formatPrice(course.livrizeur_amount)}</Text>
                </View>

                {/* Client */}
                <View className="flex-row items-center gap-x-3 mb-3">
                  <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                    <Text className="text-xl">👤</Text>
                  </View>
                  <View>
                    <Text className="text-gray-700 font-medium text-sm">
                      {(course as any).client?.first_name} {(course as any).client?.last_name}
                    </Text>
                    <TouchableOpacity>
                      <Text className="text-primary-600 text-xs">{(course as any).client?.phone}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Route */}
                <View className="mb-3">
                  <Text className="text-gray-500 text-xs mb-1" numberOfLines={1}>📍 {course.pickup_address}</Text>
                  <Text className="text-gray-500 text-xs" numberOfLines={1}>🏁 {course.dropoff_address}</Text>
                </View>

                <View className="flex-row gap-x-2 mb-3">
                  <View className="bg-gray-100 rounded-full px-3 py-1.5">
                    <Text className="text-gray-600 text-xs">📅 {course.scheduled_date} · {course.scheduled_slot}</Text>
                  </View>
                  <View className="bg-gray-100 rounded-full px-3 py-1.5">
                    <Text className="text-gray-600 text-xs">🚛 {VEHICLE_LABELS[course.vehicle_type]}</Text>
                  </View>
                </View>

                {/* Status update buttons */}
                {course.status === 'acceptee' && (
                  <TouchableOpacity
                    onPress={() => updateStatus(course.id, 'en_route')}
                    className="bg-purple-600 py-3 rounded-xl items-center"
                  >
                    <Text className="text-white font-semibold">🚗 Marquer "En route"</Text>
                  </TouchableOpacity>
                )}
                {course.status === 'en_route' && (
                  <TouchableOpacity
                    onPress={() => updateStatus(course.id, 'sur_place')}
                    className="bg-cyan-600 py-3 rounded-xl items-center"
                  >
                    <Text className="text-white font-semibold">📍 Marquer "Sur place"</Text>
                  </TouchableOpacity>
                )}
                {course.status === 'sur_place' && (
                  <TouchableOpacity
                    onPress={() => updateStatus(course.id, 'en_livraison')}
                    className="bg-green-600 py-3 rounded-xl items-center"
                  >
                    <Text className="text-white font-semibold">🚛 Marquer "En livraison"</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
