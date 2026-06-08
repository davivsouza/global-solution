import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { StatCard } from '../../src/components/StatCard';
import { colors, spacing, radius } from '../../src/theme/colors';

export default function DashboardScreen() {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerContent}>
          <Text style={styles.welcomeText}>Bem-vindo de volta,</Text>
          <Text style={styles.userName}>{user?.nome || 'Agricultor'} 👋</Text>
          <Text style={styles.bannerDesc}>
            Confira as métricas agroclimáticas da sua região.
          </Text>
        </View>
        <Text style={styles.bannerEmoji}>🛰️</Text>
      </View>

      {/* Stats Section */}
      <Text style={styles.sectionTitle}>Métricas Climáticas</Text>
      <Text style={styles.sectionSubtitle}>Últimos 30 dias • Região selecionada</Text>

      <View style={styles.statsGrid}>
        <StatCard
          icon="🌡️"
          label="Temperatura Média"
          value="24.5°C"
          detail="Máx: 31° | Mín: 18°"
          accentColor={colors.colorTemp}
        />
        <StatCard
          icon="🌧️"
          label="Precipitação Total"
          value="82 mm"
          detail="12 dias com chuva"
          accentColor={colors.colorRain}
        />
        <StatCard
          icon="💧"
          label="Umidade Relativa"
          value="68%"
          detail="Média do período"
          accentColor={colors.colorHumidity}
        />
        <StatCard
          icon="☀️"
          label="Radiação Solar"
          value="18.3 MJ/m²"
          detail="Média diária"
          accentColor={colors.colorSolar}
        />
        <StatCard
          icon="🌿"
          label="NDVI (Vegetação)"
          value="0.72"
          detail="Vegetação densa e saudável"
          accentColor={colors.colorNdvi}
        />
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>💡</Text>
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Dica do AgroSat</Text>
          <Text style={styles.infoText}>
            Com NDVI de 0.72 e umidade de 68%, sua lavoura está em boas condições.
            Considere monitorar a previsão dos próximos dias para planejar a irrigação.
          </Text>
        </View>
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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    padding: spacing.xl,
    marginBottom: spacing.xxl,
  },
  bannerContent: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  bannerDesc: {
    fontSize: 13,
    color: colors.textDim,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  bannerEmoji: {
    fontSize: 48,
    marginLeft: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    gap: spacing.md,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    padding: spacing.lg,
    marginTop: spacing.xxl,
    gap: spacing.md,
  },
  infoIcon: {
    fontSize: 24,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accentPrimary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
});
