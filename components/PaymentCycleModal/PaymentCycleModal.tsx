// components/PaymentCycleModal/PaymentCycleModal.tsx
import { BottomModal } from '@/components/BottomModal/BottomModal';
import { CustomButton } from '@/components/Button/CustomPressable';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { scaleFont } from '@/utils/stylings';
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
            title="Sélectionner un cycle de paiement"
            subtitle="Choisissez le mode de paiement pour cet enfant"
            // height="80%"
            enableDragToExpand={false}
        >
            <View style={styles.modalContent}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary.main} />
                        <Text style={styles.loadingText}>Chargement des cycles de paiement...</Text>
                    </View>
                ) : paymentCycles.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-outline" size={64} color={colors.text.disabled} />
                        <Text style={styles.emptyTitle}>Aucun cycle de paiement</Text>
                        <Text style={styles.emptySubtitle}>
                            {"Aucun cycle de paiement n'est disponible pour cette classe."}
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
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacingX._30,
    },
    emptyTitle: {
        fontSize: scaleFont(18),
        fontWeight: '600',
        color: colors.text.primary,
        marginTop: spacingY._20,
        marginBottom: spacingY._10,
    },
    emptySubtitle: {
        fontSize: scaleFont(14),
        color: colors.text.secondary,
        textAlign: 'center',
        lineHeight: scaleFont(20),
    },
    listContainer: {
        paddingBottom: spacingY._20,
    },
    cycleItem: {
        backgroundColor: colors.background.paper,
        borderRadius: 12,
        padding: spacingX._15,
        marginBottom: spacingY._10,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    cycleItemSelected: {
        borderColor: colors.primary.main,
        backgroundColor: colors.primary.light + '10',
    },
    cycleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacingY._10,
    },
    cycleIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.background.default,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacingX._12,
    },
    cycleInfo: {
        flex: 1,
    },
    cycleName: {
        fontSize: scaleFont(16),
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacingY._3,
    },
    cycleNameSelected: {
        color: colors.primary.main,
    },
    cycleType: {
        fontSize: scaleFont(13),
        color: colors.text.secondary,
    },
    cycleSelection: {
        marginLeft: spacingX._10,
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.text.disabled,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonSelected: {
        borderColor: colors.primary.main,
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary.main,
    },
    cycleDescription: {
        fontSize: scaleFont(13),
        color: colors.text.secondary,
        marginBottom: spacingY._10,
        lineHeight: scaleFont(18),
    },
    cycleDetails: {
        paddingTop: spacingY._10,
        borderTopWidth: 1,
        borderTopColor: colors.border?.light || '#e1e5e9',
    },
    cycleDetailText: {
        fontSize: scaleFont(12),
        color: colors.text.secondary,
        marginBottom: spacingY._3,
    },
    cycleDetailLabel: {
        fontWeight: '600',
        color: colors.text.primary,
    },
    footer: {
        paddingTop: spacingY._20,
        borderTopWidth: 1,
        borderTopColor: colors.border?.light || '#e1e5e9',
    },
});