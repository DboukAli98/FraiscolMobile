import { BottomModal } from '@/components/BottomModal/BottomModal';
import { CustomButton } from '@/components/Button/CustomPressable';
import { colors, radius, shadows, spacingX, spacingY } from '@/constants/theme';
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
    onSharePDF?: (payment: SchoolFeesPaymentHistoryDto) => void;
    onDownloadPDF?: (payment: SchoolFeesPaymentHistoryDto) => void;
    /** @deprecated Use onSharePDF instead */
    onExportPDF?: (payment: SchoolFeesPaymentHistoryDto) => void;
}

export const SchoolFeeDetailModal: React.FC<SchoolFeeDetailModalProps> = ({
    visible,
    onClose,
    payment,
    onSharePDF,
    onDownloadPDF,
    onExportPDF,
}) => {
    if (!payment) return null;

    const handleSharePDF = () => {
        // Support legacy onExportPDF prop
        if (onSharePDF) {
            onSharePDF(payment);
        } else if (onExportPDF) {
            onExportPDF(payment);
        }
    };

    const handleDownloadPDF = () => {
        onDownloadPDF?.(payment);
    };

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

    return (
        <BottomModal
            visible={visible}
            onClose={onClose}
            title="Détails du paiement"
            subtitle="Frais scolaires"
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

                    {/* Student Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{"Informations de l'élève"}</Text>
                        <View style={styles.sectionContent}>
                            <View style={styles.infoRow}>
                                <Ionicons name="person-outline" size={scale(18)} color={colors.text.secondary} />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Nom complet</Text>
                                    <Text style={styles.infoValue}>{payment.childFullName}</Text>
                                </View>
                            </View>

                            {payment.dateOfBirth && (
                                <View style={styles.infoRow}>
                                    <Ionicons name="calendar-outline" size={scale(18)} color={colors.text.secondary} />
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
                                    <Ionicons name="man-outline" size={scale(18)} color={colors.text.secondary} />
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
                                <Ionicons name="school-outline" size={scale(18)} color={colors.text.secondary} />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>École</Text>
                                    <Text style={styles.infoValue}>{payment.schoolName}</Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <Ionicons name="library-outline" size={scale(18)} color={colors.text.secondary} />
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

                            <View style={styles.infoRow}>
                                <Ionicons name="hourglass-outline" size={scale(18)} color={colors.text.secondary} />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>{"Date d'échéance"}</Text>
                                    <Text style={styles.infoValue}>
                                        {formatDate(payment.dueDate)}
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
                                        <Text style={styles.infoLabel}>{"Nom de l'agent"}</Text>
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

                    {/* PDF Actions */}
                    <View style={styles.actionSection}>
                        <View style={styles.actionButtonsRow}>
                            {onDownloadPDF && (
                                <CustomButton
                                    title="Télécharger"
                                    onPress={handleDownloadPDF}
                                    variant="outlined"
                                    color="primary"
                                    leftIcon="download-outline"
                                    style={styles.actionButton}
                                />
                            )}
                            <CustomButton
                                title="Partager"
                                onPress={handleSharePDF}
                                variant="filled"
                                color="primary"
                                leftIcon="share-outline"
                                style={styles.actionButton}
                                shadow
                            />
                        </View>
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
    descriptionContainer: {
        paddingTop: spacingY._10,
        borderTopWidth: 1,
        borderTopColor: colors.border.light,
        marginTop: spacingY._5,
    },
    descriptionText: {
        fontSize: scaleFont(13),
        color: colors.text.secondary,
        lineHeight: scaleFont(20),
        fontWeight: '500',
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacingY._8,
    },
    amountLabel: {
        fontSize: scaleFont(13),
        color: colors.text.secondary,
        fontWeight: '500',
    },
    amountValue: {
        fontSize: scaleFont(16),
        fontWeight: '700',
        color: colors.text.primary,
    },
    lateFeeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacingY._8,
    },
    lateFeeLabel: {
        fontSize: scaleFont(13),
        color: colors.error.main,
        fontWeight: '600',
    },
    lateFeeValue: {
        fontSize: scaleFont(14),
        fontWeight: '700',
        color: colors.error.main,
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
    actionSection: {
        marginTop: spacingY._10,
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: spacingX._12,
    },
    actionButton: {
        flex: 1,
    },
});
