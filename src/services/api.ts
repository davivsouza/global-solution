import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

/**
 * Axios instance configured for the AgroSat Spring Boot API.
 * 
 * IMPORTANT: When running on a physical device or Android emulator,
 * replace 'localhost' with your machine's local IP address.
 * - Android emulator: use '10.0.2.2' instead of 'localhost'
 * - Physical device: use your computer's IP (e.g., '192.168.1.100')
 */
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token to every request
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
    }
    return Promise.reject(error);
  }
);

export default api;
