// app/(pages)/school-details/[id].tsx
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { ScreenView } from '@/components/ScreenView/ScreenView';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { School } from '@/services/childrenServices';
import { useGetSchoolDetails } from '@/services/schoolsServices';
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

const SchoolDetailsScreen = () => {
    //#region Params
    const { id } = useLocalSearchParams();
    //#endregion

    //#region Api services
    const getSchoolDetails = useGetSchoolDetails();
    //#endregion

    //#region States
    const [schoolDetails, setSchoolDetails] = React.useState<School>();
    const [isLoading, setIsLoading] = React.useState(false);
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    //#endregion

    //#region fetch data
    const fetchSchoolDetails = React.useCallback(async (isRefresh: boolean = false) => {
        try {
            // Set appropriate loading state
            if (isRefresh) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }

            setError(null);

            const schoolIdStr = Array.isArray(id) ? id[0] : id;
            if (!schoolIdStr) {
                throw new Error('School ID not provided');
            }

            const { success, data, error: apiError } = await getSchoolDetails({
                schoolId: parseInt(schoolIdStr)
            });

            if (success && data) {
                setSchoolDetails(data.data);
            } else {
                throw new Error(apiError || 'Failed to fetch school details');
            }

        } catch (err: any) {
            const errorMessage = err.message || 'An error occurred while fetching school details';
            setError(errorMessage);
            console.error('Error fetching school details:', err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [id]);
    //#endregion

    //#region Effects
    React.useEffect(() => {
        if (id) {
            fetchSchoolDetails(false);
        }
    }, [id, fetchSchoolDetails]);
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
        await fetchSchoolDetails(true);
    }, [fetchSchoolDetails]);

    const handleRetry = React.useCallback(() => {
        fetchSchoolDetails(false);
    }, [fetchSchoolDetails]);

    const handleSchoolWebsite = React.useCallback(() => {
        if (schoolDetails?.schoolWebsite) {
            Linking.openURL(schoolDetails.schoolWebsite);
        }
    }, [schoolDetails?.schoolWebsite]);

    const handleSchoolPhone = React.useCallback(() => {
        if (schoolDetails?.schoolPhoneNumber) {
            Linking.openURL(`tel:${schoolDetails.schoolPhoneNumber}`);
        }
    }, [schoolDetails?.schoolPhoneNumber]);

    const handleSchoolEmail = React.useCallback(() => {
        if (schoolDetails?.schoolEmail) {
            Linking.openURL(`mailto:${schoolDetails.schoolEmail}`);
        }
    }, [schoolDetails?.schoolEmail]);

    const handleSchoolLocation = React.useCallback(() => {
        if (schoolDetails?.schoolAddress) {
            const encodedAddress = encodeURIComponent(schoolDetails.schoolAddress);
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
            Linking.openURL(mapsUrl);
        }
    }, [schoolDetails?.schoolAddress]);

    const handleContactSchool = React.useCallback(() => {
        if (!schoolDetails) return;

        const options = [];

        if (schoolDetails.schoolPhoneNumber) {
            options.push({
                text: 'Téléphone',
                onPress: handleSchoolPhone
            });
        }

        if (schoolDetails.schoolEmail) {
            options.push({
                text: 'Email',
                onPress: handleSchoolEmail
            });
        }

        if (options.length === 0) {
            Alert.alert('Erreur', 'Aucune information de contact disponible');
            return;
        }

        Alert.alert(
            'Contacter l\'école',
            `Comment souhaitez-vous contacter ${schoolDetails.schoolName}?`,
            [
                { text: 'Annuler', style: 'cancel' },
                ...options
            ]
        );
    }, [schoolDetails, handleSchoolPhone, handleSchoolEmail]);

    // Get initials for avatar
    const getInitials = React.useCallback(() => {
        if (!schoolDetails?.schoolName) return 'EC';
        const words = schoolDetails.schoolName.split(' ');
        if (words.length >= 2) {
            return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
        }
        return schoolDetails.schoolName.substring(0, 2).toUpperCase();
    }, [schoolDetails?.schoolName]);
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
    if (error || !schoolDetails) {
        return (
            <ScreenView safeArea backgroundColor={colors.background.default}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={colors.error.main} />
                    <Text style={styles.errorText}>{error || 'École non trouvée'}</Text>
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

    return (
        <ScreenView
            safeArea={true}
            padding={false}
            paddingVertical={true}
            backgroundColor={colors.background.default}
        >
            {/* Header */}
            <PageHeader
                title="Détails de l'école"
                onBack={handleBack}
                actions={[
                    {
                        icon: 'call-outline',
                        onPress: handleContactSchool,
                        color: colors.primary.main,
                    },
                    ...(schoolDetails.schoolWebsite ? [{
                        icon: 'globe-outline' as keyof typeof Ionicons.glyphMap,
                        onPress: handleSchoolWebsite,
                        color: colors.info.main,
                    }] : [])
                ]}
            />

            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {/* School Header */}
                <View style={styles.schoolHeader}>
                    <View style={styles.schoolAvatar}>
                        {schoolDetails.schoolLogo ? (
                            // You could implement image loading here
                            <Text style={styles.avatarText}>{getInitials()}</Text>
                        ) : (
                            <Text style={styles.avatarText}>{getInitials()}</Text>
                        )}
                    </View>
                    <Text style={styles.schoolName}>
                        {schoolDetails.schoolName}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(schoolDetails.fK_StatusId) }]}>
                        <Text style={styles.statusText}>{getStatusText(schoolDetails.fK_StatusId)}</Text>
                    </View>
                    <Text style={styles.establishedYear}>
                        Établi en {schoolDetails.schoolEstablishedYear}
                    </Text>
                </View>

                {/* Details Cards */}
                <View style={styles.detailsContainer}>
                    {/* Contact Information */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Informations de contact</Text>

                        <TouchableOpacity style={styles.detailRow} onPress={handleSchoolLocation}>
                            <Ionicons name="location-outline" size={20} color={colors.primary.main} />
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Adresse</Text>
                                <Text style={[styles.detailValue, styles.linkText]}>
                                    {schoolDetails.schoolAddress}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward-outline" size={16} color={colors.text.secondary} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.detailRow} onPress={handleSchoolPhone}>
                            <Ionicons name="call-outline" size={20} color={colors.primary.main} />
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Téléphone</Text>
                                <Text style={[styles.detailValue, styles.linkText]}>
                                    {schoolDetails.schoolPhoneNumber}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward-outline" size={16} color={colors.text.secondary} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.detailRow} onPress={handleSchoolEmail}>
                            <Ionicons name="mail-outline" size={20} color={colors.primary.main} />
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Email</Text>
                                <Text style={[styles.detailValue, styles.linkText]}>
                                    {schoolDetails.schoolEmail}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward-outline" size={16} color={colors.text.secondary} />
                        </TouchableOpacity>

                        {schoolDetails.schoolWebsite && (
                            <TouchableOpacity style={styles.detailRow} onPress={handleSchoolWebsite}>
                                <Ionicons name="globe-outline" size={20} color={colors.primary.main} />
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Site web</Text>
                                    <Text style={[styles.detailValue, styles.linkText]}>
                                        {schoolDetails.schoolWebsite}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward-outline" size={16} color={colors.text.secondary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* School Information */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Informations générales</Text>

                        <View style={styles.detailRow}>
                            <Ionicons name="calendar-outline" size={20} color={colors.primary.main} />
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>{"Année d'établissement"}</Text>
                                <Text style={styles.detailValue}>{schoolDetails.schoolEstablishedYear}</Text>
                            </View>
                        </View>

                        {schoolDetails.schoolDescription && (
                            <View style={styles.detailRow}>
                                <Ionicons name="information-circle-outline" size={20} color={colors.primary.main} />
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Description</Text>
                                    <Text style={styles.detailValue}>{schoolDetails.schoolDescription}</Text>
                                </View>
                            </View>
                        )}

                        <View style={styles.detailRow}>
                            <Ionicons name="people-outline" size={20} color={colors.primary.main} />
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Enfants inscrits</Text>
                                <Text style={styles.detailValue}>
                                    {schoolDetails.childrens?.length || 0} enfant{(schoolDetails.childrens?.length || 0) > 1 ? 's' : ''}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Academic Information */}
                    {schoolDetails.schoolGradeSections && schoolDetails.schoolGradeSections.length > 0 && (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Sections et classes</Text>
                            {schoolDetails.schoolGradeSections.map((section: any, index: number) => (
                                <View key={index} style={styles.detailRow}>
                                    <Ionicons name="library-outline" size={20} color={colors.primary.main} />
                                    <View style={styles.detailContent}>
                                        <Text style={styles.detailLabel}>Section {index + 1}</Text>
                                        <Text style={styles.detailValue}>{section.schoolGradeName || 'Non spécifié'}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* System Information */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Informations système</Text>

                        <View style={styles.detailRow}>
                            <Ionicons name="time-outline" size={20} color={colors.primary.main} />
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Créé le</Text>
                                <Text style={styles.detailValue}>{formatDate(schoolDetails.createdOn)}</Text>
                            </View>
                        </View>

                        {schoolDetails.modifiedOn && (
                            <View style={styles.detailRow}>
                                <Ionicons name="create-outline" size={20} color={colors.primary.main} />
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Modifié le</Text>
                                    <Text style={styles.detailValue}>{formatDate(schoolDetails.modifiedOn)}</Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Quick Actions */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Actions rapides</Text>

                        <View style={styles.actionButtonsContainer}>
                            <TouchableOpacity style={styles.actionButton} onPress={handleSchoolPhone}>
                                <Ionicons name="call" size={24} color={colors.text.white} />
                                <Text style={styles.actionButtonText}>Appeler</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.actionButton, styles.secondaryActionButton]} onPress={handleSchoolEmail}>
                                <Ionicons name="mail" size={24} color={colors.primary.main} />
                                <Text style={[styles.actionButtonText, styles.secondaryActionButtonText]}>Email</Text>
                            </TouchableOpacity>

                            {schoolDetails.schoolWebsite && (
                                <TouchableOpacity style={[styles.actionButton, styles.secondaryActionButton]} onPress={handleSchoolWebsite}>
                                    <Ionicons name="globe" size={24} color={colors.info.main} />
                                    <Text style={[styles.actionButtonText, { color: colors.info.main }]}>Site web</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </ScreenView>
    );
};

export default SchoolDetailsScreen;

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

    // School Header
    schoolHeader: {
        alignItems: 'center',
        paddingVertical: spacingY._30,
        backgroundColor: colors.background.paper,
        marginBottom: spacingY._20,
    },
    schoolAvatar: {
        width: scale(90),
        height: scale(90),
        borderRadius: scale(45),
        backgroundColor: colors.primary.light,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacingY._15,
    },
    avatarText: {
        fontSize: scaleFont(32),
        fontWeight: '600',
        color: colors.text.white,
    },
    schoolName: {
        fontSize: scaleFont(24),
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: spacingY._10,
        textAlign: 'center',
        paddingHorizontal: spacingX._20,
    },
    statusBadge: {
        paddingHorizontal: spacingX._15,
        paddingVertical: spacingY._5,
        borderRadius: 20,
        marginBottom: spacingY._5,
    },
    statusText: {
        fontSize: scaleFont(12),
        fontWeight: '600',
        color: colors.text.white,
    },
    establishedYear: {
        fontSize: scaleFont(14),
        color: colors.text.secondary,
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
        paddingVertical: spacingY._5,
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
    },

    // Action Buttons
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: spacingX._10,
    },
    actionButton: {
        flex: 1,
        minWidth: scale(100),
        backgroundColor: colors.primary.main,
        paddingVertical: spacingY._15,
        paddingHorizontal: spacingX._15,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    secondaryActionButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.primary.main,
    },
    actionButtonText: {
        color: colors.text.white,
        fontSize: scaleFont(14),
        fontWeight: '600',
        marginLeft: spacingX._5,
    },
    secondaryActionButtonText: {
        color: colors.primary.main,
    },
});