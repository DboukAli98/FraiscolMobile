// components/SelectField/SelectField.tsx
import { colors, radius, shadows, spacingX, spacingY } from '@/constants/theme';
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
        <View style={styles.container}>
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
                activeOpacity={0.7}
            >
                <Text style={[
                    styles.selectText,
                    !selectedOption && styles.placeholderText,
                    disabled && styles.disabledText
                ]} numberOfLines={1}>
                    {selectedOption ? selectedOption.label : placeholder}
                </Text>
                <Ionicons
                    name="chevron-down"
                    size={18}
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
    container: {
        marginBottom: spacingY._15,
    },
    label: {
        fontSize: scaleFont(14),
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: spacingY._8,
        marginLeft: spacingX._4,
    },
    selectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surface.main,
        borderWidth: 1.5,
        borderColor: colors.border.main,
        borderRadius: radius._12,
        paddingHorizontal: spacingX._15,
        paddingVertical: spacingY._12,
        minHeight: 48,
        ...shadows.xs,
    },
    selectButtonError: {
        borderColor: colors.error.main,
    },
    selectButtonDisabled: {
        backgroundColor: colors.background.default,
        borderColor: colors.border.light,
        opacity: 0.6,
    },
    selectText: {
        fontSize: scaleFont(15),
        color: colors.text.primary,
        fontWeight: '500',
        flex: 1,
    },
    placeholderText: {
        color: colors.text.disabled,
    },
    disabledText: {
        color: colors.text.disabled,
    },
    errorText: {
        color: colors.error.main,
        fontSize: scaleFont(12),
        marginTop: spacingY._4,
        marginLeft: spacingX._4,
        fontWeight: '500',
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
        backgroundColor: colors.background.paper,
        borderRadius: radius._20,
        width: '100%',
        maxWidth: 400,
        maxHeight: '70%',
        overflow: 'hidden',
        ...shadows.xl,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacingX._20,
        paddingTop: spacingY._20,
        paddingBottom: spacingY._15,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
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
        borderRadius: radius._12,
        marginVertical: spacingY._5,
    },
    selectedOption: {
        backgroundColor: colors.primary.light + '10',
    },
    optionText: {
        fontSize: scaleFont(15),
        color: colors.text.primary,
        flex: 1,
        fontWeight: '500',
    },
    selectedOptionText: {
        color: colors.primary.main,
        fontWeight: '700',
    },
    separator: {
        height: 0,
    },
});