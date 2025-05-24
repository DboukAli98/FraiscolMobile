// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';

// This layout wraps only authentication routes
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="login" 
        options={{ 
          headerTitle: "Login",
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="register" 
        options={{ 
          headerTitle: "Register",
          headerShown: false
        }} 
      />
    </Stack>
  );
}