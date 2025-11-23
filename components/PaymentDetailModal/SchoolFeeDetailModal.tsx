import { BottomModal } from '@/components/BottomModal/BottomModal';
import { PrimaryButton } from '@/components/Button/CustomPressable';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { SchoolFeesPaymentHistoryDto } from '@/models/PaymentsServicesInterfaces';
import { scale, scaleFont, SCREEN_HEIGHT } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export interface SchoolFeeDetailModalProps {
    visible: boolean;
    onClose: () => void;
    payment: SchoolFeesPaymentHistoryDto | null;
    onExportPDF?: (payment: SchoolFeesPaymentHistoryDto) => void;
}

export const SchoolFeeDetailModal: React.FC<SchoolFeeDetailModalProps> = ({
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
            subtitle="Frais scolaires"
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

                    {/* Student Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{"Informations de l'élève"}</Text>
                        <View style={styles.sectionContent}>
                            <View style={styles.infoRow}>
                                <Ionicons name="person-outline" size={scale(16)} color={colors.text.secondary} />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Nom complet</Text>
                                    <Text style={styles.infoValue}>{payment.childFullName}</Text>
                                </View>
                            </View>

                            {payment.dateOfBirth && (
                                <View style={styles.infoRow}>
                                    <Ionicons name="calendar-outline" size={scale(16)} color={colors.text.secondary} />
                                    <View style={styles.infoTextContainer}>
                                        <Text style={styles.infoLabel}>Date de naissance</Text>
                                        <Text style={styles.infoValue}>
                                            {formatDate(payment.dateOfBirth)}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {payment.fatherName && (
                                <View style={styles.infoRow}>
                                    <Ionicons name="man-outline" size={scale(16)} color={colors.text.secondary} />
                                    <View style={styles.infoTextContainer}>
                                        <Text style={styles.infoLabel}>Nom du père</Text>
                                        <Text style={styles.infoValue}>{payment.fatherName}</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* School Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Informations scolaires</Text>
                        <View style={styles.sectionContent}>
                            <View style={styles.infoRow}>
                                <Ionicons name="school-outline" size={scale(16)} color={colors.text.secondary} />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>École</Text>
                                    <Text style={styles.infoValue}>{payment.schoolName}</Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <Ionicons name="library-outline" size={scale(16)} color={colors.text.secondary} />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Classe</Text>
                                    <Text style={styles.infoValue}>{payment.schoolGradeName}</Text>
                                </View>
                            </View>

                            {payment.schoolGradeDescription && (
                                <View style={styles.descriptionContainer}>
                                    <Text style={styles.descriptionText}>
                                        {payment.schoolGradeDescription}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Payment Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Détails du paiement</Text>
                        <View style={styles.sectionContent}>
                            <View style={styles.amountRow}>
                                <Text style={styles.amountLabel}>Montant du versement</Text>
                                <Text style={styles.amountValue}>
                                    {formatCurrency(payment.installmentAmount)}
                                </Text>
                            </View>

                            {payment.lateFee && payment.lateFee > 0 && (
                                <View style={styles.lateFeeRow}>
                                    <Text style={styles.lateFeeLabel}>Frais de retard</Text>
                                    <Text style={styles.lateFeeValue}>
                                        + {formatCurrency(payment.lateFee)}
                                    </Text>
                                </View>
                            )}

                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Total payé</Text>
                                <Text style={styles.totalValue}>
                                    {formatCurrency(payment.totalPaid)}
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

                            <View style={styles.infoRow}>
                                <Ionicons name="hourglass-outline" size={scale(16)} color={colors.text.secondary} />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>{"Date d'échéance"}</Text>
                                    <Text style={styles.infoValue}>
                                        {formatDate(payment.dueDate)}
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
                                        <Text style={styles.infoLabel}>{"Nom de l'agent"}</Text>
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
    descriptionContainer: {
        paddingTop: spacingY._7,
        borderTopWidth: 1,
        borderTopColor: colors.border?.light || '#e1e5e9',
    },
    descriptionText: {
        fontSize: scaleFont(13),
        color: colors.text.secondary,
        lineHeight: scaleFont(20),
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: spacingY._7,
    },
    amountLabel: {
        fontSize: scaleFont(13),
        color: colors.text.secondary,
    },
    amountValue: {
        fontSize: scaleFont(16),
        fontWeight: '600',
        color: colors.text.primary,
    },
    lateFeeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: spacingY._7,
    },
    lateFeeLabel: {
        fontSize: scaleFont(13),
        color: colors.error.main,
    },
    lateFeeValue: {
        fontSize: scaleFont(14),
        fontWeight: '600',
        color: colors.error.main,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: spacingY._10,
        paddingBottom: spacingY._10,
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
