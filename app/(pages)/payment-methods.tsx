// app/(pages)/payment-methods.tsx
import { Card } from '@/components/Card/CardComponent';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { ScreenView } from '@/components/ScreenView/ScreenView';
import { colors, radius, shadows, spacingX, spacingY } from '@/constants/theme';
import { useParentProfile } from '@/hooks/useParentProfile';
import { scale, scaleFont } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface PaymentMethodProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    isActive: boolean;
    isPrimary?: boolean;
    onPress?: () => void;
    onEdit?: () => void;
    iconColor?: string;
    statusColor?: string;
}

const PaymentMethodCard: React.FC<PaymentMethodProps> = ({
    icon,
    title,
    subtitle,
    isActive,
    isPrimary = false,
    onPress,
    onEdit,
    iconColor = colors.primary.main,
    statusColor,
}) => (
    <Card style={styles.paymentMethodCard} onPress={onPress}>
        <View style={styles.cardContent}>
            {/* Left Section - Icon and Info */}
            <View style={styles.leftSection}>
                <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
                    <Ionicons name={icon} size={24} color={iconColor} />
                </View>

                <View style={styles.methodInfo}>
                    <View style={styles.titleRow}>
                        <Text style={styles.methodTitle}>{title}</Text>
                        {isPrimary && (
                            <View style={styles.primaryBadge}>
                                <Text style={styles.primaryText}>Principal</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.methodSubtitle}>{subtitle}</Text>

                    {/* Status */}
                    <View style={styles.statusRow}>
                        <View style={[
                            styles.statusDot,
                            { backgroundColor: statusColor || (isActive ? colors.success.main : colors.error.main) }
                        ]} />
                        <Text style={[
                            styles.statusText,
                            { color: statusColor || (isActive ? colors.success.main : colors.error.main) }
                        ]}>
                            {isActive ? 'Actif' : 'Inactif'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Right Section - Actions */}
            <View style={styles.rightSection}>
                {onEdit && (
                    <TouchableOpacity style={styles.editButton} onPress={onEdit}>
                        <Ionicons name="pencil-outline" size={18} color={colors.text.secondary} />
                    </TouchableOpacity>
                )}
                <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
            </View>
        </View>
    </Card>
);

interface InfoCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    message: string;
    iconColor?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({
    icon,
    title,
    message,
    iconColor = colors.info.main,
}) => (
    <Card style={styles.infoCard}>
        <View style={styles.infoContent}>
            <View style={[styles.infoIconContainer, { backgroundColor: `${iconColor}15` }]}>
                <Ionicons name={icon} size={20} color={iconColor} />
            </View>
            <View style={styles.infoText}>
                <Text style={styles.infoTitle}>{title}</Text>
                <Text style={styles.infoMessage}>{message}</Text>
            </View>
        </View>
    </Card>
);

const PaymentMethodsScreen = () => {
    const { parentData, isRefreshing, refresh } = useParentProfile();

    const handleBack = () => {
        router.back();
    };

    const handleAirtelPress = () => {
        // Navigate to Airtel payment details or management
        console.log('Airtel method pressed');
    };

    const handleEditAirtel = () => {
        // Navigate to edit Airtel details
        console.log('Edit Airtel pressed');
    };

    const handleAddPaymentMethod = () => {
        // Show coming soon message
        console.log('Add payment method pressed');
    };

    // Format phone number for display
    const formatPhoneNumber = (countryCode: string, phoneNumber: string) => {
        return `${countryCode} ${phoneNumber}`;
    };

    return (
        <ScreenView
            safeArea={true}
            padding={false}
            backgroundColor={colors.background.default}
        >
            <PageHeader title="Méthodes de paiement" onBack={handleBack} />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={refresh}
                        tintColor={colors.primary.main}
                        colors={[colors.primary.main]}
                    />
                }
            >
                {/* Header Section */}
                <View style={styles.headerSection}>
                    <Text style={styles.headerTitle}>Vos méthodes de paiement</Text>
                    <Text style={styles.headerSubtitle}>
                        Gérez vos modes de paiement pour les frais scolaires
                    </Text>
                </View>

                {/* Current Payment Methods */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Méthodes actives</Text>

                    {parentData && (
                        <PaymentMethodCard
                            icon="phone-portrait-outline"
                            title="Airtel Money"
                            subtitle={formatPhoneNumber(parentData.countryCode, parentData.phoneNumber)}
                            isActive={true}
                            isPrimary={true}
                            onPress={handleAirtelPress}
                            onEdit={handleEditAirtel}
                            iconColor="#FF6B35"
                        />
                    )}
                </View>

                {/* Add Payment Method Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ajouter une méthode</Text>

                    <TouchableOpacity
                        style={styles.addMethodCard}
                        onPress={handleAddPaymentMethod}
                        activeOpacity={0.7}
                    >
                        <View style={styles.addMethodContent}>
                            <View style={styles.addIconContainer}>
                                <Ionicons name="add-outline" size={24} color={colors.primary.main} />
                            </View>
                            <View style={styles.addMethodText}>
                                <Text style={styles.addMethodTitle}>Ajouter une nouvelle méthode</Text>
                                <Text style={styles.addMethodSubtitle}>
                                    Bientôt disponible - Banques du Congo-Brazzaville
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Information Cards */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informations</Text>

                    <InfoCard
                        icon="information-circle-outline"
                        title="Fonctionnalités à venir"
                        message="Les banques du Congo-Brazzaville seront bientôt disponibles pour faciliter vos paiements en ligne."
                        iconColor={colors.info.main}
                    />

                    <InfoCard
                        icon="shield-checkmark-outline"
                        title="Paiements sécurisés"
                        message="Toutes vos transactions sont protégées par un chiffrement de niveau bancaire pour garantir la sécurité de vos données."
                        iconColor={colors.success.main}
                    />

                    <InfoCard
                        icon="time-outline"
                        title="Traitement rapide"
                        message="Les paiements via Airtel Money sont traités instantanément pour un accès immédiat aux services scolaires."
                        iconColor={colors.warning.main}
                    />
                </View>

                {/* Support Section */}
                <View style={styles.supportSection}>
                    <Text style={styles.supportTitle}>{"Besoin d'aide ?"}</Text>
                    <Text style={styles.supportText}>
                        Si vous rencontrez des problèmes avec vos méthodes de paiement, contactez notre équipe de support.
                    </Text>

                    <TouchableOpacity style={styles.supportButton}>
                        <Ionicons name="chatbubble-outline" size={18} color={colors.primary.main} />
                        <Text style={styles.supportButtonText}>Contacter le support</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ScreenView>
    );
};

export default PaymentMethodsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.default,
    },
    contentContainer: {
        paddingBottom: spacingY._30,
    },

    // Header Section
    headerSection: {
        paddingHorizontal: spacingX._20,
        paddingVertical: spacingY._20,
        backgroundColor: colors.background.paper,
        marginBottom: spacingY._20,
    },
    headerTitle: {
        fontSize: scaleFont(20),
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: spacingY._5,
    },
    headerSubtitle: {
        fontSize: scaleFont(14),
        color: colors.text.secondary,
        lineHeight: scaleFont(20),
    },

    // Sections
    section: {
        marginBottom: spacingY._25,
    },
    sectionTitle: {
        fontSize: scaleFont(16),
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacingY._15,
        paddingHorizontal: spacingX._20,
    },

    // Payment Method Card
    paymentMethodCard: {
        marginHorizontal: spacingX._20,
        marginBottom: spacingY._10,
        padding: spacingX._15,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: scale(48),
        height: scale(48),
        borderRadius: scale(24),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacingX._15,
    },
    methodInfo: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacingY._3,
    },
    methodTitle: {
        fontSize: scaleFont(16),
        fontWeight: '600',
        color: colors.text.primary,
        marginRight: spacingX._10,
    },
    primaryBadge: {
        backgroundColor: colors.primary.main,
        paddingHorizontal: spacingX._7,
        paddingVertical: spacingY._3,
        borderRadius: radius._10,
    },
    primaryText: {
        fontSize: scaleFont(10),
        fontWeight: '600',
        color: colors.text.white,
    },
    methodSubtitle: {
        fontSize: scaleFont(14),
        color: colors.text.secondary,
        marginBottom: spacingY._5,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: scale(8),
        height: scale(8),
        borderRadius: scale(4),
        marginRight: spacingX._7,
    },
    statusText: {
        fontSize: scaleFont(12),
        fontWeight: '500',
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    editButton: {
        padding: spacingX._7,
        marginRight: spacingX._5,
    },

    // Add Method Card
    addMethodCard: {
        backgroundColor: colors.background.paper,
        marginHorizontal: spacingX._20,
        borderRadius: radius._12,
        padding: spacingX._15,
        borderWidth: 2,
        borderColor: colors.border?.light || '#e1e5e9',
        borderStyle: 'dashed',
    },
    addMethodContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addIconContainer: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: `${colors.primary.main}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacingX._15,
    },
    addMethodText: {
        flex: 1,
    },
    addMethodTitle: {
        fontSize: scaleFont(15),
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacingY._3,
    },
    addMethodSubtitle: {
        fontSize: scaleFont(13),
        color: colors.text.secondary,
        lineHeight: scaleFont(18),
    },

    // Info Cards
    infoCard: {
        marginHorizontal: spacingX._20,
        marginBottom: spacingY._10,
        padding: spacingX._15,
    },
    infoContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    infoIconContainer: {
        width: scale(36),
        height: scale(36),
        borderRadius: scale(18),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacingX._12,
    },
    infoText: {
        flex: 1,
    },
    infoTitle: {
        fontSize: scaleFont(14),
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacingY._5,
    },
    infoMessage: {
        fontSize: scaleFont(13),
        color: colors.text.secondary,
        lineHeight: scaleFont(19),
    },

    // Support Section
    supportSection: {
        marginHorizontal: spacingX._20,
        padding: spacingX._20,
        backgroundColor: colors.background.paper,
        borderRadius: radius._12,
        alignItems: 'center',
        ...shadows.sm,
    },
    supportTitle: {
        fontSize: scaleFont(16),
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacingY._10,
    },
    supportText: {
        fontSize: scaleFont(14),
        color: colors.text.secondary,
        textAlign: 'center',
        lineHeight: scaleFont(20),
        marginBottom: spacingY._15,
    },
    supportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${colors.primary.main}15`,
        paddingHorizontal: spacingX._20,
        paddingVertical: spacingY._10,
        borderRadius: radius._20,
    },
    supportButtonText: {
        fontSize: scaleFont(14),
        fontWeight: '600',
        color: colors.primary.main,
        marginLeft: spacingX._7,
    },
});