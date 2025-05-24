// components/ui/CustomInput.tsx
import { colors, radius, shadows, spacingX, spacingY } from '@/constants/theme';
import { scale, scaleFont, verticalScale } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
    Animated,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

// Base Input Props
interface CustomInputProps extends Omit<TextInputProps, 'style'> {
    // Content
    label?: string;
    placeholder?: string;
    value?: string;
    onChangeText?: (text: string) => void;

    // Validation
    error?: string;
    isValid?: boolean;
    required?: boolean;

    // Styling
    variant?: 'outlined' | 'filled' | 'underlined' | 'rounded';
    size?: 'sm' | 'md' | 'lg';

    // Icons
    leftIcon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onRightIconPress?: () => void;

    // States
    disabled?: boolean;
    loading?: boolean;

    // Behavior
    animateLabel?: boolean;
    showCharacterCount?: boolean;
    maxLength?: number;

    // Custom Styles
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
    labelStyle?: TextStyle;
    errorStyle?: TextStyle;

    // Input Types
    inputType?: 'text' | 'password' | 'email' | 'phone' | 'number' | 'search';
}

export interface CustomInputRef {
    focus: () => void;
    blur: () => void;
    clear: () => void;
    isFocused: () => boolean;
}

export const CustomInput = forwardRef<CustomInputRef, CustomInputProps>(({
    label,
    placeholder,
    value = '',
    onChangeText,
    error,
    isValid,
    required = false,
    variant = 'outlined',
    size = 'md',
    leftIcon,
    rightIcon,
    onRightIconPress,
    disabled = false,
    loading = false,
    animateLabel = true,
    showCharacterCount = false,
    maxLength,
    containerStyle,
    inputStyle,
    labelStyle,
    errorStyle,
    inputType = 'text',
    ...textInputProps
}, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        focus: () => inputRef.current?.focus(),
        blur: () => inputRef.current?.blur(),
        clear: () => {
            onChangeText?.('');
            inputRef.current?.clear();
        },
        isFocused: () => isFocused,
    }));

    // Get input configuration based on type
    const getInputConfig = () => {
        switch (inputType) {
            case 'password':
                return {
                    secureTextEntry: !isPasswordVisible,
                    rightIcon: rightIcon || (isPasswordVisible ? 'eye-off-outline' : 'eye-outline'),
                    onRightIconPress: () => setIsPasswordVisible(!isPasswordVisible),
                    autoCapitalize: 'none' as const,
                };
            case 'email':
                return {
                    keyboardType: 'email-address' as const,
                    autoCapitalize: 'none' as const,
                    autoComplete: 'email' as const,
                    leftIcon: leftIcon || 'mail-outline',
                };
            case 'phone':
                return {
                    keyboardType: 'phone-pad' as const,
                    leftIcon: leftIcon || 'call-outline',
                };
            case 'number':
                return {
                    keyboardType: 'numeric' as const,
                };
            case 'search':
                return {
                    leftIcon: leftIcon || 'search-outline',
                    returnKeyType: 'search' as const,
                };
            default:
                return {};
        }
    };

    const inputConfig = getInputConfig();

    // Get sizes based on size prop
    const getSizes = () => {
        switch (size) {
            case 'sm':
                return {
                    height: verticalScale(40),
                    fontSize: scaleFont(14),
                    paddingHorizontal: spacingX._12,
                    paddingVertical: spacingY._10,
                    iconSize: scale(18),
                };
            case 'md':
                return {
                    height: verticalScale(48),
                    fontSize: scaleFont(16),
                    paddingHorizontal: spacingX._15,
                    paddingVertical: spacingY._12,
                    iconSize: scale(20),
                };
            case 'lg':
                return {
                    height: verticalScale(56),
                    fontSize: scaleFont(18),
                    paddingHorizontal: spacingX._20,
                    paddingVertical: spacingY._15,
                    iconSize: scale(24),
                };
            default:
                return {
                    height: verticalScale(48),
                    fontSize: scaleFont(16),
                    paddingHorizontal: spacingX._15,
                    paddingVertical: spacingY._12,
                    iconSize: scale(20),
                };
        }
    };

    const sizes = getSizes();

    // Get container style based on variant
    const getContainerStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            height: sizes.height,
            borderRadius: radius._10,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: sizes.paddingHorizontal,
        };

        if (disabled) {
            baseStyle.opacity = 0.6;
        }

        switch (variant) {
            case 'outlined':
                return {
                    ...baseStyle,
                    borderWidth: 2,
                    borderColor: error
                        ? colors.error.main
                        : isFocused
                            ? colors.primary.main
                            : colors.border?.main || '#d1d5db',
                    backgroundColor: colors.background.default,
                };
            case 'filled':
                return {
                    ...baseStyle,
                    backgroundColor: colors.background.paper,
                    borderWidth: 0,
                    borderBottomWidth: 2,
                    borderBottomColor: error
                        ? colors.error.main
                        : isFocused
                            ? colors.primary.main
                            : colors.border?.main || '#d1d5db',
                    borderRadius: 0,
                    borderTopLeftRadius: radius._10,
                    borderTopRightRadius: radius._10,
                };
            case 'underlined':
                return {
                    ...baseStyle,
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                    borderBottomWidth: 2,
                    borderBottomColor: error
                        ? colors.error.main
                        : isFocused
                            ? colors.primary.main
                            : colors.border?.main || '#d1d5db',
                    borderRadius: 0,
                    paddingHorizontal: 0,
                };
            case 'rounded':
                return {
                    ...baseStyle,
                    borderRadius: sizes.height / 2,
                    borderWidth: 2,
                    borderColor: error
                        ? colors.error.main
                        : isFocused
                            ? colors.primary.main
                            : colors.border?.main || '#d1d5db',
                    backgroundColor: colors.background.default,
                    ...shadows.sm,
                };
            default:
                return baseStyle;
        }
    };

    // Animate label
    const animateLabelFunction = (toValue: number) => {
        if (animateLabel) {
            Animated.timing(labelAnim, {
                toValue,
                duration: 200,
                useNativeDriver: false,
            }).start();
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
        animateLabelFunction(1);
        textInputProps.onFocus?.({} as any);
    };

    const handleBlur = () => {
        setIsFocused(false);
        if (!value) {
            animateLabelFunction(0);
        }
        textInputProps.onBlur?.({} as any);
    };

    const handleChangeText = (text: string) => {
        onChangeText?.(text);
        if (text && !value) {
            animateLabelFunction(1);
        } else if (!text && value) {
            animateLabelFunction(0);
        }
    };

    // Get label position for floating label
    const getLabelStyle = (): any => {
        if (!animateLabel || !label) return {};

        // Calculate proper center position for the label
        const labelFontSize = sizes.fontSize;
        const containerCenter = sizes.height / 2;
        const labelCenter = labelFontSize / 1.2;
        const centeredPosition = containerCenter - labelCenter;

        return {
            position: 'absolute',
            left: variant === 'underlined' ? 0 : sizes.paddingHorizontal,
            top: labelAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [centeredPosition, -scaleFont(12)], // Added small offset for better positioning
            }),
            fontSize: labelAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [labelFontSize, scaleFont(12)],
            }),
            color: error
                ? colors.error.main
                : isFocused
                    ? colors.primary.main
                    : colors.text.secondary,
            backgroundColor: variant === 'outlined' ? colors.background.default : 'transparent',
            paddingHorizontal: variant === 'outlined' ? spacingX._5 : 0,
            zIndex: 1,
        };
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {/* Static Label (for non-animated labels) */}
            {label && !animateLabel && (
                <View style={styles.staticLabelContainer}>
                    <Text style={[styles.staticLabel, labelStyle]}>
                        {label}
                        {required && <Text style={styles.required}> *</Text>}
                    </Text>
                </View>
            )}

            {/* Input Container */}
            <View style={[getContainerStyle(), styles.inputContainer]}>
                {/* Left Icon */}
                {(leftIcon || inputConfig.leftIcon) && (
                    <Ionicons
                        name={(leftIcon || inputConfig.leftIcon)!}
                        size={sizes.iconSize}
                        color={isFocused ? colors.primary.main : colors.text.secondary}
                        style={styles.leftIcon}
                    />
                )}

                {/* Animated Label */}
                {label && animateLabel && (
                    <Animated.Text style={[styles.animatedLabel, getLabelStyle()]}>
                        {label}
                        {required && <Text style={styles.required}> *</Text>}
                    </Animated.Text>
                )}

                {/* Text Input */}
                <TextInput
                    ref={inputRef}
                    value={value}
                    onChangeText={handleChangeText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={!animateLabel ? placeholder : isFocused || value ? placeholder : ''}
                    placeholderTextColor={colors.text.disabled}
                    editable={!disabled && !loading}
                    maxLength={maxLength}
                    style={[
                        styles.textInput,
                        {
                            fontSize: sizes.fontSize,
                            color: colors.text.primary,
                            flex: 1,
                        },
                        inputStyle,
                    ]}
                    {...inputConfig}
                    {...textInputProps}
                />

                {/* Right Icon */}
                {(rightIcon || inputConfig.rightIcon) && (
                    <TouchableOpacity
                        onPress={onRightIconPress || inputConfig.onRightIconPress}
                        style={styles.rightIcon}
                        disabled={disabled}
                    >
                        <Ionicons
                            name={(rightIcon || inputConfig.rightIcon)!}
                            size={sizes.iconSize}
                            color={isFocused ? colors.primary.main : colors.text.secondary}
                        />
                    </TouchableOpacity>
                )}

                {/* Loading Indicator */}
                {loading && (
                    <View style={styles.loadingContainer}>
                        <Ionicons
                            name="reload-outline"
                            size={sizes.iconSize}
                            color={colors.primary.main}
                        />
                    </View>
                )}
            </View>

            {/* Bottom Row: Error/Character Count */}
            <View style={styles.bottomRow}>
                {/* Error Message */}
                {error && (
                    <Text style={[styles.errorText, errorStyle]}>
                        {error}
                    </Text>
                )}

                {/* Character Count */}
                {showCharacterCount && maxLength && (
                    <Text style={styles.characterCount}>
                        {value.length}/{maxLength}
                    </Text>
                )}
            </View>
        </View>
    );
});

