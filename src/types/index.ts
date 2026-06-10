export interface Usuario {
  id: number;
  nome: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  id: number;
  nome: string;
  email: string;
}

export interface Lavoura {
  id: number;
  nome: string;
  tipo: string;
  area: number;
  latitude: number;
  longitude: number;
  descricao: string;
  status: 'ATIVA' | 'INATIVA' | 'COLHEITA';
  dataCriacao: string;
}

export interface LavouraFormData {
  nome: string;
  tipo: string;
  area: string;
  latitude: string;
  longitude: string;
  descricao: string;
  status: 'ATIVA' | 'INATIVA' | 'COLHEITA';
}

export interface AlertEvent {
  id: string;
  title: string;
  category: string;
  date: string;
  icon: string;
  color: string;
}

export interface AppAlert {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  date: string;
  icon: any; // Ionicons name or emoji
  bgColor: string;
  borderColor: string;
  severity: 'Extrema' | 'Crítica' | 'Alta' | 'Média' | 'Global / Monitoramento';
  severityColor: string;
  distance: string;
  distanceKm: number;
  description: string;
  lavouraNome: string;
  eventCoords: { latitude: number; longitude: number };
  lavouraCoords: { latitude: number; longitude: number };
  nasaUrl?: string;
  soilMoisture?: number;
  ndvi?: number;
}
