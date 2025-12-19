// app/(auth)/login.tsx
import { CustomButton } from '@/components/Button/CustomPressable';
import { CustomInput } from '@/components/CustomInput/CustomInput';
import { ScreenView } from '@/components/ScreenView/ScreenView';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { setCredentials } from '@/redux/slices/authSlice';
import type { AppDispatch } from '@/redux/store';
import { useLogin } from '@/services/userServices';
import { scaleFont } from '@/utils/stylings';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useDispatch } from 'react-redux';

export default function LoginScreen() {
  const [countryCode, setCountryCode] = useState('242');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [civilId, setCivilId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Using CustomInput password variant (built-in visibility toggle)

  const dispatch = useDispatch<AppDispatch>();
  const authenticate = useLogin();

  const handleLogin = async () => {
    if (!mobileNumber.trim()) {
      Alert.alert('Error', 'Please enter your mobile number');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      const { success, data, error } = await authenticate({
        countryCode,
        mobileNumber: mobileNumber.trim(),
        password: password.trim(),
        civilId: civilId.trim(),
        loginByType: 'mobile',
      });

      if (success && data) {
        // Store credentials in Redux (will be persisted)
        dispatch(setCredentials({
          token: data.token,
          userId: data.userId,
        }));

        // Navigate to main app
        router.replace('/(tabs)');
      } else {
        console.error('Login failed:', error);
        Alert.alert(
          'Login Failed',
          error?.message || 'Invalid credentials. Please try again.'
        );
      }
    } catch {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenView safeArea={true} backgroundColor={styles.container.backgroundColor}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Bienvenue</Text>
              <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <CustomInput
                  label="Code du pays"
                  value={countryCode}
                  onChangeText={setCountryCode}
                  placeholder="+965"
                  inputType="phone"
                  leftIcon="flag-outline"
                />
              </View>

              <View style={styles.inputGroup}>
                <CustomInput
                  label="Numéro de portable"
                  value={mobileNumber}
                  onChangeText={setMobileNumber}
                  placeholder="Enter your mobile number"
                  inputType="phone"
                  leftIcon="call-outline"
                />
              </View>

              <View style={styles.inputGroup}>
                <CustomInput
                  label={"Pièce d'identité civile (facultatif)"}
                  value={civilId}
                  onChangeText={setCivilId}
                  placeholder="Enter your civil ID"
                  inputType="number"
                  leftIcon="card-outline"
                />
              </View>

              <View style={styles.inputGroup}>
                <CustomInput
                  label="Mot de passe"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  inputType="password"
                  leftIcon="lock-closed-outline"
                />
              </View>

              <CustomButton
                title="Se connecter"
                onPress={handleLogin}
                loading={isLoading}
                fullWidth
                shadow
                accessibilityLabel="Se connecter"
                style={{ marginTop: 24 }}
              />

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  {"Vous n'avez pas de compte ?"}{' '}
                  <Link href="/(auth)/register" style={styles.link}>
                    {"S'inscrire"}
                  </Link>
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacingX._25,
    paddingVertical: spacingY._40,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacingY._50,
  },
  title: {
    fontSize: scaleFont(32),
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: spacingY._10,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: scaleFont(16),
    color: colors.text.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: spacingY._20,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacingY._30,
  },
  footerText: {
    fontSize: scaleFont(14),
    color: colors.text.secondary,
    fontWeight: '500',
  },
  link: {
    color: colors.primary.main,
    fontWeight: '700',
  },
});