// Set display name for the main component
CustomInput.displayName = 'CustomInput';

// Preset Input Variants
export const EmailInput = forwardRef<CustomInputRef, Omit<CustomInputProps, 'inputType'>>((props, ref) => (
    <CustomInput ref={ref} inputType="email" {...props} />
));
EmailInput.displayName = 'EmailInput';

export const PasswordInput = forwardRef<CustomInputRef, Omit<CustomInputProps, 'inputType'>>((props, ref) => (
    <CustomInput ref={ref} inputType="password" {...props} />
));
PasswordInput.displayName = 'PasswordInput';

export const PhoneInput = forwardRef<CustomInputRef, Omit<CustomInputProps, 'inputType'>>((props, ref) => (
    <CustomInput ref={ref} inputType="phone" {...props} />
));
PhoneInput.displayName = 'PhoneInput';

export const SearchInput = forwardRef<CustomInputRef, Omit<CustomInputProps, 'inputType'>>((props, ref) => (
    <CustomInput ref={ref} inputType="search" {...props} />
));
SearchInput.displayName = 'SearchInput';

export const NumberInput = forwardRef<CustomInputRef, Omit<CustomInputProps, 'inputType'>>((props, ref) => (
    <CustomInput ref={ref} inputType="number" {...props} />
));
NumberInput.displayName = 'NumberInput';

