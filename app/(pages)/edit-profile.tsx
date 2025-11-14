// app/(pages)/edit-profile.tsx
import { CustomButton } from '@/components/Button/CustomPressable';
import { CustomInput } from '@/components/CustomInput/CustomInput';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { ScreenView } from '@/components/ScreenView/ScreenView';
import { colors, spacingY } from '@/constants/theme';
import useUserInfo from '@/hooks/useUserInfo';
import useUserRole from '@/hooks/useUserRole';
import { ParentDetailsData } from '@/models/ParentDetailsInterfaces';
import { CollectingAgentDetailsData, useGetCollectingAgentDetails } from '@/services/collectingAgentServices';
import { useGetParentDetails, useUpdateParent } from '@/services/userServices';
import { scaleFont } from '@/utils/stylings';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

interface FormData {
    firstName: string;
    lastName: string;
    fatherName: string;
    email: string;
    civilId: string;
    countryCode: string;
    phoneNumber: string;
}

interface FormErrors {
    firstName?: string;
    lastName?: string;
    fatherName?: string;
    email?: string;
    civilId?: string;
    countryCode?: string;
    phoneNumber?: string;
}

const EditProfileScreen = () => {
    const userInfo = useUserInfo();
    const userRole = useUserRole();
    const getParentDetails = useGetParentDetails();
    const getAgentDetails = useGetCollectingAgentDetails();
    const updateParent = useUpdateParent();

    // Check if user is an agent
    const isAgent = userRole?.toLowerCase() === 'agent';

    // States
    const [parentDetails, setParentDetails] = useState<ParentDetailsData | null>(null);
    const [agentDetails, setAgentDetails] = useState<CollectingAgentDetailsData | null>(null);
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        fatherName: '',
        email: '',
        civilId: '',
        countryCode: '+242',
        phoneNumber: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Refs to prevent infinite loops
    const isMountedRef = useRef(true);
    const hasInitializedRef = useRef(false);

    // Update form data and track changes
    const updateFormData = (field: keyof FormData, value: string) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };

            // Check if there are changes
            if (parentDetails) {
                const hasChanged = Object.keys(newData).some(key => {
                    const formKey = key as keyof FormData;
                    const originalValue = parentDetails[formKey as keyof ParentDetailsData] || '';
                    return newData[formKey] !== originalValue;
                });
                setHasChanges(hasChanged);
            }

            return newData;
        });

        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    // Validation
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'Le prénom est requis';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Le nom de famille est requis';
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Le numéro de téléphone est requis';
        } else if (formData.phoneNumber.length < 8) {
            newErrors.phoneNumber = 'Le numéro de téléphone doit contenir au moins 8 chiffres';
        }

        if (formData.email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                newErrors.email = 'Veuillez entrer une adresse email valide';
            }
        }

        if (!formData.countryCode.trim()) {
            newErrors.countryCode = 'Le code pays est requis';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle save
    const handleSave = async () => {
        if (!validateForm() || !parentDetails) return;

        setIsSaving(true);
        try {
            const { success, data, error } = await updateParent({
                parentId: parentDetails.parentId,
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                fatherName: formData.fatherName.trim(),
                email: formData.email.trim(),
                civilId: formData.civilId.trim(),
                countryCode: formData.countryCode.trim(),
                phoneNumber: formData.phoneNumber.trim(),
                statusId: parentDetails.fK_StatusId,
            });

            if (success) {
                Alert.alert(
                    'Succès',
                    'Profil mis à jour avec succès',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                setHasChanges(false);
                                router.back();
                            }
                        }
                    ]
                );
            } else {
                throw new Error(error?.error || error?.message || 'Échec de la mise à jour du profil');
            }
        } catch (err: any) {
            console.error('Error updating profile:', err);
            Alert.alert('Erreur', err.message || 'Impossible de mettre à jour le profil');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle back with changes check
    const handleBack = () => {
        if (hasChanges) {
            Alert.alert(
                'Modifications non sauvegardées',
                'Vous avez des modifications non sauvegardées. Voulez-vous les perdre?',
                [
                    { text: 'Annuler', style: 'cancel' },
                    { text: 'Perdre les modifications', style: 'destructive', onPress: () => router.back() }
                ]
            );
        } else {
            router.back();
        }
    };

    // Fetch details based on role
    useEffect(() => {
        const fetchDetails = async () => {
            if (!userInfo?.parentId || hasInitializedRef.current) {
                return;
            }

            hasInitializedRef.current = true;
            setIsLoading(true);

            try {
                if (isAgent) {
                    // Fetch agent details
                    const agentId = typeof userInfo.parentId === 'number'
                        ? userInfo.parentId
                        : Number(userInfo.parentId ?? 0);

                    const { success, data, error } = await getAgentDetails({ agentId });

                    if (!isMountedRef.current) return;

                    if (success && data?.data) {
                        const details = data.data;
                        setAgentDetails(details);
                        setFormData({
                            firstName: details.firstName || '',
                            lastName: details.lastName || '',
                            fatherName: '', // Agents don't have fatherName
                            email: details.email || '',
                            civilId: '', // Agents don't have civilId
                            countryCode: details.countryCode || '+242',
                            phoneNumber: details.phoneNumber || '',
                        });
                    } else {
                        throw new Error(error || 'Échec de la récupération des détails de l\'agent');
                    }
                } else {
                    // Fetch parent details
                    const { success, data, error } = await getParentDetails({
                        parentId: parseInt(userInfo.parentId)
                    });

                    if (!isMountedRef.current) return;

                    if (success && data?.data) {
                        const details = data.data;
                        setParentDetails(details);
                        setFormData({
                            firstName: details.firstName || '',
                            lastName: details.lastName || '',
                            fatherName: details.fatherName || '',
                            email: details.email || '',
                            civilId: details.civilId || '',
                            countryCode: details.countryCode || '+242',
                            phoneNumber: details.phoneNumber || '',
                        });
                    } else {
                        throw new Error(error || 'Échec de la récupération des détails du parent');
                    }
                }
            } catch (err: any) {
                console.error('Error fetching details:', err);
                if (isMountedRef.current) {
                    Alert.alert('Erreur', 'Impossible de charger les informations du profil');
                }
            } finally {
                if (isMountedRef.current) {
                    setIsLoading(false);
                }
            }
        };

        fetchDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userInfo?.parentId, isAgent]); // Only depend on parentId and isAgent

    // Cleanup
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Loading state
    if (isLoading) {
        return (
            <ScreenView safeArea backgroundColor={colors.background.default}>
                <PageHeader title="Modifier le profil" onBack={handleBack} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                    <Text style={styles.loadingText}>Chargement...</Text>
                </View>
            </ScreenView>
        );
    }

    return (
        <ScreenView
            safeArea={true}
            padding={false}
            backgroundColor={colors.background.default}
        >
            <PageHeader title="Modifier le profil" onBack={handleBack} />

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Profile Avatar Section */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                            </Text>
                        </View>
                        <Text style={styles.avatarTitle}>Modifier le profil</Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Informations personnelles</Text>

                        <CustomInput
                            label="Prénom"
                            placeholder="Entrez votre prénom"
                            value={formData.firstName}
                            onChangeText={(value) => updateFormData('firstName', value)}
                            error={errors.firstName}
                            required
                            leftIcon="person-outline"
                            autoCapitalize="words"
                        />

                        <CustomInput
                            label="Nom de famille"
                            placeholder="Entrez votre nom de famille"
                            value={formData.lastName}
                            onChangeText={(value) => updateFormData('lastName', value)}
                            error={errors.lastName}
                            required
                            leftIcon="person-outline"
                            autoCapitalize="words"
                        />

                        {!isAgent && (
                            <CustomInput
                                label="Nom du père"
                                placeholder="Entrez le nom de votre père"
                                value={formData.fatherName}
                                onChangeText={(value) => updateFormData('fatherName', value)}
                                error={errors.fatherName}
                                leftIcon="person-outline"
                                autoCapitalize="words"
                            />
                        )}

                        <Text style={styles.sectionTitle}>Contact</Text>

                        <View style={styles.phoneRow}>
                            <View style={styles.countryCodeContainer}>
                                <CustomInput
                                    label="Code"
                                    placeholder="+242"
                                    value={formData.countryCode}
                                    onChangeText={(value) => updateFormData('countryCode', value)}
                                    error={errors.countryCode}
                                    required
                                    keyboardType="phone-pad"
                                    containerStyle={styles.countryCodeInput}
                                />
                            </View>

                            <View style={styles.phoneNumberContainer}>
                                <CustomInput
                                    label="Numéro de téléphone"
                                    placeholder="Votre numéro de téléphone"
                                    value={formData.phoneNumber}
                                    onChangeText={(value) => updateFormData('phoneNumber', value)}
                                    error={errors.phoneNumber}
                                    required
                                    keyboardType="phone-pad"
                                    leftIcon="call-outline"
                                    containerStyle={styles.phoneNumberInput}
                                />
                            </View>
                        </View>

                        <CustomInput
                            label="Email"
                            placeholder="Entrez votre adresse email"
                            value={formData.email}
                            onChangeText={(value) => updateFormData('email', value)}
                            error={errors.email}
                            inputType="email"
                        />

                        {!isAgent && (
                            <CustomInput
                                label="ID civil"
                                placeholder="Entrez votre ID civil"
                                value={formData.civilId}
                                onChangeText={(value) => updateFormData('civilId', value)}
                                error={errors.civilId}
                                leftIcon="finger-print-outline"
                                keyboardType="numeric"
                            />
                        )}
                    </View>

                    {/* Action Section */}
                    <View style={styles.actionSection}>
                        <CustomButton
                            title="Sauvegarder les modifications"
                            onPress={handleSave}
                            loading={isSaving}
                            disabled={!hasChanges || isSaving}
                            fullWidth
                            leftIcon="checkmark-outline"
                        />

                        <CustomButton
                            title="Annuler"
                            variant="outlined"
                            onPress={handleBack}
                            disabled={isSaving}
                            fullWidth
                            style={styles.cancelButton}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenView>
    );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: spacingY._30,
    },
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

    // Avatar Section
    avatarSection: {
        alignItems: 'center',
        paddingVertical: spacingY._30,
        backgroundColor: colors.background.paper,
        marginBottom: spacingY._20,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary.main,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacingY._15,
    },
    avatarText: {
        fontSize: scaleFont(28),
        fontWeight: '600',
        color: colors.text.white,
    },
    avatarTitle: {
        fontSize: scaleFont(18),
        fontWeight: '600',
        color: colors.text.primary,
    },

    // Form Section
    formSection: {
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: scaleFont(16),
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacingY._15,
        marginTop: spacingY._10,
    },

    // Phone Row
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    countryCodeContainer: {
        flex: 0.3,
    },
    phoneNumberContainer: {
        flex: 0.7,
    },
    countryCodeInput: {
        marginBottom: 0,
    },
    phoneNumberInput: {
        marginBottom: 0,
    },

    // Actions
    actionSection: {
        paddingHorizontal: 20,
        paddingTop: spacingY._30,
        gap: spacingY._15,
    },
    cancelButton: {
        marginTop: spacingY._10,
    },
});