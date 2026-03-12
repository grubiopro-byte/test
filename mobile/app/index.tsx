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
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.replace('/(auth)/welcome');
      return;
    }

    // Get user role
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (user?.role === 'livrizeur') {
      router.replace('/(livrizeur)');
    } else {
      router.replace('/(client)');
    }
  }

  return (
    <View className="flex-1 items-center justify-center bg-primary-800">
      <ActivityIndicator size="large" color="white" />
    </View>
  );
}
