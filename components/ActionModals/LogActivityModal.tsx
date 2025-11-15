import { BottomModal } from '@/components/BottomModal/BottomModal';
import { CustomInput } from '@/components/CustomInput/CustomInput';
import { SelectField } from '@/components/SelectField/SelectField';
import { colors, getTextStyle, spacingX, spacingY } from '@/constants/theme';
import useUserInfo from '@/hooks/useUserInfo';
import {
    CollectingAgentActivityType,
    getActivityTypeDisplayName,
    useLogActivity,
} from '@/services/collectingAgentActivityServices';
import { useGetCollectingAgentParents } from '@/services/collectingAgentServices';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface LogActivityModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    parentId?: number;
    parentName?: string;
}

export const LogActivityModal: React.FC<LogActivityModalProps> = ({
    visible,
    onClose,
    onSuccess,
    parentId,
    parentName,
}) => {
    const logActivity = useLogActivity();
    const getCollectingAgentParents = useGetCollectingAgentParents();
    const userInfo = useUserInfo();

    const [activityType, setActivityType] = useState<CollectingAgentActivityType | null>(
        null
    );
    const [selectedParentId, setSelectedParentId] = useState<number | null>(parentId || null);
    const [description, setDescription] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [parentOptions, setParentOptions] = useState<{ label: string; value: string }[]>([]);
    const [isLoadingParents, setIsLoadingParents] = useState(false);

    // Fetch assigned parents when modal opens and parentId is not provided
    useEffect(() => {
        if (visible && !parentId && userInfo?.parentId) {
            const agentId = typeof userInfo.parentId === 'number'
                ? userInfo.parentId
                : Number(userInfo.parentId);

            const fetchParents = async () => {
                setIsLoadingParents(true);
                try {
                    const { success, data } = await getCollectingAgentParents({
                        collectingAgentId: agentId,
                        pageNumber: 1,
                        pageSize: 100, // Get all parents
                    });

                    if (success && data?.data) {
                        const options = data.data.map((parent) => ({
                            label: `${parent.firstName} ${parent.lastName}`,
                            value: parent.parentId.toString(),
                        }));
                        setParentOptions(options);
                    }
                } catch (err) {
                    console.error('Error fetching parents:', err);
                } finally {
                    setIsLoadingParents(false);
                }
            };
            fetchParents();
        }
    }, [visible, parentId, userInfo?.parentId]);

    const activityTypeOptions = [
        {
            label: getActivityTypeDisplayName(CollectingAgentActivityType.PaymentCollected),
            value: CollectingAgentActivityType.PaymentCollected.toString(),
        },
        {
            label: getActivityTypeDisplayName(CollectingAgentActivityType.PaymentAttempted),
            value: CollectingAgentActivityType.PaymentAttempted.toString(),
        },
        {
            label: getActivityTypeDisplayName(CollectingAgentActivityType.ParentContact),
            value: CollectingAgentActivityType.ParentContact.toString(),
        },
        {
            label: getActivityTypeDisplayName(CollectingAgentActivityType.SupportRequestHandled),
            value: CollectingAgentActivityType.SupportRequestHandled.toString(),
        },
        {
            label: getActivityTypeDisplayName(CollectingAgentActivityType.ParentAssigned),
            value: CollectingAgentActivityType.ParentAssigned.toString(),
        },
        {
            label: getActivityTypeDisplayName(CollectingAgentActivityType.ParentUnassigned),
            value: CollectingAgentActivityType.ParentUnassigned.toString(),
        },
        {
            label: getActivityTypeDisplayName(CollectingAgentActivityType.FieldVisit),
            value: CollectingAgentActivityType.FieldVisit.toString(),
        },
        {
            label: getActivityTypeDisplayName(CollectingAgentActivityType.PhoneCall),
            value: CollectingAgentActivityType.PhoneCall.toString(),
        },
        {
            label: getActivityTypeDisplayName(CollectingAgentActivityType.Other),
            value: CollectingAgentActivityType.Other.toString(),
        },
    ];

    const handleSubmit = async () => {
        if (activityType === null) {
            Alert.alert('Erreur', "Veuillez sélectionner un type d'activité");
            return;
        }

        if (!description.trim()) {
            Alert.alert('Erreur', 'Veuillez saisir une description');
            return;
        }

        setIsSubmitting(true);

        try {
            const { success, error } = await logActivity({
                parentId: selectedParentId || undefined,
                activityType,
                activityDescription: description.trim(),
                notes: notes.trim() || undefined,
            });

            if (success) {
                Alert.alert('Succès', 'Activité enregistrée avec succès');
                resetForm();
                onSuccess?.();
                onClose();
            } else {
                Alert.alert('Erreur', error || "Impossible d'enregistrer l'activité");
            }
        } catch (err) {
            Alert.alert('Erreur', "Une erreur est survenue");
            console.error('Error logging activity:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setActivityType(null);
        setSelectedParentId(parentId || null);
        setDescription('');
        setNotes('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <BottomModal
            visible={visible}
            onClose={handleClose}
            title="Enregistrer une activité"
            height="auto"
        >
            <View style={styles.container}>
                {parentName ? (
                    <View style={styles.parentInfo}>
                        <Text style={styles.parentLabel}>Parent:</Text>
                        <Text style={styles.parentName}>{parentName}</Text>
                    </View>
                ) : (
                    <View>
                        <SelectField
                            label="Parent (optionnel)"
                            placeholder="Sélectionnez un parent"
                            options={parentOptions}
                            selectedValue={selectedParentId !== null ? selectedParentId.toString() : null}
                            onSelect={(value) => setSelectedParentId(Number(value))}
                            disabled={isLoadingParents}
                        />
                        {isLoadingParents && (
                            <View style={styles.loadingParents}>
                                <ActivityIndicator size="small" color={colors.primary.main} />
                                <Text style={styles.loadingText}>Chargement des parents...</Text>
                            </View>
                        )}
                    </View>
                )}

                <SelectField
                    label="Type d'activité *"
                    placeholder="Sélectionnez un type"
                    options={activityTypeOptions}
                    selectedValue={activityType !== null ? activityType.toString() : null}
                    onSelect={(value) => setActivityType(Number(value))}
                />

                <CustomInput
                    label="Description *"
                    placeholder="Décrivez l'activité..."
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={3}
                    maxLength={200}
                />

                <CustomInput
                    label="Notes supplémentaires"
                    placeholder="Ajoutez des notes (optionnel)..."
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={4}
                    maxLength={1000}
                />

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={handleClose}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.cancelButtonText}>Annuler</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.submitButton]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color={colors.text.white} />
                        ) : (
                            <Text style={styles.submitButtonText}>Enregistrer</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </BottomModal>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: spacingY._15,
    },
    parentInfo: {
        backgroundColor: colors.background.default,
        padding: spacingX._12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingX._10,
    },
    parentLabel: {
        ...getTextStyle('sm', 'medium', colors.text.secondary),
    },
    parentName: {
        ...getTextStyle('sm', 'semibold', colors.text.primary),
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: spacingX._10,
        marginTop: spacingY._10,
    },
    button: {
        flex: 1,
        paddingVertical: spacingY._12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: colors.background.default,
        borderWidth: 1,
        borderColor: colors.border?.light || '#e1e5e9',
    },
    cancelButtonText: {
        ...getTextStyle('sm', 'semibold', colors.text.primary),
    },
    submitButton: {
        backgroundColor: colors.primary.main,
    },
    submitButtonText: {
        ...getTextStyle('sm', 'semibold', colors.text.white),
    },
    loadingParents: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingX._10,
        marginTop: spacingY._5,
    },
    loadingText: {
        ...getTextStyle('xs', 'normal', colors.text.secondary),
    },
});
