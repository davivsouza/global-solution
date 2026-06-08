import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../src/theme/colors';

const MOCK_ALERTS = [
  {
    id: '1',
    title: 'Incêndio Florestal — Serra da Canastra, MG',
    category: 'Incêndios',
    date: '2026-06-05',
    icon: '🔥',
    bgColor: colors.alertWildfire,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  {
    id: '2',
    title: 'Seca Prolongada — Nordeste Brasileiro',
    category: 'Secas',
    date: '2026-06-03',
    icon: '🏜️',
    bgColor: colors.alertDrought,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  {
    id: '3',
    title: 'Enchente — Vale do Itajaí, SC',
    category: 'Enchentes',
    date: '2026-06-07',
    icon: '🌊',
    bgColor: colors.alertFlood,
    borderColor: 'rgba(59, 130, 246, 0.25)',
  },
  {
    id: '4',
    title: 'Tempestade Severa — Região Metropolitana de SP',
    category: 'Tempestades',
    date: '2026-06-08',
    icon: '⛈️',
    bgColor: colors.alertStorm,
    borderColor: 'rgba(139, 92, 246, 0.25)',
  },
  {
    id: '5',
    title: 'Geada — Campos de Cima da Serra, RS',
    category: 'Geadas',
    date: '2026-06-06',
    icon: '❄️',
    bgColor: 'rgba(56, 189, 248, 0.1)',
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
];

export default function AlertsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.headerEmoji}>⚠️</Text>
        <Text style={styles.headerTitle}>Alertas Ativos</Text>
        <Text style={styles.headerSubtitle}>
          Monitoramento de desastres naturais via NASA EONET
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{MOCK_ALERTS.length} alertas ativos</Text>
        </View>
      </View>

      {MOCK_ALERTS.map((alert) => (
        <View
          key={alert.id}
          style={[styles.alertItem, { backgroundColor: alert.bgColor, borderColor: alert.borderColor }]}
        >
          <Text style={styles.alertIcon}>{alert.icon}</Text>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>{alert.title}</Text>
            <View style={styles.alertMeta}>
              <Text style={styles.alertCategory}>{alert.category}</Text>
              <Text style={styles.alertDate}>
                {new Date(alert.date).toLocaleDateString('pt-BR')}
              </Text>
            </View>
          </View>
        </View>
      ))}

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          ℹ️  Dados obtidos da NASA EONET (Earth Observatory Natural Event Tracker).
          Alertas são atualizados periodicamente.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  headerCard: {
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    padding: spacing.xxl,
    marginBottom: spacing.xl,
  },
  headerEmoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  badge: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.colorDanger,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  alertIcon: {
    fontSize: 24,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  alertMeta: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: 6,
  },
  alertCategory: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  alertDate: {
    fontSize: 11,
    color: colors.textDim,
  },
  infoBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  infoText: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
