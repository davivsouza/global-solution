import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';
import { Lavoura } from '../types';

interface LavouraCardProps {
  lavoura: Lavoura;
  onPress: () => void;
}

const statusColors: Record<string, string> = {
  ATIVA: colors.colorSuccess,
  INATIVA: colors.textDim,
  COLHEITA: colors.colorWarning,
};

const statusLabels: Record<string, string> = {
  ATIVA: 'Ativa',
  INATIVA: 'Inativa',
  COLHEITA: 'Colheita',
};

const tipoEmojis: Record<string, string> = {
  'Soja': '🌱',
  'Milho': '🌽',
  'Café': '☕',
  'Cana-de-Açúcar': '🎋',
  'Arroz': '🍚',
  'Trigo': '🌾',
  'Algodão': '🏵️',
  'Feijão': '🫘',
};

export function LavouraCard({ lavoura, onPress }: LavouraCardProps) {
  const emoji = tipoEmojis[lavoura.tipo] || '🌿';
  const statusColor = statusColors[lavoura.status] || colors.textDim;
  const statusLabel = statusLabels[lavoura.status] || lavoura.status;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.row}>
        <View style={styles.emojiBox}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>{lavoura.nome}</Text>
          <Text style={styles.tipo}>{lavoura.tipo} · {lavoura.area} ha</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '1A' }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.coords}>📍 {lavoura.latitude.toFixed(2)}, {lavoura.longitude.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  emojiBox: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 22,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  tipo: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  footer: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  coords: {
    fontSize: 12,
    color: colors.textDim,
  },
});
