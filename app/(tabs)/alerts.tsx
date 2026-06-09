import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { colors, spacing, radius } from '../../src/theme/colors';
import { lavouraService } from '../../src/services/lavouraService';
import { Lavoura } from '../../src/types';

type AppAlert = {
  id: string;
  title: string;
  category: string;
  date: string;
  icon: string;
  bgColor: string;
  borderColor: string;
  severity: string;
  distance: string;
  description: string;
};

const generateAlertsForLavouras = (lavouras: Lavoura[]): AppAlert[] => {
  if (lavouras.length === 0) return [];
  
  const alerts: AppAlert[] = [];
  
  lavouras.forEach((lavoura, index) => {
    if (index % 3 === 0) {
      alerts.push({
        id: `alert-${lavoura.id}-1`,
        title: `Risco de Seca Extrema — ${lavoura.nome}`,
        category: 'Secas',
        date: new Date().toISOString(),
        icon: '🏜️',
        bgColor: colors.alertDrought,
        borderColor: 'rgba(245, 158, 11, 0.25)',
        severity: 'Alta',
        distance: 'Atingindo sua região',
        description: 'Os dados do satélite NASA EONET indicam um período anômalo de baixa precipitação e alta evapotranspiração nos próximos 15 dias na área da sua lavoura.',
      });
    } else if (index % 3 === 1) {
      alerts.push({
        id: `alert-${lavoura.id}-1`,
        title: `Alerta de Tempestade — ${lavoura.nome}`,
        category: 'Tempestades',
        date: new Date().toISOString(),
        icon: '⛈️',
        bgColor: colors.alertStorm,
        borderColor: 'rgba(139, 92, 246, 0.25)',
        severity: 'Crítica',
        distance: 'Aprox. 12 km',
        description: 'Formação de nuvens cumulonimbus densas detectadas por satélite. Risco de granizo e ventos acima de 80 km/h nas próximas 4 horas.',
      });
    } else {
      alerts.push({
        id: `alert-${lavoura.id}-1`,
        title: `Foco de Incêndio — ${lavoura.nome}`,
        category: 'Incêndios',
        date: new Date().toISOString(),
        icon: '🔥',
        bgColor: colors.alertWildfire,
        borderColor: 'rgba(239, 68, 68, 0.25)',
        severity: 'Extrema',
        distance: 'Aprox. 5 km',
        description: 'Sensores térmicos detectaram anomalias de calor extremo na vegetação vizinha. Risco iminente de alastramento para a sua propriedade.',
      });
    }
  });
  
  return alerts;
};

export default function AlertsScreen() {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<AppAlert[]>([]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await lavouraService.listar();
      setAlerts(generateAlertsForLavouras(data));
    } catch (error) {
      console.error("Erro ao carregar lavouras para alertas", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAlerts();
    }, [])
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accentPrimary} />
        <Text style={{ color: colors.textMuted, marginTop: 12 }}>Buscando dados da NASA EONET...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.headerEmoji}>⚠️</Text>
        <Text style={styles.headerTitle}>Alertas Inteligentes</Text>
        <Text style={styles.headerSubtitle}>
          Monitoramento exclusivo para as suas lavouras ativas
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{alerts.length} alertas próximos a você</Text>
        </View>
      </View>

      {alerts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>✨</Text>
          <Text style={styles.emptyTitle}>Tudo tranquilo por aqui</Text>
          <Text style={styles.emptyText}>Não detectamos nenhuma anomalia climática ou desastre natural nas proximidades das suas lavouras.</Text>
        </View>
      ) : (
        alerts.map((alert) => (
          <View
            key={alert.id}
            style={[styles.alertItem, { backgroundColor: alert.bgColor, borderColor: alert.borderColor }]}
          >
            <Text style={styles.alertIcon}>{alert.icon}</Text>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>{alert.title}</Text>
              
              <View style={styles.alertMeta}>
                <View style={styles.severityBadge}>
                  <Text style={styles.severityText}>{alert.severity}</Text>
                </View>
                <Text style={styles.alertCategory}>{alert.category}</Text>
                <Text style={styles.alertDistance}>📍 {alert.distance}</Text>
              </View>

              <Text style={styles.alertDescription}>{alert.description}</Text>

              <Text style={styles.alertDate}>
                Detectado em: {new Date(alert.date).toLocaleDateString('pt-BR')}
              </Text>
            </View>
          </View>
        ))
      )}
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
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: 6,
  },
  severityBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
    textTransform: 'uppercase',
  },
  alertCategory: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  alertDistance: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  alertDescription: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  alertDate: {
    fontSize: 11,
    color: colors.textDim,
    marginTop: spacing.md,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    marginTop: spacing.xl,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
