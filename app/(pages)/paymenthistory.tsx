
import { MerchandiseHistoryCard } from '@/components/ListItems/MerchandiseHistoryCard';
import { SchoolFeeHistoryCard } from '@/components/ListItems/SchoolFeeHistoryCard';
import { MerchandiseDetailModal } from '@/components/PaymentDetailModal/MerchandiseDetailModal';
import { SchoolFeeDetailModal } from '@/components/PaymentDetailModal/SchoolFeeDetailModal';
import { ScreenView } from '@/components/ScreenView/ScreenView';
import { colors, radius, shadows, spacingX, spacingY } from '@/constants/theme';
import useUserInfo from '@/hooks/useUserInfo';
import { MerchandisePaymentHistoryDto, SchoolFeesPaymentHistoryDto } from '@/models/PaymentsServicesInterfaces';
import { useGetMerchandisePaymentHistory, useGetSchoolFeesPaymentHistory } from '@/services/paymentServices';
import { generateMerchandisePDF, generateSchoolFeePDF, sharePDF } from '@/utils/pdfExport';
import { scale, scaleFont } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

type DateFilter = 'AllTime' | 'ThisMonth' | 'ThisWeek';
type TabType = 'schoolFees' | 'merchandise';

interface ListItem {
    id: number;
    data: SchoolFeesPaymentHistoryDto | MerchandisePaymentHistoryDto;
}

