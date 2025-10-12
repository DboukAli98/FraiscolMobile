// app/(pages)/pending-children.tsx
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { ScreenView } from '@/components/ScreenView/ScreenView';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { useParentProfile } from '@/hooks/useParentProfile';
import useUserInfo from '@/hooks/useUserInfo';
import { PendingRejectedChildDto, useGetParentPendingRejectedChildrens } from '@/services/userServices';
import { scaleFont } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const PendingChildrenScreen = () => {
    const userInfo = useUserInfo();
    const { parentData } = useParentProfile();
    const getPendingRejectedChildrens = useGetParentPendingRejectedChildrens();

    const [children, setChildren] = useState<PendingRejectedChildDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Use ref to track last fetched parentId to prevent infinite loops
    const lastParentIdRef = React.useRef<number | null>(null);

    const fetchChildren = useCallback(async (refresh = false) => {
        const parentId = parentData?.parentId || (userInfo?.parentId ? parseInt(userInfo.parentId) : null);
        if (!parentId) return;

        if (refresh) {
            setIsRefreshing(true);
        } else {
            setIsLoading(true);
        }
        setError(null);

        try {
            const response = await getPendingRejectedChildrens({
                parentId,
                pageNumber: 1,
                pageSize: 50,
            });

            if (response.success && response.data?.data) {
                setChildren(response.data.data);
            } else {
                setError(response.error || "Impossible de charger les enfants");
            }
        } catch (err) {
            setError("Une erreur s'est produite");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [parentData?.parentId, userInfo?.parentId, getPendingRejectedChildrens]);

    useEffect(() => {
        const parentId = parentData?.parentId || (userInfo?.parentId ? parseInt(userInfo.parentId) : null);

        // Only fetch if parentId exists and has changed
        if (!parentId || parentId === lastParentIdRef.current) return;

        lastParentIdRef.current = parentId;
        fetchChildren();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parentData?.parentId, userInfo?.parentId]);

    const handleRefresh = () => {
        fetchChildren(true);
    };

    const handleChildPress = (child: PendingRejectedChildDto) => {
        const isRejected = child.fK_StatusId === 13;
        const isPending = child.fK_StatusId === 6;

        let message = '';
        if (isRejected && child.rejectionReason) {
            message = `Statut: Rejeté\n\nRaison du rejet:\n${child.rejectionReason}\n\nVeuillez contacter l'école pour plus d'informations.`;
        } else if (isPending) {
            message = `Statut: En attente d'approbation\n\nCet enfant est en attente d'approbation par l'école.\n\nDate de soumission: ${new Date(child.createdOn).toLocaleDateString('fr-FR')}`;
        } else {
            message = `Informations:\n\nNom: ${child.firstName} ${child.lastName}\nDate de naissance: ${new Date(child.dateOfBirth).toLocaleDateString('fr-FR')}\nÉcole: ${child.school?.schoolName || 'Non spécifiée'}`;
        }

        Alert.alert(
            `${child.firstName} ${child.lastName}`,
            message,
            [{ text: 'OK' }]
        );
    };

    const renderChild = (child: PendingRejectedChildDto) => {
        const isRejected = child.fK_StatusId === 13;
        const statusColor = isRejected ? colors.error.main : colors.warning.main;
        const statusIcon = isRejected ? "close-circle" : "time";
        const statusText = isRejected ? 'Rejeté' : 'En attente';

        return (
            <TouchableOpacity
                key={child.childId}
                style={styles.childCard}
                onPress={() => handleChildPress(child)}
                activeOpacity={0.7}
            >
                <View style={styles.childHeader}>
                    <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                        <Ionicons name={statusIcon} size={18} color={statusColor} />
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {statusText}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
                </View>

                <View style={styles.childInfo}>
                    <Text style={styles.childName}>
                        {child.firstName} {child.lastName}
                    </Text>
                    <View style={styles.infoRow}>
                        <Ionicons name="school-outline" size={14} color={colors.text.secondary} />
                        <Text style={styles.infoText}>
                            {child.school?.schoolName || 'École non spécifiée'}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={14} color={colors.text.secondary} />
                        <Text style={styles.infoText}>
                            Né(e) le {new Date(child.dateOfBirth).toLocaleDateString('fr-FR')}
                        </Text>
                    </View>
                    {isRejected && child.rejectionReason && (
                        <View style={styles.rejectionBox}>
                            <Ionicons name="information-circle" size={14} color={colors.error.main} />
                            <View style={styles.rejectionContent}>
                                <Text style={styles.rejectionLabel}>Raison du rejet:</Text>
                                <Text style={styles.rejectionText} numberOfLines={2}>
                                    {child.rejectionReason}
                                </Text>
                            </View>
                        </View>
                    )}
                    <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={14} color={colors.text.secondary} />
                        <Text style={styles.infoText}>
                            Soumis le {new Date(child.createdOn).toLocaleDateString('fr-FR')}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={64} color={colors.success.main} />
            <Text style={styles.emptyTitle}>Aucun enfant en attente</Text>
            <Text style={styles.emptyText}>
                Tous vos enfants ont été approuvés par leurs écoles respectives.
            </Text>
        </View>
    );

    const renderErrorState = () => (
        <View style={styles.errorState}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.error.main} />
            <Text style={styles.errorTitle}>Erreur de chargement</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchChildren()}>
                <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <ScreenView safeArea={true} padding={false}>
            <PageHeader title="Enfants en attente" onBack={() => router.back()} />

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                    <Text style={styles.loadingText}>Chargement des enfants...</Text>
                </View>
            ) : error ? (
                renderErrorState()
            ) : (
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            colors={[colors.primary.main]}
                        />
                    }
                >
                    {children.length === 0 ? (
                        renderEmptyState()
                    ) : (
                        <>
                            <View style={styles.infoBox}>
                                <Ionicons name="information-circle" size={20} color={colors.primary.main} />
                                <Text style={styles.infoBoxText}>
                                    {" Les enfants en attente nécessitent une approbation de l'école."}
                                    {"Contactez l'école pour plus d'informations. "}
                                </Text>
                            </View>

                            <View style={styles.statsContainer}>
                                <View style={styles.statBox}>
                                    <Text style={styles.statNumber}>
                                        {children.filter(c => c.fK_StatusId === 6).length}
                                    </Text>
                                    <Text style={styles.statLabel}>En attente</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={[styles.statNumber, { color: colors.error.main }]}>
                                        {children.filter(c => c.fK_StatusId === 13).length}
                                    </Text>
                                    <Text style={styles.statLabel}>Rejetés</Text>
                                </View>
                            </View>

                            <View style={styles.childrenList}>
                                {children.map(renderChild)}
                            </View>
                        </>
                    )}
                </ScrollView>
            )}
        </ScreenView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.default,
    },
    contentContainer: {
        paddingBottom: spacingY._30,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacingY._30,
    },
    loadingText: {
        fontSize: scaleFont(14),
        color: colors.text.secondary,
        marginTop: spacingY._15,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacingX._30,
        marginTop: spacingY._50,
    },
    emptyTitle: {
        fontSize: scaleFont(20),
        fontWeight: 'bold',
        color: colors.text.primary,
        marginTop: spacingY._20,
        marginBottom: spacingY._10,
    },
    emptyText: {
        fontSize: scaleFont(14),
        color: colors.text.secondary,
        textAlign: 'center',
        lineHeight: scaleFont(20),
    },
    errorState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacingX._30,
        marginTop: spacingY._50,
    },
    errorTitle: {
        fontSize: scaleFont(20),
        fontWeight: 'bold',
        color: colors.error.main,
        marginTop: spacingY._20,
        marginBottom: spacingY._10,
    },
    errorText: {
        fontSize: scaleFont(14),
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: spacingY._20,
    },
    retryButton: {
        backgroundColor: colors.primary.main,
        paddingHorizontal: spacingX._30,
        paddingVertical: spacingY._12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: colors.text.white,
        fontSize: scaleFont(14),
        fontWeight: '600',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: `${colors.primary.main}10`,
        padding: spacingY._15,
        marginHorizontal: spacingX._20,
        marginTop: spacingY._20,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: colors.primary.main,
    },
    infoBoxText: {
        flex: 1,
        fontSize: scaleFont(13),
        color: colors.text.primary,
        marginLeft: spacingX._10,
        lineHeight: scaleFont(18),
    },
    statsContainer: {
        flexDirection: 'row',
        marginHorizontal: spacingX._20,
        marginTop: spacingY._20,
        gap: spacingX._15,
    },
    statBox: {
        flex: 1,
        backgroundColor: colors.background.paper,
        padding: spacingY._20,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border?.light || '#e1e5e9',
    },
    statNumber: {
        fontSize: scaleFont(28),
        fontWeight: 'bold',
        color: colors.warning.main,
        marginBottom: spacingY._5,
    },
    statLabel: {
        fontSize: scaleFont(13),
        color: colors.text.secondary,
    },
    childrenList: {
        marginTop: spacingY._20,
        paddingHorizontal: spacingX._20,
    },
    childCard: {
        backgroundColor: colors.background.paper,
        borderRadius: 12,
        padding: spacingY._15,
        marginBottom: spacingY._15,
        borderWidth: 1,
        borderColor: colors.border?.light || '#e1e5e9',
    },
    childHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacingY._12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacingX._12,
        paddingVertical: spacingY._5,
        borderRadius: 12,
    },
    statusText: {
        fontSize: scaleFont(12),
        fontWeight: '600',
        marginLeft: spacingX._5,
    },
    childInfo: {
        gap: spacingY._10,
    },
    childName: {
        fontSize: scaleFont(18),
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: spacingY._5,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoText: {
        fontSize: scaleFont(13),
        color: colors.text.secondary,
        marginLeft: spacingX._10,
    },
    rejectionBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: `${colors.error.main}10`,
        padding: spacingY._10,
        borderRadius: 6,
        marginTop: spacingY._5,
    },
    rejectionContent: {
        flex: 1,
        marginLeft: spacingX._10,
    },
    rejectionLabel: {
        fontSize: scaleFont(12),
        fontWeight: '600',
        color: colors.error.main,
        marginBottom: spacingY._3,
    },
    rejectionText: {
        fontSize: scaleFont(12),
        color: colors.error.main,
        fontStyle: 'italic',
    },
});

export default PendingChildrenScreen;
