import { colors } from '@/constants/theme'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const childrens = () => {
    return (
        <View style={styles.container}>
            <Text>childrens</Text>
        </View>
    )
}

export default childrens

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.default
    }
}) 