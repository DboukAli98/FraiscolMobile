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
import { scale, scaleFont } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import { ListRenderItem } from '@shopify/flash-list';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface MerchandiseListItem extends SchoolMerchandise {
  id: string | number;
}

const MerchandisesScreen = () => {
  const userInfo = useUserInfo();

  // For now, we'll use a hardcoded school ID or get it from user info
  // You might want to get this from navigation params or user's selected school
  const schoolId = userInfo?.schoolId || "2"; // Using "2" as default from your API example

  console.log("schhhhhhh ::: ", schoolId)

  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [cartItems, setCartItems] = useState<SchoolMerchandise[]>([]);

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

  // Transform data for the list
  const listData: MerchandiseListItem[] = merchandises.map(merchandise => ({
    ...merchandise,
    id: merchandise.schoolMerchandiseId,
  }));

  const renderMerchandiseItem: ListRenderItem<MerchandiseListItem> = useCallback(({ item }) => (
    <MerchandiseItem
      merchandise={item}
      onPress={handleMerchandisePress}
      onAddToCart={handleAddToCart}
      showActions={true}
    />
  ), []);

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
  }, []);

  const handleAddToCart = useCallback((merchandise: SchoolMerchandise) => {
    // Check if item already in cart
    const existingItem = cartItems.find(item => item.schoolMerchandiseId === merchandise.schoolMerchandiseId);

    if (existingItem) {
      Alert.alert('Déjà dans le panier', 'Cet article est déjà dans votre panier.');
      return;
    }

    setCartItems(prev => [...prev, merchandise]);
    Alert.alert(
      'Ajouté au panier',
      `${merchandise.schoolMerchandiseName} a été ajouté à votre panier.`,
      [{ text: 'OK' }]
    );
  }, [cartItems]);

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

  const handleViewCart = useCallback(() => {
    if (cartItems.length === 0) {
      Alert.alert('Panier vide', 'Votre panier est vide.');
      return;
    }

    const total = cartItems.reduce((sum, item) => sum + item.schoolMerchandisePrice, 0);
    const itemsList = cartItems.map(item => `• ${item.schoolMerchandiseName}`).join('\n');

    Alert.alert(
      `Panier (${cartItems.length} articles)`,
      `${itemsList}\n\nTotal: ${total.toLocaleString()} CFA`,
      [
        { text: 'Continuer', style: 'cancel' },
        { text: 'Commander', onPress: () => handleCheckout() }
      ]
    );
  }, [cartItems]);

  const handleCheckout = useCallback(() => {
    // Implement checkout logic here
    Alert.alert('Commande', 'Fonctionnalité de commande à implémenter.');
  }, []);

  const keyExtractor = useCallback((item: MerchandiseListItem) =>
    item.schoolMerchandiseId.toString(),
    []);

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

  const EmptyIcon = useCallback(() => (
    <Ionicons
      name="bag-outline"
      size={64}
      color={colors.text.disabled}
    />
  ), []);

  const handleBack = React.useCallback(() => {
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
        actions={[
          {
            icon: 'options-outline',
            onPress: handleOpenFilter,
            color: colors.primary.main,
          },
          {
            icon: 'cart-outline',
            onPress: handleViewCart,
            color: cartItems.length > 0 ? colors.success.main : colors.text.secondary,
          }
        ]}
      />

      {/* Cart Badge */}
      {cartItems.length > 0 && (
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
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
        onSearch={search}
        searchQuery={searchQuery}
        showSearch={true}
        searchPlaceholder="Rechercher un article..."
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
        <View style={styles.filterModalContent}>
          {/* Category filters - you can expand this with actual categories */}
          <TouchableOpacity
            style={[
              styles.categoryOption,
              !selectedCategory && styles.categoryOptionSelected
            ]}
            onPress={() => handleApplyFilter(undefined)}
          >
            <Text style={[
              styles.categoryOptionText,
              !selectedCategory && styles.categoryOptionTextSelected
            ]}>
              Toutes les catégories
            </Text>
            {!selectedCategory && (
              <Ionicons name="checkmark" size={scale(20)} color={colors.primary.main} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.categoryOption,
              selectedCategory === 3 && styles.categoryOptionSelected
            ]}
            onPress={() => handleApplyFilter(3)}
          >
            <Text style={[
              styles.categoryOptionText,
              selectedCategory === 3 && styles.categoryOptionTextSelected
            ]}>
              Sacs et accessoires
            </Text>
            {selectedCategory === 3 && (
              <Ionicons name="checkmark" size={scale(20)} color={colors.primary.main} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.categoryOption,
              selectedCategory === 7 && styles.categoryOptionSelected
            ]}
            onPress={() => handleApplyFilter(7)}
          >
            <Text style={[
              styles.categoryOptionText,
              selectedCategory === 7 && styles.categoryOptionTextSelected
            ]}>
              Fournitures scolaires
            </Text>
            {selectedCategory === 7 && (
              <Ionicons name="checkmark" size={scale(20)} color={colors.primary.main} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.categoryOption,
              selectedCategory === 8 && styles.categoryOptionSelected
            ]}
            onPress={() => handleApplyFilter(8)}
          >
            <Text style={[
              styles.categoryOptionText,
              selectedCategory === 8 && styles.categoryOptionTextSelected
            ]}>
              Bouteilles et gourdes
            </Text>
            {selectedCategory === 8 && (
              <Ionicons name="checkmark" size={scale(20)} color={colors.primary.main} />
            )}
          </TouchableOpacity>

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
});