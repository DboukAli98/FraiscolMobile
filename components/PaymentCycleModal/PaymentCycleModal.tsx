// components/PaymentCycleModal/PaymentCycleModal.tsx
import { BottomModal } from '@/components/BottomModal/BottomModal';
import { CustomButton } from '@/components/Button/CustomPressable';
import { colors, radius, shadows, spacingX, spacingY } from '@/constants/theme';
import { scaleFont, SCREEN_HEIGHT } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface PaymentCycle {
    paymentCycleId: number;
    paymentCycleName: string;
    paymentCycleDescription: string;
    fK_SchoolGradeSectionId: number;
    paymentCycleType: number;
    intervalCount: number | null;
    intervalUnit: number | null;
    installmentAmounts: string | null;
    planStartDate: string;
    createdOn: string;
    modifiedOn: string | null;
}

interface PaymentCycleModalProps {
    visible: boolean;
    onClose: () => void;
    paymentCycles: PaymentCycle[];
    isLoading: boolean;
    onSelectCycle: (cycle: PaymentCycle) => void;
    selectedCycleId?: number;
}

export const PaymentCycleModal: React.FC<PaymentCycleModalProps> = ({
    visible,
    onClose,
    paymentCycles,
    isLoading,
    onSelectCycle,
    selectedCycleId,
}) => {
    const [selectedCycle, setSelectedCycle] = useState<PaymentCycle | null>(null);

    useEffect(() => {
        if (selectedCycleId && paymentCycles.length > 0) {
            const cycle = paymentCycles.find(c => c.paymentCycleId === selectedCycleId);
            setSelectedCycle(cycle || null);
        }
    }, [selectedCycleId, paymentCycles]);

    const getPaymentCycleTypeText = (type: number) => {
        switch (type) {
            case 0: return 'Paiement complet';
            case 1: return 'Mensuel';
            case 2: return 'Trimestriel';
            case 3: return 'Hebdomadaire';
            case 4: return 'Personnalisé';
            default: return 'Inconnu';
        }
    };

    const getPaymentCycleIcon = (type: number) => {
        switch (type) {
            case 0: return 'wallet-outline';
            case 1: return 'calendar-outline';
            case 2: return 'calendar-number-outline';
            case 3: return 'today-outline';
            case 4: return 'settings-outline';
            default: return 'help-outline';
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    const handleCycleSelect = (cycle: PaymentCycle) => {
        setSelectedCycle(cycle);
    };

    const handleConfirmSelection = () => {
        if (selectedCycle) {
            onSelectCycle(selectedCycle);
            onClose();
        }
    };

    const renderPaymentCycleItem = ({ item }: { item: PaymentCycle }) => {
        const isSelected = selectedCycle?.paymentCycleId === item.paymentCycleId;

        return (
            <TouchableOpacity
                style={[
                    styles.cycleItem,
                    isSelected && styles.cycleItemSelected
                ]}
                onPress={() => handleCycleSelect(item)}
            >
                <View style={styles.cycleHeader}>
                    <View style={styles.cycleIconContainer}>
                        <Ionicons
                            name={getPaymentCycleIcon(item.paymentCycleType) as any}
                            size={24}
                            color={isSelected ? colors.primary.main : colors.text.secondary}
                        />
                    </View>
                    <View style={styles.cycleInfo}>
                        <Text style={[
                            styles.cycleName,
                            isSelected && styles.cycleNameSelected
                        ]}>
                            {item.paymentCycleName}
                        </Text>
                        <Text style={styles.cycleType}>
                            {getPaymentCycleTypeText(item.paymentCycleType)}
                        </Text>
                    </View>
                    <View style={styles.cycleSelection}>
                        <View style={[
                            styles.radioButton,
                            isSelected && styles.radioButtonSelected
                        ]}>
                            {isSelected && (
                                <View style={styles.radioButtonInner} />
                            )}
                        </View>
                    </View>
                </View>

                {item.paymentCycleDescription && (
                    <Text style={styles.cycleDescription}>
                        {item.paymentCycleDescription}
                    </Text>
                )}

                <View style={styles.cycleDetails}>
                    <Text style={styles.cycleDetailText}>
                        <Text style={styles.cycleDetailLabel}>Début du plan: </Text>
                        {formatDate(item.planStartDate)}
                    </Text>

                    {item.installmentAmounts && (
                        <Text style={styles.cycleDetailText}>
                            <Text style={styles.cycleDetailLabel}>Montants personnalisés: </Text>
                            Oui
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <BottomModal
            visible={visible}
            onClose={onClose}
            title="Cycle de paiement"
            subtitle="Choisissez le mode de paiement pour cet enfant"
            height={SCREEN_HEIGHT * 0.85}
            enableDragToExpand={true}
            enableSwipeDown={true}
        >
            <View style={styles.modalContent}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary.main} />
                        <Text style={styles.loadingText}>Chargement des cycles...</Text>
                    </View>
                ) : paymentCycles.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="document-text-outline" size={48} color={colors.text.disabled} />
                        </View>
                        <Text style={styles.emptyTitle}>Aucun cycle disponible</Text>
                        <Text style={styles.emptySubtitle}>
                            {"Aucun cycle de paiement n'est configuré pour cette classe."}
                        </Text>
                    </View>
                ) : (
                    <>
                        <FlatList
                            data={paymentCycles}
                            renderItem={renderPaymentCycleItem}
                            keyExtractor={(item) => item.paymentCycleId.toString()}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContainer}
                        />

                        <View style={styles.footer}>
                            <CustomButton
                                title="Confirmer la sélection"
                                onPress={handleConfirmSelection}
                                disabled={!selectedCycle}
                                fullWidth
                                variant="filled"
                                color="primary"
                                shadow
                                leftIcon="checkmark-circle"
                            />
                        </View>
                    </>
                )}
            </View>
        </BottomModal>
    );
};

