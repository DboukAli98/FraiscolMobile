// components/SchoolItem/SchoolItem.tsx
import { Card } from '@/components/Card/CardComponent';
import { colors, radius, spacingX, spacingY } from '@/constants/theme';
import { School } from '@/services/childrenServices';
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

export interface SchoolItemProps {
    school: School;
    onPress?: (school: School) => void;
    onContact?: (school: School) => void;
    onWebsite?: (school: School) => void;
    showActions?: boolean;
    style?: ViewStyle;
}

export const SchoolItem: React.FC<SchoolItemProps> = ({
    school,
    onPress,
    onContact,
    onWebsite,
    showActions = true,
    style,
}) => {
    // Format creation date
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

    // Get status color
    const getStatusColor = () => {
        switch (school.fK_StatusId) {
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
        const words = school.schoolName?.split(' ') || [];
        if (words.length >= 2) {
            return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
        }
        return school.schoolName?.substring(0, 2).toUpperCase() || 'EC';
    };

    const handlePress = () => {
        onPress?.(school);
    };

    const handleContact = () => {
        onContact?.(school);
    };

    const handleWebsite = () => {
        onWebsite?.(school);
    };

    return (
        <Card
            style={Object.assign({}, styles.container, style)}
            onPress={onPress ? handlePress : undefined}
            shadow="sm"
            padding="_15"
        >
            <View style={styles.content}>
                {/* Left section with avatar and main info */}
                <View style={styles.leftSection}>
                    <View style={styles.avatar}>
                        {school.schoolLogo ? (
                            // You could implement image loading here if needed
                            <Text style={styles.avatarText}>{getInitials()}</Text>
                        ) : (
                            <Text style={styles.avatarText}>{getInitials()}</Text>
                        )}
                    </View>

                    <View style={styles.mainInfo}>
                        <Text style={styles.name} numberOfLines={2}>
                            {school.schoolName}
                        </Text>

                        {school.schoolPhoneNumber && (
                            <View style={styles.detailsRow}>
                                <Ionicons
                                    name="call-outline"
                                    size={scale(14)}
                                    color={colors.text.secondary}
                                />
                                <Text style={styles.detailText}>
                                    {school.schoolPhoneNumber}
                                </Text>
                            </View>
                        )}

                        {school.schoolEmail && (
                            <View style={styles.detailsRow}>
                                <Ionicons
                                    name="mail-outline"
                                    size={scale(14)}
                                    color={colors.text.secondary}
                                />
                                <Text style={styles.detailText} numberOfLines={1}>
                                    {school.schoolEmail}
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
                            {onWebsite && school.schoolWebsite && (
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={handleWebsite}
                                    accessibilityLabel="Visiter le site web"
                                >
                                    <Ionicons
                                        name="globe-outline"
                                        size={scale(16)}
                                        color={colors.info.main}
                                    />
                                </TouchableOpacity>
                            )}

                            {onContact && (school.schoolPhoneNumber || school.schoolEmail) && (
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={handleContact}
                                    accessibilityLabel="Contacter l'école"
                                >
                                    <Ionicons
                                        name="chatbubble-outline"
                                        size={scale(16)}
                                        color={colors.primary.main}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </View>

            {/* Description section */}
            {/* {school.schoolDescription && (
                <View style={styles.descriptionSection}>
                    <Text style={styles.description} numberOfLines={3}>
                        {school.schoolDescription}
                    </Text>
                </View>
            )} */}

            {/* Footer with additional info */}

        </Card>
    );
};

// Compact version for smaller displays or grid layouts
export const CompactSchoolItem: React.FC<SchoolItemProps> = ({
    school,
    onPress,
    style,
}) => {
    const getInitials = () => {
        const words = school.schoolName?.split(' ') || [];
        if (words.length >= 2) {
            return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
        }
        return school.schoolName?.substring(0, 2).toUpperCase() || 'EC';
    };

    return (
        <TouchableOpacity
            style={[styles.compactContainer, style]}
            onPress={() => onPress?.(school)}
            activeOpacity={0.7}
        >
            <View style={styles.compactContent}>
                <View style={styles.compactAvatar}>
                    <Text style={styles.compactAvatarText}>
                        {getInitials()}
                    </Text>
                </View>

                <View style={styles.compactInfo}>
                    <Text style={styles.compactName} numberOfLines={2}>
                        {school.schoolName}
                    </Text>
                    <Text style={styles.compactDetails} numberOfLines={1}>
                        {school.schoolAddress}
                    </Text>
                    <Text style={styles.compactYear}>
                        Établi en {school.schoolEstablishedYear}
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
        alignItems: 'center',
    },
    leftSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: scale(55),
        height: scale(55),
        borderRadius: scale(27.5),
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
        marginBottom: spacingY._7,
        lineHeight: scaleFont(20),
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacingY._5,
    },
    detailText: {
        fontSize: scaleFont(13),
        color: colors.text.secondary,
        marginLeft: spacingX._7,
        flex: 1,
        lineHeight: scaleFont(16),
    },
    rightSection: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        minHeight: scale(55),
    },
    statusIndicator: {
        width: scale(12),
        height: scale(12),
        borderRadius: scale(6),
    },
    actions: {
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: spacingY._5,
    },
    actionButton: {
        padding: spacingX._7,
        marginBottom: spacingY._3,
    },
    descriptionSection: {
        marginTop: spacingY._12,
        paddingTop: spacingY._12,
        borderTopWidth: 1,
        borderTopColor: colors.border?.light || '#e1e5e9',
    },
    description: {
        fontSize: scaleFont(13),
        color: colors.text.secondary,
        lineHeight: scaleFont(18),
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
        width: scale(45),
        height: scale(45),
        borderRadius: scale(22.5),
        backgroundColor: colors.primary.light,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacingX._12,
    },
    compactAvatarText: {
        fontSize: scaleFont(16),
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
        lineHeight: scaleFont(18),
    },
    compactDetails: {
        fontSize: scaleFont(12),
        color: colors.text.secondary,
        marginBottom: spacingY._3,
    },
    compactYear: {
        fontSize: scaleFont(11),
        color: colors.text.disabled,
    },
});