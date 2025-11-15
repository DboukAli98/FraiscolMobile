// components/PerformanceCard/PerformanceCard.tsx
import { spacingX, spacingY } from '@/constants/theme';
import { scaleFont } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PerformanceCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: keyof typeof Ionicons.glyphMap;
    gradientColors: string[];
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
}

export const PerformanceCard: React.FC<PerformanceCardProps> = ({
    title,
    value,
    subtitle,
    icon,
    gradientColors,
    change,
    changeType = 'neutral',
}) => {
    return (
        <View style={[styles.card, { backgroundColor: gradientColors[0] }]}>
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon} size={24} color="#FFFFFF" />
                </View>
                {change && (
                    <View style={[
                        styles.changeBadge,
                        changeType === 'positive' && styles.positiveChange,
                        changeType === 'negative' && styles.negativeChange,
                    ]}>
                        <Ionicons
                            name={changeType === 'positive' ? 'trending-up' : changeType === 'negative' ? 'trending-down' : 'remove'}
                            size={12}
                            color="#FFFFFF"
                        />
                        <Text style={styles.changeText}>{change}</Text>
                    </View>
                )}
            </View>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.value}>{value}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        padding: spacingX._20,
        minHeight: 140,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacingY._10,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    changeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacingX._10,
        paddingVertical: spacingY._5,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    positiveChange: {
        backgroundColor: 'rgba(16, 185, 129, 0.3)',
    },
    negativeChange: {
        backgroundColor: 'rgba(239, 68, 68, 0.3)',
    },
    changeText: {
        fontSize: scaleFont(11),
        fontWeight: '600',
        color: '#FFFFFF',
        marginLeft: spacingX._5,
    },
    title: {
        fontSize: scaleFont(13),
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: spacingY._5,
        letterSpacing: 0.3,
    },
    value: {
        fontSize: scaleFont(28),
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: spacingY._5,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: scaleFont(12),
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.8)',
        letterSpacing: 0.2,
    },
});
