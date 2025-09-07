// app/(tabs)/_layout.tsx
import { colors } from '@/constants/theme';
import useUserInfo from '@/hooks/useUserInfo';
import { RootState } from '@/redux/store';
import CustomRoutes from '@/routes/CustomRoutes';
import { MaterialIcons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import { Redirect, Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

export default function TabsLayout() {
  const token = useSelector((state: RootState) => state.auth.token);
  const userInfo = useUserInfo();
  const insets = useSafeAreaInsets();

  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  // If the logged in user is an Agent, redirect them to Agent tabs
  if (userInfo?.role === 'Agent') {
    return <Redirect href="/(agent)/dashboard" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          // Add bottom padding for Android navigation bar
          paddingBottom: Platform.OS === 'android' ? insets.bottom + 8 : insets.bottom,
          // Ensure minimum height
          height: Platform.OS === 'android' ? 60 + insets.bottom : 60,
          // Add background color to prevent transparency issues
          backgroundColor: colors.background.default,
          // Add border top for visual separation
          borderTopWidth: 1,
          borderTopColor: colors.border?.light || '#e1e5e9',
        },
      }}
      tabBar={(props) => (
        <CustomRoutes
          {...props}
          activeTintColor={colors.primary.dark}
          inactiveTintColor={colors.primary.lighter}
        />
      )}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Acceuil',
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="payments"
        options={{
          title: 'Paiements',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="payments" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Paramètres',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}