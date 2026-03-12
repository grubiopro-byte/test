import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    // MODE DEMO : toujours aller vers welcome
    router.replace('/(auth)/welcome');
  }

  return (
    <View className="flex-1 items-center justify-center bg-primary-800">
      <ActivityIndicator size="large" color="white" />
    </View>
  );
}
