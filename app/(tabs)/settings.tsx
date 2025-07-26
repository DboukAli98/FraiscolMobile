// app/(tabs)/settings.tsx
import { ScreenView } from '@/components/ScreenView/ScreenView';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { useParentProfile } from '@/hooks/useParentProfile';
import useUserInfo from '@/hooks/useUserInfo';
import { useLogout } from '@/services/userServices';
import { scaleFont } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  rightComponent?: React.ReactNode;
  iconColor?: string;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showArrow = true,
  rightComponent,
  iconColor = colors.primary.main
}) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    <View style={styles.settingLeft}>
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    <View style={styles.settingRight}>
      {rightComponent}
      {showArrow && !rightComponent && (
        <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
      )}
    </View>
  </TouchableOpacity>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

const SettingsScreen = () => {
  const userInfo = useUserInfo();
  const { parentData } = useParentProfile();
  const logoutUser = useLogout();

  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);

  // Handlers
  const handleEditProfile = () => {
    router.push('/(pages)/edit-profile');
  };

  const handlePersonalInfo = () => {
    router.push('/(pages)/personal-info');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Se déconnecter',
      'Êtes-vous sûr de vouloir vous déconnecter?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            try {
              const { success, error } = await logoutUser();
              if (success) {
                router.replace("/(auth)/login");
              } else {
                Alert.alert("Erreur", error || "Une erreur s'est produite lors de la déconnexion.");
              }
            } catch (error) {
              Alert.alert("Erreur", "Une erreur s'est produite lors de la déconnexion.");
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Cette action est irréversible. Toutes vos données seront supprimées.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => console.log('Delete account') }
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contacter le support',
      'Comment souhaitez-vous nous contacter?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Email', onPress: () => Linking.openURL('mailto:support@fraiscol.com') },
        { text: 'Téléphone', onPress: () => Linking.openURL('tel:+1234567890') }
      ]
    );
  };

  const getInitials = () => {
    if (parentData?.firstName && parentData?.lastName) {
      return `${parentData.firstName.charAt(0)}${parentData.lastName.charAt(0)}`.toUpperCase();
    }
    const name = userInfo?.name || 'User';
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getDisplayName = () => {
    if (parentData?.firstName && parentData?.lastName) {
      return `${parentData.firstName} ${parentData.lastName}`;
    }
    return userInfo?.name || 'Utilisateur';
  };

  const getDisplayEmail = () => {
    return parentData?.email || userInfo?.email || 'email@example.com';
  };

  return (
    <ScreenView safeArea={true} padding={false}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
          <Text style={styles.profileName}>{getDisplayName()}</Text>
          <Text style={styles.profileEmail}>{getDisplayEmail()}</Text>
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={handleEditProfile}
          >
            <Text style={styles.editProfileText}>Modifier le profil</Text>
          </TouchableOpacity>
        </View>

        {/* Account Settings */}
        <SectionHeader title="Compte" />

        <SettingItem
          icon="person-outline"
          title="Informations personnelles"
          subtitle="Nom, email, téléphone"
          onPress={handlePersonalInfo}
        />

        <SettingItem
          icon="people-outline"
          title="Gestion des enfants"
          subtitle="Ajouter ou modifier les informations des enfants"
          onPress={() => router.push('/(pages)/childrens')}
        />

        <SettingItem
          icon="card-outline"
          title="Méthodes de paiement"
          subtitle="Cartes bancaires, comptes mobiles"
          onPress={() => router.push('/(pages)/payment-methods')}
        />

        <SettingItem
          icon="document-text-outline"
          title="Historique des paiements"
          subtitle="Voir tous les paiements effectués"
          onPress={() => router.push('/(pages)/paymenthistory')}
        />

        {/* App Settings */}
        <SectionHeader title="Préférences de l'application" />

        <SettingItem
          icon="notifications-outline"
          title="Notifications"
          subtitle="Rappels de paiement, actualités"
          showArrow={false}
          rightComponent={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border?.light || '#e1e5e9', true: colors.primary.main }}
              thumbColor={notificationsEnabled ? colors.text.white : colors.text.secondary}
            />
          }
        />

        <SettingItem
          icon="language-outline"
          title="Langue"
          subtitle="Français"
          onPress={() => console.log('Language settings')}
        />

        {/* Data & Privacy */}
        <SectionHeader title="Données et confidentialité" />

        <SettingItem
          icon="cloud-upload-outline"
          title="Sauvegarde automatique"
          subtitle="Synchroniser les données"
          showArrow={false}
          rightComponent={
            <Switch
              value={autoBackup}
              onValueChange={setAutoBackup}
              trackColor={{ false: colors.border?.light || '#e1e5e9', true: colors.primary.main }}
              thumbColor={autoBackup ? colors.text.white : colors.text.secondary}
            />
          }
        />

        <SettingItem
          icon="download-outline"
          title="Télécharger mes données"
          subtitle="Exporter toutes mes informations"
          onPress={() => console.log('Download data')}
        />

        <SettingItem
          icon="shield-checkmark-outline"
          title="Politique de confidentialité"
          onPress={() => Linking.openURL('https://example.com/privacy')}
        />

        {/* Support */}
        <SectionHeader title="Support" />

        <SettingItem
          icon="help-circle-outline"
          title="Centre d'aide"
          subtitle="FAQ et guides"
          onPress={() => console.log('Help center')}
        />

        <SettingItem
          icon="chatbubble-outline"
          title="Contacter le support"
          subtitle="Obtenir de l'aide"
          onPress={handleContactSupport}
        />

        <SettingItem
          icon="information-circle-outline"
          title="À propos"
          subtitle="Version 1.0.0"
          onPress={() => {
            Alert.alert(
              'À propos de FraiscolMobile',
              'Version 1.0.0\n\nApplication de gestion des frais scolaires\n\n© 2025 Tous droits réservés',
              [{ text: 'OK' }]
            );
          }}
        />

        {/* Security Actions */}
        <SectionHeader title="Sécurité" />

        <SettingItem
          icon="key-outline"
          title="Changer le mot de passe"
          onPress={() => console.log('Change password')}
        />

        <SettingItem
          icon="log-out-outline"
          title="Se déconnecter"
          onPress={handleLogout}
          iconColor={colors.warning.main}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            FraiscolMobile v1.0.0{'\n'}
            © 2025 Tous droits réservés
          </Text>
        </View>
      </ScrollView>
    </ScreenView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: spacingY._30,
    paddingHorizontal: spacingX._20,
    backgroundColor: colors.background.paper,
    marginBottom: spacingY._20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacingY._15,
  },
  avatarText: {
    fontSize: scaleFont(28),
    fontWeight: '600',
    color: colors.text.white,
  },
  profileName: {
    fontSize: scaleFont(20),
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacingY._5,
  },
  profileEmail: {
    fontSize: scaleFont(14),
    color: colors.text.secondary,
    marginBottom: spacingY._15,
  },
  editProfileButton: {
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  editProfileText: {
    color: colors.primary.main,
    fontSize: scaleFont(14),
    fontWeight: '500',
  },
  sectionHeader: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: colors.text.primary,
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._15,
    backgroundColor: '#f8f9fa',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._15,
    backgroundColor: colors.background.default,
    borderBottomWidth: 1,
    borderBottomColor: colors.border?.light || '#e1e5e9',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacingX._15,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: scaleFont(16),
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: scaleFont(13),
    color: colors.text.secondary,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    padding: spacingY._30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: scaleFont(12),
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: scaleFont(18),
  },
});

export default SettingsScreen;