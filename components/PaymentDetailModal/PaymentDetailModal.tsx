// components/PaymentDetailModal/PaymentDetailModal.tsx
import { BottomModal } from '@/components/BottomModal/BottomModal';
import { PrimaryButton } from '@/components/Button/CustomPressable';
import { Card, CardBody } from '@/components/Card/CardComponent';
import { colors, spacingX, spacingY } from '@/constants/theme';
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
        if (installment.isPaid) {
            return {
                text: 'Payé',
                color: colors.text.white,
                backgroundColor: colors.success.light,
                icon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap,
            };
        }

        const isOverdue = new Date(installment.dueDate) < new Date();
        if (isOverdue) {
            return {
                text: 'En retard',
                color: colors.text.white,
                backgroundColor: colors.error.light,
                icon: 'alert-circle' as keyof typeof Ionicons.glyphMap,
            };
        }

        return {
            text: 'En attente',
            color: colors.text.white,
            backgroundColor: colors.warning.light,
            icon: 'time' as keyof typeof Ionicons.glyphMap,
        };
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
            height={SCREEN_HEIGHT * 0.7}
            enableDragToExpand={true}
        >
            <View style={styles.container}>
                {/* Header with status */}
                <View style={styles.header}>
                    <View style={styles.childInfo}>
                        <Text style={styles.childName}>{installment.childName}</Text>
                        <Text style={styles.schoolName}>{installment.schoolName}</Text>
                        <Text style={styles.className}>Classe: {installment.className}</Text>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.backgroundColor }]}>
                        <Ionicons
                            name={statusInfo.icon}
                            size={scale(20)}
                            color={statusInfo.color}
                        />
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>
                            {statusInfo.text}
                        </Text>
                    </View>
                </View>

                {/* Payment Details */}
                <Card style={styles.detailsCard} padding="_15">
                    <CardBody>
                        {/* Amount Section */}
                        <View style={styles.detailSection}>
                            <View style={styles.detailRow}>
                                <View style={styles.detailIconContainer}>
                                    <Ionicons name="wallet" size={scale(20)} color={colors.primary.main} />
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
                                        <Ionicons name="alert-circle" size={scale(20)} color={colors.error.main} />
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
                                        <Ionicons name="calculator" size={scale(20)} color={colors.text.primary} />
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
                                        name="calendar"
                                        size={scale(20)}
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
                                        <Ionicons name="checkmark-circle" size={scale(20)} color={colors.success.main} />
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

                        {/* Additional Info */}
                        {/* <View style={styles.detailSection}>
                            <View style={styles.detailRow}>
                                <View style={styles.detailIconContainer}>
                                    <Ionicons name="information-circle" size={scale(20)} color={colors.info.main} />
                                </View>
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>ID Versement</Text>
                                    <Text style={styles.detailValue}>#{installment.installmentId}</Text>
                                </View>
                            </View>
                        </View> */}
                    </CardBody>
                </Card>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    {!installment.isPaid ? (
                        <>
                            <PrimaryButton
                                title={isOverdue ? "Payer (En retard)" : "Payer maintenant"}
                                onPress={handlePay}
                                style={StyleSheet.flatten([styles.payButton, isOverdue ? styles.urgentPayButton : undefined])}
                                leftIcon="card"
                            />
                        </>
                    ) : (
                        <PrimaryButton
                            title="Fermer"
                            onPress={onClose}
                            style={StyleSheet.flatten([styles.singleButton, { backgroundColor: colors.error.main }])}

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
        paddingTop: spacingY._20,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacingY._20,
    },
    childInfo: {
        flex: 1,
    },
    childName: {
        fontSize: scaleFont(18),
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: spacingY._5,
    },
    schoolName: {
        fontSize: scaleFont(14),
        color: colors.text.secondary,
        marginBottom: spacingY._3,
    },
    className: {
        fontSize: scaleFont(13),
        color: colors.text.secondary,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacingX._12,
        paddingVertical: spacingY._7,
        borderRadius: 20,
        gap: spacingX._5,
    },
    statusText: {
        fontSize: scaleFont(12),
        fontWeight: '600',
    },

    // Details Card
    detailsCard: {
        marginBottom: spacingY._20,
    },
    detailSection: {
        marginBottom: spacingY._15,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacingY._12,
    },
    totalRow: {
        paddingTop: spacingY._10,
        borderTopWidth: 1,
        borderTopColor: colors.border?.light || '#e1e5e9',
        marginTop: spacingY._5,
    },
    detailIconContainer: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: colors.background.paper,
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
        marginBottom: spacingY._3,
    },
    detailValue: {
        fontSize: scaleFont(16),
        fontWeight: '600',
        color: colors.text.primary,
    },
    totalValue: {
        fontSize: scaleFont(18),
        fontWeight: 'bold',
        color: colors.primary.main,
    },
    overdueNote: {
        fontSize: scaleFont(11),
        color: colors.error.main,
        marginTop: spacingY._3,
        fontWeight: '500',
    },

    // Actions
    actions: {
        flexDirection: 'row',
        gap: spacingX._30,
    },
    closeButton: {
        flex: 1,
    },
    payButton: {
        flex: 2,
    },
    urgentPayButton: {
        // You can override the primary color here if needed
    },
    singleButton: {
        flex: 1,
    },
});