import { BottomModal } from '@/components/BottomModal/BottomModal';
import { CustomButton } from '@/components/Button/CustomPressable';
import { colors, radius, shadows, spacingX, spacingY } from '@/constants/theme';
import { MerchandisePaymentHistoryDto } from '@/models/PaymentsServicesInterfaces';
import { scale, scaleFont, SCREEN_HEIGHT } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export interface MerchandiseDetailModalProps {
    visible: boolean;
    onClose: () => void;
    payment: MerchandisePaymentHistoryDto | null;
    onExportPDF?: (payment: MerchandisePaymentHistoryDto) => void;
}

export const MerchandiseDetailModal: React.FC<MerchandiseDetailModalProps> = ({
    visible,
    onClose,
    payment,
    onExportPDF,
}) => {
    if (!payment) return null;

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
                weekday: 'long',
                year: 'numeric',
                month: 'long',
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
                second: '2-digit',
            });
        } catch {
            return '';
        }
    };

    const handleExportPDF = () => {
        onExportPDF?.(payment);
    };

    return (
        <BottomModal
            visible={visible}
            onClose={onClose}
            title="Détails du paiement"
            subtitle="Articles scolaires"
            height={SCREEN_HEIGHT * 0.85}
            enableDragToExpand={true}
            enableSwipeDown={true}
        >
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    {/* Status Badge */}
                    <View style={styles.statusContainer}>
                        <View style={[
                            styles.statusBadge,
                            payment.fK_StatusId === 8 ? styles.statusSuccess : styles.statusPending
                        ]}>
                            <Ionicons
                                name={payment.fK_StatusId === 8 ? "checkmark-circle" : "time"}
                                size={scale(20)}
                                color={payment.fK_StatusId === 8 ? colors.success.main : colors.warning.main}
                            />
                            <Text style={[
                                styles.statusText,
                                { color: payment.fK_StatusId === 8 ? colors.success.main : colors.warning.main }
                            ]}>
                                {payment.fK_StatusId === 8 ? 'Paiement réussi' : 'En attente'}
                            </Text>
                        </View>
                    </View>

                    {/* Purchase Summary */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Résumé de l&apos;achat</Text>
                        <View style={styles.sectionContent}>
                            <View style={styles.summaryRow}>
                                <View style={styles.summaryIconContainer}>
                                    <Ionicons name="cart-outline" size={scale(22)} color={colors.primary.main} />
                                </View>
                                <View style={styles.summaryTextContainer}>
                                    <Text style={styles.summaryValue}>
                                        {payment.totalItems} article{payment.totalItems > 1 ? 's' : ''}
                                    </Text>
                                    <Text style={styles.summaryLabel}>
                                        Quantité totale: {payment.totalQuantity}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Merchandise Items */}
                    {payment.merchandiseItems && payment.merchandiseItems.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Articles commandés</Text>
                            <View style={styles.itemsContainer}>
                                {payment.merchandiseItems.map((item, index) => (
                                    <View key={item.transactionItemId} style={styles.itemCard}>
                                        <View style={styles.itemHeader}>
                                            <View style={styles.itemIconContainer}>
                                                <Ionicons
                                                    name="pricetag-outline"
                                                    size={scale(18)}
                                                    color={colors.primary.main}
                                                />
                                            </View>
                                            <View style={styles.itemInfo}>
                                                <Text style={styles.itemName}>
                                                    {item.schoolMerchandiseName}
                                                </Text>
                                                <Text style={styles.itemPrice}>
                                                    {formatCurrency(item.schoolMerchandisePrice)} / unité
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.itemDetails}>
                                            <View style={styles.itemDetailRow}>
                                                <Text style={styles.itemDetailLabel}>Quantité</Text>
                                                <Text style={styles.itemDetailValue}>× {item.quantity}</Text>
                                            </View>
                                            <View style={styles.itemDetailRow}>
                                                <Text style={styles.itemDetailLabel}>Total</Text>
                                                <Text style={styles.itemDetailValue}>
                                                    {formatCurrency(item.totalAmount)}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Payment Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Détails du paiement</Text>
                        <View style={styles.sectionContent}>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Total payé</Text>
                                <Text style={styles.totalValue}>
                                    {formatCurrency(payment.amountPaid)}
                                </Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Ionicons name="card-outline" size={scale(18)} color={colors.text.secondary} />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Méthode de paiement</Text>
                                    <Text style={styles.infoValue}>{payment.paymentMethod}</Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <Ionicons name="receipt-outline" size={scale(18)} color={colors.text.secondary} />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Référence</Text>
                                    <Text style={styles.infoValue}>
                                        {payment.transactionReference || 'N/A'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <Ionicons name="time-outline" size={scale(18)} color={colors.text.secondary} />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Date et heure</Text>
                                    <Text style={styles.infoValue}>
                                        {formatDate(payment.paidDate)} à {formatTime(payment.paidDate)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Agent Information */}
                    {payment.processedByAgent && payment.agentFullName && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Agent collecteur</Text>
                            <View style={styles.sectionContent}>
                                <View style={styles.infoRow}>
                                    <Ionicons name="person-outline" size={scale(18)} color={colors.text.secondary} />
                                    <View style={styles.infoTextContainer}>
                                        <Text style={styles.infoLabel}>Nom de l&apos;agent</Text>
                                        <Text style={styles.infoValue}>{payment.agentFullName}</Text>
                                    </View>
                                </View>

                                {payment.agentPhoneNumber && (
                                    <View style={styles.infoRow}>
                                        <Ionicons name="call-outline" size={scale(18)} color={colors.text.secondary} />
                                        <View style={styles.infoTextContainer}>
                                            <Text style={styles.infoLabel}>Téléphone</Text>
                                            <Text style={styles.infoValue}>{payment.agentPhoneNumber}</Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    {/* Export Button */}
                    <View style={styles.actionSection}>
                        <CustomButton
                            title="Exporter en PDF"
                            onPress={handleExportPDF}
                            variant="filled"
                            color="primary"
                            leftIcon="document-text"
                            fullWidth
                            shadow
                        />
                    </View>
                </View>
            </ScrollView>
        </BottomModal>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    container: {
        paddingHorizontal: spacingX._15,
        paddingBottom: spacingY._30,
    },
    statusContainer: {
        alignItems: 'center',
        marginVertical: spacingY._20,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingX._7,
        paddingHorizontal: spacingX._20,
        paddingVertical: spacingY._10,
        borderRadius: radius.full,
    },
    statusSuccess: {
        backgroundColor: colors.success.light + '20',
    },
    statusPending: {
        backgroundColor: colors.warning.light + '20',
    },
    statusText: {
        fontSize: scaleFont(16),
        fontWeight: '700',
    },
    section: {
        marginBottom: spacingY._25,
    },
    sectionTitle: {
        fontSize: scaleFont(14),
        fontWeight: '700',
        color: colors.text.disabled,
        marginBottom: spacingY._12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    sectionContent: {
        backgroundColor: colors.surface.main,
        borderRadius: radius._16,
        padding: spacingX._20,
        ...shadows.sm,
        borderWidth: 1,
        borderColor: colors.border.light,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingX._15,
    },
    summaryIconContainer: {
        width: scale(44),
        height: scale(44),
        borderRadius: radius._12,
        backgroundColor: colors.primary.light + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryTextContainer: {
        flex: 1,
    },
    summaryValue: {
        fontSize: scaleFont(18),
        fontWeight: '800',
        color: colors.text.primary,
        marginBottom: spacingY._2,
    },
    summaryLabel: {
        fontSize: scaleFont(13),
        color: colors.text.secondary,
        fontWeight: '500',
    },
    itemsContainer: {
        gap: spacingY._12,
    },
    itemCard: {
        backgroundColor: colors.surface.main,
        borderRadius: radius._16,
        padding: spacingX._15,
        borderWidth: 1,
        borderColor: colors.border.light,
        ...shadows.xs,
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacingY._12,
    },
    itemIconContainer: {
        width: scale(40),
        height: scale(40),
        borderRadius: radius._10,
        backgroundColor: colors.background.default,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacingX._12,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: scaleFont(15),
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: spacingY._2,
    },
    itemPrice: {
        fontSize: scaleFont(12),
        color: colors.text.secondary,
        fontWeight: '500',
    },
    itemDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: spacingY._12,
        borderTopWidth: 1,
        borderTopColor: colors.border.light,
    },
    itemDetailRow: {
        flex: 1,
    },
    itemDetailLabel: {
        fontSize: scaleFont(11),
        color: colors.text.disabled,
        fontWeight: '600',
        marginBottom: spacingY._2,
    },
    itemDetailValue: {
        fontSize: scaleFont(14),
        fontWeight: '700',
        color: colors.text.primary,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: spacingY._15,
        marginBottom: spacingY._15,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    totalLabel: {
        fontSize: scaleFont(16),
        fontWeight: '700',
        color: colors.text.primary,
    },
    totalValue: {
        fontSize: scaleFont(20),
        fontWeight: '800',
        color: colors.primary.main,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingX._12,
        marginBottom: spacingY._12,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: scaleFont(11),
        color: colors.text.disabled,
        fontWeight: '600',
        marginBottom: spacingY._2,
    },
    infoValue: {
        fontSize: scaleFont(14),
        fontWeight: '600',
        color: colors.text.primary,
    },
    actionSection: {
        marginTop: spacingY._10,
    },
});
