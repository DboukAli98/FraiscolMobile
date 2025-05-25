import { colors, spacingX, spacingY } from '@/constants/theme';
import { scaleFont } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PageHeaderAction {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    color?: string;
}

interface PageHeaderProps {
    title: string;
    onBack?: () => void;
    actions?: PageHeaderAction[]; // dynamic actions
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, onBack, actions = [] }) => {
    return (
        <View style={styles.header}>
            {onBack && (
                <TouchableOpacity style={styles.headerBackButton} onPress={onBack}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
            )}

            <Text style={styles.headerTitle}>{title}</Text>

            <View style={styles.headerActions}>
                {actions.map((action, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.actionButton}
                        onPress={action.onPress}
                    >
                        <Ionicons
                            name={action.icon}
                            size={20}
                            color={action.color || colors.primary.main}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacingX._20,
        paddingVertical: spacingY._15,
        borderBottomWidth: 1,
        borderBottomColor: colors.border?.light || '#e1e5e9',
        backgroundColor: colors.background.default,
    },
    headerBackButton: {
        padding: spacingX._5,
    },
    headerTitle: {
        fontSize: scaleFont(18),
        fontWeight: '600',
        color: colors.text.primary,
        flex: 1,
        textAlign: 'center',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        padding: spacingX._7,
        marginLeft: spacingX._5,
    },
});
