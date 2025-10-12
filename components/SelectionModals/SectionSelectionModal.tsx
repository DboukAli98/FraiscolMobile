// components/SectionSelectionModal/SectionSelectionModal.tsx
import { BottomModal } from '@/components/BottomModal/BottomModal';
import { CustomButton } from '@/components/Button/CustomPressable';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { scaleFont, SCREEN_HEIGHT } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface SchoolGradeSection {
    schoolGradeSectionId: number;
    fK_SchoolId: number;
    schoolGradeName: string;
    schoolGradeDescription: string;
    schoolGradeFee: number;
    termStartDate: string;
    termEndDate: string;
    fK_StatusId: number;
    createdOn: string;
    modifiedOn: string | null;
}

interface SectionSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    sections: SchoolGradeSection[];
    isLoading: boolean;
    onSelectSection: (section: SchoolGradeSection) => void;
}

export const SectionSelectionModal: React.FC<SectionSelectionModalProps> = ({
    visible,
    onClose,
    sections,
    isLoading,
    onSelectSection,
}) => {
    const [selectedSection, setSelectedSection] = useState<SchoolGradeSection | null>(null);

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

    const handleSectionSelect = (section: SchoolGradeSection) => {
        setSelectedSection(section);
    };

    const handleConfirmSelection = () => {
        if (selectedSection) {
            onSelectSection(selectedSection);
            setSelectedSection(null);
            onClose();
        }
    };

    const renderSectionItem = ({ item }: { item: SchoolGradeSection }) => {
        const isSelected = selectedSection?.schoolGradeSectionId === item.schoolGradeSectionId;

        return (
            <TouchableOpacity
                style={[
                    styles.sectionItem,
                    isSelected && styles.sectionItemSelected
                ]}
                onPress={() => handleSectionSelect(item)}
            >
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionIconContainer}>
                        <Ionicons
                            name="library-outline"
                            size={24}
                            color={isSelected ? colors.primary.main : colors.text.secondary}
                        />
                    </View>
                    <View style={styles.sectionInfo}>
                        <Text style={[
                            styles.sectionName,
                            isSelected && styles.sectionNameSelected
                        ]}>
                            {item.schoolGradeName}
                        </Text>
                        <Text style={styles.sectionFee}>
                            {item.schoolGradeFee.toLocaleString()} CFA
                        </Text>
                    </View>
                    <View style={styles.sectionSelection}>
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

                {item.schoolGradeDescription && (
                    <Text style={styles.sectionDescription}>
                        {item.schoolGradeDescription}
                    </Text>
                )}

                <View style={styles.sectionDetails}>
                    <Text style={styles.sectionDetailText}>
                        <Text style={styles.sectionDetailLabel}>Période: </Text>
                        {formatDate(item.termStartDate)} - {formatDate(item.termEndDate)}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <BottomModal
            visible={visible}
            onClose={onClose}
            title="Sélectionner une section"
            subtitle="Choisissez la classe pour cet enfant"
            enableDragToExpand={true}
            height={SCREEN_HEIGHT * 0.9}
        >
            <View style={styles.modalContent}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary.main} />
                        <Text style={styles.loadingText}>Chargement des sections...</Text>
                    </View>
                ) : sections.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="library-outline" size={64} color={colors.text.disabled} />
                        <Text style={styles.emptyTitle}>Aucune section disponible</Text>
                        <Text style={styles.emptySubtitle}>
                            {"Aucune section n'est disponible pour cette école."}
                        </Text>
                    </View>
                ) : (
                    <>
                        <FlatList
                            data={sections}
                            renderItem={renderSectionItem}
                            keyExtractor={(item) => item.schoolGradeSectionId.toString()}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContainer}
                        />

                        <View style={styles.footer}>
                            <CustomButton
                                title="Confirmer la sélection"
                                onPress={handleConfirmSelection}
                                disabled={!selectedSection}
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
    sectionItem: {
        backgroundColor: colors.background.paper,
        borderRadius: 12,
        padding: spacingX._15,
        marginBottom: spacingY._10,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    sectionItemSelected: {
        borderColor: colors.primary.main,
        backgroundColor: colors.primary.light + '10',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacingY._10,
    },
    sectionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.background.default,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacingX._12,
    },
    sectionInfo: {
        flex: 1,
    },
    sectionName: {
        fontSize: scaleFont(16),
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacingY._3,
    },
    sectionNameSelected: {
        color: colors.primary.main,
    },
    sectionFee: {
        fontSize: scaleFont(13),
        color: colors.success.main,
        fontWeight: '600',
    },
    sectionSelection: {
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
    sectionDescription: {
        fontSize: scaleFont(13),
        color: colors.text.secondary,
        marginBottom: spacingY._10,
        lineHeight: scaleFont(18),
    },
    sectionDetails: {
        paddingTop: spacingY._10,
        borderTopWidth: 1,
        borderTopColor: colors.border?.light || '#e1e5e9',
    },
    sectionDetailText: {
        fontSize: scaleFont(12),
        color: colors.text.secondary,
    },
    sectionDetailLabel: {
        fontWeight: '600',
        color: colors.text.primary,
    },
    footer: {
        paddingTop: spacingY._20,
        borderTopWidth: 1,
        borderTopColor: colors.border?.light || '#e1e5e9',
    },
});