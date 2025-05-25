// components/ChildItem/ChildItem.tsx
import { Card } from '@/components/Card/CardComponent';
import { colors, radius, spacingX, spacingY } from '@/constants/theme';
import { scale, scaleFont } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';


interface Children {
    childId: number;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    schoolName: string;
    schoolGradeName: string;
    fK_ParentId: number;
    fK_SchoolId: number;
    fK_StatusId: number;
    createdOn: string;
    modifiedOn: string | null;
}

export interface ChildItemProps {
    child: Children;
    onPress?: (child: Children) => void;
    onEdit?: (child: Children) => void;
    onDelete?: (child: Children) => void;
    showActions?: boolean;
    style?: ViewStyle;
}

export const ChildItem: React.FC<ChildItemProps> = ({
    child,
    onPress,
    onEdit,
    onDelete,
    showActions = false,
    style,
}) => {
    // Format date of birth
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    // Calculate age
    const calculateAge = (dateString: string) => {
        try {
            const birthDate = new Date(dateString);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            return age;
        } catch {
            return null;
        }
    };

    const age = calculateAge(child.dateOfBirth);

    // Get status color
    const getStatusColor = () => {
        // You can customize this based on your status logic
        // For now, using a simple logic based on status ID
        switch (child.fK_StatusId) {
            case 1:
                return colors.success.main; // Active
            case 2:
                return colors.warning.main; // Pending
            case 3:
                return colors.error.main; // Inactive
            default:
                return colors.info.main;
        }
    };

    // Get initials for avatar
    const getInitials = () => {
        const firstName = child.firstName?.charAt(0)?.toUpperCase() || '';
        const lastName = child.lastName?.charAt(0)?.toUpperCase() || '';
        return `${firstName}${lastName}`;
    };

    const handlePress = () => {
        onPress?.(child);
    };

    const handleEdit = () => {
        onEdit?.(child);
    };

    const handleDelete = () => {
        onDelete?.(child);
    };

    console.log("Child :: ", child)

    return (
        <Card
            style={Object.assign({}, styles.container, style)}
            onPress={onPress ? handlePress : undefined}
            shadow="sm"
            padding="_15"
        >
            <View style={styles.content}>
                {/* Avatar and main info */}
                <View style={styles.leftSection}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{getInitials()}</Text>
                    </View>

                    <View style={styles.mainInfo}>
                        <Text style={styles.name}>
                            {child.firstName} {child.lastName}
                        </Text>

                        <View style={styles.detailsRow}>
                            <Ionicons
                                name="calendar-outline"
                                size={scale(14)}
                                color={colors.text.secondary}
                            />
                            <Text style={styles.detailText}>
                                {formatDate(child.dateOfBirth)}
                                {age !== null && ` (${age} ans)`}
                            </Text>
                        </View>

                        {child.schoolName && (
                            <View style={styles.detailsRow}>
                                <Ionicons
                                    name="school-outline"
                                    size={scale(14)}
                                    color={colors.text.secondary}
                                />
                                <Text style={styles.detailText}>
                                    {child.schoolName}
                                </Text>
                            </View>
                        )}

                        {child.schoolGradeName && (
                            <View style={styles.detailsRow}>
                                <Ionicons
                                    name="library-outline"
                                    size={scale(14)}
                                    color={colors.text.secondary}
                                />
                                <Text style={styles.detailText}>
                                    Classe: {child.schoolGradeName}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Right section with status and actions */}
                <View style={styles.rightSection}>
                    {/* Status indicator */}
                    <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />

                    {/* Action buttons */}
                    {showActions && (
                        <View style={styles.actions}>
                            {onEdit && (
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={handleEdit}
                                    accessibilityLabel="Modifier l'enfant"
                                >
                                    <Ionicons
                                        name="pencil-outline"
                                        size={scale(18)}
                                        color={colors.primary.main}
                                    />
                                </TouchableOpacity>
                            )}

                            {onDelete && (
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={handleDelete}
                                    accessibilityLabel="Supprimer l'enfant"
                                >
                                    <Ionicons
                                        name="trash-outline"
                                        size={scale(18)}
                                        color={colors.error.main}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </View>

            {/* Additional info footer */}
            <View style={styles.footer}>
                {/* <View style={styles.footerItem}>
                    <Text style={styles.footerLabel}>ID:</Text>
                    <Text style={styles.footerValue}>{child.childId}</Text>
                </View> */}

                <View style={styles.footerItem}>
                    <Text style={styles.footerLabel}>Créé le:</Text>
                    <Text style={styles.footerValue}>
                        {formatDate(child.createdOn)}
                    </Text>
                </View>
            </View>
        </Card>
    );
};

// Compact version for smaller displays
export const CompactChildItem: React.FC<ChildItemProps> = ({
    child,
    onPress,
    style,
}) => {
    const age = React.useMemo(() => {
        try {
            const birthDate = new Date(child.dateOfBirth);
            const today = new Date();
            return today.getFullYear() - birthDate.getFullYear();
        } catch {
            return null;
        }
    }, [child.dateOfBirth]);

    return (
        <TouchableOpacity
            style={[styles.compactContainer, style]}
            onPress={() => onPress?.(child)}
            activeOpacity={0.7}
        >
            <View style={styles.compactContent}>
                <View style={styles.compactAvatar}>
                    <Text style={styles.compactAvatarText}>
                        {child.firstName?.charAt(0)}{child.lastName?.charAt(0)}
                    </Text>
                </View>

                <View style={styles.compactInfo}>
                    <Text style={styles.compactName}>
                        {child.firstName} {child.lastName}
                    </Text>
                    <Text style={styles.compactDetails}>
                        {age !== null && `${age} ans • `}
                        {child.schoolGradeName || 'Classe non spécifiée'}
                    </Text>
                </View>

                <Ionicons
                    name="chevron-forward-outline"
                    size={scale(20)}
                    color={colors.text.secondary}
                />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    // Regular item styles
    container: {
        marginBottom: spacingY._10,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    leftSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    avatar: {
        width: scale(50),
        height: scale(50),
        borderRadius: scale(25),
        backgroundColor: colors.primary.light,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacingX._15,
    },
    avatarText: {
        fontSize: scaleFont(18),
        fontWeight: '600',
        color: colors.text.white,
    },
    mainInfo: {
        flex: 1,
    },
    name: {
        fontSize: scaleFont(16),
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacingY._5,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacingY._3,
    },
    detailText: {
        fontSize: scaleFont(13),
        color: colors.text.secondary,
        marginLeft: spacingX._7,
        flex: 1,
    },
    rightSection: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: scale(50),
    },
    statusIndicator: {
        width: scale(12),
        height: scale(12),
        borderRadius: scale(6),
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        padding: spacingX._7,
        marginLeft: spacingX._5,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacingY._15,
        paddingTop: spacingY._10,
        borderTopWidth: 1,
        borderTopColor: colors.border?.light || '#e1e5e9',
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerLabel: {
        fontSize: scaleFont(11),
        color: colors.text.disabled,
        marginRight: spacingX._5,
    },
    footerValue: {
        fontSize: scaleFont(11),
        color: colors.text.secondary,
        fontWeight: '500',
    },

    // Compact item styles
    compactContainer: {
        backgroundColor: colors.background.default,
        borderRadius: radius._10,
        marginBottom: spacingY._7,
        paddingHorizontal: spacingX._15,
        paddingVertical: spacingY._12,
        borderWidth: 1,
        borderColor: colors.border?.light || '#e1e5e9',
    },
    compactContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    compactAvatar: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: colors.primary.light,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacingX._12,
    },
    compactAvatarText: {
        fontSize: scaleFont(14),
        fontWeight: '600',
        color: colors.text.white,
    },
    compactInfo: {
        flex: 1,
    },
    compactName: {
        fontSize: scaleFont(15),
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacingY._3,
    },
    compactDetails: {
        fontSize: scaleFont(12),
        color: colors.text.secondary,
    },
});