const styles = StyleSheet.create({
    modalContent: {
        flex: 1,
        paddingHorizontal: spacingX._15,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: spacingY._10,
        fontSize: scaleFont(14),
        color: colors.text.secondary,
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacingX._30,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.surface.main,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacingY._20,
    },
    emptyTitle: {
        fontSize: scaleFont(18),
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: spacingY._10,
    },
    emptySubtitle: {
        fontSize: scaleFont(14),
        color: colors.text.secondary,
        textAlign: 'center',
        lineHeight: scaleFont(20),
    },
    listContainer: {
        paddingVertical: spacingY._10,
    },
    cycleItem: {
        backgroundColor: colors.surface.main,
        borderRadius: radius._12,
        padding: spacingX._15,
        marginBottom: spacingY._12,
        borderWidth: 1.5,
        borderColor: colors.border.main,
        ...shadows.sm,
    },
    cycleItemSelected: {
        borderColor: colors.primary.main,
        backgroundColor: colors.primary.light + '08',
        ...shadows.md,
    },
    cycleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacingY._10,
    },
    cycleIconContainer: {
        width: 44,
        height: 44,
        borderRadius: radius._10,
        backgroundColor: colors.primary.light + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacingX._12,
    },
    cycleInfo: {
        flex: 1,
    },
    cycleName: {
        fontSize: scaleFont(16),
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: spacingY._2,
    },
    cycleNameSelected: {
        color: colors.primary.main,
    },
    cycleType: {
        fontSize: scaleFont(14),
        color: colors.text.secondary,
        fontWeight: '500',
    },
    cycleSelection: {
        marginLeft: spacingX._10,
    },
    radioButton: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: colors.text.disabled,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonSelected: {
        borderColor: colors.primary.main,
    },
    radioButtonInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.primary.main,
    },
    cycleDescription: {
        fontSize: scaleFont(13),
        color: colors.text.secondary,
        marginBottom: spacingY._12,
        lineHeight: scaleFont(18),
    },
    cycleDetails: {
        paddingTop: spacingY._12,
        borderTopWidth: 1,
        borderTopColor: colors.border.light,
    },
    cycleDetailText: {
        fontSize: scaleFont(12),
        color: colors.text.secondary,
        marginBottom: spacingY._4,
    },
    cycleDetailLabel: {
        fontWeight: '600',
        color: colors.text.primary,
    },
    footer: {
        paddingVertical: spacingY._20,
        borderTopWidth: 1,
        borderTopColor: colors.border.light,
        backgroundColor: colors.background.paper,
    },
});