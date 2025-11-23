// app/(pages)/merchandises.tsx
import { BottomModal } from '@/components/BottomModal/BottomModal';
import { PrimaryButton, SecondaryButton } from '@/components/Button/CustomPressable';
import { InfiniteList } from '@/components/InfiniteList/InfiniteList';
import { MerchandiseItem } from '@/components/ListItems/MerchandiseItem';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { ScreenView } from '@/components/ScreenView/ScreenView';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { useMerchandiseData } from '@/hooks/useMerchandiseData';
import useUserInfo from '@/hooks/useUserInfo';
import { SchoolMerchandise } from '@/services/merchandisesServices';
import { useInitiateAirtelCollection } from '@/services/paymentServices';
import { scale, scaleFont, SCREEN_HEIGHT } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import { ListRenderItem } from '@shopify/flash-list';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface MerchandiseListItem extends SchoolMerchandise {
  id: string | number;
  quantity?: number;
}

// Memoized category option component
const CategoryOption = React.memo<{
  categoryId?: number;
  title: string;
  selectedCategory?: number;
  onPress: (categoryId?: number) => void;
}>(({ categoryId, title, selectedCategory, onPress }) => {
  const isSelected = selectedCategory === categoryId;

  const handlePress = useCallback(() => {
    onPress(categoryId);
  }, [onPress, categoryId]);

  return (
    <TouchableOpacity
      style={[
        styles.categoryOption,
        isSelected && styles.categoryOptionSelected
      ]}
      onPress={handlePress}
    >
      <Text style={[
        styles.categoryOptionText,
        isSelected && styles.categoryOptionTextSelected
      ]}>
        {title}
      </Text>
      {isSelected && (
        <Ionicons name="checkmark" size={scale(20)} color={colors.primary.main} />
      )}
    </TouchableOpacity>
  );
});

CategoryOption.displayName = 'CategoryOption';

