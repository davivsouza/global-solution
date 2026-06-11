import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  LayoutAnimation,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../../src/theme/colors';
import { lavouraService } from '../../src/services/lavouraService';
import { alertaService } from '../../src/services/alertaService';
import { climateService } from '../../src/services/climateService';
import { Lavoura, AppAlert } from '../../src/types';
import { useAuth } from '../../src/contexts/AuthContext';

import { AlertCard } from '../../src/components/AlertCard';

// Default location if user has no registered farms (Brasília, DF)
const DEFAULT_COORDS = { latitude: -15.793889, longitude: -47.882778, nome: 'Brasília (Referência)' };

export default function AlertsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [lavouras, setLavouras] = useState<Lavoura[]>([]);
  const [dbAlerts, setDbAlerts] = useState<AppAlert[]>([]);
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);

  const handleAnalyzeLavouras = async () => {
    if (lavouras.length === 0) {
      alert('Nenhuma lavoura cadastrada. Cadastre uma lavoura primeiro!');
      return;
    }
    
    setAnalyzing(true);
    try {
      const promises = lavouras.map(l => {
        if (l.id) {
          return climateService.getAnalysis(l.id);
        }
        return Promise.resolve();
      });
      await Promise.all(promises);
      await fetchLavourasAndAlerts();
      alert('Análise das lavouras concluída! Alertas gerados com sucesso.');
    } catch (err) {
      console.error('Falha ao rodar análise das lavouras', err);
      alert('Erro ao executar análise. Verifique se o backend está online.');
    } finally {
      setAnalyzing(false);
    }
  };

  const fetchLavourasAndAlerts = async () => {
    try {
      const lavourasData = await lavouraService.listar();
      setLavouras(lavourasData);

      // Fetch crop-specific alerts from local database
      try {
        const dbAlertsRaw = await alertaService.listar();

        const extractSoilMoisture = (msg: string) => {
          const normalized = msg.replace(/,/g, '.');
          const match = normalized.match(/(\d+(\.\d+)?)%/);
          return match ? parseFloat(match[1]) : undefined;
        };

        const extractNdvi = (msg: string) => {
          const normalized = msg.replace(/,/g, '.');
          const match = normalized.match(/NDVI:\s*(\d+(\.\d+)?)/i);
          return match ? parseFloat(match[1]) : undefined;
        };

        const extractLavouraNome = (msg: string, def: string) => {
          const match = msg.match(/lavoura:\s*([^.]+)/i);
          return match ? match[1].trim() : def;
        };

        const parsedDbAlerts = dbAlertsRaw.map((a): AppAlert => {
          const lavName = extractLavouraNome(a.mensagem, 'Sua Lavoura');
          const associatedLav = lavourasData.find(l => l.nome.toLowerCase() === lavName.toLowerCase()) || lavourasData[0];
          
          const lavCoords = associatedLav 
            ? { latitude: associatedLav.latitude, longitude: associatedLav.longitude }
            : { latitude: DEFAULT_COORDS.latitude, longitude: DEFAULT_COORDS.longitude };

          let catLabel = 'Alerta da Lavoura';
          let icon = 'leaf-outline';
          let bgColor = 'rgba(16, 185, 129, 0.08)';
          let borderColor = 'rgba(16, 185, 129, 0.2)';
          let severity: AppAlert['severity'] = 'Média';
          let severityColor = colors.colorWarning;

          if (a.tipo === 'SECA_GRAVE') {
            catLabel = 'Seca Grave / Solo Seco';
            icon = 'water-outline';
            bgColor = colors.alertDrought;
            borderColor = 'rgba(245, 158, 11, 0.3)';
            severity = 'Crítica';
            severityColor = colors.colorDanger;
          } else if (a.tipo === 'ESTRESSE_VEGETATIVO') {
            catLabel = 'Estresse Vegetativo (NDVI)';
            icon = 'leaf-outline';
            bgColor = 'rgba(16, 185, 129, 0.08)';
            borderColor = 'rgba(16, 185, 129, 0.3)';
            severity = 'Alta';
            severityColor = colors.colorWarning;
          } else if (a.tipo === 'ALERTA_CLIMA') {
            catLabel = 'Anomalia Climática';
            icon = 'cloudy-outline';
            bgColor = colors.alertStorm;
            borderColor = 'rgba(139, 92, 246, 0.3)';
            severity = 'Média';
            severityColor = colors.colorInfo;
          }

          return {
            id: `db-${a.id}`,
            title: a.mensagem.split('.')[0] + '.',
            category: a.tipo,
            categoryLabel: catLabel,
            date: a.dataEmissao,
            icon,
            bgColor,
            borderColor,
            severity,
            severityColor,
            distance: 'Localizado',
            distanceKm: 0,
            description: a.mensagem,
            lavouraNome: associatedLav ? associatedLav.nome : lavName,
            eventCoords: lavCoords,
            lavouraCoords: lavCoords,
            soilMoisture: extractSoilMoisture(a.mensagem),
            ndvi: extractNdvi(a.mensagem),
          };
        });

        setDbAlerts(parsedDbAlerts);
      } catch (err) {
        console.error('Falha ao obter alertas do banco', err);
      }
    } catch (error) {
      console.error('Erro ao carregar dados para alertas', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLavourasAndAlerts();
  };

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      setLoading(true);
      fetchLavourasAndAlerts();
    }, [user])
  );

  const toggleExpandAlert = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedAlertId(expandedAlertId === id ? null : id);
  };



  const processedAlerts = useMemo(() => {
    return [...dbAlerts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [dbAlerts]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accentPrimary} />
        <Text style={{ color: colors.textMuted, marginTop: 12 }}>
          Buscando alertas das suas lavouras em tempo real...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.accentPrimary}
          colors={[colors.accentPrimary]}
        />
      }
    >
      <TouchableOpacity
        style={styles.analyzeButton}
        onPress={handleAnalyzeLavouras}
        disabled={analyzing}
      >
        {analyzing ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name="sync-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
        )}
        <Text style={styles.analyzeButtonText}>
          {analyzing ? 'Analisando Saúde das Lavouras...' : 'Analisar Saúde das Lavouras'}
        </Text>
      </TouchableOpacity>

      {/* Alerts List */}
      {processedAlerts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="sparkles-outline" size={48} color={colors.accentPrimary} />
          <Text style={styles.emptyTitle}>Tudo tranquilo no radar</Text>
          <Text style={styles.emptyText}>
            Não detectamos nenhum alerta ativo para suas lavouras.
          </Text>
        </View>
      ) : (
        processedAlerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            isExpanded={expandedAlertId === alert.id}
            onToggleExpand={() => toggleExpandAlert(alert.id)}
          />
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
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
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
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
