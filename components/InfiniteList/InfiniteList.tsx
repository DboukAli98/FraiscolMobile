// components/List/InfiniteList.tsx
import { colors, radius, shadows, spacingX, spacingY } from '@/constants/theme';
import { scaleFont, verticalScale } from '@/utils/stylings';
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';

// Generic interfaces for the list component
export interface ListItem {
    id: string | number;
    [key: string]: any;
}

export interface PaginatedResponse<T> {
    data: T[] | null;
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    hasNextPage?: boolean;
}

export interface InfiniteListProps<T extends ListItem> {
    // Required props
    data: T[];
    renderItem: ListRenderItem<T>;
    keyExtractor?: (item: T, index: number) => string;

    // Pagination props
    onLoadMore: () => Promise<void>;
    hasNextPage: boolean;
    isLoading: boolean;
    isLoadingMore: boolean;

    // Refresh props
    onRefresh?: () => Promise<void>;
    isRefreshing?: boolean;

    // Search props
    searchQuery?: string;
    onSearch?: (query: string) => void;
    searchPlaceholder?: string;
    showSearch?: boolean;

    // Empty state props
    emptyTitle?: string;
    emptySubtitle?: string;
    emptyIcon?: React.ReactNode;

    // Error state props
    error?: string | null;
    onRetry?: () => void;

    // Styling props
    contentContainerStyle?: ViewStyle;
    itemSeparatorHeight?: number;
    showItemSeparator?: boolean;

    // Performance props
    estimatedItemSize?: number;

    // Header/Footer components
    ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
    ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;

    // FlashList props passthrough
    horizontal?: boolean;
    numColumns?: number;

    // Accessibility
    accessibilityLabel?: string;
}

export const InfiniteList = <T extends ListItem>({
    data,
    renderItem,
    keyExtractor,
    onLoadMore,
    hasNextPage,
    isLoading,
    isLoadingMore,
    onRefresh,
    isRefreshing = false,
    searchQuery = '',
    onSearch,
    searchPlaceholder = 'Search...',
    showSearch = false,
    emptyTitle = 'No items found',
    emptySubtitle = 'Try adjusting your search or refresh the list',
    emptyIcon,
    error,
    onRetry,
    contentContainerStyle,
    itemSeparatorHeight = spacingY._10,
    showItemSeparator = true,
    estimatedItemSize = 80, // Required for FlashList
    ListHeaderComponent,
    ListFooterComponent,
    horizontal = false,
    numColumns = 1,
    accessibilityLabel,
}: InfiniteListProps<T>) => {
    const [searchText, setSearchText] = useState(searchQuery);
    const flashListRef = useRef<FlashList<T>>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | number | null>(null);

    // Handle search with debouncing
    const handleSearchChange = useCallback((text: string) => {
        setSearchText(text);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            onSearch?.(text);
        }, 300); // 300ms debounce
    }, [onSearch]);

    // Clean up search timeout
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    // Handle end reached with throttling
    const [isLoadingMoreThrottled, setIsLoadingMoreThrottled] = useState(false);

    const handleEndReached = useCallback(async () => {
        if (hasNextPage && !isLoading && !isLoadingMore && !isLoadingMoreThrottled) {
            setIsLoadingMoreThrottled(true);
            try {
                await onLoadMore();
            } finally {
                // Reset throttle after a short delay
                setTimeout(() => setIsLoadingMoreThrottled(false), 1000);
            }
        }
    }, [hasNextPage, isLoading, isLoadingMore, isLoadingMoreThrottled, onLoadMore]);

    // Custom key extractor
    const defaultKeyExtractor = useCallback((item: T, index: number) => {
        return item.id?.toString() || index.toString();
    }, []);

    // Item separator component
    const ItemSeparator = useCallback(() => {
        if (!showItemSeparator) return null;
        return <View style={{ height: itemSeparatorHeight }} />;
    }, [showItemSeparator, itemSeparatorHeight]);

    // Loading footer component
    const LoadingFooter = useCallback(() => {
        if (!isLoadingMore) return null;

        return (
            <View style={styles.loadingFooter}>
                <ActivityIndicator
                    size="small"
                    color={colors.primary.main}
                />
                <Text style={styles.loadingText}>Loading more...</Text>
            </View>
        );
    }, [isLoadingMore]);

    // Empty state component
    const EmptyComponent = useCallback(() => {
        // Don't show empty component if we're loading initially
        if (isLoading && data.length === 0) {
            return null; // Let FlashList handle the loading state
        }

        if (error) {
            return (
                <View style={styles.centerContainer}>
                    <Text style={styles.errorTitle}>Something went wrong</Text>
                    <Text style={styles.errorSubtitle}>{error}</Text>
                    {onRetry && (
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={onRetry}
                        >
                            <Text style={styles.retryButtonText}>Try Again</Text>
                        </TouchableOpacity>
                    )}
                </View>
            );
        }

        // Only show empty state if we're not loading and have no data
        if (!isLoading && data.length === 0) {
            return (
                <View style={styles.centerContainer}>
                    {emptyIcon && (
                        <View style={styles.emptyIcon}>
                            {emptyIcon}
                        </View>
                    )}
                    <Text style={styles.emptyTitle}>{emptyTitle}</Text>
                    <Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
                </View>
            );
        }

        return null;
    }, [isLoading, error, emptyTitle, emptySubtitle, emptyIcon, onRetry, data.length]);

    // Search input component
    const SearchInput = useCallback(() => {
        if (!showSearch) return null;

        return (
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    value={searchText}
                    onChangeText={handleSearchChange}
                    placeholder={searchPlaceholder}
                    placeholderTextColor={colors.text.disabled}
                />
            </View>
        );
    }, [showSearch, searchText, searchPlaceholder, handleSearchChange]);

    // Refresh control
    const refreshControl = onRefresh ? (
        <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary.main}
            colors={[colors.primary.main]}
        />
    ) : undefined;

    return (
        <View style={styles.container}>
            <SearchInput />

            {/* Show loading overlay during initial load */}
            {isLoading && data.length === 0 && (
                <View style={styles.initialLoadingContainer}>
                    <ActivityIndicator
                        size="large"
                        color={colors.primary.main}
                    />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            )}

            <FlashList
                ref={flashListRef}
                data={data}
                renderItem={renderItem}
                keyExtractor={keyExtractor || defaultKeyExtractor}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.1}
                refreshControl={refreshControl}
                ListEmptyComponent={EmptyComponent}
                ListHeaderComponent={ListHeaderComponent}
                ListFooterComponent={
                    <>
                        {ListFooterComponent}
                        <LoadingFooter />
                    </>
                }
                ItemSeparatorComponent={ItemSeparator}
                // FlashList requires estimatedItemSize instead of getItemLayout
                estimatedItemSize={estimatedItemSize}
                // Layout props
                horizontal={horizontal}
                numColumns={numColumns}
                // Accessibility
                accessibilityLabel={accessibilityLabel}
                // FlashList specific optimizations
                drawDistance={400}
                estimatedListSize={{
                    height: horizontal ? estimatedItemSize : 600,
                    width: horizontal ? 600 : estimatedItemSize,
                }}
                // FlashList padding handling
                contentContainerStyle={{
                    paddingHorizontal: contentContainerStyle?.paddingHorizontal || spacingX._20,
                    paddingBottom: contentContainerStyle?.paddingBottom || spacingY._20,
                }}
            />
        </View>
    );
};