// Textarea Component
interface TextareaProps extends CustomInputProps {
    numberOfLines?: number;
    minHeight?: number;
    maxHeight?: number;
}

export const Textarea = forwardRef<CustomInputRef, TextareaProps>(({
    numberOfLines = 4,
    minHeight,
    maxHeight,
    containerStyle,
    ...props
}, ref) => {
    const textareaHeight = minHeight || verticalScale(numberOfLines * 24 + 24);

    const textareaContainerStyle: ViewStyle = {
        height: textareaHeight,
        ...(minHeight && { minHeight }),
        ...(maxHeight && { maxHeight }),
        ...containerStyle,
    };

    return (
        <CustomInput
            ref={ref}
            multiline
            numberOfLines={numberOfLines}
            containerStyle={textareaContainerStyle}
            inputStyle={{
                textAlignVertical: 'top',
                paddingTop: spacingY._12,
            }}
            animateLabel={false} // Disable floating label for textarea
            {...props}
        />
    );
});
Textarea.displayName = 'Textarea';

const styles = StyleSheet.create({
    container: {
        marginBottom: spacingY._20,
    },

    // Static Label
    staticLabelContainer: {
        marginBottom: spacingY._7,
    },
    staticLabel: {
        fontSize: scaleFont(14),
        fontWeight: '500',
        color: colors.text.primary,
    },
    required: {
        color: colors.error.main,
        fontSize: scaleFont(14),
    },

    // Input Container
    inputContainer: {
        position: 'relative',
    },

    // Icons
    leftIcon: {
        marginRight: spacingX._10,
    },
    rightIcon: {
        marginLeft: spacingX._10,
        padding: spacingX._5,
    },
    loadingContainer: {
        marginLeft: spacingX._10,
    },

    // Animated Label
    animatedLabel: {
        position: 'absolute',
        fontWeight: '500',
        backgroundColor: 'transparent',
        pointerEvents: 'none', // Prevent label from blocking input interactions
    },

    // Text Input
    textInput: {
        flex: 1,
        margin: 0,
        padding: 0,
        ...(Platform.OS === 'web' && {
            outline: 'none',
        }),
    },

    // Bottom Row
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacingY._5,
        minHeight: verticalScale(20),
    },
    errorText: {
        fontSize: scaleFont(12),
        color: colors.error.main,
        flex: 1,
    },
    characterCount: {
        fontSize: scaleFont(12),
        color: colors.text.secondary,
        marginLeft: spacingX._10,
    },
});