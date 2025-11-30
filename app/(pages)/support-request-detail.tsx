import { PageHeader } from '@/components/PageHeader/PageHeader';
import { ScreenView } from '@/components/ScreenView/ScreenView';
import { colors } from '@/constants/theme';
import { SupportRequestDetail } from '@/models/SupportRequestInterfaces';
import { useGetSupportRequestById } from '@/services/supportRequestServices';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const SupportRequestDetailScreen: React.FC = () => {
    const params = useLocalSearchParams();
    const supportRequestId = params.id as string;
    const getSupportRequestById = useGetSupportRequestById();

    const [supportRequest, setSupportRequest] = useState<SupportRequestDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSupportRequestDetail = async (showLoader = true) => {
        if (showLoader) setLoading(true);
        setError(null);

        try {
            const response = await getSupportRequestById({
                SupportRequestId: parseInt(supportRequestId),
            });

            if (response.success && response.data?.data) {
                setSupportRequest(response.data.data);
            } else {
                setError(response.error || 'Impossible de charger les détails de la demande.');
            }
        } catch {
            setError('Une erreur est survenue lors du chargement.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (supportRequestId) {
            fetchSupportRequestDetail();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [supportRequestId]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchSupportRequestDetail(false);
    };

    const getTypeLabel = (type: number) => {
        switch (type) {
            case 0: return 'Général';
            case 1: return 'Paiement';
            case 2: return 'Aide';
            default: return 'Inconnu';
        }
    };

    const getPriorityLabel = (priority: number) => {
        switch (priority) {
            case 0: return 'Faible';
            case 1: return 'Moyen';
            case 2: return 'Élevé';
            case 3: return 'Urgent';
            default: return 'Inconnu';
        }
    };

    const getPriorityColor = (priority: number) => {
        switch (priority) {
            case 0: return '#10b981'; // green - Low
            case 1: return '#f59e0b'; // orange - Medium
            case 2: return '#f97316'; // deep orange - High
            case 3: return '#ef4444'; // red - Urgent
            default: return '#64748b';
        }
    };

    const getStatusLabel = (status: number) => {
        switch (status) {
            case 6: return 'En attente';
            case 11: return 'En cours';
            case 14: return 'Résolu';
            case 15: return 'En pause';
            case 9: return 'Annulé';
            default: return 'Inconnu';
        }
    };

    const getStatusColor = (status: number) => {
        switch (status) {
            case 6: return '#f59e0b'; // orange - pending
            case 11: return '#3b82f6'; // blue - in progress
            case 14: return '#10b981'; // green - resolved
            case 15: return '#f97316'; // deep orange - stall
            case 9: return '#64748b'; // gray - cancelled
            default: return '#64748b';
        }
    };

    const getStatusIcon = (status: number) => {
        switch (status) {
            case 6: return '⏳'; // pending
            case 11: return '🔄'; // in progress
            case 14: return '✅'; // resolved
            case 15: return '⏸️'; // stall
            case 9: return '❌'; // cancelled
            default: return '❓';
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Date inconnue';

        // Ensure the date string is treated as UTC
        let dateStr = dateString;
        if (!dateStr.endsWith('Z') && !dateStr.includes('+') && !dateStr.includes('T')) {
            dateStr = dateStr + 'Z';
        } else if (dateStr.includes('T') && !dateStr.endsWith('Z') && !dateStr.includes('+')) {
            dateStr = dateStr + 'Z';
        }

        const date = new Date(dateStr);

        // Check if date is valid
        if (isNaN(date.getTime())) {
            return 'Date invalide';
        }

        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderStatusFlow = () => {
        if (!supportRequest?.statusLogs || supportRequest.statusLogs.length === 0) {
            return (
                <View style={styles.emptyStatusContainer}>
                    <Text style={styles.emptyStatusText}>Aucun historique de statut disponible.</Text>
                </View>
            );
        }

        // Sort status logs by date (oldest first for chronological flow)
        const sortedLogs = [...supportRequest.statusLogs].sort((a, b) => {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });

        return (
            <View style={styles.statusFlowContainer}>
                {sortedLogs.map((log, index) => {
                    const isLast = index === sortedLogs.length - 1;
                    const statusColor = getStatusColor(log.fK_StatusId);

                    return (
                        <View key={log.supportRequestStatusLogId} style={styles.statusLogItem}>
                            {/* Timeline line */}
                            {!isLast && (
                                <View style={[styles.timelineLine, { backgroundColor: statusColor }]} />
                            )}

                            {/* Status node */}
                            <View style={[styles.statusNode, { borderColor: statusColor }]}>
                                <Text style={styles.statusIcon}>{getStatusIcon(log.fK_StatusId)}</Text>
                            </View>

                            {/* Status content */}
                            <View style={styles.statusContent}>
                                <View style={styles.statusHeader}>
                                    <Text style={[styles.statusLabel, { color: statusColor }]}>
                                        {getStatusLabel(log.fK_StatusId)}
                                    </Text>
                                    <Text style={styles.statusDate}>{formatDate(log.createdAt)}</Text>
                                </View>
                                {log.message && (
                                    <View style={styles.messageContainer}>
                                        <Text style={styles.messageText}>{log.message}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    );
                })}
            </View>
        );
    };

    if (loading) {
        return (
            <ScreenView>
                <PageHeader title="Détails de la demande" onBack={() => router.back()} />
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                    <Text style={styles.loadingText}>Chargement...</Text>
                </View>
            </ScreenView>
        );
    }

    if (error || !supportRequest) {
        return (
            <ScreenView>
                <PageHeader title="Détails de la demande" onBack={() => router.back()} />
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>{error || 'Demande introuvable.'}</Text>
                </View>
            </ScreenView>
        );
    }

    return (
        <ScreenView>
            <PageHeader title="Détails de la demande" onBack={() => router.back()} />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary.main]}
                    />
                }
            >
                {/* Main Details Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.title}>{supportRequest.title}</Text>
                        <View
                            style={[
                                styles.priorityBadge,
                                { backgroundColor: getPriorityColor(supportRequest.priority) },
                            ]}
                        >
                            <Text style={styles.priorityText}>
                                {getPriorityLabel(supportRequest.priority)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Text style={styles.metaLabel}>Type:</Text>
                            <Text style={styles.metaValue}>{getTypeLabel(supportRequest.supportRequestType)}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Text style={styles.metaLabel}>Statut:</Text>
                            <View
                                style={[
                                    styles.statusBadge,
                                    { backgroundColor: getStatusColor(supportRequest.fK_StatusId) },
                                ]}
                            >
                                <Text style={styles.statusBadgeText}>
                                    {getStatusLabel(supportRequest.fK_StatusId)}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {supportRequest.schoolName && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>École:</Text>
                            <Text style={styles.infoValue}>{supportRequest.schoolName}</Text>
                        </View>
                    )}

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.descriptionText}>{supportRequest.description}</Text>
                    </View>

                    {supportRequest.resultNotes && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Notes de résultat</Text>
                            <Text style={styles.resultNotesText}>{supportRequest.resultNotes}</Text>
                        </View>
                    )}

                    {supportRequest.createdAt && (
                        <View style={styles.datesRow}>
                            <Text style={styles.dateText}>
                                Créé le {formatDate(supportRequest.createdAt)}
                            </Text>
                            {supportRequest.updatedAt && (
                                <Text style={styles.dateText}>
                                    Modifié le {formatDate(supportRequest.updatedAt)}
                                </Text>
                            )}
                        </View>
                    )}
                </View>

                {/* Status Flow Diagram */}
                <View style={styles.card}>
                    <Text style={styles.flowTitle}>Historique des statuts</Text>
                    {renderStatusFlow()}
                </View>
            </ScrollView>
        </ScreenView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#64748b',
    },
    errorText: {
        fontSize: 16,
        color: '#ef4444',
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    title: {
        flex: 1,
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginRight: 12,
    },
    priorityBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    priorityText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#ffffff',
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    metaItem: {
        flex: 1,
    },
    metaLabel: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 4,
    },
    metaValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#ffffff',
    },
    infoRow: {
        marginBottom: 16,
    },
    infoLabel: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
    },
    resultNotesText: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
        fontStyle: 'italic',
    },
    datesRow: {
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 12,
    },
    dateText: {
        fontSize: 12,
        color: '#94a3b8',
        marginBottom: 4,
    },
    flowTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 20,
    },
    statusFlowContainer: {
        paddingLeft: 8,
    },
    statusLogItem: {
        flexDirection: 'row',
        marginBottom: 24,
        position: 'relative',
    },
    timelineLine: {
        position: 'absolute',
        left: 19,
        top: 40,
        bottom: -24,
        width: 2,
    },
    statusNode: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 3,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    statusIcon: {
        fontSize: 18,
    },
    statusContent: {
        flex: 1,
        paddingTop: 4,
    },
    statusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    statusLabel: {
        fontSize: 16,
        fontWeight: '700',
    },
    statusDate: {
        fontSize: 12,
        color: '#94a3b8',
    },
    messageContainer: {
        backgroundColor: '#f8fafc',
        padding: 10,
        borderRadius: 8,
        marginTop: 6,
    },
    messageText: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 18,
    },
    emptyStatusContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyStatusText: {
        fontSize: 14,
        color: '#94a3b8',
        fontStyle: 'italic',
    },
});

export default SupportRequestDetailScreen;
