// components/PendingChildrenSummary/PendingChildrenSummary.tsx
import { colors, spacingX, spacingY } from '@/constants/theme';
import { useParentProfile } from '@/hooks/useParentProfile';
import useUserInfo from '@/hooks/useUserInfo';
import { PendingRejectedChildDto, useGetParentPendingRejectedChildrens } from '@/services/userServices';
import { scaleFont } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface PendingChildrenSummaryProps {
    onPress?: () => void;
}

export const PendingChildrenSummary: React.FC<PendingChildrenSummaryProps> = ({ onPress }) => {
    const userInfo = useUserInfo();
    const { parentData } = useParentProfile();
    const getPendingRejectedChildrens = useGetParentPendingRejectedChildrens();

    const [children, setChildren] = useState<PendingRejectedChildDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Use ref to track the last parentId we fetched for
    const lastParentIdRef = useRef<number | null>(null);

    useEffect(() => {
        const fetchPendingRejectedChildren = async () => {
            const parentId = parentData?.parentId || (userInfo?.parentId ? parseInt(userInfo.parentId) : null);

            // Only fetch if parentId exists and has changed
            if (!parentId || parentId === lastParentIdRef.current) return;

            lastParentIdRef.current = parentId;
            setIsLoading(true);
            setError(null);

            try {
                const response = await getPendingRejectedChildrens({
                    parentId,
                    pageNumber: 1,
                    pageSize: 10,
                });

                if (response.success && response.data?.data) {
                    setChildren(response.data.data);
                } else {
                    setError(response.error || "Impossible de charger les enfants");
                }
            } catch (err) {
                setError("Une erreur s'est produite");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPendingRejectedChildren();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parentData?.parentId, userInfo?.parentId]);

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            router.push('/(pages)/pending-children');
        }
    };

    // Don't render if loading, error, or no children
    if (isLoading || error || children.length === 0) {
        return null;
    }

    const pendingCount = children.filter(c => c.fK_StatusId === 6).length;
    const rejectedCount = children.filter(c => c.fK_StatusId === 13).length;

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Ionicons name="alert-circle" size={24} color={colors.warning.main} />
                </View>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Enfants en attente d&apos;approbation</Text>
                    <Text style={styles.subtitle}>
                        {children.length} enfant{children.length > 1 ? 's' : ''} nécessite{children.length > 1 ? 'nt' : ''} votre attention
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </View>

            <View style={styles.statsRow}>
                {pendingCount > 0 && (
                    <View style={styles.statBadge}>
                        <View style={[styles.statDot, { backgroundColor: colors.warning.main }]} />
                        <Text style={styles.statText}>
                            {pendingCount} en attente
                        </Text>
                    </View>
                )}
                {rejectedCount > 0 && (
                    <View style={styles.statBadge}>
                        <View style={[styles.statDot, { backgroundColor: colors.error.main }]} />
                        <Text style={styles.statText}>
                            {rejectedCount} rejeté{rejectedCount > 1 ? 's' : ''}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: `${colors.warning.main}10`,
        marginHorizontal: spacingX._20,
        marginVertical: spacingY._10,
        padding: spacingY._15,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: colors.warning.main,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacingY._12,
    },
    iconContainer: {
        marginRight: spacingX._12,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: scaleFont(15),
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 2,
    },
    subtitle: {
        fontSize: scaleFont(12),
        color: colors.text.secondary,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacingX._15,
    },
    statBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.paper,
        paddingHorizontal: spacingX._10,
        paddingVertical: spacingY._5,
        borderRadius: 12,
    },
    statDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: spacingX._7,
    },
    statText: {
        fontSize: scaleFont(12),
        color: colors.text.secondary,
        fontWeight: '500',
    },
});
