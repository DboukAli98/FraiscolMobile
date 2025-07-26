// app/(pages)/personal-info.tsx
import { Card } from '@/components/Card/CardComponent';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { ScreenView } from '@/components/ScreenView/ScreenView';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { useParentProfile } from '@/hooks/useParentProfile';
import { scale, scaleFont } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface InfoItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    iconColor?: string;
}

const InfoItem: React.FC<InfoItemProps> = ({
    icon,
    label,
    value,
    iconColor = colors.primary.main
}) => (
    <View style={styles.infoItem}>
        <View style={styles.infoLeft}>
            <View style={[styles.infoIconContainer, { backgroundColor: `${iconColor}20` }]}>
                <Ionicons name={icon} size={20} color={iconColor} />
            </View>
            <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value || 'Non spécifié'}</Text>
            </View>
        </View>
    </View>
);

const PersonalInfoScreen = () => {
    const { parentData, isLoading, isRefreshing, error, refresh, retry } = useParentProfile();

    const handleBack = () => {
        router.back();
    };

    const handleEdit = () => {
        router.push('/(pages)/edit-profile');
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateString;
        }
    };

    const getStatusText = (statusId: number) => {
        switch (statusId) {
            case 1: return 'Actif';
            case 2: return 'En attente';
            case 3: return 'Inactif';
            default: return 'Inconnu';
        }
    };

    const getStatusColor = (statusId: number) => {
        switch (statusId) {
            case 1: return colors.success.main;
            case 2: return colors.warning.main;
            case 3: return colors.error.main;
            default: return colors.info.main;
        }
    };

    if (isLoading && !parentData) {
        return (
            <ScreenView safeArea backgroundColor={colors.background.default}>
                <PageHeader title="Informations personnelles" onBack={handleBack} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                    <Text style={styles.loadingText}>Chargement...</Text>
                </View>
            </ScreenView>
        );
    }

    if (error && !parentData) {
        return (
            <ScreenView safeArea backgroundColor={colors.background.default}>
                <PageHeader title="Informations personnelles" onBack={handleBack} />
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={colors.error.main} />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={retry}>
                        <Text style={styles.retryButtonText}>Réessayer</Text>
                    </TouchableOpacity>
                </View>
            </ScreenView>
        );
    }

    return (
        <ScreenView
            safeArea={true}
            padding={false}
            backgroundColor={colors.background.default}
        >
            <PageHeader
                title="Informations personnelles"
                onBack={handleBack}
                actions={[
                    {
                        icon: 'pencil-outline',
                        onPress: handleEdit,
                    }
                ]}
            />

            <ScrollView
                style={styles.container}
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
                {parentData && (
                    <>
                        {/* Profile Header */}
                        <View style={styles.profileHeader}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {parentData.firstName?.charAt(0)}{parentData.lastName?.charAt(0)}
                                </Text>
                            </View>
                            <Text style={styles.profileName}>
                                {parentData.firstName} {parentData.lastName}
                            </Text>
                            <View style={[
                                styles.statusBadge,
                                { backgroundColor: getStatusColor(parentData.fK_StatusId) }
                            ]}>
                                <Text style={styles.statusText}>
                                    {getStatusText(parentData.fK_StatusId)}
                                </Text>
                            </View>
                        </View>

                        {/* Personal Information Card */}
                        <Card style={styles.card}>
                            <Text style={styles.cardTitle}>Informations générales</Text>

                            <InfoItem
                                icon="person-outline"
                                label="Prénom"
                                value={parentData.firstName}
                            />

                            <InfoItem
                                icon="person-outline"
                                label="Nom de famille"
                                value={parentData.lastName}
                            />

                            <InfoItem
                                icon="person-outline"
                                label="Nom du père"
                                value={parentData.fatherName}
                            />

                            <InfoItem
                                icon="finger-print-outline"
                                label="ID Parent"
                                value={parentData.parentId.toString()}
                            />
                        </Card>

                        {/* Contact Information Card */}
                        <Card style={styles.card}>
                            <Text style={styles.cardTitle}>Informations de contact</Text>

                            <InfoItem
                                icon="call-outline"
                                label="Numéro de téléphone"
                                value={`${parentData.countryCode} ${parentData.phoneNumber}`}
                                iconColor={colors.info.main}
                            />

                            <InfoItem
                                icon="mail-outline"
                                label="Adresse email"
                                value={parentData.email}
                                iconColor={colors.info.main}
                            />

                            <InfoItem
                                icon="card-outline"
                                label="ID Civil"
                                value={parentData.civilId}
                                iconColor={colors.info.main}
                            />
                        </Card>

                        {/* Children Summary Card */}
                        <Card style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>Enfants</Text>
                                <TouchableOpacity
                                    style={styles.viewAllButton}
                                    onPress={() => router.push('/(pages)/childrens')}
                                >
                                    <Text style={styles.viewAllText}>Voir tout</Text>
                                    <Ionicons
                                        name="chevron-forward"
                                        size={16}
                                        color={colors.primary.main}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.childrenSummary}>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryNumber}>
                                        {parentData.childrens?.length || 0}
                                    </Text>
                                    <Text style={styles.summaryLabel}>
                                        Enfant{(parentData.childrens?.length || 0) > 1 ? 's' : ''}
                                    </Text>
                                </View>

                                {parentData.childrens && parentData.childrens.length > 0 && (
                                    <View style={styles.summaryItem}>
                                        <Text style={styles.summaryNumber}>
                                            {new Set(parentData.childrens.map(child => child.fK_SchoolId)).size}
                                        </Text>
                                        <Text style={styles.summaryLabel}>
                                            École{new Set(parentData.childrens.map(child => child.fK_SchoolId)).size > 1 ? 's' : ''}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {parentData.childrens && parentData.childrens.length > 0 && (
                                <View style={styles.recentChildren}>
                                    <Text style={styles.recentChildrenTitle}>Enfants récents</Text>
                                    {parentData.childrens.slice(0, 3).map((child) => (
                                        <View key={child.childId} style={styles.childItem}>
                                            <View style={styles.childAvatar}>
                                                <Text style={styles.childAvatarText}>
                                                    {child.firstName.charAt(0)}{child.lastName.charAt(0)}
                                                </Text>
                                            </View>
                                            <View style={styles.childInfo}>
                                                <Text style={styles.childName}>
                                                    {child.firstName} {child.lastName}
                                                </Text>
                                                <Text style={styles.childSchool}>
                                                    {child.school?.schoolName}
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </Card>

                        {/* System Information Card */}
                        <Card style={styles.card}>
                            <Text style={styles.cardTitle}>Informations système</Text>

                            <InfoItem
                                icon="time-outline"
                                label="Compte créé le"
                                value={formatDate(parentData.createdOn)}
                                iconColor={colors.secondary.main}
                            />

                            {parentData.modifiedOn && (
                                <InfoItem
                                    icon="create-outline"
                                    label="Dernière modification"
                                    value={formatDate(parentData.modifiedOn)}
                                    iconColor={colors.secondary.main}
                                />
                            )}

                            <InfoItem
                                icon="key-outline"
                                label="ID Utilisateur"
                                value={parentData.fK_UserId}
                                iconColor={colors.secondary.main}
                            />

                            {parentData.oneSignalPlayerId && (
                                <InfoItem
                                    icon="notifications-outline"
                                    label="ID Notifications"
                                    value={parentData.oneSignalPlayerId}
                                    iconColor={colors.secondary.main}
                                />
                            )}
                        </Card>

                        {/* Edit Button */}
                        <View style={styles.editButtonContainer}>
                            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                                <Ionicons name="pencil-outline" size={20} color={colors.text.white} />
                                <Text style={styles.editButtonText}>Modifier les informations</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </ScrollView>
        </ScreenView>
    );
};

export default PersonalInfoScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.default,
    },

    // Loading & Error States
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: spacingY._10,
        fontSize: scaleFont(16),
        color: colors.text.secondary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacingX._30,
    },
    errorText: {
        fontSize: scaleFont(16),
        color: colors.error.main,
        textAlign: 'center',
        marginVertical: spacingY._20,
    },
    retryButton: {
        backgroundColor: colors.primary.main,
        paddingHorizontal: spacingX._20,
        paddingVertical: spacingY._10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: colors.text.white,
        fontSize: scaleFont(14),
        fontWeight: '600',
    },

    // Profile Header
    profileHeader: {
        alignItems: 'center',
        paddingVertical: spacingY._30,
        backgroundColor: colors.background.paper,
        marginBottom: spacingY._20,
    },
    avatar: {
        width: scale(80),
        height: scale(80),
        borderRadius: scale(40),
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
        fontSize: scaleFont(24),
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: spacingY._10,
    },
    statusBadge: {
        paddingHorizontal: spacingX._15,
        paddingVertical: spacingY._5,
        borderRadius: 20,
    },
    statusText: {
        fontSize: scaleFont(12),
        fontWeight: '600',
        color: colors.text.white,
    },

    // Cards
    card: {
        marginHorizontal: spacingX._20,
        marginBottom: spacingY._15,
    },
    cardTitle: {
        fontSize: scaleFont(16),
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacingY._15,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacingY._15,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewAllText: {
        fontSize: scaleFont(14),
        color: colors.primary.main,
        fontWeight: '500',
        marginRight: spacingX._5,
    },

    // Info Items
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacingY._15,
    },
    infoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    infoIconContainer: {
        width: scale(36),
        height: scale(36),
        borderRadius: scale(18),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacingX._15,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: scaleFont(12),
        color: colors.text.secondary,
        marginBottom: spacingY._3,
    },
    infoValue: {
        fontSize: scaleFont(14),
        fontWeight: '500',
        color: colors.text.primary,
    },

    // Children Summary
    childrenSummary: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: spacingY._20,
        paddingVertical: spacingY._15,
        backgroundColor: colors.background.default,
        borderRadius: 12,
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryNumber: {
        fontSize: scaleFont(24),
        fontWeight: 'bold',
        color: colors.primary.main,
    },
    summaryLabel: {
        fontSize: scaleFont(12),
        color: colors.text.secondary,
        marginTop: spacingY._3,
    },

    // Recent Children
    recentChildren: {
        marginTop: spacingY._10,
    },
    recentChildrenTitle: {
        fontSize: scaleFont(14),
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacingY._10,
    },
    childItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacingY._7,
        borderBottomWidth: 1,
        borderBottomColor: colors.border?.light || '#e1e5e9',
    },
    childAvatar: {
        width: scale(32),
        height: scale(32),
        borderRadius: scale(16),
        backgroundColor: colors.secondary.main,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacingX._12,
    },
    childAvatarText: {
        fontSize: scaleFont(12),
        fontWeight: '600',
        color: colors.text.white,
    },
    childInfo: {
        flex: 1,
    },
    childName: {
        fontSize: scaleFont(14),
        fontWeight: '500',
        color: colors.text.primary,
    },
    childSchool: {
        fontSize: scaleFont(12),
        color: colors.text.secondary,
        marginTop: spacingY._3,
    },

    // Edit Button
    editButtonContainer: {
        paddingHorizontal: spacingX._20,
        paddingVertical: spacingY._30,
    },
    editButton: {
        backgroundColor: colors.primary.main,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacingY._15,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    editButtonText: {
        color: colors.text.white,
        fontSize: scaleFont(16),
        fontWeight: '600',
        marginLeft: spacingX._10,
    },
});