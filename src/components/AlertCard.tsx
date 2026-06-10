import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';
import { AppAlert } from '../types';

interface AlertCardProps {
  alert: AppAlert;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onOpenMaps: (lat: number, lon: number, label: string) => void;
  onOpenNasa: (url?: string) => void;
}

export function AlertCard({
  alert,
  isExpanded,
  onToggleExpand,
  onOpenMaps,
  onOpenNasa,
}: AlertCardProps) {
  const isLocalCropAlert = alert.distanceKm === 0;

  return (
    <View
      style={[
        styles.alertItem,
        { backgroundColor: alert.bgColor, borderColor: alert.borderColor },
      ]}
    >
      <TouchableOpacity
        style={styles.alertHeaderPress}
        activeOpacity={0.8}
        onPress={onToggleExpand}
      >
        <View style={styles.alertHeaderRow}>
          <View style={styles.alertIconBg}>
            {typeof alert.icon === 'string' && alert.icon.includes('-') ? (
              <Ionicons name={alert.icon as any} size={24} color={alert.severityColor} />
            ) : (
              <Text style={{ fontSize: 24 }}>{alert.icon}</Text>
            )}
          </View>
          <View style={styles.alertHeaderContent}>
            <View style={styles.badgeRow}>
              <View style={[styles.severityBadge, { backgroundColor: `${alert.severityColor}15` }]}>
                <Text style={[styles.severityText, { color: alert.severityColor }]}>
                  {alert.severity}
                </Text>
              </View>
              <Text style={styles.alertCategory}>{alert.categoryLabel}</Text>
            </View>
            <Text style={styles.alertTitle}>{alert.title}</Text>
            <Text style={styles.alertDistance}>
              📍 {isLocalCropAlert ? 'Diretamente na sua lavoura' : `${alert.distance} de`} <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{alert.lavouraNome}</Text>
            </Text>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
            size={20}
            color={colors.textDim}
            style={{ marginLeft: 4 }}
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.divider} />
          
          <Text style={styles.alertDescription}>{alert.description}</Text>

          {/* Metric Badges if available */}
          {(alert.ndvi !== undefined || alert.soilMoisture !== undefined) && (
            <View style={styles.metricsContainer}>
              {alert.ndvi !== undefined && (
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Saúde Foliar (NDVI)</Text>
                  <View style={styles.metricValRow}>
                    <Text style={[styles.metricVal, { color: alert.ndvi < 0.45 ? colors.colorDanger : colors.colorSuccess }]}>
                      {alert.ndvi.toFixed(2)}
                    </Text>
                    <Text style={styles.metricStatus}>
                      {alert.ndvi < 0.45 ? 'Estresse Foliar' : 'Vegetação Saudável'}
                    </Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { 
                          width: `${Math.max(0, Math.min(100, alert.ndvi * 100))}%`,
                          backgroundColor: alert.ndvi < 0.45 ? colors.colorDanger : colors.colorSuccess
                        }
                      ]} 
                    />
                  </View>
                </View>
              )}

              {alert.soilMoisture !== undefined && (
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Umidade do Solo (Zona Radicular)</Text>
                  <View style={styles.metricValRow}>
                    <Text style={[styles.metricVal, { color: alert.soilMoisture < 15 ? colors.colorDanger : colors.colorSuccess }]}>
                      {alert.soilMoisture.toFixed(1)}%
                    </Text>
                    <Text style={styles.metricStatus}>
                      {alert.soilMoisture < 15 ? 'Déficit Hídrico' : 'Solo Úmido'}
                    </Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { 
                          width: `${Math.max(0, Math.min(100, (alert.soilMoisture / 40) * 100))}%`,
                          backgroundColor: alert.soilMoisture < 15 ? colors.colorDanger : colors.colorSuccess
                        }
                      ]} 
                    />
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Geospatial Coordinate Table */}
          <View style={styles.coordsTable}>
            <Text style={styles.coordsHeader}>Dados Georreferenciados</Text>
            
            <View style={styles.coordsRow}>
              <Text style={styles.coordsLabel}>Coordenadas da Lavoura:</Text>
              <Text style={styles.coordsValue}>
                Lat {alert.lavouraCoords.latitude.toFixed(4)} • Lon {alert.lavouraCoords.longitude.toFixed(4)}
              </Text>
            </View>

            {!isLocalCropAlert && (
              <View style={styles.coordsRow}>
                <Text style={styles.coordsLabel}>Coordenadas do Perigo:</Text>
                <Text style={styles.coordsValue}>
                  Lat {alert.eventCoords.latitude.toFixed(4)} • Lon {alert.eventCoords.longitude.toFixed(4)}
                </Text>
              </View>
            )}

            <View style={styles.coordsRow}>
              <Text style={styles.coordsLabel}>Distância Linear Calculada:</Text>
              <Text style={[styles.coordsValue, { fontWeight: '700', color: alert.severityColor }]}>
                {isLocalCropAlert ? '0 km (Na Propriedade)' : `${alert.distanceKm.toLocaleString('pt-BR')} km (Haversine)`}
              </Text>
            </View>

            <View style={styles.coordsRow}>
              <Text style={styles.coordsLabel}>Registro de Satélite (UTC):</Text>
              <Text style={styles.coordsValue}>
                {new Date(alert.date).toLocaleString('pt-BR')}
              </Text>
            </View>
          </View>

          {/* Actions Row */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.3)' }]}
              onPress={() => onOpenMaps(alert.eventCoords.latitude, alert.eventCoords.longitude, alert.title)}
            >
              <Ionicons name="map-outline" size={16} color="#60a5fa" />
              <Text style={[styles.actionBtnText, { color: '#60a5fa' }]}>Ver no Maps</Text>
            </TouchableOpacity>

            {alert.nasaUrl && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)' }]}
                onPress={() => onOpenNasa(alert.nasaUrl)}
              >
                <Ionicons name="globe-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.actionBtnText, { color: colors.textSecondary }]}>Fonte NASA</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  alertItem: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  alertHeaderPress: {
    width: '100%',
  },
  alertHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIconBg: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  alertHeaderContent: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  severityText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  alertCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 18,
  },
  alertDistance: {
    fontSize: 11,
    color: colors.textDim,
    marginTop: 4,
  },
  expandedContent: {
    marginTop: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: spacing.md,
  },
  alertDescription: {
    fontSize: 12,
    color: colors.textPrimary,
    lineHeight: 18,
    opacity: 0.9,
  },
  metricsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    gap: spacing.md,
  },
  metricItem: {
    width: '100%',
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  metricValRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 2,
    marginBottom: 4,
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '800',
  },
  metricStatus: {
    fontSize: 10,
    color: colors.textDim,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  coordsTable: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  coordsHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  coordsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.02)',
  },
  coordsLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  coordsValue: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
