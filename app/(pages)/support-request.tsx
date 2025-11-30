import { CustomInput } from '@/components/CustomInput/CustomInput';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { ScreenView } from '@/components/ScreenView/ScreenView';
import { SelectField } from '@/components/SelectField/SelectField';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { useParentProfile } from '@/hooks/useParentProfile';
import { useSchoolsData } from '@/hooks/useSchoolsData';
import {
    AddSupportRequestInSystemRequestDto,
    SupportRequestDirection,
    SupportRequestPriority,
    SupportRequestType,
} from '@/models/SupportRequestInterfaces';
import { useAddSupportRequest } from '@/services/supportRequestServices';
import { scaleFont } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SupportRequestScreen() {
    const { parentData, isLoading: isLoadingParent } = useParentProfile();
    const addSupportRequest = useAddSupportRequest();

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [requestType, setRequestType] = useState<SupportRequestType>(SupportRequestType.General);
    const [priority, setPriority] = useState<SupportRequestPriority>(SupportRequestPriority.Medium);
    const [direction, setDirection] = useState<string>(SupportRequestDirection.PARENT_TO_DIRECTOR);
    const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
    const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Get parent's schools
    const { schools, isLoading: isLoadingSchools } = useSchoolsData();

    // Get parent's agents (only when PARENT_TO_AGENT is selected)
    const [agents, setAgents] = useState<any[]>([]);
    const [isLoadingAgents] = useState(false);

    useEffect(() => {
        if (direction === SupportRequestDirection.PARENT_TO_AGENT && parentData?.parentId) {
            // TODO: Fetch parent's agents
            // For now, we'll use an empty array
            setAgents([]);
        }
    }, [direction, parentData?.parentId]);

    const handleBack = () => {
        router.back();
    };

    const handleSubmit = useCallback(async () => {
        // Validate form
        const newErrors: { [key: string]: string } = {};

        if (!title.trim()) {
            newErrors.title = 'Le titre est requis';
        }

        if (!description.trim()) {
            newErrors.description = 'La description est requise';
        }

        if (!selectedSchoolId) {
            newErrors.school = 'Veuillez sélectionner une école';
        }

        if (direction === SupportRequestDirection.PARENT_TO_AGENT && !selectedAgentId) {
            newErrors.agent = 'Veuillez sélectionner un agent';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0 || !parentData?.parentId) {
            return;
        }

        setIsSubmitting(true);

        try {
            const requestData: AddSupportRequestInSystemRequestDto = {
                RequestDirection: direction,
                SupportRequestModel: {
                    Title: title.trim(),
                    Description: description.trim(),
                    SupportRequestType: requestType,
                    Priority: priority,
                    StatusId: 0, // Will be set by backend
                    SchoolId: selectedSchoolId!,
                    ParentId: parentData.parentId,
                    CollectingAgentId:
                        direction === SupportRequestDirection.PARENT_TO_AGENT
                            ? selectedAgentId!
                            : undefined,
                    DirectorId:
                        direction === SupportRequestDirection.PARENT_TO_DIRECTOR
                            ? undefined // Will be determined by backend based on school
                            : undefined,
                },
            };

            const response = await addSupportRequest(requestData);

            if (response.success) {
                Alert.alert(
                    'Succès',
                    'Votre demande d\'assistance a été envoyée avec succès.',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.back(),
                        },
                    ]
                );
            } else {
                Alert.alert('Erreur', response.error || 'Une erreur est survenue.');
            }
        } catch (error) {
            console.error('Error submitting support request:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de l\'envoi de la demande.');
        } finally {
            setIsSubmitting(false);
        }
    }, [
        title,
        description,
        requestType,
        priority,
        direction,
        selectedSchoolId,
        selectedAgentId,
        parentData?.parentId,
        addSupportRequest,
    ]);

    if (isLoadingParent) {
        return (
            <ScreenView safeArea backgroundColor={colors.background.default}>
                <PageHeader title="Demande d'assistance" onBack={handleBack} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                </View>
            </ScreenView>
        );
    }

    return (
        <ScreenView safeArea padding={false} backgroundColor={colors.background.default}>
            <PageHeader title="Demande d'assistance" onBack={handleBack} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Info Banner */}
                <View style={styles.infoBanner}>
                    <Ionicons name="information-circle" size={24} color={colors.info.main} />
                    <Text style={styles.infoBannerText}>
                        Décrivez votre problème et nous vous aiderons dans les plus brefs délais.
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.formSection}>
                    {/* Title */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Titre <Text style={styles.required}>*</Text>
                        </Text>
                        <CustomInput
                            placeholder="Entrez le titre de votre demande"
                            value={title}
                            onChangeText={(text) => {
                                setTitle(text);
                                if (errors.title) {
                                    setErrors({ ...errors, title: '' });
                                }
                            }}
                            error={errors.title}
                        />
                    </View>

                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Description <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={[styles.textAreaContainer, errors.description && styles.errorBorder]}>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Décrivez votre problème en détail..."
                                value={description}
                                onChangeText={(text) => {
                                    setDescription(text);
                                    if (errors.description) {
                                        setErrors({ ...errors, description: '' });
                                    }
                                }}
                                multiline
                                numberOfLines={6}
                                textAlignVertical="top"
                                placeholderTextColor={colors.text.secondary}
                            />
                        </View>
                        {errors.description && (
                            <Text style={styles.errorText}>{errors.description}</Text>
                        )}
                    </View>

                    {/* Request Type */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Type de demande</Text>
                        <SelectField
                            label=""
                            selectedValue={requestType}
                            options={[
                                { label: 'Général', value: SupportRequestType.General },
                                { label: 'Paiement', value: SupportRequestType.Payment },
                                { label: 'Aide', value: SupportRequestType.Help },
                            ]}
                            onSelect={(value: string | number) => setRequestType(value as SupportRequestType)}
                        />
                    </View>

                    {/* Priority */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Priorité</Text>
                        <SelectField
                            label=""
                            selectedValue={priority}
                            options={[
                                { label: 'Basse', value: SupportRequestPriority.Low },
                                { label: 'Moyenne', value: SupportRequestPriority.Medium },
                                { label: 'Haute', value: SupportRequestPriority.High },
                                { label: 'Urgente', value: SupportRequestPriority.Urgent },
                            ]}
                            onSelect={(value: string | number) => setPriority(value as SupportRequestPriority)}
                        />
                    </View>

                    {/* Direction */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Destinataire</Text>
                        <SelectField
                            label=""
                            selectedValue={direction}
                            options={[
                                { label: 'Directeur', value: SupportRequestDirection.PARENT_TO_DIRECTOR },
                                { label: 'Agent de collecte', value: SupportRequestDirection.PARENT_TO_AGENT },
                            ]}
                            onSelect={(value: string | number) => {
                                setDirection(value as string);
                                setSelectedAgentId(null);
                            }}
                        />
                    </View>

                    {/* School Selection */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            École <Text style={styles.required}>*</Text>
                        </Text>
                        {isLoadingSchools ? (
                            <ActivityIndicator size="small" color={colors.primary.main} />
                        ) : (
                            <>
                                <SelectField
                                    label=""
                                    selectedValue={selectedSchoolId}
                                    options={schools.map((school) => ({
                                        label: school.schoolName,
                                        value: school.schoolId,
                                    }))}
                                    onSelect={(value: string | number) => {
                                        setSelectedSchoolId(Number(value));
                                        if (errors.school) {
                                            setErrors({ ...errors, school: '' });
                                        }
                                    }}
                                    placeholder="Sélectionnez une école"
                                />
                                {errors.school && (
                                    <Text style={styles.errorText}>{errors.school}</Text>
                                )}
                            </>
                        )}
                    </View>

                    {/* Agent Selection (only for PARENT_TO_AGENT) */}
                    {direction === SupportRequestDirection.PARENT_TO_AGENT && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Agent de collecte <Text style={styles.required}>*</Text>
                            </Text>
                            {isLoadingAgents ? (
                                <ActivityIndicator size="small" color={colors.primary.main} />
                            ) : (
                                <>
                                    <SelectField
                                        label=""
                                        selectedValue={selectedAgentId}
                                        options={agents.map((agent) => ({
                                            label: `${agent.firstName} ${agent.lastName}`,
                                            value: agent.collectingAgentId,
                                        }))}
                                        onSelect={(value: string | number) => {
                                            setSelectedAgentId(Number(value));
                                            if (errors.agent) {
                                                setErrors({ ...errors, agent: '' });
                                            }
                                        }}
                                        placeholder="Sélectionnez un agent"
                                    />
                                    {errors.agent && (
                                        <Text style={styles.errorText}>{errors.agent}</Text>
                                    )}
                                </>
                            )}
                        </View>
                    )}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    activeOpacity={0.7}
                >
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color={colors.text.white} />
                    ) : (
                        <>
                            <Ionicons name="send" size={20} color={colors.text.white} />
                            <Text style={styles.submitButtonText}>Envoyer la demande</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </ScreenView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: spacingX._20,
        paddingBottom: spacingY._40,
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.info.light + '20',
        padding: spacingX._15,
        borderRadius: 12,
        marginBottom: spacingY._25,
        borderLeftWidth: 4,
        borderLeftColor: colors.info.main,
    },
    infoBannerText: {
        flex: 1,
        fontSize: scaleFont(14),
        color: colors.text.primary,
        marginLeft: spacingX._10,
        lineHeight: scaleFont(20),
    },
    formSection: {
        gap: spacingY._20,
    },
    inputGroup: {
        marginBottom: spacingY._5,
    },
    label: {
        fontSize: scaleFont(14),
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacingY._7,
    },
    required: {
        color: colors.error.main,
    },
    textAreaContainer: {
        backgroundColor: colors.background.paper,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border?.light || '#E5E7EB',
        padding: spacingX._15,
        minHeight: 120,
    },
    textArea: {
        fontSize: scaleFont(15),
        color: colors.text.primary,
        minHeight: 100,
    },
    errorBorder: {
        borderColor: colors.error.main,
    },
    errorText: {
        fontSize: scaleFont(12),
        color: colors.error.main,
        marginTop: spacingY._5,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary.main,
        paddingVertical: spacingY._15,
        borderRadius: 12,
        marginTop: spacingY._20,
        gap: spacingX._7,
        shadowColor: colors.primary.main,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        backgroundColor: colors.text.secondary,
        shadowOpacity: 0,
        elevation: 0,
    },
    submitButtonText: {
        fontSize: scaleFont(16),
        fontWeight: '600',
        color: colors.text.white,
    },
});
