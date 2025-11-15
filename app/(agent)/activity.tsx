import { LogActivityModal } from '@/components/ActionModals/LogActivityModal';
import { BottomModal } from '@/components/BottomModal/BottomModal';
import { ScreenView } from '@/components/ScreenView/ScreenView';
import { SearchInput } from '@/components/SearchInput/SearchInput';
import { colors, getTextStyle, spacingX, spacingY } from '@/constants/theme';
import { useActivitiesList } from '@/hooks/useActivitiesList';
import {
    CollectingAgentActivityDto,
    getActivityTypeIcon
} from '@/services/collectingAgentActivityServices';
import { Ionicons } from '@expo/vector-icons';
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

export default function AgentActivity() {
    const {
        activities,
        isLoading,
        isRefreshing,
        isLoadingMore,
        error,
        refresh,
        loadMore,
        retry,
    } = useActivitiesList({
        pageSize: 15,
        autoFetch: true,
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [isLogModalVisible, setIsLogModalVisible] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<CollectingAgentActivityDto | null>(null);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

    const filteredActivities = activities.filter((activity) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            activity.activityDescription.toLowerCase().includes(query) ||
            activity.parentName?.toLowerCase().includes(query) ||
            activity.activityTypeDisplayName.toLowerCase().includes(query)
        );
    });

    const handleActivityPress = (activity: CollectingAgentActivityDto) => {
        setSelectedActivity(activity);
        setIsDetailModalVisible(true);
    };

    const closeDetailModal = () => {
        setIsDetailModalVisible(false);
        setSelectedActivity(null);
    };

    const renderActivityItem = ({ item }: { item: CollectingAgentActivityDto }) => {
        const iconName = getActivityTypeIcon(item.activityType);
        const timeAgo = getTimeAgo(item.activityDate);

        return (
            <TouchableOpacity
                style={styles.activityCard}
                onPress={() => handleActivityPress(item)}
                activeOpacity={0.7}
            >
                <View style={styles.activityIcon}>
                    <Ionicons name={iconName as any} size={20} color={colors.primary.main} />
                </View>
                <View style={{ flex: 1 }}>
                    <View style={styles.activityHeader}>
                        <Text style={styles.activityType}>{item.activityTypeDisplayName}</Text>
                        <Text style={styles.activityTime}>{timeAgo}</Text>
                    </View>
                    <Text style={styles.activityDescription} numberOfLines={2}>
                        {item.activityDescription}
                    </Text>
                    {item.parentName && (
                        <View style={styles.activityInfo}>
                            <Ionicons name="person-outline" size={14} color={colors.text.secondary} />
                            <Text style={styles.activityParent}>{item.parentName}</Text>
                        </View>
                    )}
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
        );
    };

    const renderDetailModal = () => {
        if (!selectedActivity) return null;

        const iconName = getActivityTypeIcon(selectedActivity.activityType);

        return (
            <BottomModal
                visible={isDetailModalVisible}
                onClose={closeDetailModal}
                title="Détails de l'activité"
                height="auto"
            >
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <View style={styles.modalIcon}>
                            <Ionicons name={iconName as any} size={24} color={colors.primary.main} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.modalTitle}>{selectedActivity.activityTypeDisplayName}</Text>
                            <Text style={styles.modalDate}>
                                {new Date(
                                    selectedActivity.activityDate.endsWith('Z')
                                        ? selectedActivity.activityDate
                                        : selectedActivity.activityDate + 'Z'
                                ).toLocaleString('fr-FR', {
                                    dateStyle: 'long',
                                    timeStyle: 'short',
                                })}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.modalSection}>
                        <Text style={styles.modalSectionTitle}>Description</Text>
                        <Text style={styles.modalSectionText}>{selectedActivity.activityDescription}</Text>
                    </View>

                    {selectedActivity.notes && (
                        <View style={styles.modalSection}>
                            <Text style={styles.modalSectionTitle}>Notes</Text>
                            <Text style={styles.modalSectionText}>{selectedActivity.notes}</Text>
                        </View>
                    )}

                    {selectedActivity.parentName && (
                        <View style={styles.modalSection}>
                            <Text style={styles.modalSectionTitle}>Parent concerné</Text>
                            <Text style={styles.modalSectionText}>{selectedActivity.parentName}</Text>
                        </View>
                    )}
                </View>
            </BottomModal>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={64} color={colors.text.secondary} />
            <Text style={styles.emptyTitle}>Aucune activité</Text>
            <Text style={styles.emptyText}>
                {searchQuery
                    ? 'Aucune activité ne correspond à votre recherche'
                    : "Vous n'avez pas encore enregistré d'activité"}
            </Text>
            {!searchQuery && (
                <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => setIsLogModalVisible(true)}
                >
                    <Text style={styles.emptyButtonText}>Enregistrer une activité</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderError = () => (
        <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.error.main} />
            <Text style={styles.errorTitle}>Erreur</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={retry}>
                <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
        </View>
    );

    const renderFooter = () => {
        if (!isLoadingMore) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color={colors.primary.main} />
            </View>
        );
    };

    if (isLoading) {
        return (
            <ScreenView safeArea={true}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                    <Text style={styles.loadingText}>Chargement...</Text>
                </View>
            </ScreenView>
        );
    }

    return (
        <ScreenView safeArea={true} padding={false}>
            <View style={styles.header}>
                <Text style={styles.title}>Mes activités</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setIsLogModalVisible(true)}
                >
                    <Ionicons name="add-outline" size={24} color={colors.text.white} />
                </TouchableOpacity>
            </View>

            <View style={styles.container}>
                <SearchInput
                    searchQuery={searchQuery}
                    onSearch={setSearchQuery}
                    placeholder="Rechercher une activité..."
                    style={styles.searchInput}
                />

                {error ? (
                    renderError()
                ) : (
                    <FlatList
                        data={filteredActivities}
                        renderItem={renderActivityItem}
                        keyExtractor={(item) => item.activityId.toString()}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={renderEmptyState}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={refresh}
                                colors={[colors.primary.main]}
                            />
                        }
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.3}
                        ListFooterComponent={renderFooter}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            <LogActivityModal
                visible={isLogModalVisible}
                onClose={() => setIsLogModalVisible(false)}
                onSuccess={refresh}
            />

            {renderDetailModal()}
        </ScreenView>
    );
}

