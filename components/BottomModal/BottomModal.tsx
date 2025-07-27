// components/BottomModal/BottomModal.tsx
import { colors, radius, shadows, spacingX, spacingY } from '@/constants/theme';
import { scale, scaleFont, verticalScale } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    PanResponder,
    Platform,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    ViewStyle
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomModalProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;

    // Modal styling
    title?: string;
    subtitle?: string;
    height?: number | 'auto' | 'full';
    backgroundColor?: string;

    // Header options
    showHeader?: boolean;
    showCloseButton?: boolean;
    showDragHandle?: boolean;
    headerStyle?: ViewStyle;
    titleStyle?: TextStyle;

    // Behavior options
    closeOnBackdropPress?: boolean;
    enableSwipeDown?: boolean;
    enableDragToExpand?: boolean;
    animationDuration?: number;

    // Callbacks
    onExpand?: () => void;
    onCollapse?: () => void;

    // Accessibility
    accessibilityLabel?: string;

    // Style overrides
    modalStyle?: ViewStyle;
    contentStyle?: ViewStyle;
}

export const BottomModal: React.FC<BottomModalProps> = ({
    visible,
    onClose,
    children,
    title,
    subtitle,
    height = 'auto',
    backgroundColor = colors.background.default,
    showHeader = true,
    showCloseButton = true,
    showDragHandle = true,
    headerStyle,
    titleStyle,
    closeOnBackdropPress = true,
    enableSwipeDown = true,
    enableDragToExpand = true,
    animationDuration = 300,
    onExpand,
    onCollapse,
    accessibilityLabel,
    modalStyle,
    contentStyle,
}) => {
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropAnim = useRef(new Animated.Value(0)).current;
    const panY = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();

    // Track if modal is expanded
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Calculate modal heights with safe area consideration
    const getInitialHeight = () => {
        if (height === 'full') return SCREEN_HEIGHT - insets.top;
        if (height === 'auto') return SCREEN_HEIGHT * 0.6;
        if (typeof height === 'number') return height;
        return SCREEN_HEIGHT * 0.6;
    };

    const initialHeight = getInitialHeight();
    const expandedHeight = SCREEN_HEIGHT - insets.top - (Platform.OS === 'ios' ? 50 : 80);

    // Current modal height based on expanded state
    const currentHeight = isExpanded ? expandedHeight : initialHeight;

    // Pan responder for swipe gestures
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => enableSwipeDown || enableDragToExpand,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                const shouldRespond = (enableSwipeDown || enableDragToExpand) && Math.abs(gestureState.dy) > 5;
                if (shouldRespond) {
                    setIsDragging(true);
                }
                return shouldRespond;
            },
            onPanResponderMove: (_, gestureState) => {
                // Allow dragging up (negative dy) to expand, and down (positive dy) to close/collapse
                const newValue = Math.max(-expandedHeight + initialHeight, gestureState.dy);
                panY.setValue(newValue);
            },
            onPanResponderRelease: (_, gestureState) => {
                setIsDragging(false);

                const velocity = gestureState.vy;
                const displacement = gestureState.dy;

                // Determine action based on gesture
                if (displacement > 100 || velocity > 0.5) {
                    // Dragged down significantly or fast - close or collapse
                    if (isExpanded) {
                        collapseModal();
                    } else {
                        closeModal();
                    }
                } else if (displacement < -100 || velocity < -0.5) {
                    // Dragged up significantly or fast - expand
                    if (enableDragToExpand && !isExpanded) {
                        expandModal();
                    } else {
                        // Already expanded, snap back
                        snapToPosition();
                    }
                } else {
                    // Small movement, snap back to current position
                    snapToPosition();
                }
            },
        })
    ).current;

    const snapToPosition = () => {
        Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: false,
            tension: 100,
            friction: 8,
        }).start();
    };

    const openModal = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT - currentHeight,
                duration: animationDuration,
                useNativeDriver: false,
            }),
            Animated.timing(backdropAnim, {
                toValue: 1,
                duration: animationDuration,
                useNativeDriver: false,
            }),
        ]).start();
    };

    const closeModal = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: animationDuration,
                useNativeDriver: false,
            }),
            Animated.timing(backdropAnim, {
                toValue: 0,
                duration: animationDuration,
                useNativeDriver: false,
            }),
            Animated.timing(panY, {
                toValue: 0,
                duration: animationDuration,
                useNativeDriver: false,
            }),
        ]).start(() => {
            setIsExpanded(false);
            onClose();
        });
    };

    const expandModal = () => {
        setIsExpanded(true);
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT - expandedHeight,
                duration: animationDuration,
                useNativeDriver: false,
            }),
            Animated.spring(panY, {
                toValue: 0,
                useNativeDriver: false,
                tension: 100,
                friction: 8,
            }),
        ]).start(() => {
            onExpand?.();
        });
    };

    const collapseModal = () => {
        setIsExpanded(false);
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT - initialHeight,
                duration: animationDuration,
                useNativeDriver: false,
            }),
            Animated.spring(panY, {
                toValue: 0,
                useNativeDriver: false,
                tension: 100,
                friction: 8,
            }),
        ]).start(() => {
            onCollapse?.();
        });
    };

    useEffect(() => {
        if (visible) {
            slideAnim.setValue(SCREEN_HEIGHT);
            backdropAnim.setValue(0);
            panY.setValue(0);
            setIsExpanded(false);
            openModal();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            statusBarTranslucent={Platform.OS === 'android'}
            accessibilityLabel={accessibilityLabel}
        >
            <View style={styles.container}>
                {/* Backdrop */}
                <TouchableWithoutFeedback
                    onPress={closeOnBackdropPress ? closeModal : undefined}
                >
                    <Animated.View
                        style={[
                            styles.backdrop,
                            {
                                opacity: backdropAnim,
                            },
                        ]}
                    />
                </TouchableWithoutFeedback>

                {/* Modal Content */}
                <Animated.View
                    style={[
                        styles.modal,
                        {
                            backgroundColor,
                            height: currentHeight,
                            // Add bottom padding for Android navigation bar
                            paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 16) : insets.bottom,
                            transform: [
                                { translateY: slideAnim },
                                { translateY: panY },
                            ],
                        },
                        modalStyle,
                    ]}
                    {...panResponder.panHandlers}
                >
                    {/* Drag Handle */}
                    {showDragHandle && (
                        <View style={styles.dragHandleContainer}>
                            <View style={[
                                styles.dragHandle,
                                isDragging && styles.dragHandleActive,
                                isExpanded && styles.dragHandleExpanded,
                            ]} />
                            {enableDragToExpand && (
                                <Text style={styles.dragHint}>
                                    {isExpanded ? 'Glissez vers le bas pour réduire' : 'Glissez vers le haut pour agrandir'}
                                </Text>
                            )}
                        </View>
                    )}

                    {/* Header */}
                    {showHeader && (title || subtitle || showCloseButton) && (
                        <View style={[styles.header, headerStyle]}>
                            <View style={styles.headerContent}>
                                {title && (
                                    <Text style={[styles.title, titleStyle]}>{title}</Text>
                                )}
                                {subtitle && (
                                    <Text style={styles.subtitle}>{subtitle}</Text>
                                )}
                            </View>

                            <View style={styles.headerActions}>
                                {enableDragToExpand && (
                                    <TouchableOpacity
                                        style={styles.expandButton}
                                        onPress={isExpanded ? collapseModal : expandModal}
                                        accessibilityLabel={isExpanded ? "Réduire le modal" : "Agrandir le modal"}
                                    >
                                        <Ionicons
                                            name={isExpanded ? "chevron-down" : "chevron-up"}
                                            size={scale(20)}
                                            color={colors.text.secondary}
                                        />
                                    </TouchableOpacity>
                                )}

                                {showCloseButton && (
                                    <TouchableOpacity
                                        style={styles.closeButton}
                                        onPress={closeModal}
                                        accessibilityLabel="Fermer le modal"
                                        accessibilityRole="button"
                                    >
                                        <Ionicons
                                            name="close"
                                            size={scale(24)}
                                            color={colors.text.secondary}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    )}

                    {/* Content */}
                    <View style={[styles.content, contentStyle]}>
                        {children}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

// Enhanced preset modal variants
interface QuickModalProps extends Omit<BottomModalProps, 'height'> {
    variant?: 'small' | 'medium' | 'large' | 'expandable';
}

export const QuickBottomModal: React.FC<QuickModalProps> = ({
    variant = 'medium',
    ...props
}) => {
    const getHeight = () => {
        switch (variant) {
            case 'small':
                return SCREEN_HEIGHT * 0.3;
            case 'medium':
                return SCREEN_HEIGHT * 0.5;
            case 'large':
                return SCREEN_HEIGHT * 0.8;
            case 'expandable':
                return SCREEN_HEIGHT * 0.4;
            default:
                return SCREEN_HEIGHT * 0.5;
        }
    };

    const enableExpansion = variant === 'expandable';

    return (
        <BottomModal
            height={getHeight()}
            enableDragToExpand={enableExpansion}
            {...props}
        />
    );
};

// Action Sheet Modal
interface ActionSheetItem {
    id: string;
    title: string;
    icon?: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    destructive?: boolean;
    disabled?: boolean;
}

interface ActionSheetModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    items: ActionSheetItem[];
    showCancel?: boolean;
    cancelText?: string;
}

export const ActionSheetModal: React.FC<ActionSheetModalProps> = ({
    visible,
    onClose,
    title,
    subtitle,
    items,
    showCancel = true,
    cancelText = 'Annuler',
}) => {
    const handleItemPress = (item: ActionSheetItem) => {
        if (!item.disabled) {
            item.onPress();
            onClose();
        }
    };

    return (
        <BottomModal
            visible={visible}
            onClose={onClose}
            title={title}
            subtitle={subtitle}
            height="auto"
            showCloseButton={false}
            enableDragToExpand={false}
        >
            <View style={styles.actionSheet}>
                {items.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[
                            styles.actionItem,
                            item.disabled && styles.actionItemDisabled,
                        ]}
                        onPress={() => handleItemPress(item)}
                        disabled={item.disabled}
                    >
                        {item.icon && (
                            <Ionicons
                                name={item.icon}
                                size={scale(20)}
                                color={
                                    item.destructive
                                        ? colors.error.main
                                        : item.disabled
                                            ? colors.text.disabled
                                            : colors.text.primary
                                }
                                style={styles.actionIcon}
                            />
                        )}
                        <Text
                            style={[
                                styles.actionText,
                                item.destructive && styles.actionTextDestructive,
                                item.disabled && styles.actionTextDisabled,
                            ]}
                        >
                            {item.title}
                        </Text>
                    </TouchableOpacity>
                ))}

                {showCancel && (
                    <>
                        <View style={styles.separator} />
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelText}>{cancelText}</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </BottomModal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modal: {
        position: 'absolute',
        left: 0,
        right: 0,
        borderTopLeftRadius: radius._20,
        borderTopRightRadius: radius._20,
        ...shadows.lg,
    },
    dragHandleContainer: {
        alignItems: 'center',
        paddingVertical: spacingY._10,
    },
    dragHandle: {
        width: scale(40),
        height: verticalScale(4),
        backgroundColor: colors.text.disabled,
        borderRadius: radius._20,
        marginBottom: spacingY._5,
    },
    dragHandleActive: {
        backgroundColor: colors.primary.main,
        transform: [{ scaleY: 1.5 }],
    },
    dragHandleExpanded: {
        backgroundColor: colors.success.main,
    },
    dragHint: {
        fontSize: scaleFont(10),
        color: colors.text.disabled,
        textAlign: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacingX._20,
        paddingVertical: spacingY._15,
        borderBottomWidth: 1,
        borderBottomColor: colors.border?.light || '#e1e5e9',
    },
    headerContent: {
        flex: 1,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: scaleFont(18),
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacingY._3,
    },
    subtitle: {
        fontSize: scaleFont(14),
        color: colors.text.secondary,
    },
    expandButton: {
        padding: spacingX._5,
        marginRight: spacingX._10,
    },
    closeButton: {
        padding: spacingX._5,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacingX._20,
        paddingBottom: spacingY._10, // Reduced padding since we're adding paddingBottom to modal
    },

    // Action Sheet Styles
    actionSheet: {
        paddingBottom: spacingY._10,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacingY._15,
        paddingHorizontal: spacingX._5,
        borderBottomWidth: 1,
        borderBottomColor: colors.border?.light || '#e1e5e9',
    },
    actionItemDisabled: {
        opacity: 0.5,
    },
    actionIcon: {
        marginRight: spacingX._15,
    },
    actionText: {
        fontSize: scaleFont(16),
        color: colors.text.primary,
        flex: 1,
    },
    actionTextDestructive: {
        color: colors.error.main,
    },
    actionTextDisabled: {
        color: colors.text.disabled,
    },
    separator: {
        height: spacingY._10,
        backgroundColor: colors.background.paper,
        marginVertical: spacingY._10,
    },
    cancelButton: {
        paddingVertical: spacingY._15,
        alignItems: 'center',
    },
    cancelText: {
        fontSize: scaleFont(16),
        fontWeight: '600',
        color: colors.text.primary,
    },
});