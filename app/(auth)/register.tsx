// Register screen (French) — uses CustomInput, PhoneInput, PasswordInput
import { CustomInput, PasswordInput, PhoneInput } from '@/components/CustomInput/CustomInput';
import { colors } from '@/constants/theme';
import { useRegisterUser } from '@/services/userServices';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface RegisterData {
  fullName: string;
  countryCode: string;
  mobileNumber: string;
  email: string;
  civilId: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterScreen() {
  const [formData, setFormData] = useState<RegisterData>({
    fullName: '',
    countryCode: '242',
    mobileNumber: '',
    email: '',
    civilId: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const registerUser = useRegisterUser();

  const updateFormData = (field: keyof RegisterData, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  const validateForm = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      nextErrors.fullName = 'Le nom complet est requis (au moins 3 caractères)';
    }

    if ((formData.countryCode || '').trim() !== '242') {
      nextErrors.countryCode = "L'indicatif doit être '242' (Congo Brazaville)";
    }

    const phone = (formData.mobileNumber || '').trim();
    const phoneRegex = /^0(4|5|6|7)\d{7}$/; // ex: 046601234, 056601234
    if (!phone) {
      nextErrors.mobileNumber = 'Le numéro de mobile est requis';
    } else if (!phoneRegex.test(phone)) {
      nextErrors.mobileNumber = "Numéro invalide pour le Congo. Exemple: 046601234 ou 056601234";
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) nextErrors.email = "L'adresse e-mail est invalide";
    }

    if (!formData.password) nextErrors.password = 'Le mot de passe est requis';
    else if (formData.password.length < 8) nextErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';

    if (!formData.confirmPassword) nextErrors.confirmPassword = 'La confirmation du mot de passe est requise';
    else if (formData.password !== formData.confirmPassword) nextErrors.confirmPassword = 'Les mots de passe ne correspondent pas';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      Alert.alert('Erreur', nextErrors[Object.keys(nextErrors)[0]]);
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      // map fullName -> firstName / lastName (first token as firstName, rest as lastName)
      const names = formData.fullName.trim().split(/\s+/);
      const firstName = names.shift() || '';
      const lastName = names.join(' ') || '';

      const resp = await registerUser({
        firstName,
        lastName,
        password: formData.password,
        civilId: formData.civilId.trim(),
        countryCode: (formData.countryCode || '242').replace(/^\+/, ''),
        phoneNumber: formData.mobileNumber.trim(),
        email: formData.email.trim(),
      });

      if (resp.success && resp.data?.status === 'Success') {
        Alert.alert('Succès', resp.data.message || 'Compte créé avec succès !', [
          { text: 'OK', onPress: () => router.replace('/(auth)/login') },
        ]);
      } else {
        const errMsg = resp.data?.message || resp.error || 'L\u2019inscription a échoué. Veuillez réessayer.';
        Alert.alert('Erreur', String(errMsg));
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || String(err);
      Alert.alert('Erreur', String(msg));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Créer un compte</Text>
            <Text style={styles.subtitle}>Inscrivez-vous pour commencer</Text>
          </View>

          <View style={styles.form}>
            <CustomInput label="Nom complet" placeholder="Entrez votre nom complet" value={formData.fullName} onChangeText={(v) => updateFormData('fullName', v)} error={errors.fullName} />

            <View style={styles.row}>
              <View style={{ flex: 0.3 }}>
                <CustomInput label="Indicatif" placeholder="242" value={formData.countryCode} onChangeText={(v) => updateFormData('countryCode', v)} error={errors.countryCode} />
              </View>
              <View style={{ flex: 0.7, marginLeft: 12 }}>
                <PhoneInput label="Numéro de mobile" placeholder="Ex: 056601234" value={formData.mobileNumber} onChangeText={(v) => updateFormData('mobileNumber', v)} error={errors.mobileNumber} />
              </View>
            </View>

            <CustomInput label="Adresse e-mail (optionnel)" placeholder="Entrez votre e-mail" value={formData.email} onChangeText={(v) => updateFormData('email', v)} error={errors.email} inputType="email" />

            <CustomInput label={"N° d\u2019identité (optionnel)"} placeholder={"Entrez votre numéro d\u2019identité"} value={formData.civilId} onChangeText={(v) => updateFormData('civilId', v)} error={errors.civilId} inputType="number" />

            <PasswordInput label="Mot de passe" placeholder="Entrez le mot de passe (min 8 caractères)" value={formData.password} onChangeText={(v) => updateFormData('password', v)} error={errors.password} />

            <PasswordInput label="Confirmer le mot de passe" placeholder="Confirmez votre mot de passe" value={formData.confirmPassword} onChangeText={(v) => updateFormData('confirmPassword', v)} error={errors.confirmPassword} />

            <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleRegister} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Créer un compte</Text>}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Vous avez déjà un compte ?{' '}<Link href="/(auth)/login" style={styles.link}>Se connecter</Link></Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center' },
  content: { flex: 1, paddingHorizontal: 24, paddingVertical: 48 },
  header: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1a202c', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#718096', textAlign: 'center' },
  form: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  button: { backgroundColor: colors.primary.main, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer: { alignItems: 'center', marginTop: 24 },
  footerText: { fontSize: 14, color: '#6b7280' },
  link: { color: '#3b82f6', fontWeight: '600' },
});


