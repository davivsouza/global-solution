import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  text: string;
}

export function ChatBubble({ role, text }: ChatBubbleProps) {
  const isUser = role === 'user';

  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
          {text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '86%',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
  },
  assistantBubble: {
    backgroundColor: colors.bgCard,
    borderColor: colors.borderPrimary,
    borderTopLeftRadius: radius.sm,
  },
  userBubble: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
    borderTopRightRadius: radius.sm,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
  assistantText: {
    color: colors.textPrimary,
  },
  userText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