function PaymentHistory() {
    const router = useRouter();
    const userInfo = useUserInfo();

    // Tab state
    const [activeTab, setActiveTab] = useState<TabType>('schoolFees');

    // Date filter state
    const [dateFilter, setDateFilter] = useState<DateFilter>('ThisMonth');

    // School Fees state
    const [schoolFeePayments, setSchoolFeePayments] = useState<SchoolFeesPaymentHistoryDto[]>([]);
    const [schoolFeePageNumber, setSchoolFeePageNumber] = useState(1);
    const [schoolFeeTotalCount, setSchoolFeeTotalCount] = useState(0);
    const [schoolFeeLoading, setSchoolFeeLoading] = useState(false);
    const [schoolFeeRefreshing, setSchoolFeeRefreshing] = useState(false);
    const [schoolFeeLoadingMore, setSchoolFeeLoadingMore] = useState(false);
    const [selectedSchoolFee, setSelectedSchoolFee] = useState<SchoolFeesPaymentHistoryDto | null>(null);
    const [showSchoolFeeModal, setShowSchoolFeeModal] = useState(false);

    // Merchandise state
    const [merchandisePayments, setMerchandisePayments] = useState<MerchandisePaymentHistoryDto[]>([]);
    const [merchandisePageNumber, setMerchandisePageNumber] = useState(1);
    const [merchandiseTotalCount, setMerchandiseTotalCount] = useState(0);
    const [merchandiseLoading, setMerchandiseLoading] = useState(false);
    const [merchandiseRefreshing, setMerchandiseRefreshing] = useState(false);
    const [merchandiseLoadingMore, setMerchandiseLoadingMore] = useState(false);
    const [selectedMerchandise, setSelectedMerchandise] = useState<MerchandisePaymentHistoryDto | null>(null);
    const [showMerchandiseModal, setShowMerchandiseModal] = useState(false);

    // PDF Export Modal state


    // API hooks
    const getSchoolFeesPaymentHistory = useGetSchoolFeesPaymentHistory();
    const getMerchandisePaymentHistory = useGetMerchandisePaymentHistory();

    // Load School Fees Payment History
    const loadSchoolFeeHistory = useCallback(async (page: number = 1, isRefresh: boolean = false) => {
        if (!userInfo?.id) return;

        if (isRefresh) {
            setSchoolFeeRefreshing(true);
        } else if (page === 1) {
            setSchoolFeeLoading(true);
        } else {
            setSchoolFeeLoadingMore(true);
        }

        try {
            const response = await getSchoolFeesPaymentHistory({
                UserId: userInfo.id,
                DateFilter: dateFilter,
                StatusId: 8,
                PaymentType: 'SCHOOLFEE',
                PageNumber: page,
                PageSize: 10,
            });

            if (response.success && response.data) {
                if (page === 1 || isRefresh) {
                    setSchoolFeePayments(response.data.data || []);
                } else {
                    setSchoolFeePayments(prev => [...prev, ...(response.data?.data || [])]);
                }

                setSchoolFeeTotalCount(response.data.totalCount);
                setSchoolFeePageNumber(page);
            } else {
                console.error('Failed to load school fee history:', response.error);
            }
        } catch (error) {
            console.error('Error loading school fee history:', error);
        } finally {
            setSchoolFeeLoading(false);
            setSchoolFeeRefreshing(false);
            setSchoolFeeLoadingMore(false);
        }
    }, [userInfo?.id, dateFilter]);

    // Load Merchandise Payment History
    const loadMerchandiseHistory = useCallback(async (page: number = 1, isRefresh: boolean = false) => {
        if (!userInfo?.id) return;

        if (isRefresh) {
            setMerchandiseRefreshing(true);
        } else if (page === 1) {
            setMerchandiseLoading(true);
        } else {
            setMerchandiseLoadingMore(true);
        }

        try {
            const response = await getMerchandisePaymentHistory({
                UserId: userInfo.id,
                DateFilter: dateFilter,
                StatusId: 8,
                PaymentType: 'MERCHANDISEFEE',
                PageNumber: page,
                PageSize: 10,
            });

            if (response.success && response.data) {
                if (page === 1 || isRefresh) {
                    setMerchandisePayments(response.data.data || []);
                } else {
                    setMerchandisePayments(prev => [...prev, ...(response.data?.data || [])]);
                }

                setMerchandiseTotalCount(response.data.totalCount);
                setMerchandisePageNumber(page);
            } else {
                console.error('Failed to load merchandise history:', response.error);
            }
        } catch (error) {
            console.error('Error loading merchandise history:', error);
        } finally {
            setMerchandiseLoading(false);
            setMerchandiseRefreshing(false);
            setMerchandiseLoadingMore(false);
        }
    }, [userInfo?.id, dateFilter]);

    // Load data on mount and when filters change
    useEffect(() => {
        if (activeTab === 'schoolFees') {
            loadSchoolFeeHistory(1);
        } else {
            loadMerchandiseHistory(1);
        }
    }, [activeTab, dateFilter]);

    // Handle refresh
    const handleRefresh = useCallback(() => {
        if (activeTab === 'schoolFees') {
            loadSchoolFeeHistory(1, true);
        } else {
            loadMerchandiseHistory(1, true);
        }
    }, [activeTab]);

    // Handle load more
    const handleLoadMore = useCallback(() => {
        if (activeTab === 'schoolFees') {
            if (!schoolFeeLoadingMore && schoolFeePayments.length < schoolFeeTotalCount) {
                loadSchoolFeeHistory(schoolFeePageNumber + 1);
            }
        } else {
            if (!merchandiseLoadingMore && merchandisePayments.length < merchandiseTotalCount) {
                loadMerchandiseHistory(merchandisePageNumber + 1);
            }
        }
    }, [
        activeTab,
        schoolFeeLoadingMore,
        schoolFeePayments.length,
        schoolFeeTotalCount,
        schoolFeePageNumber,
        merchandiseLoadingMore,
        merchandisePayments.length,
        merchandiseTotalCount,
        merchandisePageNumber,
        loadSchoolFeeHistory,
        loadMerchandiseHistory,
    ]);

    // Handle school fee card press
    const handleSchoolFeePress = useCallback((payment: SchoolFeesPaymentHistoryDto) => {
        setSelectedSchoolFee(payment);
        setShowSchoolFeeModal(true);
    }, []);

    // Handle merchandise card press
    const handleMerchandisePress = useCallback((payment: MerchandisePaymentHistoryDto) => {
        setSelectedMerchandise(payment);
        setShowMerchandiseModal(true);
    }, []);

    // Handle PDF export - directly share
    const handleExportSchoolFeePDF = useCallback(async (payment: SchoolFeesPaymentHistoryDto) => {
        try {
            const { uri } = await generateSchoolFeePDF(payment);
            await sharePDF(uri);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    }, []);

    const handleExportMerchandisePDF = useCallback(async (payment: MerchandisePaymentHistoryDto) => {
        try {
            const { uri } = await generateMerchandisePDF(payment);
            await sharePDF(uri);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    }, []);



    // Render filter chip
    const renderFilterChip = (filter: DateFilter, label: string) => {
        const isActive = dateFilter === filter;
        return (
            <TouchableOpacity
                key={filter}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setDateFilter(filter)}
                activeOpacity={0.7}
            >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    // Render school fee item
    const renderSchoolFeeItem = ({ item }: { item: ListItem }) => (
        <SchoolFeeHistoryCard
            payment={item.data as SchoolFeesPaymentHistoryDto}
            onPress={handleSchoolFeePress}
        />
    );

    // Render merchandise item
    const renderMerchandiseItem = ({ item }: { item: ListItem }) => (
        <MerchandiseHistoryCard
            payment={item.data as MerchandisePaymentHistoryDto}
            onPress={handleMerchandisePress}
        />
    );

    // Prepare list data
    const schoolFeeListData: ListItem[] = schoolFeePayments.map(payment => ({
        id: payment.paymentTransactionId,
        data: payment,
    }));

    const merchandiseListData: ListItem[] = merchandisePayments.map(payment => ({
        id: payment.paymentTransactionId,
        data: payment,
    }));

    // Render empty state
    const renderEmptyState = () => {
        const isLoading = activeTab === 'schoolFees' ? schoolFeeLoading : merchandiseLoading;

        if (isLoading) return null;

        return (
            <View style={styles.emptyContainer}>
                <Ionicons
                    name="receipt-outline"
                    size={64}
                    color={colors.text.disabled}
                />
                <Text style={styles.emptyTitle}>Aucun paiement trouvé</Text>
                <Text style={styles.emptySubtitle}>
                    {activeTab === 'schoolFees'
                        ? 'Aucun paiement de frais scolaires pour cette période'
                        : 'Aucun paiement d\'articles scolaires pour cette période'}
                </Text>
            </View>
        );
    };

    // Render footer (loading indicator)
    const renderFooter = () => {
        const isLoadingMore = activeTab === 'schoolFees' ? schoolFeeLoadingMore : merchandiseLoadingMore;

        if (!isLoadingMore) return null;

        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.primary.main} />
            </View>
        );
    };

    if (!userInfo) {
        return (
            <ScreenView safeArea backgroundColor={colors.background.default}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={colors.error.main} />
                    <Text style={styles.errorText}>Veuillez vous connecter</Text>
                </View>
            </ScreenView>
        );
    }

    const isRefreshing = activeTab === 'schoolFees' ? schoolFeeRefreshing : merchandiseRefreshing;
    const isLoading = activeTab === 'schoolFees' ? schoolFeeLoading : merchandiseLoading;

    return (
        <ScreenView safeArea padding={false} paddingVertical={true} backgroundColor={colors.background.default}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                    accessibilityLabel="Retour"
                >
                    <Ionicons name="arrow-back" size={scale(24)} color={colors.text.primary} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Historique des paiements</Text>
                    <Text style={styles.headerSubtitle}>Consultez vos reçus</Text>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'schoolFees' && styles.tabActive]}
                    onPress={() => setActiveTab('schoolFees')}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name="school"
                        size={scale(20)}
                        color={activeTab === 'schoolFees' ? colors.primary.main : colors.text.secondary}
                    />
                    <Text style={[styles.tabText, activeTab === 'schoolFees' && styles.tabTextActive]}>
                        Frais scolaires
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'merchandise' && styles.tabActive]}
                    onPress={() => setActiveTab('merchandise')}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name="cart"
                        size={scale(20)}
                        color={activeTab === 'merchandise' ? colors.primary.main : colors.text.secondary}
                    />
                    <Text style={[styles.tabText, activeTab === 'merchandise' && styles.tabTextActive]}>
                        Articles
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Filter Chips - Only show when not initial loading or when there's data */}
            {(!isLoading || (activeTab === 'schoolFees' ? schoolFeePayments.length > 0 : merchandisePayments.length > 0)) && (
                <View style={styles.filtersContainer}>
                    {renderFilterChip('AllTime', 'Tout')}
                    {renderFilterChip('ThisMonth', 'Ce mois')}
                    {renderFilterChip('ThisWeek', 'Cette semaine')}
                </View>
            )}

            {/* List */}
            {isLoading && (activeTab === 'schoolFees' ? schoolFeePayments.length === 0 : merchandisePayments.length === 0) ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                    <Text style={styles.loadingText}>Chargement...</Text>
                </View>
            ) : (
                <FlatList
                    data={activeTab === 'schoolFees' ? schoolFeeListData : merchandiseListData}
                    renderItem={activeTab === 'schoolFees' ? renderSchoolFeeItem : renderMerchandiseItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={renderEmptyState}
                    ListFooterComponent={renderFooter}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.primary.main}
                            colors={[colors.primary.main]}
                        />
                    }
                />
            )}

            {/* School Fee Detail Modal */}
            <SchoolFeeDetailModal
                visible={showSchoolFeeModal}
                onClose={() => {
                    setShowSchoolFeeModal(false);
                    setSelectedSchoolFee(null);
                }}
                payment={selectedSchoolFee}
                onExportPDF={handleExportSchoolFeePDF}
            />

            {/* Merchandise Detail Modal */}
            <MerchandiseDetailModal
                visible={showMerchandiseModal}
                onClose={() => {
                    setShowMerchandiseModal(false);
                    setSelectedMerchandise(null);
                }}
                payment={selectedMerchandise}
                onExportPDF={handleExportMerchandisePDF}
            />
        </ScreenView>
    );
}

