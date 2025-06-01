// components/PaymentItem/PaymentItem.tsx
import { Card } from '@/components/Card/CardComponent';
import { colors, radius, spacingX, spacingY } from '@/constants/theme';
import { ParentInstallmentDto } from '@/services/userServices';
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

export interface PaymentItemProps {
    installment: ParentInstallmentDto;
    onPress?: (installment: ParentInstallmentDto) => void;
    onPay?: (installment: ParentInstallmentDto) => void;
    showActions?: boolean;
    style?: ViewStyle;
}

export const PaymentItem: React.FC<PaymentItemProps> = ({
    installment,
    onPress,
    onPay,
    showActions = true,
    style,
}) => {
    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'CFA', // West African CFA franc - adjust to your currency
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    // Get status info
    const getStatusInfo = () => {
        if (installment.isPaid) {
            return {
                text: 'Payé',
                color: colors.background.default,
                backgroundColor: colors.success.light,
                icon: 'checkmark-circle-outline' as keyof typeof Ionicons.glyphMap,
            };
        }

        const isOverdue = new Date(installment.dueDate) < new Date();
        if (isOverdue) {
            return {
                text: 'En retard',
                color: colors.background.default,
                backgroundColor: colors.error.light,
                icon: 'alert-circle-outline' as keyof typeof Ionicons.glyphMap,
            };
        }

        return {
            text: 'En attente',
            color: colors.background.default,
            backgroundColor: colors.warning.light,
            icon: 'time-outline' as keyof typeof Ionicons.glyphMap,
        };
    };

    const statusInfo = getStatusInfo();
    const isOverdue = !installment.isPaid && new Date(installment.dueDate) < new Date();
    const totalAmount = installment.amount + (installment.lateFee || 0);

    const handlePress = () => {
        onPress?.(installment);
    };

    const handlePay = () => {
        onPay?.(installment);
    };

    return (
        <Card
            style={StyleSheet.flatten([styles.container, style])}
            onPress={onPress ? handlePress : undefined}
            shadow="sm"
            padding="_15"
        >
            <View style={styles.content}>
                {/* Header with child name and status */}
                <View style={styles.header}>
                    <View style={styles.childInfo}>
                        <Text style={styles.childName}>{installment.childName}</Text>
                        <View style={styles.schoolInfo}>
                            <Ionicons
                                name="school-outline"
                                size={scale(12)}
                                color={colors.text.secondary}
                            />
                            <Text style={styles.schoolText}>
                                {installment.schoolName}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.backgroundColor }]}>
                        <Ionicons
                            name={statusInfo.icon}
                            size={scale(12)}
                            color={statusInfo.color}
                        />
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>
                            {statusInfo.text}
                        </Text>
                    </View>
                </View>

                {/* Class information */}
                <View style={styles.classRow}>
                    <Ionicons
                        name="library-outline"
                        size={scale(14)}
                        color={colors.text.secondary}
                    />
                    <Text style={styles.classText}>Classe: {installment.className}</Text>
                </View>

                {/* Amount and due date */}
                <View style={styles.amountSection}>
                    <View style={styles.amountInfo}>
                        <Text style={styles.amountLabel}>Montant</Text>
                        <Text style={styles.amount}>
                            {formatCurrency(installment.amount)}
                        </Text>
                        {installment.lateFee && installment.lateFee > 0 && (
                            <Text style={styles.lateFee}>
                                + {formatCurrency(installment.lateFee)} (retard)
                            </Text>
                        )}
                    </View>

                    <View style={styles.dueDateInfo}>
                        <Text style={styles.dueDateLabel}>Échéance</Text>
                        <View style={styles.dueDateRow}>
                            <Ionicons
                                name="calendar-outline"
                                size={scale(14)}
                                color={isOverdue ? colors.error.main : colors.text.secondary}
                            />
                            <Text style={[
                                styles.dueDate,
                                isOverdue && styles.overdueDueDate
                            ]}>
                                {formatDate(installment.dueDate)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Payment date if paid */}
                {installment.isPaid && installment.paidDate && (
                    <View style={styles.paidSection}>
                        <Ionicons
                            name="checkmark-circle-outline"
                            size={scale(14)}
                            color={colors.success.main}
                        />
                        <Text style={styles.paidText}>
                            Payé le {formatDate(installment.paidDate)}
                        </Text>
                    </View>
                )}

                {/* Action buttons */}
                {showActions && !installment.isPaid && (
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.payButton, isOverdue && styles.urgentPayButton]}
                            onPress={handlePay}
                            accessibilityLabel="Payer maintenant"
                        >
                            <Ionicons
                                name="card-outline"
                                size={scale(16)}
                                color={colors.text.white}
                            />
                            <Text style={styles.payButtonText}>
                                {isOverdue ? 'Payer (En retard)' : 'Payer'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </Card>
    );
};

