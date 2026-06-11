import api from './api';

export interface ClimateAnalysis {
  lavoura: string;
  analysis: string;
  climateData: any;
  soilData?: any;
  ndviData?: any;
}

export interface ChatResponse {
  resposta: string;
}

export const climateService = {
  async getAnalysis(lavouraId: number): Promise<ClimateAnalysis> {
    const response = await api.get<ClimateAnalysis>(`/climate/analyze/${lavouraId}`);
    return response.data;
  },

  async sendChatMessage(message: string, lavouraId?: number, dadosClimaticos?: string): Promise<ChatResponse> {
    const response = await api.post<ChatResponse>('/ai/chat', {
      mensagem: message,
      lavouraId,
      dadosClimaticos,
    });
    return response.data;
  },
};
