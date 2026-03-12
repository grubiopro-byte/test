import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { signUp } from '@/lib/auth';
import type { VehicleType } from '@/lib/types';

const VEHICLES: { type: VehicleType; label: string; icon: string; desc: string }[] = [
  { type: '6m3', label: 'Fourgon 6m³', icon: '🚐', desc: 'Petit utilitaire' },
  { type: '11m3', label: 'Fourgon 11m³', icon: '🚛', desc: 'Utilitaire moyen' },
  { type: '20m3', label: 'Fourgon 20m³', icon: '🚚', desc: 'Grand utilitaire' },
];

const STEPS = ['Infos perso', 'Véhicule', 'Documents', 'Compte'];

export default function RegisterLivrizeur() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    radiusKm: '30',
    vehicleType: '' as VehicleType | '',
    siret: '',
    helperName: '',
    helperPhone: '',
  });

  const [docs, setDocs] = useState({
    vehiclePhoto: null as string | null,
    licensePhoto: null as string | null,
    idCard: null as string | null,
    insurance: null as string | null,
  });

  function update(key: keyof typeof form, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function pickImage(key: keyof typeof docs) {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      setDocs((p) => ({ ...p, [key]: result.assets[0].uri }));
    }
  }

  function canGoNext(): boolean {
    switch (step) {
      case 0:
        return !!(form.firstName && form.lastName && form.email && form.phone && form.address);
      case 1:
        return !!(form.vehicleType && form.radiusKm);
      case 2:
        return !!(docs.vehiclePhoto && docs.licensePhoto && docs.idCard && docs.insurance && form.siret);
      case 3:
        return !!(form.password && form.password.length >= 6);
      default:
        return false;
    }
  }

  async function handleSubmit() {
    // MODE DEMO : bypass auth
    router.replace('/(livrizeur)');
    return;

    setLoading(true);
    try {
      const { user, error } = await signUp(
        form.email,
        form.password,
        form.firstName,
        form.lastName,
        form.phone,
        'livrizeur'
      );

      if (error || !user) {
        Alert.alert('Erreur', error || 'Erreur lors de l\'inscription');
        return;
      }

      // Create livrizeur profile
      await supabase.from('livrizeurs').insert({
        user_id: user.id,
        address: form.address,
        latitude: 0,
        longitude: 0,
        radius_km: parseInt(form.radiusKm),
        vehicle_type: form.vehicleType,
        siret: form.siret,
        status: 'pending',
        average_rating: 5.0,
        total_ratings: 0,
      });

      Alert.alert(
        'Inscription envoyée !',
        'Votre dossier est en cours de vérification. Vous recevrez un email de confirmation sous 24-48h.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/welcome') }]
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      {/* Header */}
      <View className="bg-primary-800 pt-16 pb-6 px-6">
        <TouchableOpacity onPress={() => step > 0 ? setStep(step - 1) : router.back()} className="mb-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Devenir Livrizeur</Text>
        <Text className="text-blue-200 text-sm mt-1">Étape {step + 1} / {STEPS.length}</Text>

        {/* Progress */}
        <View className="flex-row gap-x-2 mt-4">
          {STEPS.map((_, i) => (
            <View
              key={i}
              className={`flex-1 h-1.5 rounded-full ${i <= step ? 'bg-accent-400' : 'bg-blue-700'}`}
            />
          ))}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step 0: Personal info */}
        {step === 0 && (
          <View>
            <Text className="text-gray-900 text-xl font-bold mb-6">Vos informations</Text>
            {[
              { key: 'firstName', label: 'Prénom', placeholder: 'Jean', type: 'default' },
              { key: 'lastName', label: 'Nom', placeholder: 'Dupont', type: 'default' },
              { key: 'email', label: 'Email', placeholder: 'jean@email.fr', type: 'email-address' },
              { key: 'phone', label: 'Téléphone', placeholder: '06 12 34 56 78', type: 'phone-pad' },
              { key: 'address', label: 'Adresse de base', placeholder: '12 rue de la Paix, Paris', type: 'default' },
            ].map(({ key, label, placeholder, type }) => (
              <View key={key} className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">{label}</Text>
                <TextInput
                  className="border-2 border-gray-200 rounded-xl px-4 py-4 text-gray-900 text-base"
                  placeholder={placeholder}
                  placeholderTextColor="#9ca3af"
                  keyboardType={type as any}
                  autoCapitalize={key === 'email' ? 'none' : 'words'}
                  value={form[key as keyof typeof form]}
                  onChangeText={(v) => update(key as any, v)}
                />
              </View>
            ))}

            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Rayon d'action (km)</Text>
              <TextInput
                className="border-2 border-gray-200 rounded-xl px-4 py-4 text-gray-900 text-base"
                placeholder="30"
                placeholderTextColor="#9ca3af"
                keyboardType="number-pad"
                value={form.radiusKm}
                onChangeText={(v) => update('radiusKm', v)}
              />
              <Text className="text-gray-400 text-xs mt-1">Distance max depuis votre adresse de base</Text>
            </View>
          </View>
        )}

        {/* Step 1: Vehicle */}
        {step === 1 && (
          <View>
            <Text className="text-gray-900 text-xl font-bold mb-2">Votre véhicule</Text>
            <Text className="text-gray-500 mb-6">Sélectionnez le type de votre véhicule utilitaire</Text>
            <View className="gap-y-3">
              {VEHICLES.map(({ type, label, icon, desc }) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => update('vehicleType', type)}
                  className={`border-2 rounded-2xl p-4 flex-row items-center gap-x-4 ${
                    form.vehicleType === type
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <Text className="text-4xl">{icon}</Text>
                  <View className="flex-1">
                    <Text className={`font-bold text-base ${form.vehicleType === type ? 'text-primary-800' : 'text-gray-900'}`}>
                      {label}
                    </Text>
                    <Text className="text-gray-500 text-sm">{desc}</Text>
                  </View>
                  {form.vehicleType === type && (
                    <Ionicons name="checkmark-circle" size={24} color="#1e40af" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View className="mt-6">
              <Text className="text-gray-700 font-semibold mb-2">Helper attitré (optionnel)</Text>
              <Text className="text-gray-400 text-xs mb-3">Si vous avez toujours quelqu'un qui vous aide</Text>
              <TextInput
                className="border-2 border-gray-200 rounded-xl px-4 py-4 text-gray-900 text-base mb-3"
                placeholder="Nom du helper"
                placeholderTextColor="#9ca3af"
                value={form.helperName}
                onChangeText={(v) => update('helperName', v)}
              />
              <TextInput
                className="border-2 border-gray-200 rounded-xl px-4 py-4 text-gray-900 text-base"
                placeholder="Téléphone du helper"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                value={form.helperPhone}
                onChangeText={(v) => update('helperPhone', v)}
              />
            </View>
          </View>
        )}

        {/* Step 2: Documents */}
        {step === 2 && (
          <View>
            <Text className="text-gray-900 text-xl font-bold mb-2">Documents requis</Text>
            <Text className="text-gray-500 mb-6">Ces documents seront vérifiés par notre équipe</Text>

            {[
              { key: 'vehiclePhoto', label: 'Photo du véhicule', icon: '🚛', required: true },
              { key: 'licensePhoto', label: 'Permis de conduire (recto/verso)', icon: '🪪', required: true },
              { key: 'idCard', label: "Carte d'identité (recto/verso)", icon: '🆔', required: true },
              { key: 'insurance', label: 'Attestation d\'assurance', icon: '📄', required: true },
            ].map(({ key, label, icon, required }) => (
              <TouchableOpacity
                key={key}
                onPress={() => pickImage(key as keyof typeof docs)}
                className={`border-2 rounded-2xl p-4 mb-3 flex-row items-center gap-x-4 ${
                  docs[key as keyof typeof docs]
                    ? 'border-success bg-green-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <Text className="text-3xl">{icon}</Text>
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold">{label}</Text>
                  <Text className="text-gray-400 text-xs mt-0.5">
                    {docs[key as keyof typeof docs] ? '✓ Photo ajoutée' : 'Appuyer pour sélectionner'}
                  </Text>
                </View>
                <Ionicons
                  name={docs[key as keyof typeof docs] ? 'checkmark-circle' : 'cloud-upload-outline'}
                  size={24}
                  color={docs[key as keyof typeof docs] ? '#22c55e' : '#9ca3af'}
                />
              </TouchableOpacity>
            ))}

            <View className="mt-2">
              <Text className="text-gray-700 font-semibold mb-2">Numéro SIRET *</Text>
              <TextInput
                className="border-2 border-gray-200 rounded-xl px-4 py-4 text-gray-900 text-base"
                placeholder="12345678901234"
                placeholderTextColor="#9ca3af"
                keyboardType="number-pad"
                maxLength={14}
                value={form.siret}
                onChangeText={(v) => update('siret', v)}
              />
            </View>
          </View>
        )}

        {/* Step 3: Account */}
        {step === 3 && (
          <View>
            <Text className="text-gray-900 text-xl font-bold mb-2">Sécuriser votre compte</Text>
            <Text className="text-gray-500 mb-6">Choisissez un mot de passe sécurisé</Text>
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Mot de passe</Text>
              <TextInput
                className="border-2 border-gray-200 rounded-xl px-4 py-4 text-gray-900 text-base"
                placeholder="Min. 6 caractères"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                value={form.password}
                onChangeText={(v) => update('password', v)}
              />
            </View>

            <View className="bg-blue-50 rounded-2xl p-4 mt-4">
              <Text className="text-primary-800 font-semibold mb-2">📋 Récapitulatif</Text>
              <Text className="text-gray-600 text-sm">Nom : {form.firstName} {form.lastName}</Text>
              <Text className="text-gray-600 text-sm">Email : {form.email}</Text>
              <Text className="text-gray-600 text-sm">Véhicule : {form.vehicleType}</Text>
              <Text className="text-gray-600 text-sm">Rayon : {form.radiusKm} km</Text>
              <Text className="text-primary-700 text-sm mt-3 font-medium">
                ⏳ Validation sous 24-48h après vérification de vos documents.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View className="px-6 pb-8 pt-4 border-t border-gray-100">
        <TouchableOpacity
          onPress={step < STEPS.length - 1 ? () => setStep(step + 1) : handleSubmit}
          disabled={!canGoNext() || loading}
          className={`py-4 rounded-2xl items-center ${canGoNext() && !loading ? 'bg-primary-700' : 'bg-gray-200'}`}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className={`font-bold text-lg ${canGoNext() ? 'text-white' : 'text-gray-400'}`}>
              {step < STEPS.length - 1 ? 'Continuer' : 'Envoyer mon dossier'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
