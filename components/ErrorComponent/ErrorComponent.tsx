import { colors, radius, shadows, spacingX, spacingY } from '@/constants/theme'
import { scaleFont } from '@/utils/stylings'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const ErrorComponent = ({ error = "", onRetry = () => { }, title = "Une erreur s'est produite lors du traitement de votre demande" }) => {
    return (
        <View style={styles.centerContainer}>
            <Text style={styles.errorTitle}>{title}</Text>
            <Text style={styles.errorSubtitle}>{error ?? ""}</Text>
            {onRetry && (
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={onRetry}
                >
                    <Text style={styles.retryButtonText}>{"Essayer à nouveau"}</Text>
                </TouchableOpacity>
            )}
        </View>
    )
}

export default ErrorComponent

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacingX._30,
        paddingVertical: spacingY._50,
    },
    errorTitle: {
        fontSize: scaleFont(18),
        fontWeight: '600',
        color: colors.error.main,
        textAlign: 'center',
        marginBottom: spacingY._10,
    },
    errorSubtitle: {
        fontSize: scaleFont(14),
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: spacingY._20,
        lineHeight: scaleFont(20),
    },
    retryButton: {
        backgroundColor: colors.primary.main,
        paddingHorizontal: spacingX._20,
        paddingVertical: spacingY._12,
        borderRadius: radius._10,
        ...shadows.sm,
    },
    retryButtonText: {
        color: colors.text.white,
        fontSize: scaleFont(14),
        fontWeight: '600',
    },


})