import { PageHeader } from '@/components/PageHeader/PageHeader';
import { ScreenView } from '@/components/ScreenView/ScreenView';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { ChildDetailsData, useGetChildrenDetails } from '@/services/childrenServices';
import { scale, scaleFont } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const ChildrenDetails = () => {


    //#region Params
    const { id } = useLocalSearchParams();
    //#endregion

    //#region Api services
    const getChildrenDetails = useGetChildrenDetails();
    //#endregion

    //#region States
    const [childrenDetails, setChildrenDetails] = React.useState<ChildDetailsData>();
    const [isLoading, setIsLoading] = React.useState(false);
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    //#endregion

    //#region fetch data
    const fetchChildrenDetails = React.useCallback(async (isRefresh: boolean = false) => {
        try {
            // Set appropriate loading state
            if (isRefresh) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }

            setError(null);

            const childIdStr = Array.isArray(id) ? id[0] : id;
            if (!childIdStr) {
                throw new Error('Child ID not provided');
            }

            const { success, data, error: apiError } = await getChildrenDetails({
                childrenId: parseInt(childIdStr)
            });

            if (success && data) {
                setChildrenDetails(data.data);
            } else {
                throw new Error(apiError || 'Failed to fetch child details');
            }

        } catch (err: any) {
            const errorMessage = err.message || 'An error occurred while fetching child details';
            setError(errorMessage);
            console.error('Error fetching child details:', err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [id]);
    //#endregion

    //#region Effects
    React.useEffect(() => {
        if (id) {
            fetchChildrenDetails(false);
        }
    }, [id, fetchChildrenDetails]);
    //#endregion

    //#region Handlers
    const formatDate = React.useCallback((dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return dateString;
        }
    }, []);

    const calculateAge = React.useCallback((dateString: string) => {
        try {
            const birthDate = new Date(dateString);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        } catch {
            return null;
        }
    }, []);

    const getStatusText = React.useCallback((statusId: number) => {
        switch (statusId) {
            case 1: return 'Actif';
            case 2: return 'En attente';
            case 3: return 'Inactif';
            default: return 'Inconnu';
        }
    }, []);

    const getStatusColor = React.useCallback((statusId: number) => {
        switch (statusId) {
            case 1: return colors.success.main;
            case 2: return colors.warning.main;
            case 3: return colors.error.main;
            default: return colors.info.main;
        }
    }, []);

    const handleBack = React.useCallback(() => {
        router.back();
    }, []);

    const handleRefresh = React.useCallback(async () => {
        await fetchChildrenDetails(true);
    }, [fetchChildrenDetails]);

    const handleRetry = React.useCallback(() => {
        fetchChildrenDetails(false);
    }, [fetchChildrenDetails]);

    // const handleEdit = React.useCallback(() => {
    //     router.push({
    //         pathname: '/(pages)/edit-child/[id]',
    //         params: { id: id?.toString() || '' }
    //     });
    // }, [id]);

    const handleDelete = React.useCallback(() => {
        Alert.alert(
            'Supprimer l\'enfant',
            `Êtes-vous sûr de vouloir supprimer ${childrenDetails?.firstName} ${childrenDetails?.lastName}?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: () => {
                        console.log('Delete child:', id);
                        router.back();
                    }
                }
            ]
        );
    }, [childrenDetails, id]);

    const handleSchoolWebsite = React.useCallback(() => {
        if (childrenDetails?.school?.schoolWebsite) {
            Linking.openURL(childrenDetails.school.schoolWebsite);
        }
    }, [childrenDetails?.school?.schoolWebsite]);

    const handleSchoolPhone = React.useCallback(() => {
        if (childrenDetails?.school?.schoolPhoneNumber) {
            Linking.openURL(`tel:${childrenDetails.school.schoolPhoneNumber}`);
        }
    }, [childrenDetails?.school?.schoolPhoneNumber]);

    const handleSchoolEmail = React.useCallback(() => {
        if (childrenDetails?.school?.schoolEmail) {
            Linking.openURL(`mailto:${childrenDetails.school.schoolEmail}`);
        }
    }, [childrenDetails?.school?.schoolEmail]);
    //#endregion

    //#region Loading State
    if (isLoading) {
        return (
            <ScreenView safeArea backgroundColor={colors.background.default}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                    <Text style={styles.loadingText}>Chargement...</Text>
                </View>
            </ScreenView>
        );
    }
    //#endregion

    //#region Error State
    if (error || !childrenDetails) {
        return (
            <ScreenView safeArea backgroundColor={colors.background.default}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={colors.error.main} />
                    <Text style={styles.errorText}>{error || 'Enfant non trouvé'}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                        <Text style={styles.retryButtonText}>Réessayer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.retryButton, styles.backButton]} onPress={handleBack}>
                        <Text style={styles.retryButtonText}>Retour</Text>
                    </TouchableOpacity>
                </View>
            </ScreenView>
        );
    }
    //#endregion

    const age = calculateAge(childrenDetails.dateOfBirth);

    return (
        <ScreenView
            safeArea={true}
            padding={false}
            // paddingVertical={true}
            backgroundColor={colors.background.default}
        >
            {/* Header */}
            <PageHeader
                title="Détails de l'enfant"
                onBack={handleBack}
            // actions={[
            //     {
            //         icon: 'pencil-outline',
            //         onPress: () => console.log('Edit pressed'), // or handleEdit
            //     },
            //     {
            //         icon: 'trash-outline',
            //         onPress: handleDelete,
            //         color: colors.error.main,
            //     },
            // ]}
            />

            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
            // refreshControl={
            //     <RefreshControl

            //         refreshing={isRefreshing}
            //         onRefresh={handleRefresh}
            //         tintColor={colors.primary.main}
            //         colors={[colors.primary.main]}
            //     />
            // }
            >
                {/* Avatar and Name */}
                <View style={styles.profileSection}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {childrenDetails.firstName?.charAt(0)}{childrenDetails.lastName?.charAt(0)}
                        </Text>
                    </View>
                    <Text style={styles.name}>
                        {childrenDetails.firstName} {childrenDetails.lastName}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(childrenDetails.fK_StatusId) }]}>
                        <Text style={styles.statusText}>{getStatusText(childrenDetails.fK_StatusId)}</Text>
                    </View>
                </View>

                {/* Details Cards */}
                <View style={styles.detailsContainer}>
                    {/* Personal Information */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Informations personnelles</Text>

                        <View style={styles.detailRow}>
                            <Ionicons name="calendar-outline" size={20} color={colors.primary.main} />
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Date de naissance</Text>
                                <Text style={styles.detailValue}>
                                    {formatDate(childrenDetails.dateOfBirth)}
                                    {age !== null && ` (${age} ans)`}
                                </Text>
                            </View>
                        </View>

                        {childrenDetails.fatherName && (
                            <View style={styles.detailRow}>
                                <Ionicons name="person-outline" size={20} color={colors.primary.main} />
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Nom du père</Text>
                                    <Text style={styles.detailValue}>{childrenDetails.fatherName}</Text>
                                </View>
                            </View>
                        )}

                        <View style={styles.detailRow}>
                            <Ionicons name="finger-print-outline" size={20} color={colors.primary.main} />
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>{"ID de l'enfant"}</Text>
                                <Text style={styles.detailValue}>{childrenDetails.childId}</Text>
                            </View>
                        </View>
                    </View>

                    {/* School Information */}
                    {childrenDetails.school && (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Informations scolaires</Text>

                            <View style={styles.detailRow}>
                                <Ionicons name="school-outline" size={20} color={colors.primary.main} />
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>École</Text>
                                    <Text style={styles.detailValue}>{childrenDetails.school.schoolName}</Text>
                                </View>
                            </View>

                            <View style={styles.detailRow}>
                                <Ionicons name="location-outline" size={20} color={colors.primary.main} />
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Adresse</Text>
                                    <Text style={styles.detailValue}>{childrenDetails.school.schoolAddress}</Text>
                                </View>
                            </View>

                            <View style={styles.detailRow}>
                                <Ionicons name="call-outline" size={20} color={colors.primary.main} />
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Téléphone</Text>
                                    <TouchableOpacity onPress={handleSchoolPhone}>
                                        <Text style={[styles.detailValue, styles.linkText]}>
                                            {childrenDetails.school.schoolPhoneNumber}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.detailRow}>
                                <Ionicons name="mail-outline" size={20} color={colors.primary.main} />
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Email</Text>
                                    <TouchableOpacity onPress={handleSchoolEmail}>
                                        <Text style={[styles.detailValue, styles.linkText]}>
                                            {childrenDetails.school.schoolEmail}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.detailRow}>
                                <Ionicons name="globe-outline" size={20} color={colors.primary.main} />
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Site web</Text>
                                    <TouchableOpacity onPress={handleSchoolWebsite}>
                                        <Text style={[styles.detailValue, styles.linkText]}>
                                            {childrenDetails.school.schoolWebsite}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.detailRow}>
                                <Ionicons name="time-outline" size={20} color={colors.primary.main} />
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Établi en</Text>
                                    <Text style={styles.detailValue}>{childrenDetails.school.schoolEstablishedYear}</Text>
                                </View>
                            </View>

                            {childrenDetails.school.schoolDescription && (
                                <View style={styles.detailRow}>
                                    <Ionicons name="information-circle-outline" size={20} color={colors.primary.main} />
                                    <View style={styles.detailContent}>
                                        <Text style={styles.detailLabel}>Description</Text>
                                        <Text style={styles.detailValue}>{childrenDetails.school.schoolDescription}</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    )}

                    {/* System Information */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Informations système</Text>

                        <View style={styles.detailRow}>
                            <Ionicons name="time-outline" size={20} color={colors.primary.main} />
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Créé le</Text>
                                <Text style={styles.detailValue}>{formatDate(childrenDetails.createdOn)}</Text>
                            </View>
                        </View>

                        {childrenDetails.modifiedOn && (
                            <View style={styles.detailRow}>
                                <Ionicons name="create-outline" size={20} color={colors.primary.main} />
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Modifié le</Text>
                                    <Text style={styles.detailValue}>{formatDate(childrenDetails.modifiedOn)}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </ScreenView>
    );
};

export default ChildrenDetails;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.default
    },

    // Loading & Error States
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
        marginTop: spacingY._10,
    },
    retryButtonText: {
        color: colors.text.white,
        fontSize: scaleFont(14),
        fontWeight: '600',
    },
    backButton: {
        backgroundColor: colors.secondary.main,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacingX._20,
        paddingVertical: spacingY._15,
        borderBottomWidth: 1,
        borderBottomColor: colors.border?.light || '#e1e5e9',
        backgroundColor: colors.background.paper,
    },
    headerBackButton: {
        padding: spacingX._5,
    },
    headerTitle: {
        fontSize: scaleFont(18),
        fontWeight: '600',
        color: colors.text.primary,
        flex: 1,
        textAlign: 'center',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        padding: spacingX._7,
        marginLeft: spacingX._5,
    },

    // Profile Section
    profileSection: {
        alignItems: 'center',
        paddingVertical: spacingY._30,
        backgroundColor: colors.background.paper,
        marginBottom: spacingY._20,
    },
    avatar: {
        width: scale(80),
        height: scale(80),
        borderRadius: scale(40),
        backgroundColor: colors.primary.light,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacingY._15,
    },
    avatarText: {
        fontSize: scaleFont(28),
        fontWeight: '600',
        color: colors.text.white,
    },
    name: {
        fontSize: scaleFont(24),
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: spacingY._10,
    },
    statusBadge: {
        paddingHorizontal: spacingX._15,
        paddingVertical: spacingY._5,
        borderRadius: 20,
    },
    statusText: {
        fontSize: scaleFont(12),
        fontWeight: '600',
        color: colors.text.white,
    },

    // Details
    detailsContainer: {
        paddingHorizontal: spacingX._20,
        paddingBottom: spacingY._30,
    },
    card: {
        backgroundColor: colors.background.paper,
        borderRadius: 12,
        padding: spacingX._20,
        marginBottom: spacingY._15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: scaleFont(16),
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacingY._15,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacingY._15,
    },
    detailContent: {
        flex: 1,
        marginLeft: spacingX._15,
    },
    detailLabel: {
        fontSize: scaleFont(12),
        color: colors.text.secondary,
        marginBottom: spacingY._3,
    },
    detailValue: {
        fontSize: scaleFont(14),
        fontWeight: '500',
        color: colors.text.primary,
    },
    linkText: {
        color: colors.primary.main,
        textDecorationLine: 'underline',
    },
});