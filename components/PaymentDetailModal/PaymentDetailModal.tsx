// components/PaymentDetailModal/PaymentDetailModal.tsx
import { BottomModal } from '@/components/BottomModal/BottomModal';
import { CustomButton } from '@/components/Button/CustomPressable';
import { colors, radius, shadows, spacingX, spacingY } from '@/constants/theme';
import { ParentInstallmentDto } from '@/services/userServices';
import { scale, scaleFont, SCREEN_HEIGHT } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface PaymentDetailModalProps {
    visible: boolean;
    onClose: () => void;
    installment: ParentInstallmentDto | null;
    onPay?: (installment: ParentInstallmentDto) => void;
}

export const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({
    visible,
    onClose,
    installment,
    onPay,
}) => {
    if (!installment) return null;

    console.log("installment :: ", JSON.stringify(installment))

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
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    // Get status info
    const getStatusInfo = () => {
        // First check if it's overdue (regardless of status)
        const isOverdue = new Date(installment.dueDate) < new Date();
        if (isOverdue && installment.statusId !== 8) { // Not overdue if already paid
            return {
                text: 'En retard',
                color: colors.background.default,
                backgroundColor: colors.error.light,
                icon: 'alert-circle-outline' as keyof typeof Ionicons.glyphMap,
            };
        }

        // Then check specific statuses
        switch (installment.statusId) {
            case 6:
                return {
                    text: 'En attente',
                    color: colors.background.default,
                    backgroundColor: colors.warning.light,
                    icon: 'time-outline' as keyof typeof Ionicons.glyphMap,
                };
            case 11:
                return {
                    text: 'En cours',
                    color: colors.background.default,
                    backgroundColor: colors.primary.light,
                    icon: 'sync-outline' as keyof typeof Ionicons.glyphMap, // Better icon for "in progress"
                };
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
    const isOverdue = !installment.isPaid && new Date(installment.dueDate) < new Date();
    const totalAmount = installment.amount + (installment.lateFee || 0);

    const handlePay = () => {
        onPay?.(installment);
        onClose();
    };

    return (
        <BottomModal
            visible={visible}
            onClose={onClose}
            title="Détails du paiement"
            height={SCREEN_HEIGHT * 0.75}
            enableDragToExpand={true}
            enableSwipeDown={true}
        >
            <View style={styles.container}>
                {/* Header with status */}
                <View style={styles.header}>
                    <View style={styles.childInfo}>
                        <Text style={styles.childName}>{installment.childName}</Text>
                        <Text style={styles.schoolName}>{installment.schoolName}</Text>
                        <Text style={styles.className}>Classe: {installment.className}</Text>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.backgroundColor + '20' }]}>
                        <Ionicons
                            name={statusInfo.icon}
                            size={scale(18)}
                            color={statusInfo.backgroundColor}
                        />
                        <Text style={[styles.statusText, { color: statusInfo.backgroundColor }]}>
                            {statusInfo.text}
                        </Text>
                    </View>
                </View>

                {/* Payment Details */}
                <View style={styles.detailsCard}>
                    {/* Amount Section */}
                    <View style={styles.detailSection}>
                        <View style={styles.detailRow}>
                            <View style={styles.detailIconContainer}>
                                <Ionicons name="wallet-outline" size={scale(22)} color={colors.primary.main} />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Montant à payer</Text>
                                <Text style={styles.detailValue}>
                                    {formatCurrency(installment.amount)}
                                </Text>
                            </View>
                        </View>

                        {installment.lateFee && installment.lateFee > 0 && (
                            <View style={styles.detailRow}>
                                <View style={styles.detailIconContainer}>
                                    <Ionicons name="alert-circle-outline" size={scale(22)} color={colors.error.main} />
                                </View>
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Frais de retard</Text>
                                    <Text style={[styles.detailValue, { color: colors.error.main }]}>
                                        {formatCurrency(installment.lateFee)}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {totalAmount !== installment.amount && (
                            <View style={[styles.detailRow, styles.totalRow]}>
                                <View style={styles.detailIconContainer}>
                                    <Ionicons name="calculator-outline" size={scale(22)} color={colors.text.primary} />
                                </View>
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Total à payer</Text>
                                    <Text style={[styles.detailValue, styles.totalValue]}>
                                        {formatCurrency(totalAmount)}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Due Date Section */}
                    <View style={styles.detailSection}>
                        <View style={styles.detailRow}>
                            <View style={styles.detailIconContainer}>
                                <Ionicons
                                    name="calendar-outline"
                                    size={scale(22)}
                                    color={isOverdue ? colors.error.main : colors.primary.main}
                                />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>{"Date d'échéance"}</Text>
                                <Text style={[
                                    styles.detailValue,
                                    isOverdue && { color: colors.error.main }
                                ]}>
                                    {formatDate(installment.dueDate)}
                                </Text>
                                {isOverdue && (
                                    <Text style={styles.overdueNote}>
                                        ⚠️ Paiement en retard
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Payment Date if paid */}
                    {installment.isPaid && installment.paidDate && (
                        <View style={styles.detailSection}>
                            <View style={styles.detailRow}>
                                <View style={styles.detailIconContainer}>
                                    <Ionicons name="checkmark-circle-outline" size={scale(22)} color={colors.success.main} />
                                </View>
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Date de paiement</Text>
                                    <Text style={[styles.detailValue, { color: colors.success.main }]}>
                                        {formatDate(installment.paidDate)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    {!installment.isPaid ? (
                        <>
                            <CustomButton
                                title="Annuler"
                                onPress={onClose}
                                variant="ghost"
                                color="primary"
                                style={styles.cancelButton}
                            />
                            <CustomButton
                                title={isOverdue ? "Payer (En retard)" : "Payer maintenant"}
                                onPress={handlePay}
                                variant="filled"
                                color="primary"
                                style={styles.payButton}
                                leftIcon="card"
                                shadow
                            />
                        </>
                    ) : (
                        <CustomButton
                            title="Fermer"
                            onPress={onClose}
                            variant="filled"
                            color="primary"
                            fullWidth
                            style={styles.singleButton}
                        />
                    )}
                </View>
            </View>
        </BottomModal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: spacingX._15,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacingY._20,
        paddingVertical: spacingY._10,
    },
    childInfo: {
        flex: 1,
    },
    childName: {
        fontSize: scaleFont(20),
        fontWeight: '800',
        color: colors.text.primary,
        marginBottom: spacingY._4,
    },
    schoolName: {
        fontSize: scaleFont(14),
        color: colors.text.secondary,
        fontWeight: '500',
        marginBottom: spacingY._2,
    },
    className: {
        fontSize: scaleFont(13),
        color: colors.text.disabled,
        fontWeight: '500',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacingX._12,
        paddingVertical: spacingY._6,
        borderRadius: radius.full,
        gap: spacingX._6,
    },
    statusText: {
        fontSize: scaleFont(12),
        fontWeight: '700',
    },

    // Details Card
    detailsCard: {
        backgroundColor: colors.surface.main,
        borderRadius: radius._16,
        padding: spacingX._20,
        marginBottom: spacingY._25,
        ...shadows.sm,
        borderWidth: 1,
        borderColor: colors.border.light,
    },
    detailSection: {
        marginBottom: spacingY._15,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacingY._12,
    },
    totalRow: {
        paddingTop: spacingY._15,
        borderTopWidth: 1,
        borderTopColor: colors.border.light,
        marginTop: spacingY._5,
    },
    detailIconContainer: {
        width: scale(44),
        height: scale(44),
        borderRadius: radius._12,
        backgroundColor: colors.background.default,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacingX._15,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: scaleFont(12),
        color: colors.text.secondary,
        fontWeight: '500',
        marginBottom: spacingY._2,
    },
    detailValue: {
        fontSize: scaleFont(16),
        fontWeight: '700',
        color: colors.text.primary,
    },
    totalValue: {
        fontSize: scaleFont(18),
        fontWeight: '800',
        color: colors.primary.main,
    },
    overdueNote: {
        fontSize: scaleFont(11),
        color: colors.error.main,
        marginTop: spacingY._2,
        fontWeight: '600',
    },

    // Actions
    actions: {
        flexDirection: 'row',
        gap: spacingX._12,
        paddingBottom: spacingY._20,
    },
    cancelButton: {
        flex: 1,
    },
    payButton: {
        flex: 2,
    },
    singleButton: {
        flex: 1,
    },
});