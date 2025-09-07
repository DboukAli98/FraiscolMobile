import { persistor, store } from '@/redux/store';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { LogLevel, OneSignal } from 'react-native-onesignal';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Setting the animation options 
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function RootLayout() {
  useEffect(() => {
    // One Signal Enabling verbose logging for debugging 
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    // Initializing with OneSignal App ID
    console.log("OneSignal App ID:", process.env.EXPO_ONE_SIGNAL_APP_ID);
    OneSignal.initialize("7a7bb505-d9c7-4366-9e85-7051fbfd2b90");
    // //This method to prompt for push notifications. Removing in production and use in app messaging
    // OneSignal.Notifications.requestPermission(true);
    // Hide the splash screen after a short delay or when your app is ready
    const hideSplash = async () => {
      await SplashScreen.hideAsync();
    };

    hideSplash();
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <PersistGate
          loading={

            <SafeAreaView style={styles.container}>
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            </SafeAreaView>

          }
          persistor={persistor}
        >
          <SafeAreaView style={styles.container}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(agent)" />



            </Stack>
          </SafeAreaView>

        </PersistGate>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
}) 