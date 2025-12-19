// components/AddChildModal/AddChildModal.tsx
import { BottomModal } from '@/components/BottomModal/BottomModal';
import { CustomButton } from '@/components/Button/CustomPressable';
import { CustomInput } from '@/components/CustomInput/CustomInput';
import { SelectField } from '@/components/SelectField/SelectField';
import { colors, radius, shadows, spacingX, spacingY } from '@/constants/theme';
import useUserInfo from '@/hooks/useUserInfo';
import { School } from '@/services/childrenServices';
import { scale, scaleFont, SCREEN_HEIGHT } from '@/utils/stylings';
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
            subtitle="Remplissez les informations ci-dessous"
            enableDragToExpand={true}
            enableSwipeDown={true}
            height={SCREEN_HEIGHT * 0.85}
        >
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled={true}
                >
                    <View style={styles.formContainer}>
                        {/* First Name */}
                        <CustomInput
                            label="Prénom *"
                            value={firstName}
                            onChangeText={setFirstName}
                            placeholder="Ex: Jean"
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
                            placeholder="Ex: Dupont"
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
                            placeholder="Nom complet du père (optionnel)"
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
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name="calendar-outline"
                                    size={22}
                                    color={errors.dateOfBirth ? colors.error.main : colors.primary.main}
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
                                    size={18}
                                    color={colors.text.disabled}
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
                                    locale="fr-FR"
                                />
                            )}

                            {Platform.OS === 'ios' && showDatePicker && (
                                <View style={styles.iosDatePickerActions}>
                                    <TouchableOpacity
                                        style={styles.datePickerActionButton}
                                        onPress={() => setShowDatePicker(false)}
                                    >
                                        <Text style={styles.datePickerActionText}>Confirmer</Text>
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
                                    placeholder="Choisir l'établissement"
                                    error={errors.schoolId}
                                />
                            )}
                        </View>

                        {/* Help Text */}
                        <View style={styles.helpTextContainer}>
                            <Ionicons name="information-circle" size={20} color={colors.info.main} />
                            <Text style={styles.helpText}>
                                {"Veuillez vous assurer que les informations correspondent aux documents officiels de l'enfant."}
                            </Text>
                        </View>
                    </View>
                </ScrollView>

                {/* Action Buttons */}
                <View style={styles.actionContainer}>
                    <CustomButton
                        title="Annuler"
                        onPress={onClose}
                        variant="ghost"
                        color="primary"
                        style={styles.cancelButton}
                        disabled={isSubmitting}
                    />

                    <CustomButton
                        title={isSubmitting ? "Ajout..." : "Ajouter l'enfant"}
                        onPress={handleSubmit}
                        variant="filled"
                        color="primary"
                        style={styles.submitButton}
                        disabled={isSubmitting || schools.length === 0}
                        loading={isSubmitting}
                        leftIcon={isSubmitting ? undefined : "person-add"}
                        shadow
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
        paddingBottom: spacingY._20,
    },
    formContainer: {
        paddingBottom: spacingY._30,
    },
    fieldContainer: {
        marginBottom: spacingY._20,
    },
    fieldLabel: {
        fontSize: scaleFont(14),
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: spacingY._8,
        marginLeft: spacingX._2,
    },
    noSchoolsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacingX._20,
        backgroundColor: colors.surface.main,
        borderRadius: radius._12,
        borderWidth: 1,
        borderColor: colors.border.main,
    },
    noSchoolsText: {
        fontSize: scaleFont(14),
        color: colors.text.secondary,
        marginLeft: spacingX._10,
        fontWeight: '500',
    },
    helpTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacingX._15,
        paddingVertical: spacingY._12,
        backgroundColor: `${colors.info.main}10`,
        borderRadius: radius._12,
        marginTop: spacingY._10,
        borderWidth: 1,
        borderColor: `${colors.info.main}20`,
    },
    helpText: {
        fontSize: scaleFont(13),
        color: colors.info.dark,
        marginLeft: spacingX._10,
        flex: 1,
        fontWeight: '500',
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: spacingY._20,
        paddingBottom: Platform.OS === 'ios' ? spacingY._10 : spacingY._20,
        borderTopWidth: 1,
        borderTopColor: colors.border.light,
        gap: spacingX._12,
        backgroundColor: colors.background.paper,
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
        backgroundColor: colors.surface.main,
        borderWidth: 1.5,
        borderColor: 'transparent',
        borderRadius: radius._12,
        paddingHorizontal: spacingX._15,
        paddingVertical: spacingY._12,
        minHeight: scale(52),
    },
    datePickerButtonError: {
        borderColor: colors.error.main,
        backgroundColor: `${colors.error.main}05`,
    },
    datePickerIcon: {
        marginRight: spacingX._12,
    },
    datePickerText: {
        flex: 1,
        fontSize: scaleFont(15),
        color: colors.text.primary,
        fontWeight: '500',
    },
    datePickerPlaceholder: {
        color: colors.text.disabled,
        fontWeight: '400',
    },
    errorText: {
        fontSize: scaleFont(12),
        color: colors.error.main,
        marginTop: spacingY._5,
        marginLeft: spacingX._4,
        fontWeight: '500',
    },
    iosDatePicker: {
        marginTop: spacingY._10,
        backgroundColor: colors.background.paper,
        borderRadius: radius._12,
    },
    iosDatePickerActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: spacingY._10,
    },
    datePickerActionButton: {
        paddingHorizontal: spacingX._20,
        paddingVertical: spacingY._8,
        backgroundColor: colors.primary.main,
        borderRadius: radius._8,
        ...shadows.sm,
    },
    datePickerActionText: {
        color: colors.text.white,
        fontSize: scaleFont(14),
        fontWeight: '700',
    },
});