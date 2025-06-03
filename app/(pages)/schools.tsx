// app/(pages)/schools.tsx
import { InfiniteList } from '@/components/InfiniteList/InfiniteList';
import { SchoolItem } from '@/components/ListItems/SchoolItem';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { ScreenView } from '@/components/ScreenView/ScreenView';
import { colors, spacingY } from '@/constants/theme';
import { useSchoolsData } from '@/hooks/useSchoolsData';
import { School } from '@/services/childrenServices';
import { Ionicons } from '@expo/vector-icons';
import { ListRenderItem } from '@shopify/flash-list';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface SchoolListItem extends School {
    id: string | number;
}

const SchoolsScreen = () => {
    const {
        schools,
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
    } = useSchoolsData({
        pageSize: 15,
        initialSearch: '',
    });

    // Transform schools data to include id for the list
    const listData: SchoolListItem[] = schools.map(school => ({
        ...school,
        id: school.schoolId,
    }));

    const renderSchoolItem: ListRenderItem<SchoolListItem> = useCallback(({ item }) => (
        <SchoolItem
            school={item}
            onPress={handleSchoolPress}
            onContact={handleContactSchool}
            onWebsite={handleSchoolWebsite}
        />
    ), []);

    const handleSchoolPress = useCallback((school: School) => {
        router.push({
            pathname: '/(pages)/school-details/[id]',
            params: { id: school.schoolId.toString() }
        });
    }, []);

    const handleContactSchool = useCallback((school: School) => {
        Alert.alert(
            'Contacter l\'école',
            `Comment souhaitez-vous contacter ${school.schoolName}?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Téléphone',
                    onPress: () => {
                        if (school.schoolPhoneNumber) {
                            const phoneUrl = `tel:${school.schoolPhoneNumber}`;
                            import('expo-linking').then(({ default: Linking }) => {
                                Linking.openURL(phoneUrl);
                            });
                        } else {
                            Alert.alert('Erreur', 'Numéro de téléphone non disponible');
                        }
                    }
                },
                {
                    text: 'Email',
                    onPress: () => {
                        if (school.schoolEmail) {
                            const emailUrl = `mailto:${school.schoolEmail}`;
                            import('expo-linking').then(({ default: Linking }) => {
                                Linking.openURL(emailUrl);
                            });
                        } else {
                            Alert.alert('Erreur', 'Email non disponible');
                        }
                    }
                }
            ]
        );
    }, []);

    const handleSchoolWebsite = useCallback((school: School) => {
        if (school.schoolWebsite) {
            import('expo-linking').then(({ default: Linking }) => {
                Linking.openURL(school.schoolWebsite);
            });
        } else {
            Alert.alert('Erreur', 'Site web non disponible');
        }
    }, []);

    const keyExtractor = useCallback((item: SchoolListItem) =>
        item.schoolId.toString(),
        []);

    const ListHeaderComponent = useCallback(() => (
        <View style={styles.header}>
            {totalCount > 0 && (
                <Text style={styles.subtitle}>
                    {totalCount} école{totalCount > 1 ? 's' : ''} trouvée{totalCount > 1 ? 's' : ''}
                </Text>
            )}
        </View>
    ), [totalCount]);

    const EmptyIcon = useCallback(() => (
        <Ionicons
            name="school-outline"
            size={64}
            color={colors.text.disabled}
        />
    ), []);

    const handleBack = React.useCallback(() => {
        router.back();
    }, []);

    return (
        <ScreenView
            safeArea={true}
            padding={false}
            paddingVertical={true}
            backgroundColor={colors.background.default}
        >
            <PageHeader title="Vos Écoles" onBack={handleBack} />
            <InfiniteList<SchoolListItem>
                data={listData}
                renderItem={renderSchoolItem}
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
                searchPlaceholder="Rechercher une école..."
                emptyTitle="Aucune école trouvée"
                emptySubtitle="Aucune école n'est associée à votre compte ou ne correspond à votre recherche."
                emptyIcon={<EmptyIcon />}
                error={error}
                onRetry={retry}
                ListHeaderComponent={ListHeaderComponent}
                estimatedItemSize={150} // Add this for FlashList (schools might be taller than children)
                accessibilityLabel="Liste des écoles"
            // Remove these FlatList-specific props:
            // windowSize={10}
            // maxToRenderPerBatch={10}
            // removeClippedSubviews={true}
            // contentContainerStyle={styles.listContainer} // Handled internally now
            />
        </ScreenView>
    );
};

export default SchoolsScreen;

const styles = StyleSheet.create({
    // Remove listContainer since it's handled internally
    header: {
        paddingVertical: spacingY._20,
        paddingHorizontal: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text.secondary,
        marginBottom: spacingY._5,
    },
    subtitle: {
        fontSize: 14,
        color: colors.text.secondary,
    },
});