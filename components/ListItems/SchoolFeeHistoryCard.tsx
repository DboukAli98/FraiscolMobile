import { Card } from '@/components/Card/CardComponent';
import { colors, radius, spacingX, spacingY } from '@/constants/theme';
import { SchoolFeesPaymentHistoryDto } from '@/models/PaymentsServicesInterfaces';
import { scale, scaleFont } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from 'react-native';

export interface SchoolFeeHistoryCardProps {
    payment: SchoolFeesPaymentHistoryDto;
    onPress?: (payment: SchoolFeesPaymentHistoryDto) => void;
    style?: ViewStyle;
}

export const SchoolFeeHistoryCard: React.FC<SchoolFeeHistoryCardProps> = ({
    payment,
    onPress,
    style,
}) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'CFA',
            minimumFractionDigits: 0,
        }).format(amount);
    };

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

    const formatTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return '';
        }
    };

    const getStatusInfo = () => {
        switch (payment.fK_StatusId) {
            case 8:
                return {
                    text: 'Payé',
                    color: colors.background.default,
                    backgroundColor: colors.success.light,
                    icon: 'checkmark-circle-outline' as keyof typeof Ionicons.glyphMap,
                };
            default:
                return {
                    text: 'En attente',
                    color: colors.background.default,
                    backgroundColor: colors.warning.light,
                    icon: 'time-outline' as keyof typeof Ionicons.glyphMap,
                };
        }
    };

    const statusInfo = getStatusInfo();

    const handlePress = () => {
        onPress?.(payment);
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
                        <Text style={styles.childName}>{payment.childFullName}</Text>
                        <View style={styles.schoolInfo}>
                            <Ionicons
                                name="school-outline"
                                size={scale(12)}
                                color={colors.text.secondary}
                            />
                            <Text style={styles.schoolText} numberOfLines={1}>
                                {payment.schoolName}
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
                    <Text style={styles.classText}>{payment.schoolGradeName}</Text>
                </View>

                {/* Payment details */}
                <View style={styles.detailsSection}>
                    <View style={styles.detailRow}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Montant payé</Text>
                            <Text style={styles.detailValue}>
                                {formatCurrency(payment.amountPaid)}
                            </Text>
                        </View>

                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Méthode</Text>
                            <Text style={styles.detailValue}>{payment.paymentMethod}</Text>
                        </View>
                    </View>

                    {payment.lateFee && payment.lateFee > 0 && (
                        <View style={styles.lateFeeContainer}>
                            <Ionicons
                                name="alert-circle-outline"
                                size={scale(12)}
                                color={colors.error.main}
                            />
                            <Text style={styles.lateFeeText}>
                                Frais de retard: {formatCurrency(payment.lateFee)}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Footer with reference and date */}
                <View style={styles.footer}>
                    <View style={styles.footerItem}>
                        <Ionicons
                            name="receipt-outline"
                            size={scale(12)}
                            color={colors.text.secondary}
                        />
                        <Text style={styles.referenceText} numberOfLines={1}>
                            {payment.transactionReference || 'N/A'}
                        </Text>
                    </View>

                    <View style={styles.footerItem}>
                        <Ionicons
                            name="calendar-outline"
                            size={scale(12)}
                            color={colors.text.secondary}
                        />
                        <Text style={styles.dateText}>
                            {formatDate(payment.paidDate)} • {formatTime(payment.paidDate)}
                        </Text>
                    </View>
                </View>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
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
        marginRight: spacingX._10,
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
        gap: spacingX._5,
    },
    schoolText: {
        fontSize: scaleFont(12),
        color: colors.text.secondary,
        flex: 1,
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
    detailsSection: {
        gap: spacingY._7,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacingX._15,
    },
    detailItem: {
        flex: 1,
    },
    detailLabel: {
        fontSize: scaleFont(11),
        color: colors.text.secondary,
        marginBottom: spacingY._3,
    },
    detailValue: {
        fontSize: scaleFont(14),
        fontWeight: '600',
        color: colors.text.primary,
    },
    lateFeeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingX._5,
        paddingTop: spacingY._5,
    },
    lateFeeText: {
        fontSize: scaleFont(11),
        color: colors.error.main,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: spacingY._7,
        borderTopWidth: 1,
        borderTopColor: colors.border?.light || '#e1e5e9',
        gap: spacingX._10,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingX._5,
        flex: 1,
    },
    referenceText: {
        fontSize: scaleFont(11),
        color: colors.text.secondary,
        flex: 1,
    },
    dateText: {
        fontSize: scaleFont(11),
        color: colors.text.secondary,
    },
});
