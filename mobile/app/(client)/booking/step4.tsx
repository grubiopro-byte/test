import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useBookingStore } from '@/lib/bookingStore';
import { BookingHeader } from '@/components/ui/BookingHeader';

export default function Step4() {
  const router = useRouter();
  const store = useBookingStore();
  const [description, setDescription] = useState(store.itemsDescription);
  const [photos, setPhotos] = useState<string[]>(store.itemsPhotos);
  const [contact, setContact] = useState(store.additionalContact);

  async function addPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setPhotos((prev) => [...prev, ...uris].slice(0, 6));
    }
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  function handleContinue() {
    store.setStep4({
      itemsDescription: description,
      itemsPhotos: photos,
      additionalContact: contact,
    });
    router.push('/(client)/booking/step5');
  }

  const EXAMPLES = [
    'Canapé 3 places + table basse',
    'Machine à laver + sèche-linge',
    'Mobilier de chambre complète',
    '10 cartons + armoire 2 portes',
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <BookingHeader
        step={4}
        title="Objets à transporter"
        subtitle="Décrivez ce que vous souhaitez déménager"
      />

      <ScrollView className="flex-1 px-5 pt-5" keyboardShouldPersistTaps="handled">
        {/* Description */}
        <Text className="text-gray-700 font-bold text-base mb-2">Description des objets *</Text>
        <TextInput
          className="border-2 border-gray-200 rounded-2xl px-4 py-4 text-gray-900 text-base min-h-[120px]"
          placeholder="Ex: Canapé 3 places, table basse en verre, 5 cartons de livres..."
          placeholderTextColor="#9ca3af"
          multiline
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
          style={{ borderColor: description ? '#3b82f6' : '#e5e7eb' }}
        />

        {/* Quick examples */}
        <Text className="text-gray-400 text-xs mt-2 mb-3">Exemples rapides :</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          <View className="flex-row gap-x-2">
            {EXAMPLES.map((ex) => (
              <TouchableOpacity
                key={ex}
                onPress={() => setDescription(ex)}
                className="bg-gray-100 rounded-full px-3 py-1.5"
              >
                <Text className="text-gray-600 text-xs">{ex}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Photos */}
        <Text className="text-gray-700 font-bold text-base mb-2">Photos (optionnel)</Text>
        <Text className="text-gray-400 text-sm mb-3">
          Ajoutez des photos pour aider le livrizeur à préparer l'intervention (max 6)
        </Text>

        <View className="flex-row flex-wrap gap-3 mb-4">
          {photos.map((uri, i) => (
            <View key={i} className="relative">
              <Image source={{ uri }} className="w-24 h-24 rounded-xl" />
              <TouchableOpacity
                onPress={() => removePhoto(i)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
              >
                <Ionicons name="close" size={14} color="white" />
              </TouchableOpacity>
            </View>
          ))}

          {photos.length < 6 && (
            <TouchableOpacity
              onPress={addPhoto}
              className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl items-center justify-center"
              activeOpacity={0.7}
            >
              <Ionicons name="camera-outline" size={24} color="#9ca3af" />
              <Text className="text-gray-400 text-xs mt-1">Ajouter</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Additional contact */}
        <Text className="text-gray-700 font-bold text-base mb-2">Contact additionnel (optionnel)</Text>
        <Text className="text-gray-400 text-sm mb-3">
          Une personne à prévenir ou présente sur place ?
        </Text>
        <View className="flex-row items-center border-2 border-gray-200 rounded-xl px-4 mb-8">
          <Ionicons name="call-outline" size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-3 py-4 text-gray-900 text-base"
            placeholder="06 12 34 56 78"
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
            value={contact}
            onChangeText={setContact}
          />
        </View>
      </ScrollView>

      <View className="px-5 pb-8 pt-4">
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!description}
          className={`py-4 rounded-2xl items-center ${description ? 'bg-primary-700' : 'bg-gray-200'}`}
          activeOpacity={0.8}
        >
          <Text className={`font-bold text-lg ${description ? 'text-white' : 'text-gray-400'}`}>
            Continuer
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleContinue} className="items-center mt-3">
          <Text className="text-gray-400 text-sm">Passer cette étape</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
