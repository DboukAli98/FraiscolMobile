// app/(tabs)/_layout.tsx
import { colors } from '@/constants/theme';
import CustomRoutes from '@/routes/CustomRoutes';
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => (
        <CustomRoutes
          {...props}
          activeTintColor={colors.primary.dark}
          inactiveTintColor={colors.primary.light}
        />
      )}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Acceuil',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      
      {/* <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      /> */}
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