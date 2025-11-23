import { BottomModal } from '@/components/BottomModal/BottomModal';
import { PrimaryButton } from '@/components/Button/CustomPressable';
import { colors, spacingX, spacingY } from '@/constants/theme';
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
        >
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    {/* Status Badge */}
                    <View style={styles.statusContainer}>
                        <View style={[
                            styles.statusBadge,
                            payment.fK_StatusId === 8 && styles.statusSuccess
                        ]}>
                            <Ionicons
                                name={payment.fK_StatusId === 8 ? "checkmark-circle" : "time"}
                                size={scale(24)}
                                color={colors.background.default}
                            />
                            <Text style={styles.statusText}>
                                {payment.fK_StatusId === 8 ? 'Paiement réussi' : 'En attente'}
                            </Text>
                        </View>
                    </View>

                    {/* Purchase Summary */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Résumé de l&apos;achat</Text>
                        <View style={styles.sectionContent}>
                            <View style={styles.summaryRow}>
                                <Ionicons name="cart-outline" size={scale(20)} color={colors.primary.main} />
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
                                                    name="pricetag"
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

                            <View style={styles.divider} />

                            <View style={styles.infoRow}>
                                <Ionicons name="card-outline" size={scale(16)} color={colors.text.secondary} />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Méthode de paiement</Text>
                                    <Text style={styles.infoValue}>{payment.paymentMethod}</Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <Ionicons name="receipt-outline" size={scale(16)} color={colors.text.secondary} />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Référence</Text>
                                    <Text style={styles.infoValue}>
                                        {payment.transactionReference || 'N/A'}
                                    </Text>
                                </View>
                            </View>

                            {payment.transactionMapId && (
                                <View style={styles.infoRow}>
                                    <Ionicons name="qr-code-outline" size={scale(16)} color={colors.text.secondary} />
                                    <View style={styles.infoTextContainer}>
                                        <Text style={styles.infoLabel}>ID de transaction</Text>
                                        <Text style={styles.infoValue} numberOfLines={1}>
                                            {payment.transactionMapId}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            <View style={styles.infoRow}>
                                <Ionicons name="time-outline" size={scale(16)} color={colors.text.secondary} />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Date et heure</Text>
                                    <Text style={styles.infoValue}>
                                        {formatDate(payment.paidDate)}
                                    </Text>
                                    <Text style={styles.infoSubValue}>
                                        à {formatTime(payment.paidDate)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Agent Information (if applicable) */}
                    {payment.processedByAgent && payment.agentFullName && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Agent collecteur</Text>
                            <View style={styles.sectionContent}>
                                <View style={styles.infoRow}>
                                    <Ionicons name="briefcase-outline" size={scale(16)} color={colors.text.secondary} />
                                    <View style={styles.infoTextContainer}>
                                        <Text style={styles.infoLabel}>Nom de l&apos;agent</Text>
                                        <Text style={styles.infoValue}>{payment.agentFullName}</Text>
                                    </View>
                                </View>

                                {payment.agentPhoneNumber && (
                                    <View style={styles.infoRow}>
                                        <Ionicons name="call-outline" size={scale(16)} color={colors.text.secondary} />
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
                        <PrimaryButton
                            title="📄 Exporter en PDF"
                            onPress={handleExportPDF}
                            style={styles.exportButton}
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
        paddingBottom: spacingY._20,
    },
    statusContainer: {
        alignItems: 'center',
        marginBottom: spacingY._20,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingX._10,
        paddingHorizontal: spacingX._20,
        paddingVertical: spacingY._12,
        backgroundColor: colors.warning.light,
        borderRadius: 50,
    },
    statusSuccess: {
        backgroundColor: colors.success.light,
    },
    statusText: {
        fontSize: scaleFont(16),
        fontWeight: '700',
        color: colors.background.default,
    },
    section: {
        marginBottom: spacingY._20,
    },
    sectionTitle: {
        fontSize: scaleFont(14),
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: spacingY._12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionContent: {
        backgroundColor: colors.background.default,
        borderRadius: 12,
        padding: spacingX._15,
        gap: spacingY._12,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingX._15,
    },
    summaryTextContainer: {
        flex: 1,
    },
    summaryValue: {
        fontSize: scaleFont(18),
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: spacingY._3,
    },
    summaryLabel: {
        fontSize: scaleFont(13),
        color: colors.text.secondary,
    },
    itemsContainer: {
        gap: spacingY._10,
    },
    itemCard: {
        backgroundColor: colors.background.default,
        borderRadius: 12,
        padding: spacingX._15,
        borderWidth: 1,
        borderColor: colors.border?.light || '#e1e5e9',
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacingY._10,
    },
    itemIconContainer: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: colors.primary.light + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacingX._12,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: scaleFont(15),
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacingY._3,
    },
    itemPrice: {
        fontSize: scaleFont(12),
        color: colors.text.secondary,
    },
    itemDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: spacingY._10,
        borderTopWidth: 1,
        borderTopColor: colors.border?.light || '#e1e5e9',
    },
    itemDetailRow: {
        flex: 1,
    },
    itemDetailLabel: {
        fontSize: scaleFont(11),
        color: colors.text.secondary,
        marginBottom: spacingY._3,
    },
    itemDetailValue: {
        fontSize: scaleFont(14),
        fontWeight: '600',
        color: colors.text.primary,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacingY._10,
        borderTopWidth: 2,
        borderBottomWidth: 1,
        borderTopColor: colors.border?.main || '#d1d5db',
        borderBottomColor: colors.border?.light || '#e1e5e9',
    },
    totalLabel: {
        fontSize: scaleFont(15),
        fontWeight: '700',
        color: colors.text.primary,
    },
    totalValue: {
        fontSize: scaleFont(18),
        fontWeight: '700',
        color: colors.primary.main,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border?.light || '#e1e5e9',
        marginVertical: spacingY._7,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacingX._10,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: scaleFont(12),
        color: colors.text.secondary,
        marginBottom: spacingY._3,
    },
    infoValue: {
        fontSize: scaleFont(14),
        fontWeight: '500',
        color: colors.text.primary,
    },
    infoSubValue: {
        fontSize: scaleFont(12),
        color: colors.text.secondary,
        marginTop: spacingY._3,
    },
    actionSection: {
        marginTop: spacingY._10,
    },
    exportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacingX._10,
    },
});
