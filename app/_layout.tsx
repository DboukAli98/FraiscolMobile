  import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

  // Prevent the splash screen from auto-hiding
  SplashScreen.preventAutoHideAsync();

  export default function RootLayout() {
    useEffect(() => {
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