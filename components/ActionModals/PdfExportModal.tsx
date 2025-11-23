import { BottomModal } from '@/components/BottomModal/BottomModal';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { scale, scaleFont } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PdfExportModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    onShare: () => void;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
    visible,
    onClose,
    onSave,
    onShare,
}) => {
    const handleSave = () => {
        onSave();
        onClose();
    };

    const handleShare = () => {
        onShare();
        onClose();
    };

    return (
        <BottomModal
            visible={visible}
            onClose={onClose}
            title="Reçu PDF Généré"
            subtitle="Que souhaitez-vous faire avec le reçu?"
            height="auto"
            showCloseButton={true}
        >
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.actionOption}
                    onPress={handleSave}
                    activeOpacity={0.7}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name="download-outline"
                            size={scale(24)}
                            color={colors.primary.main}
                        />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.actionTitle}>Enregistrer</Text>
                        <Text style={styles.actionDescription}>
                            Enregistrer dans le dossier Téléchargements
                        </Text>
                    </View>
                    <Ionicons
                        name="chevron-forward"
                        size={scale(20)}
                        color={colors.text.secondary}
                    />
                </TouchableOpacity>

                <View style={styles.separator} />

                <TouchableOpacity
                    style={styles.actionOption}
                    onPress={handleShare}
                    activeOpacity={0.7}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name="share-outline"
                            size={scale(24)}
                            color={colors.primary.main}
                        />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.actionTitle}>Partager</Text>
                        <Text style={styles.actionDescription}>
                            Partager via d&apos;autres applications
                        </Text>
                    </View>
                    <Ionicons
                        name="chevron-forward"
                        size={scale(20)}
                        color={colors.text.secondary}
                    />
                </TouchableOpacity>
            </View>
        </BottomModal>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingBottom: spacingY._20,
    },
    actionOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacingY._15,
        paddingHorizontal: spacingX._5,
    },
    iconContainer: {
        width: scale(48),
        height: scale(48),
        borderRadius: scale(24),
        backgroundColor: colors.primary.light + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacingX._15,
    },
    textContainer: {
        flex: 1,
    },
    actionTitle: {
        fontSize: scaleFont(16),
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacingY._3,
    },
    actionDescription: {
        fontSize: scaleFont(13),
        color: colors.text.secondary,
    },
    separator: {
        height: 1,
        backgroundColor: colors.border?.light || '#e1e5e9',
        marginVertical: spacingY._5,
    },
});
