// components/ui/IconButton.tsx
import { colors, componentSizes, radius, shadows, spacingX, spacingY } from '@/constants/theme';
import { scale } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    GestureResponderEvent,
    Pressable,
    ViewStyle
} from 'react-native';

// Icon button props interface
interface IconButtonProps {
  // Icon props
  iconName: keyof typeof Ionicons.glyphMap;
  iconSize?: keyof typeof componentSizes.icon;
  iconColor?: string;
  
  // Button props
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'filled' | 'outlined' | 'ghost' | 'rounded';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
  disabled?: boolean;
  
  // Styling
  style?: ViewStyle;
  
  // Events
  onPress?: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  iconName,
  iconSize = 'md',
  iconColor,
  size = 'md',
  variant = 'filled',
  color = 'primary',
  disabled = false,
  style,
  onPress,
  onLongPress,
  accessibilityLabel,
  accessibilityHint,
}) => {
  // Get colors based on color prop
  const getColors = () => {
    switch (color) {
      case 'primary':
        return {
          main: colors.primary.main,
          light: colors.primary.light,
          dark: colors.primary.dark,
        };
      case 'secondary':
        return {
          main: colors.secondary.main,
          light: colors.secondary.light,
          dark: colors.secondary.dark,
        };
      case 'success':
        return {
          main: colors.success.main,
          light: colors.success.light,
          dark: colors.success.dark,
        };
      case 'error':
        return {
          main: colors.error.main,
          light: colors.error.light,
          dark: colors.error.dark,
        };
      case 'warning':
        return {
          main: colors.warning.main,
          light: colors.warning.light,
          dark: colors.warning.dark,
        };
      default:
        return {
          main: colors.primary.main,
          light: colors.primary.light,
          dark: colors.primary.dark,
        };
    }
  };

  const colorScheme = getColors();

  // Get button size
  const getButtonSize = () => {
    switch (size) {
      case 'sm':
        return scale(32);
      case 'md':
        return scale(40);
      case 'lg':
        return scale(48);
      case 'xl':
        return scale(56);
      default:
        return scale(40);
    }
  };

  // Get button style based on variant
  const getButtonStyle = (pressed: boolean): ViewStyle => {
    const buttonSize = getButtonSize();
    const baseStyle: ViewStyle = {
      width: buttonSize,
      height: buttonSize,
      justifyContent: 'center',
      alignItems: 'center',
      opacity: disabled ? 0.6 : pressed ? 0.8 : 1,
    };

    switch (variant) {
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: pressed ? colorScheme.dark : colorScheme.main,
          borderRadius: radius._10,
          ...shadows.sm,
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: pressed ? colorScheme.dark : colorScheme.main,
          borderRadius: radius._10,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: pressed ? `${colorScheme.main}20` : 'transparent',
          borderRadius: radius._10,
        };
      case 'rounded':
        return {
          ...baseStyle,
          backgroundColor: pressed ? colorScheme.dark : colorScheme.main,
          borderRadius: buttonSize / 2,
          ...shadows.md,
        };
      default:
        return baseStyle;
    }
  };

  // Get icon color based on variant
  const getIconColor = () => {
    if (iconColor) return iconColor;
    
    switch (variant) {
      case 'filled':
      case 'rounded':
        return colors.text.white;
      case 'outlined':
      case 'ghost':
        return colorScheme.main;
      default:
        return colorScheme.main;
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        getButtonStyle(pressed),
        style,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
    >
      <Ionicons
        name={iconName}
        size={componentSizes.icon[iconSize]}
        color={getIconColor()}
      />
    </Pressable>
  );
};

// Specialized icon button variants for common use cases
export const PrimaryIconButton: React.FC<Omit<IconButtonProps, 'color' | 'variant'>> = (props) => (
  <IconButton {...props} color="primary" variant="filled" />
);

export const SecondaryIconButton: React.FC<Omit<IconButtonProps, 'color' | 'variant'>> = (props) => (
  <IconButton {...props} color="secondary" variant="filled" />
);

export const GhostIconButton: React.FC<Omit<IconButtonProps, 'variant'>> = (props) => (
  <IconButton {...props} variant="ghost" />
);

export const RoundedIconButton: React.FC<Omit<IconButtonProps, 'variant'>> = (props) => (
  <IconButton {...props} variant="rounded" />
);

// Floating Action Button (FAB)
interface FABProps {
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: (event: GestureResponderEvent) => void;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'error';
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  style?: ViewStyle;
}

export const FloatingActionButton: React.FC<FABProps> = ({
  iconName,
  onPress,
  size = 'md',
  color = 'primary',
  position = 'bottom-right',
  style,
}) => {
  const getFABSize = () => {
    switch (size) {
      case 'sm':
        return scale(48);
      case 'md':
        return scale(56);
      case 'lg':
        return scale(64);
      default:
        return scale(56);
    }
  };

  const getPositionStyle = (): ViewStyle => {
    const base = {
      position: 'absolute' as const,
      bottom: spacingY._20,
    };

    switch (position) {
      case 'bottom-right':
        return { ...base, right: spacingX._20 };
      case 'bottom-left':
        return { ...base, left: spacingX._20 };
      case 'bottom-center':
        return { ...base, alignSelf: 'center' as const };
      default:
        return { ...base, right: spacingX._20 };
    }
  };

  const fabSize = getFABSize();

  return (
    <Pressable
      style={({ pressed }) => [
        {
          width: fabSize,
          height: fabSize,
          borderRadius: fabSize / 2,
          backgroundColor: pressed 
            ? colors[color].dark 
            : colors[color].main,
          justifyContent: 'center',
          alignItems: 'center',
          ...shadows.lg,
          opacity: pressed ? 0.9 : 1,
        },
        getPositionStyle(),
        style,
      ]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Ionicons
        name={iconName}
        size={componentSizes.icon.lg}
        color={colors.text.white}
      />
    </Pressable>
  );
};