// Compact version for smaller displays
export const CompactPaymentItem: React.FC<PaymentItemProps> = ({
    installment,
    onPress,
    style,
}) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('fr-FR', {
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    const isOverdue = !installment.isPaid && new Date(installment.dueDate) < new Date();
    const statusColor = installment.isPaid
        ? colors.success.main
        : isOverdue
            ? colors.error.main
            : colors.warning.main;

    return (
        <TouchableOpacity
            style={[styles.compactContainer, style]}
            onPress={() => onPress?.(installment)}
            activeOpacity={0.7}
        >
            <View style={styles.compactContent}>
                <View style={styles.compactLeft}>
                    <View style={[styles.compactStatusIndicator, { backgroundColor: statusColor }]} />
                    <View style={styles.compactInfo}>
                        <Text style={styles.compactChildName}>{installment.childName}</Text>
                        <Text style={styles.compactClass}>{installment.className}</Text>
                    </View>
                </View>

                <View style={styles.compactRight}>
                    <Text style={styles.compactAmount}>
                        {formatCurrency(installment.amount)}
                    </Text>
                    <Text style={[
                        styles.compactDueDate,
                        isOverdue && styles.compactOverdue
                    ]}>
                        {formatDate(installment.dueDate)}
                    </Text>
                </View>

                <Ionicons
                    name="chevron-forward-outline"
                    size={scale(16)}
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
        gap: spacingY._12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    childInfo: {
        flex: 1,
    },
    childName: {
        fontSize: scaleFont(16),
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacingY._3,
    },
    schoolInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    schoolText: {
        fontSize: scaleFont(12),
        color: colors.text.secondary,
        marginLeft: spacingX._5,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacingX._7,
        paddingVertical: spacingY._5,
        borderRadius: radius._20,
        gap: spacingX._3,
    },
    statusText: {
        fontSize: scaleFont(11),
        fontWeight: '600',
    },
    classRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingX._7,
    },
    classText: {
        fontSize: scaleFont(13),
        color: colors.text.secondary,
    },
    amountSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    amountInfo: {
        flex: 1,
    },
    amountLabel: {
        fontSize: scaleFont(12),
        color: colors.text.secondary,
        marginBottom: spacingY._3,
    },
    amount: {
        fontSize: scaleFont(16),
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    lateFee: {
        fontSize: scaleFont(11),
        color: colors.error.main,
        marginTop: spacingY._3,
    },
    dueDateInfo: {
        alignItems: 'flex-end',
    },
    dueDateLabel: {
        fontSize: scaleFont(12),
        color: colors.text.secondary,
        marginBottom: spacingY._3,
    },
    dueDateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingX._5,
    },
    dueDate: {
        fontSize: scaleFont(13),
        color: colors.text.primary,
        fontWeight: '500',
    },
    overdueDueDate: {
        color: colors.error.main,
    },
    paidSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingX._7,
        paddingTop: spacingY._10,
        borderTopWidth: 1,
        borderTopColor: colors.border?.light || '#e1e5e9',
    },
    paidText: {
        fontSize: scaleFont(12),
        color: colors.success.main,
        fontWeight: '500',
    },
    actions: {
        paddingTop: spacingY._10,
        borderTopWidth: 1,
        borderTopColor: colors.border?.light || '#e1e5e9',
    },
    payButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary.main,
        paddingHorizontal: spacingX._20,
        paddingVertical: spacingY._12,
        borderRadius: radius._10,
        gap: spacingX._7,
    },
    urgentPayButton: {
        backgroundColor: colors.error.main,
    },
    payButtonText: {
        fontSize: scaleFont(14),
        fontWeight: '600',
        color: colors.text.white,
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
    compactLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    compactStatusIndicator: {
        width: scale(8),
        height: scale(8),
        borderRadius: scale(4),
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
    compactClass: {
        fontSize: scaleFont(11),
        color: colors.text.secondary,
    },
    compactRight: {
        alignItems: 'flex-end',
        marginRight: spacingX._10,
    },
    compactAmount: {
        fontSize: scaleFont(14),
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: spacingY._3,
    },
    compactDueDate: {
        fontSize: scaleFont(11),
        color: colors.text.secondary,
    },
    compactOverdue: {
        color: colors.error.main,
        fontWeight: '500',
    },
});