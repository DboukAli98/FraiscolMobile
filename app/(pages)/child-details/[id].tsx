import { CustomButton } from '@/components/Button/CustomPressable';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { PaymentCycleModal } from '@/components/PaymentCycleModal/PaymentCycleModal';
import { ScreenView } from '@/components/ScreenView/ScreenView';
import { SectionSelectionModal } from '@/components/SelectionModals/SectionSelectionModal';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { ChildGrade, ChildGradeSelection, PaymentCycle, useAddChildGrade, useGetChildrenGrade, useGetChildrenGradeSelection, useGetPaymentCycles, useSelectChildCycleSelection } from '@/services/childGradeServices';
import { ChildDetailsData, useGetChildrenDetails } from '@/services/childrenServices';
import { SchoolGradeSection, useGetSchoolGradesSections } from '@/services/schoolsServices';

import { scale, scaleFont } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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
    const getChildrenGrade = useGetChildrenGrade();
    const getChildrenGradeSelection = useGetChildrenGradeSelection();
    const getPaymentCycles = useGetPaymentCycles();
    const selectChildCycleSelection = useSelectChildCycleSelection();
    const getSchoolGradesSections = useGetSchoolGradesSections();
    const addChildGrade = useAddChildGrade();

    //#endregion

    //#region States
    const [childrenDetails, setChildrenDetails] = useState<ChildDetailsData>();
    const [childrenGrade, setChildrenGrade] = useState<ChildGrade>();
    const [childrenGradeSelection, setChildrenGradeSelection] = useState<ChildGradeSelection | null>(null);
    const [paymentCycles, setPaymentCycles] = useState<PaymentCycle[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoadingCycles, setIsLoadingCycles] = useState(false);
    const [isSelectingCycle, setIsSelectingCycle] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [schoolSections, setSchoolSections] = useState<SchoolGradeSection[]>([]);
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [isLoadingSections, setIsLoadingSections] = useState(false);
    const [isAddingToSection, setIsAddingToSection] = useState(false);
    //#endregion

    //#region fetch data
    const fetchChildrenDetails = useCallback(async (isRefresh: boolean = false) => {
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

    const fetchChildrenGrade = useCallback(async (isRefresh: boolean = false) => {
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

            const { success, data, error: apiError } = await getChildrenGrade({
                childrenId: parseInt(childIdStr)
            });

            if (success && data) {
                setChildrenGrade(data.data);
                console.log('Children Grade:', data.data);
                if (data.data !== null) {
                    // Fetch grade selection and payment cycles after getting grade
                    await fetchChildrenGradeSelection(data.data.childGradeId, false);
                    await fetchPaymentCycles(data.data.schoolGradeSection.schoolGradeSectionId);
                }

            } else {
                console.log('No child grade found:', apiError);
                setChildrenGrade(undefined);
                setChildrenGradeSelection(null);
                setPaymentCycles([]);
            }

        } catch (err: any) {
            const errorMessage = err.message || 'An error occurred while fetching child grade';
            setError(errorMessage);
            console.error('Error fetching child grade:', err);
            setChildrenGrade(undefined);
            setChildrenGradeSelection(null);
            setPaymentCycles([]);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [id]);

    const fetchChildrenGradeSelection = useCallback(async (childGradeId: number, isRefresh: boolean = false) => {
        try {
            // Set appropriate loading state
            if (isRefresh) {
                setIsRefreshing(true);
            }

            const { success, data, error: apiError } = await getChildrenGradeSelection({
                childGradeId: childGradeId
            });

            if (success && data) {
                setChildrenGradeSelection(data.data);
                console.log('Children Grade Selection:', data.data);
            } else {
                console.log('No grade selection found:', apiError);
                setChildrenGradeSelection(null);
            }

        } catch (err: any) {
            console.error('Error fetching child grade selection:', err);
            setChildrenGradeSelection(null);
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    const fetchPaymentCycles = useCallback(async (schoolGradeSectionId: number) => {
        try {
            setIsLoadingCycles(true);

            const { success, data, error: apiError } = await getPaymentCycles({
                schoolGradeSectionId,
                pageNumber: 1,
                pageSize: 100,
            });

            if (success && data) {
                setPaymentCycles(data.data || []);
                console.log('Payment Cycles:', data.data);
            } else {
                console.log('No payment cycles found:', apiError);
                setPaymentCycles([]);
            }

        } catch (err: any) {
            console.error('Error fetching payment cycles:', err);
            setPaymentCycles([]);
        } finally {
            setIsLoadingCycles(false);
        }
    }, []);

    const fetchSchoolSections = useCallback(async (schoolId: number) => {
        try {
            setIsLoadingSections(true);

            const { success, data, error: apiError } = await getSchoolGradesSections({
                schoolId,
                pageNumber: 1,
                pageSize: 100,
                onlyEnabled: true,
            });

            if (success && data) {
                setSchoolSections(data.data || []);
            } else {
                console.log('No sections found:', apiError);
                setSchoolSections([]);
            }
        } catch (err: any) {
            console.error('Error fetching sections:', err);
            setSchoolSections([]);
        } finally {
            setIsLoadingSections(false);
        }
    }, [getSchoolGradesSections]);
    //#endregion

    //#region Effects
    useEffect(() => {
        if (id) {
            fetchChildrenDetails(false);
            fetchChildrenGrade(false);
        }
    }, [id, fetchChildrenDetails, fetchChildrenGrade]);
    //#endregion

    //#region Handlers
    const formatDate = useCallback((dateString: string) => {
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

    const handleSelectSection = useCallback(() => {
        if (!childrenDetails?.school?.schoolId) {
            Alert.alert('Erreur', 'Informations école non disponibles.');
            return;
        }

        fetchSchoolSections(childrenDetails.school.schoolId);
        setShowSectionModal(true);
    }, [childrenDetails?.school?.schoolId, fetchSchoolSections]);

    const handleSectionSelection = useCallback(async (selectedSection: SchoolGradeSection) => {
        if (!childrenDetails?.childId) {
            Alert.alert('Erreur', 'Informations enfant non disponibles.');
            return;
        }

        try {
            setIsAddingToSection(true);

            const { success, data, error: apiError } = await addChildGrade({
                childId: childrenDetails.childId,
                schoolGradeSectionId: selectedSection.schoolGradeSectionId,
                statusId: 1, // Active
            });

            if (success) {
                Alert.alert(
                    'Succès',
                    'L\'enfant a été assigné à la section avec succès.',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Refresh the grade to show the new assignment
                                fetchChildrenGrade(false);
                            }
                        }
                    ]
                );
            } else {
                throw new Error(apiError || 'Échec de l\'assignation à la section');
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Une erreur est survenue lors de l\'assignation';
            Alert.alert('Erreur', errorMessage);
            console.error('Error assigning to section:', err);
        } finally {
            setIsAddingToSection(false);
        }
    }, [childrenDetails?.childId, addChildGrade, fetchChildrenGrade]);

    const calculateAge = useCallback((dateString: string) => {
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

    const getStatusText = useCallback((statusId: number) => {
        switch (statusId) {
            case 1: return 'Actif';
            case 2: return 'En attente';
            case 3: return 'Inactif';
            default: return 'Inconnu';
        }
    }, []);

    const getStatusColor = useCallback((statusId: number) => {
        switch (statusId) {
            case 1: return colors.success.main;
            case 2: return colors.warning.main;
            case 3: return colors.error.main;
            default: return colors.info.main;
        }
    }, []);

    const getPaymentCycleTypeText = useCallback((type: number) => {
        switch (type) {
            case 0: return 'Paiement complet';
            case 1: return 'Mensuel';
            case 2: return 'Trimestriel';
            case 3: return 'Hebdomadaire';
            case 4: return 'Personnalisé';
            default: return 'Inconnu';
        }
    }, []);

    const handleBack = useCallback(() => {
        router.back();
    }, []);

    const handleRefresh = useCallback(async () => {
        await fetchChildrenDetails(true);
        await fetchChildrenGrade(true);
    }, [fetchChildrenDetails, fetchChildrenGrade]);

    const handleRetry = useCallback(() => {
        fetchChildrenDetails(false);
        fetchChildrenGrade(false);
    }, [fetchChildrenDetails, fetchChildrenGrade]);

    const handleSelectPaymentCycle = useCallback(() => {
        if (!childrenGrade) {
            Alert.alert('Erreur', 'Impossible de sélectionner un cycle de paiement sans classe assignée.');
            return;
        }

        if (paymentCycles.length === 0) {
            Alert.alert('Information', 'Aucun cycle de paiement disponible pour cette classe.');
            return;
        }

        setShowPaymentModal(true);
    }, [childrenGrade, paymentCycles]);

    const handlePaymentCycleSelection = useCallback(async (selectedCycle: PaymentCycle) => {
        if (!childrenGrade) return;

        try {
            setIsSelectingCycle(true);

            const { success, data, error: apiError } = await selectChildCycleSelection({
                childGradeId: childrenGrade.childGradeId,
                paymentCycleId: selectedCycle.paymentCycleId,
            });

            if (success) {
                Alert.alert(
                    'Succès',
                    'Le cycle de paiement a été sélectionné avec succès. Les versements ont été générés.',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Refresh the grade selection to show the new selection
                                fetchChildrenGradeSelection(childrenGrade.childGradeId, false);
                            }
                        }
                    ]
                );
            } else {
                throw new Error(apiError || 'Échec de la sélection du cycle de paiement');
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Une erreur est survenue lors de la sélection du cycle';
            Alert.alert('Erreur', errorMessage);
            console.error('Error selecting payment cycle:', err);
        } finally {
            setIsSelectingCycle(false);
        }
    }, [childrenGrade, selectChildCycleSelection, fetchChildrenGradeSelection]);

    const handleSchoolWebsite = useCallback(() => {
        if (childrenDetails?.school?.schoolWebsite) {
            Linking.openURL(childrenDetails.school.schoolWebsite);
        }
    }, [childrenDetails?.school?.schoolWebsite]);

    const handleSchoolPhone = useCallback(() => {
        if (childrenDetails?.school?.schoolPhoneNumber) {
            Linking.openURL(`tel:${childrenDetails.school.schoolPhoneNumber}`);
        }
    }, [childrenDetails?.school?.schoolPhoneNumber]);

    const handleSchoolEmail = useCallback(() => {
        if (childrenDetails?.school?.schoolEmail) {
            Linking.openURL(`mailto:${childrenDetails.school.schoolEmail}`);
        }
    }, [childrenDetails?.school?.schoolEmail]);

    const getSelectedPaymentCycleName = useCallback(() => {
        if (!childrenGradeSelection) return null;

        const selectedCycle = paymentCycles.find(
            cycle => cycle.paymentCycleId === childrenGradeSelection.fK_PaymentCycleId
        );

        return selectedCycle ? selectedCycle.paymentCycleName : `Cycle ID: ${childrenGradeSelection.fK_PaymentCycleId}`;
    }, [childrenGradeSelection, paymentCycles]);
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
    const selectedCycleName = getSelectedPaymentCycleName();

    return (
        <ScreenView
            safeArea={true}
            padding={false}
            backgroundColor={colors.background.default}
        >
            {/* Header */}
            <PageHeader
                title="Détails de l'enfant"
                onBack={handleBack}
            />

            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
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

                        {/* <View style={styles.detailRow}>
                            <Ionicons name="finger-print-outline" size={20} color={colors.primary.main} />
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>{"ID de l'enfant"}</Text>
                                <Text style={styles.detailValue}>{childrenDetails.childId}</Text>
                            </View>
                        </View> */}
                    </View>

                    {/* School Information with Academic Details */}
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

                            {/* Show grade section if available */}
                            {childrenGrade ? (
                                <>
                                    <View style={styles.detailRow}>
                                        <Ionicons name="library-outline" size={20} color={colors.primary.main} />
                                        <View style={styles.detailContent}>
                                            <Text style={styles.detailLabel}>Section</Text>
                                            <Text style={styles.detailValue}>{childrenGrade.schoolGradeSection.schoolGradeName}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Ionicons name="cash-outline" size={20} color={colors.primary.main} />
                                        <View style={styles.detailContent}>
                                            <Text style={styles.detailLabel}>Frais de scolarité</Text>
                                            <Text style={styles.detailValue}>
                                                {childrenGrade.schoolGradeSection.schoolGradeFee.toLocaleString()} CFA
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Ionicons name="calendar-number-outline" size={20} color={colors.primary.main} />
                                        <View style={styles.detailContent}>
                                            <Text style={styles.detailLabel}>Période</Text>
                                            <Text style={styles.detailValue}>
                                                {formatDate(childrenGrade.schoolGradeSection.termStartDate)} - {formatDate(childrenGrade.schoolGradeSection.termEndDate)}
                                            </Text>
                                        </View>
                                    </View>
                                </>
                            ) : (
                                <View style={styles.noSectionContainer}>
                                    <View style={styles.detailRow}>
                                        <Ionicons name="information-circle-outline" size={20} color={colors.warning.main} />
                                        <View style={styles.detailContent}>
                                            <Text style={styles.detailLabel}>Section</Text>
                                            <Text style={styles.detailValue}>Aucune section assignée</Text>
                                        </View>
                                    </View>

                                    <CustomButton
                                        id='select-section'
                                        title={isAddingToSection ? "Assignation..." : "Sélectionner une section"}
                                        leftIcon={isAddingToSection ? undefined : 'library-outline'}
                                        size='sm'
                                        onPress={handleSelectSection}
                                        disabled={isAddingToSection || isLoadingSections}
                                        loading={isAddingToSection}
                                        fullWidth={false}
                                        style={styles.selectSectionButton}
                                    />

                                    {schoolSections.length > 0 && (
                                        <Text style={styles.sectionHint}>
                                            {schoolSections.length} section{schoolSections.length > 1 ? 's' : ''} disponible{schoolSections.length > 1 ? 's' : ''}
                                        </Text>
                                    )}
                                </View>
                            )}

                            {/* Payment Cycle Selection */}
                            {childrenGrade && (
                                <>
                                    {childrenGradeSelection ? (
                                        <View style={styles.detailRow}>
                                            <Ionicons name="checkmark-circle-outline" size={20} color={colors.success.main} />
                                            <View style={styles.detailContent}>
                                                <Text style={styles.detailLabel}>Cycle de paiement</Text>
                                                <Text style={styles.detailValue}>{selectedCycleName}</Text>
                                                <Text style={styles.detailSubValue}>
                                                    Total: {childrenGradeSelection.totalFee?.toLocaleString()} CFA
                                                </Text>
                                            </View>
                                        </View>
                                    ) : (
                                        <View style={styles.noCycleRow}>
                                            <View style={styles.detailRow}>
                                                <Ionicons name="alert-circle-outline" size={20} color={colors.warning.main} />
                                                <View style={styles.detailContent}>
                                                    <Text style={styles.detailLabel}>Cycle de paiement</Text>
                                                    <Text style={styles.detailValue}>Aucun cycle sélectionné</Text>
                                                </View>
                                            </View>

                                            <CustomButton
                                                id='select-payment-cycle'
                                                title={isSelectingCycle ? "Sélection..." : "Sélectionner un cycle"}
                                                leftIcon={isSelectingCycle ? undefined : 'card-outline'}
                                                size='sm'
                                                onPress={handleSelectPaymentCycle}
                                                disabled={isSelectingCycle || isLoadingCycles}
                                                loading={isSelectingCycle}
                                                fullWidth={false}
                                                style={styles.selectCycleButton}
                                            />

                                            {paymentCycles.length > 0 && (
                                                <Text style={styles.cycleHint}>
                                                    {paymentCycles.length} cycle{paymentCycles.length > 1 ? 's' : ''} disponible{paymentCycles.length > 1 ? 's' : ''}
                                                </Text>
                                            )}
                                        </View>
                                    )}
                                </>
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

            {/* Payment Cycle Selection Modal */}
            <PaymentCycleModal
                visible={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                paymentCycles={paymentCycles}
                isLoading={isLoadingCycles}
                onSelectCycle={handlePaymentCycleSelection}
            />
            <SectionSelectionModal
                visible={showSectionModal}
                onClose={() => setShowSectionModal(false)}
                sections={schoolSections}
                isLoading={isLoadingSections}
                onSelectSection={handleSectionSelection}
            />
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
    detailSubValue: {
        fontSize: scaleFont(12),
        color: colors.text.secondary,
        marginTop: spacingY._3,
    },
    linkText: {
        color: colors.primary.main,
        textDecorationLine: 'underline',
    },

    // Payment Cycle Section
    noCycleRow: {
        paddingTop: spacingY._10,
        borderTopWidth: 1,
        borderTopColor: colors.border?.light || '#e1e5e9',
        marginTop: spacingY._5,
    },
    selectCycleButton: {
        marginTop: spacingY._10,
        alignSelf: 'flex-start',
    },
    cycleHint: {
        fontSize: scaleFont(11),
        color: colors.text.secondary,
        marginTop: spacingY._7,
        fontStyle: 'italic',
    },
    noSectionContainer: {
        paddingTop: spacingY._10,
        borderTopWidth: 1,
        borderTopColor: colors.border?.light || '#e1e5e9',
        marginTop: spacingY._5,
    },
    selectSectionButton: {
        marginTop: spacingY._10,
        alignSelf: 'flex-start',
    },
    sectionHint: {
        fontSize: scaleFont(11),
        color: colors.text.secondary,
        marginTop: spacingY._7,
        fontStyle: 'italic',
    },
});