const MerchandisesScreen = () => {
  const userInfo = useUserInfo();

  // For now, we'll use a hardcoded school ID or get it from user info
  // You might want to get this from navigation params or user's selected school
  const schoolId = userInfo?.schoolId || "0"; // Using "2" as default from your API example

  console.log("schhhhhhh ::: ", schoolId);

  //#region States
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [showFilterModal, setShowFilterModal] = useState(false);
  interface CartItem extends SchoolMerchandise {
    quantity: number;
  }

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [showPaymentConfirmModal, setShowPaymentConfirmModal] = useState(false);
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  //#endregion

  const {
    merchandises,
    isLoading,
    isLoadingMore,
    isRefreshing,
    hasNextPage,
    totalCount,
    searchQuery,
    error,
    loadMore,
    refresh,
    search,
    retry,
    applyFilters,
  } = useMerchandiseData({
    schoolId,
    pageSize: 15,
    initialSearch: '',
    categoryId: selectedCategory,
  });

  // Memoize the list data transformation and include quantity from cartItems
  const listData: MerchandiseListItem[] = useMemo(() => {
    const qtyMap = new Map<number, number>();
    cartItems.forEach(ci => qtyMap.set(ci.schoolMerchandiseId, ci.quantity));

    return merchandises.map(merchandise => ({
      ...merchandise,
      id: merchandise.schoolMerchandiseId,
      quantity: qtyMap.get(merchandise.schoolMerchandiseId) ?? 0,
    }));
  }, [merchandises, cartItems]);

  // Memoized cart calculations
  const cartStats = useMemo(() => ({
    count: cartItems.reduce((s, i) => s + i.quantity, 0),
    total: cartItems.reduce((sum, item) => sum + item.schoolMerchandisePrice * item.quantity, 0),
    itemsList: cartItems.map(item => `• ${item.schoolMerchandiseName} x${item.quantity}`).join('\n')
  }), [cartItems]);

  // Memoized render item to prevent unnecessary re-renders
  // (moved lower, after handlers are declared)

  // Memoized handlers
  const handleAddToCart = useCallback((merchandise: SchoolMerchandise) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.schoolMerchandiseId === merchandise.schoolMerchandiseId);
      if (existing) {
        return prev.map(i => i.schoolMerchandiseId === merchandise.schoolMerchandiseId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...merchandise, quantity: 1 }];
    });
  }, []);

  const handleIncrement = useCallback((merchandiseId: number) => {
    setCartItems(prev => prev.map(i => i.schoolMerchandiseId === merchandiseId ? { ...i, quantity: i.quantity + 1 } : i));
  }, []);

  const handleDecrement = useCallback((merchandiseId: number) => {
    setCartItems(prev => prev.flatMap(i => {
      if (i.schoolMerchandiseId === merchandiseId) {
        const next = i.quantity - 1;
        if (next <= 0) return [] as CartItem[];
        return [{ ...i, quantity: next }];
      }
      return [i];
    }));
  }, []);

  const handleMerchandisePress = useCallback((merchandise: SchoolMerchandise) => {
    // Navigate to merchandise details or show details modal
    Alert.alert(
      merchandise.schoolMerchandiseName,
      merchandise.schoolMerchandiseDescription,
      [
        { text: 'Fermer', style: 'cancel' },
        {
          text: 'Ajouter au panier',
          onPress: () => handleAddToCart(merchandise)
        }
      ]
    );
  }, [handleAddToCart]);

  const handleOpenFilter = useCallback(() => {
    setShowFilterModal(true);
  }, []);

  const handleCloseFilter = useCallback(() => {
    setShowFilterModal(false);
  }, []);

  const handleApplyFilter = useCallback((categoryId?: number) => {
    setSelectedCategory(categoryId);
    applyFilters({ schoolId, categoryId });
    setShowFilterModal(false);
  }, [applyFilters, schoolId]);

  const handleClearFilter = useCallback(() => {
    setSelectedCategory(undefined);
    applyFilters({ schoolId, categoryId: undefined });
    setShowFilterModal(false);
  }, [applyFilters, schoolId]);

  const handleOpenCart = useCallback(() => {
    if (cartStats.count === 0) {
      Alert.alert('Panier vide', 'Votre panier est vide.');
      return;
    }

    setShowPaymentConfirmModal(true);
  }, [cartStats.count]);

  const handleCloseCart = useCallback(() => {
    setCartModalVisible(false);
  }, []);

  // removed unused handleCheckout; checkout is via the cart modal's Pay button

  // remove item from cart
  const handleRemoveFromCart = useCallback((merchandiseId: number | string) => {
    setCartItems(prev => prev.filter(i => i.schoolMerchandiseId !== merchandiseId));
  }, []);

  // Payment hook
  const initiateAirtelCollection = useInitiateAirtelCollection();

  const handlePay = useCallback(async () => {
    if (isPaying) return;

    const subscriberMsisdn = (userInfo as any)?.phoneNumber;
    if (!subscriberMsisdn) {
      Alert.alert('Téléphone manquant', 'Votre numéro de téléphone est nécessaire pour procéder au paiement.');
      return;
    }

    const amount = cartStats.total;
    if (amount <= 0) {
      Alert.alert('Montant invalide', 'Le montant du panier est invalide.');
      return;
    }

    setIsPaying(true);
    try {
      const reference = `MERCH${Date.now().toString().slice(-6)}`;
      const callbackUrl = `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/Payments/callback`;

      // Build MerchandiseItems array from cart
      const merchandiseItems = cartItems.map(item => ({
        MerchandiseId: item.schoolMerchandiseId,
        Quantity: item.quantity
      }));

      const resp = await initiateAirtelCollection({
        Reference: reference,
        SubscriberMsisdn: subscriberMsisdn,
        Amount: amount,
        CallbackUrl: callbackUrl,
        InstallmentId: 0,
        PaymentType: "MERCHANDISEFEE",
        MerchandiseItems: merchandiseItems,
        UserId: (userInfo as any)?.id || ''
      } as any);

      console.log("Payment response ", resp);

      if (resp && resp.success && resp.data) {
        setPaymentReference(resp.data.reference || reference);
        setPaymentAmount(amount);
        setShowPaymentConfirmModal(false);
        setShowPaymentSuccessModal(true);

        // Clear cart after successful payment
        setTimeout(() => {
          setCartItems([]);
        }, 1000);
      } else {
        setShowPaymentConfirmModal(false);
        const msg = resp?.error || 'Échec de l\'initiation du paiement.';
        Alert.alert('Erreur de paiement', String(msg));
      }
    } catch (err) {
      console.error('Payment error', err);
      setShowPaymentConfirmModal(false);
      Alert.alert('Erreur', 'Une erreur est survenue lors du paiement.');
    } finally {
      setIsPaying(false);
    }
  }, [cartStats.total, initiateAirtelCollection, isPaying, userInfo, cartItems]);

  // Memoized key extractor
  const keyExtractor = useCallback((item: MerchandiseListItem) =>
    item.schoolMerchandiseId.toString(),
    []);

  // Memoized render item to prevent unnecessary re-renders
  const renderMerchandiseItem: ListRenderItem<MerchandiseListItem> = useCallback(({ item }) => {
    const cartItem = cartItems.find(c => String(c.schoolMerchandiseId) === String(item.schoolMerchandiseId));
    return (
      <MerchandiseItem
        merchandise={item}
        onPress={handleMerchandisePress}
        onAddToCart={handleAddToCart}
        showActions={true}
        quantity={cartItem?.quantity}
        onIncrement={() => handleIncrement(item.schoolMerchandiseId)}
        onDecrement={() => handleDecrement(item.schoolMerchandiseId)}
      />
    );
  }, [handleMerchandisePress, handleAddToCart, cartItems, handleIncrement, handleDecrement]);

  // Memoized search handler with loading state
  const handleSearch = useCallback((query: string) => {
    setIsSearching(true);
    search(query);
    // Reset searching state after a delay
    setTimeout(() => setIsSearching(false), 1000);
  }, [search]);

  // Memoized list header
  const ListHeaderComponent = useCallback(() => (
    <View style={styles.header}>
      {totalCount > 0 && (
        <Text style={styles.subtitle}>
          {totalCount} article{totalCount > 1 ? 's' : ''} disponible{totalCount > 1 ? 's' : ''}
        </Text>
      )}
      {selectedCategory && (
        <View style={styles.filterInfo}>
          <Text style={styles.filterText}>
            Catégorie filtrée: {selectedCategory}
          </Text>
        </View>
      )}
    </View>
  ), [totalCount, selectedCategory]);

  // Memoized empty icon
  const EmptyIcon = useCallback(() => (
    <Ionicons
      name="bag-outline"
      size={64}
      color={colors.text.disabled}
    />
  ), []);

  // Memoized header actions with cart color logic
  const headerActions = useMemo(() => [
    {
      icon: 'options-outline' as keyof typeof Ionicons.glyphMap,
      onPress: handleOpenFilter,
      color: colors.primary.main,
    },
    {
      icon: 'cart-outline' as keyof typeof Ionicons.glyphMap,
      onPress: handleOpenCart,
      color: cartStats.count > 0 ? colors.success.main : colors.text.secondary,
    }
  ], [handleOpenFilter, handleOpenCart, cartStats.count]);

  // Memoized filter modal content
  const FilterModalContent = useMemo(() => (
    <View style={styles.filterModalContent}>
      <CategoryOption
        title="Toutes les catégories"
        selectedCategory={selectedCategory}
        onPress={handleApplyFilter}
      />
      <CategoryOption
        categoryId={3}
        title="Sacs et accessoires"
        selectedCategory={selectedCategory}
        onPress={handleApplyFilter}
      />
      <CategoryOption
        categoryId={7}
        title="Fournitures scolaires"
        selectedCategory={selectedCategory}
        onPress={handleApplyFilter}
      />
      <CategoryOption
        categoryId={8}
        title="Bouteilles et gourdes"
        selectedCategory={selectedCategory}
        onPress={handleApplyFilter}
      />

      {/* Action Buttons */}
      <View style={styles.filterActions}>
        <SecondaryButton
          title="Effacer"
          onPress={handleClearFilter}
          style={styles.filterButton}
        />
        <PrimaryButton
          title="Fermer"
          onPress={handleCloseFilter}
          style={styles.filterButton}
        />
      </View>
    </View>
  ), [selectedCategory, handleApplyFilter, handleClearFilter, handleCloseFilter]);

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  if (!schoolId) {
    return (
      <ScreenView safeArea backgroundColor={colors.background.default}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error.main} />
          <Text style={styles.errorText}>École non trouvée</Text>
          <Text style={styles.errorSubtext}>Veuillez sélectionner une école</Text>
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
      <PageHeader
        title="Marchandises"
        onBack={handleBack}
        actions={headerActions}
      />

      {/* Cart Badge */}
      {cartStats.count > 0 && (
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>{cartStats.count}</Text>
        </View>
      )}

      {/* Merchandise List */}
      <InfiniteList<MerchandiseListItem>
        data={listData}
        renderItem={renderMerchandiseItem}
        keyExtractor={keyExtractor}
        onLoadMore={loadMore}
        hasNextPage={hasNextPage}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        onRefresh={refresh}
        isRefreshing={isRefreshing}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        showSearch={true}
        isSearching={isSearching}
        searchPlaceholder="Rechercher un article..."
        searchDebounceMs={300} // Faster debounce for better UX
        emptyTitle="Aucun article trouvé"
        emptySubtitle="Aucun article n'est disponible pour cette école ou ne correspond à votre recherche."
        emptyIcon={<EmptyIcon />}
        error={error}
        onRetry={retry}
        ListHeaderComponent={ListHeaderComponent}
        estimatedItemSize={140}
        accessibilityLabel="Liste des marchandises"
      />

      {/* Filter Modal */}
      <BottomModal
        visible={showFilterModal}
        onClose={handleCloseFilter}
        title="Filtrer par catégorie"
        subtitle="Choisissez une catégorie"
        height="auto"
      >
        {FilterModalContent}
      </BottomModal>

      {/* Cart Modal */}
      <BottomModal
        visible={cartModalVisible}
        onClose={handleCloseCart}
        title={`Panier (${cartStats.count})`}
        subtitle={`Total: ${cartStats.total.toLocaleString()} CFA`}
        height="auto"
      >
        <View style={styles.cartModalContainer}>
          {cartItems.length === 0 ? (
            <View style={{ paddingVertical: spacingY._20 }}>
              <Text style={styles.errorSubtext}>Votre panier est vide.</Text>
            </View>
          ) : (
            <View>
              {cartItems.map(item => (
                <View key={item.schoolMerchandiseId.toString()} style={styles.cartItemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cartItemTitle}>{item.schoolMerchandiseName} x{item.quantity}</Text>
                    <Text style={styles.cartItemPrice}>{(item.schoolMerchandisePrice * item.quantity).toLocaleString()} CFA</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => handleDecrement(item.schoolMerchandiseId)} style={{ marginRight: spacingX._7 }}>
                      <Ionicons name="remove-circle-outline" size={scale(20)} color={colors.text.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleIncrement(item.schoolMerchandiseId)} style={{ marginRight: spacingX._7 }}>
                      <Ionicons name="add-circle-outline" size={scale(20)} color={colors.primary.main} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRemoveFromCart(item.schoolMerchandiseId)} style={styles.cartItemRemove}>
                      <Ionicons name="trash" size={scale(18)} color={colors.error.main} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <View style={styles.cartFooter}>
                <Text style={styles.cartTotalText}>Total</Text>
                <Text style={styles.cartTotalText}>{cartStats.total.toLocaleString()} CFA</Text>
              </View>

              <View style={{ flexDirection: 'row', gap: spacingX._10, marginTop: spacingY._15 }}>
                <SecondaryButton title="Continuer" onPress={handleCloseCart} style={{ flex: 1 }} />
                <PrimaryButton title={isPaying ? '' : 'Payer'} onPress={handlePay} style={{ flex: 1 }} disabled={isPaying}>
                  {isPaying && <ActivityIndicator color="#fff" />}
                </PrimaryButton>
              </View>
            </View>
          )}
        </View>
      </BottomModal>

      {/* Payment Confirmation Modal */}
      <BottomModal
        visible={showPaymentConfirmModal}
        onClose={() => !isPaying && setShowPaymentConfirmModal(false)}
        title="Confirmer le paiement"
        subtitle="Vérifiez les détails avant de continuer"
        height={SCREEN_HEIGHT * 0.6}
      >
        <View style={styles.paymentConfirmContent}>
          {/* Cart Items */}
          <View style={styles.paymentDetailsSection}>
            <Text style={styles.sectionTitle}>Articles</Text>
            {cartItems.map(item => (
              <View key={item.schoolMerchandiseId.toString()} style={styles.paymentDetailRow}>
                <Text style={styles.detailLabel}>{item.schoolMerchandiseName}</Text>
                <Text style={styles.detailValue}>x{item.quantity}</Text>
                <Text style={styles.detailValue}>{(item.schoolMerchandisePrice * item.quantity).toLocaleString()} CFA</Text>
              </View>
            ))}
            <View style={[styles.paymentDetailRow, styles.amountRow]}>
              <Text style={styles.amountLabel}>Total à payer</Text>
              <Text style={styles.amountValue}>{cartStats.total.toLocaleString()} CFA</Text>
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.paymentMethodSection}>
            <Text style={styles.sectionTitle}>Méthode de paiement</Text>
            <View style={styles.paymentMethodCard}>
              <View style={styles.airtelLogoContainer}>
                <Ionicons name="phone-portrait" size={scale(24)} color={colors.error.main} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.methodTitle}>Airtel Money</Text>
                <Text style={styles.methodPhone}>{userInfo?.phoneNumber || ''}</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', gap: spacingX._10, marginTop: spacingY._20 }}>
            <SecondaryButton
              title="Annuler"
              onPress={() => setShowPaymentConfirmModal(false)}
              style={{ flex: 1 }}
              disabled={isPaying}
            />
            <PrimaryButton
              title={isPaying ? '' : 'Confirmer'}
              onPress={handlePay}
              style={{ flex: 1 }}
              disabled={isPaying}
            >
              {isPaying && <ActivityIndicator color="#fff" />}
            </PrimaryButton>
          </View>
        </View>
      </BottomModal>

      {/* Payment Success Modal */}
      <BottomModal
        visible={showPaymentSuccessModal}
        onClose={() => {
          setShowPaymentSuccessModal(false);
          setCartItems([]);
        }}
        title="Paiement initié"
        subtitle="Suivez les instructions"
        height={SCREEN_HEIGHT * 0.5}
      >
        <View style={styles.successModalContent}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={scale(80)} color={colors.success.main} />
          </View>

          <Text style={styles.successTitle}>Paiement en cours</Text>
          <Text style={styles.successMessage}>
            Vous allez recevoir une notification d&apos;Airtel Money sur votre téléphone.
          </Text>
          <Text style={styles.successInstruction}>
            Veuillez entrer votre code PIN pour confirmer le paiement de {paymentAmount.toLocaleString()} CFA
          </Text>

          {/* Transaction Reference */}
          <View style={styles.referenceContainer}>
            <Text style={styles.referenceLabel}>Référence de transaction</Text>
            <Text style={styles.referenceValue}>{paymentReference}</Text>
          </View>

          <PrimaryButton
            title="Compris"
            onPress={() => {
              setShowPaymentSuccessModal(false);
              setCartItems([]);
            }}
            style={{ marginTop: spacingY._20 }}
          />
        </View>
      </BottomModal>
    </ScreenView>
  );
};

