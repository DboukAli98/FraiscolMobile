// components/ui/IconLabelCard.tsx
import { colors, radius, shadows, spacingX, spacingY } from '@/constants/theme';
import { scale, scaleFont } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    GestureResponderEvent,
    Image,
    ImageSourcePropType,
    Pressable,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from 'react-native';

interface IconLabelCardProps {
    // Content props - either icon OR image
    iconName?: keyof typeof Ionicons.glyphMap;
    iconSize?: number;
    iconColor?: string;

    // Image props (alternative to icon)
    imageSource?: ImageSourcePropType;
    imageStyle?: import('react-native').ImageStyle;

    // Label props
    label: string;
    labelStyle?: any;

    // Card styling
    backgroundColor?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    shadow?: 'none' | 'sm' | 'md' | 'lg';

    // Layout
    style?: ViewStyle;

    // Interaction
    onPress?: (event: GestureResponderEvent) => void;
    onLongPress?: (event: GestureResponderEvent) => void;
    disabled?: boolean;

    // Accessibility
    accessibilityLabel?: string;
    accessibilityHint?: string;
}

export const IconLabelCard: React.FC<IconLabelCardProps> = ({
    iconName,
    iconSize,
    iconColor = colors.primary.main,
    imageSource,
    imageStyle,
    label,
    labelStyle,
    backgroundColor = colors.background.paper,
    size = 'md',
    shadow = 'sm',
    style,
    onPress,
    onLongPress,
    disabled = false,
    accessibilityLabel,
    accessibilityHint,
}) => {
    // Get sizes based on size prop
    const getSizes = () => {
        switch (size) {
            case 'sm':
                return {
                    cardSize: scale(80),
                    iconContainerSize: scale(50),
                    iconSize: iconSize || scale(24),
                    fontSize: scaleFont(11),
                    padding: spacingX._10,
                    spacing: spacingY._7,
                };
            case 'md':
                return {
                    cardSize: scale(100),
                    iconContainerSize: scale(60),
                    iconSize: iconSize || scale(28),
                    fontSize: scaleFont(12),
                    padding: spacingX._12,
                    spacing: spacingY._10,
                };
            case 'lg':
                return {
                    cardSize: scale(120),
                    iconContainerSize: scale(70),
                    iconSize: iconSize || scale(32),
                    fontSize: scaleFont(14),
                    padding: spacingX._15,
                    spacing: spacingY._12,
                };
            case 'xl':
                return {
                    cardSize: scale(140),
                    iconContainerSize: scale(80),
                    iconSize: iconSize || scale(36),
                    fontSize: scaleFont(16),
                    padding: spacingX._20,
                    spacing: spacingY._15,
                };
            default:
                return {
                    cardSize: scale(100),
                    iconContainerSize: scale(60),
                    iconSize: iconSize || scale(28),
                    fontSize: scaleFont(12),
                    padding: spacingX._12,
                    spacing: spacingY._10,
                };
        }
    };

    const sizes = getSizes();

    const cardStyle: ViewStyle = {
        width: sizes.cardSize,
        backgroundColor,
        borderRadius: radius._15,
        padding: sizes.padding,
        alignItems: 'center',
        justifyContent: 'center',
        ...(shadow !== 'none' && shadows[shadow]),
        opacity: disabled ? 0.6 : 1,
    };

    const iconContainerStyle: ViewStyle = {
        width: sizes.iconContainerSize,
        height: sizes.iconContainerSize,
        borderRadius: sizes.iconContainerSize / 2,
        backgroundColor: colors.background.default,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: sizes.spacing,
        overflow: 'hidden', // Important for images
    };

    const defaultImageStyle: import('react-native').ImageStyle = {
        width: sizes.iconContainerSize - scale(10),
        height: sizes.iconContainerSize - scale(10),
        // borderRadius: (sizes.iconContainerSize - scale(8)) / 2,
    };

    // Render the content (icon or image)
    const renderContent = () => {
        if (imageSource) {
            return (
                <Image
                    source={imageSource}
                    style={[defaultImageStyle, imageStyle]}
                    resizeMode="cover"
                />
            );
        } else if (iconName) {
            return (
                <Ionicons
                    name={iconName}
                    size={sizes.iconSize}
                    color={iconColor}
                />
            );
        } else {
            // Fallback to a default icon
            return (
                <Ionicons
                    name="help-outline"
                    size={sizes.iconSize}
                    color={colors.text.secondary}
                />
            );
        }
    };

    const cardContent = (
        <>
            <View style={iconContainerStyle}>
                {renderContent()}
            </View>
            <Text
                style={[
                    {
                        fontSize: sizes.fontSize,
                        color: colors.text.primary,
                        textAlign: 'center',
                        fontWeight: '500',
                        lineHeight: sizes.fontSize * 1.2,
                    },
                    labelStyle,
                ]}
                numberOfLines={2}
            >
                {label}
            </Text>
        </>
    );

    if (onPress) {
        return (
            <Pressable
                style={({ pressed }) => [
                    cardStyle,
                    { opacity: pressed ? 0.8 : disabled ? 0.6 : 1 },
                    style,
                ]}
                onPress={onPress}
                onLongPress={onLongPress}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={accessibilityLabel || label}
                accessibilityHint={accessibilityHint}
            >
                {cardContent}
            </Pressable>
        );
    }

    return (
        <View style={[cardStyle, style]}>
            {cardContent}
        </View>
    );
};

