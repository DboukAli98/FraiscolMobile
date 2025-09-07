import { GhostIconButton } from '@/components/IconButton/IconButton';
import { ScreenView } from '@/components/ScreenView/ScreenView';
import { colors, getTextStyle, spacingX, spacingY } from '@/constants/theme';
import useUserInfo from '@/hooks/useUserInfo';
import { useGetCollectingAgentParents } from '@/services/collectingAgentServices';
import { useLogout } from '@/services/userServices';
import { scale, scaleFont } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

export default function AgentDashboard() {
    const user = useUserInfo();
    const logoutUser = useLogout();
    const getCollectingAgentParents = useGetCollectingAgentParents();

    const [parentsCount, setParentsCount] = useState<number | null>(null);
    const [loadingCount, setLoadingCount] = useState<boolean>(false);

    const handleLogout = async () => {
        try {
            const { success, error } = await logoutUser();
            if (success) {
                router.replace('/(auth)/login');
            } else {
                Alert.alert('Erreur', error || "Une erreur s'est produite lors de la déconnexion.");
            }
        } catch {
            Alert.alert('Erreur', "Une erreur s'est produite lors de la déconnexion.");
        }
    };

    useEffect(() => {
        const fetchCount = async () => {
            const agentId = typeof user?.parentId === 'number'
                ? user.parentId
                : Number(user?.parentId ?? 0);
            if (!agentId) return;
            try {
                setLoadingCount(true);
                const { success, data } = await getCollectingAgentParents({
                    collectingAgentId: agentId,
                    pageNumber: 1,
                    pageSize: 1, // fetch minimal to get totalCount
                });
                if (success) {
                    setParentsCount(data?.totalCount ?? 0);
                }
            } finally {
                setLoadingCount(false);
            }
        };
        fetchCount();
    }, [user?.parentId]);

    return (
        <ScreenView safeArea={true}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={24} color={colors.text.white} />
                    </View>
                    <View style={styles.greetingSection}>
                        <Text style={styles.smallGreeting}>Bonjour</Text>
                        <Text style={styles.nameText}>{user?.name || 'Agent'}</Text>
                    </View>
                </View>
                <View style={styles.headerRight}>
                    <GhostIconButton
                        iconName="notifications-outline"
                        size="md"
                        accessibilityLabel="Notifications"
                    />
                    <GhostIconButton
                        iconName="log-out-outline"
                        onPress={handleLogout}
                        size='md'
                        accessibilityLabel='logout'
                        color='error'
                    />
                </View>
            </View>

            <View style={styles.cardsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Parents assignés</Text>
                    <Text style={styles.statValue}>
                        {loadingCount ? '...' : (parentsCount ?? '--')}
                    </Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Activité cette semaine</Text>
                    <Text style={styles.statValue}>--</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Aperçu</Text>
                <Text style={styles.muted}>Les données réelles seront connectées aux API.</Text>
            </View>
        </ScreenView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        alignContent: 'center',
        marginBottom: spacingY._30,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingX._7,
    },
    avatar: {
        width: scale(48),
        height: scale(48),
        borderRadius: scale(12),
        backgroundColor: colors.primary.main,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacingX._10,
    },
    greetingSection: {
        alignItems: 'flex-start',
    },
    smallGreeting: {
        ...getTextStyle('sm', 'medium', colors.text.secondary),
        marginBottom: spacingY._3,
    },
    nameText: {
        ...getTextStyle('lg', 'extrabold', colors.text.secondary),
        textAlign: 'center',
    },
    cardsRow: {
        flexDirection: 'row',
        gap: spacingX._10,
        marginBottom: spacingY._15,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.background.default,
        padding: spacingX._12,
        borderRadius: 12,
    },
    statLabel: {
        fontSize: scaleFont(12),
        color: colors.text.secondary,
    },
    statValue: {
        fontSize: scaleFont(20),
        fontWeight: '700',
        color: colors.text.primary,
        marginTop: spacingY._5,
    },
    section: {
        marginTop: spacingY._10,
    },
    sectionTitle: {
        ...getTextStyle('md', 'semibold', colors.text.secondary),
        marginBottom: spacingY._10,
    },
    muted: {
        color: colors.text.secondary,
    }
});
