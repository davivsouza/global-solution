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
