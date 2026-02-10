import { Redirect } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Redirect href="/(tabs)/home" />;
}

