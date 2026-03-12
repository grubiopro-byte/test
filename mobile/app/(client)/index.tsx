import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import type { Course } from '@/lib/types';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/types';

const STEPS_INFO = [
  { step: 1, title: 'Adresses', icon: '📍', desc: 'Départ & arrivée' },
  { step: 2, title: 'Véhicule', icon: '🚛', desc: 'Type & livrizeurs' },
  { step: 3, title: 'Créneau', icon: '📅', desc: 'Date & horaire' },
  { step: 4, title: 'Objets', icon: '📦', desc: 'Ce que vous déménagez' },
  { step: 5, title: 'Accès', icon: '🏠', desc: 'Étages & manutention' },
  { step: 6, title: 'Paiement', icon: '💳', desc: 'Vos infos & CB' },
];

export default function ClientHome() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: user } = await supabase
      .from('users')
      .select('first_name')
      .eq('id', session.user.id)
      .single();

    if (user) setUserName(user.first_name || '');

    // Check for active course
    const { data: courses } = await supabase
      .from('courses')
      .select('*')
      .eq('client_id', session.user.id)
      .in('status', ['en_attente', 'acceptee', 'en_route', 'sur_place', 'en_livraison'])
      .order('created_at', { ascending: false })
      .limit(1);

    if (courses && courses.length > 0) {
      setActiveCourse(courses[0] as Course);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={['#1e3a8a', '#2563eb']} className="px-6 pt-12 pb-10">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-blue-200 text-sm">Bonjour 👋</Text>
              <Text className="text-white text-2xl font-bold">{userName || 'Bienvenue'}</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(client)/profile')}
              className="w-12 h-12 bg-white/20 rounded-full items-center justify-center"
            >
              <Ionicons name="person" size={22} color="white" />
            </TouchableOpacity>
          </View>

          <Text className="text-white text-lg font-semibold mb-1">
            Besoin d'un coup de main ?
          </Text>
          <Text className="text-blue-200 text-sm mb-6">
            Réservez un livrizeur avec son camion en 2 minutes
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/(client)/booking/step1')}
            className="bg-accent-400 py-4 rounded-2xl items-center shadow-lg"
            activeOpacity={0.8}
          >
            <Text className="text-gray-900 font-bold text-lg">🚛 Réserver maintenant</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Active course banner */}
        {activeCourse && (
          <TouchableOpacity
            onPress={() => router.push(`/(client)/rides/${activeCourse.id}`)}
            className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            <View className="flex-row items-center gap-x-3">
              <View
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[activeCourse.status] }}
              />
              <Text className="text-gray-900 font-semibold flex-1">
                Course en cours — {STATUS_LABELS[activeCourse.status]}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#6b7280" />
            </View>
            <Text className="text-gray-500 text-sm mt-2 ml-6" numberOfLines={1}>
              {activeCourse.pickup_address} → {activeCourse.dropoff_address}
            </Text>
          </TouchableOpacity>
        )}

        {/* How it works */}
        <View className="px-6 pt-8 pb-4">
          <Text className="text-gray-900 text-xl font-bold mb-4">Comment ça marche ?</Text>
          <View className="gap-y-3">
            {STEPS_INFO.map(({ step, title, icon, desc }) => (
              <View key={step} className="flex-row items-center gap-x-4 bg-white rounded-2xl p-4 shadow-sm">
                <View className="w-12 h-12 bg-primary-50 rounded-xl items-center justify-center">
                  <Text className="text-2xl">{icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold">
                    Étape {step} — {title}
                  </Text>
                  <Text className="text-gray-500 text-sm">{desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Pricing info */}
        <View className="mx-4 mb-8 bg-primary-50 rounded-2xl p-5 border border-primary-100">
          <Text className="text-primary-800 font-bold text-base mb-3">💰 Tarification transparente</Text>
          <View className="gap-y-2">
            {[
              { label: 'Fourgon 6m³', price: '0,98 €/min' },
              { label: 'Fourgon 11m³', price: '1,15 €/min' },
              { label: 'Fourgon 20m³', price: '1,38 €/min' },
            ].map(({ label, price }) => (
              <View key={label} className="flex-row justify-between">
                <Text className="text-gray-600 text-sm">{label}</Text>
                <Text className="text-primary-700 font-semibold text-sm">{price}</Text>
              </View>
            ))}
          </View>
          <Text className="text-gray-400 text-xs mt-3">
            * Prix TTC · 30 min de manutention incluses · Paiement en fin de course
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
