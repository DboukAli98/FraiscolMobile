// components/Button/CustomPressable.tsx
import { colors, radius, shadows, spacingX, spacingY } from '@/constants/theme';
import { scale, scaleFont, verticalScale } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    Platform,
    Pressable,
    PressableProps,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';

// Button Props Interface
interface CustomButtonProps extends Omit<PressableProps, 'style'> {
    // Content
    title?: string;
    children?: React.ReactNode;

    // Variants
    variant?: 'filled' | 'outlined' | 'ghost' | 'gradient' | 'rounded';
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

    // Left/Right content
    leftIcon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    leftContent?: React.ReactNode;
    rightContent?: React.ReactNode;

    // States
    loading?: boolean;
    disabled?: boolean;

    // Styling
    fullWidth?: boolean;
    shadow?: boolean;
    borderRadius?: keyof typeof radius;

    // Custom styles
    style?: ViewStyle;
    textStyle?: TextStyle;
    pressedStyle?: ViewStyle;
    disabledStyle?: ViewStyle;

    // Behavior
    hapticFeedback?: boolean;
    scaleOnPress?: boolean;

    // Accessibility
    accessibilityLabel?: string;
    accessibilityHint?: string;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
    title,
    children,
    variant = 'filled',
    color = 'primary',
    size = 'md',
    leftIcon,
    rightIcon,
    leftContent,
    rightContent,
    loading = false,
    disabled = false,
    fullWidth = false,
    shadow = false,
    borderRadius = '_12',
    style,
    textStyle,
    pressedStyle,
    disabledStyle,
    hapticFeedback = true,
    scaleOnPress = true,
    accessibilityLabel,
    accessibilityHint,
    onPress,
    ...pressableProps
}) => {
    // Get color scheme based on color prop
    const getColorScheme = () => {
        switch (color) {
            case 'primary':
                return {
                    main: colors.primary.main,
                    light: colors.primary.light,
                    dark: colors.primary.dark,
                };
            case 'secondary':
                return {
                    main: colors.secondary.main,
                    light: colors.secondary.light,
                    dark: colors.secondary.dark,
                };
            case 'success':
                return {
                    main: colors.success.main,
                    light: colors.success.light,
                    dark: colors.success.dark,
                };
            case 'error':
                return {
                    main: colors.error.main,
                    light: colors.error.light,
                    dark: colors.error.dark,
                };
            case 'warning':
                return {
                    main: colors.warning.main,
                    light: colors.warning.light,
                    dark: colors.warning.dark,
                };
            case 'info':
                return {
                    main: colors.info.main,
                    light: colors.info.light,
                    dark: colors.info.dark,
                };
            default:
                return {
                    main: colors.primary.main,
                    light: colors.primary.light,
                    dark: colors.primary.dark,
                };
        }
    };

    const colorScheme = getColorScheme();

    // Get sizes based on size prop
    const getSizes = () => {
        switch (size) {
            case 'xs':
                return {
                    height: verticalScale(32),
                    paddingHorizontal: spacingX._12,
                    paddingVertical: spacingY._7,
                    fontSize: scaleFont(12),
                    iconSize: scale(14),
                    borderRadius: radius._10,
                };
            case 'sm':
                return {
                    height: verticalScale(36),
                    paddingHorizontal: spacingX._15,
                    paddingVertical: spacingY._10,
                    fontSize: scaleFont(14),
                    iconSize: scale(16),
                    borderRadius: radius._10,
                };
            case 'md':
                return {
                    height: verticalScale(44),
                    paddingHorizontal: spacingX._20,
                    paddingVertical: spacingY._12,
                    fontSize: scaleFont(16),
                    iconSize: scale(18),
                    borderRadius: radius._12,
                };
            case 'lg':
                return {
                    height: verticalScale(52),
                    paddingHorizontal: spacingX._25,
                    paddingVertical: spacingY._15,
                    fontSize: scaleFont(18),
                    iconSize: scale(20),
                    borderRadius: radius._15,
                };
            case 'xl':
                return {
                    height: verticalScale(60),
                    paddingHorizontal: spacingX._30,
                    paddingVertical: spacingY._20,
                    fontSize: scaleFont(20),
                    iconSize: scale(24),
                    borderRadius: radius._20,
                };
            default:
                return {
                    height: verticalScale(44),
                    paddingHorizontal: spacingX._20,
                    paddingVertical: spacingY._12,
                    fontSize: scaleFont(16),
                    iconSize: scale(18),
                    borderRadius: radius._12,
                };
        }
    };

    const sizes = getSizes();

    // Get button style based on variant and state
    const getButtonStyle = (pressed: boolean): ViewStyle => {
        const baseStyle: ViewStyle = {
            height: sizes.height,
            paddingHorizontal: sizes.paddingHorizontal,
            paddingVertical: sizes.paddingVertical,
            borderRadius: radius[borderRadius] || sizes.borderRadius,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            ...(fullWidth && { width: '100%' }),
            ...(shadow && shadows.md),
        };

        // Apply scale effect
        if (scaleOnPress && pressed) {
            baseStyle.transform = [{ scale: 0.96 }];
        }

        // Handle disabled state
        if (disabled) {
            baseStyle.opacity = 0.6;
        }

        switch (variant) {
            case 'filled':
                return {
                    ...baseStyle,
                    backgroundColor: pressed ? colorScheme.dark : colorScheme.main,
                };
            case 'outlined':
                return {
                    ...baseStyle,
                    backgroundColor: pressed ? `${colorScheme.main}15` : 'transparent',
                    borderWidth: 2,
                    borderColor: pressed ? colorScheme.dark : colorScheme.main,
                };
            case 'ghost':
                return {
                    ...baseStyle,
                    backgroundColor: pressed ? `${colorScheme.main}20` : 'transparent',
                };
            case 'gradient':
                return {
                    ...baseStyle,
                    backgroundColor: pressed ? colorScheme.dark : colorScheme.main,
                    // Note: For real gradients, you'd use a gradient library like react-native-linear-gradient
                };
            case 'rounded':
                return {
                    ...baseStyle,
                    borderRadius: sizes.height / 2,
                    backgroundColor: pressed ? colorScheme.dark : colorScheme.main,
                    ...shadows.lg,
                };
            default:
                return baseStyle;
        }
    };

    // Get text color based on variant
    const getTextColor = () => {
        switch (variant) {
            case 'filled':
            case 'gradient':
            case 'rounded':
                return colors.text.white;
            case 'outlined':
            case 'ghost':
                return colorScheme.main;
            default:
                return colors.text.white;
        }
    };

    // Handle press with haptic feedback
    const handlePress = async (event: any) => {
        if (disabled || loading) return;

        // Add haptic feedback if enabled
        if (hapticFeedback && Platform.OS !== 'web') {
            try {
                const { impactAsync, ImpactFeedbackStyle } = await import('expo-haptics');
                impactAsync(ImpactFeedbackStyle.Light);
            } catch {
                // Haptics not available, continue without it
            }
        }

        onPress?.(event);
    };

    // Render loading indicator
    const renderLoadingIndicator = () => (
        <ActivityIndicator
            size="small"
            color={getTextColor()}
            style={styles.loadingIndicator}
        />
    );

    // Render left content
    const renderLeftContent = () => {
        if (loading) return renderLoadingIndicator();
        if (leftContent) return leftContent;
        if (leftIcon) {
            return (
                <Ionicons
                    name={leftIcon}
                    size={sizes.iconSize}
                    color={getTextColor()}
                    style={styles.leftIcon}
                />
            );
        }
        return null;
    };

    // Render right content
    const renderRightContent = () => {
        if (rightContent) return rightContent;
        if (rightIcon) {
            return (
                <Ionicons
                    name={rightIcon}
                    size={sizes.iconSize}
                    color={getTextColor()}
                    style={styles.rightIcon}
                />
            );
        }
        return null;
    };

    return (
        <Pressable
            style={({ pressed }) => [
                getButtonStyle(pressed),
                style,
                pressed && pressedStyle,
                disabled && disabledStyle,
            ]}
            onPress={handlePress}
            disabled={disabled || loading}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel || title}
            accessibilityHint={accessibilityHint}
            accessibilityState={{ disabled: disabled || loading }}
            {...pressableProps}
        >
            {renderLeftContent()}

            {/* Button Text/Content */}
            <View style={styles.contentContainer}>
                {children || (
                    <Text
                        style={[
                            styles.buttonText,
                            {
                                textAlign: "center",
                                fontSize: sizes.fontSize,
                                color: getTextColor(),
                            },
                            textStyle,
                        ]}
                        numberOfLines={1}
                    >
                        {title}
                    </Text>
                )}
            </View>

            {renderRightContent()}
        </Pressable>
    );
};

