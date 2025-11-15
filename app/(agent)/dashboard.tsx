import { GhostIconButton } from '@/components/IconButton/IconButton';
import { PerformanceCard } from '@/components/PerformanceCard/PerformanceCard';
import { ScreenView } from '@/components/ScreenView/ScreenView';
import { colors, getTextStyle, spacingX, spacingY } from '@/constants/theme';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationsList } from '@/hooks/useNotificationsList';
import useUserInfo from '@/hooks/useUserInfo';
import { useGetCollectingAgentParents } from '@/services/collectingAgentServices';
import { getPerformanceGradeColor, useGetMyPerformance } from '@/services/performanceServices';
import { useLogout } from '@/services/userServices';
import { scale, scaleFont } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function AgentDashboard() {
    const user = useUserInfo();
    const logoutUser = useLogout();
    const getCollectingAgentParents = useGetCollectingAgentParents();
    const { getMyPerformance } = useGetMyPerformance();
    const { hasRequestedPermission, requestNotificationPermission } = useNotifications();
    const { unreadCount } = useNotificationsList({
        type: '',
        pageSize: 10,
        autoFetch: true,
    });

    const [parentsCount, setParentsCount] = useState<number | null>(null);
    const [loadingCount, setLoadingCount] = useState<boolean>(false);
    const [performance, setPerformance] = useState<any>(null);
    const [loadingPerformance, setLoadingPerformance] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [performanceError, setPerformanceError] = useState<string | null>(null);

    const handleLogout = async () => {
        try {
            const { success, error } = await logoutUser();
            if (success) {
                router.replace('/(auth)/login');
            } else {
                Alert.alert('Erreur', error || "Une erreur s'est produite lors de la déconnexion.");
            }
        } catch {
            Alert.alert('Erreur', "Une erreur s'est produite lors de la déconnexion.");
        }
    };

    // Request notification permission on first load
    useEffect(() => {
        if (!hasRequestedPermission) {
            const timer = setTimeout(() => {
                requestNotificationPermission();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [hasRequestedPermission, requestNotificationPermission]);

    const fetchDashboardData = async () => {
        const agentId = typeof user?.parentId === 'number'
            ? user.parentId
            : Number(user?.parentId ?? 0);
        if (!agentId) return;

        try {
            setLoadingCount(true);
            setLoadingPerformance(true);

            // Fetch parents count
            const parentsResponse = await getCollectingAgentParents({
                collectingAgentId: agentId,
                pageNumber: 1,
                pageSize: 1,
            });
            if (parentsResponse.success) {
                setParentsCount(parentsResponse.data?.totalCount ?? 0);
            }

            // Fetch performance data (all time)
            try {
                setPerformanceError(null);
                const performanceData = await getMyPerformance({});
                console.log('Performance data received:', performanceData);
                if (performanceData) {
                    setPerformance(performanceData);
                } else {
                    setPerformanceError('Aucune donnée de performance disponible');
                }
            } catch (perfError: any) {
                console.error('Error fetching performance data:', perfError);
                setPerformanceError(perfError?.message || 'Erreur lors du chargement des performances');
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoadingCount(false);
            setLoadingPerformance(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchDashboardData();
        setRefreshing(false);
    };

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.parentId]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'MAD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <ScreenView safeArea={true}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary.main}
                    />
                }
            >
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={24} color={colors.text.white} />
                        </View>
                        <View style={styles.greetingSection}>
                            <Text style={styles.smallGreeting}>Bonjour</Text>
                            <Text style={styles.nameText}>{user?.name || 'Agent'}</Text>
                        </View>
                    </View>
                    <View style={styles.headerRight}>
                        <View style={styles.notificationIconContainer}>
                            <GhostIconButton
                                iconName="notifications-outline"
                                size="md"
                                accessibilityLabel="Notifications"
                                onPress={() => router.push('/(pages)/notifications')}
                            />
                            {unreadCount > 0 && (
                                <View style={styles.notificationBadge}>
                                    <Text style={styles.notificationBadgeText}>
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <GhostIconButton
                            iconName="log-out-outline"
                            onPress={handleLogout}
                            size='md'
                            accessibilityLabel='logout'
                            color='error'
                        />
                    </View>
                </View>

                {/* Quick Stats */}
                <View style={styles.cardsRow}>
                    <TouchableOpacity
                        style={styles.statCard}
                        onPress={() => router.push('/(agent)/parents')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.statLabel}>Parents assignés</Text>
                        <Text style={styles.statValue}>
                            {loadingCount ? '...' : (parentsCount ?? '--')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.statCard}
                        onPress={() => router.push('/(agent)/activity')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.statLabel}>Mes activités</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacingY._5 }}>
                            <Ionicons name="clipboard-outline" size={20} color={colors.primary.main} />
                            <Text style={[styles.statValue, { marginLeft: spacingX._5, marginTop: 0 }]}>Voir</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Actions rapides</Text>
                    <View style={styles.quickActions}>
                        <TouchableOpacity
                            style={styles.quickActionCard}
                            onPress={() => router.push('/(agent)/parents')}
                        >
                            <Ionicons name="people-outline" size={24} color={colors.primary.main} />
                            <Text style={styles.quickActionText}>Mes parents</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.quickActionCard}
                            onPress={() => router.push('/(agent)/activity')}
                        >
                            <Ionicons name="document-text-outline" size={24} color={colors.primary.main} />
                            <Text style={styles.quickActionText}>Activités</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Performance Section - At the End */}
                {loadingPerformance ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary.main} />
                        <Text style={styles.loadingText}>Chargement des performances...</Text>
                    </View>
                ) : performanceError ? (
                    <View style={styles.noDataContainer}>
                        <Ionicons name="analytics-outline" size={48} color={colors.text.secondary} />
                        <Text style={styles.noDataText}>Aucune donnée de performance disponible</Text>
                    </View>
                ) : performance ? (
                    <>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Performance globale</Text>

                            {/* Performance Grade Card */}
                            <View style={styles.gradeCard}>
                                <View style={styles.gradeHeader}>
                                    <View style={[
                                        styles.gradeIconContainer,
                                        { backgroundColor: getPerformanceGradeColor(performance.performanceGrade) }
                                    ]}>
                                        <Ionicons
                                            name={performance.successRate >= 80 ? 'trophy' : performance.successRate >= 60 ? 'thumbs-up' : 'trending-up'}
                                            size={32}
                                            color="#FFFFFF"
                                        />
                                    </View>
                                    <View style={styles.gradeInfo}>
                                        <Text style={styles.gradeLabel}>Performance globale</Text>
                                        <Text style={[
                                            styles.gradeValue,
                                            { color: getPerformanceGradeColor(performance.performanceGrade) }
                                        ]}>
                                            {performance.performanceGrade}
                                        </Text>
                                        <Text style={styles.gradeSubtext}>
                                            Taux de réussite: {performance.successRate.toFixed(1)}%
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Performance Metrics Grid */}
                            <View style={styles.metricsGrid}>
                                <View style={styles.metricsRow}>
                                    <PerformanceCard
                                        title="Commissions gagnées"
                                        value={formatCurrency(performance.totalCommissionsEarned)}
                                        subtitle={`${performance.commissionPercentage}% par paiement`}
                                        icon="cash"
                                        gradientColors={['#10b981', '#059669']}
                                    />
                                </View>
                                <View style={styles.metricsRow}>
                                    <View style={{ flex: 1, marginRight: spacingX._10 }}>
                                        <PerformanceCard
                                            title="Paiements collectés"
                                            value={performance.paymentCollectedCount.toString()}
                                            subtitle="Succès"
                                            icon="checkmark-circle"
                                            gradientColors={['#3b82f6', '#2563eb']}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <PerformanceCard
                                            title="Tentatives"
                                            value={performance.paymentAttemptedCount.toString()}
                                            subtitle="Total"
                                            icon="sync"
                                            gradientColors={['#8b5cf6', '#7c3aed']}
                                        />
                                    </View>
                                </View>
                                <View style={styles.metricsRow}>
                                    <View style={{ flex: 1, marginRight: spacingX._10 }}>
                                        <PerformanceCard
                                            title="Parents assignés"
                                            value={performance.assignedParentsCount.toString()}
                                            subtitle="Actifs"
                                            icon="people"
                                            gradientColors={['#f59e0b', '#d97706']}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <PerformanceCard
                                            title="Activités totales"
                                            value={performance.totalActivitiesCount.toString()}
                                            subtitle="Enregistrées"
                                            icon="document-text"
                                            gradientColors={['#06b6d4', '#0891b2']}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </>
                ) : null}
            </ScrollView>
        </ScreenView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        alignContent: 'center',
        marginBottom: spacingY._30,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingX._7,
    },
    notificationIconContainer: {
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: colors.error.main,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: colors.background.default,
    },
    notificationBadgeText: {
        color: colors.text.white,
        fontSize: scaleFont(10),
        fontWeight: '700',
    },
    avatar: {
        width: scale(48),
        height: scale(48),
        borderRadius: scale(12),
        backgroundColor: colors.primary.main,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacingX._10,
    },
    greetingSection: {
        alignItems: 'flex-start',
    },
    smallGreeting: {
        ...getTextStyle('sm', 'medium', colors.text.secondary),
        marginBottom: spacingY._3,
    },
    nameText: {
        ...getTextStyle('lg', 'extrabold', colors.text.secondary),
        textAlign: 'center',
    },
    cardsRow: {
        flexDirection: 'row',
        gap: spacingX._10,
        marginBottom: spacingY._15,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.background.default,
        padding: spacingX._12,
        borderRadius: 12,
    },
    statLabel: {
        fontSize: scaleFont(12),
        color: colors.text.secondary,
    },
    statValue: {
        fontSize: scaleFont(20),
        fontWeight: '700',
        color: colors.text.primary,
        marginTop: spacingY._5,
    },
    section: {
        marginTop: spacingY._10,
    },
    sectionTitle: {
        ...getTextStyle('md', 'semibold', colors.text.secondary),
        marginBottom: spacingY._10,
    },
    muted: {
        color: colors.text.secondary,
    },
    quickActions: {
        flexDirection: 'row',
        gap: spacingX._10,
    },
    quickActionCard: {
        flex: 1,
        backgroundColor: colors.background.paper,
        padding: spacingX._15,
        borderRadius: 12,
        alignItems: 'center',
        gap: spacingY._7,
        borderWidth: 1,
        borderColor: colors.border?.light || '#e1e5e9',
    },
    quickActionText: {
        ...getTextStyle('sm', 'medium', colors.text.primary),
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacingY._40,
    },
    loadingText: {
        ...getTextStyle('sm', 'medium', colors.text.secondary),
        marginTop: spacingY._15,
    },
    gradeCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: spacingX._20,
        marginBottom: spacingY._20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    gradeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    gradeIconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacingX._20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    gradeInfo: {
        flex: 1,
    },
    gradeLabel: {
        fontSize: scaleFont(13),
        fontWeight: '500',
        color: colors.text.secondary,
        marginBottom: spacingY._5,
        letterSpacing: 0.3,
    },
    gradeValue: {
        fontSize: scaleFont(28),
        fontWeight: '700',
        marginBottom: spacingY._5,
        letterSpacing: 0.5,
    },
    gradeSubtext: {
        fontSize: scaleFont(13),
        fontWeight: '500',
        color: colors.text.secondary,
        letterSpacing: 0.2,
    },
    metricsGrid: {
        gap: spacingY._15,
    },
    metricsRow: {
        flexDirection: 'row',
    },
    errorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacingY._40,
        paddingHorizontal: spacingX._20,
    },
    errorText: {
        ...getTextStyle('md', 'medium', colors.error.main),
        marginTop: spacingY._15,
        marginBottom: spacingY._20,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: colors.primary.main,
        paddingHorizontal: spacingX._30,
        paddingVertical: spacingY._12,
        borderRadius: 12,
    },
    retryButtonText: {
        ...getTextStyle('sm', 'semibold', colors.text.white),
    },
    noDataContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacingY._40,
        paddingHorizontal: spacingX._20,
    },
    noDataText: {
        ...getTextStyle('sm', 'medium', colors.text.secondary),
        marginTop: spacingY._15,
        textAlign: 'center',
    },
});
