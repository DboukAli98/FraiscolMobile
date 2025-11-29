import { colors, spacingX, spacingY } from '@/constants/theme';
import { Notification } from '@/services/notificationServices';
import { scaleFont } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NotificationItemProps {
    notification: Notification;
    onPress?: (notification: Notification) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    onPress,
}) => {
    const getNotificationIcon = (type: string): keyof typeof Ionicons.glyphMap => {
        switch (type.toLowerCase()) {
            case 'payment':
                return 'cash-outline';
            case 'reminder':
                return 'time-outline';
            case 'alert':
                return 'alert-circle-outline';
            case 'info':
                return 'information-circle-outline';
            default:
                return 'notifications-outline';
        }
    };

    const getNotificationColor = (type: string): string => {
        switch (type.toLowerCase()) {
            case 'payment':
                return colors.success.main;
            case 'reminder':
                return colors.warning.main;
            case 'alert':
                return colors.error.main;
            case 'info':
                return colors.info.main;
            default:
                return colors.primary.main;
        }
    };

    const formatDate = (dateString: string): string => {
        // Parse the date string - if it doesn't end with 'Z', add it to treat as UTC
        let isoString = dateString;
        if (!dateString.endsWith('Z') && !dateString.includes('+') && !dateString.includes('T')) {
            // If it's just a date without timezone, treat as UTC
            isoString = dateString + 'Z';
        } else if (dateString.includes('T') && !dateString.endsWith('Z') && !dateString.includes('+')) {
            // If it has time but no timezone indicator, add Z
            isoString = dateString + 'Z';
        }
        
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'À l\'instant';
        if (diffMins < 60) return `Il y a ${diffMins} min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        if (diffDays < 7) return `Il y a ${diffDays}j`;

        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
        });
    };

    const iconColor = getNotificationColor(notification.type);

    return (
        <TouchableOpacity
            style={[
                styles.container,
                !notification.isRead && styles.unreadContainer,
            ]}
            onPress={() => onPress?.(notification)}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
                <Ionicons
                    name={getNotificationIcon(notification.type)}
                    size={24}
                    color={iconColor}
                />
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text
                        style={[
                            styles.title,
                            !notification.isRead && styles.unreadTitle,
                        ]}
                        numberOfLines={1}
                    >
                        {notification.title}
                    </Text>
                    {!notification.isRead && <View style={styles.unreadDot} />}
                </View>

                <Text style={styles.message} numberOfLines={2}>
                    {notification.message}
                </Text>

                <View style={styles.footer}>
                    <Text style={styles.time}>{formatDate(notification.createdAt)}</Text>
                    {notification.type && (
                        <View
                            style={[
                                styles.typeBadge,
                                { backgroundColor: `${iconColor}15` },
                            ]}
                        >
                            <Text style={[styles.typeText, { color: iconColor }]}>
                                {notification.type}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: spacingX._15,
        backgroundColor: colors.background.paper,
        borderBottomWidth: 1,
        borderBottomColor: colors.border?.light || '#E5E7EB',
    },
    unreadContainer: {
        backgroundColor: colors.primary.light + '10',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacingX._12,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacingY._5,
    },
    title: {
        flex: 1,
        fontSize: scaleFont(15),
        fontWeight: '500',
        color: colors.text.primary,
    },
    unreadTitle: {
        fontWeight: '700',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary.main,
        marginLeft: spacingX._7,
    },
    message: {
        fontSize: scaleFont(14),
        color: colors.text.secondary,
        lineHeight: scaleFont(20),
        marginBottom: spacingY._7,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    time: {
        fontSize: scaleFont(12),
        color: colors.text.secondary,
    },
    typeBadge: {
        paddingHorizontal: spacingX._7,
        paddingVertical: spacingY._3,
        borderRadius: 12,
    },
    typeText: {
        fontSize: scaleFont(11),
        fontWeight: '600',
        textTransform: 'capitalize',
    },
});
