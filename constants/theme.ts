// constants/theme.ts
import { scale, scaleFont, verticalScale } from "@/utils/stylings";

export const colors = {
  primary: {
    main: "#4F46E5", // Indigo 600
    light: "#818CF8", // Indigo 400
    dark: "#3730A3", // Indigo 800
    lighter: "#C7D2FE", // Indigo 200
  },
  secondary: {
    main: "#06B6D4", // Cyan 500
    light: "#67E8F9", // Cyan 300
    dark: "#0891B2", // Cyan 600
  },
  background: {
    default: "#F8FAFC", // Slate 50
    paper: "#FFFFFF", // White
  },
  text: {
    primary: "#0F172A", // Slate 900
    secondary: "#64748B", // Slate 500
    disabled: "#94A3B8", // Slate 400
    white: "#FFFFFF",
  },
  success: {
    main: "#10B981", // Emerald 500
    light: "#6EE7B7", // Emerald 300
    dark: "#059669", // Emerald 600
  },
  error: {
    main: "#F43F5E", // Rose 500
    light: "#FDA4AF", // Rose 300
    dark: "#E11D48", // Rose 600
  },
  warning: {
    main: "#F59E0B", // Amber 500
    light: "#FCD34D", // Amber 300
    dark: "#D97706", // Amber 600
  },
  info: {
    main: "#3B82F6", // Blue 500
    light: "#93C5FD", // Blue 300
    dark: "#2563EB", // Blue 600
  },
  // Additional color utilities
  border: {
    light: "#F1F5F9", // Slate 100
    main: "#E2E8F0", // Slate 200
    dark: "#CBD5E1", // Slate 300
  },
  surface: {
    light: "#F8FAFC", // Slate 50
    main: "#F1F5F9", // Slate 100
    dark: "#E2E8F0", // Slate 200
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
  _2: scale(2),
  _3: scale(3),
  _4: scale(4),
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
  _2: verticalScale(2),
  _3: verticalScale(3),
  _4: verticalScale(4),
  _5: verticalScale(5),
  _7: verticalScale(7),
  _8: verticalScale(8),
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
  _8: scale(8),
  _10: scale(10),
  _12: scale(12),
  _15: scale(15),
  _16: scale(16),
  _20: scale(20),
  _24: scale(24),
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
    "2xl": scaleFont(24),
    "3xl": scaleFont(28),
    "4xl": scaleFont(32),
    "5xl": scaleFont(36),
  },
  lineHeight: {
    xs: verticalScale(14),
    sm: verticalScale(16),
    base: verticalScale(20),
    md: verticalScale(22),
    lg: verticalScale(24),
    xl: verticalScale(28),
    "2xl": verticalScale(32),
    "3xl": verticalScale(36),
  },
  fontWeight: {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
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
    borderRadius: radius._16,
    marginBottom: spacingY._15,
  },
  section: {
    marginBottom: spacingY._25,
  },
};

// Shadow presets
export const shadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
};

// Utility functions for common combinations
export const getButtonStyle = (
  size: "sm" | "md" | "lg" | "xl" = "md",
  variant: "primary" | "secondary" | "outline" = "primary"
) => {
  const baseStyle = {
    height: componentSizes.button.height[size],
    paddingHorizontal: componentSizes.button.padding[size].horizontal,
    paddingVertical: componentSizes.button.padding[size].vertical,
    borderRadius: radius._12,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  };

  switch (variant) {
    case "primary":
      return {
        ...baseStyle,
        backgroundColor: colors.primary.main,
      };
    case "secondary":
      return {
        ...baseStyle,
        backgroundColor: colors.secondary.main,
      };
    case "outline":
      return {
        ...baseStyle,
        backgroundColor: "transparent",
        borderWidth: shapes.borderWidth.medium,
        borderColor: colors.primary.main,
      };
    default:
      return baseStyle;
  }
};

type TextSize = "xs" | "sm" | "base" | "md" | "lg" | "xl" | "2xl" | "3xl";

export const getTextStyle = (
  size: TextSize = "base",
  weight: keyof typeof typography.fontWeight = "normal",
  color: string = colors.text.primary
) => ({
  fontSize: typography.fontSize[size],
  fontWeight: typography.fontWeight[weight],
  lineHeight: typography.lineHeight[size],
  color,
});