// Preset Button Components
type PresetButtonProps = Omit<CustomButtonProps, 'variant' | 'color'>;

export const PrimaryButton: React.FC<PresetButtonProps> = (props) => (
    <CustomButton variant="filled" color="primary" {...props} />
);

export const SecondaryButton: React.FC<PresetButtonProps> = (props) => (
    <CustomButton variant="outlined" color="primary" {...props} />
);

export const DangerButton: React.FC<PresetButtonProps> = (props) => (
    <CustomButton variant="filled" color="error" {...props} />
);

export const SuccessButton: React.FC<PresetButtonProps> = (props) => (
    <CustomButton variant="filled" color="success" {...props} />
);

export const GhostButton: React.FC<PresetButtonProps> = (props) => (
    <CustomButton variant="ghost" color="primary" {...props} />
);

export const RoundedButton: React.FC<PresetButtonProps> = (props) => (
    <CustomButton variant="rounded" color="primary" {...props} />
);

// Floating Action Button
interface FABProps extends Omit<CustomButtonProps, 'variant' | 'size' | 'title'> {
    icon: keyof typeof Ionicons.glyphMap;
    position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}

export const FloatingActionButton: React.FC<FABProps> = ({
    icon,
    position = 'bottom-right',
    style,
    ...props
}) => {
    const getPositionStyle = (): ViewStyle => {
        const base = {
            position: 'absolute' as const,
            bottom: spacingY._20,
        };

        switch (position) {
            case 'bottom-right':
                return { ...base, right: spacingX._20 };
            case 'bottom-left':
                return { ...base, left: spacingX._20 };
            case 'bottom-center':
                return { ...base, alignSelf: 'center' as const };
            default:
                return { ...base, right: spacingX._20 };
        }
    };

    const fabStyle: ViewStyle = {
        ...getPositionStyle(),
        ...style,
    };

    return (
        <CustomButton
            variant="rounded"
            size="lg"
            leftIcon={icon}
            style={fabStyle}
            shadow
            {...props}
        />
    );
};