export default MerchandisesScreen;

const styles = StyleSheet.create({
  // Header and cart
  cartBadge: {
    position: 'absolute',
    top: spacingY._15,
    right: spacingX._15,
    backgroundColor: colors.error.main,
    borderRadius: scale(10),
    minWidth: scale(20),
    height: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  cartBadgeText: {
    fontSize: scaleFont(12),
    fontWeight: 'bold',
    color: colors.text.white,
  },

  // List header
  header: {
    paddingVertical: spacingY._15,
    paddingHorizontal: 4,
  },
  subtitle: {
    fontSize: scaleFont(14),
    color: colors.text.secondary,
    marginBottom: spacingY._5,
  },
  filterInfo: {
    backgroundColor: colors.primary.light,
    paddingHorizontal: spacingX._10,
    paddingVertical: spacingY._5,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  filterText: {
    fontSize: scaleFont(12),
    color: colors.text.white,
    fontWeight: '500',
  },

  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacingX._30,
  },
  errorText: {
    fontSize: scaleFont(18),
    fontWeight: '600',
    color: colors.error.main,
    textAlign: 'center',
    marginTop: spacingY._15,
  },
  errorSubtext: {
    fontSize: scaleFont(14),
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacingY._5,
  },

  // Filter modal
  filterModalContent: {
    flex: 1,
    paddingTop: spacingY._10,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacingY._15,
    paddingHorizontal: spacingX._5,
    borderBottomWidth: 1,
    borderBottomColor: colors.border?.light || '#e1e5e9',
  },
  categoryOptionSelected: {
    backgroundColor: colors.primary.light + '20',
  },
  categoryOptionText: {
    fontSize: scaleFont(16),
    color: colors.text.primary,
    flex: 1,
  },
  categoryOptionTextSelected: {
    color: colors.primary.main,
    fontWeight: '600',
  },
  filterActions: {
    flexDirection: 'row',
    gap: spacingX._10,
    marginTop: spacingY._25,
  },
  filterButton: {
    flex: 1,
  },
  // Cart modal styles
  cartModalContainer: {
    paddingVertical: spacingY._10,
  },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacingY._12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border?.light || '#e6e9ed',
  },
  cartItemTitle: {
    fontSize: scaleFont(16),
    color: colors.text.primary,
    fontWeight: '600',
  },
  cartItemPrice: {
    fontSize: scaleFont(14),
    color: colors.text.secondary,
    marginTop: spacingY._5,
  },
  cartItemRemove: {
    marginLeft: spacingX._10,
    padding: spacingX._10,
  },
  cartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacingY._12,
    borderTopWidth: 1,
    borderTopColor: colors.border?.light || '#e6e9ed',
  },
  cartTotalText: {
    fontSize: scaleFont(16),
    fontWeight: '700',
    color: colors.text.primary,
  },

  // Payment confirmation modal styles
  paymentConfirmContent: {
    paddingVertical: spacingY._10,
  },
  paymentDetailsSection: {
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    padding: spacingX._15,
    marginBottom: spacingY._15,
  },
  sectionTitle: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacingY._10,
    textTransform: 'uppercase',
  },
  paymentDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacingY._7,
    borderBottomWidth: 1,
    borderBottomColor: colors.border?.light || '#e6e9ed',
  },
  detailLabel: {
    fontSize: scaleFont(14),
    color: colors.text.primary,
    flex: 2,
  },
  detailValue: {
    fontSize: scaleFont(14),
    color: colors.text.primary,
    fontWeight: '500',
    marginLeft: spacingX._5,
  },
  amountRow: {
    borderBottomWidth: 0,
    marginTop: spacingY._5,
    paddingTop: spacingY._10,
    borderTopWidth: 2,
    borderTopColor: colors.primary.light,
  },
  amountLabel: {
    fontSize: scaleFont(16),
    fontWeight: '700',
    color: colors.text.primary,
  },
  amountValue: {
    fontSize: scaleFont(18),
    fontWeight: '700',
    color: colors.primary.main,
  },
  paymentMethodSection: {
    marginBottom: spacingY._10,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    padding: spacingX._15,
    borderWidth: 2,
    borderColor: colors.error.main + '20',
  },
  airtelLogoContainer: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: colors.error.main + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacingX._12,
  },
  methodTitle: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacingY._3,
  },
  methodPhone: {
    fontSize: scaleFont(14),
    color: colors.text.secondary,
  },

  // Payment success modal styles
  successModalContent: {
    paddingVertical: spacingY._15,
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: spacingY._20,
  },
  successTitle: {
    fontSize: scaleFont(20),
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacingY._10,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: scaleFont(14),
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacingY._10,
    paddingHorizontal: spacingX._20,
  },
  successInstruction: {
    fontSize: scaleFont(14),
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacingY._20,
    paddingHorizontal: spacingX._20,
    fontWeight: '500',
  },
  referenceContainer: {
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    padding: spacingX._15,
    width: '100%',
    alignItems: 'center',
  },
  referenceLabel: {
    fontSize: scaleFont(12),
    color: colors.text.secondary,
    marginBottom: spacingY._5,
    textTransform: 'uppercase',
  },
  referenceValue: {
    fontSize: scaleFont(16),
    fontWeight: '700',
    color: colors.primary.main,
  },
});