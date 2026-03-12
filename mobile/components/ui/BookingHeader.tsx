import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Props {
  step: number;
  totalSteps?: number;
  title: string;
  subtitle?: string;
}

const STEP_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#1e40af'];

export function BookingHeader({ step, totalSteps = 6, title, subtitle }: Props) {
  const router = useRouter();

  return (
    <View className="bg-white border-b border-gray-100 pb-4">
      {/* Progress bar */}
      <View className="flex-row h-1.5 mb-0">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            className="flex-1"
            style={{
              backgroundColor: i < step ? STEP_COLORS[step - 1] : '#e5e7eb',
              marginRight: i < totalSteps - 1 ? 2 : 0,
            }}
          />
        ))}
      </View>

      <View className="flex-row items-center px-5 pt-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center mr-3"
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
            Étape {step} / {totalSteps}
          </Text>
          <Text className="text-gray-900 text-xl font-bold">{title}</Text>
          {subtitle && <Text className="text-gray-500 text-sm mt-0.5">{subtitle}</Text>}
        </View>
      </View>
    </View>
  );
}
