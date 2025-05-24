// components/ui/Card.tsx
import { colors, radius, shadows, spacingX, spacingY } from '@/constants/theme';
import { scale, verticalScale } from '@/utils/stylings';
import React from 'react';
import {
    GestureResponderEvent,
    Pressable,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';

// Base Card Props
interface BaseCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    contentStyle?: ViewStyle;
    shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: keyof typeof radius;
    padding?: keyof typeof spacingX;
    margin?: keyof typeof spacingY;
    onPress?: (event: GestureResponderEvent) => void;
    onLongPress?: (event: GestureResponderEvent) => void;
    disabled?: boolean;
    accessibilityLabel?: string;
}

export const Card: React.FC<BaseCardProps> = ({
    children,
    style,
    contentStyle,
    shadow = 'md',
    backgroundColor = colors.background.default,
    borderColor,
    borderWidth = 0,
    borderRadius = '_12',
    padding = '_15',
    margin = '_10',
    onPress,
    onLongPress,
    disabled = false,
    accessibilityLabel,
}) => {
    const cardStyle: ViewStyle = {
        backgroundColor,
        borderRadius: radius[borderRadius],
        padding: spacingX[padding],
        marginBottom: spacingY[margin],
        ...(shadow !== 'none' && shadows[shadow]),
        ...(borderColor && { borderColor, borderWidth }),
        opacity: disabled ? 0.6 : 1,
    };

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
                accessibilityLabel={accessibilityLabel}
            >
                <View style={contentStyle}>
                    {children}
                </View>
            </Pressable>
        );
    }

    return (
        <View style={[cardStyle, style]}>
            <View style={contentStyle}>
                {children}
            </View>
        </View>
    );
};

// Card Header Component
interface CardHeaderProps {
    title: string;
    subtitle?: string;
    titleStyle?: TextStyle;
    subtitleStyle?: TextStyle;
    rightElement?: React.ReactNode;
    style?: ViewStyle;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
    title,
    subtitle,
    titleStyle,
    subtitleStyle,
    rightElement,
    style,
}) => (
    <View style={[styles.header, style]}>
        <View style={styles.headerContent}>
            <Text style={[styles.title, titleStyle]}>{title}</Text>
            {subtitle && (
                <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
            )}
        </View>
        {rightElement && <View style={styles.headerRight}>{rightElement}</View>}
    </View>
);

// Card Body Component
interface CardBodyProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export const CardBody: React.FC<CardBodyProps> = ({ children, style }) => (
    <View style={[styles.body, style]}>
        {children}
    </View>
);

// Card Footer Component
interface CardFooterProps {
    children: React.ReactNode;
    style?: ViewStyle;
    align?: 'left' | 'center' | 'right' | 'space-between';
}

export const CardFooter: React.FC<CardFooterProps> = ({
    children,
    style,
    align = 'left'
}) => {
    const getAlignmentStyle = (): ViewStyle => {
        switch (align) {
            case 'center':
                return { alignItems: 'center', justifyContent: 'center' };
            case 'right':
                return { alignItems: 'flex-end', justifyContent: 'flex-end' };
            case 'space-between':
                return { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' };
            default:
                return { alignItems: 'flex-start', justifyContent: 'flex-start' };
        }
    };

    return (
        <View style={[styles.footer, getAlignmentStyle(), style]}>
            {children}
        </View>
    );
};

// Specialized Card Variants
interface InfoCardProps extends Omit<BaseCardProps, 'children'> {
    title: string;
    subtitle?: string;
    description?: string;
    icon?: React.ReactNode;
    rightElement?: React.ReactNode;
}

export const InfoCard: React.FC<InfoCardProps> = ({
    title,
    subtitle,
    description,
    icon,
    rightElement,
    ...cardProps
}) => (
    <Card {...cardProps}>
        <CardHeader
            title={title}
            subtitle={subtitle}
            rightElement={rightElement}
        />
        {description && (
            <CardBody>
                <Text style={styles.description}>{description}</Text>
            </CardBody>
        )}
    </Card>
);

// Stats Card Component
interface StatsCardProps extends Omit<BaseCardProps, 'children'> {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
    color?: keyof typeof colors;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    subtitle,
    icon,
    color = 'primary',
    trend,
    trendValue,
    ...cardProps
}) => {
    const getTrendColor = () => {
        switch (trend) {
            case 'up':
                return colors.success.main;
            case 'down':
                return colors.error.main;
            default:
                return colors.text.secondary;
        }
    };

    return (
        <Card {...cardProps}>
            <View style={styles.statsContent}>
                {icon && <View style={styles.statsIcon}>{icon}</View>}
                <View style={styles.statsText}>
                    <Text style={styles.statsTitle}>{title}</Text>
                    <Text
                        style={[
                            styles.statsValue,
                            {
                                color:
                                    typeof colors[color] === 'object' && 'main' in colors[color]
                                        ? (colors[color] as { main: string }).main
                                        : colors.text.primary,
                            },
                        ]}
                    >
                        {value}
                    </Text>
                    {subtitle && (
                        <Text style={styles.statsSubtitle}>{subtitle}</Text>
                    )}
                    {trend && trendValue && (
                        <Text style={[styles.trendText, { color: getTrendColor() }]}>
                            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
                        </Text>
                    )}
                </View>
            </View>
        </Card>
    );
};

