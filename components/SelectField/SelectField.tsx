// components/SelectField/SelectField.tsx
import { colors, spacingX, spacingY } from '@/constants/theme';
import { scaleFont } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface SelectOption {
    label: string;
    value: number | string;
}

interface SelectFieldProps {
    options: SelectOption[];
    selectedValue: number | string | null;
    onSelect: (value: number | string) => void;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    label?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
    options,
    selectedValue,
    onSelect,
    placeholder = "Sélectionner une option",
    error,
    disabled = false,
    label,
}) => {
    const [isVisible, setIsVisible] = useState(false);

    const selectedOption = options.find(option => option.value === selectedValue);

    const handleSelect = (value: number | string) => {
        onSelect(value);
        setIsVisible(false);
    };

    const renderOption = ({ item }: { item: SelectOption }) => (
        <TouchableOpacity
            style={[
                styles.optionItem,
                item.value === selectedValue && styles.selectedOption
            ]}
            onPress={() => handleSelect(item.value)}
        >
            <Text style={[
                styles.optionText,
                item.value === selectedValue && styles.selectedOptionText
            ]}>
                {item.label}
            </Text>
            {item.value === selectedValue && (
                <Ionicons name="checkmark" size={20} color={colors.primary.main} />
            )}
        </TouchableOpacity>
    );

    return (
        <View>
            {label && (
                <Text style={styles.label}>{label}</Text>
            )}

            <TouchableOpacity
                style={[
                    styles.selectButton,
                    error && styles.selectButtonError,
                    disabled && styles.selectButtonDisabled
                ]}
                onPress={() => !disabled && setIsVisible(true)}
                disabled={disabled}
            >
                <Text style={[
                    styles.selectText,
                    !selectedOption && styles.placeholderText,
                    disabled && styles.disabledText
                ]}>
                    {selectedOption ? selectedOption.label : placeholder}
                </Text>
                <Ionicons
                    name="chevron-down"
                    size={16}
                    color={disabled ? colors.text.disabled : colors.text.secondary}
                />
            </TouchableOpacity>

            {error && (
                <Text style={styles.errorText}>{error}</Text>
            )}

            <Modal
                visible={isVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setIsVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {label || "Sélectionner une option"}
                            </Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setIsVisible(false)}
                            >
                                <Ionicons name="close" size={24} color={colors.text.primary} />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={options}
                            renderItem={renderOption}
                            keyExtractor={(item) => item.value.toString()}
                            style={styles.optionsList}
                            showsVerticalScrollIndicator={false}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                        />
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    label: {
        fontSize: scaleFont(14),
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacingY._7,
    },
    selectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.background.paper,
        borderWidth: 1,
        borderColor: colors.border?.light || '#e1e5e9',
        borderRadius: 8,
        paddingHorizontal: spacingX._15,
        paddingVertical: spacingY._12,
        minHeight: 48,
    },
    selectButtonError: {
        borderColor: colors.error.main,
    },
    selectButtonDisabled: {
        backgroundColor: colors.text.disabled || '#f5f5f5',
        opacity: 0.6,
    },
    selectText: {
        fontSize: scaleFont(14),
        color: colors.text.primary,
        flex: 1,
    },
    placeholderText: {
        color: colors.text.secondary,
    },
    disabledText: {
        color: colors.text.disabled,
    },
    errorText: {
        fontSize: scaleFont(12),
        color: colors.error.main,
        marginTop: spacingY._5,
    },

    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacingX._20,
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        width: '100%',
        maxWidth: 400,
        maxHeight: '70%',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacingX._20,
        paddingTop: spacingY._20,
        paddingBottom: spacingY._15,
        backgroundColor: '#FFFFFF',
    },
    modalTitle: {
        fontSize: scaleFont(18),
        fontWeight: '700',
        color: colors.text.primary,
        letterSpacing: 0.3,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.background.default,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionsList: {
        paddingHorizontal: spacingX._15,
        paddingVertical: spacingY._10,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacingY._15,
        paddingHorizontal: spacingX._15,
        borderRadius: 12,
        marginVertical: spacingY._5,
    },
    selectedOption: {
        backgroundColor: 'transparent',
    },
    optionText: {
        fontSize: scaleFont(15),
        color: colors.text.primary,
        flex: 1,
        letterSpacing: 0.2,
    },
    selectedOptionText: {
        color: colors.primary.main,
        fontWeight: '600',
    },
    separator: {
        height: 0,
    },
});