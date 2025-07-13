// components/ListItems/TransactionItem.tsx
import { colors, radius, spacingX, spacingY } from '@/constants/theme';
import { RecentPaymentTransactionDto } from '@/services/userServices';
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

export interface TransactionItemProps {
    transaction: RecentPaymentTransactionDto;
    onPress?: (transaction: RecentPaymentTransactionDto) => void;
    style?: ViewStyle;
    compact?: boolean;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
    transaction,
    onPress,
    style,
    compact = false,
}) => {
    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'CFA',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateString;
        }
    };

    // Get payment method icon
    const getPaymentMethodIcon = (method: string) => {
        switch (method.toLowerCase()) {
            case 'airtelmoney':
                return 'phone-portrait-outline';
            case 'orangemoney':
                return 'phone-portrait-outline';
            case 'mpesa':
                return 'phone-portrait-outline';
            case 'card':
            case 'credit':
            case 'debit':
                return 'card-outline';
            case 'bank':
            case 'transfer':
                return 'business-outline';
            case 'cash':
                return 'cash-outline';
            default:
                return 'wallet-outline';
        }
    };

    // Get status color
    const getStatusColor = () => {
        switch (transaction.statusName.toLowerCase()) {
            case 'processed':
            case 'completed':
            case 'success':
                return colors.success.main;
            case 'pending':
            case 'processing':
                return colors.warning.main;
            case 'failed':
            case 'error':
                return colors.error.main;
            default:
                return colors.info.main;
        }
    };

    const handlePress = () => {
        onPress?.(transaction);
    };

    if (compact) {
        return (
            <TouchableOpacity
                style={[styles.compactContainer, style]}
                onPress={handlePress}
                activeOpacity={0.7}
            >
                <View style={styles.compactContent}>
                    <View style={styles.compactLeft}>
                        <View style={styles.compactIconContainer}>
                            <Ionicons
                                name={getPaymentMethodIcon(transaction.paymentMethod)}
                                size={scale(16)}
                                color={colors.primary.main}
                            />
                        </View>
                        <View style={styles.compactInfo}>
                            <Text style={styles.compactChildName} numberOfLines={1}>
                                {transaction.childFullName}
                            </Text>
                            <Text style={styles.compactTime}>
                                {transaction.relativeTime}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.compactRight}>
                        <Text style={styles.compactAmount}>
                            {formatCurrency(transaction.installmentAmount)}
                        </Text>
                        <View style={[styles.compactStatus, { backgroundColor: getStatusColor() }]}>
                            <Text style={styles.compactStatusText}>
                                {transaction.statusName}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            style={[styles.container, style]}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                {/* Left section with icon and details */}
                <View style={styles.leftSection}>
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name={getPaymentMethodIcon(transaction.paymentMethod)}
                            size={scale(24)}
                            color={colors.primary.main}
                        />
                    </View>

                    <View style={styles.details}>
                        <Text style={styles.childName}>
                            {transaction.childFullName}
                        </Text>
                        <Text style={styles.schoolGrade}>
                            {transaction.gradeName} • {transaction.schoolName}
                        </Text>
                        <View style={styles.paymentInfo}>
                            <Text style={styles.paymentMethod}>
                                {transaction.paymentMethod}
                            </Text>
                            <Text style={styles.separator}>•</Text>
                            <Text style={styles.referenceNumber}>
                                {transaction.transactionReference}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Right section with amount and status */}
                <View style={styles.rightSection}>
                    <Text style={styles.amount}>
                        {formatCurrency(transaction.amountPaid)}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                        <Text style={styles.statusText}>
                            {transaction.statusName}
                        </Text>
                    </View>
                    <Text style={styles.timeText}>
                        {transaction.relativeTime}
                    </Text>
                </View>
            </View>

            {/* Footer with additional info */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Payé le {formatDate(transaction.paidDate)}
                </Text>
                <Text style={styles.footerText}>
                    Échéance: {formatDate(transaction.dueDate)}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    // Regular item styles
    container: {
        backgroundColor: colors.background.default,
        borderRadius: radius._12,
        marginBottom: spacingY._10,
        padding: spacingX._15,
        borderWidth: 1,
        borderColor: colors.border?.light || '#e1e5e9',
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
    iconContainer: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: colors.primary.light + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacingX._12,
    },
    details: {
        flex: 1,
    },
    childName: {
        fontSize: scaleFont(16),
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacingY._3,
    },
    schoolGrade: {
        fontSize: scaleFont(13),
        color: colors.text.secondary,
        marginBottom: spacingY._5,
        lineHeight: scaleFont(18),
    },
    paymentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paymentMethod: {
        fontSize: scaleFont(12),
        color: colors.primary.main,
        fontWeight: '500',
    },
    separator: {
        fontSize: scaleFont(12),
        color: colors.text.disabled,
        marginHorizontal: spacingX._5,
    },
    referenceNumber: {
        fontSize: scaleFont(12),
        color: colors.text.disabled,
        flex: 1,
    },
    rightSection: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: scaleFont(16),
        fontWeight: 'bold',
        color: colors.success.main,
        marginBottom: spacingY._5,
    },
    statusBadge: {
        paddingHorizontal: spacingX._7,
        paddingVertical: spacingY._3,
        borderRadius: radius._10,
        marginBottom: spacingY._5,
    },
    statusText: {
        fontSize: scaleFont(11),
        fontWeight: '600',
        color: colors.text.white,
    },
    timeText: {
        fontSize: scaleFont(12),
        color: colors.text.secondary,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacingY._10,
        paddingTop: spacingY._10,
        borderTopWidth: 1,
        borderTopColor: colors.border?.light || '#e1e5e9',
    },
    footerText: {
        fontSize: scaleFont(11),
        color: colors.text.disabled,
    },

    // Compact item styles
    compactContainer: {
        backgroundColor: colors.background.default,
        borderRadius: radius._10,
        marginBottom: spacingY._7,
        padding: spacingX._12,
        borderWidth: 1,
        borderColor: colors.border?.light || '#e1e5e9',
    },
    compactContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    compactLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    compactIconContainer: {
        width: scale(32),
        height: scale(32),
        borderRadius: scale(16),
        backgroundColor: colors.primary.light + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacingX._10,
    },
    compactInfo: {
        flex: 1,
    },
    compactChildName: {
        fontSize: scaleFont(14),
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacingY._3,
    },
    compactTime: {
        fontSize: scaleFont(12),
        color: colors.text.secondary,
    },
    compactRight: {
        alignItems: 'flex-end',
    },
    compactAmount: {
        fontSize: scaleFont(14),
        fontWeight: 'bold',
        color: colors.success.main,
        marginBottom: spacingY._3,
    },
    compactStatus: {
        paddingHorizontal: spacingX._5,
        paddingVertical: spacingY._3,
        borderRadius: radius._10,
    },
    compactStatusText: {
        fontSize: scaleFont(10),
        fontWeight: '600',
        color: colors.text.white,
    },
});