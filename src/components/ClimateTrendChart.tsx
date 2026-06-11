import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme/colors';
import { ClimatePoint } from '../utils/climate';

interface ClimateTrendChartProps {
  points: ClimatePoint[];
}

type ChartMode = 'temperature' | 'precipitation';

const chartWidth = 320;
const chartHeight = 190;
const padding = { top: 18, right: 18, bottom: 34, left: 42 };

function buildSmoothPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  const path = [`M ${points[0].x} ${points[0].y}`];
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const middleX = (previous.x + current.x) / 2;
    path.push(`C ${middleX} ${previous.y}, ${middleX} ${current.y}, ${current.x} ${current.y}`);
  }
  return path.join(' ');
}

export function ClimateTrendChart({ points }: ClimateTrendChartProps) {
  const [mode, setMode] = useState<ChartMode>('temperature');

  const validPoints = useMemo(() => (
    points.filter((point) => (
      Number.isFinite(point.temperature) &&
      Number.isFinite(point.precipitation) &&
      point.temperature > -900 &&
      point.precipitation > -900
    ))
  ), [points]);

  const chart = useMemo(() => {
    const values = validPoints.map((point) => mode === 'temperature' ? point.temperature : point.precipitation);
    const minDataValue = values.length > 0 ? Math.min(...values) : 0;
    const maxDataValue = values.length > 0 ? Math.max(...values) : 1;
    const minValue = mode === 'temperature' ? minDataValue - 1 : 0;
    const maxValue = mode === 'temperature' ? maxDataValue + 1 : Math.max(maxDataValue, 4);
    const range = Math.max(maxValue - minValue, 1);
    const innerWidth = chartWidth - padding.left - padding.right;
    const innerHeight = chartHeight - padding.top - padding.bottom;

    const linePoints = validPoints.map((point, index) => {
      const value = mode === 'temperature' ? point.temperature : point.precipitation;
      const x = padding.left + (validPoints.length === 1 ? innerWidth / 2 : (index / (validPoints.length - 1)) * innerWidth);
      const y = padding.top + innerHeight - ((value - minValue) / range) * innerHeight;
      return { x, y, value, label: point.label };
    });

    const path = buildSmoothPath(linePoints);
    const area = linePoints.length > 0
      ? `${path} L ${linePoints[linePoints.length - 1].x} ${chartHeight - padding.bottom} L ${linePoints[0].x} ${chartHeight - padding.bottom} Z`
      : '';

    return { linePoints, path, area, minValue, maxValue };
  }, [mode, validPoints]);

  const color = mode === 'temperature' ? colors.colorTemp : colors.colorRain;
  const unit = mode === 'temperature' ? '°' : 'mm';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="bar-chart-outline" size={20} color={colors.accentPrimary} />
          <Text style={styles.title}>Tendências Climáticas</Text>
        </View>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, mode === 'temperature' && styles.tabActive]}
            onPress={() => setMode('temperature')}
          >
            <Text style={[styles.tabText, mode === 'temperature' && styles.tabTextActive]}>
              Temperatura
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, mode === 'precipitation' && styles.tabActive]}
            onPress={() => setMode('precipitation')}
          >
            <Text style={[styles.tabText, mode === 'precipitation' && styles.tabTextActive]}>
              Precipitação
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {validPoints.length === 0 ? (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyText}>Sem dados climáticos para exibir.</Text>
        </View>
      ) : (
        <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          <Defs>
            <LinearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
              <Stop offset="0" stopColor={color} stopOpacity="0.32" />
              <Stop offset="1" stopColor={color} stopOpacity="0.02" />
            </LinearGradient>
          </Defs>

          {[0, 1, 2, 3].map((item) => {
            const y = padding.top + item * ((chartHeight - padding.top - padding.bottom) / 3);
            return (
              <Line
                key={`grid-${item}`}
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke="rgba(255,255,255,0.07)"
                strokeWidth="1"
              />
            );
          })}

          <Path d={chart.area} fill="url(#chartFill)" />
          <Path d={chart.path} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />

          {chart.linePoints.map((point, index) => (
            <React.Fragment key={`${point.label}-${index}`}>
              <Circle cx={point.x} cy={point.y} r="3.5" fill={color} />
              {(chart.linePoints.length <= 7 || index === 0 || index === chart.linePoints.length - 1 || index % 2 === 0) && (
                <SvgText
                  x={point.x}
                  y={chartHeight - 10}
                  fill={colors.textMuted}
                  fontSize="10"
                  textAnchor="middle"
                >
                  {point.label}
                </SvgText>
              )}
            </React.Fragment>
          ))}

          {[chart.minValue, (chart.minValue + chart.maxValue) / 2, chart.maxValue].map((value, index) => {
            const y = padding.top + (2 - index) * ((chartHeight - padding.top - padding.bottom) / 2);
            return (
              <SvgText
                key={`axis-${index}`}
                x={padding.left - 8}
                y={y + 4}
                fill={colors.textMuted}
                fontSize="10"
                textAnchor="end"
              >
                {`${value.toFixed(mode === 'temperature' ? 0 : 1)}${unit}`}
              </SvgText>
            );
          })}
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    marginTop: spacing.xxl,
    overflow: 'hidden',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    padding: spacing.lg,
    gap: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
  },
  tabActive: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  emptyChart: {
    height: chartHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