// Icon Button (square with icon only)
interface IconButtonProps extends Omit<CustomButtonProps, 'title' | 'leftIcon' | 'rightIcon'> {
    icon: keyof typeof Ionicons.glyphMap;
}

export const IconButton: React.FC<IconButtonProps> = ({ icon, style, ...props }) => {
    const iconButtonStyle: ViewStyle = {
        aspectRatio: 1,
        paddingHorizontal: 0,
        ...style,
    };

    return (
        <CustomButton
            leftIcon={icon}
            style={iconButtonStyle}
            {...props}
        />
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontWeight: '500',
        textAlign: 'center',
        textAlignVertical: 'center', // Add this for Android
        includeFontPadding: false,   // Add this for Android
        lineHeight: undefined,
    },
    loadingIndicator: {
        marginRight: spacingX._10,
    },
    leftIcon: {
        marginRight: spacingX._10,
    },
    rightIcon: {
        marginLeft: spacingX._10,
    },
});

// Set display names
CustomButton.displayName = 'CustomButton';
PrimaryButton.displayName = 'PrimaryButton';
SecondaryButton.displayName = 'SecondaryButton';
DangerButton.displayName = 'DangerButton';
SuccessButton.displayName = 'SuccessButton';
GhostButton.displayName = 'GhostButton';
RoundedButton.displayName = 'RoundedButton';
FloatingActionButton.displayName = 'FloatingActionButton';
IconButton.displayName = 'IconButton';