// Image Card Component
interface ImageCardProps extends Omit<BaseCardProps, 'children'> {
    title: string;
    subtitle?: string;
    imageSource: { uri: string } | number;
    imageStyle?: ViewStyle;
    overlay?: boolean;
}

export const ImageCard: React.FC<ImageCardProps> = ({
    title,
    subtitle,
    imageSource,
    imageStyle,
    overlay = false,
    ...cardProps
}) => (
    <Card padding="_3" {...cardProps}>
        <View style={styles.imageContainer}>
            {/* You would use Image component here */}
            <View style={[styles.imagePlaceholder, imageStyle]} />
            {overlay && (
                <View style={styles.imageOverlay}>
                    <Text style={styles.overlayTitle}>{title}</Text>
                    {subtitle && (
                        <Text style={styles.overlaySubtitle}>{subtitle}</Text>
                    )}
                </View>
            )}
        </View>
        {!overlay && (
            <View style={styles.imageCardContent}>
                <Text style={styles.imageCardTitle}>{title}</Text>
                {subtitle && (
                    <Text style={styles.imageCardSubtitle}>{subtitle}</Text>
                )}
            </View>
        )}
    </Card>
);

// List Card Component
interface ListCardProps extends Omit<BaseCardProps, 'children'> {
    items: {
        title: string;
        subtitle?: string;
        value?: string;
        icon?: React.ReactNode;
    }[];
    title?: string;
}

export const ListCard: React.FC<ListCardProps> = ({
    items,
    title,
    ...cardProps
}) => (
    <Card {...cardProps}>
        {title && (
            <CardHeader title={title} />
        )}
        <CardBody style={styles.listBody}>
            {items.map((item, index) => (
                <View
                    key={index}
                    style={[
                        styles.listItem,
                        index !== items.length - 1 && styles.listItemBorder
                    ]}
                >
                    {item.icon && (
                        <View style={styles.listItemIcon}>{item.icon}</View>
                    )}
                    <View style={styles.listItemContent}>
                        <Text style={styles.listItemTitle}>{item.title}</Text>
                        {item.subtitle && (
                            <Text style={styles.listItemSubtitle}>{item.subtitle}</Text>
                        )}
                    </View>
                    {item.value && (
                        <Text style={styles.listItemValue}>{item.value}</Text>
                    )}
                </View>
            ))}
        </CardBody>
    </Card>
);

// Action Card Component
interface ActionCardProps extends Omit<BaseCardProps, 'children'> {
    title: string;
    description?: string;
    primaryAction?: {
        label: string;
        onPress: () => void;
    };
    secondaryAction?: {
        label: string;
        onPress: () => void;
    };
    icon?: React.ReactNode;
}

export const ActionCard: React.FC<ActionCardProps> = ({
    title,
    description,
    primaryAction,
    secondaryAction,
    icon,
    ...cardProps
}) => (
    <Card {...cardProps}>
        <View style={styles.actionCardContent}>
            {icon && <View style={styles.actionCardIcon}>{icon}</View>}
            <View style={styles.actionCardText}>
                <Text style={styles.actionCardTitle}>{title}</Text>
                {description && (
                    <Text style={styles.actionCardDescription}>{description}</Text>
                )}
            </View>
        </View>
        {(primaryAction || secondaryAction) && (
            <CardFooter align="space-between" style={styles.actionCardFooter}>
                <View style={styles.actionButtons}>
                    {secondaryAction && (
                        <Pressable
                            style={styles.secondaryButton}
                            onPress={secondaryAction.onPress}
                        >
                            <Text style={styles.secondaryButtonText}>
                                {secondaryAction.label}
                            </Text>
                        </Pressable>
                    )}
                    {primaryAction && (
                        <Pressable
                            style={[
                                styles.primaryButton,
                                secondaryAction && { marginLeft: spacingX._10 }
                            ]}
                            onPress={primaryAction.onPress}
                        >
                            <Text style={styles.primaryButtonText}>
                                {primaryAction.label}
                            </Text>
                        </Pressable>
                    )}
                </View>
            </CardFooter>
        )}
    </Card>
);

