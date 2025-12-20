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
  const [errors, setErrors] = useState<{ mobileNumber?: string; password?: string; general?: string }>({});
  // Using CustomInput password variant (built-in visibility toggle)

  const dispatch = useDispatch<AppDispatch>();
  const authenticate = useLogin();

  const handleLogin = async () => {
    const newErrors: { mobileNumber?: string; password?: string } = {};

    if (!mobileNumber.trim()) {
      newErrors.mobileNumber = 'Le numéro de portable est obligatoire';
    }

    if (!password.trim()) {
      newErrors.password = 'Le mot de passe est obligatoire';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
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
        setErrors({ general: error?.message || 'Identifiants invalides. Veuillez réessayer.' });
      }
    } catch {
      setErrors({ general: 'Une erreur inattendue s\'est produite. Veuillez réessayer.' });
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
              {errors.general && (
                <View style={styles.generalErrorContainer}>
                  <Text style={styles.generalErrorText}>{errors.general}</Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <CustomInput
                  label="Code du pays"
                  value={countryCode}
                  onChangeText={(text) => {
                    setCountryCode(text);
                    if (errors.general) setErrors({});
                  }}
                  placeholder="+965"
                  inputType="phone"
                  leftIcon="flag-outline"
                />
              </View>

              <View style={styles.inputGroup}>
                <CustomInput
                  label="Numéro de portable"
                  value={mobileNumber}
                  onChangeText={(text) => {
                    setMobileNumber(text);
                    setErrors(prev => ({ ...prev, mobileNumber: undefined, general: undefined }));
                  }}
                  placeholder="Enter your mobile number"
                  inputType="phone"
                  leftIcon="call-outline"
                  error={errors.mobileNumber}
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
                  onChangeText={(text) => {
                    setPassword(text);
                    setErrors(prev => ({ ...prev, password: undefined, general: undefined }));
                  }}
                  placeholder="Enter your password"
                  inputType="password"
                  leftIcon="lock-closed-outline"
                  error={errors.password}
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
  generalErrorContainer: {
    backgroundColor: `${colors.error.main}15`,
    padding: spacingX._15,
    borderRadius: 12,
    marginBottom: spacingY._20,
    borderWidth: 1,
    borderColor: `${colors.error.main}30`,
  },
  generalErrorText: {
    color: colors.error.main,
    fontSize: scaleFont(14),
    textAlign: 'center',
    fontWeight: '600',
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