import { colors } from '@/constants/theme'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const schools = () => {
    return (
        <View style={styles.container}>
            <Text>schools</Text>
        </View>
    )
}

export default schools

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.default
    }
}) 