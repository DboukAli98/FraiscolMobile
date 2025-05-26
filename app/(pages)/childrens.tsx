// app/(pages)/childrens.tsx
import { InfiniteList } from '@/components/InfiniteList/InfiniteList';
import { ChildItem } from '@/components/ListItems/ChildItem';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { ScreenView } from '@/components/ScreenView/ScreenView';
import { colors, spacingY } from '@/constants/theme';
import { useChildrenData } from '@/hooks/useChildrenData';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import {
    Alert,
    ListRenderItem,
    StyleSheet,
    Text,
    View,
} from 'react-native';


interface Children {
    childId: number;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    schoolName: string;
    schoolGradeName: string;
    fK_ParentId: number;
    fK_SchoolId: number;
    fK_StatusId: number;
    createdOn: string;
    modifiedOn: string | null;
}
interface ChildrenListItem extends Children {
    id: string | number;
}

const ChildrensScreen = () => {

    const {
        children,
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
    } = useChildrenData({
        pageSize: 15,
        initialSearch: '',
    });


    const listData: ChildrenListItem[] = children.map(child => ({
        ...child,
        id: child.childId,
        schoolName: child.schoolName,
        schoolGradeName: child.schoolGradeName,
    }));

    const renderChildItem: ListRenderItem<ChildrenListItem> = useCallback(({ item }) => (
        <ChildItem
            child={item}
            onPress={handleChildPress}
            onEdit={handleEditChild}
            onDelete={handleDeleteChild}
        />
    ), []);


    const handleChildPress = useCallback((child: Children) => {

        router.push({
            pathname: '/(pages)/child-details/[id]',
            params: { id: child.childId }
        });
    }, []);


    const handleEditChild = useCallback((child: Children) => {

        Alert.alert(
            'Modifier l\'enfant',
            `Modifier ${child.firstName} ${child.lastName}?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Modifier',
                    onPress: () => {

                        router.push({
                            pathname: '/(pages)/childrens',
                            params: { childId: child.childId.toString(), edit: 'true' }
                        });
                    }
                }
            ]
        );
    }, []);


    const handleDeleteChild = useCallback((child: Children) => {
        Alert.alert(
            'Supprimer l\'enfant',
            `Êtes-vous sûr de vouloir supprimer ${child.firstName} ${child.lastName}?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: () => {

                        console.log('Delete child:', child.childId);

                    }
                }
            ]
        );
    }, []);


    const keyExtractor = useCallback((item: ChildrenListItem) =>
        item.childId.toString(),
        []);


    const ListHeaderComponent = useCallback(() => (
        <View style={styles.header}>
            {/* <Text style={styles.title}>Mes Enfants</Text> */}
            {totalCount > 0 && (
                <Text style={styles.subtitle}>
                    {totalCount} enfant{totalCount > 1 ? 's' : ''} trouvé{totalCount > 1 ? 's' : ''}
                </Text>
            )}
        </View>
    ), [totalCount]);


    const EmptyIcon = useCallback(() => (
        <Ionicons
            name="people-outline"
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
            <PageHeader title="Liste d'enfants" onBack={handleBack} />
            <InfiniteList<ChildrenListItem>
                data={listData}
                renderItem={renderChildItem}
                keyExtractor={keyExtractor}
                onLoadMore={loadMore}
                hasNextPage={hasNextPage}
                isLoading={isLoading}
                isLoadingMore={isLoadingMore}
                onRefresh={refresh}
                isRefreshing={isRefreshing}
                onSearch={search}
                searchQuery={searchQuery}
                showSearch={false}
                searchPlaceholder="Rechercher un enfant..."
                emptyTitle="Aucun enfant trouvé"
                emptySubtitle="Vous n'avez encore ajouté aucun enfant ou aucun enfant ne correspond à votre recherche."
                emptyIcon={<EmptyIcon />}
                error={error}
                onRetry={retry}
                ListHeaderComponent={ListHeaderComponent}
                contentContainerStyle={styles.listContainer}
                accessibilityLabel="Liste des enfants"
                windowSize={10}
                maxToRenderPerBatch={10}
                removeClippedSubviews={true}
            />
        </ScreenView>
    );
};

export default ChildrensScreen;

const styles = StyleSheet.create({
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: spacingY._20,
    },
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