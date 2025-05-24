import { colors } from '@/constants/theme'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const paymenthistory = () => {
    return (
        <View style={styles.container}>
            <Text>paymenthistory</Text>
        </View>
    )
}

export default paymenthistory

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.default
    }
}) 