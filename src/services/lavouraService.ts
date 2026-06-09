import api from './api';
import { Lavoura, LavouraFormData } from '../types';

export const lavouraService = {
  async listar(): Promise<Lavoura[]> {
    const response = await api.get<any>('/lavouras');
    if (response.data && response.data._embedded && response.data._embedded.lavouraResponseList) {
      return response.data._embedded.lavouraResponseList;
    }
    return Array.isArray(response.data) ? response.data : [];
  },

  async buscarPorId(id: number): Promise<Lavoura> {
    const response = await api.get<Lavoura>(`/lavouras/${id}`);
    return response.data;
  },

  async criar(data: LavouraFormData): Promise<Lavoura> {
    const payload = {
      ...data,
      area: parseFloat(data.area),
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
    };
    const response = await api.post<Lavoura>('/lavouras', payload);
    return response.data;
  },

  async atualizar(id: number, data: LavouraFormData): Promise<Lavoura> {
    const payload = {
      ...data,
      area: parseFloat(data.area),
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
    };
    const response = await api.put<Lavoura>(`/lavouras/${id}`, payload);
    return response.data;
  },

  async deletar(id: number): Promise<void> {
    await api.delete(`/lavouras/${id}`);
  },
};
