// app/(tabs)/index.tsx
import { BottomModal } from '@/components/BottomModal/BottomModal';
import { Card, CardBody } from '@/components/Card/CardComponent';
import { CustomInput } from '@/components/CustomInput/CustomInput';
import { GhostIconButton } from '@/components/IconButton/IconButton';
import { IconLabelCard } from '@/components/IconLabelCard/IconLabelCard';
import { TransactionItem } from '@/components/ListItems/TransactionItem';
import { ScreenView } from '@/components/ScreenView/ScreenView';
import {
  colors,
  getTextStyle,
  shadows,
  spacingX,
  spacingY,
} from '@/constants/theme';
import { QuickActionData, QuickActionItem } from '@/GeneralData/GeneralData';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationsList } from '@/hooks/useNotificationsList';
import { useRecentTransactions } from '@/hooks/useRecentTransactions';
import useUserInfo from '@/hooks/useUserInfo';
import { RecentPaymentTransactionDto, useGetParentCurrentMonthTotalFees, useLogout } from '@/services/userServices';

import { SCREEN_HEIGHT, scale, scaleFont } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function HomeScreen() {
  const userInfo = useUserInfo();

  const { hasRequestedPermission, requestNotificationPermission } = useNotifications();
  const { unreadCount } = useNotificationsList({
    type: '',
    pageSize: 10,
    autoFetch: true,
  });

  const logoutUser = useLogout();
  const getParentCurrentMonthTotalFees = useGetParentCurrentMonthTotalFees();

  //#region States
  const [basicModalVisible, setBasicModalVisible] = useState(false);
  const [totalFees, setTotalFees] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [periodMenuVisible, setPeriodMenuVisible] = useState(false);
  //#endregion

  //#region Recent Transactions Hook
  const parentId = userInfo?.parentId ? parseInt(userInfo.parentId.toString()) : null;

  const {
    transactions,
    summary,
    isLoading: transactionsLoading,
    error: transactionsError,
    refresh: refreshTransactions,
    retry: retryTransactions,
    fetchTransactions,
  } = useRecentTransactions({
    parentId,
    timePeriod: 'week',
    topCount: 5,
    autoFetch: true,
  });
  //#endregion

  //#region Fetchings
  const fetchParentCurrentMonthTotalFee = useCallback(async () => {
    try {
      setLoading(true);
      const parentIdNum = typeof userInfo?.parentId === 'number'
        ? userInfo.parentId
        : Number(userInfo?.parentId ?? 0);
      const { success, data, error } = await getParentCurrentMonthTotalFees({ parentId: parentIdNum });

      if (success) {
        setTotalFees(data?.data || "0");
      }

      if (error) {
        console.log("error in fetching parent total fee ::: ", error);
      }

    } catch (_error) {
      console.log("error in fetching parent total fee ::: ", _error);
      setTotalFees("0");
    } finally {
      setLoading(false);
    }
  }, [userInfo?.parentId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchParentCurrentMonthTotalFee(),
        refreshTransactions(),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };
  //#endregion

  //#region Handlers
  const handleQuickAction = (action: QuickActionItem) => {
    router.push(action.route as any);
  };

  const handleLogout = async () => {
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
  };

  const handleTransactionPress = (transaction: RecentPaymentTransactionDto) => {
    Alert.alert(
      'Détails de la transaction',
      `Transaction: ${transaction.transactionReference}\n` +
      `Enfant: ${transaction.childFullName}\n` +
      `Montant: ${transaction.formattedAmount}\n` +
      `Méthode: ${transaction.paymentMethod}\n` +
      `Status: ${transaction.statusName}\n` +
      `Date: ${new Date(transaction.paidDate).toLocaleDateString('fr-FR')}`,
      [{ text: 'OK' }]
    );
  };

  const handleViewAllTransactions = () => {
    router.push('/(tabs)/payments');
  };

  const handleChangePeriod = (period: 'week' | 'month' | 'all') => {
    fetchTransactions(period);
  };

  const handleExpand = () => {
    console.log('Modal expanded!');
  };

  const handleCollapse = () => {
    console.log('Modal collapsed!');
  };
  //#endregion

  //#region Use Effects
  useEffect(() => {
    if (!hasRequestedPermission) {
      const timer = setTimeout(() => {
        requestNotificationPermission();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [hasRequestedPermission, requestNotificationPermission]);

  useEffect(() => {
    fetchParentCurrentMonthTotalFee();
  }, [userInfo?.parentId, fetchParentCurrentMonthTotalFee]);
  //#endregion

  return (
    <ScreenView safeArea={true}>
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.main}
            colors={[colors.primary.main]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Header (modern) */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={24} color={colors.text.white} />
              </View>
              <View style={styles.greetingSection}>
                <Text style={styles.smallGreeting}>Bonjour</Text>
                <Text style={styles.nameText}>{userInfo?.name || ""}</Text>
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

          {/* Total Fees Card (prominent CTA) */}
          <Card borderRadius={"_10"} style={styles.cardContainer}>
            <CardBody style={styles.mainCardBody}>
              <View style={styles.totalRow}>
                <View>
                  <Text style={styles.cardHeaderTitleStyle}>Total à payer ce mois-ci</Text>
                  {loading ? (
                    <Text style={styles.loadingText}>Chargement...</Text>
                  ) : (
                    <View style={styles.amountRow}>
                      <Text style={styles.mainCardAmountText}>{totalFees}</Text>
                      <Text style={styles.mainCardCurrencyText}>CFA</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity style={styles.payNowButton} onPress={() => router.push('/(tabs)/payments')}>
                  <Text style={styles.payNowButtonText}>Payer maintenant</Text>
                </TouchableOpacity>
              </View>
            </CardBody>
          </Card>

          {/* Quick Actions (horizontal, elevated) */}
          <View style={styles.quickActionsWrapper}>
            <Text style={styles.sectionTitle}>Actions Rapides</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsScroll}>
              {QuickActionData.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.actionCard}
                  onPress={() => handleQuickAction(action)}
                  accessibilityLabel={`Accéder à ${action.label}`}
                >
                  <View style={styles.actionIconWrap}>
                    <IconLabelCard
                      imageSource={action.img}
                      label={action.label}
                      size="sm"
                      labelStyle={styles.actionCardLabelStyle}
                      style={{ backgroundColor: 'transparent', elevation: 0 }}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Recent Transactions */}
          <View style={styles.transactionsSection}>
            <View style={styles.transactionsSectionHeader}>
              <Text style={styles.sectionTitle}>Transactions récentes</Text>
              <View style={styles.transactionsHeaderActions}>
                {summary && (
                  <>
                    <TouchableOpacity
                      style={styles.periodButton}
                      onPress={() => setPeriodMenuVisible((v) => !v)}
                    >
                      <Text style={styles.periodButtonText}>
                        {summary.timePeriod === 'week' ? 'Semaine' :
                          summary.timePeriod === 'month' ? 'Mois' : 'Tout'}
                      </Text>
                      <Ionicons name={periodMenuVisible ? "chevron-up" : "chevron-down"} size={scale(14)} color={colors.primary.main} />
                    </TouchableOpacity>

                    {periodMenuVisible && (
                      <View style={styles.periodMenu}>
                        <TouchableOpacity
                          style={styles.periodMenuItem}
                          onPress={() => {
                            handleChangePeriod('week');
                            setPeriodMenuVisible(false);
                          }}
                        >
                          <Text style={styles.periodMenuItemText}>Semaine</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.periodMenuItem}
                          onPress={() => {
                            handleChangePeriod('month');
                            setPeriodMenuVisible(false);
                          }}
                        >
                          <Text style={styles.periodMenuItemText}>Mois</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.periodMenuItem}
                          onPress={() => {
                            handleChangePeriod('all');
                            setPeriodMenuVisible(false);
                          }}
                        >
                          <Text style={styles.periodMenuItemText}>Tout</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}

                {transactions.length > 0 && (
                  <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={handleViewAllTransactions}
                  >
                    <Text style={styles.viewAllButtonText}>Voir tout</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Transactions Summary */}
            {summary && (
              <Card borderRadius={"_10"} style={styles.summaryCard}>
                <CardBody style={styles.summaryCardBody}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Total payé ({summary.timePeriod})</Text>
                    <Text style={styles.summaryAmount}>
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'CFA',
                        minimumFractionDigits: 0,
                      }).format(summary.totalAmountPaid)}
                    </Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Transactions</Text>
                    <Text style={styles.summaryCount}>{summary.totalTransactions}</Text>
                  </View>
                </CardBody>
              </Card>
            )}

            {/* Transactions List */}
            <Card borderRadius={"_10"} style={styles.transactionsCard}>
              <CardBody style={styles.transactionsCardBody}>
                {transactionsLoading ? (
                  <View style={styles.transactionsLoadingContainer}>
                    <Text style={styles.transactionsLoadingText}>Chargement des transactions...</Text>
                  </View>
                ) : transactionsError ? (
                  <View style={styles.transactionsErrorContainer}>
                    <Text style={styles.transactionsErrorText}>
                      Erreur lors du chargement des transactions
                    </Text>
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={retryTransactions}
                    >
                      <Text style={styles.retryButtonText}>Réessayer</Text>
                    </TouchableOpacity>
                  </View>
                ) : transactions.length === 0 ? (
                  <View style={styles.noTransactionsContainer}>
                    <Ionicons
                      name="receipt-outline"
                      size={scale(48)}
                      color={colors.text.disabled}
                    />
                    <Text style={styles.noTransactionsText}>
                      Aucune transaction récente
                    </Text>
                    <Text style={styles.noTransactionsSubtext}>
                      Vos transactions apparaîtront ici une fois effectuées
                    </Text>
                  </View>
                ) : (
                  <View style={styles.transactionsList}>
                    {transactions.slice(0, 3).map((transaction) => (
                      <TransactionItem
                        key={transaction.paymentTransactionId}
                        transaction={transaction}
                        onPress={handleTransactionPress}
                        compact={true}
                        style={styles.transactionItem}
                      />
                    ))}
                    {transactions.length > 3 && (
                      <TouchableOpacity
                        style={styles.moreTransactionsButton}
                        onPress={handleViewAllTransactions}
                      >
                        <Text style={styles.moreTransactionsText}>
                          +{transactions.length - 3} autres transactions
                        </Text>
                        <Ionicons
                          name="arrow-forward"
                          size={scale(16)}
                          color={colors.primary.main}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </CardBody>
            </Card>
          </View>
        </View>
      </ScrollView>

      {/* Basic Modal */}
      <BottomModal
        visible={basicModalVisible}
        onClose={() => setBasicModalVisible(false)}
        title="Ajouter un enfant"
        subtitle="Ajouter votre enfant"
        height={SCREEN_HEIGHT * 0.5}
        enableDragToExpand={true}
        onExpand={handleExpand}
        onCollapse={handleCollapse}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            This is the content of the modal. You can put any components here.
          </Text>
          <CustomInput
            label='test'
            disabled={false}
          />
          <View style={styles.modalActions}>
            <GhostIconButton
              iconName="heart-outline"
              onPress={() => Alert.alert('Liked!')}
            />
            <GhostIconButton
              iconName="share-outline"
              onPress={() => Alert.alert('Shared!')}
            />
            <GhostIconButton
              iconName="bookmark-outline"
              onPress={() => Alert.alert('Bookmarked!')}
            />
          </View>
        </View>
      </BottomModal>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: spacingY._20,
  },
  header: {
    marginBottom: spacingY._30,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: "center",
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
  smallGreeting: {
    ...getTextStyle('sm', 'medium', colors.text.secondary),
    marginBottom: spacingY._3,
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
  greetingSection: {
    alignItems: 'flex-start'
  },
  quickActionsSection: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  nameTextGreeting: {
    ...getTextStyle('sm', 'bold', colors.text.secondary),
    textAlign: 'center',
  },
  nameText: {
    ...getTextStyle('lg', 'extrabold', colors.text.secondary),
    textAlign: 'center',
  },
  cardContainer: {
    backgroundColor: colors.primary.light,
    padding: spacingX._12,
    borderRadius: 14,
    // subtle shadow
    elevation: 4,
  },
  cardHeaderTitleStyle: {
    ...getTextStyle('md', 'bold', colors.text.white),
    textAlign: "left"
  },
  mainCardBody: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  totalRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacingX._10,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacingX._5,
  },
  payNowButton: {
    backgroundColor: colors.primary.main,
    paddingVertical: spacingY._7,
    paddingHorizontal: spacingX._12,
    borderRadius: 12,
  },
  payNowButtonText: {
    color: colors.text.white,
    fontWeight: '700',
    fontSize: scaleFont(13),
  },
  mainCardAmountText: {
    ...getTextStyle('3xl', 'bold', colors.text.white),
    textAlign: "left"
  },
  mainCardCurrencyText: {
    ...getTextStyle('xl', 'bold', colors.text.white),
    textAlign: "left",
    marginLeft: spacingX._7,
  },
  loadingText: {
    ...getTextStyle('md', 'normal', colors.text.secondary),
    textAlign: "center"
  },
  sectionTitle: {
    ...getTextStyle('md', 'semibold', colors.text.secondary),
    marginBottom: spacingY._10,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',

    gap: spacingX._5,

  },
  actionCard: {
    width: scale(120),
    height: scale(100),
    marginRight: spacingX._10,
    marginBottom: spacingY._10,
    backgroundColor: colors.background.default,
    borderRadius: 12,
    elevation: 3,
    padding: spacingX._7,
  },
  actionCardLabelStyle: {
    ...getTextStyle('xs', 'medium', colors.text.secondary),
  },
  quickActionsWrapper: {
    marginTop: spacingY._15,
  },
  actionsScroll: {
    paddingVertical: spacingY._5,
    paddingRight: spacingX._10,
  },
  actionIconWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Period dropdown menu
  periodMenu: {
    position: 'absolute',
    top: spacingY._40,
    right: 0,
    backgroundColor: colors.background.default,
    borderRadius: 8,
    paddingVertical: spacingY._5,
    paddingHorizontal: spacingX._5,
    ...shadows.md,
    zIndex: 10,
  },
  periodMenuItem: {
    paddingVertical: spacingY._5,
    paddingHorizontal: spacingX._10,
  },
  periodMenuItemText: {
    fontSize: scaleFont(13),
    color: colors.text.primary,
  },

  // Transactions Section
  transactionsSection: {
    marginTop: spacingY._20,
  },
  transactionsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacingY._15,
  },
  transactionsHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._10,
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacingX._10,
    paddingVertical: spacingY._5,
    borderWidth: 1,
    borderColor: colors.primary.main,
    borderRadius: 15,
    gap: spacingX._5,
  },
  periodButtonText: {
    fontSize: scaleFont(12),
    color: colors.primary.main,
    fontWeight: '500',
  },
  viewAllButton: {
    paddingHorizontal: spacingX._10,
    paddingVertical: spacingY._5,
  },
  viewAllButtonText: {
    fontSize: scaleFont(12),
    color: colors.primary.main,
    fontWeight: '600',
  },

  // Summary Card
  summaryCard: {

    marginBottom: spacingY._15,
  },
  summaryCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: scaleFont(12),
    color: colors.text.secondary,
    marginBottom: spacingY._3,
  },
  summaryAmount: {
    fontSize: scaleFont(16),
    fontWeight: 'bold',
    color: colors.success.main,
  },
  summaryCount: {
    fontSize: scaleFont(16),
    fontWeight: 'bold',
    color: colors.primary.main,
  },
  summaryDivider: {
    width: 1,
    height: '60%',
    backgroundColor: colors.border?.light || '#e1e5e9',
    marginHorizontal: spacingX._15,
  },

  // Transactions Card
  transactionsCard: {
    backgroundColor: colors.background.default,
  },
  transactionsCardBody: {
    paddingVertical: spacingY._5,
  },
  transactionsLoadingContainer: {
    paddingVertical: spacingY._20,
    alignItems: 'center',
  },
  transactionsLoadingText: {
    fontSize: scaleFont(14),
    color: colors.text.secondary,
  },
  transactionsErrorContainer: {
    paddingVertical: spacingY._20,
    alignItems: 'center',
  },
  transactionsErrorText: {
    fontSize: scaleFont(14),
    color: colors.error.main,
    textAlign: 'center',
    marginBottom: spacingY._10,
  },
  retryButton: {
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._7,
    backgroundColor: colors.primary.main,
    borderRadius: 15,
  },
  retryButtonText: {
    fontSize: scaleFont(12),
    color: colors.text.white,
    fontWeight: '600',
  },
  noTransactionsContainer: {
    paddingVertical: spacingY._30,
    alignItems: 'center',
  },
  noTransactionsText: {
    fontSize: scaleFont(16),
    color: colors.text.primary,
    fontWeight: '600',
    marginTop: spacingY._10,
    marginBottom: spacingY._5,
  },
  noTransactionsSubtext: {
    fontSize: scaleFont(12),
    color: colors.text.secondary,
    textAlign: 'center',
  },
  transactionsList: {
    paddingVertical: spacingY._5,
  },
  transactionItem: {
    marginBottom: spacingY._5,
  },
  moreTransactionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacingY._10,
    marginTop: spacingY._5,
    gap: spacingX._5,
  },
  moreTransactionsText: {
    fontSize: scaleFont(12),
    color: colors.primary.main,
    fontWeight: '500',
  },

  // Modal styles
  modalContent: {
    flex: 1,
    paddingTop: spacingY._20,
  },
  modalText: {
    ...getTextStyle('base', 'normal', colors.text.primary),
    textAlign: 'center',
    marginBottom: spacingY._25,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacingY._20,
  },
});