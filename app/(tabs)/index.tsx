// app/(tabs)/index.tsx
// This is your home screen inside the tabs
import { colors, radius, shapes, spacingY } from '@/constants/theme';
import { push } from 'expo-router/build/global-state/routing';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text>Home Screen</Text>
      <Pressable style={{backgroundColor:colors.primary.main , borderRadius:radius._10 , justifyContent:"center" , alignItems:"center" , height: spacingY._40 , width:"100%"}} onPress={() => push("/merchandises")}>
        <Text style={{color:colors.text.white}}>Go to merchandise</Text>
      </Pressable>
    </View>
  );
}

 const styles = StyleSheet.create({
  container :{
    flex:1,
    backgroundColor:"#fff",
    padding:shapes.initialPadding
  }
 }) 