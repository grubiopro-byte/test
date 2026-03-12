import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { signIn } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    const { user, error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Erreur de connexion', error);
      return;
    }

    if (user?.role === 'livrizeur') {
      router.replace('/(livrizeur)');
    } else {
      router.replace('/(client)');
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="bg-primary-800 pt-16 pb-8 px-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center mb-4"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-3xl font-bold">Connexion</Text>
          <Text className="text-blue-200 mt-1">Bon retour sur Livrizi !</Text>
        </View>

        {/* Form */}
        <View className="flex-1 px-6 pt-8">
          {/* Email */}
          <View className="mb-5">
            <Text className="text-gray-700 font-semibold mb-2">Email</Text>
            <View className="flex-row items-center border-2 border-gray-200 rounded-xl px-4 focus-within:border-primary-500">
              <Ionicons name="mail-outline" size={20} color="#6b7280" />
              <TextInput
                className="flex-1 ml-3 py-4 text-gray-900 text-base"
                placeholder="votre@email.fr"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          {/* Password */}
          <View className="mb-6">
            <Text className="text-gray-700 font-semibold mb-2">Mot de passe</Text>
            <View className="flex-row items-center border-2 border-gray-200 rounded-xl px-4 focus-within:border-primary-500">
              <Ionicons name="lock-closed-outline" size={20} color="#6b7280" />
              <TextInput
                className="flex-1 ml-3 py-4 text-gray-900 text-base"
                placeholder="Votre mot de passe"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className="bg-primary-700 py-4 rounded-2xl items-center shadow-md mb-6"
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Se connecter</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-4 text-gray-400 text-sm">ou</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Register Link */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            className="items-center"
          >
            <Text className="text-gray-500 text-base">
              Pas encore de compte ?{' '}
              <Text className="text-primary-700 font-semibold">S'inscrire</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
