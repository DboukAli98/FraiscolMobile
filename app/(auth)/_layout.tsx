// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';

// This layout wraps only authentication routes
export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="login" 
        options={{ 
          headerTitle: "Login"
        }} 
      />
      {/* Add other auth screens here */}
    </Stack>
  );
}