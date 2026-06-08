import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { Stack } from 'expo-router';
import Constants from 'expo-constants';
import { colors, spacing, radius } from '../src/theme/colors';

export default function AboutScreen() {
  const commitHash = Constants.expoConfig?.extra?.commitHash || 'dev';

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Sobre o App',
          headerStyle: { backgroundColor: colors.bgPrimary },
          headerTitleStyle: { color: colors.textPrimary, fontWeight: '700' },
          headerTintColor: colors.accentPrimary,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.logoSection}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>🛰️</Text>
          </View>
          <Text style={styles.appName}>AgroSat</Text>
          <Text style={styles.tagline}>Monitoramento Agrícola com Satélite e IA</Text>
          <Text style={styles.version}>v1.0.0</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sobre</Text>
          <Text style={styles.cardText}>
            O AgroSat é uma solução digital inovadora voltada para agricultores, cooperativas e
            profissionais do agronegócio. Combina dados agroclimatológicos em tempo real obtidos de
            satélites da NASA com inteligência artificial generativa para oferecer análises
            preditivas, monitoramento de saúde vegetal e alertas de desastres naturais.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tecnologias</Text>
          <View style={styles.techRow}>
            <TechBadge emoji="📱" label="React Native / Expo" />
            <TechBadge emoji="☕" label="Spring Boot" />
            <TechBadge emoji="🛰️" label="NASA POWER API" />
            <TechBadge emoji="🌍" label="NASA EONET API" />
            <TechBadge emoji="🤖" label="Google Gemini AI" />
            <TechBadge emoji="🗄️" label="H2 Database" />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>ODS 2 — Fome Zero</Text>
          <Text style={styles.cardText}>
            Esta solução está alinhada com o Objetivo de Desenvolvimento Sustentável 2 da ONU,
            promovendo práticas agrícolas mais eficientes, resilientes e sustentáveis.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informações do Build</Text>
          <InfoRow label="Versão" value="1.0.0" />
          <InfoRow label="Commit Hash" value={commitHash} />
          <InfoRow label="Plataforma" value="Expo SDK 56" />
          <InfoRow label="Backend" value="Spring Boot 3.5" />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Desenvolvedores</Text>
          <Text style={styles.cardText}>
            Projeto desenvolvido como parte da Global Solution — FIAP 2026.
          </Text>
        </View>

        <Text style={styles.footer}>
          © 2026 AgroSat — Global Solution{'\n'}
          FIAP — Todos os direitos reservados
        </Text>
      </ScrollView>
    </>
  );
}

function TechBadge({ emoji, label }: { emoji: string; label: string }) {
  return (
    <View style={styles.techBadge}>
      <Text style={styles.techEmoji}>{emoji}</Text>
      <Text style={styles.techLabel}>{label}</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
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
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 40,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.accentPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  version: {
    fontSize: 12,
    color: colors.textDim,
    marginTop: spacing.sm,
    backgroundColor: colors.bgCard,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  cardText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  techRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  techBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.bgGlass,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  techEmoji: {
    fontSize: 14,
  },
  techLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textDim,
    marginTop: spacing.md,
    lineHeight: 18,
  },
});
