import { ScreenView } from '@/components/ScreenView/ScreenView';
import { colors, getTextStyle, spacingX, spacingY } from '@/constants/theme';
import useUserInfo from '@/hooks/useUserInfo';
import { useGetCollectingAgentParents } from '@/services/collectingAgentServices';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ParentItem {
    id: number;
    name: string;
    phone: string;
    assignedOn?: string;
}

export default function AgentParents() {
    const user = useUserInfo();
    const getCollectingAgentParents = useGetCollectingAgentParents();

    const [items, setItems] = useState<ParentItem[]>([]);
    const [count, setCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const mapDto = (dto: any): ParentItem => ({
        id: dto.parentId,
        name: `${dto.firstName} ${dto.lastName}`.trim(),
        phone: `+${dto.countryCode} ${dto.phoneNumber}`,
        assignedOn: dto.createdOn?.substring(0, 10),
    });

    const load = useCallback(async () => {
        const agentId = typeof user?.parentId === 'number' ? user.parentId : Number(user?.parentId ?? 0);
        if (!agentId) {
            setItems([]);
            setCount(0);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { success, data } = await getCollectingAgentParents({
                collectingAgentId: agentId,
                pageNumber: 1,
                pageSize: 20,
            });
            if (success) {
                const list = (data?.data ?? []).map(mapDto);
                setItems(list);
                setCount(data?.totalCount ?? list.length);
            }
        } finally {
            setLoading(false);
        }
    }, [user?.parentId]);

    useEffect(() => {
        load();
    }, [load]);

    const onRefresh = async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    };

    return (
        <ScreenView safeArea={true}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Parents assignés</Text>
                <Text style={styles.count}>{count}</Text>
            </View>

            {loading ? (
                <View style={{ paddingVertical: spacingY._20 }}>
                    <ActivityIndicator size="small" color={colors.primary.main} />
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: spacingY._20 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary.main]} />
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.item}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.name}>{item.name}</Text>
                                <Text style={styles.phone}>{item.phone}</Text>
                            </View>
                            <Text style={styles.assigned}>Assigné: {item.assignedOn}</Text>
                        </TouchableOpacity>
                    )}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            )}
        </ScreenView>
    );
}

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacingY._10,
    },
    title: {
        ...getTextStyle('md', 'semibold', colors.text.secondary),
    },
    count: {
        ...getTextStyle('sm', 'bold', colors.primary.main),
    },
    item: {
        backgroundColor: colors.background.default,
        padding: spacingX._12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    name: {
        ...getTextStyle('base', 'semibold', colors.text.primary),
    },
    phone: {
        ...getTextStyle('sm', 'normal', colors.text.secondary),
        marginTop: spacingY._3,
    },
    assigned: {
        ...getTextStyle('xs', 'medium', colors.text.secondary),
    },
    separator: {
        height: spacingY._10,
    },
});
