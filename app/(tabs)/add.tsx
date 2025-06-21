import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { FONT_SIZE, FONT_WEIGHT, SPACING } from '@/constants/theme';

// This is a placeholder screen that won't be used directly
// The add functionality is handled by the tab button in _layout.tsx
export default function AddScreen() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: theme.text }]}>
        Diese Seite wird nicht direkt angezeigt.
      </Text>
      <Text style={[styles.subtext, { color: theme.subtext }]}>
        Nutzen Sie den + Button in der Tab-Leiste, um eine neue Transaktion hinzuzufügen.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  text: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subtext: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
  },
});