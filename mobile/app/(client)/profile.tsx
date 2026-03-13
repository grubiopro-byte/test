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
import type { User } from '@/lib/types';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '' });

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    // MODE DEMO
    const { DEMO_USER } = await import('@/lib/demo-data');
    setUser(DEMO_USER as any);
    setForm({ first_name: DEMO_USER.first_name, last_name: DEMO_USER.last_name, phone: DEMO_USER.phone });
  }

  async function handleSave() {
    setUser((prev) => prev ? { ...prev, ...form } : prev);
    setEditing(false);
    Alert.alert('Succès', 'Profil mis à jour (mode démo)');
  }

  async function handleLogout() {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: () => router.replace('/(auth)/welcome') },
    ]);
  }

  const menuItems = [
    { icon: 'list-outline', label: 'Mes courses', onPress: () => router.push('/(client)/rides') },
    { icon: 'document-text-outline', label: 'Mes factures', onPress: () => Alert.alert('Bientôt disponible') },
    { icon: 'help-circle-outline', label: 'Support & aide', onPress: () => Alert.alert('support@livrizi.fr') },
    { icon: 'shield-outline', label: 'Politique de confidentialité', onPress: () => {} },
    { icon: 'document-outline', label: "Conditions d'utilisation", onPress: () => {} },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-primary-800 px-6 pt-12 pb-8 items-center">
          <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center mb-3">
            <Text className="text-4xl">👤</Text>
          </View>
          {!editing ? (
            <>
              <Text className="text-white text-2xl font-bold">
                {user?.first_name} {user?.last_name}
              </Text>
              <Text className="text-blue-200 mt-1">{user?.email}</Text>
              <TouchableOpacity
                onPress={() => setEditing(true)}
                className="mt-4 flex-row items-center gap-x-1 bg-white/20 px-4 py-2 rounded-full"
              >
                <Ionicons name="pencil" size={14} color="white" />
                <Text className="text-white text-sm font-semibold">Modifier</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View className="w-full mt-2">
              {[
                { key: 'first_name', placeholder: 'Prénom' },
                { key: 'last_name', placeholder: 'Nom' },
                { key: 'phone', placeholder: 'Téléphone' },
              ].map(({ key, placeholder }) => (
                <TextInput
                  key={key}
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white mb-2"
                  placeholder={placeholder}
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={form[key as keyof typeof form]}
                  onChangeText={(v) => setForm((p) => ({ ...p, [key]: v }))}
                />
              ))}
              <View className="flex-row gap-x-3 mt-2">
                <TouchableOpacity
                  onPress={() => setEditing(false)}
                  className="flex-1 border border-white/30 py-3 rounded-xl items-center"
                >
                  <Text className="text-white font-semibold">Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  className="flex-1 bg-accent-400 py-3 rounded-xl items-center"
                >
                  <Text className="text-gray-900 font-bold">Sauvegarder</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Menu */}
        <View className="px-4 pt-6">
          <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            {menuItems.map(({ icon, label, onPress }, i) => (
              <TouchableOpacity
                key={label}
                onPress={onPress}
                className={`flex-row items-center px-5 py-4 gap-x-4 ${i < menuItems.length - 1 ? 'border-b border-gray-50' : ''}`}
                activeOpacity={0.7}
              >
                <View className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center">
                  <Ionicons name={icon as any} size={20} color="#374151" />
                </View>
                <Text className="flex-1 text-gray-800 font-medium">{label}</Text>
                <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Become a livrizeur */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/register-livrizeur')}
            className="bg-primary-50 border border-primary-100 rounded-2xl p-5 mt-4 flex-row items-center gap-x-4"
          >
            <Text className="text-3xl">🚛</Text>
            <View className="flex-1">
              <Text className="text-primary-800 font-bold">Devenir Livrizeur</Text>
              <Text className="text-primary-600 text-sm">Gagnez de l'argent avec votre véhicule</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#1e40af" />
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity
            onPress={handleLogout}
            className="mt-4 mb-8 border-2 border-red-100 bg-red-50 rounded-2xl py-4 items-center flex-row justify-center gap-x-2"
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text className="text-red-500 font-semibold text-base">Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
