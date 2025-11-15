// app/(agent)/parent-details/[id].tsx
import { LogActivityModal } from '@/components/ActionModals/LogActivityModal';
import { BottomModal } from '@/components/BottomModal/BottomModal';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { ScreenView } from '@/components/ScreenView/ScreenView';
import { SearchInput } from '@/components/SearchInput/SearchInput';
import { colors, getTextStyle, spacingX, spacingY } from '@/constants/theme';
import { Child, ParentDetailsData } from '@/models/ParentDetailsInterfaces';
import { ParentInstallmentDto, useGetParentDetails, useGetParentInstallments } from '@/services/userServices';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
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

export default function AgentParentDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const parentId = parseInt(id || '0', 10);

    const getParentDetails = useGetParentDetails();
    const getParentInstallments = useGetParentInstallments();

    const [parentData, setParentData] = useState<ParentDetailsData | null>(null);
    const [installments, setInstallments] = useState<ParentInstallmentDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pagination and filtering state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedChildFilter, setSelectedChildFilter] = useState<number | undefined>(undefined);
    const [showOverdueOnly, setShowOverdueOnly] = useState(false);

    // Modal state
    const [selectedPayment, setSelectedPayment] = useState<ParentInstallmentDto | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLogActivityModalVisible, setIsLogActivityModalVisible] = useState(false);

    // Use ref to track if data has been loaded to prevent infinite loops
    const hasLoadedRef = React.useRef(false);

    const loadData = useCallback(async (refresh = false, page = 1) => {
        if (!parentId) return;

        if (refresh) {
            setIsRefreshing(true);
            setCurrentPage(1);
        } else if (page === 1) {
            setIsLoading(true);
        } else {
            setIsLoadingMore(true);
        }
        setError(null);

        try {
            // Fetch parent details and installments in parallel
            const [detailsResponse, installmentsResponse] = await Promise.all([
                getParentDetails({ parentId }),
                getParentInstallments({
                    parentId,
                    childId: selectedChildFilter,
                    pageNumber: page,
                    pageSize: 10,
                }),
            ]);

            if (detailsResponse.success && detailsResponse.data) {
                setParentData(detailsResponse.data.data);
            } else {
                setError(detailsResponse.error || 'Impossible de charger les détails du parent');
            }

            if (installmentsResponse.success && installmentsResponse.data) {
                const newInstallments = installmentsResponse.data.data || [];
                if (page === 1 || refresh) {
                    setInstallments(newInstallments);
                } else {
                    setInstallments(prev => [...prev, ...newInstallments]);
                }
                setTotalCount(installmentsResponse.data.totalCount);
                setCurrentPage(page);
            }
        } catch {
            setError("Une erreur s'est produite");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
            setIsLoadingMore(false);
        }
    }, [parentId, selectedChildFilter, getParentDetails, getParentInstallments]);

    useEffect(() => {
        // Only load once on mount or when parentId changes
        if (!hasLoadedRef.current && parentId) {
            hasLoadedRef.current = true;
            loadData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parentId]);

    const handleRefresh = () => {
        loadData(true, 1);
    };

    const handleLoadMore = () => {
        const hasMore = installments.length < totalCount;
        if (hasMore && !isLoadingMore) {
            loadData(false, currentPage + 1);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const handleChildFilterChange = (childId: number | undefined) => {
        // Toggle filter: if already selected, deselect it (set to undefined)
        if (selectedChildFilter === childId) {
            setSelectedChildFilter(undefined);
        } else {
            setSelectedChildFilter(childId);
        }
        setCurrentPage(1);
    };

    const toggleOverdueFilter = () => {
        setShowOverdueOnly(!showOverdueOnly);
    };

    const openPaymentModal = (payment: ParentInstallmentDto) => {
        setSelectedPayment(payment);
        setIsModalVisible(true);
    };

    const closePaymentModal = () => {
        setIsModalVisible(false);
        setSelectedPayment(null);
    };

    // Reload data when filters change
    useEffect(() => {
        if (hasLoadedRef.current) {
            loadData(false, 1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedChildFilter]);

    const handleChildPress = (child: Child) => {
        Alert.alert(
            `${child.firstName} ${child.lastName}`,
            `École: ${child.school?.schoolName || 'Non spécifiée'}\nDate de naissance: ${new Date(child.dateOfBirth).toLocaleDateString('fr-FR')}`,
            [{ text: 'OK' }]
        );
    };

    const handleCallParent = () => {
        if (!parentData) return;
        const phoneNumber = `+${parentData.countryCode}${parentData.phoneNumber}`;
        Alert.alert(
            'Appeler le parent',
            `Voulez-vous appeler ${parentData.firstName} ${parentData.lastName} au ${phoneNumber}?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Appeler',
                    onPress: () => {
                        // You can use Linking.openURL(`tel:${phoneNumber}`) here
                        console.log('Call:', phoneNumber);
                    },
                },
            ]
        );
    };

    const renderContactInfo = () => {
        if (!parentData) return null;

        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="person-outline" size={20} color={colors.primary.main} />
                    <Text style={styles.sectionTitle}>Informations de contact</Text>
                </View>
                <View style={styles.card}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Nom complet:</Text>
                        <Text style={styles.value}>
                            {parentData.firstName} {parentData.lastName}
                        </Text>
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Nom du père:</Text>
                        <Text style={styles.value}>{parentData.fatherName}</Text>
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Téléphone:</Text>
                        <TouchableOpacity onPress={handleCallParent}>
                            <Text style={[styles.value, styles.phoneLink]}>
                                +{parentData.countryCode} {parentData.phoneNumber}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Email:</Text>
                        <Text style={styles.value}>{parentData.email || 'Non spécifié'}</Text>
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>ID Civil:</Text>
                        <Text style={styles.value}>{parentData.civilId || 'Non spécifié'}</Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderChildren = () => {
        if (!parentData || !parentData.childrens || parentData.childrens.length === 0) {
            return (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="people-outline" size={20} color={colors.primary.main} />
                        <Text style={styles.sectionTitle}>Enfants</Text>
                    </View>
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>Aucun enfant enregistré</Text>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="people-outline" size={20} color={colors.primary.main} />
                    <Text style={styles.sectionTitle}>
                        Enfants ({parentData.childrens.length})
                    </Text>
                </View>
                {parentData.childrens.map((child) => (
                    <TouchableOpacity
                        key={child.childId}
                        style={styles.childCard}
                        onPress={() => handleChildPress(child)}
                        activeOpacity={0.7}
                    >
                        <View style={{ flex: 1 }}>
                            <Text style={styles.childName}>
                                {child.firstName} {child.lastName}
                            </Text>
                            <View style={styles.childInfo}>
                                <Ionicons name="school-outline" size={14} color={colors.text.secondary} />
                                <Text style={styles.childSchool}>
                                    {child.school?.schoolName || 'École non spécifiée'}
                                </Text>
                            </View>
                            <View style={styles.childInfo}>
                                <Ionicons name="calendar-outline" size={14} color={colors.text.secondary} />
                                <Text style={styles.childSchool}>
                                    Né(e) le {new Date(child.dateOfBirth).toLocaleDateString('fr-FR')}
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const renderFilterSection = () => {
        if (!parentData?.childrens || parentData.childrens.length === 0) return null;

        return (
            <View style={styles.filterSection}>
                <SearchInput
                    searchQuery={searchQuery}
                    onSearch={handleSearch}
                    placeholder="Rechercher un paiement..."
                    showBorder={false}
                    style={styles.searchInput}
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
                    <TouchableOpacity
                        style={[styles.filterChip, !selectedChildFilter && styles.filterChipActive]}
                        onPress={() => handleChildFilterChange(undefined)}
                    >
                        <Text style={[styles.filterChipText, !selectedChildFilter && styles.filterChipTextActive]}>
                            Tous
                        </Text>
                    </TouchableOpacity>
                    {parentData.childrens.map((child) => (
                        <TouchableOpacity
                            key={child.childId}
                            style={[styles.filterChip, selectedChildFilter === child.childId && styles.filterChipActive]}
                            onPress={() => handleChildFilterChange(child.childId)}
                        >
                            <Text style={[styles.filterChipText, selectedChildFilter === child.childId && styles.filterChipTextActive]}>
                                {child.firstName}
                            </Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                        style={[styles.filterChip, showOverdueOnly && styles.filterChipOverdue]}
                        onPress={toggleOverdueFilter}
                    >
                        <Ionicons
                            name="alert-circle"
                            size={16}
                            color={showOverdueOnly ? colors.text.white : colors.error.main}
                        />
                        <Text style={[styles.filterChipText, showOverdueOnly && styles.filterChipTextActive]}>
                            En retard
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        );
    };

    const renderPendingPayments = () => {
        let filteredInstallments = installments.filter(inst => !inst.isPaid);

        // Apply search filter
        if (searchQuery) {
            filteredInstallments = filteredInstallments.filter(inst =>
                inst.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                inst.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
                inst.schoolName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply overdue filter
        if (showOverdueOnly) {
            filteredInstallments = filteredInstallments.filter(inst =>
                new Date(inst.dueDate) < new Date()
            );
        }

        const totalPending = filteredInstallments.reduce((sum, inst) => sum + inst.amount, 0);
        const hasMore = installments.length < totalCount;

        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="wallet-outline" size={20} color={colors.primary.main} />
                    <Text style={styles.sectionTitle}>Paiements en attente</Text>
                </View>

                {renderFilterSection()}

                {filteredInstallments.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="checkmark-circle" size={48} color={colors.success.main} />
                        <Text style={styles.emptyText}>
                            {searchQuery || showOverdueOnly ? 'Aucun résultat trouvé' : 'Aucun paiement en attente'}
                        </Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.paymentSummary}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Total à payer</Text>
                                <Text style={styles.summaryValue}>
                                    {totalPending.toFixed(2)} CFA
                                </Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Nombre de paiements</Text>
                                <Text style={styles.summaryValue}>{filteredInstallments.length}</Text>
                            </View>
                        </View>
                        <View style={styles.paymentsList}>
                            {filteredInstallments.map((installment) => {
                                const isOverdue = new Date(installment.dueDate) < new Date();
                                return (
                                    <TouchableOpacity
                                        key={installment.installmentId}
                                        style={styles.paymentItem}
                                        onPress={() => openPaymentModal(installment)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <View style={styles.paymentHeader}>
                                                <Text style={styles.paymentName}>
                                                    {installment.className || 'Paiement'}
                                                </Text>
                                                {isOverdue && (
                                                    <View style={styles.overdueTag}>
                                                        <Text style={styles.overdueTagText}>En retard</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <View style={styles.paymentInfo}>
                                                <Ionicons name="person-outline" size={14} color={colors.text.secondary} />
                                                <Text style={styles.paymentDate}>
                                                    {installment.childName}
                                                </Text>
                                            </View>
                                            <View style={styles.paymentInfo}>
                                                <Ionicons name="calendar-outline" size={14} color={colors.text.secondary} />
                                                <Text style={styles.paymentDate}>
                                                    Échéance: {new Date(installment.dueDate).toLocaleDateString('fr-FR')}
                                                </Text>
                                            </View>
                                            <View style={styles.paymentInfo}>
                                                <Ionicons name="school-outline" size={14} color={colors.text.secondary} />
                                                <Text style={styles.paymentDate}>
                                                    {installment.schoolName}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                            <Text style={[styles.paymentAmount, isOverdue && styles.overdueAmount]}>
                                                {installment.amount.toFixed(2)} CFA
                                            </Text>
                                            <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {hasMore && (
                            <TouchableOpacity
                                style={styles.loadMoreButton}
                                onPress={handleLoadMore}
                                disabled={isLoadingMore}
                            >
                                {isLoadingMore ? (
                                    <ActivityIndicator size="small" color={colors.primary.main} />
                                ) : (
                                    <>
                                        <Text style={styles.loadMoreText}>Charger plus</Text>
                                        <Ionicons name="chevron-down" size={20} color={colors.primary.main} />
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </>
                )}
            </View>
        );
    };

    const renderPaymentDetailModal = () => {
        if (!selectedPayment) return null;

        const isOverdue = new Date(selectedPayment.dueDate) < new Date();

        return (
            <BottomModal
                visible={isModalVisible}
                onClose={closePaymentModal}
                title="Détails du paiement"
                height="auto"
            >
                <ScrollView showsVerticalScrollIndicator={false} style={styles.modalContent}>
                    <View style={styles.modalSection}>
                        <Text style={styles.modalSectionTitle}>Informations générales</Text>
                        <View style={styles.modalInfoRow}>
                            <Text style={styles.modalLabel}>Enfant:</Text>
                            <Text style={styles.modalValue}>{selectedPayment.childName}</Text>
                        </View>
                        <View style={styles.separator} />
                        <View style={styles.modalInfoRow}>
                            <Text style={styles.modalLabel}>Classe:</Text>
                            <Text style={styles.modalValue}>{selectedPayment.className}</Text>
                        </View>
                        <View style={styles.separator} />
                        <View style={styles.modalInfoRow}>
                            <Text style={styles.modalLabel}>École:</Text>
                            <Text style={styles.modalValue}>{selectedPayment.schoolName}</Text>
                        </View>
                    </View>

                    <View style={styles.modalSection}>
                        <Text style={styles.modalSectionTitle}>Détails financiers</Text>
                        <View style={styles.modalInfoRow}>
                            <Text style={styles.modalLabel}>Montant:</Text>
                            <Text style={[styles.modalValue, styles.modalAmountValue]}>
                                {selectedPayment.amount.toFixed(2)} CFA
                            </Text>
                        </View>
                        {selectedPayment.lateFee && selectedPayment.lateFee > 0 && (
                            <>
                                <View style={styles.separator} />
                                <View style={styles.modalInfoRow}>
                                    <Text style={styles.modalLabel}>Frais de retard:</Text>
                                    <Text style={[styles.modalValue, styles.modalLateFeeValue]}>
                                        {selectedPayment.lateFee.toFixed(2)} CFA
                                    </Text>
                                </View>
                            </>
                        )}
                        <View style={styles.separator} />
                        <View style={styles.modalInfoRow}>
                            <Text style={styles.modalLabel}>Date d&apos;échéance:</Text>
                            <Text style={[styles.modalValue, isOverdue && styles.modalOverdueValue]}>
                                {new Date(selectedPayment.dueDate).toLocaleDateString('fr-FR')}
                            </Text>
                        </View>
                        <View style={styles.separator} />
                        <View style={styles.modalInfoRow}>
                            <Text style={styles.modalLabel}>Statut:</Text>
                            <View style={[styles.statusBadge, isOverdue ? styles.statusBadgeOverdue : styles.statusBadgePending]}>
                                <Text style={styles.statusBadgeText}>
                                    {isOverdue ? 'En retard' : 'En attente'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {isOverdue && (
                        <View style={styles.overdueWarning}>
                            <Ionicons name="alert-circle" size={20} color={colors.error.main} />
                            <Text style={styles.overdueWarningText}>
                                Ce paiement est en retard. Des frais supplémentaires peuvent s&apos;appliquer.
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </BottomModal>
        );
    };

    if (isLoading) {
        return (
            <ScreenView safeArea={true} padding={false}>
                <PageHeader title="Détails du parent" onBack={() => router.back()} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                    <Text style={styles.loadingText}>Chargement...</Text>
                </View>
            </ScreenView>
        );
    }

    if (error) {
        return (
            <ScreenView safeArea={true} padding={false}>
                <PageHeader title="Détails du parent" onBack={() => router.back()} />
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={colors.error.main} />
                    <Text style={styles.errorTitle}>Erreur</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => loadData()}>
                        <Text style={styles.retryButtonText}>Réessayer</Text>
                    </TouchableOpacity>
                </View>
            </ScreenView>
        );
    }

    return (
        <ScreenView safeArea={true} padding={false}>
            <PageHeader
                title="Détails du parent"
                onBack={() => router.back()}
                actions={[
                    {
                        icon: 'create-outline',
                        onPress: () => setIsLogActivityModalVisible(true),
                        color: colors.primary.main,
                    },
                    {
                        icon: 'call-outline',
                        onPress: handleCallParent,
                        color: colors.primary.main,
                    },
                ]}
            />
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
                {renderContactInfo()}
                {renderChildren()}
                {renderPendingPayments()}
            </ScrollView>
            {renderPaymentDetailModal()}
            <LogActivityModal
                visible={isLogActivityModalVisible}
                onClose={() => setIsLogActivityModalVisible(false)}
                parentId={parentId}
                parentName={parentData ? `${parentData.firstName} ${parentData.lastName}` : undefined}
            />
        </ScreenView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.default,
    },
    contentContainer: {
        padding: spacingX._15,
        paddingBottom: spacingY._30,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacingY._30,
    },
    loadingText: {
        ...getTextStyle('sm', 'normal', colors.text.secondary),
        marginTop: spacingY._10,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacingX._30,
    },
    errorTitle: {
        ...getTextStyle('lg', 'bold', colors.error.main),
        marginTop: spacingY._20,
        marginBottom: spacingY._10,
    },
    errorText: {
        ...getTextStyle('sm', 'normal', colors.text.secondary),
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
        ...getTextStyle('sm', 'semibold', colors.text.white),
    },
    section: {
        marginBottom: spacingY._20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacingY._12,
    },
    sectionTitle: {
        ...getTextStyle('base', 'semibold', colors.text.primary),
        marginLeft: spacingX._10,
    },
    card: {
        backgroundColor: colors.background.paper,
        borderRadius: 12,
        padding: spacingX._15,
        borderWidth: 1,
        borderColor: colors.border?.light || '#e1e5e9',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacingY._10,
    },
    label: {
        ...getTextStyle('sm', 'medium', colors.text.secondary),
        flex: 1,
    },
    value: {
        ...getTextStyle('sm', 'normal', colors.text.primary),
        flex: 1,
        textAlign: 'right',
    },
    phoneLink: {
        color: colors.primary.main,
        textDecorationLine: 'underline',
    },
    separator: {
        height: 1,
        backgroundColor: colors.border?.light || '#e1e5e9',
        marginVertical: spacingY._5,
    },
    childCard: {
        backgroundColor: colors.background.paper,
        borderRadius: 12,
        padding: spacingX._15,
        marginBottom: spacingY._10,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border?.light || '#e1e5e9',
    },
    childName: {
        ...getTextStyle('base', 'semibold', colors.text.primary),
        marginBottom: spacingY._5,
    },
    childInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacingY._3,
    },
    childSchool: {
        ...getTextStyle('xs', 'normal', colors.text.secondary),
        marginLeft: spacingX._5,
    },
    emptyState: {
        backgroundColor: colors.background.paper,
        borderRadius: 12,
        padding: spacingY._30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border?.light || '#e1e5e9',
    },
    emptyText: {
        ...getTextStyle('sm', 'normal', colors.text.secondary),
        marginTop: spacingY._10,
    },
    paymentSummary: {
        backgroundColor: colors.background.paper,
        borderRadius: 12,
        padding: spacingX._15,
        marginBottom: spacingY._15,
        borderWidth: 1,
        borderColor: colors.border?.light || '#e1e5e9',
    },
    summaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacingY._10,
    },
    summaryLabel: {
        ...getTextStyle('sm', 'medium', colors.text.secondary),
    },
    summaryValue: {
        ...getTextStyle('base', 'bold', colors.primary.main),
    },
    paymentsList: {
        gap: spacingY._10,
    },
    paymentItem: {
        backgroundColor: colors.background.paper,
        borderRadius: 12,
        padding: spacingX._15,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border?.light || '#e1e5e9',
    },
    paymentName: {
        ...getTextStyle('sm', 'semibold', colors.text.primary),
        marginBottom: spacingY._3,
    },
    paymentDate: {
        ...getTextStyle('xs', 'normal', colors.text.secondary),
    },
    paymentAmount: {
        ...getTextStyle('base', 'bold', colors.text.primary),
    },
    overdueAmount: {
        color: colors.error.main,
    },
    overdueLabel: {
        ...getTextStyle('xs', 'medium', colors.error.main),
        marginTop: spacingY._3,
    },
    morePayments: {
        ...getTextStyle('sm', 'medium', colors.primary.main),
        textAlign: 'center',
        marginTop: spacingY._10,
    },
    filterSection: {
        marginBottom: spacingY._15,
    },
    searchInput: {
        paddingHorizontal: 0,
        paddingVertical: 0,
        marginBottom: spacingY._10,
    },
    filterChips: {
        flexDirection: 'row',
        paddingVertical: spacingY._5,
    },
    filterChip: {
        paddingHorizontal: spacingX._15,
        paddingVertical: spacingY._7,
        borderRadius: 20,
        backgroundColor: colors.background.paper,
        marginRight: spacingX._10,
        borderWidth: 1,
        borderColor: colors.border?.light || '#e1e5e9',
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingX._5,
    },
    filterChipActive: {
        backgroundColor: colors.primary.main,
        borderColor: colors.primary.main,
    },
    filterChipOverdue: {
        backgroundColor: colors.error.main,
        borderColor: colors.error.main,
    },
    filterChipText: {
        ...getTextStyle('sm', 'medium', colors.text.primary),
    },
    filterChipTextActive: {
        color: colors.text.white,
    },
    paymentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacingY._5,
    },
    paymentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacingY._3,
    },
    overdueTag: {
        backgroundColor: colors.error.light,
        paddingHorizontal: spacingX._7,
        paddingVertical: spacingY._3,
        borderRadius: 12,
    },
    overdueTagText: {
        ...getTextStyle('xs', 'medium', colors.text.white),
    },
    loadMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background.paper,
        borderRadius: 12,
        padding: spacingY._15,
        marginTop: spacingY._15,
        borderWidth: 1,
        borderColor: colors.border?.light || '#e1e5e9',
    },
    loadMoreText: {
        ...getTextStyle('sm', 'semibold', colors.primary.main),
        marginRight: spacingX._5,
    },
    modalContent: {
        flex: 1,
    },
    modalSection: {
        marginBottom: spacingY._20,
    },
    modalSectionTitle: {
        ...getTextStyle('base', 'semibold', colors.text.primary),
        marginBottom: spacingY._12,
    },
    modalInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacingY._10,
    },
    modalLabel: {
        ...getTextStyle('sm', 'medium', colors.text.secondary),
        flex: 1,
    },
    modalValue: {
        ...getTextStyle('sm', 'normal', colors.text.primary),
        flex: 1,
        textAlign: 'right',
    },
    modalAmountValue: {
        ...getTextStyle('lg', 'bold', colors.primary.main),
    },
    modalLateFeeValue: {
        ...getTextStyle('base', 'semibold', colors.error.main),
    },
    modalOverdueValue: {
        color: colors.error.main,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: spacingX._12,
        paddingVertical: spacingY._5,
        borderRadius: 16,
    },
    statusBadgePending: {
        backgroundColor: colors.warning?.light || '#FEF3C7',
    },
    statusBadgeOverdue: {
        backgroundColor: colors.error.light,
    },
    statusBadgeText: {
        ...getTextStyle('xs', 'semibold', colors.text.white),
    },
    overdueWarning: {
        flexDirection: 'row',
        backgroundColor: colors.error.light,
        padding: spacingX._15,
        borderRadius: 12,
        marginTop: spacingY._10,
    },
    overdueWarningText: {
        ...getTextStyle('sm', 'normal', colors.text.white),
        marginLeft: spacingX._10,
        flex: 1,
    },
});
