// components/AddChildModal/AddChildModal.tsx
import { BottomModal } from '@/components/BottomModal/BottomModal';
import { CustomButton } from '@/components/Button/CustomPressable';
import { CustomInput } from '@/components/CustomInput/CustomInput';
import { SelectField } from '@/components/SelectField/SelectField';
import { colors, spacingX, spacingY } from '@/constants/theme';
import useUserInfo from '@/hooks/useUserInfo';
import { School } from '@/services/childrenServices';
import { scaleFont, SCREEN_HEIGHT } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface AddChildModalProps {
    visible: boolean;
    onClose: () => void;
    onAddChild: (childData: AddChildData) => Promise<void>;
    schools: School[];
    isLoading?: boolean;
}

export interface AddChildData {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    fatherName: string;
    parentId: number;
    schoolId: number;
}

export const AddChildModal: React.FC<AddChildModalProps> = ({
    visible,
    onClose,
    onAddChild,
    schools,
    isLoading = false,
}) => {
    const userInfo = useUserInfo();

    // Form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [fatherName, setFatherName] = useState('');
    const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);

    // Validation state
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (visible) {
            resetForm();
        }
    }, [visible]);

    const resetForm = () => {
        setFirstName('');
        setLastName('');
        setDateOfBirth(null);
        setShowDatePicker(false);
        setFatherName('');
        setSelectedSchoolId(null);
        setErrors({});
        setIsSubmitting(false);
    };

    // Validation
    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!firstName.trim()) {
            newErrors.firstName = 'Le prénom est obligatoire';
        }

        if (!lastName.trim()) {
            newErrors.lastName = 'Le nom de famille est obligatoire';
        }

        if (!dateOfBirth) {
            newErrors.dateOfBirth = 'La date de naissance est obligatoire';
        } else {
            // Check if date is not in the future
            const today = new Date();
            today.setHours(23, 59, 59, 999); // Set to end of today for comparison

            if (dateOfBirth > today) {
                newErrors.dateOfBirth = 'La date de naissance ne peut pas être dans le futur';
            }

            // Check if date is reasonable (not too old)
            const minDate = new Date();
            minDate.setFullYear(minDate.getFullYear() - 100);

            if (dateOfBirth < minDate) {
                newErrors.dateOfBirth = 'Date de naissance invalide';
            }
        }

        if (!selectedSchoolId) {
            newErrors.schoolId = 'Veuillez sélectionner une école';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        if (!userInfo?.parentId) {
            Alert.alert('Erreur', 'Informations parent non trouvées');
            return;
        }

        try {
            setIsSubmitting(true);

            // Format date to YYYY-MM-DD for API
            const formattedDate = dateOfBirth!.toISOString().split('T')[0];

            const childData: AddChildData = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                dateOfBirth: formattedDate,
                fatherName: fatherName.trim(),
                parentId: parseInt(userInfo.parentId),
                schoolId: selectedSchoolId!,
            };

            await onAddChild(childData);
            resetForm();
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Date picker handlers
    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }

        if (selectedDate) {
            setDateOfBirth(selectedDate);
            // Clear date error if date is selected
            if (errors.dateOfBirth) {
                setErrors(prev => ({ ...prev, dateOfBirth: '' }));
            }
        }
    };

    const handleDatePickerPress = () => {
        setShowDatePicker(true);
    };

    const formatDateForDisplay = (date: Date): string => {
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Calculate maximum date (today) and minimum date (100 years ago)
    const getMaxDate = (): Date => {
        return new Date();
    };

    const getMinDate = (): Date => {
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 100);
        return minDate;
    };

    // School options for select
    const schoolOptions = schools.map(school => ({
        label: school.schoolName,
        value: school.schoolId,
    }));

    return (
        <BottomModal
            visible={visible}
            onClose={onClose}
            title="Ajouter un enfant"
            subtitle="Remplissez les informations de l'enfant"
            enableDragToExpand={true}
            enableSwipeDown={false} // Disable swipe down to prevent interference
            height={SCREEN_HEIGHT * 0.95}

        >
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    // These props help prevent the modal from intercepting scroll gestures
                    nestedScrollEnabled={true}
                    scrollEnabled={true}
                    bounces={false} // Disable bounce to prevent interference with modal gestures
                >
                    <View style={styles.formContainer}>
                        {/* First Name */}
                        <CustomInput
                            label="Prénom *"
                            value={firstName}
                            onChangeText={setFirstName}
                            placeholder="Entrez le prénom"
                            error={errors.firstName}
                            leftIcon="person-outline"
                            autoCapitalize="words"
                            returnKeyType="next"
                        />

                        {/* Last Name */}
                        <CustomInput
                            label="Nom de famille *"
                            value={lastName}
                            onChangeText={setLastName}
                            placeholder="Entrez le nom de famille"
                            error={errors.lastName}
                            leftIcon="person-outline"
                            autoCapitalize="words"
                            returnKeyType="next"
                        />

                        {/* Father Name */}
                        <CustomInput
                            label="Nom du père"
                            value={fatherName}
                            onChangeText={setFatherName}
                            placeholder="Entrez le nom du père (optionnel)"
                            leftIcon="person-outline"
                            autoCapitalize="words"
                            returnKeyType="next"
                        />

                        {/* Date of Birth */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>Date de naissance *</Text>

                            <TouchableOpacity
                                style={[
                                    styles.datePickerButton,
                                    errors.dateOfBirth && styles.datePickerButtonError
                                ]}
                                onPress={handleDatePickerPress}
                            >
                                <Ionicons
                                    name="calendar-outline"
                                    size={20}
                                    color={colors.text.secondary}
                                    style={styles.datePickerIcon}
                                />
                                <Text style={[
                                    styles.datePickerText,
                                    !dateOfBirth && styles.datePickerPlaceholder
                                ]}>
                                    {dateOfBirth ? formatDateForDisplay(dateOfBirth) : "Sélectionnez une date"}
                                </Text>
                                <Ionicons
                                    name="chevron-down"
                                    size={16}
                                    color={colors.text.secondary}
                                />
                            </TouchableOpacity>

                            {errors.dateOfBirth && (
                                <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
                            )}

                            {showDatePicker && (
                                <DateTimePicker
                                    value={dateOfBirth || new Date()}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={handleDateChange}
                                    maximumDate={getMaxDate()}
                                    minimumDate={getMinDate()}
                                    style={Platform.OS === 'ios' ? styles.iosDatePicker : undefined}
                                />
                            )}

                            {Platform.OS === 'ios' && showDatePicker && (
                                <View style={styles.iosDatePickerActions}>
                                    <TouchableOpacity
                                        style={styles.datePickerActionButton}
                                        onPress={() => setShowDatePicker(false)}
                                    >
                                        <Text style={styles.datePickerActionText}>Terminé</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* School Selection */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>École *</Text>

                            {schools.length === 0 ? (
                                <View style={styles.noSchoolsContainer}>
                                    <Ionicons name="school-outline" size={24} color={colors.text.disabled} />
                                    <Text style={styles.noSchoolsText}>
                                        Aucune école disponible
                                    </Text>
                                </View>
                            ) : (
                                <SelectField
                                    options={schoolOptions}
                                    selectedValue={selectedSchoolId}
                                    onSelect={(value) => setSelectedSchoolId(value as number)}
                                    placeholder="Sélectionnez une école"
                                    error={errors.schoolId}
                                />
                            )}
                        </View>

                        {/* Help Text */}
                        <View style={styles.helpTextContainer}>
                            <Ionicons name="information-circle-outline" size={16} color={colors.text.secondary} />
                            <Text style={styles.helpText}>
                                {"Les champs marqués d'un * sont obligatoires"}
                            </Text>
                        </View>
                    </View>
                </ScrollView>

                {/* Action Buttons */}
                <View style={styles.actionContainer}>
                    <CustomButton
                        title="Annuler"
                        onPress={onClose}
                        variant="filled"
                        color="error"
                        fullWidth={false}
                        style={styles.cancelButton}
                        disabled={isSubmitting}
                    />

                    <CustomButton
                        title={isSubmitting ? "Ajout en cours..." : "Ajouter l'enfant"}
                        onPress={handleSubmit}
                        variant="filled"
                        color="primary"
                        fullWidth={false}
                        style={styles.submitButton}
                        disabled={isSubmitting || schools.length === 0}
                        loading={isSubmitting}
                        leftIcon={isSubmitting ? undefined : "person-add-outline"}
                    />
                </View>
            </KeyboardAvoidingView>
        </BottomModal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        maxHeight: '100%',
        marginTop: spacingY._10
    },
    scrollView: {
        flex: 1,
        maxHeight: '100%',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: spacingY._10,
    },
    formContainer: {
        paddingBottom: spacingY._30,
    },
    fieldContainer: {
        marginBottom: spacingY._20,
    },
    fieldLabel: {
        fontSize: scaleFont(14),
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacingY._7,
    },
    noSchoolsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacingX._20,
        backgroundColor: colors.background.default,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border?.light || '#e1e5e9',
    },
    noSchoolsText: {
        fontSize: scaleFont(14),
        color: colors.text.disabled,
        marginLeft: spacingX._10,
    },
    helpTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacingX._15,
        paddingVertical: spacingY._10,
        backgroundColor: colors.info.light + '20',
        borderRadius: 8,
        marginTop: spacingY._10,
    },
    helpText: {
        fontSize: scaleFont(12),
        color: colors.text.secondary,
        marginLeft: spacingX._7,
        flex: 1,
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: spacingY._20,
        borderTopWidth: 1,
        borderTopColor: colors.border?.light || '#e1e5e9',
        gap: spacingX._15,
    },
    cancelButton: {
        flex: 1,
    },
    submitButton: {
        flex: 2,
    },

    // Date picker styles
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.paper,
        borderWidth: 1,
        borderColor: colors.border?.light || '#e1e5e9',
        borderRadius: 8,
        paddingHorizontal: spacingX._15,
        paddingVertical: spacingY._12,
        minHeight: 48,
    },
    datePickerButtonError: {
        borderColor: colors.error.main,
    },
    datePickerIcon: {
        marginRight: spacingX._10,
    },
    datePickerText: {
        flex: 1,
        fontSize: scaleFont(14),
        color: colors.text.primary,
    },
    datePickerPlaceholder: {
        color: colors.text.secondary,
    },
    errorText: {
        fontSize: scaleFont(12),
        color: colors.error.main,
        marginTop: spacingY._5,
    },
    iosDatePicker: {
        marginTop: spacingY._10,
    },
    iosDatePickerActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: spacingY._10,
    },
    datePickerActionButton: {
        paddingHorizontal: spacingX._20,
        paddingVertical: spacingY._7,
        backgroundColor: colors.primary.main,
        borderRadius: 6,
    },
    datePickerActionText: {
        color: colors.text.white,
        fontSize: scaleFont(14),
        fontWeight: '600',
    },
});