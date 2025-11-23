import { Card } from '@/components/Card/CardComponent';
import { colors, radius, spacingX, spacingY } from '@/constants/theme';
import { MerchandisePaymentHistoryDto } from '@/models/PaymentsServicesInterfaces';
import { scale, scaleFont } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from 'react-native';

export interface MerchandiseHistoryCardProps {
    payment: MerchandisePaymentHistoryDto;
    onPress?: (payment: MerchandisePaymentHistoryDto) => void;
    style?: ViewStyle;
}

export const MerchandiseHistoryCard: React.FC<MerchandiseHistoryCardProps> = ({
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
                {/* Header with items count and status */}
                <View style={styles.header}>
                    <View style={styles.itemsInfo}>
                        <View style={styles.iconContainer}>
                            <Ionicons
                                name="cart-outline"
                                size={scale(20)}
                                color={colors.primary.main}
                            />
                        </View>
                        <View style={styles.itemsTextContainer}>
                            <Text style={styles.itemsCount}>
                                {payment.totalItems} article{payment.totalItems > 1 ? 's' : ''}
                            </Text>
                            <Text style={styles.quantityText}>
                                Quantité totale: {payment.totalQuantity}
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

                {/* Merchandise items preview */}
                {payment.merchandiseItems && payment.merchandiseItems.length > 0 && (
                    <View style={styles.itemsPreview}>
                        {payment.merchandiseItems.slice(0, 2).map((item, index) => (
                            <View key={item.transactionItemId} style={styles.itemPreviewRow}>
                                <Ionicons
                                    name="pricetag-outline"
                                    size={scale(12)}
                                    color={colors.text.secondary}
                                />
                                <Text style={styles.itemPreviewText} numberOfLines={1}>
                                    {item.schoolMerchandiseName} × {item.quantity}
                                </Text>
                            </View>
                        ))}
                        {payment.totalItems > 2 && (
                            <Text style={styles.moreItemsText}>
                                +{payment.totalItems - 2} article{payment.totalItems - 2 > 1 ? 's' : ''} de plus
                            </Text>
                        )}
                    </View>
                )}

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
    itemsInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: spacingX._10,
    },
    iconContainer: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: colors.primary.light + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacingX._10,
    },
    itemsTextContainer: {
        flex: 1,
    },
    itemsCount: {
        fontSize: scaleFont(16),
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacingY._3,
    },
    quantityText: {
        fontSize: scaleFont(12),
        color: colors.text.secondary,
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
    itemsPreview: {
        backgroundColor: colors.background.paper,
        borderRadius: radius._10,
        padding: spacingX._10,
        gap: spacingY._5,
    },
    itemPreviewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingX._7,
    },
    itemPreviewText: {
        fontSize: scaleFont(12),
        color: colors.text.primary,
        flex: 1,
    },
    moreItemsText: {
        fontSize: scaleFont(11),
        color: colors.primary.main,
        fontWeight: '500',
        marginTop: spacingY._3,
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
