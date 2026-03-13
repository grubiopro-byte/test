import { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { formatPrice } from '@/lib/pricing';
import type { Course } from '@/lib/types';
import { DEMO_COURSES } from '@/lib/demo-data';

interface EarningPeriod {
  label: string;
  total: number;
  courses: number;
  tips: number;
}

function computePeriods(courses: Course[]): {
  today: EarningPeriod;
  week: EarningPeriod;
  month: EarningPeriod;
  total: EarningPeriod;
} {
  const done = courses.filter((c) => c.status === 'terminee');
  const now = new Date();

  function sumFor(filter: (c: Course) => boolean): EarningPeriod {
    const filtered = done.filter(filter);
    return {
      label: '',
      total: filtered.reduce((s, c) => s + (c.livrizeur_amount || 0), 0),
      courses: filtered.length,
      tips: filtered.reduce((s, c) => s + (c.tip_amount || 0), 0),
    };
  }

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    today: sumFor((c) => new Date(c.completed_at || c.created_at) >= todayStart),
    week: sumFor((c) => new Date(c.completed_at || c.created_at) >= weekStart),
    month: sumFor((c) => new Date(c.completed_at || c.created_at) >= monthStart),
    total: sumFor(() => true),
  };
}

export default function Earnings() {
  const [courses] = useState<Course[]>(DEMO_COURSES as Course[]);
  const [refreshing, setRefreshing] = useState(false);

  const periods = computePeriods(courses);
  const doneCourses = courses.filter((c) => c.status === 'terminee');

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-100">
        <Text className="text-gray-900 text-2xl font-bold">Mes gains</Text>
      </View>

      <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); }} tintColor="#1e40af" />
          }
        >
          {/* Main stat */}
          <LinearGradient colors={['#1e3a8a', '#2563eb']} className="px-6 pt-8 pb-10">
            <Text className="text-blue-200 text-sm">Gains ce mois-ci</Text>
            <Text className="text-white text-5xl font-bold mt-1">
              {formatPrice(periods.month.total)}
            </Text>
            <Text className="text-blue-200 text-sm mt-2">
              {periods.month.courses} course{periods.month.courses > 1 ? 's' : ''} terminée{periods.month.courses > 1 ? 's' : ''}
              {periods.month.tips > 0 ? ` · ${formatPrice(periods.month.tips)} en pourboires` : ''}
            </Text>
          </LinearGradient>

          <View className="px-4 -mt-6">
            {/* Period cards */}
            <View className="flex-row gap-x-3 mb-4">
              {[
                { label: "Aujourd'hui", data: periods.today },
                { label: 'Cette semaine', data: periods.week },
              ].map(({ label, data }) => (
                <View key={label} className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <Text className="text-gray-500 text-xs mb-1">{label}</Text>
                  <Text className="text-gray-900 text-xl font-bold">{formatPrice(data.total)}</Text>
                  <Text className="text-gray-400 text-xs mt-1">{data.courses} course{data.courses > 1 ? 's' : ''}</Text>
                </View>
              ))}
            </View>

            {/* Total */}
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100 flex-row justify-between items-center">
              <View>
                <Text className="text-gray-500 text-sm">Total tous temps</Text>
                <Text className="text-gray-900 text-2xl font-bold mt-0.5">{formatPrice(periods.total.total)}</Text>
              </View>
              <View className="items-end">
                <Text className="text-gray-500 text-sm">{periods.total.courses} courses</Text>
                {periods.total.tips > 0 && (
                  <Text className="text-green-600 text-sm font-semibold">
                    +{formatPrice(periods.total.tips)} pourboires
                  </Text>
                )}
              </View>
            </View>

            {/* Payout info */}
            <View className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
              <Text className="text-amber-700 font-semibold mb-1">💸 Virements</Text>
              <Text className="text-amber-600 text-sm">
                Les virements sont effectués automatiquement J+1 après chaque course via Stripe Connect.
              </Text>
            </View>

            {/* Recent courses */}
            <Text className="text-gray-900 font-bold text-base mb-3">Courses récentes</Text>
            {doneCourses.slice(0, 10).map((course) => (
              <View key={course.id} className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 flex-row items-center gap-x-3">
                <View className="w-10 h-10 bg-green-100 rounded-xl items-center justify-center">
                  <Text className="text-lg">✅</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold text-sm" numberOfLines={1}>
                    {course.pickup_address.split(',')[0]}
                  </Text>
                  <Text className="text-gray-400 text-xs">{course.scheduled_date}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-primary-700 font-bold">{formatPrice(course.livrizeur_amount)}</Text>
                  {course.tip_amount > 0 && (
                    <Text className="text-green-500 text-xs">+{formatPrice(course.tip_amount)} pourboire</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
    </SafeAreaView>
  );
}
