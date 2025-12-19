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
import React, { useCallback, useState } from 'react';
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

    //#region States
    const [isSearching, setIsSearching] = useState(false);
    //#endregion

    // Memoize the list data transformation
    const listData: SchoolListItem[] = React.useMemo(() =>
        schools.map(school => ({
            ...school,
            id: school.schoolId,
        })), [schools]
    );

    // Memoized render item to prevent unnecessary re-renders
    const renderSchoolItem: ListRenderItem<SchoolListItem> = useCallback(({ item }) => (
        <SchoolItem
            school={item}
            onPress={handleSchoolPress}
            onContact={handleContactSchool}
            onWebsite={handleSchoolWebsite}
        />
    ), []); // Empty deps since handlers are memoized below

    // Memoized handlers
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

    // Memoized key extractor
    const keyExtractor = useCallback((item: SchoolListItem) =>
        item.schoolId.toString(),
        []);

    // Memoized search handler with loading state
    const handleSearch = useCallback((query: string) => {
        setIsSearching(true);
        search(query);
        // Reset searching state after a delay (search should complete within this time)
        setTimeout(() => setIsSearching(false), 1000);
    }, [search]);

    // Memoized list header
    const ListHeaderComponent = useCallback(() => (
        <View style={styles.header}>
            <Text style={styles.infoNote}>
                Veuillez noter que ces écoles sont celles où vos enfants sont inscrits.
            </Text>
            {totalCount > 0 && (
                <Text style={styles.subtitle}>
                    {totalCount} école{totalCount > 1 ? 's' : ''} trouvée{totalCount > 1 ? 's' : ''}
                </Text>
            )}
        </View>
    ), [totalCount]);

    // Memoized empty icon
    const EmptyIcon = useCallback(() => (
        <Ionicons
            name="school-outline"
            size={64}
            color={colors.text.disabled}
        />
    ), []);

    const handleBack = useCallback(() => {
        router.back();
    }, []);

    return (
        <ScreenView
            safeArea={true}
            padding={false}
            paddingVertical={true}
            backgroundColor={colors.background.default}
        >
            <PageHeader title="Écoles" onBack={handleBack} />
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
                onSearch={handleSearch}
                searchQuery={searchQuery}
                showSearch={true}
                isSearching={isSearching}
                searchPlaceholder="Rechercher une école..."
                searchDebounceMs={300} // Faster debounce for better UX
                emptyTitle="Aucune école trouvée"
                emptySubtitle="Aucune école n'est associée à votre compte ou ne correspond à votre recherche."
                emptyIcon={<EmptyIcon />}
                error={error}
                onRetry={retry}
                ListHeaderComponent={ListHeaderComponent}
                estimatedItemSize={150} // Estimated height for each school item (schools might be taller than children)
                accessibilityLabel="Liste des écoles"
            />
        </ScreenView>
    );
};

export default SchoolsScreen;

const styles = StyleSheet.create({
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
    infoNote: {
        fontSize: 14,
        color: colors.text.secondary,
        marginBottom: spacingY._10,
        fontStyle: 'italic',
    },
});