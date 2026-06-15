import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { StatCard } from '../../src/components/StatCard';
import { AppLogo } from '../../src/components/AppLogo';
import { ClimateTrendChart } from '../../src/components/ClimateTrendChart';
import { MonitoringMap, MapMarker } from '../../src/components/MonitoringMap';
import { colors, spacing, radius } from '../../src/theme/colors';
import { lavouraService } from '../../src/services/lavouraService';
import { alertaService } from '../../src/services/alertaService';
import { climateService, ClimateAnalysis } from '../../src/services/climateService';
import { Lavoura } from '../../src/types';
import { getAverage, getClimatePoints, getTotal } from '../../src/utils/climate';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [lavouras, setLavouras] = useState<Lavoura[]>([]);
  const [climate, setClimate] = useState<ClimateAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedLavouraId, setSelectedLavouraId] = useState<number | null>(null);
  // Lowercased names of lavouras that currently have an active alert.
  const [alertedNames, setAlertedNames] = useState<Set<string>>(new Set());

  const fetchData = async (isRefresh = false, lavouraIdToFetch?: number) => {
    try {
      if (!isRefresh) setLoading(true);
      const data = await lavouraService.listar();
      setLavouras(data);

      // Pull active alerts so we can flag affected lavouras on the map.
      try {
        const alerts = await alertaService.listar();
        const names = new Set<string>();
        alerts.forEach((a) => {
          const match = a.mensagem.match(/lavoura:\s*([^.]+)/i);
          if (match) names.add(match[1].trim().toLowerCase());
        });
        setAlertedNames(names);
      } catch (err) {
        console.error('Falha ao obter alertas para o mapa', err);
      }

      if (data.length > 0) {
        let activeLavoura = data[0];
        if (lavouraIdToFetch) {
          activeLavoura = data.find(l => l.id === lavouraIdToFetch) || data[0];
        } else if (selectedLavouraId) {
          activeLavoura = data.find(l => l.id === selectedLavouraId) || data[0];
        }
        
        if (activeLavoura.id !== selectedLavouraId) {
          setSelectedLavouraId(activeLavoura.id || null);
        }

        const climateData = await climateService.getAnalysis(activeLavoura.id!);
        setClimate(climateData);
      }
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      fetchData();
    }, [user])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(true, selectedLavouraId || undefined);
  };

  const getTemperature = () => {
    const values = climatePoints.map((point) => point.temperature);
    return values.length > 0 ? `${getAverage(values).toFixed(1)}°C` : 'N/A';
  };

  const getRainfall = () => {
    const values = climatePoints.map((point) => point.precipitation);
    return values.length > 0 ? `${getTotal(values).toFixed(1)} mm` : 'N/A';
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
  const climatePoints = getClimatePoints(climate?.climateData);

  // Markers for the dashboard map: every farm with valid coordinates, colored
  // by status, flagged when an alert is active. Selected farm is highlighted.
  const statusColor: Record<string, string> = {
    ATIVA: colors.colorSuccess,
    COLHEITA: colors.colorSolar,
    INATIVA: colors.textDim,
  };
  const statusLabel: Record<string, string> = {
    ATIVA: 'Ativa',
    COLHEITA: 'Em colheita',
    INATIVA: 'Inativa',
  };
  const plottable = lavouras.filter(
    l => typeof l.latitude === 'number' && typeof l.longitude === 'number' && !(l.latitude === 0 && l.longitude === 0)
  );
  const mapMarkers: MapMarker[] = plottable.map(l => ({
    id: String(l.id),
    latitude: l.latitude,
    longitude: l.longitude,
    color: statusColor[l.status] ?? colors.accentPrimary,
    alert: alertedNames.has(l.nome.toLowerCase()),
    label: l.nome,
  }));
  const alertCount = mapMarkers.filter(m => m.alert).length;
  const selectedOnMap = plottable.find(l => l.id === selectedLavouraId);

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
          <AppLogo size={56} />
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
            label="Temperatura"
            value={getTemperature()}
            detail="Média recente"
            accentColor={colors.colorTemp}
          />
          <StatCard
            icon="🌧️"
            label="Precipitação"
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

        {/* Monitoring Map */}
        <Text style={[styles.sectionTitle, styles.sectionSpacer]}>Mapa de Monitoramento</Text>
        <Text style={styles.sectionSubtitle}>
          {mapMarkers.length > 1
            ? 'Toque em um ponto para selecionar a lavoura'
            : 'Posição da sua lavoura'}
        </Text>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{plottable.length}</Text>
            <Text style={styles.summaryLabel}>No mapa</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.colorWarning }]}>{alertCount}</Text>
            <Text style={styles.summaryLabel}>Com alerta</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{lavouras.length}</Text>
            <Text style={styles.summaryLabel}>Lavouras</Text>
          </View>
        </View>

        <MonitoringMap
          markers={mapMarkers}
          selectedId={selectedLavouraId ? String(selectedLavouraId) : null}
          onSelect={(id) => fetchData(false, Number(id))}
          height={260}
        />

        {/* Legend */}
        <View style={styles.legend}>
          <LegendDot color={statusColor.ATIVA} label="Ativa" />
          <LegendDot color={statusColor.COLHEITA} label="Colheita" />
          <LegendDot color={statusColor.INATIVA} label="Inativa" />
          <LegendDot color={colors.colorWarning} label="Alerta ativo" ring />
        </View>

        {/* Selected farm detail */}
        {selectedOnMap && (
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Ionicons name="location" size={18} color={colors.accentPrimary} />
              <Text style={styles.detailTitle}>{selectedOnMap.nome}</Text>
            </View>
            <View style={styles.detailMeta}>
              <DetailChip icon="leaf-outline" text={selectedOnMap.tipo} />
              <DetailChip
                icon="ellipse"
                text={statusLabel[selectedOnMap.status] ?? selectedOnMap.status}
                color={statusColor[selectedOnMap.status]}
              />
              <DetailChip icon="resize-outline" text={`${selectedOnMap.area} ha`} />
            </View>
            {alertedNames.has(selectedOnMap.nome.toLowerCase()) && (
              <View style={styles.alertBanner}>
                <Ionicons name="warning" size={14} color={colors.colorWarning} />
                <Text style={styles.alertBannerText}>Alerta ativo nesta lavoura</Text>
              </View>
            )}
            <Text style={styles.detailCoords}>
              {selectedOnMap.latitude.toFixed(4)}, {selectedOnMap.longitude.toFixed(4)}
            </Text>
          </View>
        )}

        <View style={styles.sectionSpacer} />
        <ClimateTrendChart points={climatePoints} />
      </ScrollView>
    </SafeAreaView>
  );
}

function LegendDot({ color, label, ring }: { color: string; label: string; ring?: boolean }) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendDot,
          { backgroundColor: ring ? 'transparent' : color, borderColor: color, borderWidth: ring ? 2 : 0 },
        ]}
      />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

function DetailChip({ icon, text, color }: { icon: any; text: string; color?: string }) {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={12} color={color ?? colors.textMuted} />
      <Text style={styles.chipText}>{text}</Text>
    </View>
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
    color: colors.bgPrimary,
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
  sectionSpacer: {
    marginTop: spacing.xxl,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.borderPrimary,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
  },
  legendLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  detailCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderHover,
    padding: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  detailMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.bgGlass,
    borderRadius: radius.sm,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  chipText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.alertDrought,
    borderRadius: radius.sm,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  alertBannerText: {
    fontSize: 12,
    color: colors.colorWarning,
    fontWeight: '600',
  },
  detailCoords: {
    fontSize: 12,
    color: colors.textDim,
  },
});
