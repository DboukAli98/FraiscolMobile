import { colors } from '@/constants/theme';
import { CustomTabBarProps } from '@/types';
import { MaterialIcons } from '@expo/vector-icons';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CustomRoutes = ({
  state,
  descriptors,
  navigation,
  activeTintColor = '#007AFF',
  inactiveTintColor = '#8e8e93',
  backgroundColor = '#fff',
}: CustomTabBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.container,
      {
        backgroundColor,
        // Add safe area padding for Android navigation bar
        paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 12) : Math.max(insets.bottom, 8),
        // Add extra height on Android to accommodate navigation bar
        minHeight: Platform.OS === 'android' ? 72 + Math.max(insets.bottom, 12) : 64,
      }
    ]}>
      {state.routes.map((route, idx) => {
        const { options } = descriptors[route.key];
        const label = options.title ?? options.tabBarLabel ?? route.name;
        const isFocused = state.index === idx;
        const color = isFocused ? activeTintColor : inactiveTintColor;

        // Extract the icon component from the tabBarIcon function
        let IconComponent = null;

        if (options.tabBarIcon) {
          // Call the tabBarIcon function with the appropriate props
          IconComponent = options.tabBarIcon({
            focused: isFocused,
            color: color,
            size: 24
          });
        } else {
          // Fallback icon if none provided
          IconComponent = <MaterialIcons name="circle" size={24} color={color} />;
        }

        const onPress = () => {
          if (!isFocused) navigation.navigate(route.name);
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tab}
            activeOpacity={0.7}
          >
            {IconComponent}
            <Text style={[styles.label, { color }]}>
              {typeof label === 'string' ? label : ""}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default CustomRoutes;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border?.light || '#e1e5e9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    // Add minimum touch target
    minHeight: 56,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
});