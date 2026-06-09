import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { StatCard } from '../../src/components/StatCard';
import { colors, spacing, radius } from '../../src/theme/colors';
import { lavouraService } from '../../src/services/lavouraService';
import { climateService, ClimateAnalysis } from '../../src/services/climateService';
import { Lavoura } from '../../src/types';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [lavouras, setLavouras] = useState<Lavoura[]>([]);
  const [climate, setClimate] = useState<ClimateAnalysis | null>(null);
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedLavouraId, setSelectedLavouraId] = useState<number | null>(null);

  const [loadingAi, setLoadingAi] = useState(false);

  const fetchData = async (isRefresh = false, lavouraIdToFetch?: number) => {
    try {
      if (!isRefresh) setLoading(true);
      const data = await lavouraService.listar();
      setLavouras(data);

      if (data.length > 0) {
        let activeLavoura = data[0];
        if (lavouraIdToFetch) {
          activeLavoura = data.find(l => l.id === lavouraIdToFetch) || data[0];
        } else if (selectedLavouraId) {
          activeLavoura = data.find(l => l.id === selectedLavouraId) || data[0];
        }
        
        if (activeLavoura.id !== selectedLavouraId) {
          setSelectedLavouraId(activeLavoura.id || null);
          setAiTip(null); // Clear tip when switching lavoura
        }

        const nasaData = await climateService.getAnalysis(activeLavoura.id!);
        setClimate(nasaData);
      }
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateAiTip = async () => {
    if (!climate || !selectedLavouraId) return;
    try {
      setLoadingAi(true);
      const climateStr = JSON.stringify(climate.climateData);
      const aiData = await climateService.getRecommendation(selectedLavouraId, climateStr);
      setAiTip(aiData.recomendacao);
    } catch (error) {
      console.error("Erro ao gerar dica da IA:", error);
      setAiTip("Não foi possível gerar a recomendação no momento.");
    } finally {
      setLoadingAi(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(true, selectedLavouraId || undefined);
  };

  const getTemperature = () => {
    if (climate?.climateData?.properties?.parameter?.T2M) {
      const t2m = climate.climateData.properties.parameter.T2M;
      const values = Object.values(t2m) as number[];
      if (values.length > 0) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        return `${avg.toFixed(1)}°C`;
      }
    }
    return "N/A";
  };

  const getRainfall = () => {
    if (climate?.climateData?.properties?.parameter?.PRECTOTCORR) {
      const prec = climate.climateData.properties.parameter.PRECTOTCORR;
      const values = Object.values(prec) as number[];
      if (values.length > 0) {
        const total = values.reduce((a, b) => a + b, 0).toFixed(1);
        return `${total} mm`;
      }
    }
    return "N/A";
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.accentPrimary} />
        <Text style={styles.loadingText}>Coletando dados via Satélite...</Text>
      </View>
    );
  }

  if (!lavouras || !Array.isArray(lavouras) || lavouras.length === 0 || !lavouras[0]) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyEmoji}>🌾</Text>
        <Text style={styles.emptyTitle}>Nenhuma Lavoura Cadastrada</Text>
        <Text style={styles.emptyDesc}>
          Cadastre sua primeira lavoura para começarmos a monitorar a saúde e o clima da sua região via satélite.
        </Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => router.push('/(tabs)/lavouras/create')}
        >
          <Text style={styles.addButtonText}>+ Adicionar Lavoura</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const lavouraAtual = lavouras.find(l => l.id === selectedLavouraId) || lavouras[0];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accentPrimary}
          />
        }
      >
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

        {/* Lavoura Selector */}
        {lavouras.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorContainer}>
            {lavouras.map((lav) => (
              <TouchableOpacity 
                key={lav.id} 
                style={[styles.selectorChip, lav.id === selectedLavouraId && styles.selectorChipActive]}
                onPress={() => fetchData(false, lav.id)}
              >
                <Text style={[styles.selectorText, lav.id === selectedLavouraId && styles.selectorTextActive]}>
                  {lav.nome}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Stats Section */}
        <Text style={styles.sectionTitle}>Métricas Climáticas</Text>
        <Text style={styles.sectionSubtitle}>Últimos 7 dias • {lavouraAtual?.nome} ({lavouraAtual?.tipo})</Text>

        <View style={styles.statsGrid}>
          <StatCard
            icon="🌡️"
            label="Temperatura (NASA)"
            value={getTemperature()}
            detail="Média recente"
            accentColor={colors.colorTemp}
          />
          <StatCard
            icon="🌧️"
            label="Precipitação (NASA)"
            value={getRainfall()}
            detail="Acumulado do período"
            accentColor={colors.colorRain}
          />
          <StatCard
            icon="📍"
            label="Área Mapeada"
            value={`${lavouraAtual?.area || 0} ha`}
            detail={`Lat: ${lavouraAtual?.latitude} / Lon: ${lavouraAtual?.longitude}`}
            accentColor={colors.colorNdvi}
          />
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>💡</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Dica da IA AgroSat</Text>
            {aiTip ? (
              <Text style={styles.infoText}>{aiTip}</Text>
            ) : (
              <TouchableOpacity 
                style={styles.generateAiButton} 
                onPress={generateAiTip}
                disabled={loadingAi}
              >
                {loadingAi ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.generateAiButtonText}>Gerar Recomendação da IA ✨</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  addButton: {
    backgroundColor: colors.accentPrimary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: radius.full,
    elevation: 2,
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addButtonText: {
    color: colors.textInverse,
    fontSize: 15,
    fontWeight: '600',
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
    opacity: 0.9,
  },
  selectorContainer: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  selectorChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bgCardTranslucent,
    borderRadius: radius.full,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectorChipActive: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  selectorText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  selectorTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
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
    marginRight: spacing.lg,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  generateAiButton: {
    backgroundColor: colors.accentPrimary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  generateAiButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
