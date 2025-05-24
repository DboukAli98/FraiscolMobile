// app/(tabs)/_layout.tsx
import { colors } from '@/constants/theme';
import { RootState } from '@/redux/store';
import CustomRoutes from '@/routes/CustomRoutes';
import { MaterialIcons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import { Redirect, Tabs } from 'expo-router';
import { useSelector } from 'react-redux';

export default function TabsLayout() {
  const token = useSelector((state: RootState) => state.auth.token);
  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
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
            // <MaterialIcons name="home" size={size} color={color} />
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