import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';

interface ChatSuggestionProps {
  label: string;
  onPress: () => void;
}

export function ChatSuggestion({ label, onPress }: ChatSuggestionProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  text: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
});
