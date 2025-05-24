// utils/scaling.ts
import { Dimensions, PixelRatio } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const [shortDimension, longDimension] = 
    SCREEN_WIDTH < SCREEN_HEIGHT ? 
    [SCREEN_WIDTH, SCREEN_HEIGHT] :
    [SCREEN_HEIGHT, SCREEN_WIDTH];

// Base dimensions (iPhone 11 Pro as reference)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

/**
 * Scale size based on screen width (for horizontal spacing, widths, etc.)
 */
export const scale = (size: number): number => 
    Math.round(
        PixelRatio.roundToNearestPixel(
            (shortDimension / guidelineBaseWidth) * size
        )
    );

/**
 * Scale size based on screen height (for vertical spacing, heights, etc.)
 */
export const verticalScale = (size: number): number => 
    Math.round(
        PixelRatio.roundToNearestPixel(
            (longDimension / guidelineBaseHeight) * size
        )
    );

/**
 * Moderate scale - scales less aggressively (good for font sizes)
 * @param size - the size to scale
 * @param factor - scaling factor (0 = no scaling, 1 = full scaling)
 */
export const moderateScale = (size: number, factor: number = 0.5): number =>
    Math.round(
        PixelRatio.roundToNearestPixel(
            size + (scale(size) - size) * factor
        )
    );

/**
 * Font scaling utility with min/max bounds
 */
export const scaleFont = (size: number, factor: number = 0.3): number => {
    const scaled = moderateScale(size, factor);
    // Set min/max bounds for font sizes
    const minSize = Math.max(scaled, 10);
    const maxSize = Math.min(minSize, size * 1.5);
    return maxSize;
};

// Screen dimension utilities
export const screenData = {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    shortDimension,
    longDimension,
    isSmallDevice: shortDimension < 375,
    isLargeDevice: shortDimension > 414,
    aspectRatio: SCREEN_HEIGHT / SCREEN_WIDTH,
    isTablet: shortDimension >= 768,
};

// Common scaled values (you can extend these)
export const spacing = {
    xs: scale(4),
    sm: scale(8),
    md: scale(16),
    lg: scale(24),
    xl: scale(32),
    xxl: scale(48),
};

export const fontSize = {
    xs: scaleFont(10),
    sm: scaleFont(12),
    md: scaleFont(14),
    lg: scaleFont(16),
    xl: scaleFont(18),
    xxl: scaleFont(24),
    xxxl: scaleFont(32),
};

// Device type helpers
export const isTablet = (): boolean => screenData.isTablet;
export const isSmallDevice = (): boolean => screenData.isSmallDevice;
export const isLargeDevice = (): boolean => screenData.isLargeDevice;

// Responsive helpers
export function responsiveValue<T>(
    small: T,
    medium: T,
    large?: T
): T {
    if (screenData.isSmallDevice) return small;
    if (screenData.isLargeDevice && large) return large;
    return medium;
}

// Export screen dimensions for easy access
export { SCREEN_HEIGHT, SCREEN_WIDTH };