// Pre-configured list variants
export const SimpleInfiniteList = <T extends ListItem>(
    props: Omit<InfiniteListProps<T>, 'showSearch' | 'showItemSeparator'>
) => (
    <InfiniteList
        {...props}
        showSearch={false}
        showItemSeparator={true}
    />
);

export const SearchableInfiniteList = <T extends ListItem>(
    props: Omit<InfiniteListProps<T>, 'showSearch'>
) => (
    <InfiniteList
        {...props}
        showSearch={true}
    />
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.default,
    },

    // Search styles
    searchContainer: {
        paddingHorizontal: spacingX._20,
        paddingVertical: spacingY._10,
        backgroundColor: colors.background.default,
        borderBottomWidth: 1,
        borderBottomColor: colors.border?.light || '#e1e5e9',
    },
    searchInput: {
        height: verticalScale(40),
        borderWidth: 1,
        borderColor: colors.border?.main || '#d1d5db',
        borderRadius: radius._10,
        paddingHorizontal: spacingX._15,
        fontSize: scaleFont(16),
        color: colors.text.primary,
        backgroundColor: colors.background.paper,
    },

    // Loading states
    initialLoadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background.default,
        zIndex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacingX._30,
        paddingVertical: spacingY._50,
    },
    loadingFooter: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacingY._20,
    },
    loadingText: {
        marginLeft: spacingX._10,
        fontSize: scaleFont(14),
        color: colors.text.secondary,
    },

    // Empty state
    emptyContentContainer: {
        flexGrow: 1,
    },
    emptyIcon: {
        marginBottom: spacingY._20,
    },
    emptyTitle: {
        fontSize: scaleFont(18),
        fontWeight: '600',
        color: colors.text.primary,
        textAlign: 'center',
        marginBottom: spacingY._10,
    },
    emptySubtitle: {
        fontSize: scaleFont(14),
        color: colors.text.secondary,
        textAlign: 'center',
        lineHeight: scaleFont(20),
    },

    // Error state
    errorTitle: {
        fontSize: scaleFont(18),
        fontWeight: '600',
        color: colors.error.main,
        textAlign: 'center',
        marginBottom: spacingY._10,
    },
    errorSubtitle: {
        fontSize: scaleFont(14),
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: spacingY._20,
        lineHeight: scaleFont(20),
    },
    retryButton: {
        backgroundColor: colors.primary.main,
        paddingHorizontal: spacingX._20,
        paddingVertical: spacingY._12,
        borderRadius: radius._10,
        ...shadows.sm,
    },
    retryButtonText: {
        color: colors.text.white,
        fontSize: scaleFont(14),
        fontWeight: '600',
    },
});

export default InfiniteList;