const styles = StyleSheet.create({
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacingX._20,
        paddingVertical: spacingY._15,
        backgroundColor: colors.background.default,
        borderBottomWidth: 1,
        borderBottomColor: colors.border?.light || '#e1e5e9',
    },
    backButton: {
        marginRight: spacingX._15,
        padding: spacingX._5,
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: scaleFont(20),
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: spacingY._3,
    },
    headerSubtitle: {
        fontSize: scaleFont(14),
        color: colors.text.secondary,
    },

    // Tabs
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacingX._20,
        paddingTop: spacingY._15,
        gap: spacingX._10,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacingX._7,
        paddingVertical: spacingY._12,
        borderRadius: radius._12,
        backgroundColor: colors.background.paper,
        borderWidth: 1,
        borderColor: colors.border?.light || '#e1e5e9',
    },
    tabActive: {
        backgroundColor: colors.primary.light + '20',
        borderColor: colors.primary.main,
    },
    tabText: {
        fontSize: scaleFont(14),
        fontWeight: '500',
        color: colors.text.secondary,
    },
    tabTextActive: {
        color: colors.primary.main,
        fontWeight: '700',
    },

    // Filters
    filtersContainer: {
        flexDirection: 'row',
        backgroundColor: colors.background.paper,
        borderRadius: radius._12,
        padding: spacingX._4,
        marginHorizontal: spacingX._20,
        marginTop: spacingY._10,
        marginBottom: spacingY._5,
        borderWidth: 1,
        borderColor: colors.border?.light || '#e1e5e9',
        ...shadows.xs,
    },
    filterChip: {
        flex: 1,
        paddingVertical: spacingY._8,
        borderRadius: radius._10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterChipActive: {
        backgroundColor: colors.primary.main,
        ...shadows.sm,
    },
    filterChipText: {
        fontSize: scaleFont(13),
        fontWeight: '600',
        color: colors.text.secondary,
    },
    filterChipTextActive: {
        color: colors.text.white,
        fontWeight: '700',
    },

    // List
    listContainer: {
        paddingHorizontal: spacingX._20,
        paddingTop: spacingY._15,
        paddingBottom: spacingY._20,
        gap: spacingY._15,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacingY._40,
    },
    loadingText: {
        fontSize: scaleFont(14),
        color: colors.text.secondary,
        marginTop: spacingY._10,
    },
    footerLoader: {
        paddingVertical: spacingY._15,
        alignItems: 'center',
    },

    // Empty state
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacingY._40,
        paddingHorizontal: spacingX._30,
    },
    emptyTitle: {
        fontSize: scaleFont(18),
        fontWeight: '700',
        color: colors.text.primary,
        marginTop: spacingY._15,
        marginBottom: spacingY._7,
    },
    emptySubtitle: {
        fontSize: scaleFont(14),
        color: colors.text.secondary,
        textAlign: 'center',
        lineHeight: scaleFont(20),
    },

    // Error state
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
        marginTop: spacingY._15,
    },
});

export default PaymentHistory;