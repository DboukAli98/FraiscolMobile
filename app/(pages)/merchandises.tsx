import { colors } from '@/constants/theme'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const merchandises = () => {
  return (
    <View style={styles.container}>
      <Text>merchandises</Text>
    </View>
  )
}

export default merchandises

 const styles = StyleSheet.create({
  container :{
    flex:1,
    backgroundColor:colors.background.default
  }
 }) 