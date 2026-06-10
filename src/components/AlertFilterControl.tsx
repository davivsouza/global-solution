import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme/colors';

interface AlertFilterControlProps {
  filterType: 'all' | 'critical' | 'global';
  onFilterTypeChange: (val: 'all' | 'critical' | 'global') => void;
  totalCount: number;
  criticalCount: number;
  selectedRadius: number;
  onRadiusChange: (val: number) => void;
}

export function AlertFilterControl({
  filterType,
  onFilterTypeChange,
  totalCount,
  criticalCount,
  selectedRadius,
  onRadiusChange,
}: AlertFilterControlProps) {
  return (
    <View style={styles.controlPanel}>
      {/* Proximity Radius Selector */}
      <View style={styles.radiusContainer}>
        <Text style={styles.radiusLabel}>Filtro de Região (Raio Máximo):</Text>
        <View style={styles.radiusRow}>
          {[500, 1500, 3000, Infinity].map((radiusValue) => {
            const label = radiusValue === Infinity ? 'Sem Limite' : `${radiusValue.toLocaleString('pt-BR')} km`;
            const isActive = selectedRadius === radiusValue;
            return (
              <TouchableOpacity
                key={radiusValue.toString()}
                style={[styles.radiusButton, isActive && styles.radiusButtonActive]}
                onPress={() => onRadiusChange(radiusValue)}
              >
                <Text style={[styles.radiusButtonText, isActive && styles.radiusButtonTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Severity Filter Tabs */}
      <View style={styles.segmentedFilter}>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'all' && styles.filterActive]}
          onPress={() => onFilterTypeChange('all')}
        >
          <Text style={[styles.filterText, filterType === 'all' && styles.filterTextActive]}>
            Todos ({totalCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'critical' && styles.filterActive]}
          onPress={() => onFilterTypeChange('critical')}
        >
          <Text style={[styles.filterText, filterType === 'critical' && styles.filterTextActive]}>
            Críticos ({criticalCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'global' && styles.filterActive]}
          onPress={() => onFilterTypeChange('global')}
        >
          <Text style={[styles.filterText, filterType === 'global' && styles.filterTextActive]}>
            Monitoramento
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controlPanel: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  radiusContainer: {
    paddingBottom: spacing.sm,
  },
  radiusLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  radiusRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  radiusButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  radiusButtonActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: colors.accentPrimary,
  },
  radiusButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textDim,
  },
  radiusButtonTextActive: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
  segmentedFilter: {
    flexDirection: 'row',
    marginTop: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: radius.md,
    padding: 2,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  filterActive: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textDim,
  },
  filterTextActive: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
});
