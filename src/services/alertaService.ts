import api from './api';

export interface AlertaDb {
  id: number;
  tipo: string;
  mensagem: string;
  dataEmissao: string;
  lido: boolean;
}

export const alertaService = {
  async listar(): Promise<AlertaDb[]> {
    const response = await api.get<AlertaDb[]>('/alertas');
    return Array.isArray(response.data) ? response.data : [];
  }
};