const styles = StyleSheet.create({
    // Header styles
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacingY._10,
    },
    headerContent: {
        flex: 1,
    },
    headerRight: {
        marginLeft: spacingX._10,
    },
    title: {
        fontSize: scale(18),
        fontWeight: '600',
        color: colors.text.primary,
        lineHeight: verticalScale(24),
    },
    subtitle: {
        fontSize: scale(14),
        color: colors.text.secondary,
        marginTop: spacingY._3,
        lineHeight: verticalScale(18),
    },

    // Body styles
    body: {
        marginVertical: spacingY._5,
    },
    description: {
        fontSize: scale(14),
        color: colors.text.primary,
        lineHeight: verticalScale(20),
    },

    // Footer styles
    footer: {
        marginTop: spacingY._15,
        paddingTop: spacingY._10,
        borderTopWidth: 1,
        borderTopColor: colors.border?.light || '#e1e5e9',
    },

    // Stats Card styles
    statsContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statsIcon: {
        marginRight: spacingX._15,
    },
    statsText: {
        flex: 1,
    },
    statsTitle: {
        fontSize: scale(14),
        color: colors.text.secondary,
        marginBottom: spacingY._3,
    },
    statsValue: {
        fontSize: scale(24),
        fontWeight: 'bold',
        marginBottom: spacingY._3,
    },
    statsSubtitle: {
        fontSize: scale(12),
        color: colors.text.secondary,
    },
    trendText: {
        fontSize: scale(12),
        fontWeight: '500',
        marginTop: spacingY._3,
    },

    // Image Card styles
    imageContainer: {
        position: 'relative',
        borderTopLeftRadius: radius._12,
        borderTopRightRadius: radius._12,
        overflow: 'hidden',
    },
    imagePlaceholder: {
        height: verticalScale(160),
        backgroundColor: colors.background.paper,
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: spacingX._15,
    },
    overlayTitle: {
        fontSize: scale(16),
        fontWeight: '600',
        color: colors.text.white,
    },
    overlaySubtitle: {
        fontSize: scale(14),
        color: colors.text.white,
        opacity: 0.8,
        marginTop: spacingY._3,
    },
    imageCardContent: {
        padding: spacingX._15,
    },
    imageCardTitle: {
        fontSize: scale(16),
        fontWeight: '600',
        color: colors.text.primary,
    },
    imageCardSubtitle: {
        fontSize: scale(14),
        color: colors.text.secondary,
        marginTop: spacingY._3,
    },

    // List Card styles
    listBody: {
        marginVertical: 0,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacingY._10,
    },
    listItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border?.light || '#e1e5e9',
    },
    listItemIcon: {
        marginRight: spacingX._12,
    },
    listItemContent: {
        flex: 1,
    },
    listItemTitle: {
        fontSize: scale(14),
        fontWeight: '500',
        color: colors.text.primary,
    },
    listItemSubtitle: {
        fontSize: scale(12),
        color: colors.text.secondary,
        marginTop: spacingY._3,
    },
    listItemValue: {
        fontSize: scale(14),
        fontWeight: '500',
        color: colors.primary.main,
    },

    // Action Card styles
    actionCardContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    actionCardIcon: {
        marginRight: spacingX._15,
    },
    actionCardText: {
        flex: 1,
    },
    actionCardTitle: {
        fontSize: scale(16),
        fontWeight: '600',
        color: colors.text.primary,
    },
    actionCardDescription: {
        fontSize: scale(14),
        color: colors.text.secondary,
        marginTop: spacingY._5,
        lineHeight: verticalScale(20),
    },
    actionCardFooter: {
        borderTopWidth: 0,
        paddingTop: spacingY._15,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        flex: 1,
    },
    primaryButton: {
        backgroundColor: colors.primary.main,
        paddingHorizontal: spacingX._20,
        paddingVertical: spacingY._10,
        borderRadius: radius._10,
    },
    primaryButtonText: {
        color: colors.text.white,
        fontSize: scale(14),
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        paddingHorizontal: spacingX._20,
        paddingVertical: spacingY._10,
        borderRadius: radius._10,
        borderWidth: 1,
        borderColor: colors.primary.main,
    },
    secondaryButtonText: {
        color: colors.primary.main,
        fontSize: scale(14),
        fontWeight: '600',
    },
});