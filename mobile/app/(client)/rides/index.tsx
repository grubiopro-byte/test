import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/pricing';
import { STATUS_LABELS, STATUS_COLORS, VEHICLE_LABELS } from '@/lib/types';
import type { Course } from '@/lib/types';

const ACTIVE_STATUSES = ['en_attente', 'acceptee', 'en_route', 'sur_place', 'en_livraison'];

function CourseCard({ course, onPress }: { course: Course; onPress: () => void }) {
  const isActive = ACTIVE_STATUSES.includes(course.status);
  const statusColor = STATUS_COLORS[course.status];

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white border border-gray-100 rounded-2xl p-4 mb-3 shadow-sm"
      activeOpacity={0.7}
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-row items-center gap-x-2">
          <View className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColor }} />
          <Text className="font-semibold text-gray-900">{STATUS_LABELS[course.status]}</Text>
          {isActive && (
            <View className="bg-blue-100 rounded-full px-2 py-0.5">
              <Text className="text-blue-700 text-xs font-semibold">EN COURS</Text>
            </View>
          )}
        </View>
        <Text className="text-gray-400 text-xs">
          {new Date(course.created_at).toLocaleDateString('fr-FR')}
        </Text>
      </View>

      <View className="mb-3">
        <View className="flex-row gap-x-3 mb-1">
          <View className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
          <Text className="text-gray-700 text-sm flex-1" numberOfLines={1}>{course.pickup_address}</Text>
        </View>
        <View className="ml-1 w-px h-4 bg-gray-200 ml-[3px] my-0.5" />
        <View className="flex-row gap-x-3">
          <View className="w-2 h-2 rounded-full bg-red-500 mt-1.5" />
          <Text className="text-gray-700 text-sm flex-1" numberOfLines={1}>{course.dropoff_address}</Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row gap-x-3">
          <View className="flex-row items-center gap-x-1">
            <Ionicons name="car-outline" size={14} color="#6b7280" />
            <Text className="text-gray-500 text-xs">{VEHICLE_LABELS[course.vehicle_type]}</Text>
          </View>
          <View className="flex-row items-center gap-x-1">
            <Ionicons name="calendar-outline" size={14} color="#6b7280" />
            <Text className="text-gray-500 text-xs">{course.scheduled_slot}</Text>
          </View>
        </View>
        <Text className="text-primary-700 font-bold">{formatPrice(course.price_total)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function MyRides() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('client_id', session.user.id)
      .order('created_at', { ascending: false });

    setCourses(data as Course[] || []);
    setLoading(false);
    setRefreshing(false);
  }

  const activeCourses = courses.filter((c) => ACTIVE_STATUSES.includes(c.status));
  const pastCourses = courses.filter((c) => !ACTIVE_STATUSES.includes(c.status));
  const displayedCourses = activeTab === 'active' ? activeCourses : pastCourses;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-100">
        <Text className="text-gray-900 text-2xl font-bold">Mes courses</Text>

        {/* Tabs */}
        <View className="flex-row bg-gray-100 rounded-xl p-1 mt-4">
          {[
            { key: 'active', label: `En cours (${activeCourses.length})` },
            { key: 'history', label: `Historique (${pastCourses.length})` },
          ].map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              onPress={() => setActiveTab(key as 'active' | 'history')}
              className={`flex-1 py-2 rounded-lg items-center ${activeTab === key ? 'bg-white shadow-sm' : ''}`}
            >
              <Text className={`font-semibold text-sm ${activeTab === key ? 'text-gray-900' : 'text-gray-500'}`}>
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
              onRefresh={() => { setRefreshing(true); loadCourses(); }}
              tintColor="#1e40af"
            />
          }
        >
          {displayedCourses.length === 0 ? (
            <View className="flex-1 items-center justify-center pt-20">
              <Text className="text-5xl mb-4">{activeTab === 'active' ? '🚛' : '📋'}</Text>
              <Text className="text-gray-700 font-semibold text-lg mb-2">
                {activeTab === 'active' ? 'Aucune course active' : 'Aucune course passée'}
              </Text>
              <Text className="text-gray-400 text-sm text-center px-8">
                {activeTab === 'active'
                  ? 'Réservez votre premier transport depuis l\'accueil'
                  : 'Vos courses passées apparaîtront ici'}
              </Text>
              {activeTab === 'active' && (
                <TouchableOpacity
                  onPress={() => router.push('/(client)')}
                  className="mt-6 bg-primary-700 px-6 py-3 rounded-2xl"
                >
                  <Text className="text-white font-semibold">Réserver maintenant</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              {displayedCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onPress={() => router.push(`/(client)/rides/${course.id}`)}
                />
              ))}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
