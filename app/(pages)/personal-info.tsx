// app/(pages)/personal-info.tsx
import { Card } from '@/components/Card/CardComponent';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { ScreenView } from '@/components/ScreenView/ScreenView';
import { colors, radius, shadows, spacingX, spacingY } from '@/constants/theme';
import { useParentProfile } from '@/hooks/useParentProfile';
import useUserInfo from '@/hooks/useUserInfo';
import useUserRole from '@/hooks/useUserRole';
import { CollectingAgentDetailsData, useGetCollectingAgentDetails } from '@/services/collectingAgentServices';
import { scale, scaleFont } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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
    const userInfo = useUserInfo();
    const userRole = useUserRole();
    const { parentData, isLoading: parentLoading, isRefreshing: parentRefreshing, error: parentError, refresh: refreshParent, retry: retryParent } = useParentProfile();
    const getAgentDetails = useGetCollectingAgentDetails();

    // Check if user is an agent
    const isAgent = userRole?.toLowerCase() === 'agent';

    // Agent states
    const [agentData, setAgentData] = useState<CollectingAgentDetailsData | null>(null);
    const [agentLoading, setAgentLoading] = useState(false);
    const [agentRefreshing, setAgentRefreshing] = useState(false);
    const [agentError, setAgentError] = useState<string | null>(null);

    // Use ref to prevent infinite loops
    const hasLoadedAgentDataRef = useRef(false);

    // Fetch agent details
    useEffect(() => {
        const fetchAgentDetails = async () => {
            if (isAgent && userInfo?.parentId && !hasLoadedAgentDataRef.current) {
                hasLoadedAgentDataRef.current = true;
                setAgentLoading(true);

                const agentId = typeof userInfo.parentId === 'number'
                    ? userInfo.parentId
                    : Number(userInfo.parentId ?? 0);

                if (agentId) {
                    try {
                        const response = await getAgentDetails({ agentId });
                        if (response.success && response.data?.data) {
                            setAgentData(response.data.data);
                            setAgentError(null);
                        } else {
                            setAgentError('Impossible de charger les informations de l\'agent');
                        }
                    } catch (error) {
                        setAgentError('Une erreur s\'est produite');
                    } finally {
                        setAgentLoading(false);
                    }
                }
            }
        };

        fetchAgentDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAgent, userInfo?.parentId]);

    // Refresh agent data
    const refreshAgent = async () => {
        if (!isAgent || !userInfo?.parentId) return;

        setAgentRefreshing(true);
        const agentId = typeof userInfo.parentId === 'number'
            ? userInfo.parentId
            : Number(userInfo.parentId ?? 0);

        if (agentId) {
            try {
                const response = await getAgentDetails({ agentId });
                if (response.success && response.data?.data) {
                    setAgentData(response.data.data);
                    setAgentError(null);
                }
            } catch (error) {
                setAgentError('Une erreur s\'est produite');
            } finally {
                setAgentRefreshing(false);
            }
        }
    };

    // Retry loading agent data
    const retryAgent = () => {
        hasLoadedAgentDataRef.current = false;
        setAgentError(null);
        if (isAgent && userInfo?.parentId) {
            const agentId = typeof userInfo.parentId === 'number'
                ? userInfo.parentId
                : Number(userInfo.parentId ?? 0);

            if (agentId) {
                setAgentLoading(true);
                getAgentDetails({ agentId }).then(response => {
                    if (response.success && response.data?.data) {
                        setAgentData(response.data.data);
                        setAgentError(null);
                    } else {
                        setAgentError('Impossible de charger les informations de l\'agent');
                    }
                }).finally(() => setAgentLoading(false));
            }
        }
    };

    // Get current data based on role
    const currentData = isAgent ? agentData : parentData;
    const isLoading = isAgent ? agentLoading : parentLoading;
    const isRefreshing = isAgent ? agentRefreshing : parentRefreshing;
    const error = isAgent ? agentError : parentError;
    const refresh = isAgent ? refreshAgent : refreshParent;
    const retry = isAgent ? retryAgent : retryParent;

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
                {currentData && (
                    <>
                        {/* Profile Header */}
                        <View style={styles.profileHeader}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {currentData.firstName?.charAt(0)}{currentData.lastName?.charAt(0)}
                                </Text>
                            </View>
                            <Text style={styles.profileName}>
                                {currentData.firstName} {currentData.lastName}
                            </Text>
                            <View style={[
                                styles.statusBadge,
                                { backgroundColor: getStatusColor(currentData.fK_StatusId) }
                            ]}>
                                <Text style={styles.statusText}>
                                    {getStatusText(currentData.fK_StatusId)}
                                </Text>
                            </View>
                        </View>

                        {/* Personal Information Card */}
                        <Card style={styles.card}>
                            <Text style={styles.cardTitle}>Informations générales</Text>

                            <InfoItem
                                icon="person-outline"
                                label="Prénom"
                                value={currentData.firstName}
                            />

                            <InfoItem
                                icon="person-outline"
                                label="Nom de famille"
                                value={currentData.lastName}
                            />

                            {!isAgent && parentData && (
                                <>
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
                                </>
                            )}

                            {isAgent && agentData && (
                                <InfoItem
                                    icon="finger-print-outline"
                                    label="ID Agent"
                                    value={agentData.collectingAgentId.toString()}
                                />
                            )}
                        </Card>

                        {/* Contact Information Card */}
                        <Card style={styles.card}>
                            <Text style={styles.cardTitle}>Informations de contact</Text>

                            <InfoItem
                                icon="call-outline"
                                label="Numéro de téléphone"
                                value={`${currentData.countryCode} ${currentData.phoneNumber}`}
                                iconColor={colors.info.main}
                            />

                            <InfoItem
                                icon="mail-outline"
                                label="Adresse email"
                                value={currentData.email}
                                iconColor={colors.info.main}
                            />

                            {!isAgent && parentData && (
                                <InfoItem
                                    icon="card-outline"
                                    label="ID Civil"
                                    value={parentData.civilId}
                                    iconColor={colors.info.main}
                                />
                            )}
                        </Card>

                        {/* Children Summary Card - Only for parents */}
                        {!isAgent && parentData && (
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
                        )}

                        {/* System Information Card */}
                        <Card style={styles.card}>
                            <Text style={styles.cardTitle}>Informations système</Text>

                            <InfoItem
                                icon="time-outline"
                                label="Compte créé le"
                                value={formatDate(currentData.createdOn)}
                                iconColor={colors.secondary.main}
                            />

                            {currentData.modifiedOn && (
                                <InfoItem
                                    icon="create-outline"
                                    label="Dernière modification"
                                    value={formatDate(currentData.modifiedOn)}
                                    iconColor={colors.secondary.main}
                                />
                            )}

                            <InfoItem
                                icon="key-outline"
                                label="ID Utilisateur"
                                value={currentData.fK_UserId}
                                iconColor={colors.secondary.main}
                            />

                            {currentData.oneSignalPlayerId && (
                                <InfoItem
                                    icon="notifications-outline"
                                    label="ID Notifications"
                                    value={currentData.oneSignalPlayerId}
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
        borderRadius: radius._12,
        ...shadows.sm,
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
        borderRadius: radius.full,
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
        borderRadius: radius._12,
        ...shadows.md,
    },
    editButtonText: {
        color: colors.text.white,
        fontSize: scaleFont(16),
        fontWeight: '600',
        marginLeft: spacingX._10,
    },
});