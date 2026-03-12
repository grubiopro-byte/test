import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

export default function ClientLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6',
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarActiveTintColor: '#1e40af',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Réserver',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="rides/index"
        options={{
          title: 'Mes courses',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      {/* Hidden from tabs */}
      <Tabs.Screen name="booking/step1" options={{ href: null }} />
      <Tabs.Screen name="booking/step2" options={{ href: null }} />
      <Tabs.Screen name="booking/step3" options={{ href: null }} />
      <Tabs.Screen name="booking/step4" options={{ href: null }} />
      <Tabs.Screen name="booking/step5" options={{ href: null }} />
      <Tabs.Screen name="booking/step6" options={{ href: null }} />
      <Tabs.Screen name="booking/confirmation" options={{ href: null }} />
      <Tabs.Screen name="rides/[id]" options={{ href: null }} />
    </Tabs>
  );
}
