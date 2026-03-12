import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import { VEHICLE_LABELS } from '@/lib/types';
import type { User, Livrizeur } from '@/lib/types';

export default function LivrizeurProfile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [livrizeur, setLivrizeur] = useState<Livrizeur | null>(null);
  const [editRadius, setEditRadius] = useState(false);
  const [newRadius, setNewRadius] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const [{ data: u }, { data: l }] = await Promise.all([
      supabase.from('users').select('*').eq('id', session.user.id).single(),
      supabase.from('livrizeurs').select('*').eq('user_id', session.user.id).single(),
    ]);

    setUser(u as User);
    setLivrizeur(l as Livrizeur);
    setNewRadius(String(l?.radius_km || 30));
  }

  async function saveRadius() {
    if (!livrizeur) return;
    await supabase.from('livrizeurs').update({ radius_km: parseInt(newRadius) }).eq('id', livrizeur.id);
    setLivrizeur((p) => p ? { ...p, radius_km: parseInt(newRadius) } : p);
    setEditRadius(false);
    Alert.alert('✅ Rayon mis à jour');
  }

  const statusConfig = {
    pending: { color: '#f59e0b', label: 'En attente de validation', icon: '⏳' },
    active: { color: '#22c55e', label: 'Compte actif', icon: '✅' },
    suspended: { color: '#ef4444', label: 'Compte suspendu', icon: '⛔' },
  };

  const status = livrizeur?.status ? statusConfig[livrizeur.status] : statusConfig.pending;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-primary-800 px-6 pt-12 pb-8 items-center">
          <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center mb-3">
            <Text className="text-4xl">🚛</Text>
          </View>
          <Text className="text-white text-2xl font-bold">
            {user?.first_name} {user?.last_name}
          </Text>
          <Text className="text-blue-200 mt-1">{user?.email}</Text>

          {/* Status badge */}
          <View
            className="mt-4 flex-row items-center gap-x-2 rounded-full px-4 py-2"
            style={{ backgroundColor: `${status.color}25` }}
          >
            <Text>{status.icon}</Text>
            <Text style={{ color: status.color }} className="font-semibold text-sm">
              {status.label}
            </Text>
          </View>
        </View>

        <View className="px-4 pt-6">
          {/* Rating */}
          {livrizeur && (
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
              <Text className="text-gray-900 font-bold mb-4">Mes statistiques</Text>
              <View className="flex-row gap-x-4">
                <View className="flex-1 items-center bg-amber-50 rounded-xl p-4">
                  <Text className="text-amber-400 text-3xl font-bold">{livrizeur.average_rating?.toFixed(1)}</Text>
                  <Text className="text-amber-500 text-lg">⭐</Text>
                  <Text className="text-gray-500 text-xs mt-1">Note moyenne</Text>
                </View>
                <View className="flex-1 items-center bg-blue-50 rounded-xl p-4">
                  <Text className="text-primary-700 text-3xl font-bold">{livrizeur.total_ratings}</Text>
                  <Text className="text-primary-500 text-lg">💬</Text>
                  <Text className="text-gray-500 text-xs mt-1">Avis reçus</Text>
                </View>
              </View>
            </View>
          )}

          {/* Vehicle & radius */}
          {livrizeur && (
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
              <Text className="text-gray-900 font-bold mb-4">Mon véhicule</Text>

              <View className="flex-row items-center gap-x-3 mb-4">
                <Text className="text-3xl">🚛</Text>
                <View>
                  <Text className="text-gray-900 font-semibold">{VEHICLE_LABELS[livrizeur.vehicle_type]}</Text>
                  <Text className="text-gray-400 text-xs">Type de véhicule</Text>
                </View>
              </View>

              <View className="border-t border-gray-100 pt-4">
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-gray-500 text-xs">Rayon d'action</Text>
                    <Text className="text-gray-900 font-bold text-lg">{livrizeur.radius_km} km</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setEditRadius(!editRadius)}
                    className="bg-primary-50 px-4 py-2 rounded-xl"
                  >
                    <Text className="text-primary-700 font-semibold text-sm">Modifier</Text>
                  </TouchableOpacity>
                </View>

                {editRadius && (
                  <View className="mt-3 flex-row gap-x-3">
                    <TextInput
                      className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                      value={newRadius}
                      onChangeText={setNewRadius}
                      keyboardType="number-pad"
                      placeholder="km"
                    />
                    <TouchableOpacity
                      onPress={saveRadius}
                      className="bg-primary-700 px-5 rounded-xl items-center justify-center"
                    >
                      <Text className="text-white font-bold">OK</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* SIRET */}
          {livrizeur?.siret && (
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
              <Text className="text-gray-900 font-bold mb-2">Informations légales</Text>
              <Text className="text-gray-500 text-xs">SIRET</Text>
              <Text className="text-gray-900 font-mono text-sm">{livrizeur.siret}</Text>
            </View>
          )}

          {/* Support */}
          <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-4">
            {[
              { icon: 'help-circle-outline', label: 'Support Livrizi', onPress: () => Alert.alert('support@livrizi.fr') },
              { icon: 'document-text-outline', label: "Conditions livrizeur", onPress: () => {} },
            ].map(({ icon, label, onPress }, i) => (
              <TouchableOpacity
                key={label}
                onPress={onPress}
                className={`flex-row items-center px-5 py-4 gap-x-4 ${i === 0 ? 'border-b border-gray-50' : ''}`}
              >
                <Ionicons name={icon as any} size={20} color="#374151" />
                <Text className="flex-1 text-gray-800 font-medium">{label}</Text>
                <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout */}
          <TouchableOpacity
            onPress={async () => {
              await signOut();
              router.replace('/(auth)/welcome');
            }}
            className="border-2 border-red-100 bg-red-50 rounded-2xl py-4 items-center flex-row justify-center gap-x-2 mb-8"
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text className="text-red-500 font-semibold text-base">Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
