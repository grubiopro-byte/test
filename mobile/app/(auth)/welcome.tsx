import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const { height } = Dimensions.get('window');

export default function Welcome() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-primary-800">
      <StatusBar style="light" />

      {/* Background gradient */}
      <LinearGradient
        colors={['#1e3a8a', '#1e40af', '#2563eb']}
        className="absolute inset-0"
      />

      {/* Content */}
      <View className="flex-1 px-6 pt-20 pb-12">
        {/* Logo + Tag */}
        <View className="items-center mb-12">
          <View className="w-20 h-20 bg-white rounded-2xl items-center justify-center mb-4 shadow-xl">
            <Text className="text-4xl">🚚</Text>
          </View>
          <Text className="text-white text-4xl font-bold tracking-tight">Livrizi</Text>
          <Text className="text-blue-200 text-base mt-2">Transport & déménagement à la demande</Text>
        </View>

        {/* Features */}
        <View className="flex-1 justify-center gap-y-5">
          {[
            { icon: '📍', title: 'Simple & rapide', desc: 'Réservez en moins de 2 minutes' },
            { icon: '🚛', title: 'Livrizeurs vérifiés', desc: 'Des pros avec leur propre véhicule' },
            { icon: '💳', title: 'Paiement sécurisé', desc: 'Payez seulement à la fin de la course' },
            { icon: '⭐', title: 'Noté & fiable', desc: 'Système d\'avis après chaque course' },
          ].map((feature, i) => (
            <View key={i} className="flex-row items-center gap-x-4">
              <View className="w-12 h-12 bg-white/10 rounded-xl items-center justify-center">
                <Text className="text-2xl">{feature.icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-base">{feature.title}</Text>
                <Text className="text-blue-200 text-sm">{feature.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA Buttons */}
        <View className="gap-y-3">
          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            className="bg-accent-400 py-4 rounded-2xl items-center shadow-lg"
            activeOpacity={0.8}
          >
            <Text className="text-gray-900 font-bold text-lg">Commencer maintenant</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            className="border-2 border-white/30 py-4 rounded-2xl items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold text-base">J'ai déjà un compte</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/register-livrizeur')}
            className="py-3 items-center"
            activeOpacity={0.8}
          >
            <Text className="text-blue-200 text-sm">
              Devenir Livrizeur →
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
