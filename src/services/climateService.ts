import api from './api';

export interface ClimateAnalysis {
  lavoura: string;
  analysis: string;
  climateData: any; // NASA API Response
}

export interface AiRecommendation {
  recomendacao: string;
}

export const climateService = {
  async getAnalysis(lavouraId: number): Promise<ClimateAnalysis> {
    const response = await api.get<ClimateAnalysis>(`/climate/analyze/${lavouraId}`);
    return response.data;
  },

  async getRecommendation(lavouraId: number, dadosClimaticos: string): Promise<AiRecommendation> {
    const response = await api.get<AiRecommendation>(`/ai/recommend/${lavouraId}`, {
      params: { dadosClimaticos }
    });
    return response.data;
  }
};