// Helper function to format time ago
const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    // Parse the UTC date and convert to local time
    const date = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "À l'instant";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours} h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `Il y a ${days} j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacingX._15,
        paddingTop: spacingY._15,
        paddingBottom: spacingY._10,
    },
    title: {
        ...getTextStyle('xl', 'bold', colors.text.primary),
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary.main,
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: colors.background.default,
    },
    searchInput: {
        marginHorizontal: spacingX._15,
        marginBottom: spacingY._10,
    },
    listContent: {
        padding: spacingX._15,
        paddingTop: 0,
        flexGrow: 1,
    },
    activityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.paper,
        borderRadius: 12,
        padding: spacingX._15,
        marginBottom: spacingY._10,
        borderWidth: 1,
        borderColor: colors.border?.light || '#e1e5e9',
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary.light + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacingX._12,
    },
    activityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacingY._5,
    },
    activityType: {
        ...getTextStyle('sm', 'semibold', colors.primary.main),
    },
    activityTime: {
        ...getTextStyle('xs', 'normal', colors.text.secondary),
    },
    activityDescription: {
        ...getTextStyle('sm', 'normal', colors.text.primary),
        marginBottom: spacingY._5,
    },
    activityInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingX._5,
    },
    activityParent: {
        ...getTextStyle('xs', 'normal', colors.text.secondary),
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        ...getTextStyle('sm', 'normal', colors.text.secondary),
        marginTop: spacingY._10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacingY._50,
    },
    emptyTitle: {
        ...getTextStyle('lg', 'bold', colors.text.primary),
        marginTop: spacingY._20,
        marginBottom: spacingY._10,
    },
    emptyText: {
        ...getTextStyle('sm', 'normal', colors.text.secondary),
        textAlign: 'center',
        marginBottom: spacingY._20,
    },
    emptyButton: {
        backgroundColor: colors.primary.main,
        paddingHorizontal: spacingX._30,
        paddingVertical: spacingY._12,
        borderRadius: 8,
    },
    emptyButtonText: {
        ...getTextStyle('sm', 'semibold', colors.text.white),
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
    footer: {
        paddingVertical: spacingY._20,
        alignItems: 'center',
    },
    modalContent: {
        gap: spacingY._20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingX._12,
    },
    modalIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary.light + '20',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        ...getTextStyle('base', 'semibold', colors.text.primary),
    },
    modalDate: {
        ...getTextStyle('sm', 'normal', colors.text.secondary),
        marginTop: spacingY._3,
    },
    modalSection: {
        gap: spacingY._7,
    },
    modalSectionTitle: {
        ...getTextStyle('sm', 'semibold', colors.text.secondary),
    },
    modalSectionText: {
        ...getTextStyle('sm', 'normal', colors.text.primary),
        lineHeight: 20,
    },
});
