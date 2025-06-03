// app/(tabs)/payments.tsx - COMPLETELY FIXED VERSION
import { BottomModal } from '@/components/BottomModal/BottomModal';
import { PrimaryButton, SecondaryButton } from '@/components/Button/CustomPressable';
import { Card, CardBody } from '@/components/Card/CardComponent';
import { InfiniteList } from '@/components/InfiniteList/InfiniteList';
import { PaymentItem } from '@/components/ListItems/PaymentItem';
import { ScreenView } from '@/components/ScreenView/ScreenView';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { usePaymentsData } from '@/hooks/usePaymentsData';
import useUserInfo from '@/hooks/useUserInfo';
import {
  FilterOption,
  ParentInstallmentDto,
  useGetChildrenForFilter,
  useGetGradeSectionsForFilter,
  useGetSchoolsForFilter
} from '@/services/userServices';
import { scale, scaleFont } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface FiltersState {
  childId?: number;
  schoolId?: number;
  gradeSectionId?: number;
}

interface PaymentListItem extends ParentInstallmentDto {
  id: string | number;
}

const PaymentsScreen: React.FC = () => {
  const userInfo = useUserInfo();

  // Filter states
  const [filters, setFilters] = useState<FiltersState>({});
  const [tempFilters, setTempFilters] = useState<FiltersState>({});
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Filter options
  const [childrenOptions, setChildrenOptions] = useState<FilterOption[]>([]);
  const [schoolOptions, setSchoolOptions] = useState<FilterOption[]>([]);
  const [gradeSectionOptions, setGradeSectionOptions] = useState<FilterOption[]>([]);
  const [loadingFilterOptions, setLoadingFilterOptions] = useState(false);
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [showChildPicker, setShowChildPicker] = useState(false);
  const [showSchoolPicker, setShowSchoolPicker] = useState(false);
  const [showGradePicker, setShowGradePicker] = useState(false);

  // API hooks
  const getChildrenForFilter = useGetChildrenForFilter();
  const getSchoolsForFilter = useGetSchoolsForFilter();
  const getGradeSectionsForFilter = useGetGradeSectionsForFilter();

  // Payments data hook
  const {
    installments,
    isLoading,
    isLoadingMore,
    isRefreshing,
    hasNextPage,
    totalCount,
    error,
    loadMore,
    refresh,
    applyFilters,
    retry,
    totalToPay,
    totalPaid,
    totalOverdue,
    paidCount,
    overdueCount,
  } = usePaymentsData({
    pageSize: 15,
    filters,
  });

  // Prepare list data
  const listData: PaymentListItem[] = useMemo(() =>
    installments.map(installment => ({
      ...installment,
      id: installment.installmentId,
    })), [installments]
  );

  const loadFilterOptions = useCallback(async () => {
    if (!userInfo?.parentId || loadingFilterOptions) return;

    setLoadingFilterOptions(true);
    try {
      const parentId = parseInt(userInfo.parentId);

      console.log('📋 Loading filter options for parent:', parentId);

      const [childrenResponse, schoolsResponse, gradeSectionsResponse] = await Promise.all([
        getChildrenForFilter(parentId),
        getSchoolsForFilter(parentId),
        getGradeSectionsForFilter(parentId),
      ]);

      console.log('📋 Filter responses:', {
        children: childrenResponse.success ? childrenResponse.data?.length : 'failed',
        schools: schoolsResponse.success ? schoolsResponse.data?.length : 'failed',
        gradeSections: gradeSectionsResponse.success ? gradeSectionsResponse.data?.length : 'failed',
      });

      if (childrenResponse.success && childrenResponse.data) {
        setChildrenOptions(childrenResponse.data);
      }

      if (schoolsResponse.success && schoolsResponse.data) {
        setSchoolOptions(schoolsResponse.data);
      }

      if (gradeSectionsResponse.success && gradeSectionsResponse.data) {
        setGradeSectionOptions(gradeSectionsResponse.data);
      }

      setFiltersLoaded(true);
    } catch (err) {
      console.error('Failed to load filter options:', err);
    } finally {
      setLoadingFilterOptions(false);
    }
  }, [userInfo?.parentId, getChildrenForFilter, getSchoolsForFilter, getGradeSectionsForFilter, loadingFilterOptions]);


  // Format currency
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'CFA',
      minimumFractionDigits: 0,
    }).format(amount);
  }, []);

  // Render payment item
  const renderPaymentItem = useCallback(
    ({ item }: { item: PaymentListItem }) => (
      <PaymentItem
        installment={item}
        onPress={handlePaymentPress}
        onPay={handlePaymentPay}
        showActions={true}
      />
    ),
    []
  );

  // Event handlers
  const handlePaymentPress = useCallback((installment: ParentInstallmentDto) => {
    Alert.alert(
      'Détails du paiement',
      `Installment ID: ${installment.installmentId}\nEnfant: ${installment.childName}\nMontant: ${formatCurrency(installment.amount)}`,
      [{ text: 'OK' }]
    );
  }, [formatCurrency]);

  const handlePaymentPay = useCallback((installment: ParentInstallmentDto) => {
    Alert.alert(
      'Payer maintenant',
      `Payer ${formatCurrency(installment.amount)} pour ${installment.childName}?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Payer',
          onPress: () => {
            console.log('Payment initiated for:', installment.installmentId);
            // Implement payment logic here
          }
        }
      ]
    );
  }, [formatCurrency]);

  const handleOpenFilterModal = useCallback(() => {
    setTempFilters(filters);
    setShowFilterModal(true);

    // Always (re)load filter options on each click
    console.log('📋 Filter modal opened, loading options...');
    loadFilterOptions();
  }, [filters, loadFilterOptions]);

  const handleApplyFilters = useCallback(() => {
    setFilters(tempFilters);
    applyFilters(tempFilters);
    setShowFilterModal(false);
  }, [tempFilters, applyFilters]);

  const handleClearFilters = useCallback(() => {
    const clearedFilters = {};
    setTempFilters(clearedFilters);
    setFilters(clearedFilters);
    applyFilters(clearedFilters);
    setShowFilterModal(false);
  }, [applyFilters]);

  const handleCloseFilterModal = useCallback(() => {
    setTempFilters(filters);
    setShowFilterModal(false);
  }, [filters]);

  // Add these handler functions
  const handleChildSelect = useCallback((childId: number | undefined) => {
    setTempFilters(prev => ({ ...prev, childId }));
    setShowChildPicker(false);
  }, []);

  const handleSchoolSelect = useCallback((schoolId: number | undefined) => {
    setTempFilters(prev => ({
      ...prev,
      schoolId,
      // Reset grade section when school changes
      gradeSectionId: undefined
    }));
    setShowSchoolPicker(false);
  }, []);

  const handleGradeSelect = useCallback((gradeId: number | undefined) => {
    setTempFilters(prev => ({ ...prev, gradeSectionId: gradeId }));
    setShowGradePicker(false);
  }, []);
  // Key extractor
  const keyExtractor = useCallback((item: PaymentListItem) =>
    item.installmentId.toString(),
    []);

  // Get active filters text
  const getActiveFiltersText = useMemo(() => {
    const activeFilters = [];

    if (filters.childId) {
      const child = childrenOptions.find(c => c.id === filters.childId);
      if (child) activeFilters.push(child.name);
    }

    if (filters.schoolId) {
      const school = schoolOptions.find(s => s.id === filters.schoolId);
      if (school) activeFilters.push(school.name);
    }

    if (filters.gradeSectionId) {
      const gradeSection = gradeSectionOptions.find(gs => gs.id === filters.gradeSectionId);
      if (gradeSection) activeFilters.push(gradeSection.name);
    }

    return activeFilters.join(', ');
  }, [filters, childrenOptions, schoolOptions, gradeSectionOptions]);

  // List header component
  const ListHeaderComponent = useMemo(() => (
    <View style={styles.listHeader}>
      {/* Summary Cards */}
      <View style={styles.summaryCardsContainer}>
        <Card style={styles.summaryCard} padding="_12">
          <CardBody style={styles.summaryCardBody}>
            <View style={styles.summaryIconContainer}>
              <Ionicons name="wallet-outline" size={scale(20)} color={colors.error.main} />
            </View>
            <View style={styles.summaryTextContainer}>
              <Text style={styles.summaryLabel}>À payer</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totalToPay)}</Text>
            </View>
          </CardBody>
        </Card>

        <Card style={styles.summaryCard} padding="_12">
          <CardBody style={styles.summaryCardBody}>
            <View style={styles.summaryIconContainer}>
              <Ionicons name="checkmark-circle-outline" size={scale(20)} color={colors.success.main} />
            </View>
            <View style={styles.summaryTextContainer}>
              <Text style={styles.summaryLabel}>Payés ({paidCount})</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totalPaid)}</Text>
            </View>
          </CardBody>
        </Card>
      </View>

      {overdueCount > 0 && (
        <Card style={styles.overdueCard} padding="_12">
          <CardBody style={styles.overdueCardBody}>
            <Ionicons name="alert-circle-outline" size={scale(20)} color={colors.background.default} />
            <View style={styles.overdueTextContainer}>
              <Text style={styles.overdueLabel}>{overdueCount} paiement(s) en retard</Text>
              <Text style={styles.overdueValue}>{formatCurrency(totalOverdue)}</Text>
            </View>
          </CardBody>
        </Card>
      )}

      {/* Filter Summary */}
      {(filters.childId || filters.schoolId || filters.gradeSectionId) && (
        <View style={styles.filterSummary}>
          <Text style={styles.filterSummaryText}>
            Filtres actifs: {getActiveFiltersText}
          </Text>
        </View>
      )}

      {totalCount > 0 && (
        <Text style={styles.resultCount}>
          {totalCount} paiement{totalCount > 1 ? 's' : ''} trouvé{totalCount > 1 ? 's' : ''}
        </Text>
      )}
    </View>
  ), [totalToPay, totalPaid, totalOverdue, paidCount, overdueCount, totalCount, filters, formatCurrency, getActiveFiltersText]);

  // Empty icon component
  const EmptyIcon = useCallback(() => (
    <Ionicons
      name="card-outline"
      size={64}
      color={colors.text.disabled}
    />
  ), []);

  if (!userInfo) {
    return (
      <ScreenView safeArea backgroundColor={colors.background.default}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error.main} />
          <Text style={styles.errorText}>Veuillez vous connecter pour accéder aux paiements</Text>
        </View>
      </ScreenView>
    );
  }

  return (
    <ScreenView
      safeArea={true}
      padding={false}
      paddingVertical={true}
      backgroundColor={colors.background.default}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Mes Paiements</Text>
          <Text style={styles.headerSubtitle}>Gérez vos versements et échéances</Text>
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={handleOpenFilterModal}
          accessibilityLabel="Filtrer les paiements"
        >
          <Ionicons name="options-outline" size={scale(20)} color={colors.primary.main} />
          <Text style={styles.filterButtonText}>Filtrer</Text>
        </TouchableOpacity>
      </View>

      {/* Payments List */}
      <InfiniteList<PaymentListItem>
        data={listData}
        renderItem={renderPaymentItem}
        keyExtractor={keyExtractor}
        onLoadMore={loadMore}
        hasNextPage={hasNextPage}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        onRefresh={refresh}
        isRefreshing={isRefreshing}
        showSearch={false}
        emptyTitle="Aucun paiement trouvé"
        emptySubtitle="Vous n'avez aucun paiement ou aucun paiement ne correspond à vos filtres."
        emptyIcon={<EmptyIcon />}
        error={error}
        onRetry={retry}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={styles.listContainer}
        accessibilityLabel="Liste des paiements"





      />

      {/* Filter Modal */}
      <BottomModal
        visible={showFilterModal}
        onClose={handleCloseFilterModal}
        title="Filtrer les paiements"
        subtitle="Affinez votre recherche"
        height="auto"
        enableDragToExpand={false}
      >
        <View style={styles.filterModalContent}>
          {loadingFilterOptions ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Chargement des options...</Text>
            </View>
          ) : (
            <>
              {/* Child Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Enfant</Text>
                <View style={styles.pickerContainer}>
                  <TouchableOpacity style={styles.pickerButton} onPress={() => setShowChildPicker(true)}>
                    <Text style={styles.pickerButtonText}>
                      {tempFilters.childId
                        ? childrenOptions.find(c => c.id === tempFilters.childId)?.name || 'Sélectionner'
                        : 'Tous les enfants'
                      }
                    </Text>
                    <Ionicons name="chevron-down" size={scale(16)} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* School Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>École</Text>
                <View style={styles.pickerContainer}>
                  <TouchableOpacity style={styles.pickerButton} onPress={() => setShowSchoolPicker(true)}>
                    <Text style={styles.pickerButtonText}>
                      {tempFilters.schoolId
                        ? schoolOptions.find(s => s.id === tempFilters.schoolId)?.name || 'Sélectionner'
                        : 'Toutes les écoles'
                      }
                    </Text>
                    <Ionicons name="chevron-down" size={scale(16)} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Grade Section Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Classe/Section</Text>
                <View style={styles.pickerContainer}>
                  <TouchableOpacity style={styles.pickerButton} onPress={() => setShowGradePicker(true)}>
                    <Text style={styles.pickerButtonText}>
                      {tempFilters.gradeSectionId
                        ? gradeSectionOptions.find(gs => gs.id === tempFilters.gradeSectionId)?.name || 'Sélectionner'
                        : 'Toutes les classes'
                      }
                    </Text>
                    <Ionicons name="chevron-down" size={scale(16)} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.filterActions}>
                <SecondaryButton
                  title="Effacer"
                  onPress={handleClearFilters}
                  style={styles.clearButton}
                />
                <PrimaryButton
                  title="Appliquer"
                  onPress={handleApplyFilters}
                  style={styles.applyButton}
                />
              </View>
            </>
          )}
        </View>
      </BottomModal>

      {/* Child Picker Modal */}
      <BottomModal
        visible={showChildPicker}
        onClose={() => setShowChildPicker(false)}
        title="Sélectionner un enfant"
        height="auto"
      >
        <View style={styles.pickerModalContent}>
          <TouchableOpacity
            style={styles.pickerOption}
            onPress={() => handleChildSelect(undefined)}
          >
            <Text style={[
              styles.pickerOptionText,
              !tempFilters.childId && styles.pickerOptionSelected
            ]}>
              Tous les enfants
            </Text>
            {!tempFilters.childId && (
              <Ionicons name="checkmark" size={scale(20)} color={colors.primary.main} />
            )}
          </TouchableOpacity>

          {childrenOptions.map((child) => (
            <TouchableOpacity
              key={child.id}
              style={styles.pickerOption}
              onPress={() => handleChildSelect(child.id)}
            >
              <Text style={[
                styles.pickerOptionText,
                tempFilters.childId === child.id && styles.pickerOptionSelected
              ]}>
                {child.name}
              </Text>
              {tempFilters.childId === child.id && (
                <Ionicons name="checkmark" size={scale(20)} color={colors.primary.main} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </BottomModal>
      {/* School Picker Modal */}
      <BottomModal
        visible={showSchoolPicker}
        onClose={() => setShowSchoolPicker(false)}
        title="Sélectionner une école"
        height="auto"
      >
        <View style={styles.pickerModalContent}>
          <TouchableOpacity
            style={styles.pickerOption}
            onPress={() => handleSchoolSelect(undefined)}
          >
            <Text style={[
              styles.pickerOptionText,
              !tempFilters.schoolId && styles.pickerOptionSelected
            ]}>
              Toutes les écoles
            </Text>
            {!tempFilters.schoolId && (
              <Ionicons name="checkmark" size={scale(20)} color={colors.primary.main} />
            )}
          </TouchableOpacity>

          {schoolOptions.map((school) => (
            <TouchableOpacity
              key={school.id}
              style={styles.pickerOption}
              onPress={() => handleSchoolSelect(school.id)}
            >
              <Text style={[
                styles.pickerOptionText,
                tempFilters.schoolId === school.id && styles.pickerOptionSelected
              ]}>
                {school.name}
              </Text>
              {tempFilters.schoolId === school.id && (
                <Ionicons name="checkmark" size={scale(20)} color={colors.primary.main} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </BottomModal>
      {/* Grade Picker Modal */}
      <BottomModal
        visible={showGradePicker}
        onClose={() => setShowGradePicker(false)}
        title="Sélectionner une classe"
        height="auto"
      >
        <View style={styles.pickerModalContent}>
          <TouchableOpacity
            style={styles.pickerOption}
            onPress={() => handleGradeSelect(undefined)}
          >
            <Text style={[
              styles.pickerOptionText,
              !tempFilters.gradeSectionId && styles.pickerOptionSelected
            ]}>
              Toutes les classes
            </Text>
            {!tempFilters.gradeSectionId && (
              <Ionicons name="checkmark" size={scale(20)} color={colors.primary.main} />
            )}
          </TouchableOpacity>

          {gradeSectionOptions.map((grade, index) => (
            <TouchableOpacity
              key={grade.id + "_" + index}
              style={styles.pickerOption}
              onPress={() => handleGradeSelect(grade.id)}
            >
              <Text style={[
                styles.pickerOptionText,
                tempFilters.gradeSectionId === grade.id && styles.pickerOptionSelected
              ]}>
                {grade.name}
              </Text>
              {tempFilters.gradeSectionId === grade.id && (
                <Ionicons name="checkmark" size={scale(20)} color={colors.primary.main} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </BottomModal>

    </ScreenView>
  );
};

export default PaymentsScreen;

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._15,
    backgroundColor: colors.background.default,
    borderBottomWidth: 1,
    borderBottomColor: colors.border?.light || '#e1e5e9',
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
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacingX._12,
    paddingVertical: spacingY._7,
    borderWidth: 1,
    borderColor: colors.primary.main,
    borderRadius: 8,
    gap: spacingX._5,
  },
  filterButtonText: {
    fontSize: scaleFont(14),
    color: colors.primary.main,
    fontWeight: '500',
  },

  // List
  listContainer: {
    paddingHorizontal: spacingX._20,
    paddingBottom: spacingY._20,
  },
  listHeader: {
    paddingVertical: spacingY._20,
  },

  // Summary Cards
  summaryCardsContainer: {
    flexDirection: 'row',
    gap: spacingX._10,
    marginBottom: spacingY._15,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  summaryCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._10,
  },
  summaryIconContainer: {
    padding: spacingX._7,
    backgroundColor: colors.background.paper,
    borderRadius: 8,
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: scaleFont(12),
    color: colors.text.secondary,
    marginBottom: spacingY._3,
  },
  summaryValue: {
    fontSize: scaleFont(14),
    fontWeight: 'bold',
    color: colors.text.secondary,
  },

  // Overdue Card
  overdueCard: {
    backgroundColor: colors.error.light,
    marginBottom: spacingY._15,
  },
  overdueCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._10,
  },
  overdueTextContainer: {
    flex: 1,
  },
  overdueLabel: {
    fontSize: scaleFont(14),
    color: colors.background.default,
    fontWeight: '600',
    marginBottom: spacingY._3,
  },
  overdueValue: {
    fontSize: scaleFont(16),
    fontWeight: 'bold',
    color: colors.background.default,
  },

  // Filter Summary
  filterSummary: {
    backgroundColor: colors.primary.light,
    paddingHorizontal: spacingX._12,
    paddingVertical: spacingY._7,
    borderRadius: 8,
    marginBottom: spacingY._10,
  },
  filterSummaryText: {
    fontSize: scaleFont(12),
    color: colors.background.default,
    fontWeight: '500',
  },

  // Result Count
  resultCount: {
    fontSize: scaleFont(14),
    color: colors.text.secondary,
    marginBottom: spacingY._10,
  },

  // Error State
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

  // Filter Modal
  filterModalContent: {
    flex: 1,
    paddingTop: spacingY._10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: scaleFont(14),
    color: colors.text.secondary,
  },
  filterSection: {
    marginBottom: spacingY._20,
  },
  filterLabel: {
    fontSize: scaleFont(14),
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: spacingY._7,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border?.main || '#d1d5db',
    borderRadius: 8,
    backgroundColor: colors.background.default,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacingX._15,
    minHeight: scale(50),
  },
  pickerButtonText: {
    fontSize: scaleFont(14),
    color: colors.text.primary,
    flex: 1,
  },
  filterActions: {
    flexDirection: 'row',
    gap: spacingX._10,
    marginTop: spacingY._20,
  },
  clearButton: {
    flex: 1,
  },
  applyButton: {
    flex: 1,
  },
  pickerModalContent: {
    flex: 1,
    paddingTop: spacingY._10,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacingY._15,
    paddingHorizontal: spacingX._5,
    borderBottomWidth: 1,
    borderBottomColor: colors.border?.light || '#e1e5e9',
  },
  pickerOptionText: {
    fontSize: scaleFont(16),
    color: colors.text.primary,
    flex: 1,
  },
  pickerOptionSelected: {
    color: colors.primary.main,
    fontWeight: '600',
  },
});