export interface ClimatePoint {
  label: string;
  temperature: number;
  precipitation: number;
}

function formatDateLabel(rawDate: string) {
  if (rawDate.length !== 8) return rawDate;
  return `${rawDate.slice(6, 8)}/${rawDate.slice(4, 6)}`;
}

export function getClimatePoints(climateData: any): ClimatePoint[] {
  const parameters = climateData?.properties?.parameter;
  const temperature = parameters?.T2M || {};
  const precipitation = parameters?.PRECTOTCORR || {};

  return Object.keys(temperature)
    .sort()
    .map((date) => {
      const temperatureValue = Number(temperature[date]);
      const precipitationValue = Number(precipitation[date]);

      return {
        label: formatDateLabel(date),
        temperature: temperatureValue,
        precipitation: precipitationValue,
      };
    })
    .filter((point) => (
      Number.isFinite(point.temperature) &&
      Number.isFinite(point.precipitation) &&
      point.temperature > -900 &&
      point.precipitation > -900
    ));
}

export function getAverage(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function getTotal(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0);
}
