import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  LayoutAnimation,
  RefreshControl,
  Linking,
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

// Import componentized UI parts
import { AlertHeader } from '../../src/components/AlertHeader';
import { AlertFilterControl } from '../../src/components/AlertFilterControl';
import { AlertCard } from '../../src/components/AlertCard';

// Default location if user has no registered farms (Brasília, DF)
const DEFAULT_COORDS = { latitude: -15.793889, longitude: -47.882778, nome: 'Brasília (Referência)' };

// Haversine formula to calculate distance in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return 99999;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
};

export default function AlertsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [lavouras, setLavouras] = useState<Lavoura[]>([]);
  const [dbAlerts, setDbAlerts] = useState<AppAlert[]>([]);
  const [eonetEvents, setEonetEvents] = useState<any[]>([]);
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'critical' | 'global'>('all');
  const [selectedRadius, setSelectedRadius] = useState<number>(1500);

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
      await fetchLavourasAndEvents();
      alert('Análise de satélite concluída! Alertas gerados com sucesso.');
    } catch (err) {
      console.error('Falha ao rodar análise de satélite', err);
      alert('Erro ao executar análise. Verifique se o backend está online.');
    } finally {
      setAnalyzing(false);
    }
  };

  const fetchLavourasAndEvents = async () => {
    try {
      const lavourasData = await lavouraService.listar();
      setLavouras(lavourasData);

      // Fetch NASA EONET data
      try {
        const response = await fetch(
          'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=100'
        );
        if (response.ok) {
          const data = await response.json();
          setEonetEvents(data.events || []);
        }
      } catch (eonetErr) {
        console.warn('Falha ao obter dados da NASA EONET:', eonetErr);
      }

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
    fetchLavourasAndEvents();
  };

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      setLoading(true);
      fetchLavourasAndEvents();
    }, [user])
  );

  const toggleExpandAlert = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedAlertId(expandedAlertId === id ? null : id);
  };

  const openGoogleMaps = (lat: number, lon: number, label: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        alert('Não foi possível abrir o link do mapa');
      }
    });
  };

  const openNasaSource = (url?: string) => {
    if (!url) return;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        alert('Não foi possível abrir o link da NASA');
      }
    });
  };

  // Process and compute alerts
  const processedAlerts = useMemo(() => {
    let alertsList: AppAlert[] = [...dbAlerts];

    // Process real NASA EONET events
    eonetEvents.forEach((event: any) => {
      if (!event.geometry || event.geometry.length === 0) return;
      const latestGeom = event.geometry[event.geometry.length - 1];
      if (latestGeom.type !== 'Point' || !Array.isArray(latestGeom.coordinates)) return;

      const [lon, lat] = latestGeom.coordinates;
      const eventDate = latestGeom.date;

      // Match event with all user farms to find the closest one
      let closestLavouraName = '';
      let minDistance = Infinity;
      let targetLavouraCoords = { latitude: 0, longitude: 0 };

      if (lavouras.length > 0) {
        lavouras.forEach((l) => {
          const dist = calculateDistance(l.latitude, l.longitude, lat, lon);
          if (dist < minDistance) {
            minDistance = dist;
            closestLavouraName = l.nome;
            targetLavouraCoords = { latitude: l.latitude, longitude: l.longitude };
          }
        });
      } else {
        // Fallback reference location
        minDistance = calculateDistance(DEFAULT_COORDS.latitude, DEFAULT_COORDS.longitude, lat, lon);
        closestLavouraName = DEFAULT_COORDS.nome;
        targetLavouraCoords = { latitude: DEFAULT_COORDS.latitude, longitude: DEFAULT_COORDS.longitude };
      }

      // Map categories to labels, colors and icons
      const catId = event.categories?.[0]?.id || '';
      let catLabel = 'Evento Climático';
      let icon: any = 'warning-outline';
      let bgColor = 'rgba(255, 255, 255, 0.05)';
      let borderColor = colors.borderSubtle;

      switch (catId) {
        case 'wildfires':
          catLabel = 'Foco de Incêndio';
          icon = 'flame-outline';
          bgColor = colors.alertWildfire;
          borderColor = 'rgba(239, 68, 68, 0.25)';
          break;
        case 'severeStorms':
          catLabel = 'Tempestades';
          icon = 'thunderstorm-outline';
          bgColor = colors.alertStorm;
          borderColor = 'rgba(139, 92, 246, 0.25)';
          break;
        case 'volcanoes':
          catLabel = 'Vulcão / Sismicidade';
          icon = 'pulse-outline';
          bgColor = colors.alertDrought;
          borderColor = 'rgba(245, 158, 11, 0.25)';
          break;
        case 'floods':
          catLabel = 'Inundação';
          icon = 'water-outline';
          bgColor = colors.alertFlood;
          borderColor = 'rgba(59, 130, 246, 0.25)';
          break;
      }

      // Determine severity based on distance
      let severity: AppAlert['severity'] = 'Global / Monitoramento';
      let severityColor = colors.colorInfo;

      if (minDistance < 500) {
        severity = 'Extrema';
        severityColor = colors.colorDanger;
      } else if (minDistance < 1500) {
        severity = 'Crítica';
        severityColor = colors.colorDanger;
      } else if (minDistance < 3000) {
        severity = 'Alta';
        severityColor = colors.colorWarning;
      } else if (minDistance < 5000) {
        severity = 'Média';
        severityColor = colors.colorWarning;
      }

      alertsList.push({
        id: `nasa-${event.id}`,
        title: event.title,
        category: catId,
        categoryLabel: catLabel,
        date: eventDate,
        icon,
        bgColor,
        borderColor,
        severity,
        severityColor,
        distance: `${minDistance.toLocaleString('pt-BR')} km`,
        distanceKm: minDistance,
        description: event.description || `Evento detectado pelos sensores orbitais da NASA. Evento classificado como ${catLabel.toLowerCase()} em andamento.`,
        lavouraNome: closestLavouraName,
        eventCoords: { latitude: lat, longitude: lon },
        lavouraCoords: targetLavouraCoords,
        nasaUrl: event.sources?.[0]?.url || event.link,
      });
    });

    // Sort by distance (closest first)
    return alertsList.sort((a, b) => a.distanceKm - b.distanceKm);
  }, [eonetEvents, lavouras, dbAlerts]);

  // Apply radius proximity filter based on user's selected radius
  const regionalAlerts = useMemo(() => {
    return processedAlerts.filter((alert) => {
      if (alert.distanceKm === 0) return true; // Keep local alerts regardless of radius
      return alert.distanceKm <= selectedRadius;
    });
  }, [processedAlerts, selectedRadius]);

  // Apply severity and category filters
  const filteredAlerts = useMemo(() => {
    if (filterType === 'critical') {
      return regionalAlerts.filter(
        (a) => a.severity === 'Extrema' || a.severity === 'Crítica' || a.severity === 'Alta'
      );
    }
    if (filterType === 'global') {
      return regionalAlerts.filter(
        (a) => a.severity === 'Global / Monitoramento' || a.severity === 'Média'
      );
    }
    return regionalAlerts;
  }, [regionalAlerts, filterType]);

  const criticalCount = useMemo(() => {
    return regionalAlerts.filter(
      (a) => a.severity === 'Extrema' || a.severity === 'Crítica' || a.severity === 'Alta'
    ).length;
  }, [regionalAlerts]);

  const relevantCount = useMemo(() => {
    return processedAlerts.filter((a) => a.distanceKm <= 3000).length;
  }, [processedAlerts]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accentPrimary} />
        <Text style={{ color: colors.textMuted, marginTop: 12 }}>
          Analisando lavouras e buscando alertas em tempo real...
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
      <AlertHeader
        eventsCount={eonetEvents.length}
        relevantCount={relevantCount}
      />

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

      <AlertFilterControl
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        totalCount={regionalAlerts.length}
        criticalCount={criticalCount}
        selectedRadius={selectedRadius}
        onRadiusChange={(radiusVal) => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setSelectedRadius(radiusVal);
        }}
      />

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="sparkles-outline" size={48} color={colors.accentPrimary} />
          <Text style={styles.emptyTitle}>Tudo tranquilo no radar</Text>
          <Text style={styles.emptyText}>
            {selectedRadius === Infinity 
              ? 'Não detectamos nenhum evento climático ativo.'
              : `Não detectamos nenhum evento climático ativo em um raio de ${selectedRadius.toLocaleString('pt-BR')} km de suas lavouras.`}
          </Text>
          {selectedRadius !== Infinity && (
            <TouchableOpacity
              style={styles.clearFilterBtn}
              onPress={() => setSelectedRadius(Infinity)}
            >
              <Text style={styles.clearFilterText}>Expandir Raio (Sem Limite)</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        filteredAlerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            isExpanded={expandedAlertId === alert.id}
            onToggleExpand={() => toggleExpandAlert(alert.id)}
            onOpenMaps={openGoogleMaps}
            onOpenNasa={openNasaSource}
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
  clearFilterBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.accentSecondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  clearFilterText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
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
