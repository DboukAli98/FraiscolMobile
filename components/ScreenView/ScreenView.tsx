// src/components/ui/ScreenView.tsx
import { colors, shapes } from '@/constants/theme';
import React from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  View,
  ViewStyle
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';


interface ScreenViewProps {
  children: React.ReactNode;
  // Layout options
  scrollable?: boolean;
  safeArea?: boolean;
  // Padding options
  padding?: boolean;
  paddingHorizontal?: boolean;
  paddingVertical?: boolean;
  customPadding?: number;
  // Background
  backgroundColor?: string;
  // Style overrides
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  // Status bar
  statusBarStyle?: 'default' | 'light-content' | 'dark-content';
  statusBarBackgroundColor?: string;
}

export const ScreenView: React.FC<ScreenViewProps> = ({
  children,
  scrollable = false,
  safeArea = true,
  padding = true,
  paddingHorizontal = false,
  paddingVertical = false,
  customPadding,
  backgroundColor = colors.background.default,
  style,
  contentStyle,
  statusBarStyle = 'dark-content',
  statusBarBackgroundColor,
}) => {
  // Calculate padding style
  const getPaddingStyle = (): ViewStyle => {
    if (customPadding !== undefined) {
      return { padding: customPadding };
    }
    
    if (paddingHorizontal && paddingVertical) {
      return { 
        paddingHorizontal: shapes.initialPadding,
        paddingVertical: shapes.initialPadding 
      };
    }
    
    if (paddingHorizontal) {
      return { paddingHorizontal: shapes.initialPadding };
    }
    
    if (paddingVertical) {
      return { paddingVertical: shapes.initialPadding };
    }
    
    if (padding) {
      return { padding: shapes.initialPadding };
    }
    
    return {};
  };

  // Split styles: SafeAreaView gets background, content gets padding
  const safeAreaStyle: ViewStyle = {
    flex: 1,
    backgroundColor,
  };

  const contentContainerStyle: ViewStyle = {
    flex: 1,
    ...getPaddingStyle(),
    ...style,
  };

  const ContentWrapper = scrollable ? ScrollView : View;
  const RootWrapper = safeArea ? SafeAreaView : View;

  const scrollViewProps = scrollable ? {
    showsVerticalScrollIndicator: false,
    contentContainerStyle: {
      flexGrow: 1,
      ...getPaddingStyle(),
      ...contentStyle,
    },
  } : {};

  // Different rendering based on safeArea and scrollable
  if (safeArea) {
    return (
      <>
        <StatusBar 
          barStyle={statusBarStyle}
          backgroundColor={statusBarBackgroundColor || backgroundColor}
          translucent={false}
        />
        <SafeAreaProvider style={safeAreaStyle}>
       
          <ContentWrapper 
            style={scrollable ? { flex: 1 } : [contentContainerStyle, contentStyle]}
            {...scrollViewProps}
          >
            {children}
          </ContentWrapper>
       
        </SafeAreaProvider>
      </>
    );
  }

  // Without SafeAreaView
  return (
    <>
      <StatusBar 
        barStyle={statusBarStyle}
        backgroundColor={statusBarBackgroundColor || backgroundColor}
        translucent={Platform.OS === 'android'}
      />
      <ContentWrapper 
        style={scrollable ? { flex: 1, backgroundColor } : [{ flex: 1, backgroundColor }, contentContainerStyle, contentStyle]}
        {...scrollViewProps}
      >
        {children}
      </ContentWrapper>
    </>
  );
};

// Preset variations for common use cases
export const ScrollableScreenView: React.FC<Omit<ScreenViewProps, 'scrollable'>> = (props) => (
  <ScreenView {...props} scrollable />
);

export const NoPaddingScreenView: React.FC<Omit<ScreenViewProps, 'padding'>> = (props) => (
  <ScreenView {...props} padding={false} />
);

export const HorizontalPaddingScreenView: React.FC<Omit<ScreenViewProps, 'padding' | 'paddingHorizontal'>> = (props) => (
  <ScreenView {...props} padding={false} paddingHorizontal />
);

// Usage examples with TypeScript variants
export type ScreenViewVariant = 'default' | 'scrollable' | 'noPadding' | 'horizontalPadding';

interface QuickScreenViewProps extends Omit<ScreenViewProps, 'scrollable' | 'padding' | 'paddingHorizontal'> {
  variant?: ScreenViewVariant;
}

export const QuickScreenView: React.FC<QuickScreenViewProps> = ({ 
  variant = 'default', 
  ...props 
}) => {
  switch (variant) {
    case 'scrollable':
      return <ScrollableScreenView {...props} />;
    case 'noPadding':
      return <NoPaddingScreenView {...props} />;
    case 'horizontalPadding':
      return <HorizontalPaddingScreenView {...props} />;
    default:
      return <ScreenView {...props} />;
  }
};