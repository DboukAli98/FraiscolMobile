import { BottomModal } from '@/components/BottomModal/BottomModal';
import { NotificationItem } from '@/components/ListItems/NotificationItem';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { ScreenView } from '@/components/ScreenView/ScreenView';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { useNotificationsList } from '@/hooks/useNotificationsList';
import { Notification } from '@/services/notificationServices';
import { scaleFont } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function NotificationsScreen() {
    const {
        notifications,
        isLoading,
        isRefreshing,
        isLoadingMore,
        error,
        unreadCount,
        hasMore,
        refresh,
        loadMore,
        markAllRead,
        markAsRead,
        retry,
    } = useNotificationsList({
        type: '',
        pageSize: 20,
        autoFetch: true,
    });

    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleNotificationPress = (notification: Notification) => {
        setSelectedNotification(notification);
        setIsModalVisible(true);

        // Mark as read
        if (!notification.isRead) {
            markAsRead(notification.notificationId);
        }
    };

    const handleMarkAllRead = async () => {
        const success = await markAllRead();
        if (success) {
            console.log('All notifications marked as read');
        }
    };

    const handleBack = () => {
        router.back();
    };

    const renderNotification = ({ item }: { item: Notification }) => (
        <NotificationItem
            notification={item}
            onPress={handleNotificationPress}
        />
    );

    const renderEmptyComponent = () => {
        if (isLoading) return null;

        return (
            <View style={styles.emptyContainer}>
                <Ionicons
                    name="notifications-off-outline"
                    size={64}
                    color={colors.text.secondary}
                />
                <Text style={styles.emptyText}>Aucune notification</Text>
                <Text style={styles.emptySubtext}>
                    {"Vous n'avez aucune notification pour le moment"}
                </Text>
            </View>
        );
    };

    const renderLoadingFooter = () => {
        if (!isLoadingMore) return null;

        return (
            <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color={colors.primary.main} />
                <Text style={styles.loadingText}>Chargement...</Text>
            </View>
        );
    };

    const renderErrorComponent = () => (
        <View style={styles.errorContainer}>
            <Ionicons
                name="alert-circle-outline"
                size={64}
                color={colors.error.main}
            />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={retry}>
                <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
        </View>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            {unreadCount > 0 && (
                <View style={styles.unreadBanner}>
                    <Text style={styles.unreadText}>
                        {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
                    </Text>
                    <TouchableOpacity onPress={handleMarkAllRead}>
                        <Text style={styles.markAllReadText}>Tout marquer comme lu</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    if (isLoading && notifications.length === 0) {
        return (
            <ScreenView safeArea backgroundColor={colors.background.default}>
                <PageHeader title="Notifications" onBack={handleBack} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                    <Text style={styles.loadingText}>Chargement...</Text>
                </View>
            </ScreenView>
        );
    }

    if (error && notifications.length === 0) {
        return (
            <ScreenView safeArea backgroundColor={colors.background.default}>
                <PageHeader title="Notifications" onBack={handleBack} />
                {renderErrorComponent()}
            </ScreenView>
        );
    }

    return (
        <ScreenView safeArea padding={false} backgroundColor={colors.background.default}>
            <PageHeader title="Notifications" onBack={handleBack} />

            <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={(item) => item.notificationId.toString()}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmptyComponent}
                ListFooterComponent={renderLoadingFooter}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={refresh}
                        tintColor={colors.primary.main}
                        colors={[colors.primary.main]}
                    />
                }
                onEndReached={() => {
                    if (hasMore && !isLoadingMore) {
                        loadMore();
                    }
                }}
                onEndReachedThreshold={0.5}
                contentContainerStyle={
                    notifications.length === 0 && styles.emptyList
                }
            />

            {/* Notification Detail Modal */}
            <BottomModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                title={selectedNotification?.title || 'Détails'}
                height={0.6}
            >
                {selectedNotification && (
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View
                                style={[
                                    styles.modalIcon,
                                    {
                                        backgroundColor:
                                            selectedNotification.type === 'Payment'
                                                ? colors.success.main + '20'
                                                : selectedNotification.type === 'Alert'
                                                    ? colors.error.main + '20'
                                                    : colors.primary.main + '20',
                                    },
                                ]}
                            >
                                <Ionicons
                                    name={
                                        selectedNotification.type === 'Payment'
                                            ? 'cash-outline'
                                            : selectedNotification.type === 'Alert'
                                                ? 'alert-circle-outline'
                                                : 'notifications-outline'
                                    }
                                    size={32}
                                    color={
                                        selectedNotification.type === 'Payment'
                                            ? colors.success.main
                                            : selectedNotification.type === 'Alert'
                                                ? colors.error.main
                                                : colors.primary.main
                                    }
                                />
                            </View>
                        </View>

                        <Text style={styles.modalTitle}>
                            {selectedNotification.title}
                        </Text>

                        <Text style={styles.modalMessage}>
                            {selectedNotification.message}
                        </Text>

                        <View style={styles.modalInfo}>
                            <View style={styles.infoRow}>
                                <Ionicons
                                    name="time-outline"
                                    size={16}
                                    color={colors.text.secondary}
                                />
                                <Text style={styles.infoText}>
                                    {new Date(
                                        selectedNotification.createdAt
                                    ).toLocaleString('fr-FR', {
                                        dateStyle: 'medium',
                                        timeStyle: 'short',
                                    })}
                                </Text>
                            </View>

                            {selectedNotification.type && (
                                <View style={styles.infoRow}>
                                    <Ionicons
                                        name="pricetag-outline"
                                        size={16}
                                        color={colors.text.secondary}
                                    />
                                    <Text style={styles.infoText}>
                                        {selectedNotification.type}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}
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
    loadingText: {
        marginTop: spacingY._10,
        fontSize: scaleFont(16),
        color: colors.text.secondary,
    },
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
        marginVertical: spacingY._20,
    },
    retryButton: {
        backgroundColor: colors.primary.main,
        paddingHorizontal: spacingX._20,
        paddingVertical: spacingY._10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: colors.text.white,
        fontSize: scaleFont(14),
        fontWeight: '600',
    },
    header: {
        backgroundColor: colors.background.default,
    },
    unreadBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.primary.light + '15',
        paddingHorizontal: spacingX._15,
        paddingVertical: spacingY._12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border?.light || '#E5E7EB',
    },
    unreadText: {
        fontSize: scaleFont(14),
        color: colors.text.primary,
        fontWeight: '500',
    },
    markAllReadText: {
        fontSize: scaleFont(14),
        color: colors.primary.main,
        fontWeight: '600',
    },
    emptyList: {
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacingY._80,
    },
    emptyText: {
        fontSize: scaleFont(18),
        fontWeight: '600',
        color: colors.text.primary,
        marginTop: spacingY._15,
    },
    emptySubtext: {
        fontSize: scaleFont(14),
        color: colors.text.secondary,
        marginTop: spacingY._7,
        textAlign: 'center',
        paddingHorizontal: spacingX._30,
    },
    loadingFooter: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacingY._20,
    },
    modalContent: {
        padding: spacingX._20,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: spacingY._20,
    },
    modalIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: scaleFont(20),
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: spacingY._15,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: scaleFont(16),
        color: colors.text.secondary,
        lineHeight: scaleFont(24),
        marginBottom: spacingY._25,
    },
    modalInfo: {
        borderTopWidth: 1,
        borderTopColor: colors.border?.light || '#E5E7EB',
        paddingTop: spacingY._15,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacingY._10,
    },
    infoText: {
        fontSize: scaleFont(14),
        color: colors.text.secondary,
        marginLeft: spacingX._7,
    },
});
