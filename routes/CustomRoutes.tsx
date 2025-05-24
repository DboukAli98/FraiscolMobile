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

const CustomRoutes = ({
  state,
  descriptors,
  navigation,
  activeTintColor = '#007AFF',
  inactiveTintColor = '#8e8e93',
  backgroundColor = '#fff',
} : CustomTabBarProps) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
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
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.background.paper,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    marginTop: 2,
  },
});