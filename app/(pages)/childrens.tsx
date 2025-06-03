// app/(pages)/childrens.tsx
import { AddChildData, AddChildModal } from '@/components/ActionModals/AddChildModal';
import { InfiniteList } from '@/components/InfiniteList/InfiniteList';
import { ChildItem } from '@/components/ListItems/ChildItem';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { ScreenView } from '@/components/ScreenView/ScreenView';
import { colors, spacingY } from '@/constants/theme';
import { useChildrenData } from '@/hooks/useChildrenData';
import useUserInfo from '@/hooks/useUserInfo';
import { useAddChildrenToSystem } from '@/services/childGradeServices';
import { School } from '@/services/childrenServices';
import { useGetAllSchools } from '@/services/schoolsServices';
import { useGetParentSchools } from '@/services/userServices';
import { Ionicons } from '@expo/vector-icons';
import { ListRenderItem } from '@shopify/flash-list';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
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
    const userInfo = useUserInfo();
    const addChildrenToSystem = useAddChildrenToSystem();
    const getParentSchools = useGetParentSchools();
    const getAllSchools = useGetAllSchools();

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

    //#region States
    const [showAddModal, setShowAddModal] = useState(false);
    const [schools, setSchools] = useState<School[]>([]);
    const [isLoadingSchools, setIsLoadingSchools] = useState(false);
    const [isAddingChild, setIsAddingChild] = useState(false);
    //#endregion

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

    const fetchSchools = useCallback(async () => {
        try {
            setIsLoadingSchools(true);

            const { success, data, error: apiError } = await getAllSchools({
                pageNumber: 1,
                pageSize: 100, // Get all schools
            });

            if (success && data) {
                setSchools(data.data || []);
            } else {
                console.error('Failed to fetch schools:', apiError);
                setSchools([]);
            }
        } catch (err: any) {
            console.error('Error fetching schools:', err);
            setSchools([]);
        } finally {
            setIsLoadingSchools(false);
        }
    }, [getAllSchools]);

    const keyExtractor = useCallback((item: ChildrenListItem) =>
        item.childId.toString(),
        []);

    const ListHeaderComponent = useCallback(() => (
        <View style={styles.header}>
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

    const handleAddChild = useCallback(() => {
        setShowAddModal(true);
    }, []);

    const handleCloseAddModal = useCallback(() => {
        setShowAddModal(false);
    }, []);

    const handleAddChildSubmit = useCallback(async (childData: AddChildData) => {
        try {
            setIsAddingChild(true);

            const { success, data, error: apiError } = await addChildrenToSystem({
                firstName: childData.firstName,
                lastName: childData.lastName,
                dateOfBirth: childData.dateOfBirth,
                fatherName: childData.fatherName,
                parentId: childData.parentId,
                schoolId: childData.schoolId,
            });

            if (success) {
                Alert.alert(
                    'Succès',
                    'L\'enfant a été ajouté avec succès au système.',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Refresh the children list
                                refresh();
                            }
                        }
                    ]
                );
            } else {
                throw new Error(apiError || 'Échec de l\'ajout de l\'enfant');
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Une erreur est survenue lors de l\'ajout de l\'enfant';
            Alert.alert('Erreur', errorMessage);
            console.error('Error adding child:', err);
            throw err; // Re-throw to prevent modal from closing
        } finally {
            setIsAddingChild(false);
        }
    }, [addChildrenToSystem, refresh]);

    //#region Effects
    useEffect(() => {
        if (showAddModal && schools.length === 0) {
            fetchSchools();
        }
    }, [showAddModal]);
    //#endregion

    return (
        <ScreenView
            safeArea={true}
            padding={false}
            paddingVertical={true}
            backgroundColor={colors.background.default}
        >
            <PageHeader
                title="Liste d'enfants"
                onBack={handleBack}
                actions={[
                    {
                        icon: 'person-add-outline',
                        onPress: handleAddChild,
                        color: colors.primary.main,
                    }
                ]}
            />
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
                estimatedItemSize={120} // Add this for FlashList
                accessibilityLabel="Liste des enfants"
            // Remove these FlatList-specific props that don't exist in FlashList:
            // windowSize={10}
            // maxToRenderPerBatch={10}
            // removeClippedSubviews={true}
            // contentContainerStyle={styles.listContainer} // Handled internally now
            />
            <AddChildModal
                visible={showAddModal}
                onClose={handleCloseAddModal}
                onAddChild={handleAddChildSubmit}
                schools={schools}
                isLoading={isLoadingSchools || isAddingChild}
            />
        </ScreenView>
    );
};

export default ChildrensScreen;

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