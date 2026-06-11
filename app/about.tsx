import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { AppLogo } from '../src/components/AppLogo';
import { colors, spacing, radius } from '../src/theme/colors';

export default function AboutScreen() {
  const router = useRouter();
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
          <AppLogo size={80} />
          <Text style={styles.appName}>AgroSat</Text>
          <Text style={styles.tagline}>Monitoramento agrícola com clima, satélite e IA</Text>
          <Text style={styles.version}>v1.0.0</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sobre</Text>
          <Text style={styles.cardText}>
            O AgroSat conecta o agricultor a uma API de análise agrícola baseada em lavouras
            georreferenciadas. O app permite cadastrar áreas produtivas, acompanhar clima,
            umidade do solo, vigor vegetativo por NDVI e receber recomendações com IA para
            apoiar decisões de manejo.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Arquitetura</Text>
          <Text style={styles.cardText}>
            O aplicativo React Native consome uma API Spring Boot autenticada por JWT. No backend,
            os dados climáticos vêm da NASA POWER, as métricas de solo e NDVI vêm da
            AgroMonitoring, e os polígonos das lavouras são reaproveitados quando já existem na
            conta antes da criação de novos polígonos. Alertas críticos são processados via
            RabbitMQ e ficam disponíveis no painel do app.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tecnologias</Text>
          <View style={styles.techRow}>
            <TechBadge emoji="📱" label="React Native / Expo" />
            <TechBadge emoji="☕" label="Spring Boot" />
            <TechBadge emoji="🛰️" label="NASA POWER" />
            <TechBadge emoji="🌿" label="AgroMonitoring" />
            <TechBadge emoji="🤖" label="Google Gemini AI" />
            <TechBadge emoji="🐘" label="PostgreSQL" />
            <TechBadge emoji="📨" label="RabbitMQ" />
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
          <InfoRow label="Backend" value="Spring Boot 3.4.2" />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Desenvolvedores</Text>
          <Text style={styles.cardText}>
            Projeto desenvolvido como parte da Global Solution — FIAP 2026.
          </Text>
          <View style={{ marginTop: 12, gap: 4 }}>
            <Text style={styles.cardText}>• Davi Vasconcelos Souza (RM: 559906)</Text>
            <Text style={styles.cardText}>• Gustavo Dantas Oliveira (RM: 560685)</Text>
            <Text style={styles.cardText}>• Arthur Henrique Marino de Oliveira Borges (RM: 560820)</Text>
            <Text style={styles.cardText}>• Gustavo Alves Ramos (RM: 561055)</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>

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
    gap: spacing.md,
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
  backButton: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textDim,
    marginTop: spacing.md,
    lineHeight: 18,
  },
});
