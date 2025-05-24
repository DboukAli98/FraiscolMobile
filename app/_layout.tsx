  import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { LogLevel, OneSignal } from 'react-native-onesignal';
import { SafeAreaProvider } from 'react-native-safe-area-context';

  // Prevent the splash screen from auto-hiding
  SplashScreen.preventAutoHideAsync();

  export default function RootLayout() {
    useEffect(() => {
      // One Signal Enabling verbose logging for debugging 
      OneSignal.Debug.setLogLevel(LogLevel.Verbose);
      // Initializing with OneSignal App ID
      OneSignal.initialize(process.env.EXPO_ONE_SIGNAL_APP_ID || "");
      //This method to prompt for push notifications. Removing in production and use in app messaging
      OneSignal.Notifications.requestPermission(false);
      // Hide the splash screen after a short delay or when your app is ready
      const hideSplash = async () => {
        await SplashScreen.hideAsync();
      };
      
      hideSplash();
    }, []);

    return (
      <SafeAreaProvider>
         <SafeAreaView style={styles.container}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        {/* <Stack.Screen name="(pages)" /> */}

        
      </Stack>
      </SafeAreaView>
      </SafeAreaProvider>
    );
  }

 const styles = StyleSheet.create({
  container :{
    flex:1,
    backgroundColor:"#fff"
  }
 }) 