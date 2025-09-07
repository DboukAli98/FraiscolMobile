import { ScreenView } from '@/components/ScreenView/ScreenView';
import { colors, getTextStyle, spacingX, spacingY } from '@/constants/theme';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

interface ActivityItem {
    id: number;
    parentName: string;
    action: string;
    date: string;
}

const MOCK_ACTIVITY: ActivityItem[] = [
    { id: 1, parentName: 'Jean Dupont', action: 'Paiement confirmé', date: '2025-09-05 10:42' },
    { id: 2, parentName: 'Marie Curie', action: 'Mise à jour profil', date: '2025-09-04 16:20' },
];

export default function AgentActivity() {
    return (
        <ScreenView safeArea={true}>
            <Text style={styles.title}>Activité récente</Text>

            <FlatList
                data={MOCK_ACTIVITY}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: spacingY._20 }}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text style={styles.parent}>{item.parentName}</Text>
                        <Text style={styles.action}>{item.action}</Text>
                        <Text style={styles.date}>{item.date}</Text>
                    </View>
                )}
                ItemSeparatorComponent={() => <View style={{ height: spacingY._10 }} />}
            />
        </ScreenView>
    );
}

const styles = StyleSheet.create({
    title: {
        ...getTextStyle('md', 'semibold', colors.text.secondary),
        marginBottom: spacingY._10,
    },
    item: {
        backgroundColor: colors.background.default,
        padding: spacingX._12,
        borderRadius: 12,
    },
    parent: {
        ...getTextStyle('base', 'semibold', colors.text.primary),
    },
    action: {
        ...getTextStyle('sm', 'normal', colors.text.secondary),
        marginTop: spacingY._3,
    },
    date: {
        ...getTextStyle('xs', 'medium', colors.text.secondary),
        marginTop: spacingY._3,
    }
});
