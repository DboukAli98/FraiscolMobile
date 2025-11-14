import { colors } from '@/constants/theme';
import useUserInfo from '@/hooks/useUserInfo';
import CustomRoutes from '@/routes/CustomRoutes';
import { MaterialIcons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import { Redirect, Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AgentTabsLayout() {
    const userInfo = useUserInfo();
    const insets = useSafeAreaInsets();

    if (!userInfo) {
        return <Redirect href="/(auth)/login" />;
    }

    if (userInfo.role !== 'Agent') {
        // Non-agent users should go to the parent tabs
        return <Redirect href="/(tabs)" />;
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    paddingBottom: Platform.OS === 'android' ? insets.bottom + 8 : insets.bottom,
                    height: Platform.OS === 'android' ? 60 + insets.bottom : 60,
                    backgroundColor: colors.background.default,
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
                name="dashboard"
                options={{
                    title: 'Tableau',
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="home" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="parents"
                options={{
                    title: 'Parents',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="people-outline" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="activity"
                options={{
                    title: 'Activité',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="timeline" size={size} color={color} />
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

            <Tabs.Screen
                name="parent-details"
                options={{
                    tabBarButton: () => null,
                    tabBarStyle: { display: 'none' },
                }}
            />
        </Tabs>
    );
}
