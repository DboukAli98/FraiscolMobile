// app/(tabs)/index.tsx
import { ScreenView } from '@/components/ScreenView/ScreenView';
import { colors, radius, spacingY } from '@/constants/theme';
import { push } from 'expo-router/build/global-state/routing';
import { Pressable, StyleSheet, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <ScreenView safeArea={true}>
      

      <Text>Home</Text>
      
      <Pressable 
        style={styles.merchandiseButton} 
        onPress={() => push("/merchandises")}
      >
        <Text style={styles.buttonText}>Go to merchandise</Text>
      </Pressable>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  spacer: {
    height: 20,
  },
  merchandiseButton: {
    marginBottom: 12,
    backgroundColor: colors.primary.main,
    borderRadius: radius._10,
    justifyContent: "center",
    alignItems: "center",
    height: spacingY._40,
    width: "100%",
  },
  buttonText: {
    color: colors.text.white,
  },
});