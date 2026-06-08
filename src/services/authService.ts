import api from './api';
import { AuthResponse } from '../types';

export const authService = {
  async login(email: string, senha: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', { email, senha });
    return response.data;
  },

  async register(nome: string, email: string, senha: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', { nome, email, senha });
    return response.data;
  },
};
