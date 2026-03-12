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
import { signUp } from '@/lib/auth';

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function updateForm(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleRegister() {
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }
    if (form.password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit faire au moins 6 caractères');
      return;
    }

    setLoading(true);
    const { user, error } = await signUp(
      form.email,
      form.password,
      form.firstName,
      form.lastName,
      form.phone,
      'client'
    );
    setLoading(false);

    if (error) {
      Alert.alert('Erreur', error);
      return;
    }

    router.replace('/(client)');
  }

  const fields = [
    { key: 'firstName', label: 'Prénom', placeholder: 'Jean', icon: 'person-outline', type: 'default' },
    { key: 'lastName', label: 'Nom', placeholder: 'Dupont', icon: 'person-outline', type: 'default' },
    { key: 'email', label: 'Email', placeholder: 'jean@email.fr', icon: 'mail-outline', type: 'email-address' },
    { key: 'phone', label: 'Téléphone', placeholder: '06 12 34 56 78', icon: 'call-outline', type: 'phone-pad' },
  ] as const;

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
          <Text className="text-white text-3xl font-bold">Créer un compte</Text>
          <Text className="text-blue-200 mt-1">Rejoignez Livrizi en quelques secondes</Text>
        </View>

        {/* Form */}
        <View className="flex-1 px-6 pt-6 pb-8">
          {fields.map(({ key, label, placeholder, icon, type }) => (
            <View key={key} className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">{label}</Text>
              <View className="flex-row items-center border-2 border-gray-200 rounded-xl px-4">
                <Ionicons name={icon as any} size={20} color="#6b7280" />
                <TextInput
                  className="flex-1 ml-3 py-4 text-gray-900 text-base"
                  placeholder={placeholder}
                  placeholderTextColor="#9ca3af"
                  keyboardType={type as any}
                  autoCapitalize={key === 'email' ? 'none' : 'words'}
                  autoCorrect={false}
                  value={form[key]}
                  onChangeText={(v) => updateForm(key, v)}
                />
              </View>
            </View>
          ))}

          {/* Password */}
          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-2">Mot de passe</Text>
            <View className="flex-row items-center border-2 border-gray-200 rounded-xl px-4">
              <Ionicons name="lock-closed-outline" size={20} color="#6b7280" />
              <TextInput
                className="flex-1 ml-3 py-4 text-gray-900 text-base"
                placeholder="Min. 6 caractères"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPassword}
                value={form.password}
                onChangeText={(v) => updateForm('password', v)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 font-semibold mb-2">Confirmer le mot de passe</Text>
            <View className="flex-row items-center border-2 border-gray-200 rounded-xl px-4">
              <Ionicons name="lock-closed-outline" size={20} color="#6b7280" />
              <TextInput
                className="flex-1 ml-3 py-4 text-gray-900 text-base"
                placeholder="Répéter le mot de passe"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPassword}
                value={form.confirmPassword}
                onChangeText={(v) => updateForm('confirmPassword', v)}
              />
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            className="bg-primary-700 py-4 rounded-2xl items-center shadow-md mb-4"
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Créer mon compte</Text>
            )}
          </TouchableOpacity>

          <Text className="text-gray-400 text-xs text-center mb-4">
            En créant un compte, vous acceptez nos{' '}
            <Text className="text-primary-600">Conditions d'utilisation</Text>
          </Text>

          <TouchableOpacity onPress={() => router.push('/(auth)/login')} className="items-center">
            <Text className="text-gray-500">
              Déjà un compte ?{' '}
              <Text className="text-primary-700 font-semibold">Se connecter</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
