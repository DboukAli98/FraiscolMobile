// constants/theme.ts
import { scale, scaleFont, verticalScale } from "@/utils/stylings";

export const colors = {
  primary: {
    main: '#385e92',
    light: '#5f7fab',
    dark: '#2c4a72',
    lighter:"#8fa6c7"
  },
  secondary: {
    main: '#39cccc',
    light: '#63e0e0',
    dark: '#2aa3a3',
  },
  background: {
    default: '#ffffff',
    paper: '#DDDDDD',
  },
  text: {
    primary: '#1c1c1c',
    secondary: '#5f7fab',
    disabled: '#9e9e9e',
    white: "#fff"
  },
  success: {
    main: '#4caf50',
    light: '#81c784',
    dark: '#388e3c',
  },
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
  },
  warning: {
    main: '#ff9800',
    light: '#ffb74d',
    dark: '#f57c00',
  },
  info: {
    main: '#39cccc',
    light: '#63e0e0',
    dark: '#2aa3a3',
  },
  // Additional color utilities
  border: {
    light: '#e1e5e9',
    main: '#c4c9d0',
    dark: '#a7adb7',
  },
  surface: {
    light: '#fafbfc',
    main: '#f5f6f8',
    dark: '#e8eaed',
  },
};

export const shapes = {
  initialPadding: scale(10), // Made responsive
  borderWidth: {
    thin: 1,
    medium: 2,
    thick: scale(3),
  },
};

export const spacingX = {
  _3: scale(3),
  _5: scale(5),
  _7: scale(7),
  _10: scale(10),
  _12: scale(12),
  _15: scale(15),
  _20: scale(20),
  _25: scale(25),
  _30: scale(30),
  _35: scale(35),
  _40: scale(40),
  _50: scale(50),
  _60: scale(60),
  _80: scale(80),
  _100: scale(100),
};

export const spacingY = {
  _3: verticalScale(3),
  _5: verticalScale(5),
  _7: verticalScale(7),
  _10: verticalScale(10),
  _12: verticalScale(12),
  _15: verticalScale(15),
  _20: verticalScale(20),
  _25: verticalScale(25),
  _30: verticalScale(30),
  _35: verticalScale(35),
  _40: verticalScale(40),
  _50: verticalScale(50),
  _60: verticalScale(60),
  _80: verticalScale(80),
};

// Fixed radius - should use scale() for consistent sizing
export const radius = {
  _3: scale(3),
  _6: scale(6),
  _10: scale(10),
  _12: scale(12),
  _15: scale(15),
  _17: scale(17),
  _20: scale(20),
  _30: scale(30),
  full: 9999, // For fully rounded elements
};

// Typography scaling
export const typography = {
  fontSize: {
    xs: scaleFont(10),
    sm: scaleFont(12),
    base: scaleFont(14),
    md: scaleFont(16),
    lg: scaleFont(18),
    xl: scaleFont(20),
    '2xl': scaleFont(24),
    '3xl': scaleFont(28),
    '4xl': scaleFont(32),
    '5xl': scaleFont(36),
  },
  lineHeight: {
    xs: verticalScale(14),
    sm: verticalScale(16),
    base: verticalScale(20),
    md: verticalScale(22),
    lg: verticalScale(24),
    xl: verticalScale(28),
    '2xl': verticalScale(32),
    '3xl': verticalScale(36),
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  } as const,
};

// Component-specific sizes
export const componentSizes = {
  button: {
    height: {
      sm: verticalScale(32),
      md: verticalScale(40),
      lg: verticalScale(48),
      xl: verticalScale(56),
    },
    padding: {
      sm: { horizontal: spacingX._12, vertical: spacingY._7 },
      md: { horizontal: spacingX._20, vertical: spacingY._10 },
      lg: { horizontal: spacingX._25, vertical: spacingY._12 },
      xl: { horizontal: spacingX._30, vertical: spacingY._15 },
    },
  },
  input: {
    height: {
      sm: verticalScale(36),
      md: verticalScale(44),
      lg: verticalScale(52),
    },
    padding: {
      horizontal: spacingX._12,
      vertical: spacingY._10,
    },
  },
  icon: {
    xs: scale(12),
    sm: scale(16),
    md: scale(20),
    lg: scale(24),
    xl: scale(32),
    xxl: scale(40),
    xxxl: scale(48),
  },
  avatar: {
    sm: scale(32),
    md: scale(40),
    lg: scale(48),
    xl: scale(64),
    xxl: scale(80),
  },
};

// Layout utilities
export const layout = {
  container: {
    maxWidth: scale(400),
    padding: shapes.initialPadding,
  },
  card: {
    padding: spacingX._15,
    borderRadius: radius._12,
    marginBottom: spacingY._15,
  },
  section: {
    marginBottom: spacingY._25,
  },
};

// Shadow presets
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: verticalScale(1),
    },
    shadowOpacity: 0.05,
    shadowRadius: scale(2),
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: verticalScale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: verticalScale(4),
    },
    shadowOpacity: 0.15,
    shadowRadius: scale(8),
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: verticalScale(8),
    },
    shadowOpacity: 0.2,
    shadowRadius: scale(12),
    elevation: 8,
  },
};

// Utility functions for common combinations
export const getButtonStyle = (
  size: 'sm' | 'md' | 'lg' | 'xl' = 'md',
  variant: 'primary' | 'secondary' | 'outline' = 'primary'
) => {
  const baseStyle = {
    height: componentSizes.button.height[size],
    paddingHorizontal: componentSizes.button.padding[size].horizontal,
    paddingVertical: componentSizes.button.padding[size].vertical,
    borderRadius: radius._12,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  };

  switch (variant) {
    case 'primary':
      return {
        ...baseStyle,
        backgroundColor: colors.primary.main,
      };
    case 'secondary':
      return {
        ...baseStyle,
        backgroundColor: colors.secondary.main,
      };
    case 'outline':
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderWidth: shapes.borderWidth.medium,
        borderColor: colors.primary.main,
      };
    default:
      return baseStyle;
  }
};

type TextSize = 'xs' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

export const getTextStyle = (
  size: TextSize = 'base',
  weight: keyof typeof typography.fontWeight = 'normal',
  color: string = colors.text.primary
) => ({
  fontSize: typography.fontSize[size],
  fontWeight: typography.fontWeight[weight],
  lineHeight: typography.lineHeight[size],
  color,
});