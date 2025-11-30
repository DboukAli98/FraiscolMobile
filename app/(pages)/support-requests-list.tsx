import { BottomModal } from '@/components/BottomModal/BottomModal';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { ScreenView } from '@/components/ScreenView/ScreenView';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { useParentProfile } from '@/hooks/useParentProfile';
import { useSchoolsData } from '@/hooks/useSchoolsData';
import {
    GetAllSupportRequestsParams,
    SupportRequest,
    SupportRequestDirection,
    SupportRequestStatus,
} from '@/models/SupportRequestInterfaces';
import { useGetParentsCollectingAgents } from '@/services/collectingAgentServices';
import { useGetAllSupportRequests } from '@/services/supportRequestServices';
import { scaleFont } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SupportRequestsListScreen() {
    const { parentData } = useParentProfile();
    const getAllSupportRequests = useGetAllSupportRequests();
    const getParentsCollectingAgents = useGetParentsCollectingAgents();
    const { schools } = useSchoolsData();

    const [requests, setRequests] = useState<SupportRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    // Tab state
    const [activeTab, setActiveTab] = useState<string>(SupportRequestDirection.PARENT_TO_DIRECTOR);

    // Filter states
    const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
    const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
    const [selectedRequestType, setSelectedRequestType] = useState<number | null>(null);
    const [agents, setAgents] = useState<any[]>([]);
    const [showFilterModal, setShowFilterModal] = useState(false);

    // Fetch agents for filter
    useEffect(() => {
        const fetchAgents = async () => {
            if (parentData?.parentId) {
                try {
                    const response = await getParentsCollectingAgents({
                        parentId: parentData.parentId,
                        pageNumber: 1,
                        pageSize: 100,
                    });

                    if (response.success && response.data?.data) {
                        const agentsList = response.data.data
                            .filter((item: any) => item.isActive)
                            .map((item: any) => item.collectingAgent);
                        setAgents(agentsList);
                    }
                } catch (error) {
                    console.error('Error fetching agents:', error);
                }
            }
        };

        fetchAgents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parentData?.parentId]);

    const fetchRequests = useCallback(
        async (page: number = 1, isRefresh: boolean = false) => {
            if (!parentData?.parentId) return;

            if (isRefresh) {
                setIsRefreshing(true);
            } else if (page > 1) {
                setIsLoadingMore(true);
            } else {
                setIsLoading(true);
            }

            try {
                const params: GetAllSupportRequestsParams = {
                    Source: activeTab,
                    PageNumber: page,
                    PageSize: 10,
                    SchoolId: selectedSchoolId || undefined,
                    AgentId: selectedAgentId || undefined,
                    SupportRequestType: selectedRequestType !== null ? selectedRequestType as any : undefined,
                };

                const response = await getAllSupportRequests(params);

                if (response.success && response.data?.data) {
                    const newRequests = response.data.data;

                    if (isRefresh || page === 1) {
                        setRequests(newRequests);
                    } else {
                        setRequests((prev) => [...prev, ...newRequests]);
                    }

                    setTotalCount(response.data.totalCount);
                    setCurrentPage(page);
                    setHasMore(newRequests.length === 10);
                }
            } catch (err: any) {
                console.error('Error fetching support requests:', err);
            } finally {
                setIsLoading(false);
                setIsRefreshing(false);
                setIsLoadingMore(false);
            }
        },
        [parentData?.parentId, getAllSupportRequests, activeTab, selectedSchoolId, selectedAgentId, selectedRequestType]
    );

    useEffect(() => {
        if (parentData?.parentId) {
            fetchRequests(1);
        }
    }, [parentData?.parentId, fetchRequests, activeTab, selectedSchoolId, selectedAgentId, selectedRequestType]);

    const handleRefresh = () => {
        fetchRequests(1, true);
    };

    const handleLoadMore = () => {
        if (!isLoadingMore && hasMore) {
            fetchRequests(currentPage + 1);
        }
    };

    const handleBack = () => {
        router.back();
    };

    const handleNewRequest = () => {
        router.push('/(pages)/support-request');
    };

    const getStatusColor = (statusId: number) => {
        switch (statusId) {
            case SupportRequestStatus.RESOLVED:
                return colors.success.main;
            case SupportRequestStatus.PENDING:
                return colors.warning.main;
            case SupportRequestStatus.IN_PROGRESS:
                return colors.info.main;
            case SupportRequestStatus.STALL:
                return colors.error.main;
            case SupportRequestStatus.CANCELLED:
                return colors.text.secondary;
            default:
                return colors.text.secondary;
        }
    };

    const getStatusName = (statusId: number) => {
        switch (statusId) {
            case SupportRequestStatus.RESOLVED:
                return 'Résolu';
            case SupportRequestStatus.PENDING:
                return 'En attente';
            case SupportRequestStatus.IN_PROGRESS:
                return 'En cours';
            case SupportRequestStatus.STALL:
                return 'Bloqué';
            case SupportRequestStatus.CANCELLED:
                return 'Annulé';
            default:
                return 'Inconnu';
        }
    };

    const getStatusIcon = (statusId: number): keyof typeof Ionicons.glyphMap => {
        switch (statusId) {
            case SupportRequestStatus.RESOLVED:
                return 'checkmark-circle';
            case SupportRequestStatus.PENDING:
                return 'time';
            case SupportRequestStatus.IN_PROGRESS:
                return 'sync';
            case SupportRequestStatus.STALL:
                return 'pause-circle';
            case SupportRequestStatus.CANCELLED:
                return 'close-circle';
            default:
                return 'help-circle';
        }
    };

    const getPriorityColor = (priority: number) => {
        switch (priority) {
            case 3: // Urgent
                return colors.error.main;
            case 2: // High
                return colors.warning.main;
            case 1: // Medium
                return colors.info.main;
            case 0: // Low
                return colors.text.secondary;
            default:
                return colors.text.secondary;
        }
    };

    const getPriorityLabel = (priority: number) => {
        switch (priority) {
            case 3:
                return 'Urgent';
            case 2:
                return 'Haute';
            case 1:
                return 'Moyenne';
            case 0:
                return 'Basse';
            default:
                return 'Inconnue';
        }
    };

    const getTypeIcon = (type: number): keyof typeof Ionicons.glyphMap => {
        switch (type) {
            case 1: // Payment
                return 'card';
            case 2: // Help
                return 'help-buoy';
            case 0: // General
            default:
                return 'document-text';
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Date inconnue';

        // Ensure the date string is treated as UTC
        let dateStr = dateString;
        if (!dateStr.endsWith('Z') && !dateStr.includes('+') && !dateStr.includes('T')) {
            dateStr = dateStr + 'Z';
        } else if (dateStr.includes('T') && !dateStr.endsWith('Z') && !dateStr.includes('+')) {
            dateStr = dateStr + 'Z';
        }

        const date = new Date(dateStr);

        // Check if date is valid
        if (isNaN(date.getTime())) {
            return 'Date invalide';
        }

        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const hasActiveFilters = selectedSchoolId !== null || selectedAgentId !== null || selectedRequestType !== null;

    const resetFilters = () => {
        setSelectedSchoolId(null);
        setSelectedAgentId(null);
        setSelectedRequestType(null);
    };

    const renderRequestCard = ({ item }: { item: SupportRequest }) => {
        const statusColor = getStatusColor(item.fK_StatusId);
        const priorityColor = getPriorityColor(item.priority);

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => router.push(`/(pages)/support-request-detail?id=${item.supportRequestId}`)}
            >
                {/* Header */}
                <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                        <View
                            style={[
                                styles.typeIcon,
                                { backgroundColor: `${colors.primary.main}15` },
                            ]}
                        >
                            <Ionicons
                                name={getTypeIcon(item.supportRequestType)}
                                size={20}
                                color={colors.primary.main}
                            />
                        </View>
                        <View style={styles.cardHeaderText}>
                            <Text style={styles.cardTitle} numberOfLines={1}>
                                {item.title}
                            </Text>
                            <Text style={styles.cardSchool} numberOfLines={1}>
                                {item.school?.schoolName || 'École'}
                            </Text>
                        </View>
                    </View>

                    {/* Priority Badge */}
                    <View
                        style={[
                            styles.priorityBadge,
                            { backgroundColor: `${priorityColor}15` },
                        ]}
                    >
                        <Text style={[styles.priorityText, { color: priorityColor }]}>
                            {getPriorityLabel(item.priority)}
                        </Text>
                    </View>
                </View>

                {/* Description */}
                <Text style={styles.cardDescription} numberOfLines={2}>
                    {item.description}
                </Text>

                {/* Footer */}
                <View style={styles.cardFooter}>
                    <View style={styles.cardFooterLeft}>
                        <Ionicons
                            name={getStatusIcon(item.fK_StatusId)}
                            size={16}
                            color={statusColor}
                        />
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {getStatusName(item.fK_StatusId)}
                        </Text>
                    </View>

                    <Text style={styles.dateText}>{item.createdOn ? formatDate(item.createdOn) : 'Date inconnue'}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Ionicons name="file-tray-outline" size={64} color={colors.text.secondary} />
            </View>
            <Text style={styles.emptyTitle}>Aucune demande</Text>
            <Text style={styles.emptySubtitle}>
                Vous n&apos;avez pas encore créé de demande d&apos;assistance
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleNewRequest}>
                <Ionicons name="add-circle" size={20} color={colors.text.white} />
                <Text style={styles.emptyButtonText}>Créer une demande</Text>
            </TouchableOpacity>
        </View>
    );

    const renderFooter = () => {
        if (!isLoadingMore) return null;

        return (
            <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color={colors.primary.main} />
            </View>
        );
    };

    if (isLoading && requests.length === 0) {
        return (
            <ScreenView safeArea backgroundColor={colors.background.default}>
                <PageHeader title="Mes demandes" onBack={handleBack} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                </View>
            </ScreenView>
        );
    }

    const renderTabs = () => (
        <View style={styles.tabsContainer}>
            <TouchableOpacity
                style={[
                    styles.tab,
                    activeTab === SupportRequestDirection.PARENT_TO_DIRECTOR && styles.activeTab,
                ]}
                onPress={() => setActiveTab(SupportRequestDirection.PARENT_TO_DIRECTOR)}
            >
                <Text
                    style={[
                        styles.tabText,
                        activeTab === SupportRequestDirection.PARENT_TO_DIRECTOR && styles.activeTabText,
                    ]}
                >
                    Au Directeur
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                    styles.tab,
                    activeTab === SupportRequestDirection.PARENT_TO_AGENT && styles.activeTab,
                ]}
                onPress={() => setActiveTab(SupportRequestDirection.PARENT_TO_AGENT)}
            >
                <Text
                    style={[
                        styles.tabText,
                        activeTab === SupportRequestDirection.PARENT_TO_AGENT && styles.activeTabText,
                    ]}
                >
                    Aux Agents
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderFilterChips = () => (
        <View style={styles.filterChipsContainer}>
            {/* School Filter Section */}
            <View style={styles.filterSection}>
                <View style={styles.filterSectionHeader}>
                    <Ionicons name="school" size={18} color={colors.primary.main} />
                    <Text style={styles.filterSectionTitle}>École</Text>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipsRow}
                >
                    <TouchableOpacity
                        style={[styles.filterChip, !selectedSchoolId && styles.filterChipActive]}
                        onPress={() => setSelectedSchoolId(null)}
                    >
                        <Text
                            style={[
                                styles.filterChipText,
                                !selectedSchoolId && styles.filterChipTextActive,
                            ]}
                        >
                            Toutes
                        </Text>
                    </TouchableOpacity>
                    {schools.map((school) => (
                        <TouchableOpacity
                            key={school.schoolId}
                            style={[
                                styles.filterChip,
                                selectedSchoolId === school.schoolId && styles.filterChipActive,
                            ]}
                            onPress={() => setSelectedSchoolId(school.schoolId)}
                        >
                            <Text
                                style={[
                                    styles.filterChipText,
                                    selectedSchoolId === school.schoolId && styles.filterChipTextActive,
                                ]}
                                numberOfLines={1}
                            >
                                {school.schoolName}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Agent Filter Section - Only show for PARENT_TO_AGENT tab */}
            {activeTab === SupportRequestDirection.PARENT_TO_AGENT && agents.length > 0 && (
                <View style={styles.filterSection}>
                    <View style={styles.filterSectionHeader}>
                        <Ionicons name="person" size={18} color={colors.primary.main} />
                        <Text style={styles.filterSectionTitle}>Agent de collecte</Text>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.chipsRow}
                    >
                        <TouchableOpacity
                            style={[styles.filterChip, !selectedAgentId && styles.filterChipActive]}
                            onPress={() => setSelectedAgentId(null)}
                        >
                            <Text
                                style={[
                                    styles.filterChipText,
                                    !selectedAgentId && styles.filterChipTextActive,
                                ]}
                            >
                                Tous
                            </Text>
                        </TouchableOpacity>
                        {agents.map((agent) => (
                            <TouchableOpacity
                                key={agent.collectingAgentId}
                                style={[
                                    styles.filterChip,
                                    selectedAgentId === agent.collectingAgentId && styles.filterChipActive,
                                ]}
                                onPress={() => setSelectedAgentId(agent.collectingAgentId)}
                            >
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        selectedAgentId === agent.collectingAgentId &&
                                        styles.filterChipTextActive,
                                    ]}
                                    numberOfLines={1}
                                >
                                    {agent.firstName} {agent.lastName}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Request Type Filter Section */}
            <View style={styles.filterSection}>
                <View style={styles.filterSectionHeader}>
                    <Ionicons name="document-text" size={18} color={colors.primary.main} />
                    <Text style={styles.filterSectionTitle}>Type de demande</Text>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipsRow}
                >
                    <TouchableOpacity
                        style={[styles.filterChip, selectedRequestType === null && styles.filterChipActive]}
                        onPress={() => setSelectedRequestType(null)}
                    >
                        <Text
                            style={[
                                styles.filterChipText,
                                selectedRequestType === null && styles.filterChipTextActive,
                            ]}
                        >
                            Tous
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, selectedRequestType === 0 && styles.filterChipActive]}
                        onPress={() => setSelectedRequestType(0)}
                    >
                        <Text
                            style={[
                                styles.filterChipText,
                                selectedRequestType === 0 && styles.filterChipTextActive,
                            ]}
                        >
                            Général
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, selectedRequestType === 1 && styles.filterChipActive]}
                        onPress={() => setSelectedRequestType(1)}
                    >
                        <Text
                            style={[
                                styles.filterChipText,
                                selectedRequestType === 1 && styles.filterChipTextActive,
                            ]}
                        >
                            Paiement
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, selectedRequestType === 2 && styles.filterChipActive]}
                        onPress={() => setSelectedRequestType(2)}
                    >
                        <Text
                            style={[
                                styles.filterChipText,
                                selectedRequestType === 2 && styles.filterChipTextActive,
                            ]}
                        >
                            Aide
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </View>
    );

    return (
        <ScreenView safeArea padding={false} backgroundColor={colors.background.default}>
            <PageHeader
                title="Mes demandes"
                onBack={handleBack}
                actions={[
                    {
                        icon: 'filter',
                        onPress: () => setShowFilterModal(true),
                        color: (selectedSchoolId || selectedAgentId || selectedRequestType !== null)
                            ? colors.primary.main
                            : colors.text.primary,
                    },
                ]}
            />

            {/* Tabs */}
            {renderTabs()}

            {/* Stats Header */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{totalCount}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.warning.main }]}>
                        {
                            requests.filter((r) => r.fK_StatusId === SupportRequestStatus.PENDING)
                                .length
                        }
                    </Text>
                    <Text style={styles.statLabel}>En attente</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.success.main }]}>
                        {
                            requests.filter((r) => r.fK_StatusId === SupportRequestStatus.RESOLVED)
                                .length
                        }
                    </Text>
                    <Text style={styles.statLabel}>Résolus</Text>
                </View>
            </View>

            <FlatList
                data={requests}
                renderItem={renderRequestCard}
                keyExtractor={(item) => item.supportRequestId.toString()}
                contentContainerStyle={[
                    styles.listContainer,
                    requests.length === 0 && styles.emptyListContainer,
                ]}
                ListEmptyComponent={renderEmptyState}
                ListFooterComponent={renderFooter}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.primary.main}
                        colors={[colors.primary.main]}
                    />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={false}
            />

            {/* FAB */}
            <TouchableOpacity style={styles.fab} onPress={handleNewRequest} activeOpacity={0.8}>
                <Ionicons name="add" size={28} color={colors.text.white} />
            </TouchableOpacity>

            {/* Filter Modal */}
            <BottomModal
                visible={showFilterModal}
                onClose={() => setShowFilterModal(false)}
                title="Filtrer les demandes"
            >
                <View style={styles.filterModalContent}>
                    {renderFilterChips()}
                    <View style={styles.filterModalActions}>
                        {hasActiveFilters && (
                            <TouchableOpacity
                                style={styles.resetFilterButton}
                                onPress={resetFilters}
                            >
                                <Ionicons name="refresh" size={18} color={colors.text.secondary} />
                                <Text style={styles.resetFilterButtonText}>Réinitialiser</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.applyFilterButton, !hasActiveFilters && styles.applyFilterButtonFull]}
                            onPress={() => setShowFilterModal(false)}
                        >
                            <Text style={styles.applyFilterButtonText}>Appliquer les filtres</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </BottomModal>
        </ScreenView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: colors.background.paper,
        borderBottomWidth: 1,
        borderBottomColor: colors.border?.light || '#E5E7EB',
    },
    tab: {
        flex: 1,
        paddingVertical: spacingY._15,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: colors.primary.main,
    },
    tabText: {
        fontSize: scaleFont(14),
        fontWeight: '600',
        color: colors.text.secondary,
    },
    activeTabText: {
        color: colors.primary.main,
    },
    filterChipsContainer: {
        gap: spacingY._15,
    },
    filterSection: {
        gap: spacingY._7,
    },
    filterSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingX._7,
        paddingHorizontal: spacingX._15,
    },
    filterSectionTitle: {
        fontSize: scaleFont(14),
        fontWeight: '600',
        color: colors.text.primary,
    },
    chipsRow: {
        paddingHorizontal: spacingX._15,
        gap: spacingX._7,
    },
    filterChip: {
        paddingHorizontal: spacingX._15,
        paddingVertical: spacingY._7,
        borderRadius: 20,
        backgroundColor: colors.background.paper,
        borderWidth: 1,
        borderColor: colors.border?.light || '#E5E7EB',
    },
    filterChipActive: {
        backgroundColor: colors.primary.main,
        borderColor: colors.primary.main,
    },
    filterChipText: {
        fontSize: scaleFont(13),
        color: colors.text.primary,
        fontWeight: '500',
    },
    filterChipTextActive: {
        color: colors.text.white,
    },
    filterModalContent: {
        padding: spacingX._20,
        paddingBottom: spacingY._30,
    },
    filterModalActions: {
        flexDirection: 'row',
        gap: spacingX._10,
        marginTop: spacingY._20,
    },
    resetFilterButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacingX._5,
        backgroundColor: colors.background.default,
        paddingVertical: spacingY._12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border?.light || '#E5E7EB',
    },
    resetFilterButtonText: {
        fontSize: scaleFont(14),
        fontWeight: '600',
        color: colors.text.secondary,
    },
    applyFilterButton: {
        flex: 1,
        backgroundColor: colors.primary.main,
        paddingVertical: spacingY._12,
        borderRadius: 12,
        alignItems: 'center',
    },
    applyFilterButtonFull: {
        flex: 1,
    },
    applyFilterButtonText: {
        fontSize: scaleFont(15),
        fontWeight: '600',
        color: colors.text.white,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: colors.background.paper,
        paddingVertical: spacingY._20,
        paddingHorizontal: spacingX._20,
        marginBottom: spacingY._10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border?.light || '#E5E7EB',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: scaleFont(24),
        fontWeight: '700',
        color: colors.primary.main,
        marginBottom: spacingY._3,
    },
    statLabel: {
        fontSize: scaleFont(12),
        color: colors.text.secondary,
        fontWeight: '500',
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: colors.border?.light || '#E5E7EB',
    },
    listContainer: {
        padding: spacingX._15,
        paddingBottom: spacingY._80,
    },
    emptyListContainer: {
        flexGrow: 1,
    },
    card: {
        backgroundColor: colors.background.paper,
        borderRadius: 16,
        padding: spacingX._15,
        marginBottom: spacingY._15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: colors.border?.light || '#E5E7EB',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacingY._12,
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: spacingX._10,
    },
    typeIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacingX._12,
    },
    cardHeaderText: {
        flex: 1,
    },
    cardTitle: {
        fontSize: scaleFont(16),
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacingY._3,
    },
    cardSchool: {
        fontSize: scaleFont(13),
        color: colors.text.secondary,
    },
    priorityBadge: {
        paddingHorizontal: spacingX._10,
        paddingVertical: spacingY._5,
        borderRadius: 12,
    },
    priorityText: {
        fontSize: scaleFont(11),
        fontWeight: '600',
    },
    cardDescription: {
        fontSize: scaleFont(14),
        color: colors.text.secondary,
        lineHeight: scaleFont(20),
        marginBottom: spacingY._12,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: spacingY._12,
        borderTopWidth: 1,
        borderTopColor: colors.border?.light || '#E5E7EB',
    },
    cardFooterLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        fontSize: scaleFont(13),
        fontWeight: '600',
        marginLeft: spacingX._5,
    },
    dateText: {
        fontSize: scaleFont(12),
        color: colors.text.secondary,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacingX._30,
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.background.default,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacingY._20,
    },
    emptyTitle: {
        fontSize: scaleFont(20),
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: spacingY._10,
    },
    emptySubtitle: {
        fontSize: scaleFont(14),
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: spacingY._25,
        lineHeight: scaleFont(20),
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary.main,
        paddingHorizontal: spacingX._20,
        paddingVertical: spacingY._12,
        borderRadius: 12,
        gap: spacingX._7,
    },
    emptyButtonText: {
        fontSize: scaleFont(15),
        fontWeight: '600',
        color: colors.text.white,
    },
    loadingFooter: {
        paddingVertical: spacingY._20,
        alignItems: 'center',
    },
    fab: {
        position: 'absolute',
        right: spacingX._20,
        bottom: spacingY._20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary.main,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary.main,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
});