// Grid Container for Icon Label Cards
interface IconLabelGridProps {
    children: React.ReactNode;
    columns?: 2 | 3 | 4;
    spacing?: keyof typeof spacingX;
    style?: ViewStyle;
}

export const IconLabelGrid: React.FC<IconLabelGridProps> = ({
    children,
    columns = 4,
    spacing = '_15',
    style,
}) => {
    return (
        <View style={[styles.grid, { gap: spacingX[spacing] }, style]}>
            {children}
        </View>
    );
};

// Enhanced Pre-configured cards that support both icons and images
interface QuickActionCardProps extends Omit<IconLabelCardProps, 'iconName' | 'label' | 'imageSource'> {
    type: 'ecoles' | 'enfants' | 'merchandises' | 'historique' | 'profile' | 'settings' | 'notifications' | 'payments';
    // Override with custom image
    customImage?: ImageSourcePropType;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({ type, customImage, ...props }) => {
    const getCardConfig = () => {
        switch (type) {
            case 'ecoles':
                return {
                    iconName: 'school-outline' as keyof typeof Ionicons.glyphMap,
                    label: 'Écoles',
                    iconColor: colors.primary.main,
                };
            case 'enfants':
                return {
                    iconName: 'people-outline' as keyof typeof Ionicons.glyphMap,
                    label: 'Enfants',
                    iconColor: colors.secondary.main,
                };
            case 'merchandises':
                return {
                    iconName: 'bag-outline' as keyof typeof Ionicons.glyphMap,
                    label: 'Merchandises',
                    iconColor: colors.info.main,
                };
            case 'historique':
                return {
                    iconName: 'document-text-outline' as keyof typeof Ionicons.glyphMap,
                    label: 'Historique\ndes paiements',
                    iconColor: colors.warning.main,
                };
            case 'profile':
                return {
                    iconName: 'person-outline' as keyof typeof Ionicons.glyphMap,
                    label: 'Profile',
                    iconColor: colors.primary.main,
                };
            case 'settings':
                return {
                    iconName: 'settings-outline' as keyof typeof Ionicons.glyphMap,
                    label: 'Settings',
                    iconColor: colors.text.secondary,
                };
            case 'notifications':
                return {
                    iconName: 'notifications-outline' as keyof typeof Ionicons.glyphMap,
                    label: 'Notifications',
                    iconColor: colors.error.main,
                };
            case 'payments':
                return {
                    iconName: 'card-outline' as keyof typeof Ionicons.glyphMap,
                    label: 'Payments',
                    iconColor: colors.success.main,
                };
            default:
                return {
                    iconName: 'help-outline' as keyof typeof Ionicons.glyphMap,
                    label: 'Unknown',
                    iconColor: colors.text.secondary,
                };
        }
    };

    const config = getCardConfig();

    return (
        <IconLabelCard
            iconName={customImage ? undefined : config.iconName}
            imageSource={customImage}
            label={config.label}
            iconColor={config.iconColor}
            {...props}
        />
    );
};

// Helper component for easy image cards
interface ImageCardProps extends Omit<IconLabelCardProps, 'iconName' | 'imageSource'> {
    imageSource: ImageSourcePropType;
}

export const ImageLabelCard: React.FC<ImageCardProps> = ({ imageSource, ...props }) => {
    return (
        <IconLabelCard
            imageSource={imageSource}
            {...props}
        />
    );
};

const styles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
});