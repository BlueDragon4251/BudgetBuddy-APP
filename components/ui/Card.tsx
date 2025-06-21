import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { BORDER_RADIUS, SHADOWS, SPACING } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outline';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style,
  variant = 'default'
}) => {
  const { theme, isDarkMode } = useTheme();
  
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          ...SHADOWS[isDarkMode ? 'dark' : 'light'].medium,
          backgroundColor: theme.card,
        };
      case 'outline':
        return {
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: 'transparent',
        };
      default:
        return {
          backgroundColor: theme.card,
        };
    }
  };

  return (
    <View style={[styles.card, getVariantStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
});